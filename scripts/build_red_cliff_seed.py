"""Build the public Red Cliff seed database from the local full database.

Only Romance of the Three Kingdoms chapters 43 through 50 and people who
appear in those chapters are copied. Co-occurrence edges are recalculated
inside that chapter range so the seed does not leak full-project statistics.
"""

from __future__ import annotations

import argparse
import sqlite3
from itertools import combinations
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
DEFAULT_SOURCE = ROOT / "data" / "processed" / "samgukji.db"
DEFAULT_TARGET = ROOT / "data" / "seed" / "red_cliff.db"
CHAPTER_START = 43
CHAPTER_END = 50

SCHEMA = """
PRAGMA foreign_keys = ON;

CREATE TABLE seed_metadata (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

CREATE TABLE jeongsa_persons (
    name TEXT PRIMARY KEY,
    source_juan TEXT,
    country TEXT,
    biography TEXT,
    source_url TEXT,
    is_minor_biography INTEGER,
    mentioned_relatives TEXT
);

CREATE TABLE yeonui_mentions (
    name TEXT NOT NULL,
    chapter INTEGER NOT NULL,
    chapter_title TEXT,
    excerpt TEXT,
    tagging_method TEXT,
    source_url TEXT,
    UNIQUE(name, chapter)
);
CREATE INDEX idx_yeonui_name ON yeonui_mentions(name);
CREATE INDEX idx_yeonui_chapter ON yeonui_mentions(chapter);

CREATE TABLE cooccurrence_edges (
    person_a TEXT NOT NULL,
    person_b TEXT NOT NULL,
    count INTEGER NOT NULL,
    UNIQUE(person_a, person_b)
);

CREATE TABLE jeongsa_translations (
    name TEXT PRIMARY KEY,
    biography_ko TEXT,
    translated_at TEXT,
    translated_by TEXT
);

CREATE TABLE yeonui_paragraph_translations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chapter INTEGER,
    paragraph_zh TEXT,
    paragraph_ko TEXT,
    translated_at TEXT,
    translated_by TEXT,
    UNIQUE(chapter, paragraph_zh)
);

CREATE TABLE paragraphs (chapter INTEGER NOT NULL, idx INTEGER NOT NULL, zh TEXT NOT NULL, ko TEXT,
  PRIMARY KEY (chapter, idx));
CREATE TABLE persons (name TEXT PRIMARY KEY, ko TEXT, jeongsa_faction TEXT NOT NULL,
  first_faction TEXT NOT NULL, last_faction TEXT NOT NULL, death_year INTEGER, in_jeongsa INTEGER NOT NULL);
CREATE TABLE affiliations (name TEXT NOT NULL, seq INTEGER NOT NULL, faction TEXT NOT NULL, lord TEXT,
  chapter_from INTEGER NOT NULL, chapter_to INTEGER NOT NULL, change TEXT, evidence TEXT, PRIMARY KEY (name, seq));
CREATE TABLE aliases (alias TEXT NOT NULL, name TEXT NOT NULL, chapter_from INTEGER NOT NULL,
  chapter_to INTEGER NOT NULL, PRIMARY KEY (alias, name));
CREATE TABLE mentions (name TEXT NOT NULL, chapter INTEGER NOT NULL, idx INTEGER NOT NULL,
  PRIMARY KEY (name, chapter, idx), FOREIGN KEY (chapter, idx) REFERENCES paragraphs (chapter, idx));
CREATE INDEX idx_mentions_chapter ON mentions (chapter, idx);
CREATE TABLE jeongsa_counts (name TEXT PRIMARY KEY, body INTEGER NOT NULL, note INTEGER NOT NULL);
"""
# 분석 표(scripts/build_analysis_tables.py)는 data/curated/battles.json의 모든 전투 회차만큼 복사한다.
# 옛 형식 표(yeonui_mentions 등)는 적벽(CHAPTER_START~END)만 둔다.
BATTLE_RANGES = [tuple(b["chapters"]) for b in __import__("json").loads(
    (ROOT / "data" / "curated" / "battles.json").read_text(encoding="utf-8"))["battles"]]
ANALYSIS_COPY = [
    ("paragraphs", "SELECT * FROM paragraphs WHERE chapter BETWEEN ? AND ?"),
    ("mentions", "SELECT * FROM mentions WHERE chapter BETWEEN ? AND ?"),
    ("persons", "SELECT * FROM persons WHERE name IN (SELECT name FROM mentions WHERE chapter BETWEEN ? AND ?)"),
    ("aliases", "SELECT * FROM aliases WHERE name IN (SELECT name FROM mentions WHERE chapter BETWEEN ? AND ?)"),
    ("affiliations", "SELECT * FROM affiliations WHERE name IN (SELECT name FROM mentions WHERE chapter BETWEEN ? AND ?)"),
]


def table_exists(connection: sqlite3.Connection, table: str) -> bool:
    row = connection.execute(
        "SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = ?", (table,)
    ).fetchone()
    return row is not None


def build_seed(source_path: Path, target_path: Path) -> None:
    if not source_path.is_file():
        raise FileNotFoundError(f"Source database not found: {source_path}")

    target_path.parent.mkdir(parents=True, exist_ok=True)
    temporary_path = target_path.with_suffix(".tmp.db")
    temporary_path.unlink(missing_ok=True)

    source = sqlite3.connect(source_path)
    source.row_factory = sqlite3.Row
    target = sqlite3.connect(temporary_path)

    try:
        target.executescript(SCHEMA)
        target.executemany(
            "INSERT INTO seed_metadata(key, value) VALUES (?, ?)",
            [
                ("storyline", "red-cliff"),
                ("chapter_start", str(CHAPTER_START)),
                ("chapter_end", str(CHAPTER_END)),
                ("source_scope", "삼국지연의 제43회~제50회"),
            ],
        )

        mentions = source.execute(
            "SELECT name, chapter, chapter_title, excerpt, tagging_method, source_url "
            "FROM yeonui_mentions WHERE chapter BETWEEN ? AND ? "
            "ORDER BY chapter, name",
            (CHAPTER_START, CHAPTER_END),
        ).fetchall()
        target.executemany(
            "INSERT INTO yeonui_mentions VALUES (?, ?, ?, ?, ?, ?)",
            [tuple(row) for row in mentions],
        )

        # 정사 전기는 옛 등장 기록과 새 분석 표(mentions) 어느 쪽에든 나온 인물 것을 복사한다
        people = sorted({row["name"] for row in mentions} | {r[0] for r in source.execute(
            "SELECT DISTINCT name FROM mentions WHERE chapter BETWEEN ? AND ?", (CHAPTER_START, CHAPTER_END))})
        placeholders = ",".join("?" for _ in people)
        if people:
            jeongsa_rows = source.execute(
                f"SELECT * FROM jeongsa_persons WHERE name IN ({placeholders})",
                people,
            ).fetchall()
            target.executemany(
                "INSERT INTO jeongsa_persons VALUES (?, ?, ?, ?, ?, ?, ?)",
                [tuple(row) for row in jeongsa_rows],
            )

            if table_exists(source, "jeongsa_translations"):
                translation_rows = source.execute(
                    f"SELECT * FROM jeongsa_translations WHERE name IN ({placeholders})",
                    people,
                ).fetchall()
                target.executemany(
                    "INSERT INTO jeongsa_translations VALUES (?, ?, ?, ?)",
                    [tuple(row) for row in translation_rows],
                )

        chapter_people: dict[int, list[str]] = {}
        for row in mentions:
            chapter_people.setdefault(row["chapter"], []).append(row["name"])

        edge_counts: dict[tuple[str, str], int] = {}
        for names in chapter_people.values():
            for pair in combinations(sorted(set(names)), 2):
                edge_counts[pair] = edge_counts.get(pair, 0) + 1
        target.executemany(
            "INSERT INTO cooccurrence_edges VALUES (?, ?, ?)",
            [(a, b, count) for (a, b), count in sorted(edge_counts.items())],
        )

        if table_exists(source, "yeonui_paragraph_translations"):
            paragraph_rows = source.execute(
                "SELECT id, chapter, paragraph_zh, paragraph_ko, translated_at, translated_by "
                "FROM yeonui_paragraph_translations WHERE chapter BETWEEN ? AND ? "
                "ORDER BY id",
                (CHAPTER_START, CHAPTER_END),
            ).fetchall()
            target.executemany(
                "INSERT INTO yeonui_paragraph_translations VALUES (?, ?, ?, ?, ?, ?)",
                [tuple(row) for row in paragraph_rows],
            )

        if not table_exists(source, "mentions"):
            raise RuntimeError("analysis tables missing: run scripts/build_analysis_tables.py first")
        for table, query in ANALYSIS_COPY:
            rows = {tuple(r) for a, b in BATTLE_RANGES for r in source.execute(query, (a, b))}
            if not rows:
                continue
            marks = ",".join("?" * len(next(iter(rows))))
            target.executemany(f"INSERT INTO {table} VALUES ({marks})", sorted(rows))
        # 정사에서 그 인물의 이름이 나온 문장 수(본문/배송지 주석). 정사 문장 전체 대신 개수만 싣는다
        counts = {tuple(r) for a, b in BATTLE_RANGES for r in source.execute(
            "SELECT m.name, SUM(s.is_note = 0), SUM(s.is_note = 1) FROM jeongsa_mentions m "
            "JOIN jeongsa_sentences s USING (juan, idx) WHERE m.name IN "
            "(SELECT name FROM mentions WHERE chapter BETWEEN ? AND ?) GROUP BY m.name", (a, b))}
        target.executemany("INSERT INTO jeongsa_counts VALUES (?,?,?)", sorted(counts))
        target.execute("INSERT INTO seed_metadata VALUES ('analysis_chapters', ?)",
                       (",".join(f"{a}-{b}" for a, b in BATTLE_RANGES),))

        target.commit()
        integrity = target.execute("PRAGMA integrity_check").fetchone()[0]
        if integrity != "ok":
            raise RuntimeError(f"Seed database integrity check failed: {integrity}")
    except Exception:
        target.close()
        source.close()
        temporary_path.unlink(missing_ok=True)
        raise
    else:
        target.close()
        source.close()
        target_path.unlink(missing_ok=True)
        temporary_path.replace(target_path)

    print(f"red-cliff people: {len(people)}")
    print(f"red-cliff mentions: {len(mentions)}")
    print(f"red-cliff co-occurrence edges: {len(edge_counts)}")
    print(f"seed database: {target_path.relative_to(ROOT)}")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", type=Path, default=DEFAULT_SOURCE)
    parser.add_argument("--target", type=Path, default=DEFAULT_TARGET)
    args = parser.parse_args()
    build_seed(args.source.resolve(), args.target.resolve())


if __name__ == "__main__":
    main()


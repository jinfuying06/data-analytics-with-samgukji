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
"""


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

        people = sorted({row["name"] for row in mentions})
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


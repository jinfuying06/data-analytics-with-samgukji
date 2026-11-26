"""Build the analysis tables (paragraphs, persons, aliases, mentions) in the full DB.

  paragraphs  (chapter, idx)        one row per non-empty line of the 연의 원문, with its Korean translation
  persons     name                  Korean name, default faction, death year
  aliases     alias                 alias -> canonical name (used by the tagger)
  mentions    (name, chapter, idx)  "this person appears in this paragraph"

The old tables stay untouched. Mentions are re-tagged from the 원문 with
tag_yeonui_persons.find_persons_in_text (longest alias first), using the alias table plus
data/curated/인물_추가.json (new people, extra aliases, homonyms). With no additions the
result is identical to yeonui_mentions.

  python scripts/build_analysis_tables.py
"""
from __future__ import annotations

import difflib
import json
import re
import sqlite3
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from tag_yeonui_persons import find_persons_in_text  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]
DB_PATH = ROOT / "data" / "processed" / "samgukji.db"
RAW_DIR = ROOT / "data" / "raw" / "wikisource" / "연의"
ALIAS_PATH = ROOT / "data" / "processed" / "인물명_정규화.json"
CURATED = ROOT / "data" / "curated"
FACTION = {"魏": "wei", "吳": "wu", "蜀": "shu"}

SCHEMA = """
DROP TABLE IF EXISTS paragraphs;
DROP TABLE IF EXISTS persons;
DROP TABLE IF EXISTS aliases;
DROP TABLE IF EXISTS mentions;
CREATE TABLE paragraphs (chapter INTEGER NOT NULL, idx INTEGER NOT NULL, zh TEXT NOT NULL, ko TEXT,
  PRIMARY KEY (chapter, idx));
CREATE TABLE persons (name TEXT PRIMARY KEY, ko TEXT, faction TEXT NOT NULL, death_year INTEGER,
  in_jeongsa INTEGER NOT NULL);
CREATE TABLE aliases (alias TEXT NOT NULL, name TEXT NOT NULL, chapter_from INTEGER NOT NULL,
  chapter_to INTEGER NOT NULL, PRIMARY KEY (alias, name));
CREATE TABLE mentions (name TEXT NOT NULL, chapter INTEGER NOT NULL, idx INTEGER NOT NULL,
  PRIMARY KEY (name, chapter, idx), FOREIGN KEY (chapter, idx) REFERENCES paragraphs (chapter, idx));
CREATE INDEX idx_mentions_chapter ON mentions (chapter, idx);
"""

norm = lambda t: re.sub(r"[^一-鿿]", "", t)


def raw_paragraphs() -> dict[int, list[str]]:
    out = {}
    for f in sorted(RAW_DIR.glob("*.json")):
        d = json.loads(f.read_text(encoding="utf-8"))
        out[d["num"]] = [p for p in d["body_text"].split("\n") if p.strip()]
    return out


def match(lines: list[str], zh: str) -> int:
    """Index of the raw line this translated paragraph belongs to.
    A few translations were made from a slightly different copy (punctuation, one character)."""
    if zh in lines:
        return lines.index(zh)
    ratio = lambda i: difflib.SequenceMatcher(None, norm(zh), norm(lines[i]), autojunk=False).ratio()
    best = max(range(len(lines)), key=ratio)
    if ratio(best) < 0.98:
        raise SystemExit(f"translation matches no paragraph: {zh[:40]}")
    return best


def main() -> None:
    con = sqlite3.connect(DB_PATH)
    raw = raw_paragraphs()
    ko: dict[tuple[int, int], str] = {}
    for ch, zh, text in con.execute("select chapter, paragraph_zh, paragraph_ko from yeonui_paragraph_translations"):
        key = (ch, match(raw[ch], zh))
        if key in ko:
            raise SystemExit(f"two translations for paragraph {key}")
        ko[key] = text

    supplement = json.loads((CURATED / "인물_세력_보충.json").read_text(encoding="utf-8"))["people"]
    info_path = CURATED / "인물_정보.json"
    info = json.loads(info_path.read_text(encoding="utf-8")) if info_path.is_file() else {}
    extra_path = CURATED / "인물_추가.json"
    extra = json.loads(extra_path.read_text(encoding="utf-8")) if extra_path.is_file() else {}
    added = extra.get("new_persons", {})
    info.update(added)
    persons = {n: [FACTION[c], 1] for n, c in con.execute("select name, country from jeongsa_persons")}
    persons.update({n: [v["faction"], 0] for n, v in supplement.items()})
    persons.update({n: [v["faction"], 0] for n, v in added.items() if n not in persons})

    # (별명, 인물, 첫 회, 끝 회). 회차 범위가 있는 인물(동명이인)과 alias_chapters의 별명은 그 회차에서만 쓴다
    limit = extra.get("alias_chapters", {})
    entries = []
    for n, al in json.loads(ALIAS_PATH.read_text(encoding="utf-8")).items():
        entries += [(a, n, *limit.get(a, (1, 120))) for a in al]
    for n, al in extra.get("add_aliases", {}).items():
        entries += [(a, n, *limit.get(a, (1, 120))) for a in al]
    for n, v in added.items():
        entries += [(a, n, *v.get("chapters", (1, 120))) for a in v.get("aliases", [n])]
    entries = sorted(set(entries))

    def aliases_for(ch: int) -> dict[str, str]:
        """그 회차에서 쓰는 별명 → 인물. 같은 별명이 겹치면 회차 범위가 좁은 쪽이 이긴다."""
        best: dict[str, tuple[int, str]] = {}
        for a, n, lo, hi in entries:
            if lo <= ch <= hi:
                width = hi - lo
                if a in best and best[a][0] == width and best[a][1] != n:
                    raise SystemExit(f"alias {a} points to both {best[a][1]} and {n} in chapter {ch}")
                if a not in best or width < best[a][0]:
                    best[a] = (width, n)
        return {a: n for a, (_, n) in best.items()}

    block = extra.get("block", [])
    mentions = set()
    for ch, lines in raw.items():
        table = aliases_for(ch)
        for i, p in enumerate(lines):
            for b in block:  # 인물명이 아닌 문자열은 가린 뒤 찾는다
                p = p.replace(b, "□" * len(b))
            for n in find_persons_in_text(p, table):
                mentions.add((n, ch, i))
    missing = {m[0] for m in mentions} - persons.keys()
    if missing:
        raise SystemExit(f"mentioned people without a faction: {sorted(missing)}")

    con.executescript(SCHEMA)
    con.executemany("insert into paragraphs values (?,?,?,?)",
                    [(ch, i, p, ko.get((ch, i))) for ch, lines in raw.items() for i, p in enumerate(lines)])
    con.executemany("insert into persons values (?,?,?,?,?)",
                    [(n, info.get(n, {}).get("ko") or supplement.get(n, {}).get("ko"), f,
                      info.get(n, {}).get("death_year"), j) for n, (f, j) in persons.items()])
    con.executemany("insert into aliases values (?,?,?,?)", entries)
    con.executemany("insert into mentions values (?,?,?)", sorted(mentions))
    con.commit()
    count = lambda t: con.execute(f"select count(*) from {t}").fetchone()[0]
    print(f"paragraphs {count('paragraphs')} (translated {len(ko)}), persons {count('persons')}, "
          f"aliases {count('aliases')}, mentions {count('mentions')}")


if __name__ == "__main__":
    main()

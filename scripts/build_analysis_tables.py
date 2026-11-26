"""Build the analysis tables (paragraphs, persons, aliases, mentions) in the full DB.

  paragraphs  (chapter, idx)        one row per non-empty line of the 연의 원문, with its Korean translation
  persons     name                  Korean name, default faction, death year
  aliases     alias                 alias -> canonical name (used by the tagger)
  mentions    (name, chapter, idx)  "this person appears in this paragraph"

The old tables stay untouched. Mentions are moved from yeonui_mentions as-is
(no re-tagging), so every count derived from them is unchanged.

  python scripts/build_analysis_tables.py
"""
from __future__ import annotations

import difflib
import json
import re
import sqlite3
from pathlib import Path

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
CREATE TABLE aliases (alias TEXT PRIMARY KEY, name TEXT NOT NULL);
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

    mentions = set()
    for name, ch, excerpt in con.execute("select name, chapter, excerpt from yeonui_mentions"):
        for p in json.loads(excerpt):
            mentions.add((name, ch, raw[ch].index(p)))

    supplement = json.loads((CURATED / "인물_세력_보충.json").read_text(encoding="utf-8"))["people"]
    info_path = CURATED / "인물_정보.json"
    info = json.loads(info_path.read_text(encoding="utf-8")) if info_path.is_file() else {}
    persons = {n: [FACTION[c], 1] for n, c in con.execute("select name, country from jeongsa_persons")}
    persons.update({n: [v["faction"], 0] for n, v in supplement.items()})
    missing = {m[0] for m in mentions} - persons.keys()
    if missing:
        raise SystemExit(f"mentioned people without a faction: {sorted(missing)}")

    aliases = json.loads(ALIAS_PATH.read_text(encoding="utf-8"))

    con.executescript(SCHEMA)
    con.executemany("insert into paragraphs values (?,?,?,?)",
                    [(ch, i, p, ko.get((ch, i))) for ch, lines in raw.items() for i, p in enumerate(lines)])
    con.executemany("insert into persons values (?,?,?,?,?)",
                    [(n, info.get(n, {}).get("ko") or supplement.get(n, {}).get("ko"), f,
                      info.get(n, {}).get("death_year"), j) for n, (f, j) in persons.items()])
    con.executemany("insert into aliases values (?,?)", [(a, n) for n, al in aliases.items() for a in al])
    con.executemany("insert into mentions values (?,?,?)", sorted(mentions))
    con.commit()
    count = lambda t: con.execute(f"select count(*) from {t}").fetchone()[0]
    print(f"paragraphs {count('paragraphs')} (translated {len(ko)}), persons {count('persons')}, "
          f"aliases {count('aliases')}, mentions {count('mentions')}")


if __name__ == "__main__":
    main()

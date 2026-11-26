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
DROP TABLE IF EXISTS affiliations;
DROP TABLE IF EXISTS jeongsa_sentences;
DROP TABLE IF EXISTS jeongsa_mentions;
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
CREATE TABLE jeongsa_sentences (juan INTEGER NOT NULL, idx INTEGER NOT NULL, text TEXT NOT NULL,
  is_note INTEGER NOT NULL, bio TEXT, PRIMARY KEY (juan, idx));
CREATE TABLE jeongsa_mentions (name TEXT NOT NULL, juan INTEGER NOT NULL, idx INTEGER NOT NULL,
  PRIMARY KEY (name, juan, idx), FOREIGN KEY (juan, idx) REFERENCES jeongsa_sentences (juan, idx));
CREATE INDEX idx_jeongsa_mentions_name ON jeongsa_mentions (name);
"""
JEONGSA_DIR = ROOT / "data" / "raw" / "wikisource" / "정사"
# 정사가 인물을 부르는 방식 중 연의 별명 표에 없는 것: 권 범위별 칭호
JEONGSA_TITLES = [((1, 30), {"太祖": "曹操", "文帝": "曹丕", "明帝": "曹叡"}),   # 위서
                  ((31, 45), {"先主": "劉備", "後主": "劉禪"}),                  # 촉서
                  ((46, 65), {"權": "孫權"})]                                   # 오서: 손권을 '權'으로 부름
# '權'이 사람 이름이 아닌 낱말
JEONGSA_BLOCK = ["兵權", "權力", "權勢", "權宜", "權略", "權變", "權柄", "威權", "大權", "權謀", "權衡", "專權", "權重", "權時", "權道", "權貴", "權臣"]


def jeongsa_units(text: str) -> list[tuple[str, int]]:
    """정사 본문을 문장으로 나눈다. 배송지 주석 〈 〉은 따로 떼어 is_note=1."""
    units, buf, note = [], "", 0
    for ch in text:
        if ch in "〈〉":
            if buf.strip():
                units.append((buf.strip(), note))
            buf, note = "", 1 if ch == "〈" else 0
            continue
        buf += ch
        if ch in "。！？":
            if buf.strip():
                units.append((buf.strip(), note))
            buf = ""
    if buf.strip():
        units.append((buf.strip(), note))
    return units


def build_jeongsa(con: sqlite3.Connection, table: dict[str, str], block: list[str]) -> tuple[list, set]:
    """정사 65권을 문장 표로 만들고 연의와 같은 별명 표(+정사 칭호)로 태깅한다.
    자기 전기 안의 문장은 모두 그 사람에 관한 문장으로 센다(전기는 주인공을 '亮'처럼 이름 한 글자로 부르기 때문)."""
    bios = {}
    for n, j, bio in con.execute("select name, source_juan, biography from jeongsa_persons"):
        bios.setdefault(int(re.search(r"\d+", j).group()), []).append((n, bio))
    sentences, found = [], set()
    for f in sorted(JEONGSA_DIR.glob("*.json")):
        d = json.loads(f.read_text(encoding="utf-8"))
        juan, body = d["num"], d["body_text"]
        spans = []
        for n, bio in bios.get(juan, []):
            at = body.find(bio)
            if at >= 0:
                spans.append((at, at + len(bio), n))
        titles = dict(table)
        for (a, b), t in JEONGSA_TITLES:
            if a <= juan <= b:
                titles.update(t)
        pos = 0
        for i, (text, note) in enumerate(jeongsa_units(body)):
            at = body.find(text, pos)
            pos = at + len(text) if at >= 0 else pos
            inside = [(e - s, n) for s, e, n in spans if s <= at < e]
            bio = min(inside)[1] if inside else None
            sentences.append((juan, i, text, note, bio))
            masked = text
            for b in block + JEONGSA_BLOCK:
                masked = masked.replace(b, "□" * len(b))
            names = find_persons_in_text(masked, titles)
            if bio:
                names.add(bio)
            found |= {(n, juan, i) for n in names}
    return sentences, found


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
    # 정사: 회차가 없으므로 회차 제한이 없는 별명만 쓴다
    global_aliases = {a: n for a, n, lo, hi in entries if (lo, hi) == (1, 120)}
    j_sentences, j_mentions = build_jeongsa(con, global_aliases, block)

    con.executescript(SCHEMA)
    con.executemany("insert into paragraphs values (?,?,?,?)",
                    [(ch, i, p, ko.get((ch, i))) for ch, lines in raw.items() for i, p in enumerate(lines)])
    # 소속 이력: 연의에서 섬긴 쪽이 바뀐 사람(항복·귀순 등)과, 정사 분류와 처음 소속이 다른 사람
    history = json.loads((CURATED / "인물_소속이력.json").read_text(encoding="utf-8"))["people"]
    unknown = set(history) - persons.keys()
    if unknown:
        raise SystemExit(f"affiliation history for unknown people: {sorted(unknown)}")
    con.executemany("insert into affiliations values (?,?,?,?,?,?,?,?)",
                    [(n, k, a["faction"], a.get("lord"), a["from"], a["to"], a.get("change"), a.get("evidence"))
                     for n, segs in history.items() for k, a in enumerate(segs)])
    con.executemany("insert into persons values (?,?,?,?,?,?,?)",
                    [(n, info.get(n, {}).get("ko") or supplement.get(n, {}).get("ko"), f,
                      history[n][0]["faction"] if n in history else f, history[n][-1]["faction"] if n in history else f,
                      info.get(n, {}).get("death_year"), j) for n, (f, j) in persons.items()])
    con.executemany("insert into aliases values (?,?,?,?)", entries)
    con.executemany("insert into mentions values (?,?,?)", sorted(mentions))
    con.executemany("insert into jeongsa_sentences values (?,?,?,?,?)", j_sentences)
    con.executemany("insert into jeongsa_mentions values (?,?,?)", sorted(j_mentions))
    con.commit()
    count = lambda t: con.execute(f"select count(*) from {t}").fetchone()[0]
    print(f"paragraphs {count('paragraphs')} (translated {len(ko)}), persons {count('persons')}, "
          f"aliases {count('aliases')}, mentions {count('mentions')}, affiliations {count('affiliations')}, "
          f"jeongsa sentences {count('jeongsa_sentences')}, jeongsa mentions {count('jeongsa_mentions')}")


if __name__ == "__main__":
    main()

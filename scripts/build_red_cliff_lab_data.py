"""Build the lesson data for prototype/red-cliff-lab from the public seed DB.

Reads data/seed/red_cliff.db and writes prototype/red-cliff-lab/src/30-data.js with
three globals used by the app:

  BATTLE the battle settings from data/curated/battles.json (sides, indicators, dead, bonus)
  DB    rows of [hanja, korean, faction, ch[8], yy[4], jb[4], jn[4]]
          faction  wei / wu / shu, taken from the 정사 volume classification
          ch       paragraphs mentioning the person in 연의 chapters 43..50
          yy/jb/jn context counts for [ship, fire, plan, wind]:
                   yy = 연의 paragraphs, jb = 정사 body sentences,
                   jn = 배송지 annotation sentences (text inside 〈 〉)
  EDGES [i, j, count] co-occurrence pairs (indices into DB)
  EVID  {hanja: {indicator: [chapter, korean paragraph excerpt]}}
          shortest translated 연의 paragraph containing the indicator keyword
  EVID_ALL {hanja: {indicator: [[chapter, 원문 around the keyword, korean excerpt or ""], ...]}}
          every 연의 paragraph behind the count, for the people read in 순서 5

Usage:
  python scripts/build_red_cliff_lab_data.py
  sh prototype/red-cliff-lab/build.sh
"""
from __future__ import annotations

import json
import re
import sqlite3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DB_PATH = ROOT / "data" / "seed" / "red_cliff.db"
OUT_PATH = ROOT / "prototype" / "red-cliff-lab" / "src" / "30-data.js"

BATTLES_PATH = ROOT / "data" / "curated" / "battles.json"
BATTLE = next(b for b in json.loads(BATTLES_PATH.read_text(encoding="utf-8"))["battles"] if b["id"] == "red-cliff")
INDICATORS = {k: v["chars"] for k, v in BATTLE["indicators"].items()}
ORDER = list(INDICATORS)
FIRST, LAST = BATTLE["chapters"]
EXCERPT_LEN = 210
# 원문을 읽는 퀘스트의 인물들: '전체 문단 보기'에 쓰는 목록만 이들로 줄여 파일 크기를 지킵니다
ALL_PARAS_FOR = BATTLE["evidence_people"]
ZH_AROUND = 60
KO_LEN = 160



def has(text: str, key: str) -> bool:
    return any(word in text for word in INDICATORS[key])


def sentences(text: str) -> list[str]:
    return re.split("[。！？]", text)


def main() -> None:
    con = sqlite3.connect(DB_PATH)
    faction, korean = {}, {}
    for n, ko, f in con.execute("select name, ko, faction from persons"):
        faction[n], korean[n] = BATTLE.get("faction", {}).get(n, f), ko
    leave_out = set(BATTLE.get("leave_out", []))

    people: dict[str, dict] = {}
    evidence: dict[str, dict] = {}
    every: dict[str, dict] = {}
    for name, chapter, para, ko in con.execute(
            "select m.name, m.chapter, p.zh, p.ko from mentions m join paragraphs p using (chapter, idx) "
            "where m.chapter between ? and ? order by m.chapter, m.name, m.idx", (FIRST, LAST)):
        row = people.setdefault(name, {"ch": [0] * (LAST - FIRST + 1), "yy": {k: 0 for k in ORDER}})
        row["ch"][chapter - FIRST] += 1
        for key in ORDER:
            if not has(para, key):
                continue
            row["yy"][key] += 1
            if name in ALL_PARAS_FOR:
                at = min(para.find(w) for w in INDICATORS[key] if w in para)
                zh = ("…" if at > ZH_AROUND else "") + para[max(0, at - ZH_AROUND):at + ZH_AROUND] + ("…" if at + ZH_AROUND < len(para) else "")
                ko_cut = (ko[:KO_LEN] + ("…" if len(ko) > KO_LEN else "")) if ko else ""
                every.setdefault(name, {}).setdefault(key, []).append([chapter, zh, ko_cut])
            current = evidence.setdefault(name, {}).get(key)
            if ko and (current is None or len(ko) < len(current[1])):
                evidence[name][key] = [chapter, ko]

    for name, bio in con.execute("select name, biography from jeongsa_persons"):
        if name not in people:
            continue
        body = re.sub(r"〈[^〉]*〉", "", bio)
        notes = "".join(re.findall(r"〈([^〉]*)〉", bio))
        people[name]["jb"] = {k: sum(1 for s in sentences(body) if has(s, k)) for k in ORDER}
        people[name]["jn"] = {k: sum(1 for s in sentences(notes) if has(s, k)) for k in ORDER}

    for row in people.values():  # 정사에 전기가 없는 연의 인물
        row.setdefault("jb", {k: 0 for k in ORDER})
        row.setdefault("jn", {k: 0 for k in ORDER})

    names = sorted((n for n in people if n not in leave_out), key=lambda n: -sum(people[n]["ch"]))
    missing = [n for n in names if not korean.get(n)]
    if missing:
        raise SystemExit(f"Korean name missing for: {missing}")
    sided = set(BATTLE["sides"]["a"]["factions"]) | set(BATTLE["sides"]["b"]["factions"])
    unsided = [n for n in names if faction[n] not in sided]
    if unsided:
        raise SystemExit(f"no side in this battle (set faction or leave_out in battles.json): {unsided}")

    rows = [
        [n, korean[n], faction[n], people[n]["ch"],
         [people[n]["yy"][k] for k in ORDER],
         [people[n]["jb"][k] for k in ORDER],
         [people[n]["jn"][k] for k in ORDER]]
        for n in names
    ]
    index = {n: i for i, n in enumerate(names)}
    # 같은 회차에 함께 나온 횟수
    edges = [[index[a], index[b], k] for a, b, k in con.execute(
        "with c as (select distinct name, chapter from mentions where chapter between ? and ?) "
        "select x.name, y.name, count(*) from c x join c y on x.chapter = y.chapter and x.name < y.name "
        "group by x.name, y.name order by x.name, y.name", (FIRST, LAST)) if a in index and b in index]
    evid = {
        n: {k: [ch, ko[:EXCERPT_LEN] + ("…" if len(ko) > EXCERPT_LEN else "")] for k, (ch, ko) in v.items()}
        for n, v in evidence.items()
    }

    dump = lambda x: json.dumps(x, ensure_ascii=False, separators=(",", ":"))
    OUT_PATH.write_text(
        "/* generated by scripts/build_red_cliff_lab_data.py from data/seed/red_cliff.db */\n"
        f"const BATTLE={dump(BATTLE)};\nconst DB={dump(rows)};\nconst EDGES={dump(edges)};\nconst EVID={dump(evid)};\nconst EVID_ALL={dump(every)};\n",
        encoding="utf-8",
    )
    print(f"wrote {OUT_PATH.relative_to(ROOT)}: {len(rows)} people, {len(edges)} edges")


if __name__ == "__main__":
    main()

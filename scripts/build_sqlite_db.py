# -*- coding: utf-8 -*-
"""
3단계 분석/웹앱 준비: 흩어진 인물별 JSON들을 SQLite 하나로 합친다.

입력:
  data/processed/정사/인물별/*.json
  data/processed/연의/인물별_언급/*.json
  outputs/yeonui_cooccurrence.json
산출물: data/processed/samgukji.db

매 실행마다 이 스크립트가 소유한 3개 테이블(jeongsa_persons, yeonui_mentions,
cooccurrence_edges)만 지우고 다시 만든다(완전 재생성 방식). 이름이 바뀌거나
더 이상 생성되지 않는 인물이 옛 행으로 남는 사고를 막기 위함 —
split_persons.py가 출력 폴더를 안 비워서 겪었던 것과 같은 종류의 문제를
여기서는 원천적으로 피한다.

번역 테이블(jeongsa_translations, yeonui_paragraph_translations)은 이
스크립트가 건드리지 않는다 — scripts/load_translations.py가 별도로 채우며,
번역은 시간이 오래 걸리는 작업이라 이 스크립트를 재실행해도 날아가면 안 된다.
그래서 DB 파일 자체를 삭제하지 않고(예전 방식), 이 스크립트가 소유한 테이블만
DROP/CREATE한다.
"""
import json
import sqlite3
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
JEONGSA_DIR = ROOT / "data" / "processed" / "정사" / "인물별"
YEONUI_DIR = ROOT / "data" / "processed" / "연의" / "인물별_언급"
COOCCURRENCE_PATH = ROOT / "outputs" / "yeonui_cooccurrence.json"
DB_PATH = ROOT / "data" / "processed" / "samgukji.db"

SCHEMA = """
DROP TABLE IF EXISTS jeongsa_persons;
DROP TABLE IF EXISTS yeonui_mentions;
DROP TABLE IF EXISTS cooccurrence_edges;

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
    name TEXT,
    chapter INTEGER,
    chapter_title TEXT,
    excerpt TEXT,
    tagging_method TEXT,
    source_url TEXT,
    UNIQUE(name, chapter)
);
CREATE INDEX idx_yeonui_name ON yeonui_mentions(name);

CREATE TABLE cooccurrence_edges (
    person_a TEXT,
    person_b TEXT,
    count INTEGER,
    UNIQUE(person_a, person_b)
);

-- 번역 테이블: load_translations.py가 채움. 여기서는 없을 때만 만든다
-- (DROP 안 함 -- 이 스크립트를 재실행해도 번역 결과는 보존됨).
CREATE TABLE IF NOT EXISTS jeongsa_translations (
    name TEXT PRIMARY KEY,
    biography_ko TEXT,
    translated_at TEXT,
    translated_by TEXT
);

CREATE TABLE IF NOT EXISTS yeonui_paragraph_translations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chapter INTEGER,
    paragraph_zh TEXT,
    paragraph_ko TEXT,
    translated_at TEXT,
    translated_by TEXT,
    UNIQUE(chapter, paragraph_zh)
);
"""


def main():
    conn = sqlite3.connect(DB_PATH)
    conn.executescript(SCHEMA)

    jeongsa_rows = 0
    for p in JEONGSA_DIR.glob("*.json"):
        d = json.loads(p.read_text(encoding="utf-8"))
        conn.execute(
            "INSERT INTO jeongsa_persons VALUES (?, ?, ?, ?, ?, ?, ?)",
            (
                d["인물명"],
                d["원소속_편(권)"],
                d["국가"],
                d["본문_세그먼트"],
                d["출처_url"],
                int(bool(d["is_minor_biography"])),
                json.dumps(d.get("mentioned_relatives") or [], ensure_ascii=False),
            ),
        )
        jeongsa_rows += 1

    yeonui_rows = 0
    for p in YEONUI_DIR.glob("*.json"):
        d = json.loads(p.read_text(encoding="utf-8"))
        conn.execute(
            "INSERT INTO yeonui_mentions VALUES (?, ?, ?, ?, ?, ?)",
            (
                d["인물명"],
                d["회차"],
                d.get("chapter_title", ""),
                json.dumps(d.get("등장_구간_텍스트") or [], ensure_ascii=False),
                d.get("태깅_방식", ""),
                d["출처_url"],
            ),
        )
        yeonui_rows += 1

    cooc = json.loads(COOCCURRENCE_PATH.read_text(encoding="utf-8"))
    for e in cooc["edges"]:
        conn.execute(
            "INSERT INTO cooccurrence_edges VALUES (?, ?, ?)",
            (e["a"], e["b"], e["공동등장_회차수"]),
        )

    conn.commit()
    print(f"jeongsa_persons: {jeongsa_rows}")
    print(f"yeonui_mentions: {yeonui_rows}")
    print(f"cooccurrence_edges: {len(cooc['edges'])}")
    print(f"-> {DB_PATH.relative_to(ROOT)}")
    conn.close()


if __name__ == "__main__":
    main()

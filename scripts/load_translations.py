# -*- coding: utf-8 -*-
"""
서브에이전트들이 만든 번역 JSON 파일(들)을 SQLite 번역 테이블로 적재한다.

입력 JSON 스키마(파일 하나에 이 구조):
  { "jeongsa": [{"name": str, "biography_ko": str}, ...],
    "yeonui": [{"chapter": int, "paragraph_zh": str, "paragraph_ko": str}, ...] }

사용법: python scripts/load_translations.py <json경로> [<json경로> ...]
같은 (인물명) / (회차,원문문단) 조합이 이미 있으면 덮어쓴다(INSERT OR REPLACE) —
재번역해서 다시 적재해도 안전.
"""
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from build_sqlite_db import DB_PATH  # noqa: E402

import sqlite3


def load(conn: sqlite3.Connection, path: Path, translated_by: str) -> tuple[int, int]:
    d = json.loads(path.read_text(encoding="utf-8"))
    now = datetime.now(timezone.utc).isoformat()

    j_count = 0
    for p in d.get("jeongsa", []):
        conn.execute(
            "INSERT OR REPLACE INTO jeongsa_translations VALUES (?, ?, ?, ?)",
            (p["name"], p["biography_ko"], now, translated_by),
        )
        j_count += 1

    y_count = 0
    for y in d.get("yeonui", []):
        conn.execute(
            "INSERT OR REPLACE INTO yeonui_paragraph_translations "
            "(chapter, paragraph_zh, paragraph_ko, translated_at, translated_by) "
            "VALUES (?, ?, ?, ?, ?)",
            (y["chapter"], y["paragraph_zh"], y["paragraph_ko"], now, translated_by),
        )
        y_count += 1

    return j_count, y_count


def main():
    paths = sys.argv[1:]
    if not paths:
        print("사용법: python scripts/load_translations.py <json경로> [...]")
        sys.exit(1)

    conn = sqlite3.connect(DB_PATH)
    total_j, total_y = 0, 0
    for p in paths:
        j, y = load(conn, Path(p), translated_by="claude-subagent")
        print(f"{p}: 정사 {j}건, 연의 {y}건")
        total_j += j
        total_y += y
    conn.commit()

    cov_j = conn.execute("SELECT COUNT(*) FROM jeongsa_translations").fetchone()[0]
    cov_y = conn.execute(
        "SELECT COUNT(*) FROM yeonui_paragraph_translations"
    ).fetchone()[0]
    total_j_target = conn.execute("SELECT COUNT(*) FROM jeongsa_persons").fetchone()[0]
    conn.close()

    print(f"\n이번 적재: 정사 {total_j}건, 연의 {total_y}건")
    print(f"누적 커버리지: 정사 {cov_j}/{total_j_target}명, 연의 문단 {cov_y}건")


if __name__ == "__main__":
    main()

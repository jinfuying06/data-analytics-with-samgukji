# -*- coding: utf-8 -*-
"""
2단계-B: 연의(三國演義) 回 단위 본문에서 인물 언급을 태깅한다.
입력: data/raw/wikisource/연의/{NNN}.json (body_text, chapter_title 포함)
      data/processed/인물명_정규화.json (이명·자·시호 -> 표준 인물명)
산출물: data/processed/연의/인물별_언급/{인물명}_{회차:03d}.json
      { 인물명, 회차, chapter_title, 등장_구간_텍스트, 태깅_방식, 출처_url }
needs_review.json (2단계-A와 공유)에 애매한 회차를 추가한다.

처리 순서 (CLAUDE.md 2단계-B):
  1순위: chapter_title에 등장하는 인물명을 "주연 후보"로 우선 태깅
  2순위: body_text 문단 단위로 스캔해 인물명 언급 구간을 추출
현재 버전 범위: 규칙 기반 매칭만 구현. 별칭 테이블은 1~5회 등장 인물 위주로 우선
구축했으며, 단일 글자 지칭(예: "操"="曹操")처럼 문맥 의존적인 참조는 오탐 위험이
커서 이번 버전에서는 다루지 않는다 (테이블에 없음). 확장 시 함께 검토 필요.
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
YEONUI_DIR = ROOT / "data" / "raw" / "wikisource" / "연의"
ALIAS_TABLE_PATH = ROOT / "data" / "processed" / "인물명_정규화.json"
OUT_DIR = ROOT / "data" / "processed" / "연의" / "인물별_언급"
NEEDS_REVIEW_PATH = ROOT / "data" / "processed" / "needs_review.json"


def load_alias_table() -> dict:
    """alias -> canonical name. 별칭 길이 내림차순으로 매칭해야 부분 겹침을 피할 수 있다."""
    raw = json.loads(ALIAS_TABLE_PATH.read_text(encoding="utf-8"))
    alias_to_canon = {}
    for canon, aliases in raw.items():
        for a in aliases:
            alias_to_canon[a] = canon
    return alias_to_canon


def find_persons_in_text(text: str, alias_to_canon: dict) -> set:
    aliases_sorted = sorted(alias_to_canon.keys(), key=len, reverse=True)
    found = set()
    covered = [False] * len(text)
    for alias in aliases_sorted:
        for m in re.finditer(re.escape(alias), text):
            start, end = m.start(), m.end()
            if any(covered[start:end]):
                continue
            for i in range(start, end):
                covered[i] = True
            found.add(alias_to_canon[alias])
    return found


def process_hui(data: dict, alias_to_canon: dict) -> dict:
    chapter_title = data.get("chapter_title", "")
    body_text = data["body_text"]
    hui_num = data["num"]

    lead_candidates = find_persons_in_text(chapter_title, alias_to_canon)

    paragraphs = body_text.split("\n")
    mentions = {}  # canonical_name -> list of paragraph texts
    for para in paragraphs:
        if not para.strip():
            continue
        persons = find_persons_in_text(para, alias_to_canon)
        for name in persons:
            mentions.setdefault(name, []).append(para)

    all_names = set(mentions.keys()) | lead_candidates
    needs_review = len(all_names) == 0 and len(paragraphs) > 0

    return {
        "hui_num": hui_num,
        "chapter_title": chapter_title,
        "lead_candidates": sorted(lead_candidates),
        "mentions": mentions,
        "needs_review": needs_review,
    }


def main():
    import sys

    limit = int(sys.argv[1]) if len(sys.argv) > 1 else None
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    alias_to_canon = load_alias_table()

    files = sorted(p for p in YEONUI_DIR.glob("*.json") if not p.name.startswith("_"))
    if limit:
        files = files[:limit]

    needs_review = []
    if NEEDS_REVIEW_PATH.exists():
        needs_review = json.loads(NEEDS_REVIEW_PATH.read_text(encoding="utf-8"))

    written = 0
    for p in files:
        data = json.loads(p.read_text(encoding="utf-8"))
        result = process_hui(data, alias_to_canon)

        print(f"[第{result['hui_num']:03d}回] {result['chapter_title']}")
        print(f"  주연 후보(chapter_title): {result['lead_candidates']}")
        print(f"  본문 언급 인물: {sorted(result['mentions'].keys())}")

        if result["needs_review"]:
            needs_review.append({
                "title": data["title"],
                "url": data["url"],
                "reasons": ["별칭 테이블 매칭 인물 0명 (테이블 커버리지 부족 가능성)"],
            })
            continue

        for name, paragraphs in result["mentions"].items():
            safe_name = re.sub(r'[\\/:*?"<>|]', "_", name)
            out_path = OUT_DIR / f"{safe_name}_{result['hui_num']:03d}.json"
            out_path.write_text(
                json.dumps({
                    "인물명": name,
                    "회차": result["hui_num"],
                    "chapter_title": result["chapter_title"],
                    "등장_구간_텍스트": paragraphs,
                    "태깅_방식": "규칙",
                    "출처_url": data["url"],
                }, ensure_ascii=False, indent=2),
                encoding="utf-8",
            )
            written += 1

    NEEDS_REVIEW_PATH.write_text(
        json.dumps(needs_review, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"\n처리한 回: {len(files)}")
    print(f"인물 언급 파일 저장: {written}건 -> {OUT_DIR.relative_to(ROOT)}")
    print(f"needs_review 누적: {len(needs_review)}건 -> {NEEDS_REVIEW_PATH.relative_to(ROOT)}")


if __name__ == "__main__":
    main()

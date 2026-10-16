# -*- coding: utf-8 -*-
"""
3단계 분석 준비: 연의 인물 관계망을 위한 공동등장(co-occurrence) 집계.

입력: data/processed/연의/인물별_언급/*.json ({인물명, 회차, ...})
산출물: outputs/yeonui_cooccurrence.json
  { "nodes": [{"인물명":..., "등장_회차수":...}, ...],
    "edges": [{"a":..., "b":..., "공동등장_회차수":...}, ...] }

"공동등장"은 같은 회차(回)에 함께 등장했는지로 정의한다(장면 단위 겹침은
등장_구간_텍스트에 위치 정보가 없어 지금 데이터로는 판별 불가 — 나중에
필요해지면 크롤링 단계에서 위치 오프셋을 추가로 저장해야 한다).
"""
import json
from collections import Counter, defaultdict
from itertools import combinations
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
YEONUI_DIR = ROOT / "data" / "processed" / "연의" / "인물별_언급"
OUT_PATH = ROOT / "outputs" / "yeonui_cooccurrence.json"


def main():
    chapter_to_names = defaultdict(set)
    appearance_count = Counter()

    for p in YEONUI_DIR.glob("*.json"):
        d = json.loads(p.read_text(encoding="utf-8"))
        name = d["인물명"]
        chapter = d["회차"]
        chapter_to_names[chapter].add(name)
        appearance_count[name] += 1

    edge_count = Counter()
    for names in chapter_to_names.values():
        for a, b in combinations(sorted(names), 2):
            edge_count[(a, b)] += 1

    nodes = [
        {"인물명": name, "등장_회차수": count}
        for name, count in sorted(appearance_count.items(), key=lambda x: -x[1])
    ]
    edges = [
        {"a": a, "b": b, "공동등장_회차수": count}
        for (a, b), count in sorted(edge_count.items(), key=lambda x: -x[1])
    ]

    OUT_PATH.write_text(
        json.dumps({"nodes": nodes, "edges": edges}, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"인물 {len(nodes)}명, 공동등장 쌍 {len(edges)}건 -> {OUT_PATH.relative_to(ROOT)}")
    print("공동등장 회차수 top 10:")
    for e in edges[:10]:
        print(f"  {e['a']} - {e['b']}: {e['공동등장_회차수']}회")


if __name__ == "__main__":
    main()

"""정사/연의 인물 데이터 첫 EDA: 서술 분량, 등장 빈도, 정사-연의 교집합을 요약한다.

입력: data/processed/정사/인물별/*.json, data/processed/연의/인물별_언급/*.json,
      data/processed/인물명_정규화.json
출력: outputs/eda_overview.json (상세 수치), outputs/eda_overview.md (사람이 읽을 요약)
"""

import json
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
JEONGSA_DIR = ROOT / "data/processed/정사/인물별"
YEONUI_DIR = ROOT / "data/processed/연의/인물별_언급"
ALIAS_PATH = ROOT / "data/processed/인물명_정규화.json"
OUT_JSON = ROOT / "outputs/eda_overview.json"
OUT_MD = ROOT / "outputs/eda_overview.md"


def load_alias_map() -> dict[str, str]:
    canonical_to_aliases = json.loads(ALIAS_PATH.read_text(encoding="utf-8"))
    alias_to_canonical = {}
    for canonical, aliases in canonical_to_aliases.items():
        alias_to_canonical[canonical] = canonical
        for alias in aliases:
            alias_to_canonical[alias] = canonical
    return alias_to_canonical


def normalize(name: str, alias_map: dict[str, str]) -> str:
    return alias_map.get(name, name)


def load_jeongsa(alias_map: dict[str, str]) -> dict[str, dict]:
    stats: dict[str, dict] = {}
    for path in JEONGSA_DIR.glob("*.json"):
        data = json.loads(path.read_text(encoding="utf-8"))
        name = normalize(data["인물명"], alias_map)
        length = len(data.get("본문_세그먼트", ""))
        entry = stats.setdefault(
            name,
            {"인물명": name, "글자수": 0, "편": [], "is_minor_biography": False},
        )
        entry["글자수"] += length
        entry["편"].append(data.get("원소속_편(권)", ""))
        entry["is_minor_biography"] = entry["is_minor_biography"] or bool(
            data.get("is_minor_biography")
        )
    return stats


def load_yeonui(alias_map: dict[str, str]) -> dict[str, dict]:
    stats: dict[str, dict] = {}
    for path in YEONUI_DIR.glob("*.json"):
        data = json.loads(path.read_text(encoding="utf-8"))
        name = normalize(data["인물명"], alias_map)
        segments = data.get("등장_구간_텍스트", [])
        length = sum(len(s) for s in segments)
        entry = stats.setdefault(
            name, {"인물명": name, "등장_회차수": 0, "글자수": 0, "회차_set": set()}
        )
        entry["회차_set"].add(data.get("회차"))
        entry["글자수"] += length
    for entry in stats.values():
        entry["등장_회차수"] = len(entry["회차_set"])
        del entry["회차_set"]
    return stats


def top_n(stats: dict[str, dict], key: str, n: int = 20) -> list[dict]:
    return sorted(stats.values(), key=lambda x: x[key], reverse=True)[:n]


def main() -> None:
    alias_map = load_alias_map()
    jeongsa = load_jeongsa(alias_map)
    yeonui = load_yeonui(alias_map)

    jeongsa_names = set(jeongsa)
    yeonui_names = set(yeonui)
    both = jeongsa_names & yeonui_names
    only_jeongsa = jeongsa_names - yeonui_names
    only_yeonui = yeonui_names - jeongsa_names

    jeongsa_only_major = sorted(
        (jeongsa[n] for n in only_jeongsa if not jeongsa[n]["is_minor_biography"]),
        key=lambda x: x["글자수"],
        reverse=True,
    )[:20]

    yeonui_only_top = sorted(
        (yeonui[n] for n in only_yeonui),
        key=lambda x: x["등장_회차수"],
        reverse=True,
    )[:20]

    result = {
        "counts": {
            "정사_인물수": len(jeongsa_names),
            "연의_인물수": len(yeonui_names),
            "교집합_인물수": len(both),
            "정사에만_있음": len(only_jeongsa),
            "연의에만_있음": len(only_yeonui),
        },
        "정사_서술분량_top20": top_n(jeongsa, "글자수"),
        "연의_등장빈도_top20": top_n(yeonui, "등장_회차수"),
        "연의_분량_top20": top_n(yeonui, "글자수"),
        "정사에만_있는_주요인물_top20": jeongsa_only_major,
        "연의에만_있는_고빈도인물_top20": yeonui_only_top,
    }

    OUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    OUT_JSON.write_text(
        json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    lines = []
    lines.append("# 삼국지 인물 데이터 첫 EDA 요약")
    lines.append("")
    c = result["counts"]
    lines.append(
        f"- 정사 인물 {c['정사_인물수']}명 / 연의 언급 인물 {c['연의_인물수']}명 "
        f"/ 교집합 {c['교집합_인물수']}명"
    )
    lines.append(
        f"- 정사에만 있음(연의 미언급): {c['정사에만_있음']}명 / "
        f"연의에만 있음(정사 인물전 없음): {c['연의에만_있음']}명"
    )
    lines.append("")
    lines.append("## 정사 서술 분량 top 10 (글자수 기준)")
    for e in result["정사_서술분량_top20"][:10]:
        lines.append(f"- {e['인물명']}: {e['글자수']}자")
    lines.append("")
    lines.append("## 연의 등장 빈도 top 10 (등장 회차수 기준)")
    for e in result["연의_등장빈도_top20"][:10]:
        lines.append(f"- {e['인물명']}: {e['등장_회차수']}회")
    lines.append("")
    lines.append("## 정사엔 비중있게 있지만 연의엔 전혀 안 나오는 인물 top 10")
    for e in result["정사에만_있는_주요인물_top20"][:10]:
        lines.append(f"- {e['인물명']}: 정사 {e['글자수']}자, 연의 언급 0")
    lines.append("")
    lines.append("## 연의엔 자주 나오지만 정사 인물전이 없는 인물 top 10")
    lines.append(
        "(2026-09-26에 top10을 원문 grep으로 전수 확인함: 정규화 실패가 아니라"
        " 대부분 陳壽 三國志 원전에 독자 열전이 없는 인물들 — 다른 인물전에"
        " 조연으로만 언급되거나, 三國志가 다루는 범위 밖의 後漢 말 인물이거나,"
        " 諱를 직접 안 쓰고 칭호로만 서술되는 황제인 경우. 이 목록이 바뀌면"
        " 새로 등장한 이름은 같은 방식으로 재확인할 것.)"
    )
    for e in result["연의에만_있는_고빈도인물_top20"][:10]:
        lines.append(f"- {e['인물명']}: 연의 {e['등장_회차수']}회 등장")
    lines.append("")

    OUT_MD.write_text("\n".join(lines), encoding="utf-8")

    print("done")
    print(f"jeongsa={len(jeongsa_names)} yeonui={len(yeonui_names)} both={len(both)}")
    print(f"wrote {OUT_JSON}")
    print(f"wrote {OUT_MD}")


if __name__ == "__main__":
    main()

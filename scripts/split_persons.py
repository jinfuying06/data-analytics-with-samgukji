# -*- coding: utf-8 -*-
"""
2단계-A: 정사(三國志) 卷 단위 본문을 인물별로 분리한다.
입력: data/raw/wikisource/정사/{NN}.json (body_text, listed_persons 포함)
      data/processed/인물명_정규화.json (canonical -> 별칭 목록, 2단계-B와 공용)
산출물:
  - data/processed/정사/인물별/{인물명}.json
      { 인물명, 원소속_편(권), 국가, 본문_세그먼트, 출처_url, mentioned_relatives,
        is_minor_biography }
  - data/processed/needs_review.json
      패턴이 불안정하다고 판단된 卷 목록 + 사유 (2단계-B와 공유)

경계 탐지 규칙 (CLAUDE.md 2단계-A):
  1순위: listed_persons의 primary_person(=name) 목록을 기준으로 각 인명이
         본문에 등장하는 위치를 탐색
  2순위: "OOO字XX，YYY人也" 패턴을 인물 시작 경계로 탐지.
         여성 인물 卷은 "시호+성씨+皇后/妃，+출신지" 형태도 후보로 탐지.
  종실/왕공 계보 권(2순위 패턴이 0건이지만 listed_persons가 있는 경우):
         listed_persons 나열 순서를 본문 내 최초 등장 위치와 대응시켜 경계로 사용.
         이렇게 분리된 인물은 is_minor_biography=true로 표시하고,
         세그먼트가 짧다는 이유만으로 needs_review에 넣지 않는다.
  needs_review 조건:
    - 2순위 패턴도, 종실/왕공 폴백도 모두 실패(탐지 인물 수 0명)
    - listed_persons가 존재하는데 패턴 매칭 결과와 충돌
"""
import json
import re
from pathlib import Path

from opencc import OpenCC

_S2T = OpenCC("s2t")

ROOT = Path(__file__).resolve().parent.parent
JEONGSA_DIR = ROOT / "data" / "raw" / "wikisource" / "정사"
OUT_DIR = ROOT / "data" / "processed" / "정사" / "인물별"
NEEDS_REVIEW_PATH = ROOT / "data" / "processed" / "needs_review.json"
ALIAS_TABLE_PATH = ROOT / "data" / "processed" / "인물명_정규화.json"

PATTERN_MALE = re.compile(
    r"(?P<name>[一-鿿]{2,4})，?字(?P<zi>[一-鿿]{1,2})，"
    r"(?P<origin>(?:[一-鿿]{2,10}，)?[一-鿿]{2,10})也"
)
# 여성 인물: (시호+성씨)+皇后/太后/夫人/妃，+출신지+人. 문장 파편 오탐 방지를 위해
# prefix에 서술어/접속사류 글자가 섞이면 버린다.
# (출신지 최소 길이를 1자로 낮추는 안, "관계절+也"까지 허용하는 안 둘 다 시도해
# 봤으나 다른 卷에서 "…夫人，夫人得免"(卷43), "保護甘夫人，即後主母也"(卷36)류
# 무관한 서술까지 새 인물로 오분할시켜 되돌렸다. 卷34의 先主甘皇后·敬哀皇后·
# 張皇后는 이 패턴으로 잡히지 않고 남는다 — 알려진 잔여 한계.)
PATTERN_FEMALE = re.compile(
    r"(?P<prefix>[一-鿿]{1,4})(?P<suffix>皇后|太后|夫人|妃)，(?P<origin>[一-鿿]{2,8})人"
)
_FEMALE_PREFIX_DENYLIST = set("始有拜為爲崩立封進尊追諡者又乃遂復尚已而自其或故更")

# 태자: 蜀書는 皇帝紀 대신 先主/後主로 지칭하는 관례가 있어 "先主太子OO"/
# "後主太子OO" 형태로 등장한다(예: 卷34 "後主太子璿，字文衡。"). 다른 65권
# 본문에서 이 리터럴 조합이 우연히 등장할 가능성이 낮아 상시 적용 패턴으로 둔다.
PATTERN_TAIZI = re.compile(r"(?:先主|後主)太子(?P<name>[一-鿿]{1,3})(?=[，。字])")

# 종실/왕공/제기(帝紀) 계열: "OO王/公/侯+(諱)?+이름" 또는 "太子+이름" 형태로
# 시작하는 인물(예: 卷04 少帝紀 "齊王諱芳，字蘭卿。", 卷19 "任城威王彰，字子文。",
# 卷20 武文世王公傳 "豐愍王昂字子脩。"). 卷 시작(또는 줄바꿈 직후)에서만 매칭해
# 본문 중간의 봉작 언급과 혼동하지 않게 한다. 王/公/侯는 흔한 글자라 이미 다른
# 패턴으로 boundaries가 하나라도 잡힌 卷에는 적용하지 않고(오탐 위험),
# boundaries가 통째로 비어 실패한 卷에 한해서만 폴백으로 시도한다.
PATTERN_ROYAL_TITLE = re.compile(
    r"(?:^|\n)(?P<title>[一-鿿]{1,4}(?:[王公侯](?:子)?|太子))"
    r"(?:諱)?(?P<name>[一-鿿]{1,3})(?=[，。字])"
)


def _load_alias_table() -> dict:
    """alias -> canonical. 테이블에 없는 이름은 opencc s2t로 폴백 비교한다."""
    raw = json.loads(ALIAS_TABLE_PATH.read_text(encoding="utf-8"))
    alias_to_canon = {}
    for canon, aliases in raw.items():
        for a in aliases:
            alias_to_canon[a] = canon
    return alias_to_canon


def normalize_name(name: str, alias_to_canon: dict) -> str:
    if name in alias_to_canon:
        return alias_to_canon[name]
    return _S2T.convert(name)


def _mask_annotations(body_text: str) -> str:
    """裴松之 주석(〈…〉로 묶인 인용문) 구간을 같은 길이의 공백으로 치환한다.

    주석 안에는 "OOO字XX，YYY也" 형태로 보이는 문장이 종종 등장하지만, 이는
    다른 사서를 인용하며 이름 표기를 고증하는 부연 설명일 뿐 새 인물의 전기
    시작이 아니다(예: 화타의 본명 논쟁, 공손씨의 이름 고증 등). 원문 위치를
    유지해야 하므로 문자 수는 그대로 두고 내용만 지운다.
    """
    return re.sub(r"〈.*?〉", lambda m: "　" * len(m.group(0)), body_text, flags=re.DOTALL)


def find_pattern_boundaries(body_text: str) -> list:
    masked = _mask_annotations(body_text)
    boundaries = []
    for m in PATTERN_MALE.finditer(masked):
        name = m.group("name")
        # "文皇帝諱丕，字子桓" 처럼 시호+諱+실명 뒤에 콤마+字가 오는 경우, name
        # 캡처(최대 4자, 콤마 허용)가 "諱"까지 통째로 삼켜버릴 수 있다. 이런
        # 卷은 listed_persons 기반 단일 인물 폴백(諱 인식 포함)이 이미 올바르게
        # 처리하므로, 여기서는 매칭 자체를 버려 그 폴백으로 넘어가게 한다.
        if "諱" in name:
            continue
        # "OOO者字XX，..." 형태: 者는 인명을 지칭하는 고전 중국어 조사이지 이름의 일부가 아니다.
        if len(name) > 2 and name.endswith("者"):
            name = name[:-1]
        boundaries.append({"pos": m.start(), "name": name, "pattern": "male"})
    for m in PATTERN_FEMALE.finditer(masked):
        if any(c in _FEMALE_PREFIX_DENYLIST for c in m.group("prefix")):
            continue
        name = m.group("prefix") + m.group("suffix")
        boundaries.append({"pos": m.start(), "name": name, "pattern": "female"})
    for m in PATTERN_TAIZI.finditer(masked):
        # 先主/後主는 둘 다 蜀漢 劉氏이므로 태자의 성씨도 劉로 확정할 수 있다.
        boundaries.append({"pos": m.start(), "name": "劉" + m.group("name"), "pattern": "taizi"})
    boundaries.sort(key=lambda b: b["pos"])
    return boundaries


def find_royal_title_boundaries(body_text: str) -> list:
    masked = _mask_annotations(body_text)
    boundaries = []
    for m in PATTERN_ROYAL_TITLE.finditer(masked):
        boundaries.append({"pos": m.start("title"), "name": m.group("name"), "pattern": "royal_title"})
    boundaries.sort(key=lambda b: b["pos"])
    return boundaries


def find_leading_gap_person(
    body_text: str, boundaries: list, listed_persons: list, alias_to_canon: dict
) -> dict | None:
    """boundaries[0]보다 앞쪽 텍스트가 있으면 그 구간의 주인(대개 卷의 첫 인물)을 찾는다.

    PATTERN_MALE/FEMALE은 "OOO字XX，YYY人也" 형태만 잡기 때문에, 卷의 첫 인물이
    "…人，OOO之後也" 같은 삽입절이 있는 변형 문장으로 시작하면 매칭에 실패해
    卷 맨 앞부터 다음 경계 전까지 통째로 유실된다(예: 卷36 關羽, 卷09 夏侯惇).
    listed_persons에 아직 매칭되지 않은 이름이 선행 구간에 나오는지, 그것도 없으면
    "이름+字"로 시작하는지를 느슨하게 확인해 경계를 보강한다.
    """
    if not boundaries or boundaries[0]["pos"] <= 0:
        return None
    gap = body_text[: boundaries[0]["pos"]]
    if len(gap) <= 8:
        return None
    existing_canon = {normalize_name(b["name"], alias_to_canon) for b in boundaries}
    for lp in listed_persons:
        canon = normalize_name(lp["name"], alias_to_canon)
        if canon in existing_canon:
            continue
        if _lead_supports_name(gap, lp["name"], lead_chars=len(gap)):
            return {"pos": 0, "name": lp["name"], "pattern": "leading_gap_listed"}
    m = re.match(r"(?P<name>[一-鿿]{2,4})，?字", gap)
    if m:
        name = m.group("name")
        if len(name) > 2 and name.endswith("者"):
            name = name[:-1]
        return {"pos": 0, "name": name, "pattern": "leading_gap_lenient"}
    # 字(자)가 기록되지 않은 인물은 "OOO者，…也" 형태로 곧장 시작하기도 한다
    # (예: 卷40 劉封: "劉封者，本羅侯寇氏之子…也"). 이 느슨한 패턴은 卷 전체를
    # 대상으로 훑으면 者=조사로 쓰인 문장까지 오탐할 위험이 크므로, 卷의 맨
    # 앞(leading gap)에서만 시도한다.
    m = re.match(r"(?P<name>[一-鿿]{2,4})者，", gap)
    if m:
        return {"pos": 0, "name": m.group("name"), "pattern": "leading_gap_zhe"}
    return None


def derive_country(num: int) -> str:
    """卷 번호로 위/촉/오를 구분한다. 三國志의 전통적 편성 구간(卷1-30=魏書,
    31-45=蜀書, 46-65=吳書)을 원문으로 직접 확인함: 卷30은 魏書 마지막 편인
    烏丸鮮卑東夷傳, 卷31은 蜀書 첫 편(劉焉字君郎…), 卷45는 蜀書 마지막 편
    (鄧芝…), 卷46은 吳書 첫 편(孫堅字文臺…)."""
    if num <= 30:
        return "魏"
    if num <= 45:
        return "蜀"
    return "吳"


def _find_names_positions(body_text: str, names: list) -> list | None:
    """주어진 이름들 각각의 본문 내 위치를 찾는다. 같은 이름이 여러 번 필요하면
    이전에 찾은 위치 바로 다음부터 검색을 이어가 서로 다른 위치를 찾는다(단순
    body_text.find(name)만 쓰면 같은 이름은 항상 첫 등장 위치로만 수렴해 두
    인물이 같은 위치로 뭉개진다 — 예: 卷50에 정사 원문이 구분 이름 없이
    손화·손휴의 생모를 둘 다 그냥 "王夫人"으로만 적어놓은 경우).
    하나라도 못 찾으면 전체를 실패(None)로 본다.
    """
    positions = []
    search_from = {}
    for name in names:
        idx = body_text.find(name, search_from.get(name, 0))
        if idx == -1:
            # listed_persons는 위키백과 연결 섹션에서 온 것이라 간체로 적혀
            # 있을 때가 있다(예: 孙坚). 본문은 번체이므로 변환 후 재시도한다.
            traditional = _S2T.convert(name)
            idx = body_text.find(traditional, search_from.get(traditional, 0))
            name = traditional if idx != -1 else name
        if idx == -1:
            return None
        positions.append({"pos": idx, "name": name})
        search_from[name] = idx + 1
    return positions


def fallback_listed_order_boundaries(body_text: str, listed_persons: list) -> list | None:
    """종실/왕공 계보 권: listed_persons 각 이름의 본문 내 위치를 경계로 사용."""
    if len(listed_persons) < 2:
        return None
    positions = _find_names_positions(body_text, [lp["name"] for lp in listed_persons])
    if positions is None:
        return None
    positions.sort(key=lambda p: p["pos"])
    return positions


def _lead_supports_name(body_text: str, name: str, lead_chars: int = 500) -> bool:
    """Check whether the opening prose identifies a listed person.

    Biographies in the first juan often start with a posthumous/title name
    rather than the canonical name, e.g. ``太祖武皇帝 ... 姓曹，諱操``.
    This is deliberately a narrow, auditable rule: it only inspects the lead
    and requires either the full name or a 姓/諱 (or 姓/名) decomposition.
    """
    if not name:
        return False
    lead = _S2T.convert(body_text[:lead_chars])
    candidate = _S2T.convert(name)
    if candidate in lead:
        return True
    if len(candidate) < 2:
        return False
    surname, given = candidate[0], candidate[1:]
    if f"姓{surname}" in lead and (f"諱{given}" in lead or f"名{given}" in lead):
        return True
    # 紀(帝紀) 계열은 "文皇帝諱丕，字子桓" 처럼 姓을 따로 적지 않고 諱만 쓰는
    # 경우가 많다. 姓 표기가 없어도 諱만으로 단일 후보를 신뢰한다.
    return f"諱{given}" in lead


def fallback_single_listed_person_boundary(body_text: str, listed_persons: list) -> list | None:
    """Use the document start for a single biography with a supported lead.

    A single listed person is not sufficient by itself. The opening text must
    contain the name or an explicit 姓/諱/名 form, preventing unrelated single
    entries from being silently accepted.
    """
    if len(listed_persons) != 1:
        return None
    name = listed_persons[0].get("name", "")
    if not _lead_supports_name(body_text, name):
        return None
    return [{"pos": 0, "name": name, "pattern": "single_listed_person_lead"}]


def _resolve_royal_canonical_names(boundaries: list, listed_persons: list) -> list:
    """왕공/제기 폴백은 존호+諱(예: "彰")만 포착하므로, listed_persons의 전체
    표기(예: "任城王曹彰")에서 성+이름만("曹彰") 추려 교체한다.

    이 정규식은 "OO王"/"OO公"/"OO侯" 같은 흔한 글자를 경계로 삼기 때문에
    본문 중 무관한 서술(예: 卷19 "文帝即王位"의 '位', 卷30 東夷傳의 각종 오랑캐
    "王")도 함께 잡힌다. listed_persons과 대조해 실제로 끝이 일치하는 것만
    채택하고 나머지는 폐기한다 — listed_persons가 아예 없는 卷(卷20, 卷30 등)은
    대조 근거가 없으므로 이 폴백에서는 아무 것도 확정하지 않는다.
    """
    if not listed_persons:
        return []
    resolved = []
    for b in boundaries:
        given_t = _S2T.convert(b["name"])
        canon = next(
            (
                lp["name"][-2:]
                for lp in listed_persons
                if _S2T.convert(lp["name"]).endswith(given_t)
            ),
            None,
        )
        if canon:
            resolved.append({**b, "name": canon})
    return resolved


def segment_body(body_text: str, boundaries: list) -> list:
    segments = []
    for i, b in enumerate(boundaries):
        start = b["pos"]
        end = boundaries[i + 1]["pos"] if i + 1 < len(boundaries) else len(body_text)
        segments.append({"name": b["name"], "text": body_text[start:end]})
    return segments


def process_juan(data: dict, alias_to_canon: dict) -> dict:
    body_text = data["body_text"]
    listed_persons = data.get("listed_persons", [])
    listed_names = [p["name"] for p in listed_persons]

    boundaries = find_pattern_boundaries(body_text)
    is_minor_biography = False
    review_reasons = []
    leading_gap_reason = None

    if boundaries and boundaries[0]["pos"] > 0:
        leading_person = find_leading_gap_person(
            body_text, boundaries, listed_persons, alias_to_canon
        )
        if leading_person is not None:
            boundaries = [leading_person] + boundaries
        elif len(body_text[: boundaries[0]["pos"]].strip()) > 30:
            leading_gap_reason = (
                f"卷 시작부 {boundaries[0]['pos']}자가 어느 인물에도 귀속되지 않음"
            )

    pattern_names = [b["name"] for b in boundaries]

    if not boundaries:
        single = fallback_single_listed_person_boundary(body_text, listed_persons)
        if single is not None:
            boundaries = single
            pattern_names = [b["name"] for b in boundaries]

    if not boundaries:
        royal = _resolve_royal_canonical_names(
            find_royal_title_boundaries(body_text), listed_persons
        )
        if royal:
            boundaries = royal
            is_minor_biography = True
            pattern_names = [b["name"] for b in boundaries]
            leading_gap_reason = None

    if not boundaries:
        fallback = fallback_listed_order_boundaries(body_text, listed_persons)
        if fallback is not None:
            boundaries = fallback
            is_minor_biography = True
            pattern_names = [b["name"] for b in boundaries]
            leading_gap_reason = None

    # listed_persons 전원이 경계로 커버되는지 확인한다. 일부만 커버되면(예:
    # 卷48 三嗣主傳 - 孫亮만 "字…也" 패턴에 걸리고 孫休/孫皓는 다른 문장
    # 구조라 패턴이 아예 못 잡는 경우) 빠진 인물만 listed_persons 순서 기반
    # 폴백으로 찾아 끼워 넣는다.
    #
    # 예전에는 하나라도 빠지면 boundaries 전체를 폴백 결과로 통째로
    # 교체했는데, 그러면 이미 정확히 잡혀 있던 다른 인물들의 경계까지
    # body_text.find()의 허술한(첫 등장 위치를 그대로 신뢰하는) 탐색으로
    # 덮어써졌다. 실제로 卷65에서 이 경로로 사고가 났다: listed_persons에
    # "華核"(간체 표기)이 있고 본문엔 정식 전기가 "華覈"(번체)로 시작해
    # 정규화 비교에서 불일치로 판정됐는데, 정작 패턴 매칭 자체는 5명 전원을
    # 정확히 찾은 상태였다. 그런데도 "미검출"로 오판해 전체를 교체하면서,
    # find()가 각 인물의 진짜 전기 시작이 아니라 다른 사람 전기 안에서 그
    # 이름이 지나가듯 언급된 위치(예: 韋曜傳 안에 있는 "…而華核連上疏…")를
    # 잡아버려 王蕃·賀邵·韋曜·華覈 네 사람의 본문이 서로 뒤섞였다.
    # 지금은 이미 확정된 경계는 그대로 두고, 정말로 못 찾은 이름만 위치를
    # 찾아 추가한다(그 이름 자체도 지나가는 언급을 잡을 위험은 남지만,
    # 최소한 이미 옳았던 다른 인물의 경계는 건드리지 않는다).
    listed_t = [normalize_name(n, alias_to_canon) for n in listed_names]
    pattern_t = [normalize_name(n, alias_to_canon) for n in pattern_names]
    matched = [n for n in listed_t if any(n in pn or pn in n for pn in pattern_t)]
    missing = [n for n in listed_t if n not in matched]

    if boundaries and not is_minor_biography and missing:
        missing_raw_names = [
            lp["name"] for lp in listed_persons
            if normalize_name(lp["name"], alias_to_canon) in missing
        ]
        found = _find_names_positions(body_text, missing_raw_names)
        if found:
            existing_positions = {b["pos"] for b in boundaries}
            added = [f for f in found if f["pos"] not in existing_positions]
            if added:
                boundaries = sorted(boundaries + added, key=lambda b: b["pos"])
                is_minor_biography = True
                pattern_names = [b["name"] for b in boundaries]
                pattern_t = [normalize_name(n, alias_to_canon) for n in pattern_names]
                matched = [n for n in listed_t if any(n in pn or pn in n for pn in pattern_t)]
                missing = [n for n in listed_t if n not in matched]

    if leading_gap_reason:
        review_reasons.append(leading_gap_reason)

    hard_block = not boundaries
    if not boundaries:
        review_reasons.append("패턴 매칭으로 탐지된 인물 수가 0명")

    if listed_names and boundaries and not is_minor_biography and not matched:
        review_reasons.append(
            f"listed_persons({listed_names})와 패턴 매칭 결과({pattern_names})가 충돌"
        )
        hard_block = True

    # leading_gap_reason만 있는 경우(卷 시작부가 특정 인물이 아니라 서두 논평 등
    # 비인물 텍스트, 예: 卷05 후비傳 서두)는 그 구간만 세그먼트에서 제외하고
    # 나머지 이미 확정된 인물 경계는 정상 산출한다. needs_review 기록 자체는
    # 감사 추적을 위해 그대로 남긴다(데이터 원칙: 불확실한 결과를 삭제하지 않음).
    segments = segment_body(body_text, boundaries) if boundaries and not hard_block else []

    persons_out = []
    for seg in segments:
        canon_name = normalize_name(seg["name"], alias_to_canon)
        relatives = []
        seg_t = normalize_name(seg["name"], alias_to_canon)
        for lp in listed_persons:
            lp_t = normalize_name(lp["name"], alias_to_canon)
            if lp_t == seg_t or lp_t in seg_t or seg_t in lp_t:
                relatives = lp.get("relatives", [])
                break
        persons_out.append({
            "인물명": canon_name,
            "원소속_편(권)": data["title"],
            "국가": derive_country(data["num"]),
            "본문_세그먼트": seg["text"],
            "출처_url": data["url"],
            "mentioned_relatives": relatives,
            "is_minor_biography": is_minor_biography,
        })

    return {
        "title": data["title"],
        "listed_persons": listed_names,
        "pattern_names": pattern_names,
        "persons_out": persons_out,
        "needs_review": bool(review_reasons),
        "review_reasons": review_reasons,
    }


def _disambiguate_duplicate_names(all_persons: list) -> None:
    """서로 다른 세그먼트가 우연히 같은 인물명으로 겹치면(예: 卷50에 정사 원문이
    둘 다 그냥 "王夫人"으로만 적어 구분 이름이 없는 손화/손휴의 생모 두 명)
    나중 항목이 파일을 덮어써 하나가 조용히 사라진다. 같은 세그먼트 안의
    追尊/諡 기록에서 구분되는 시호를 찾아 그것으로 바꾼다(코퍼스의 다른 后妃들도
    이미 시호로 저장돼 있어 일관된 방식). 시호를 못 찾으면 마지막 수단으로 원소속
    卷 번호를 붙여 최소한 덮어쓰기만은 막는다.
    """
    from collections import Counter

    counts = Counter(p["인물명"] for p in all_persons)
    dupes = {n for n, c in counts.items() if c > 1}
    if not dupes:
        return
    title_re = re.compile(r"(?:追尊|追諡|諡)[^，。]{0,6}?曰(?P<title>[一-鿿]{2,4}(?:皇后|皇帝|后))")
    for p in all_persons:
        if p["인물명"] in dupes:
            m = title_re.search(p["본문_세그먼트"])
            if m:
                p["인물명"] = m.group("title")

    counts2 = Counter(p["인물명"] for p in all_persons)
    for p in all_persons:
        if counts2[p["인물명"]] > 1:
            juan_no = p["원소속_편(권)"].split("卷")[-1]
            p["인물명"] = f'{p["인물명"]}_卷{juan_no}'


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    # 이 스크립트는 매번 65권 원문 전체를 처음부터 다시 처리하는 완전 재생성
    # 방식이라, 이전 실행에서 남은 파일을 지우지 않으면 그 사이 이름이
    # 바뀌거나(예: 시호로 재명명, alias 테이블 수정) 더 이상 생성되지 않는
    # 인물의 옛 파일이 고아로 계속 남아 진짜 처리 결과와 섞인다.
    for stale in OUT_DIR.glob("*.json"):
        stale.unlink()
    alias_to_canon = _load_alias_table()
    files = sorted(p for p in JEONGSA_DIR.glob("*.json") if not p.name.startswith("_"))

    needs_review = []
    written = 0
    minor_written = 0
    stats = []
    all_persons = []

    for p in files:
        data = json.loads(p.read_text(encoding="utf-8"))
        if "listed_persons" not in data:
            continue
        result = process_juan(data, alias_to_canon)
        stats.append(result)

        if result["needs_review"]:
            needs_review.append({
                "title": result["title"],
                "url": data["url"],
                "reasons": result["review_reasons"],
                "listed_persons": result["listed_persons"],
                "pattern_names": result["pattern_names"],
            })

        all_persons.extend(result["persons_out"])

    _disambiguate_duplicate_names(all_persons)

    for person in all_persons:
        name = person["인물명"]
        safe_name = re.sub(r'[\\/:*?"<>|]', "_", name)
        out_path = OUT_DIR / f"{safe_name}.json"
        out_path.write_text(
            json.dumps(person, ensure_ascii=False, indent=2), encoding="utf-8"
        )
        written += 1
        if person["is_minor_biography"]:
            minor_written += 1

    NEEDS_REVIEW_PATH.parent.mkdir(parents=True, exist_ok=True)
    existing = []
    if NEEDS_REVIEW_PATH.exists():
        existing = json.loads(NEEDS_REVIEW_PATH.read_text(encoding="utf-8"))
    other_domain = [r for r in existing if not r.get("title", "").startswith("三國志/")]
    NEEDS_REVIEW_PATH.write_text(
        json.dumps(other_domain + needs_review, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    print(f"처리한 卷: {len(stats)}")
    print(f"인물 파일 저장: {written}건 (is_minor_biography: {minor_written}건) -> {OUT_DIR.relative_to(ROOT)}")
    print(f"needs_review: {len(needs_review)}권 -> {NEEDS_REVIEW_PATH.relative_to(ROOT)}")
    for r in needs_review:
        print(f"  - {r['title']}: {r['reasons']}")


if __name__ == "__main__":
    main()

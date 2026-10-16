# 데이터 스키마 개요

## 원문 파일

위치: `data/raw/wikisource/{정사,연의}/*.json`

공통 필드:

- `work_title`
- `author`
- `unit`
- `num`
- `label`
- `title`
- `url`
- `source`
- `crawled_at`
- `body_text`

정사 추가 필드:

- `listed_persons`: 원문 헤더에서 추출한 인물 후보와 관계 정보

연의 추가 필드:

- `chapter_title`: 회차 헤더에서 추출한 회목

## 정사 인물별 파일

위치: `data/processed/정사/인물별/*.json`

핵심 필드:

- `인물명`
- `원소속_편(권)`
- `국가`: 卷 번호로 파생한 위/촉/오 구분(卷1-30=魏, 31-45=蜀, 46-65=吳)
- `본문_세그먼트`
- `출처_url`
- `mentioned_relatives`
- `is_minor_biography`

## 연의 인물별 등장 파일

위치: `data/processed/연의/인물별_언급/*.json`

핵심 필드:

- `인물명`
- `회차`
- `chapter_title`
- `등장_구간_텍스트`
- `태깅_방식`
- `출처_url`
- `mentioned_relatives`
- `is_minor_biography`

## 검토 상태

`data/processed/needs_review.json`은 자동 규칙으로 확정하기 어려운 항목의 목록이다. 검토 항목은 삭제하지 않고 사유와 원문 URL을 유지한다.

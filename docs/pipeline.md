# 삼국지 데이터 파이프라인

## 목적

위키문헌의 정사·연의 원문을 수집하고, 인물 단위 데이터로 변환한 뒤 정사와 연의를 비교 분석한다.

## 현재 처리 순서

1. `data/raw/wikisource_index.json`에서 대상 페이지 목록을 읽는다.
2. `crawl_wikisource_text.py`가 원문을 `data/raw/wikisource/`에 저장한다.
3. 정사는 `enrich_listed_persons.py`로 `listed_persons`를 보강한다.
4. 연의는 `enrich_chapter_title.py`로 `chapter_title`을 보강한다.
5. `build_alias_table.py`가 인물명·별칭 테이블을 생성한다.
6. `split_persons.py`가 정사 원문을 인물별 전기로 분리한다.
7. `tag_yeonui_persons.py`가 연의 본문을 인물별 등장 문단으로 분리한다.
8. `scripts/validate_data.py`가 입력·출력 품질을 검사한다.
9. (3단계 분석 준비) `scripts/build_yeonui_cooccurrence.py`가 연의 인물별_언급을
   회차 단위로 묶어 인물 공동등장 네트워크(`outputs/yeonui_cooccurrence.json`)를
   만든다.

## 데이터 원칙

- 원문 파일은 처리 단계에서 직접 수정할 수 있다. 단, 재수집 가능한 원본이라는 점을 유지해야 한다.
- 인물명 자동 매칭 결과에는 가능하면 판정 방법과 검토 상태를 남긴다.
- 불확실한 결과는 삭제하지 않고 `data/processed/needs_review.json`에 기록한다.
- 모든 분석 결과는 원문 파일과 출처 URL로 역추적 가능해야 한다.

## 실행

현재 품질 점검은 다음 명령으로 실행한다.

```powershell
python scripts/validate_data.py
```

결과는 `outputs/quality_report.json`에 저장된다.

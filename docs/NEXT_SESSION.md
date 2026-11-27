# 다음 세션 이어가기 (2026-11-27 기준)

브랜치 `feature/gyechaek-game`. `main`에 합치면 공개 사이트가 바뀌므로 사용자 허락 없이 합치지 않는다.

## 먼저 읽을 것

1. `AGENTS.md` — 보고 형식(status/summary/artifacts/checks/next_actions), 한국어 보고
2. `docs/PRD.md` — 4장 '전투와 질문 사다리' 표, 10장 구현 순서
3. `docs/BATTLE_CONTENT_FORMAT.md` — 전투 설정(`battles.json`)과 내용 파일(`battles/<id>.js`) 형식
4. `docs/CHARACTER_VOICE.md`, `docs/COPY_STYLE.md` — 인물 대사(사극체)와 기록관 말투

## 지금 상태

| 전투 | ★ 퀘스트 6개 | ★★ 숫자 의심하기 | ★★★ 가정 설계 |
|---|---|---|---|
| 적벽 (튜토리얼) | 완료 | 완료 (정사 대조) | 완료 |
| 이릉 | 완료 | 완료 (분류하기) | 완료 |
| 관도 | 완료 | **다음 할 일** | 완료 |
| 번성·오장원 | 봉인 | — | — |

## 다음 할 일

1. **관도 ★★ '소속 타임라인'**: 허유(30회 15문단에 넘어옴)·장합·고람(24문단에 항복)의 문단을 넘어가기 전은 원소군, 뒤는 조조군으로 나눠 세면 지수가 어떻게 바뀌는가.
   - 지금 ★는 세 사람을 넘어간 뒤 소속(위)으로 통째로 센다.
   - 문단 단위 숫자가 필요하다. `scripts/build_red_cliff_lab_data.py`에서 미리 계산해 데이터에 넣거나, 내용 파일에 고정값으로 적고 테스트로 확인한다.
   - 새 활동 유형(`type: "timeline"`)을 엔진 `request()` 옆에 만든다. 기존 `compare`·`classify`와 같은 흐름: 질문 → 짐작 → 활동 → 확인 문제(`check.why`) → 결론 → 보상.
   - 그 뒤 `guandu.js`의 `unlock` 대사를 ★★를 예고하는 말로 바꾼다(지금은 ★★★만 예고). ★★ 질문을 낸 인물은 장합이 어울린다.
2. **다음 전투 열림 규칙**: 넣을지 사용자에게 먼저 묻는다(진행 기록에 따라 전투가 잠길 수 있음).
3. 그다음: 번성(관계망), 오장원(회차별 추세), 초상화.

## 작업 방법

- 데이터: 전체 DB `data/processed/samgukji.db` → `python scripts/build_red_cliff_seed.py`(battles.json의 회차만 seed로 복사) → `python scripts/build_red_cliff_lab_data.py --battle <id>`
- 빌드: `node scripts/build-imported-site.mjs` → `dist/game`. 확인용 서버는 `python -m http.server 8791 --directory dist --bind 127.0.0.1`. 사용자의 8765 서버는 건드리지 않는다.
- 테스트: `npm install --no-save jsdom` 뒤 `tests/*.cjs` 전부 실행하고 `node_modules`는 지운다. 관도 숫자는 `tests/game-core.cjs`에 고정되어 있다(21/14, 383/254, 70→64/44).
- 브라우저 확인: 시작 전 `gyechaek-*` localStorage를 백업하고 끝나면 되돌린다. 캐시 때문에 `index.html?b=<id>&v=<숫자>`로 연다.
- 문구: '싸움' 대신 '전투'·'계책'. 기록관 대사는 짧고 담백하게. 인물 대사는 CHARACTER_VOICE에 인물을 먼저 적고 쓴다.
- 커밋·푸시는 사용자가 그 차례에 요청할 때만 한다.

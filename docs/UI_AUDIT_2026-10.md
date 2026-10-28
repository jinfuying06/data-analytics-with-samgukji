# UI 진단 (1단계) — 2026-10

스크린샷: `docs/ui-audit/` (데스크톱 1440, 모바일 390)

## 구조 파악
- 실제 학습 화면은 `prototype/red-cliff-lab/src/*` → `scripts/build-imported-site.mjs` → `frontend/public/learning/index.html`(생성물)이며, `/`·`/learn`·`/simulation`은 이를 iframe으로 띄운다. **수정은 생성물이 아니라 `prototype/red-cliff-lab/src/`에서 한다.**
- `/network`, `/person/[name]`만 Next.js 컴포넌트 + `app/globals.css`를 쓴다.

## 발견 사항
| # | 우선순위 | 내용 | 위치 |
|---|---|---|---|
| 1 | 높음 | `/network`이 스타일 없이 렌더링됨. `network-page`, `pixel-panel`, `paper-panel` 등 클래스의 CSS가 `globals.css`에 없음. 나머지 앱의 다크 톤과도 불일치 | `frontend/app/network/page.tsx`, `frontend/app/globals.css` |
| 2 | 중간 | `/person/[name]`도 같은 구형 라이트 테마를 쓸 가능성이 큼(미확인) | `frontend/app/person/[name]/page.tsx` |
| 3 | 중간 | 데스크톱 상단에 내비게이션이 없고, 단계 이동은 모바일 하단 탭에만 있음 | `20-markup.html`, 스타일 파일 |
| 4 | 중간 | 단계 상단 배너 위아래에 검은 띠(레터박스)가 보임 | `12-styles-journey.html` 추정 |
| 5 | 낮음 | 보조 텍스트가 11~12px에 대비가 낮음. 비활성 "시작하기" 버튼도 흐림 | 스타일 파일 |
| 6 | 낮음 | 인물 카드에 픽셀 캐릭터/세력색이 없어 텍스트 위주임 | `70-learning-journey.js` |

## 잘 된 점
- 인트로 연출, 어두운 시네마틱 톤, 픽셀 국기, 한글 타이포가 이미 일관됨. 전면 개편보다 불일치 보정이 맞다.

## 다음 단계 제안
2단계: 디자인 토큰 한 장 정리(기존 학습 화면의 색·서체 기준) → `/network`, `/person`을 같은 토큰으로 정리 → 데스크톱 내비게이션·배너·가독성 보정.

## 2단계 적용 결과
- `frontend/app/theme.css` 추가: 학습 화면(`prototype/red-cliff-lab`)과 같은 색·서체 토큰, `/network`·`/person` 스타일. `globals.css`는 그대로 두고 `layout.tsx`에서 뒤에 로드해 덮어씀.
- `frontend/components/SiteHeader.tsx` 추가: 두 페이지 공통 헤더(학습실/관계망).
- `/network`: 다크 톤, 위·오·촉 세력색 노드, 라벨, 자동 화면 맞춤(zoomToFit).
- `/person/[name]`: 다크 톤, 긴 정사 원문·연의 발췌를 접기/펼치기로 변경(페이지 높이 17,496px → 2,263px).
- 확인: `STATIC_PROTOTYPE=1 next build` 성공(인물 63명 정적 생성), 1440/390px 렌더링, 가로 스크롤 없음, `tsc` 통과. 기존 eslint 오류 4건은 변경 전부터 있던 것.
- 남은 항목: 학습 화면 내부(데스크톱 내비게이션, 배너 검은 띠, 보조 텍스트 대비, 인물 카드 픽셀 캐릭터)는 `prototype/red-cliff-lab/src/` 수정이 필요해 3단계로 넘김.

## 3단계 적용 결과 (학습 화면 `prototype/red-cliff-lab/src/`)
- 정정: 진단 3번("데스크톱 내비게이션 없음")의 원인은 내비게이션 부재가 아니라 버그였다. 홈에서 "시작하기"로 들어가면 body의 `experiment-home` 클래스가 남아 단계 화면에서도 사이드바와 학습 기록이 숨겨졌다. `40-app.js`의 `route()`가 1~6단계를 그린 뒤 이 클래스를 지우도록 수정했다.
- 문구: 정답은 "맞습니다.", 오답은 "다시 생각해 보시지요."로 통일. "~군요" 맞장구는 "~했습니다"로 변경. `startsWith("그렇")`로 정답 여부를 가르던 코드는 `startsWith("맞")`로 변경.
- stop-slop-ko: `slop_scan.py`로 `frontend/public/learning/index.html` 검사 결과 WARN 2건(`— 적벽대전 편 —` em-dash 장식)을 제거해 PASS. 남은 INFO 1건(`建安十三年 · 서기 208년`)은 2항목 속성 구분이라 유지.
- 가독성: `word-break:keep-all`로 어절 단위 줄바꿈, 보조 글자색 `--ink-3` 대비 상향(#8c8579→#9c9588), 12px 미만 보조 설명 글자 12px로, 단계 제목의 스크립트 포커스 테두리 제거.
- 남김: 배너의 위아래 검은 띠는 `.lb` 시네마 레터박스 연출이라 유지. 인물 카드의 픽셀 캐릭터는 `AGENTS.md`의 캐릭터 제작 규칙(캐릭터 1명씩, 기준 이미지 필요)에 따라 별도 작업으로 분리.
- 검증: `tests/*.cjs` 6개 전부 PASS(문구 단언 3곳 갱신), 1440/390px 확인, 모바일 가로 스크롤 없음.

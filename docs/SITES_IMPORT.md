# GitHub 최신 앱의 Sites 구성

- 기준: `jinfuying06/data-analytics-with-samgukji` main, `5113da1b85b0492f131507f6f9fc17bf8aeb1962`.
- 기본 화면: 새로 추가된 `prototype/red-cliff-lab`의 6단계 학습 앱.
- 기존 Next.js, FastAPI, SQLite와 이미지 에셋은 소스에 유지한다. 호스팅의 첫 화면은 최신 단일 HTML 앱을 사용한다.
- Sites에서 검토한 UI/UX 변경을 GitHub main에 동기화한다. 기존 Next.js·FastAPI·SQLite 소스는 보존하고, 학습 앱용 빌드 어댑터를 사용한다. 호스팅 식별자와 인증 정보는 동기화하지 않는다.

## 빌드

`npm run build`는 공개 seed DB에서 `30-data.js`를 재생성하고 `dist/index.html`을 만든다. 새 DB나 서버는 만들지 않는다.

원본 스타일, 6단계 구성, 지표·가중치·시뮬레이션의 계산 코드를 유지한다. 어댑터는 화면 문구를 문장 단위로 편집한다. 설명은 합니다·입니다체, 질문은 ~할까요?, 버튼은 ~하기로 통일한다. 상세 기준은 `docs/COPY_STYLE.md`를 따른다. 원문 번역 데이터는 수정하지 않는다. HTML 문서의 언어·문자셋·모바일 viewport를 추가하고, 사료 화면에 출처 커밋·연결 범위를 안내한다. 기존 완료 조건이 키보드에서도 적용되도록 정리했다.

호스팅은 정적 파일이다. 실제 DB에서 추출한 63명·186건·동시 등장 1,340쌍을 브라우저에서 계산하며, 실시간 FastAPI 연결은 없다. 모델 점수와 바람 보너스는 실제 능력·승률이 아니다. 진행은 각 브라우저의 `redcliff-v8` localStorage에만 저장한다.

## 검증

- 생성 데이터가 GitHub 원본 `30-data.js`와 바이트 단위로 일치한다.
- DB SHA256은 원본과 동일하다: `7e70ab6a965d22b311feb1b2bf5c49ceb40c1bd16f88ef28aa844f9c4f1c8d05`.
- 기본 명단 위 15 / 오 20 / 촉 7명, 연의 점수 연합 1,255 / 위 467.
- 민감도 연의 합계 215/215, 정사 본문 1인당 203/215.
- 여섯 단계 DOM 실행, 컨트롤·정답 피드백·완료 저장·근거 화면 검증.
- 기본 제갈량→위, 연의 지수 72. 정사·제갈량 바람 가정은 실제 코드에서 56. 상위 문서의 57과 1 차이가 있지만 계산 코드는 변경하지 않았다.
- 문법 검사 통과. 관리형 미리보기 supervisor가 없어 실제 브라우저 시각·모바일 실기 검수는 미완료다. DOM 검사는 브라우저 검수를 대신하지 않는다.

DOM 검사: 별도 테스트 환경에 jsdom을 설치한 뒤 `SAMGUKJI_JSDOM_PATH=<jsdom 모듈 절대 경로> node tests/latest-site.cjs`.

## 저장소에서 실행하기

- `npm run build`: 현재 학습 앱을 `dist/`에 생성한다.
- `npm run build:standalone` 또는 `sh prototype/red-cliff-lab/build.sh`: 위 빌드를 실행하고 국기 에셋을 내장한 `prototype/red-cliff-lab/index.html`도 생성한다.
- `npm run build:next`: 기존 Next.js 프로토타입 빌드 경로를 유지한다.
- 최신 학습 흐름은 `docs/WHATIF_LEARNING_JOURNEY.md`를 기준으로 한다. 이 문서의 초기 가져오기 검증 수치는 원본 계산과의 대조 기록이다.

## 실행 경로 통합

문구는 원본 `src/20-markup.html`과 `src/40-app.js`에도 직접 반영했다. 빌드 시 치환은 제거했으며 `site-copy.json`은 이전 편집 이력이다. 현재 학습 흐름은 `70-learning-journey.js`가 구성한다.

`npm run dev` 또는 `cd frontend && npm run dev`로 실행하면 `/`, `/learn`, `/simulation`이 동일한 최신 학습 HTML을 각각 홈·1단계·실험 화면으로 연다. Next.js는 `LearningPrototype`을 통해 같은 출처의 `/learning/index.html`을 임베드하며, 기존 컴포넌트와 API 코드는 보존한다. `predev`와 `prebuild`에서 공통 소스를 재생성하므로 복사 파일이 낡은 채로 남지 않는다. 직접 열기용 단일 HTML은 `npm run build:standalone`으로 재생성한다.

빌드 결과와 Next.js 공개 HTML은 같은 내용이며, 단일 HTML은 국기 경로만 데이터 URI로 바꾼다. 이 통합은 정적 UI/UX 프로토타입을 연결한 것으로, Next.js 경유 시에도 실시간 FastAPI 연결이 추가되지는 않는다.

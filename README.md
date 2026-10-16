# 삼국지 데이터 원정대

삼국지 인물과 사건 데이터를 바탕으로 데이터 분석을 처음부터 배우고,
역사적 조건을 바꾸어 보는 What-if 실험을 할 수 있는 학습형 프로젝트입니다.

현재 공개 프로토타입의 범위는 **삼국지연의 제43회~제50회 적벽대전**입니다.

## 구성

- `frontend/`: Next.js 기반 적벽대전 이야기·학습실·시뮬레이션 UI
- `backend/`: FastAPI 기반 인물·스토리·관계망 API
- `data/seed/red_cliff.db`: 적벽대전 8개 회차만 포함한 공개용 SQLite seed DB
- `scripts/build_red_cliff_seed.py`: 로컬 전체 DB에서 공개용 seed DB를 재생성하는 스크립트
- `docs/`: PRD, 데이터 구조, 픽셀 캐릭터 제작 규칙

## 빠른 시작

### 백엔드

```cmd
python -m venv .venv
.venv\Scripts\pip install -r backend\requirements.txt
.venv\Scripts\python -m uvicorn backend.main:app --reload --port 8000
```

기본 DB는 저장소에 포함된 `data/seed/red_cliff.db`입니다. 다른 DB를 사용하려면
`SAMGUKJI_DB_PATH` 환경 변수를 설정할 수 있습니다.

### 프런트엔드

```cmd
cd frontend
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`을 엽니다.

## 공개 데이터 범위

seed DB에는 다음 데이터만 포함합니다.

- 연의 제43회~제50회
- 해당 범위 등장 인물 63명
- 인물 등장 기록 186건
- 위 범위 안에서 다시 계산한 인물 동시 등장 관계
- 해당 회차 및 인물에 대응하는 한국어 번역 데이터

전체 원문, 전체 가공 DB, 임시 수집 결과, 로컬 환경 변수와 인증 정보는
`.gitignore`로 제외합니다.


# 전투 콘텐츠 형식

계책록 게임(`prototype/game-demo/index.html`)은 엔진이고, 전투마다 두 가지를 더한다.

1. **전투 설정**: `data/curated/battles.json`의 항목 하나. 계산에 쓰는 값이다.
2. **전투 내용**: `prototype/game-demo/battles/<id>.js`. 화면 문구, 인물 카드, 퀘스트마다 주목할 인물과 지표가 들어간다.

데이터 파일 `prototype/game-demo/battles/<id>-data.js`는 `scripts/build_red_cliff_lab_data.py --battle <id>`가 만든다. 직접 쓰지 않는다.

## 1. 전투 설정 (battles.json)

| 키 | 뜻 |
|---|---|
| `id`, `name`, `year` | 식별자, 한국어 이름, 연도 |
| `chapters` | `[첫 회, 끝 회]` |
| `indicators` | `{키: {ko, chars}}`. 순서가 DB 행 `yy` 배열의 순서다 |
| `score` 고르는 규칙 | **불(火燒焚)·계책(計謀策)은 모든 전투 공통**, 나머지 1개만 그 전투 고유(적벽: 배, 이릉: 진영). 결과를 알고 지표를 고르는 문제를 줄이고 전투끼리 견줄 수 있게 한다 |
| `winner` | 연의에서 실제로 이긴 편(`a`/`b`). 보고서의 '지표 타당도'가 기록 점수와 견준다 |
| `score` | 점수에 쓰는 지표 키들. 2~3개 (민감도 칸 수는 6^n−1) |
| `sides.a`, `sides.b` | `{name, short, factions}`. 지수는 '편 a가 앞서는 정도'(0~100) |
| `dead` | 연의 이야기에서 이 전투 전에 이미 죽은 인물. 사망 연도로 자동 계산하지 않는다 |
| `faction` | 이 전투에서의 소속 보정 `{인물: 세력}`. 보통은 필요 없다: 전투 당시 소속은 `data/curated/인물_소속이력.json`에서 그 전투에 처음 나온 회차의 소속으로 자동으로 정해진다. 이력으로 정할 수 없는 예외만 적는다 |
| `leave_out` | 이름만 나오고 참여하지 않은 인물 |
| `bonus` | `{indicator, points, person, side}`. **점수 지표와 겹치지 않는 그 전투의 결정적 조건**(적벽: 동남풍, 이릉: 숲속 진영)이고 points는 10으로 통일한다. 퀘스트 6의 두 가정 중 하나. `env`면 보너스는 `side` 편에, 그 밖에는 `person`이 속한 편에 붙는다(명단에서 빠지면 보너스 없음) |
| `evidence_people` | 원문 전체 목록을 실을 인물 (파일 크기 때문에 제한) |

모든 등장 인물은 `faction` 보정 뒤 두 편 중 한쪽 세력이거나 `leave_out`이어야 한다. 아니면 데이터 스크립트가 멈춘다.

## 2. 전투 내용 (battles/<id>.js)

`window.CONTENT = {...}`. 문구는 `docs/COPY_STYLE.md`를 따른다. 인물은 키를 한자 이름으로 쓰고, 화면에 보일 이름(`vs`, `say[0]`)은 한국어로 쓴다.

```js
window.CONTENT = {
  id: "red-cliff",
  saveKey: "gyechaek-zg",                    // localStorage 키
  label: "『삼국지연의』 데이터 실험 01 · 赤壁",  // 타이틀 위 작은 글씨
  mapTag: "赤壁 원정 지도",
  mission: "만약 제갈량이 조조의 편이었다면?",
  chaptersLabel: "第四十三回 — 第五十回",
  story: "프롤로그 요약 한 문단",
  storyNote: "『삼국지연의』 제43–50회의 이야기를 학습을 위해 요약했습니다.",
  vs: { a: ["손권", "유비"], b: ["조조"] },  // 프롤로그 대결 화면에 띄울 이름 패
  move: { label: "이야기 속 제갈량", from: "손권·유비 연합군", to: "조조군" },
  predictions: ["…", "…", "…"],           // 처음 짐작 3개
  stages: [ /* 6개 */ {
    short: "지도에 보일 짧은 이름",
    q: "퀘스트 제목(질문)",
    concept: ["분석 개념 이름", "설명"],
    why: "이 퀘스트가 마지막 실험과 어떻게 이어지는지",
    say: ["말하는 사람(한국어)", "소속", "한자 한 글자", "대사"],
    check: { q, opts: [3개], ok: 정답 번호, good: "맞을 때 설명", bad: "틀릴 때 힌트" }
  }],
  q1: {
    title: "활동 1 제목",
    cards: [ /* 4장 */ {
      n: "曹操", fact: "카드에 보일 사실",
      ok: 1 | 0 | null,          // 1=넣기가 정답, 0=빼기가 정답, null=어느 쪽도 됨
      sets: { min: 1 } | { dead: 0 } | null,   // 넣었을 때 명단 기준이 이렇게 바뀜
      say: ["뺐을 때 피드백", "넣었을 때 피드백"]
    }],
    named: "'분석 대상 정하기' 상자 설명"
  },
  q2: { faction: "shu", named: "…" },               // 평균의 함정을 볼 세력
  q3: { example: "周瑜", named: "…" },              // 지표 예시 인물
  q4: { named: "…" },
  q5: { indicator: "fire", person: "曹操", note: "막대 아래 질문", askTitle: "…",
        ask: { opts: [3개], ok, good, bad }, named: "…",
        ev: "{n}의 '{ind}' {v}회는 …" },        // 완료 창에 남는 기록. n=인물, ind=지표, v=횟수
  q6: { mover: "諸葛亮", to: "wei" | null,          // null이면 명단에서 빼기
        moveButton: "⚑ 제갈량을 조조 편으로 옮기기", tokenLabel: "제갈량",
        baseNote: "지금 기록대로 계산했다는 설명(보너스 포함)",
        movedNote: "옮긴 뒤 설명", askTitle: "두 번째 가정을 묻는 제목",
        env: { label: "보너스는 환경 조건이라는 보기", note: "…" },
        follow: { label: "보너스가 그 사람을 따라간다는 보기", note: "…" },
        named: "{e}{ve}{z}{vz}를 쓰는 결론 문장",  // e=env 가정 지수, z=follow 가정 지수, ve/vz: 판정
        ev: "기록대로 {base} → … {e} · … {z}"      // 완료 창에 남는 기록
  },
  report: { result: "기록대로 {base} → … {e} · … {z}",
            interpret: "{moved}…{ve}…{vz}… 해석 문장",
            movedLean: "옮기면(빼면) 지수가 내려갈 때 {moved} 자리에 들어갈 말" }
};
```

판정 문구는 엔진이 `sides.a.short`, `sides.b.short`로 만든다(65 이상 '○○이 크게 앞섬', 45 미만 '○○이 앞섬', 그 사이 '비슷함').
- `q5.evidAt`: 원문 문단을 EVID_ALL[person][indicator]의 몇 번째로 보여 줄지(선택). 없으면 그 지표가 나온 가장 짧은 번역 문단(EVID).

## 3. 의뢰 (`CONTENT.requests`)

퀘스트 6개를 마치면 원정 지도 아래 '의뢰 게시판'이 열린다. 지금은 `type: "compare"` 하나다(적벽 '정사로 센다면?').

- `guessPeople`: 짐작 후보(한자 이름). `cards`: 원문 카드 `{src, who, say, ko, zh?}`. 정사 문장은 `jeongsa_sentences`에서 찾은 원문과 직접 한 번역을 적는다.
- `check`: `{q, opts, ok, why[보기마다 설명]}`. 정답을 고른 뒤에도 다른 보기를 눌러 이유를 볼 수 있다.
- `conclusion`: `{who}{a}{b}{lens}` 자리표시. `who`는 연의 쪽 몫이 가장 크게 늘어난 사람.
- 숫자: 연의 비중은 학습자 명단 안의 등장 문단 비중, 정사 비중은 같은 명단의 정사 문장 비중(`JEONGSA` = [본문, 주석]). '가장 크게 다른 사람' 질문은 0.1%p 안의 동점을 모두 정답으로 받는다(적벽: 조조와 손권이 12.2%p로 같음).

## 4. 가정 설계 (`CONTENT.design`, ★★★)

`{title, q, intro:[화자,소속,한자,대사], condTitle, env, follow, envShort, followShort, limit}`. `env`/`follow`는 보너스 조건의 두 보기(엔진의 `allyIndex` env/zg), `*Short`는 문장 속에 들어갈 짧은 꼴("바람을 날씨로 볼 때"), `limit`은 결론에 고를 수 있는 한계 문장. 후보 인물은 지금 명단에서 점수가 높은 12명을 엔진이 고른다.

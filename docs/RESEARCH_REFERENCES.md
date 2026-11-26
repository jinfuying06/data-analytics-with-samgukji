# 관련 연구 정리 (점수 제도 재검토용)

- 작성: 2026-11-26. 웹 검색으로 찾은 목록이며, 표시한 것 외에는 원문 전체를 읽지 않고 초록·요약 수준에서 확인했다.
- 목적: 계책록의 "인물 이름과 글자가 같은 문단에 나온 횟수 × 가중치" 점수를 어떤 연구에 기대어 고칠 수 있는지 판단한다.

## A. 『삼국지연의』를 직접 계량한 연구

| 연구 | 방법 | 계책록과의 관계 |
|---|---|---|
| 이윤경 외 3인 (2009). 「소설 삼국지 등장인물 네트워크의 동적 변화 분석」. 한국콘텐츠학회논문지 9(4), 364–371. [KCI](https://www.kci.go.kr/kciportal/ci/sereArticleSearch/ciSereArtiView.kci?sereArticleSearchBean.artiId=ART001338387) · [영문 초록](https://www.koreascience.or.kr/article/JAKO200917639068085.page) | 인물 1,119명·관계 3,604개 네트워크, 시간에 따른 변화. 척도 없는·계층적 네트워크 | 우리 관계망(공동등장)과 같은 계열. **시간에 따라 관계가 바뀐다**는 관점은 소속 이력과 맞닿는다 |
| 박경미 외 (2013). 「소설 등장인물의 텍스트 거리를 이용한 사회 구성망 분석」. 한국콘텐츠학회논문지 13(4). [KCI](https://www.kci.go.kr/kciportal/ci/sereArticleSearch/ciSereArtiView.kci?sereArticleSearchBean.artiId=ART001765314) | 인명사전 없이 텍스트에서 인물을 뽑고, **글 안에서의 거리**로 관계 세기를 잼 | 우리는 '같은 문단이면 1'로 센다. 거리 가중은 더 세밀한 대안(대상 작품은 원문 확인 필요) |
| Social Network Data Analysis of Romance of the Three Kingdoms based on Python (IEEE, 2020). [IEEE](https://ieeexplore.ieee.org/document/9339041/) | 분절 → 인물 연결 → PageRank로 중요도, Louvain으로 무리 나누기 | 인물 중요도를 '등장 횟수'가 아닌 **관계망 중심성**으로 재는 예 |
| Coword and Cluster Analysis for the Romance of the Three Kingdoms. [ResearchGate](https://www.researchgate.net/publication/350569484_Coword_and_Cluster_Analysis_for_the_Romance_of_the_Three_Kingdoms) | 인명 공동출현(1,133명·5,844쌍)과 군집 | 공동출현 집계의 기준선 |
| Complicating the Social Networks for Better Storytelling: An Empirical Study of Chinese Historical Text and Novel (arXiv:2008.10835, CityUHK). [arXiv](https://arxiv.org/abs/2008.10835) | **연의와 정사(삼국지)를 같은 방법으로 비교.** 관계망 + 감성어 사전 분석. 연의가 조조에게 부정어를 더 많이 씀 | 우리 '정사로 센다면?' 비교와 같은 문제의식. 서사가 숫자를 어떻게 기울이는지의 근거 |

참고 자료(논문 아님): [Network Analysis of the Romance of Three Kingdoms (Medium)](https://medium.com/data-science/network-analysis-of-the-romance-of-three-kingdoms-5b1c1b84601d) — 이름이 15단어 안에 함께 나오면 관계로 셈(Beveridge & Shan 방식). [three-kingdoms-nlp-lab (GitHub)](https://github.com/Dean0928/three-kingdoms-nlp-lab) — 별명 정규화가 핵심 전처리라는 점, 인물별 언급 수(유비 2,224 · 제갈량 1,901 · 조조 1,037 …).

## B. 이야기 속 인물의 '중요도'를 재는 연구

| 연구 | 요점 | 계책록과의 관계 |
|---|---|---|
| Computational Representations of Character Significance in Novels (arXiv:2601.15508, 2026). [arXiv](https://arxiv.org/abs/2601.15508) | 인물의 중요도는 여러 성분으로 이루어지며 **정의에 따라 순위가 달라진다.** 지니 계수로 주목이 얼마나 쏠렸는지 잼 | **'등장이 많다 = 중요하다'가 아니다**는 근거. 평균의 함정(퀘스트 2)과 직접 연결 |
| Extraction and Analysis of Fictional Character Networks: A Survey (arXiv:1907.02704). [arXiv](https://arxiv.org/abs/1907.02704) | 소설 인물 관계망 추출·분석 방법 총정리 | 방법 선택의 지도 |
| Mining and Modeling Character Networks (Bonato 외, arXiv:1608.00646). [arXiv](https://arxiv.org/abs/1608.00646) | 여러 중심성 지표에서 주인공이 일관되게 높게 나옴 | 중심성 지표 여러 개를 함께 보는 근거 |
| Serialization and the Character-System: Measuring Narrative Concentration in French Fiction (2026). [요약](https://bytez.com/docs/arxiv/2611.31133/paper) | PageRank·지니로 서사의 쏠림을 시대별로 비교 | '진 편이 더 많이 나온다' 같은 쏠림을 수치로 말하는 방법 |

## C. "누가 누구에게 무엇을 했나"를 가르는 연구 (가해·피해 구분)

| 연구 | 요점 | 계책록과의 관계 |
|---|---|---|
| Bamman, Underwood, Smith (2014). A Bayesian Mixed Effects Model of Literary Character. ACL. [PDF](https://aclanthology.org/P14-1035.pdf) | 인물이 **행위자(agent)인 동사와 당하는 쪽(patient)인 동사**를 나눠 인물 유형을 찾음 | 조조·유비의 '불' 문제(불을 지른 쪽/당한 쪽)를 푸는 정석적 방향 |
| Reflecting the Male Gaze (arXiv:2403.17158) | 의미역 표지(ARG0=행위자, ARG1=대상)로 인물의 행위성을 계량 | 같은 방법의 적용 예 |

계책록에 그대로 쓰기는 어렵다(고전 한문용 의미역 분석기가 필요). 대신 **문장 패턴 몇 개(예: "○○放火", "火燒○○")로 가해·피해를 가르는 간이 규칙**이나, 학습자가 원문을 읽고 직접 분류하게 하는 활동으로 옮길 수 있다.

## D. 전투 결과를 수치로 모델링하는 고전 연구 (검색 확인 전, 일반 지식)

- Lanchester (1916)의 전투 방정식: 병력과 전투 효율로 소모를 계산. Engel (1954)이 이오지마 전투 자료로 검증. 역사 전투를 '점수'로 비교하는 계열의 출발점.
- 계책록과의 차이: 이 계열은 **병력·손실 같은 전투 자료**를 쓰고, 우리는 **서사에 나온 횟수**를 쓴다. 우리 점수가 '전력'이 아니라 '서사 비중'이라는 점을 설명할 때 대비 자료로 쓸 수 있다.

## 계책록에 주는 시사점

1. 지금 점수는 연구 분류로 보면 **'서사 비중(narrative prominence)'** 지표다. 승패나 전력을 재지 않는다. 이름을 이렇게 정직하게 붙인다.
2. 중요도는 정의에 따라 달라진다(B). 등장 횟수 하나 대신 **'얼마나 나왔나(언급)'와 '누구와 얽혔나(관계망 중심성)'** 두 렌즈를 비교하게 하면 학습 가치가 커진다. 관계망 데이터는 이미 있다.
3. 가해·피해를 구분하지 못하는 한계(C)는 퀘스트 5의 핵심 교훈으로 이미 쓰고 있다. 다음 단계는 학습자가 원문 문단을 '불을 지름 / 당함 / 상관없음'으로 직접 분류해 점수를 고쳐 보는 활동이다(데이터 정제).
4. 연의와 정사를 같은 방법으로 비교하는 연구(A)가 있으므로, '정사로 센다면?' 의뢰는 학술적으로도 근거가 있는 활동이다.
5. 보고서 결론은 '누가 이겼나'가 아니라 **'이 지표가 실제 승패와 맞았나(타당도)'**로 둔다. 적벽(맞음)과 이릉(맞지 않음)을 나란히 놓는다.
6. 지표 글자는 전투마다 결과를 보고 고르지 말고 **모든 전투에 공통인 기본 묶음**을 두고, 전투 고유의 조건은 점수 밖의 '결정적 조건' 가정으로 다룬다(바람, 숲속 진영 등).

## E. '문학 인물을 능력치로 바꾸기'에 가까운 연구 (2026-11-26 추가 검색)

"삼국지 능력치 배분", "문학을 능력치로 환산" 키워드로 다시 찾았다. 소설 인물을 게임 능력치로 직접 바꾼 연구는 국내외 모두 나오지 않았고, 아래가 가장 가깝다.

| 연구 | 요점 | 계책록과의 관계 |
|---|---|---|
| Evaluating Computational Representations of Character (AustenAlike, arXiv:2408.16131) · [arXiv](https://arxiv.org/html/2408.16131v1) | 인물 표현을 행동·감정·성격·관계 등 여러 범주의 속성으로 구조화 | '능력치 표'에 가장 가까운 틀. 한 숫자 대신 여러 속성으로 인물을 나눈다 |
| CHIRON: Rich Character Representations in Long-Form Narratives (arXiv:2406.10190) · [arXiv](https://arxiv.org/html/2406.10190v1) | 긴 서사에서 인물별 '속성 시트'를 만들고 근거 문장을 붙임 | 근거 문단을 붙여 숫자를 설명하는 우리 방식(돋보기)과 같은 발상 |
| 관상학을 활용한 삼국지 게임 캐릭터 분석 (KoreaScience) · [PDF](https://www.koreascience.or.kr/article/CFKO200921553664532.pdf) | 삼국지 게임 캐릭터의 외형·신분·성격을 관상학으로 분석 | 능력치 산정이 아니라 캐릭터 디자인 연구 |
| 「문학 텍스트의 머신러닝 활용방안 연구」 (KoreaScience) · [PDF](https://www.koreascience.or.kr/article/JAKO202104248005952.pdf) | 문학 텍스트 속 인물을 가상 캐릭터로 구현하는 절차 | 텍스트 → 캐릭터 변환의 국내 사례 |
| 『위험한 관계』 디지털 분석 도구 연구 (KoreaScience) · [링크](https://koreascience.kr/article/JAKO202417657640865.page) | 인물별 낱말 빈도와 심리 언어 범주를 계량 | 인물 특성을 '글자 세기'로 수치화하는 국내 방법론 예 |

게임 능력치(통솔·무력·지력·정치)의 배분 원리를 다룬 학술 자료는 없고, 나무위키 '삼국지 시리즈/능력치' 같은 위키·커뮤니티 글이 대부분이다. 이 글들도 "인물을 몇 개 숫자로 줄이면 평가가 단편화된다"는 한계를 지적하는데, 계책록의 '지표 타당도' 관점과 같은 이야기다.

## 아직 못 찾은 것

- "삼국지를 점수화" 또는 "게임·이야기를 점수화"를 직접 다룬 **국내 학술 논문**은 이번 검색에서 나오지 않았다. 나온 것은 코에이 게임 능력치를 다룬 커뮤니티·위키 글뿐이다(학술 근거로 쓰기 어려움). 예전에 보신 논문의 제목이나 저자 일부가 기억나면 그것으로 다시 찾는 것이 가장 빠르다. RISS·DBpia 원문 검색은 로그인이 필요해 이번에 직접 확인하지 못했다.

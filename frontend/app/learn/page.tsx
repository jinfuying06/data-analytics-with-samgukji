"use client";

import Link from "next/link";
import { useState } from "react";

type CardKind = "question" | "table" | "filter" | "bars" | "compare" | "write";

type LearningCard = {
  step: string;
  eyebrow: string;
  title: string;
  lesson: string;
  task: string;
  kind: CardKind;
};

const cards: LearningCard[] = [
  { step: "01", eyebrow: "분석 질문", title: "질문을 한 문장으로 만들기", lesson: "분석은 차트보다 먼저, 무엇이 궁금한지 정하는 일입니다.", task: "질문 안에서 대상·범위·비교 기준 세 가지를 찾아보세요.", kind: "question" },
  { step: "02", eyebrow: "데이터 읽기", title: "데이터 한 줄을 읽어보기", lesson: "표의 한 줄이 무엇을 뜻하는지 알면 데이터가 덜 어렵습니다.", task: "각 행이 어떤 인물의 어떤 행동을 기록했는지 읽어보세요.", kind: "table" },
  { step: "03", eyebrow: "범위 고르기", title: "필요한 범위만 골라내기", lesson: "분석할 장면과 기준을 좁히면 답이 선명해집니다.", task: "왜 43~50회만 골랐는지 질문과 연결해보세요.", kind: "filter" },
  { step: "04", eyebrow: "모아 세기", title: "인물별로 모아 세기", lesson: "같은 기준으로 모으고 세는 것이 가장 기본적인 집계입니다.", task: "막대 길이와 숫자를 보고 가장 많이 등장한 인물을 찾으세요.", kind: "bars" },
  { step: "05", eyebrow: "해석 점검", title: "비교할 때 조심하기", lesson: "숫자가 보여주는 것과 보여주지 않는 것을 함께 확인합니다.", task: "등장 횟수만으로 능력까지 판단할 수 없는 이유를 생각해보세요.", kind: "compare" },
  { step: "06", eyebrow: "문장 쓰기", title: "결과를 문장으로 설명하기", lesson: "좋은 분석은 숫자를 사람에게 이해되는 문장으로 바꿉니다.", task: "숫자·기준·한계가 모두 들어갔는지 마지막 문장을 확인하세요.", kind: "write" },
];

const bars = [
  { name: "조조", value: 8, width: "100%" },
  { name: "유비", value: 7, width: "88%" },
  { name: "주유", value: 7, width: "88%" },
  { name: "손권", value: 7, width: "88%" },
  { name: "제갈량", value: 7, width: "88%" },
  { name: "노숙", value: 7, width: "88%" },
];

function CardVisual({ kind }: { kind: CardKind }) {
  if (kind === "question") {
    return (
      <div className="learning-action">
        <div className="learning-action-label">이번 카드의 분석 질문</div>
        <div className="learning-question">적벽대전에서 가장 많이 등장한 인물은 누구일까?</div>
        <div className="learning-chip-row">
          <span className="learning-chip">대상: 인물</span>
          <span className="learning-chip">범위: 43~50회</span>
          <span className="learning-chip">기준: 등장 회차 수</span>
        </div>
        <p className="learning-hint">질문에 대상·범위·비교 기준이 들어가면 데이터로 답하기 쉬워집니다.</p>
      </div>
    );
  }

  if (kind === "table") {
    return (
      <div className="learning-action">
        <div className="learning-action-label">원자료에서 보이는 한 줄</div>
        <div className="learning-table-wrap">
          <table className="learning-table">
            <thead><tr><th>회차</th><th>인물</th><th>기록</th></tr></thead>
            <tbody>
              <tr><td>43회</td><td>주유</td><td>전투 준비</td></tr>
              <tr><td>44회</td><td>조조</td><td>유비군과 대치</td></tr>
              <tr><td>48회</td><td>황개</td><td>거짓 항복</td></tr>
            </tbody>
          </table>
        </div>
        <p className="learning-hint">이 예시에서는 한 줄이 “한 회차에 한 인물이 기록된 것”을 뜻합니다.</p>
      </div>
    );
  }

  if (kind === "filter") {
    return (
      <div className="learning-action">
        <div className="learning-action-label">분석에 사용할 범위 고르기</div>
        <div className="learning-filter-grid">
          <div className="learning-filter-box active"><span>회차</span><strong>43회 ~ 50회</strong></div>
          <div className="learning-filter-box"><span>자료</span><strong>연의 기록</strong></div>
          <div className="learning-filter-box"><span>대상</span><strong>인물 등장</strong></div>
        </div>
        <div className="learning-filter-result">필터 결과 <strong>8회차 · 63명</strong></div>
        <p className="learning-hint">필터는 데이터를 지우는 것이 아니라, 지금 질문에 필요한 부분만 잠시 보는 기능입니다.</p>
      </div>
    );
  }

  if (kind === "bars") {
    return (
      <div className="learning-action">
        <div className="learning-action-label">인물별 등장 회차 수</div>
        <div className="learning-bars">
          {bars.map((bar) => (
            <div className="learning-bar-row" key={bar.name}>
              <span className="learning-bar-name">{bar.name}</span>
              <span className="learning-bar-track"><span className="learning-bar-fill" style={{ width: bar.width }} /></span>
              <strong className="learning-bar-value">{bar.value}</strong>
            </div>
          ))}
        </div>
        <p className="learning-hint">이제 질문의 “가장 많이”를 숫자로 비교할 수 있습니다.</p>
      </div>
    );
  }

  if (kind === "compare") {
    return (
      <div className="learning-action learning-compare">
        <div className="learning-compare-card">
          <span className="learning-compare-label">데이터가 말해주는 것</span>
          <strong>조조가 8회로 가장 많이 등장했다.</strong>
          <small>등장 회차 수라는 기준 안에서의 결과</small>
        </div>
        <div className="learning-compare-card caution">
          <span className="learning-compare-label">아직 말할 수 없는 것</span>
          <strong>조조가 가장 유능했다.</strong>
          <small>능력은 별도의 근거와 지표가 필요함</small>
        </div>
      </div>
    );
  }

  return (
    <div className="learning-action">
      <div className="learning-action-label">분석 결과 문장 템플릿</div>
      <blockquote className="learning-template">적벽대전 43~50회에서 <mark>조조</mark>는 <mark>8회</mark> 등장해 가장 높은 빈도를 보였다. 다만 등장 횟수만으로 인물의 능력이나 전투 결과를 판단할 수는 없다.</blockquote>
      <div className="learning-takeaway"><span>핵심</span> 숫자 + 기준 + 한계까지 말하면 분석이 완성됩니다.</div>
    </div>
  );
}

export default function LearnPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [completed, setCompleted] = useState(false);
  const card = cards[activeStep];
  const progress = completed ? 100 : ((activeStep + 1) / cards.length) * 100;

  function goToStep(index: number) {
    setActiveStep(index);
    setCompleted(false);
  }

  function goNext() {
    if (activeStep === cards.length - 1) {
      setCompleted(true);
      return;
    }
    setActiveStep((step) => step + 1);
  }

  return (
    <div className="learning-page">
      <section className="learning-hero">
        <div>
          <div className="eyebrow">초보자 데이터 코스 / 1단계</div>
          <h1 className="page-title">데이터 분석, 적벽에서 시작하기</h1>
          <p className="page-subtitle">코드를 몰라도 괜찮습니다. 질문을 고르고, 데이터를 읽고, 세고, 비교하고, 해석하는 순서를 카드 6장으로 익혀보세요.</p>
        </div>
        <div className="learning-hero-stats" aria-label="학습 범위"><strong>6</strong><span>학습 카드</span><strong>8</strong><span>대상 회차</span><strong>63</strong><span>등장 인물</span></div>
      </section>

      <section className="learning-board" aria-label="카드형 데이터 분석 학습">
        <aside className="learning-sidebar">
          <div className="learning-progress-head"><span>학습 진행도</span><strong>{completed ? cards.length : activeStep + 1} / {cards.length}</strong></div>
          <div className="learning-progress-track"><span style={{ width: `${progress}%` }} /></div>
          <div className="learning-step-list">
            {cards.map((item, index) => (
              <button className={`learning-step ${index === activeStep ? "active" : ""} ${index < activeStep || completed ? "done" : ""}`} key={item.step} onClick={() => goToStep(index)} type="button" aria-current={index === activeStep ? "step" : undefined}>
                <span className="learning-step-number">{index < activeStep || completed ? "✓" : item.step}</span>
                <span><small>{item.eyebrow}</small><strong>{item.title}</strong></span>
              </button>
            ))}
          </div>
          <Link className="learning-back-link" href="/">← 스토리라인으로 돌아가기</Link>
        </aside>

        <div className="learning-main-card">
          {completed ? (
            <div className="learning-complete">
              <div className="learning-complete-icon">★</div>
              <div className="eyebrow">QUEST CLEAR</div>
              <h2>첫 번째 분석 퀘스트 완료!</h2>
              <p>이제 적벽대전 데이터를 질문으로 바꾸고, 범위를 좁히고, 집계하고, 한계까지 설명할 수 있습니다.</p>
              <div className="learning-complete-actions"><button className="pixel-button" type="button" onClick={() => { setActiveStep(0); setCompleted(false); }}>처음부터 다시 보기</button><Link className="pixel-button secondary" href="/simulation">시뮬레이션 맛보기 →</Link></div>
            </div>
          ) : (
            <>
              <div className="learning-card-heading">
                <div><div className="eyebrow">단계 {card.step} / {String(cards.length).padStart(2, "0")} · {card.eyebrow}</div><h2>{card.title}</h2><p>{card.lesson}</p></div>
                <div className="learning-card-stamp">적벽<br />분석</div>
              </div>
              <CardVisual kind={card.kind} />
              <div className="learning-card-footer"><span className="learning-footer-note"><b>지금 할 일</b>{card.task}</span><div className="learning-nav-buttons"><button className="pixel-button secondary" type="button" onClick={() => goToStep(Math.max(0, activeStep - 1))} disabled={activeStep === 0}>← 이전</button><button className="pixel-button" type="button" onClick={goNext}>{activeStep === cards.length - 1 ? "학습 완료하기" : "확인했어요 · 다음 →"}</button></div></div>
            </>
          )}
        </div>
      </section>

      <section className="learning-footer-callout"><div><span className="eyebrow">NEXT MISSION</span><h2>배운 분석 순서를 What-if에 적용해보세요.</h2></div><Link className="pixel-button" href="/simulation">시뮬레이션 탭 보기 →</Link></section>
    </div>
  );
}

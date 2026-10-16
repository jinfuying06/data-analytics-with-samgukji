"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type DefenseLevel = 0 | 1 | 2;

const clamp = (value: number) => Math.max(0, Math.min(100, value));

export default function SimulationPage() {
  const [surrender, setSurrender] = useState(true);
  const [wind, setWind] = useState(true);
  const [defense, setDefense] = useState<DefenseLevel>(0);

  const result = useMemo(() => {
    const fire = clamp(35 + (surrender ? 30 : 0) + (wind ? 25 : 0) - defense * 18);
    const fleetLoss = clamp(fire - 12 + (surrender ? 8 : 0));
    const retreat = clamp(20 + Math.round(fleetLoss * 0.68));
    const allied = clamp(42 + Math.round(fire * 0.5) - defense * 4);
    const outcome = fire >= 78 ? "연합군의 대승" : fire >= 55 ? "연합군의 우세" : fire >= 38 ? "승부를 알 수 없음" : "조조군의 우세";
    return { fire, fleetLoss, retreat, allied, outcome };
  }, [surrender, wind, defense]);

  const changed = !surrender || !wind || defense !== 0;

  return (
    <div className="whatif-page">
      <header className="lab-header">
        <div>
          <span className="section-index">WHAT-IF LAB / EXPERIMENT 001</span>
          <h1>적벽의 조건을 하나씩 바꿔보세요</h1>
          <p>왼쪽에서 역사적 조건을 바꾸면 오른쪽 결과가 즉시 달라집니다. 숫자는 사실이 아니라 현재 규칙으로 계산한 모델 결과입니다.</p>
        </div>
        <Link href="/learn" className="lab-help">처음이라면 학습실부터 →</Link>
      </header>

      <div className="experiment-question">
        <span>오늘의 질문</span>
        <h2>황개의 거짓 항복이 들켰다면, 화공은 성공했을까?</h2>
        <small>현재는 세 가지 조건만 사용하는 첫 번째 규칙 모델입니다.</small>
      </div>

      <main className="experiment-layout">
        <section className="condition-console" aria-labelledby="condition-title">
          <div className="console-title"><span>01</span><div><small>INPUT</small><h2 id="condition-title">역사의 조건</h2></div><button type="button" onClick={() => { setSurrender(true); setWind(true); setDefense(0); }}>기준값 복원</button></div>

          <fieldset className="condition-group">
            <legend><b>거짓 항복</b><span>황개의 선단이 조조군 가까이 접근할 수 있는가</span></legend>
            <div className="choice-pair">
              <button className={surrender ? "active" : ""} type="button" onClick={() => setSurrender(true)}><small>실제 이야기</small>성공</button>
              <button className={!surrender ? "active danger" : ""} type="button" onClick={() => setSurrender(false)}><small>가정 변경</small>발각</button>
            </div>
          </fieldset>

          <fieldset className="condition-group">
            <legend><b>동남풍</b><span>불길이 조조군 함대로 번질 바람이 부는가</span></legend>
            <div className="choice-pair">
              <button className={wind ? "active" : ""} type="button" onClick={() => setWind(true)}><small>실제 이야기</small>분다</button>
              <button className={!wind ? "active danger" : ""} type="button" onClick={() => setWind(false)}><small>가정 변경</small>불지 않는다</button>
            </div>
          </fieldset>

          <fieldset className="condition-group">
            <legend><b>조조군의 화공 대비</b><span>불붙은 선박을 발견하고 끊어낼 준비 수준</span></legend>
            <div className="choice-triple">
              {([0, 1, 2] as DefenseLevel[]).map((level) => (
                <button className={defense === level ? "active" : ""} type="button" key={level} onClick={() => setDefense(level)}>{level === 0 ? "낮음" : level === 1 ? "보통" : "높음"}</button>
              ))}
            </div>
          </fieldset>

          <div className="change-tip"><b>실험 팁</b><span>처음에는 조건 하나만 바꿔야 어떤 변수가 결과에 영향을 줬는지 알기 쉽습니다.</span></div>
        </section>

        <section className="result-console" aria-labelledby="result-title">
          <div className="console-title light"><span>02</span><div><small>OUTPUT</small><h2 id="result-title">계산된 전투 결과</h2></div><em>{changed ? "가상 시나리오" : "기준 역사"}</em></div>

          <div className={`outcome-banner ${result.fire < 55 ? "reversed" : ""}`}>
            <small>현재 모델의 판정</small>
            <strong>{result.outcome}</strong>
            <p>{result.fire >= 78 ? "화공 조건이 충분히 겹쳐 조조군의 지휘와 퇴로가 함께 무너집니다." : result.fire >= 55 ? "화공은 성공하지만 기준 역사만큼 결정적인 피해를 만들지는 못합니다." : result.fire >= 38 ? "양측 모두 결정타가 부족해 전투가 길어질 가능성이 큽니다." : "화공이 힘을 잃으면서 수적 우세를 가진 조조군이 전장을 유지합니다."}</p>
          </div>

          <div className="result-meters">
            <ResultMeter label="화공 성공도" value={result.fire} baseline={90} tone="fire" />
            <ResultMeter label="조조군 함대 피해" value={result.fleetLoss} baseline={86} tone="fleet" />
            <ResultMeter label="조조군 퇴각 피해" value={result.retreat} baseline={78} tone="retreat" />
            <ResultMeter label="손·유 연합 유지" value={result.allied} baseline={87} tone="allied" />
          </div>

          <div className="reason-chain">
            <h3>왜 이렇게 계산됐나요?</h3>
            <div>
              <span className={surrender ? "positive" : "negative"}>거짓 항복 {surrender ? "+30" : "+0"}</span>
              <i>+</i><span className={wind ? "positive" : "negative"}>동남풍 {wind ? "+25" : "+0"}</span>
              <i>−</i><span className={defense > 0 ? "negative" : "neutral"}>화공 대비 {defense * 18}</span>
              <i>=</i><strong>{result.fire}점</strong>
            </div>
            <p>기본 화공 준비도 35점에 선택한 조건을 더하고 뺐습니다. 이 규칙은 이후 근거 데이터가 쌓이면 수정됩니다.</p>
          </div>
        </section>
      </main>

      <footer className="model-notice"><span>!</span><p><strong>이 결과는 역사적 사실이 아닙니다.</strong> 현재 입력과 공개된 규칙을 사용한 학습용 모델의 출력입니다.</p><Link href="/learn">수치화 방법 배우기 →</Link></footer>
    </div>
  );
}

function ResultMeter({ label, value, baseline, tone }: { label: string; value: number; baseline: number; tone: string }) {
  const delta = value - baseline;
  return (
    <div className="result-meter">
      <div><span>{label}</span><b>{value}</b><small className={delta === 0 ? "same" : delta > 0 ? "up" : "down"}>{delta === 0 ? "기준과 같음" : `${delta > 0 ? "+" : ""}${delta}`}</small></div>
      <div className="meter-track"><span className={tone} style={{ width: `${value}%` }} /><i style={{ left: `${baseline}%` }} title={`기준 역사 ${baseline}`} /></div>
    </div>
  );
}

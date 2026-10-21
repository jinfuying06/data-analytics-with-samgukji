import { notFound } from "next/navigation";
import { API_BASE, PersonDetail } from "@/lib/api";

import snapshot from "@/lib/person-snapshot.json";

export function generateStaticParams() {return snapshot.map(p=>({name:p.name}))}

async function getPerson(name: string) {
  if(process.env.STATIC_PROTOTYPE === "1") return snapshot.find(p=>p.name===name) as PersonDetail | undefined;
  const res = await fetch(
    `${API_BASE}/api/persons/${encodeURIComponent(name)}`,
    { cache: "no-store" }
  );
  if (res.status === 404) return null;
  return (await res.json()) as PersonDetail;
}

export default async function PersonPage({
  params,
}: PageProps<"/person/[name]">) {
  const { name } = await params;
  const person = await getPerson(decodeURIComponent(name));
  if (!person) notFound();

  return (
    <div className="person-page">
      <div className="person-header">
        <div>
          <p className="eyebrow">CHARACTER ARCHIVE / FIELD NOTE</p>
          <h1 className="page-title">{person.name}</h1>
          <p className="page-subtitle">정사와 연의에서 발견한 기록을 한 장수의 도감으로 정리했습니다.</p>
        </div>
        <div className="person-stamp">武<br /><span>ARCHIVE</span></div>
      </div>

      <section className="person-overview pixel-panel">
        <div className="person-avatar">{person.name.slice(-1)}</div>
        <div className="person-meta">
          <span className="badge">장수 도감</span>
          {person.jeongsa && <span className="badge red">정사 기록</span>}
          {person.yeonui.length > 0 && <span className="badge blue">연의 {person.yeonui.length}회</span>}
          <p className="meta">이 페이지의 기록을 바탕으로 향후 점수와 What-if 시나리오를 연결할 수 있습니다.</p>
        </div>
        <div className="person-count">
          <strong>{person.yeonui.length}</strong>
          <span>연의 등장</span>
        </div>
      </section>

      <section className="record-panel paper-panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">SOURCE 01 / 正史</p>
            <h2>정사 기록</h2>
          </div>
          {person.jeongsa && <span className="badge red">근거 원문</span>}
        </div>
        {person.jeongsa ? (
          <>
            <p className="record-meta">
              {person.jeongsa.country} · {person.jeongsa.source_juan}
              {person.jeongsa.is_minor_biography && " · 왕공/후비 등 소전"}
            </p>
            <p className="biography">{person.jeongsa.biography}</p>
            {person.jeongsa.mentioned_relatives.length > 0 && (
              <p className="relation-line">
                친족:{" "}
                {person.jeongsa.mentioned_relatives
                  .map((r) => `${r.relation} ${r.name}`)
                  .join(", ")}
              </p>
            )}
            <a href={person.jeongsa.source_url} target="_blank" rel="noreferrer">
              <span className="source-link">↗ 원문 출처 보기</span>
            </a>
          </>
        ) : (
          <p className="empty-state">정사 인물전 없음 · 연의 기록에서만 발견된 인물입니다.</p>
        )}
      </section>

      <section className="record-panel paper-panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">SOURCE 02 / 演義</p>
            <h2>연의 등장 기록</h2>
          </div>
          <span className="badge blue">{person.yeonui.length} CHAPTERS</span>
        </div>
        {person.yeonui.length === 0 && <p className="empty-state">연의 언급 없음</p>}
        {person.yeonui.map((y) => (
          <div className="chapter-block" key={y.chapter}>
            <h3><span className="chapter-number">{String(y.chapter).padStart(3, "0")}</span> {y.chapter_title}</h3>
            <span className="tag-method">태깅: {y.tagging_method}</span>
            {y.excerpt.map((text, i) => (
              <p key={i}>{text}</p>
            ))}
            <a className="source-link" href={y.source_url} target="_blank" rel="noreferrer">↗ 회차 원문</a>
          </div>
        ))}
      </section>

      <section className="locked-panel">
        <span className="lock-icon">✦</span>
        <div>
          <p className="eyebrow">NEXT DATA LAYER</p>
          <h2>이 장수의 점수 카드는 아직 잠겨 있습니다.</h2>
          <p>사건 데이터와 근거 기반 점수화가 연결되면 What-if 원정에 참가할 수 있습니다.</p>
        </div>
        <span className="badge">준비중</span>
      </section>
    </div>
  );
}

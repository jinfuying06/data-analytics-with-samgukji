import Image from "next/image";
import Link from "next/link";
import { API_BASE, PersonListItem, StorylineData } from "@/lib/api";

const storyStages = [
  { number: "01", chapters: "43~44회", title: "연합의 선택", copy: "손권과 유비는 조조에 맞서 싸울 수 있을까?", tone: "alliance" },
  { number: "02", chapters: "45~46회", title: "정보와 기만", copy: "첩보와 계책이 전력의 차이를 흔든다.", tone: "intel" },
  { number: "03", chapters: "47~48회", title: "불붙기 전", copy: "연환계와 거짓 항복이 화공의 길을 연다.", tone: "scheme" },
  { number: "04", chapters: "49회", title: "적벽의 불길", copy: "바람·선단·타이밍이 한순간에 겹친다.", tone: "fire" },
  { number: "05", chapters: "50회", title: "패주와 추격", copy: "승패 이후의 피해가 다음 역사를 만든다.", tone: "retreat" },
] as const;

async function getStoryline() {
  const res = await fetch(`${API_BASE}/api/storylines/red-cliff`, { cache: "no-store" });
  return (await res.json()) as StorylineData;
}

async function getPersons() {
  const res = await fetch(`${API_BASE}/api/persons`, { cache: "no-store" });
  return (await res.json()) as PersonListItem[];
}

function factionClass(country: PersonListItem["country"]) {
  if (country === "魏") return "faction-wei";
  if (country === "蜀") return "faction-shu";
  if (country === "吳") return "faction-wu";
  return "faction-unknown";
}

export default async function HomePage({ searchParams }: PageProps<"/">) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const country = typeof sp.country === "string" ? sp.country : "";
  const [storyline, persons] = await Promise.all([getStoryline(), getPersons()]);
  const personMap = new Map(persons.map((person) => [person.name, person]));
  const featured = storyline.featured_persons.filter((item) => {
    const person = personMap.get(item.name);
    return (!q || item.name.includes(q)) && (!country || person?.country === country);
  });

  return (
    <div className="expedition-home">
      <section className="mission-hero">
        <div className="mission-copy">
          <div className="mission-kicker"><span>첫 번째 원정</span><strong>적벽대전 · 43~50회</strong></div>
          <h1>이야기를 데이터로<br />바꾸고, <em>역사의 조건을<br />다시 고른다.</em></h1>
          <p>삼국지를 읽는 데서 끝내지 않고, 사건을 숫자로 정리하고 조건을 바꿔 결과를 비교해보는 데이터 분석 놀이터입니다.</p>
          <div className="mission-actions">
            <Link className="primary-action" href="/learn"><span>처음이라면</span>10분 분석 퀘스트 시작 <b>→</b></Link>
            <Link className="text-action" href="/simulation">바로 What-if 실험하기 →</Link>
          </div>
          <div className="mission-route" aria-label="서비스 이용 순서">
            <span><b>1</b> 이야기를 고른다</span><i>→</i><span><b>2</b> 근거를 수치화한다</span><i>→</i><span><b>3</b> 조건을 바꾼다</span>
          </div>
        </div>

        <div className="battle-stage" aria-label="주유와 조조가 마주한 적벽 전장">
          <div className="stage-sky"><span className="pixel-sun" /></div>
          <div className="stage-label">오늘의 분석 질문</div>
          <div className="stage-question">황개의 거짓 항복이<br />조조에게 들켰다면?</div>
          <div className="fighter fighter-left">
            <Image unoptimized src="/sprites/red-cliff/zhou-yu/zhou-yu-idle.gif" alt="주유" width={420} height={250} />
            <span>주유 · 오</span>
          </div>
          <div className="versus">VS</div>
          <div className="fighter fighter-right">
            <Image unoptimized src="/sprites/red-cliff/cao-cao/cao-cao-idle.gif" alt="조조" width={420} height={250} />
            <span>조조 · 위</span>
          </div>
          <div className="stage-water" aria-hidden="true"><span /><span /><span /></div>
        </div>
      </section>

      <section className="start-panel" aria-labelledby="start-title">
        <div className="start-heading">
          <span className="section-index">START HERE</span>
          <div><h2 id="start-title">무엇을 해보고 싶나요?</h2><p>정답은 없습니다. 지금 내게 맞는 입구를 고르세요.</p></div>
        </div>
        <div className="start-options">
          <Link className="start-option learn-option" href="/learn">
            <span className="option-number">01</span>
            <div><small>데이터 분석이 처음이라면</small><h3>이야기를 데이터로 만드는 법부터</h3><p>질문 만들기, 분류, 집계, 해석을 카드 6장으로 배웁니다.</p></div>
            <b>학습실 입장 →</b>
          </Link>
          <Link className="start-option sim-option" href="/simulation">
            <span className="option-number">02</span>
            <div><small>결과부터 만져보고 싶다면</small><h3>적벽의 조건을 직접 바꿔보기</h3><p>거짓 항복과 동남풍을 바꾸고 기준 역사와 비교합니다.</p></div>
            <b>실험실 입장 →</b>
          </Link>
        </div>
      </section>

      <section className="story-arc" aria-labelledby="story-title">
        <div className="section-title-row">
          <div><span className="section-index">RED CLIFF / STORY MAP</span><h2 id="story-title">적벽대전은 다섯 번의 선택으로 흐릅니다</h2></div>
          <p>원문 {storyline.chapter_count}회차 · 등장 인물 {storyline.person_count}명</p>
        </div>
        <div className="stage-track">
          {storyStages.map((stage) => (
            <article className={`story-stage-card ${stage.tone}`} key={stage.number}>
              <div className="story-stage-meta"><span>{stage.number}</span><small>{stage.chapters}</small></div>
              <h3>{stage.title}</h3>
              <p>{stage.copy}</p>
            </article>
          ))}
        </div>
        <div className="story-note"><strong>왜 8개 회차를 5단계로 묶었나요?</strong><span>회차를 나열하기보다 분석할 수 있는 사건 단위로 다시 정리했습니다. 이것이 첫 번째 데이터 가공입니다.</span></div>
      </section>

      <section className="cast-section" aria-labelledby="cast-title">
        <div className="section-title-row">
          <div><span className="section-index">PEOPLE / EVIDENCE</span><h2 id="cast-title">이 전투를 움직인 인물</h2></div>
          <p>숫자를 누르면 등장 회차 근거를 볼 수 있어요.</p>
        </div>
        <form className="cast-filter" method="get">
          <input type="search" name="q" placeholder="인물 이름 검색" defaultValue={q} aria-label="인물 이름 검색" />
          <select name="country" defaultValue={country} aria-label="세력 선택">
            <option value="">전체 세력</option><option value="魏">위</option><option value="蜀">촉</option><option value="吳">오</option>
          </select>
          <button type="submit">찾기</button>
        </form>
        <div className="cast-grid">
          {featured.map((item) => {
            const person = personMap.get(item.name);
            return (
              <Link className={`cast-card ${factionClass(person?.country ?? null)}`} href={`/person/${encodeURIComponent(item.name)}`} key={item.name}>
                <span className="cast-seal">{item.name.slice(-1)}</span>
                <span><strong>{item.name}</strong><small>{person?.country === "魏" ? "위" : person?.country === "蜀" ? "촉" : person?.country === "吳" ? "오" : "기타"}</small></span>
                <b>{item.chapter_count}<small>회 등장</small></b>
              </Link>
            );
          })}
          {featured.length === 0 && <p className="empty-result">조건에 맞는 주요 인물이 없습니다.</p>}
        </div>
      </section>
    </div>
  );
}

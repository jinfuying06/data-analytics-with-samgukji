
/* ===== helpers ===== */
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const ic=(id,cls="ico")=>`<svg class="${cls}" aria-hidden="true"><use href="#i-${id}"/></svg>`;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const jo=(w,a,b)=>{const c=w.charCodeAt(w.length-1)-0xAC00;return c>=0&&c<11172&&c%28?a:b};
const SRC={yy:"연의",jb:"정사 본문",jn:"정사 주석"};
const srcB=(k,t)=>`<span class="sb ${k}">${t||SRC[k]}</span>`;
const FN={wei:"위",wu:"오",shu:"촉"},FS=["wei","wu","shu"];
const KI={ship:0,fire:1,plan:2,wind:3},KN={ship:"수전",fire:"화공",plan:"계책",wind:"바람"};
const KW={ship:"船·舟·水軍·艦",fire:"火·燒·焚",plan:"計·謀·策",wind:"風"};
const DEAD={袁紹:202,呂布:198,孫策:200,袁術:199,董卓:192,郭嘉:207,劉表:208};
/* DB rows: [hanja, ko, faction, ch[8], yy[4], jb[4], jn[4]] */
const PP={};DB.forEach(r=>PP[r[0]]={id:r[0],ko:r[1],f:r[2],ch:r[3],yy:r[4],jb:r[5],jn:r[6],chs:r[3].filter(x=>x).length,pa:r[3].reduce((a,b)=>a+b,0)});
const NAMES=DB.map(r=>r[0]);
const fcol=f=>`var(--${f})`;
const fmt=x=>Number.isInteger(x)?x:x.toFixed(1);
const median=a=>{if(!a.length)return 0;const s=[...a].sort((x,y)=>x-y),m=s.length>>1;return s.length%2?s[m]:(s[m-1]+s[m])/2};

/* ===== state ===== */
const KEY="redcliff-v8";
let S={done:{},t:{},rule:{min:2,dead:1},w:{ship:3,fire:3,plan:2}};
try{const s=JSON.parse(localStorage.getItem(KEY)||"null");if(s&&s.t)S=s}catch{}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch{}};
const tk=(m,k)=>!!(S.t[m]&&S.t[m][k]);
let TASKS=[],cur=0;
function setT(m,k){S.t[m]=S.t[m]||{};if(S.t[m][k])return;S.t[m][k]=1;save();drawTasks()}
const roster=()=>NAMES.filter(n=>PP[n].chs>=S.rule.min&&!(S.rule.dead&&DEAD[n]));
const scoreOf=(n,lens,w=S.w)=>{const v=lens==="jb"?PP[n].jb:lens==="all"?PP[n].jb.map((x,i)=>x+PP[n].jn[i]):PP[n].yy;return w.ship*v[0]+w.fire*v[1]+w.plan*v[2]};

/* ===== course ===== */
const ST=[
  {id:"s1",q:"누구를 분석 대상에 포함할까요?",short:"분석 대상 정하기",skill:"분석 대상과 기준",hz:"第四十三回 — 第五十回",where:"소설 『삼국지연의』 적벽 편",fx:"mist",
   why:"인물을 비교하려면 먼저 분석 대상과 포함 기준을 정해야 합니다. 기록에 이름이 나온다는 사실만으로 실제 참전을 확인할 수는 없습니다.",gain:"대상 선정 기준이 이후의 모든 계산에 미치는 영향",
   say:["장간 · 위","f-jg","蔣","어떤 기준으로 인물을 명단에 포함해야 할까요?"]},
  {id:"s2",q:"평균만으로 진영을 비교해도 될까요?",short:"평균의 함정",skill:"평균과 중앙값",hz:"第四十三回",where:"진영별 등장 문단 수 비교",fx:"mist",
   why:"합계나 평균만 보면 일부 인물의 큰 값이 전체의 특징처럼 보일 수 있습니다. 중앙값과 분포를 함께 살펴볼 필요가 있습니다.",gain:"평균의 한계와 중앙값·분포를 함께 읽는 방법",
   say:["조조 · 위","f-cao","曹","인물 수나 평균이 높으면 모든 인물이 고르게 많이 등장한다고 볼 수 있을까요?"]},
  {id:"s3",q:"기록에서 비교 지표를 어떻게 만들까요?",short:"비교 지표 만들기",skill:"지표 설계와 가중치",hz:"第四十六回 — 第四十九回",where:"수전 · 화공 · 계책",fx:"embers",
   why:"수전·화공·계책 관련 글자가 인물의 이름과 함께 나온 횟수를 셉니다. 이를 지표로 만들고, 각 지표에 줄 점수를 정합니다.",gain:"텍스트에서 지표를 만들고 가중치를 적용하는 방법",
   say:["주유 · 오","f-zhou","周","수전과 화공에 관한 기록을 같은 기준으로 비교하려면 무엇을 세어야 할까요?"]},
  {id:"s4",q:"가중치를 바꾸어도 결론이 유지될까요?",short:"결론의 안정성 확인",skill:"민감도 분석",hz:"第四十八回",where:"215가지 점수 규칙",fx:"mist",
   why:"가중치는 분석자가 선택한 조건입니다. 가중치와 비교 방식을 바꾸면서 결론이 얼마나 달라지는지 확인합니다.",gain:"가정의 변화에 따라 결론이 달라지는 정도",
   say:["노숙 · 오","f-lu","魯","수전과 화공에 부여한 점수를 바꾸어도 같은 결론이 나올까요?"]},
  {id:"s5",q:"이 지표는 무엇을 설명할 수 있을까요?",short:"지표 검증",skill:"지표의 한계와 출처",hz:"第四十九回",where:"연의와 정사의 대조",fx:"embers",
   why:"지표가 실제로 무엇을 세었는지 확인합니다. 근거 문단을 읽고 소설과 역사책을 비교하며, 수치로 알 수 있는 범위를 살펴봅니다.",gain:"지표의 한계와 자료에 따른 결과의 차이",
   say:["황개 · 오","f-huang","黃","불을 지른 장면과 불에 피해를 입은 장면을 이 지표가 구분할 수 있을까요?"]},
  {id:"s6",q:"인물의 소속을 바꾸면 결과는 어떻게 달라질까요?",short:"조건 변경 실험",skill:"시뮬레이션",hz:"假 如",where:"가정을 바꾼 비교",fx:"fire",
   why:"앞에서 정한 대상·지표·가중치를 유지하고, 인물의 소속이나 바람에 관한 가정만 바꾸어 계산합니다.",gain:"사용한 자료와 가정이 실험 결과에 미치는 영향",
   say:["조조 · 위","f-cao","曹","인물의 소속을 바꿀 때, 그 인물과 관련된 환경 조건도 함께 바꾸어야 할까요?"]}
];
const VIEWS=[{id:"home"},...ST,{id:"src"}];

/* ===== chrome ===== */
function drawChrome(){
  const a=(id,hz,b,s,i,done)=>`<li><a href="#${id}" class="${done?"done":""}" ${cur===i?'aria-current="page"':""}><span class="st">${done?ic("check"):hz}</span><span><b>${b}</b><small>${s}</small></span></a></li>`;
  $("#navH").innerHTML=a("home","始","처음 화면","학습 과정 안내",0,false)+a("lab","假","가정 실험","궁금한 질문부터 바로 실험",VIEWS.findIndex(v=>v.id==="lab"),false);
  $("#navE").innerHTML=ST.map((e,i)=>a(e.id,i+1,e.short,e.skill,i+1,S.done[i+1])).join("");
  $("#navS").innerHTML=a("src","典","자료와 집계 기준","데이터와 집계 기준",7,false);
  const n=Object.keys(S.done).length;
  $("#progTxt").textContent=`마친 장 ${n} / 6`;$("#progBar").style.width=n/6*100+"%";
  $("#board").innerHTML=ST.map((e,i)=>`<li class="${S.done[i+1]?"":"ph"}"><a href="#${e.id}"><span class="bno">${i+1}</span><span class="bh">${e.q}<small>${S.done[i+1]?esc(S.done[i+1]):e.skill}</small></span>${S.done[i+1]?`<span class="vchip v-t">완료</span>`:`<span class="vchip">진행 전</span>`}</a></li>`).join("");
  $("#boardSum").innerHTML="";
  $("#nbBadge").textContent=n;$("#nbBadge").hidden=!n;$("#nbCountTop").textContent=`${n}/6`;
  ["tabH","tabS","tabL"].forEach(id=>$("#"+id).removeAttribute("aria-current"));
  $(VIEWS[cur]?.id==="lab"?"#tabL":cur===7?"#tabS":"#tabH").setAttribute("aria-current","page");
}
function notes(open){$("#notebook").classList.toggle("open",open);$("#scrim").classList.toggle("open",open)}
document.addEventListener("click",e=>{if(e.target.closest("[data-open-notes]"))notes(true);else if(e.target.closest("[data-close-notes]"))notes(false);else if(e.target.closest("#board a"))notes(false)});
document.addEventListener("keydown",e=>{if(e.key==="Escape")notes(false)});
function route(){const h=(location.hash||"").slice(1);let i=VIEWS.findIndex(v=>v.id===h.split("?")[0]);if(i<0)i=0;cur=i;S.last=i;save();notes(false);drawChrome();stopFx();RENDER[i]();startHeroFx();window.scrollTo?.({top:0})}
addEventListener("hashchange",route);
// Explicit internal navigation keeps pager targets inside this learning app, including embeds.
document.addEventListener("click",e=>{
 const link=e.target.closest?.(".pager a,.stepper a");
 if(!link||e.defaultPrevented||e.button!==0||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey||link.target==="_blank")return;
 const target=link.getAttribute("href");
 if(!target?.startsWith("#")||!VIEWS.some(v=>v.id===target.slice(1)))return;
 e.preventDefault();history.pushState(null,"",target);route();
 const title=$("#main h1");if(title){title.setAttribute("tabindex","-1");title.focus({preventScroll:true})}
});

/* ===== shared ui ===== */
function drawTasks(){const el=$("#tasks");if(!el)return;el.innerHTML=TASKS.map(([m,k,l])=>`<span class="task ${tk(m,k)?"ok":""}"><span class="tk">${tk(m,k)?ic("check"):""}</span>${l}</span>`).join("");const q=$("#qbox");if(q)q.classList.toggle("locked",!TASKS.every(([m,k])=>tk(m,k)))}
const step=(n,title,sub,body)=>`<section class="stepsec"><header class="step-h"><span class="sno">활동 ${n}</span><h2>${title}</h2>${sub?`<p>${sub}</p>`:""}</header>${body}</section>`;
function hero({hz,where,title,sub,fx,say}){return `<section class="scene-hero" data-fx="${fx}"><canvas class="fx" aria-hidden="true"></canvas><div class="lb" aria-hidden="true"></div><div class="hero-in"><p class="hero-meta"><span class="hz">${hz}</span><span>${where}</span></p><h1>${title}</h1><p class="hero-sub">${sub}</p>${say?`<figure class="subtitle"><blockquote>${say[3]}</blockquote><figcaption><span class="face ${say[1]}" aria-hidden="true">${say[2]}</span>${say[0]} · 학습용 질문</figcaption></figure>`:""}</div></section>`}
function stage(i,tasks,steps,chk){
  const e=ST[i-1];TASKS=tasks;
  const stepper=`<nav class="stepper" aria-label="장 목록">${ST.map((x,j)=>`<a href="#${x.id}" class="${S.done[j+1]?"done":""}" ${j+1===i?'aria-current="page"':""}><span class="st">${S.done[j+1]?ic("check"):j+1}</span>${x.short}</a>`).join("")}</nav>`;
  const nsteps=steps.split('class="stepsec"').length;
  $("#main").innerHTML=`${stepper}${hero({hz:e.hz,where:e.where,title:e.q,sub:`<span class="reg rec">${i}장 / 6</span>배우는 것 · ${e.skill}`,fx:e.fx,say:e.say})}
  <section class="card brief3"><div><span>이번 질문</span><b>${e.q}</b></div><div><span>분석의 목적</span><p>${e.why}</p></div><div><span>학습 목표</span><p>${e.gain}</p></div></section>
  <div class="card taskbar"><div class="tasks" id="tasks" aria-label="먼저 수행할 활동"></div><button class="btn ghost nb-open" data-open-notes>${ic("note")}학습 기록 <span class="num">${Object.keys(S.done).length}/6</span></button></div>
  ${steps}${step(nsteps,"학습 내용 확인하기","",`<section class="card q" id="qbox"><div id="vbox" style="display:grid;gap:12px"></div></section>`)}
  <div class="pager">${i>1?`<a class="btn ghost" href="#${ST[i-2].id}" aria-label="이전: ${i-1}장">${ic("left")}${i-1}장으로 이동</a>`:`<a class="btn ghost" href="#home">${ic("left")}처음 화면</a>`}${i<6?`<a class="btn" href="#${ST[i].id}" aria-label="다음: ${i+1}장">${i+1}장으로 이동${ic("right")}</a>`:`<a class="btn" href="#home">처음 화면${ic("right")}</a>`}</div>`;
  $$(".pager a").forEach(a=>a.style.textDecoration="none");drawTasks();
  const box=$("#vbox");
  box.innerHTML=`<h3>${chk.q}</h3><p class="lockline">${ic("lock")}위의 활동을 모두 마치면 답을 선택할 수 있습니다.</p><div class="opts">${chk.opts.map((o,k)=>`<button class="opt" data-i="${k}"><span class="k">${"ABC"[k]}</span><span>${o}</span></button>`).join("")}</div><div class="fbx" aria-live="polite"></div>`;
  const show=k=>{const ok=k===chk.ok;box.querySelectorAll(".opt").forEach(o=>{o.classList.remove("wrong");if(ok&&+o.dataset.i===chk.ok)o.classList.add("right")});if(!ok)box.querySelector(`.opt[data-i="${k}"]`).classList.add("wrong");
    const ev=typeof chk.ev==="function"?chk.ev():chk.ev;
    box.querySelector(".fbx").innerHTML=ok?`<div class="fb"><b>그렇게 읽을 수 있겠군요.</b> ${chk.good}</div><div class="callout"><b>학습 기록에 저장됨</b> ${esc(ev)}</div>`:`<div class="fb bad"><b>기록을 다시 살펴보시지요.</b> ${chk.bad}</div>`;
    if(ok){box.querySelectorAll(".opt").forEach(o=>o.disabled=true);S.done[i]=ev;save();drawChrome()}};
  box.querySelector(".opts").addEventListener("click",ev=>{const b=ev.target.closest(".opt");if(!b||b.disabled||!TASKS.every(([m,k])=>tk(m,k)))return;show(+b.dataset.i)});
  if(S.done[i])show(chk.ok);
}
function bars(el,items,max,unit=""){el.innerHTML=items.map(it=>`<div class="bar"><span><i class="dot" style="background:${it.c}"></i>${it.label}</span><span class="track"><span class="fill" style="width:${max?Math.max(0,it.v)/max*100:0}%;background:${it.c}"></span></span><span class="v">${fmt(it.v)}${unit}</span></div>`).join("")}
const seg=(id,opts,val,label)=>`<div class="seg" id="${id}" role="group" aria-label="${label}">${opts.map(([v,t])=>`<button data-v="${v}" aria-pressed="${String(val)===String(v)}">${t}</button>`).join("")}</div>`;
const onSeg=(id,fn)=>$("#"+id).addEventListener("click",e=>{const b=e.target.closest("button");if(!b||b.disabled)return;$$("#"+id+" button").forEach(x=>x.setAttribute("aria-pressed",x===b));fn(b.dataset.v)});
const groups=g=>g==="ally"?[["wei","위",fcol("wei")],["ally","오·촉 연합","linear-gradient(90deg,var(--wu),var(--shu))"]]:FS.map(f=>[f,FN[f],fcol(f)]);
const inG=(n,g)=>g==="ally"?PP[n].f!=="wei":PP[n].f===g;

/* ===== HOME ===== */
function home(){
  TASKS=[];const n=Object.keys(S.done).length,next=ST.findIndex((e,i)=>!S.done[i+1]);
  $("#main").innerHTML=`${hero({hz:"赤 壁",where:"208년 겨울 · 장강",title:"삼국지의 기록으로 무엇을 분석할 수 있을까요?",sub:`<span class="reg rec">삼국지로 배우는 데이터 분석</span>적벽대전 편`,fx:"embers"})}
  <section class="card pane home-lead"><p>『삼국지연의』와 정사 『삼국지』의 기록을 같은 기준으로 세어 비교합니다. 분석 대상을 정하고, 평균과 지표를 살펴본 뒤, 조건을 바꾸어 결과를 확인합니다. 총 6장이며 장별로 약 5분이 걸립니다.</p>
    <a class="btn" href="#${ST[next<0?0:next].id}" style="text-decoration:none">${n?(n===6?"전체 과정 다시 보기":`${next+1}장 이어하기`):"1장 시작하기"}${ic("right")}</a></section>
  <section class="card pane primer"><div class="pane-h"><h2>${ic("book")}시작 전에 알아두기</h2><a class="meta" href="#src">데이터 더 보기</a></div>
    <div class="primer-row"><div><span>적벽대전</span><p>조조군과 손권·유비 연합군이 장강에서 맞선 전투입니다. 이 학습에서는 위·오·촉을 인물의 소속을 구분하는 표시로 사용합니다. 촉 표시는 당시 촉한이 존재했다는 뜻이 아닙니다.</p></div>
    <div><span>사용하는 기록</span><p>${srcB("yy","삼국지연의")} 삼국 시대를 소재로 한 소설입니다. 전체 120회 중 적벽대전 주변 이야기를 다룬 <b>43~50회</b>를 사용합니다.</p><p>${srcB("jb","정사 삼국지")} 인물별 전기인 열전으로 구성된 역사책입니다. 소설과 구분하여 비교 자료로 사용합니다.</p></div></div>
    <ol class="chap-strip">${[["43","설전"],["44","주유 설득"],["45","장간의 실수"],["46","화살 10만 개"],["47","거짓 항복"],["48","강 위의 잔치"],["49","동남풍과 불"],["50","화용도"]].map(([a,b])=>`<li><b class="num">${a}회</b><span>${b}</span></li>`).join("")}</ol></section>
  <section class="eplist">${ST.map((e,i)=>`<a class="card epcard" href="#${e.id}"><span class="epno">${i+1}장 · ${e.skill}</span><b>${e.q}</b>${S.done[i+1]?`<span class="vchip v-t">완료</span>`:`<span class="vchip">진행 전</span>`}</a>`).join("")}</section>
  ${n===6?`<section class="card pane"><div class="pane-h"><h2>${ic("note")}여섯 장에서 학습 기록</h2></div><ol class="sumlist">${ST.map((e,i)=>`<li><span class="vchip v-t">${i+1}</span><span><b>${e.q}</b><small>${esc(S.done[i+1]||"")}</small></span></li>`).join("")}</ol><button class="btn ghost" id="reset">${ic("reset")}학습 기록 초기화하기</button></section>`:""}`;
  $("#reset")&&($("#reset").onclick=()=>{S={done:{},t:{},rule:{min:2,dead:1},w:{ship:3,fire:3,plan:2},seenIntro:1};save();location.hash="#s1";route()});
}

/* ===== S1 참전 명단 ===== */
function s1(){
  const L=S.t.s1x=S.t.s1x||{};
  stage(1,[["s1","look","기록 구조 확인하기"],["s1","min","등장 기준 바꾸기"],["s1","dead","사망 인물 포함 여부 바꾸기"]],
    step(1,"기록의 구조 살펴보기","한 행에는 인물 이름, 등장 회차, 해당 인물의 이름이 포함된 문단이 저장되어 있습니다. 공개 데이터에는 인물 63명의 기록 186건이 있습니다.",
    `<section class="card pane"><div class="pane-h"><h2>${ic("table")}등장 기록 186건 중 일부</h2>${srcB("yy","연의 43–50회")}</div>
      <div class="tscroll"><table class="data rec"><thead><tr><th>인물</th><th>진영</th><th class="n">회차</th><th class="n">문단 수</th><th>근거 문단 발췌 · 한국어 번역</th></tr></thead><tbody id="recs"></tbody></table></div>
      <button class="btn ghost" id="more">${ic("search")}다른 기록 보기</button></section>`)+
    step(2,"분석 대상의 포함 기준 정하기","최소 등장 회차 수와 사망 인물 포함 여부를 정합니다. 여기서 선택한 명단을 2~6장의 계산에 사용합니다.",
    `<div class="cols"><section class="card pane"><div class="pane-h"><h2>${ic("sliders")}대상 선정 기준</h2></div>
      <div class="field">최소 몇 회에 등장한 인물을 포함할까요?${seg("rMin",[[1,"1회 이상"],[2,"2회 이상"],[3,"3회 이상"],[4,"4회 이상"]],S.rule.min,"최소 등장 회차 수")}</div>
      <div class="field">사망 인물로 분류된 인물을 포함할까요?${seg("rDead",[[1,"제외"],[0,"포함"]],S.rule.dead,"사망 인물 포함 여부")}</div>
      <p class="cap">이름이 언급된 기록에는 이미 사망한 인물도 포함될 수 있습니다. 사망 인물 제외 기준은 현재 데이터의 분류를 따르며, 전투 참여를 확정하는 기준은 아닙니다. 진영은 정사에서 사용한 위·촉·오 분류를 따릅니다.</p>
      <div class="callout" id="rRead" aria-live="polite"></div></section>
      <section class="card pane"><div class="pane-h"><h2>${ic("note")}현재 분석 대상</h2><span class="meta" id="rCnt"></span></div><div class="roster" id="roster"></div></section></div>`),
    {q:"분석 대상 명단을 가장 잘 설명한 것은 무엇일까요?",opts:["자료가 분석 대상 명단을 하나로 정해 줍니다.","선택한 기준에 따라 분석 대상이 달라집니다.","이름이 나온 인물은 모두 실제로 참전했습니다."],ok:1,
     good:"같은 기록이어도 누구를 포함하느냐에 따라 숫자가 달라지지요. 결과와 함께 선정 기준도 남겨 주십시오.",bad:"등장 기준과 사망 인물 포함 여부를 바꿀 때, 명단의 인원수가 어떻게 달라지는지 확인해 보세요.",
     ev:()=>{const r=roster();return `대상 선정 기준(${S.rule.min}회 이상${S.rule.dead?", 사망 인물 제외":""}) → 위 ${r.filter(n=>PP[n].f==="wei").length} · 오 ${r.filter(n=>PP[n].f==="wu").length} · 촉 ${r.filter(n=>PP[n].f==="shu").length}명`}});
  const pool=Object.keys(EVID).filter(n=>PP[n]);let off=0;
  function recs(){const pick=[0,1,2].map(j=>pool[(off+j*7)%pool.length]);
    $("#recs").innerHTML=pick.map(n=>{const e=Object.values(EVID[n])[0];return `<tr><td>${PP[n].ko}</td><td><i class="dot" style="background:${fcol(PP[n].f)}"></i>${FN[PP[n].f]}</td><td class="n">${e[0]}</td><td class="n">${PP[n].ch[e[0]-43]}</td><td class="excerpt">${esc(e[1].slice(0,90))}…</td></tr>`}).join("")}
  recs();$("#more").onclick=()=>{off+=3;setT("s1","look");recs()};
  function d(){
    const r=roster(),all=NAMES.length;
    $("#rCnt").textContent=`${r.length}명 / 전체 ${all}명`;
    $("#roster").innerHTML=FS.map(f=>{const m=r.filter(n=>PP[n].f===f);return `<div class="rgroup"><p><i class="dot" style="background:${fcol(f)}"></i>${FN[f]} <b class="num">${m.length}</b>명</p><div class="chips2">${m.map(n=>`<span class="pchip">${PP[n].ko}<small class="num">${PP[n].chs}회</small></span>`).join("")}</div></div>`}).join("");
    const out=NAMES.filter(n=>!r.includes(n));
    $("#rRead").innerHTML=`제외된 인물 ${out.length}명. ${S.rule.dead?"사망 인물로 분류된 대상은 제외했습니다. ":"사망 인물로 분류된 대상도 포함했습니다. "}${S.rule.min>1?`${S.rule.min}회 미만 등장한 인물은 선정 기준에 따라 제외했습니다.`:"한 회에만 등장한 인물도 포함했습니다."}`;
  }
  onSeg("rMin",v=>{S.rule.min=+v;setT("s1","min");save();d()});
  onSeg("rDead",v=>{S.rule.dead=+v;setT("s1","dead");save();d()});
  d();
}

/* ===== S2 평균의 함정 ===== */
function s2(){
  const L=S.t.s2x=S.t.s2x||{stat:"sum",g:"three",drop:0};
  stage(2,[["s2","sum","합계 확인하기"],["s2","mean","평균 확인하기"],["s2","med","중앙값 확인하기"],["s2","drop","최댓값 제외하기"]],
    step(1,"합계·평균·중앙값 비교하기","인물별로 이름이 포함된 문단 수를 셉니다. 이를 진영별 합계·1인당 평균·중앙값으로 비교합니다. 이 수치는 전투 능력이 아닌 기록 속 등장 정도를 나타냅니다.",
    `<section class="card pane"><div class="pane-h"><h2>${ic("chart")}진영별 등장 문단 수</h2>${srcB("yy","연의 43–50회")}</div>
      <div class="ctrls">${seg("st",[["sum","합계"],["mean","1인당 평균"],["med","중앙값"]],L.stat,"요약 방식")}${seg("gp",[["three","위·오·촉"],["ally","위·연합 비교"]],L.g,"묶음")}</div>
      <div class="bars" id="sbars"></div><div class="callout" id="sread" aria-live="polite"></div></section>`)+
    step(2,"인물별 분포 살펴보기","각 점은 인물 한 명의 등장 문단 수를 나타냅니다. 진영별 최댓값을 제외한 뒤 평균과 중앙값이 어떻게 바뀌는지 살펴봅니다.",
    `<section class="card pane"><div class="pane-h"><h2>${ic("table")}인물별 분포</h2><label class="toggle"><input type="checkbox" id="drop" ${L.drop?"checked":""}> 진영별 최댓값 제외하기</label></div>
      <div id="strip" class="strip"></div><p class="cap">점 하나는 인물 한 명을, 가로축은 이름이 포함된 문단 수를 나타냅니다. 점에 마우스를 올리거나 선택하면 이름과 수치를 확인할 수 있습니다.</p></section>`),
    {q:"기본 명단에서 촉의 1인당 평균이 높은 주된 이유는 무엇일까요?",opts:["촉의 모든 인물이 고르게 많이 등장하기 때문입니다.","제갈량의 등장 문단 수가 특히 많기 때문입니다.","촉의 인원수가 가장 많기 때문입니다."],ok:1,
     good:"기본 명단에서는 촉의 인물별 등장 문단 수 합계 중 절반 이상이 제갈량의 값입니다. 일부 큰 값이 평균에 영향을 줄 수 있으므로 중앙값과 분포를 함께 확인해야 합니다.",bad:"촉의 점들이 어떻게 분포하는지 살펴보고, 최댓값을 제외했을 때 평균이 얼마나 달라지는지 확인해 보세요.",
     ev:()=>{const r=roster(),v=f=>r.filter(n=>PP[n].f===f).map(n=>PP[n].pa);return `1인당 평균 촉 ${fmt(avg(v("shu")))} · 오 ${fmt(avg(v("wu")))} · 위 ${fmt(avg(v("wei")))} / 중앙값 촉 ${fmt(median(v("shu")))} · 오 ${fmt(median(v("wu")))} · 위 ${fmt(median(v("wei")))}`}});
  function vals(g){let m=roster().filter(n=>inG(n,g)).map(n=>PP[n].pa);if(L.drop&&m.length>1){m=[...m].sort((a,b)=>b-a).slice(1)}return m}
  function d(){
    const G=groups(L.g);const agg=a=>L.stat==="sum"?a.reduce((x,y)=>x+y,0):L.stat==="mean"?avg(a):median(a);
    const items=G.map(([g,l,c])=>({label:l,v:agg(vals(g)),c}));bars($("#sbars"),items,Math.max(...items.map(x=>x.v)),"");
    const top=[...items].sort((a,b)=>b.v-a.v)[0];
    const r=roster(),shu=r.filter(n=>PP[n].f==="shu"),shuT=shu.reduce((a,n)=>a+PP[n].pa,0),zg=PP["諸葛亮"];
    $("#sread").innerHTML=`<b>${L.stat==="sum"?"합계":L.stat==="mean"?"1인당 평균":"중앙값"}</b>으로 보면 ${top.label}${jo(top.label,"이","가")} 가장 높습니다.${L.stat==="sum"?" 합계는 인원수의 영향도 받습니다.":""}${L.stat==="mean"&&shu.includes("諸葛亮")?` 촉의 등장 문단 수 합계 ${shuT} 중 ${zg.pa}(${Math.round(zg.pa/shuT*100)}%)이 제갈량의 값입니다.`:""}${L.drop?" (진영별 최댓값 제외)":""}`;
    const G2=groups("three"),mx=Math.max(...r.map(n=>PP[n].pa));
    $("#strip").innerHTML=G2.map(([g,l,c])=>{let m=r.filter(n=>PP[n].f===g).sort((a,b)=>PP[b].pa-PP[a].pa);const dropped=L.drop?m[0]:null;
      return `<div class="srow"><span class="slab">${l}</span><div class="sline">${m.map((n,j)=>`<button class="sdot ${n===dropped?"off":""}" style="left:${PP[n].pa/mx*100}%;background:${c};top:${8+(j%3)*9}px" title="${PP[n].ko} ${PP[n].pa}문단" aria-label="${PP[n].ko} ${PP[n].pa}문단" data-n="${n}"></button>`).join("")}${m[0]?`<span class="stag" style="left:${PP[m[0]].pa/mx*100}%">${PP[m[0]].ko} ${PP[m[0]].pa}</span>`:""}</div></div>`}).join("")+`<div class="saxis"><span>0</span><span>${Math.round(mx/2)}</span><span>${mx}문단</span></div>`;
  }
  onSeg("st",v=>{L.stat=v;setT("s2",v);save();d()});onSeg("gp",v=>{L.g=v;save();d()});
  $("#drop").addEventListener("change",e=>{L.drop=e.target.checked?1:0;if(L.drop)setT("s2","drop");save();d()});
  $("#strip").addEventListener("click",e=>{const b=e.target.closest(".sdot");if(b)$("#sread").innerHTML+=` <span class="cap">· ${PP[b.dataset.n].ko} ${PP[b.dataset.n].pa}문단</span>`});
  setT("s2","sum");d();
}
const avg=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:0;

/* ===== S3 맞춤 지표 ===== */
function s3(){
  const L=S.t.s3x=S.t.s3x||{g:"ally",sel:"周瑜",k:"fire"};
  stage(3,[["s3","weight","가중치 정하기"],["s3","evid","근거 문단 확인하기"]],
    step(1,"기록에서 지표 만들기","인물의 이름이 포함된 문단에 아래 글자 중 하나가 함께 나오면 해당 지표에 1을 더합니다. 바람(風)은 비교 점수에서 제외하고, 6장에서 별도의 조건으로 다룹니다.",
    `<section class="card pane"><div class="pane-h"><h2>${ic("note")}지표 정의</h2>${srcB("yy","연의 문단 원문")}</div>
      <div class="kdef">${["ship","fire","plan"].map(k=>`<div><b>${KN[k]}</b><span class="num">${KW[k]}</span></div>`).join("")}<div class="muted"><b>바람</b><span class="num">${KW.wind}</span><small>환경 조건 · 6장에서 별도 조건으로 사용</small></div></div></section>`)+
    step(2,"가중치를 정해 비교 점수 계산하기","가중치는 각 지표에 부여하는 점수입니다. 수전·화공·계책에 얼마나 큰 비중을 둘지 선택합니다. 가중치에는 분석자의 판단이 반영됩니다.",
    `<div class="cols"><section class="card pane asm"><div class="pane-h"><h2>${ic("sliders")}가중치</h2><span class="reg asm">선택한 가중치</span></div>
      <div class="weights" id="wts"></div><div class="formula" id="wform"></div></section>
      <section class="card pane"><div class="pane-h"><h2>${ic("chart")}진영별 비교 점수</h2>${seg("gp3",[["ally","위·연합 비교"],["three","위·오·촉"]],L.g,"묶음")}</div>
      <div class="stack" id="stack"></div><div class="callout" id="s3read" aria-live="polite"></div></section></div>
    <div class="cols"><section class="card pane"><div class="pane-h"><h2>${ic("table")}인물별 지표</h2><span class="meta">인물을 선택하면 근거 문단 표시</span></div>
      <div class="tscroll"><table class="data"><thead><tr><th>인물</th><th class="n">수전</th><th class="n">화공</th><th class="n">계책</th><th class="n">점수</th></tr></thead><tbody id="ptab"></tbody></table></div></section>
      <section class="card pane" id="evbox" aria-live="polite"></section></div>`),
    {q:"이 비교 점수는 실제로 무엇을 나타낼까요?",opts:["인물의 실제 전투 능력","인물의 이름과 수전·화공·계책 관련 글자가 함께 나온 정도","전투에서 세운 공입니다.의 크기"],ok:1,
     good:"이 점수는 이름과 관련 글자가 함께 나온 횟수에 가중치를 적용한 값입니다. 같은 기준으로 기록을 비교할 수 있지만, 실제 능력이나 공헌도를 직접 측정한 값은 아닙니다. 5장에서 이 한계를 확인합니다.",bad:"지표 정의에서 어떤 글자를 어떤 단위로 세었는지 기록을 다시 살펴보시지요.",
     ev:()=>{const s=fs("yy");return `연의 비교 점수(수전 ${S.w.ship}·화공 ${S.w.fire}·계책 ${S.w.plan}점): 연합 ${s.wu+s.shu} vs 위 ${s.wei}`}});
  function dW(){
    const row=(k)=>`<div class="w"><span>${KN[k]} 1회당</span><span class="stepper-n"><button data-w="${k}" data-d="-1" aria-label="${KN[k]} 줄이기">−</button><output class="num">${S.w[k]}점</output><button data-w="${k}" data-d="1" aria-label="${KN[k]} 늘리기">+</button></span></div>`;
    $("#wts").innerHTML=["ship","fire","plan"].map(row).join("");
    $("#wform").innerHTML=`비교 점수 = 수전×<b>${S.w.ship}</b> + 화공×<b>${S.w.fire}</b> + 계책×<b>${S.w.plan}</b>`;
  }
  function d(){
    const r=roster(),G=groups(L.g);
    const parts=G.map(([g,l,c])=>{const m=r.filter(n=>inG(n,g));const p=["ship","fire","plan"].map(k=>m.reduce((a,n)=>a+S.w[k]*PP[n].yy[KI[k]],0));return {l,c,p,t:p.reduce((a,b)=>a+b,0)}});
    const mx=Math.max(...parts.map(x=>x.t))||1;
    $("#stack").innerHTML=parts.map(x=>`<div class="srow2"><span><i class="dot" style="background:${x.c}"></i>${x.l}</span><span class="stk">${x.p.map((v,j)=>`<i class="seg${j}" style="width:${v/mx*100}%" title="${["수전","화공","계책"][j]} ${v}"></i>`).join("")}</span><b class="num">${x.t}</b></div>`).join("")+`<div class="legend"><span><i class="dot seg0"></i>수전</span><span><i class="dot seg1"></i>화공</span><span><i class="dot seg2"></i>계책</span></div>`;
    const s=fs("yy");$("#s3read").innerHTML=`연합의 비교 점수는 <b>${s.wu+s.shu}</b>점, 위는 <b>${s.wei}</b>점입니다. 연합이 위의 약 ${fmt((s.wu+s.shu)/Math.max(1,s.wei))}배이며, 연합 점수 중 오의 비중은 ${Math.round(s.wu/(s.wu+s.shu)*100)}%입니다.`;
    const top=r.map(n=>({n,s:scoreOf(n,"yy")})).sort((a,b)=>b.s-a.s).slice(0,10);
    $("#ptab").innerHTML=top.map(x=>`<tr class="clk ${x.n===L.sel?"flag":""}" data-n="${x.n}" tabindex="0"><td><i class="dot" style="background:${fcol(PP[x.n].f)}"></i>${PP[x.n].ko}</td><td class="n">${PP[x.n].yy[0]}</td><td class="n">${PP[x.n].yy[1]}</td><td class="n">${PP[x.n].yy[2]}</td><td class="n"><b>${x.s}</b></td></tr>`).join("");
    dE();
  }
  function dE(){const n=L.sel,e=(EVID[n]||{})[L.k];
    $("#evbox").innerHTML=`<div class="pane-h"><h2>${ic("scroll")}근거 문단 · ${PP[n].ko}</h2>${seg("ek",[["ship","수전"],["fire","화공"],["plan","계책"]],L.k,"지표")}</div>${e?`<p class="cap">${srcB("yy",`연의 ${e[0]}회`)} 이 인물과 '${KN[L.k]}' 글자가 함께 나온 문단 중 하나 (번역)</p><blockquote class="evq">${esc(e[1])}</blockquote>`:`<p class="empty">현재 공개 데이터에는 이 지표의 번역 문단이 없습니다.</p>`}`;
    onSeg("ek",v=>{L.k=v;setT("s3","evid");save();dE()});}
  $("#wts").addEventListener("click",e=>{const b=e.target.closest("button[data-w]");if(!b)return;const k=b.dataset.w;S.w[k]=Math.max(0,Math.min(5,S.w[k]+ +b.dataset.d));setT("s3","weight");save();dW();d()});
  onSeg("gp3",v=>{L.g=v;save();d()});
  $("#ptab").addEventListener("click",e=>{const tr=e.target.closest("tr[data-n]");if(!tr)return;L.sel=tr.dataset.n;setT("s3","evid");save();d()});
  dW();d();
}
function fs(lens,w=S.w,r=roster(),mut){const o={wei:0,wu:0,shu:0};r.forEach(n=>{const f=mut&&mut[n]!==undefined?mut[n]:PP[n].f;if(f)o[f]+=scoreOf(n,lens,w)});return o}

/* ===== S4 민감도 ===== */
function s4(){
  const L=S.t.s4x=S.t.s4x||{};
  stage(4,[["s4","run","215가지 조합 계산하기"],["s4","alt","다른 조건으로 다시 계산하기"]],
    step(1,"215가지 가중치 조합 비교하기","세 지표의 가중치를 각각 0~5점으로 바꾸어 계산합니다. 모두 0점인 경우를 제외한 215가지 조합 중 연합의 비교 점수가 더 높은 경우를 셉니다.",
    `<section class="card pane"><div class="pane-h"><h2>${ic("sliders")}검사 조건</h2></div>
      <div class="ctrls"><div class="field">어떤 자료를 사용할까요?${seg("lens4",[["yy","연의"],["jb","정사 본문"]],L.lens||"yy","자료")}</div><div class="field">어떤 방식으로 비교할까요?${seg("agg4",[["sum","진영 합계"],["cap","1인당 평균"]],L.agg||"sum","집계")}</div></div>
      <button class="btn" id="run">${ic("chart")}215가지 조합 계산하기</button><div id="sweep" aria-live="polite"></div></section>`)+
    step(2,"조건별 결과 비교하기","계산한 결과를 자료·집계 방식·명단 기준별로 비교합니다. 여기서 같은 결론이 유지되는 정도를 결론의 안정성이라고 합니다.",
    `<section class="card pane"><div class="tscroll"><table class="data"><thead><tr><th>자료</th><th>집계</th><th>명단</th><th class="n">연합 점수가 높은 조합</th><th>판단</th></tr></thead><tbody id="sweeps"></tbody></table></div></section>`),
    {q:"가중치를 바꾸어도 연합의 점수가 높게 유지된다는 것은 무엇을 뜻할까요?",opts:["어떤 분석에서도 가중치는 중요하지 않습니다.","현재 조건에서는 결론이 비교적 안정적입니다. 자료와 집계 방식을 바꾸었을 때도 따로 확인해야 합니다.","실제 전투에서도 연합이 반드시 승리합니다."],ok:1,
     good:"검사한 범위에서 같은 결론이 유지되었다는 뜻입니다. 다만 자료나 집계 방식을 바꾸면 결과가 달라질 수 있으므로, 확인한 조건과 범위를 함께 밝혀야 합니다.",bad:"같은 자료에서도 합계와 1인당 평균을 사용할 때 결과가 어떻게 달라지는지 확인해 보세요.",
     ev:()=>{const rs=L.runs||[];return rs.length?rs.map(x=>`${x.lens==="yy"?"연의":"정사"}·${x.agg==="sum"?"합계":"1인당"} ${x.win}/${x.tot}`).join(" · "):"민감도 분석"}});
  L.runs=L.runs||[];
  function sweep(lens,agg){let win=0,tot=0;const r=roster(),A=r.filter(n=>PP[n].f!=="wei"),W=r.filter(n=>PP[n].f==="wei");let close=null;
    for(let a=0;a<=5;a++)for(let b=0;b<=5;b++)for(let c=0;c<=5;c++){if(!a&&!b&&!c)continue;const w={ship:a,fire:b,plan:c};
      let sa=A.reduce((s,n)=>s+scoreOf(n,lens,w),0),sw=W.reduce((s,n)=>s+scoreOf(n,lens,w),0);if(agg==="cap"){sa/=A.length;sw/=W.length}
      tot++;if(sa>sw)win++;const ratio=sa/(sw||1);if(!close||Math.abs(ratio-1)<Math.abs(close.r-1))close={r:ratio,w}}
    return {win,tot,close}}
  function dRuns(){$("#sweeps").innerHTML=L.runs.length?L.runs.map(x=>`<tr><td>${x.lens==="yy"?srcB("yy"):srcB("jb")}</td><td>${x.agg==="sum"?"진영 합계":"1인당 평균"}</td><td class="num">${x.rule}</td><td class="n"><b>${x.win}</b> / ${x.tot}</td><td>${x.win===x.tot?"결론 유지":x.win>x.tot/2?"대부분 연합 점수가 높음":"가정에 따라 뒤집힘"}</td></tr>`).join(""):`<tr><td colspan="5" class="empty">계산을 실행하면 조건별 결과가 이곳에 기록됩니다.</td></tr>`}
  function run(){const lens=L.lens||"yy",agg=L.agg||"sum",res=sweep(lens,agg);
    const rule=`${S.rule.min}회↑${S.rule.dead?"·사망 인물 제외":""}`;
    const key=lens+agg+rule;L.runs=L.runs.filter(x=>x.key!==key);L.runs.push({key,lens,agg,rule,win:res.win,tot:res.tot});
    if(L.runs.length>=2)setT("s4","alt");setT("s4","run");save();
    const pct=Math.round(res.win/res.tot*100),c=res.close;
    $("#sweep").innerHTML=`<div class="sweepres"><div class="big num">${res.win}<small> / ${res.tot}</small></div><div><b>${pct}%의 조합에서 연합의 비교 점수가 더 높습니다.</b><p>두 진영의 점수가 가장 비슷한 조합: 수전 ${c.w.ship}·화공 ${c.w.fire}·계책 ${c.w.plan}점 (연합/위 = ${c.r.toFixed(2)}배)</p></div></div><div class="pctbar"><i style="width:${pct}%"></i></div>`;dRuns()}
  onSeg("lens4",v=>{L.lens=v;save()});onSeg("agg4",v=>{L.agg=v;save()});
  $("#run").onclick=run;dRuns();
}

/* ===== S5 지표 검증 ===== */
function s5(){
  const L=S.t.s5x=S.t.s5x||{};
  stage(5,[["s5","victim","조조의 화공 근거 확인하기"],["s5","cmp","연의·정사 비교하기"]],
    step(1,"수치가 높은 이유 확인하기","조조는 화공 관련 지표가 높게 나옵니다. 그 이유가 무엇인지 근거 문단에서 직접 확인해 보세요.",
    `<div class="cols"><section class="card pane"><div class="pane-h"><h2>${ic("table")}화공 지표 상위</h2>${srcB("yy")}</div><div class="bars" id="firetop"></div></section>
      <section class="card pane"><div class="pane-h"><h2>${ic("scroll")}조조 · 화공 근거</h2>${srcB("yy",`연의 ${(EVID["曹操"]||{}).fire?.[0]||""}회`)}</div>
        <button class="btn ghost" id="openv">${ic("search")}근거 문단 열기</button><div id="vict"></div></section></div>`)+
    step(2,"같은 지표로 다른 자료 비교하기","정사 열전에서도 같은 글자를 세어 보시지요. 연의는 문단, 정사는 문장을 단위로 하므로 횟수를 직접 비교하지 않고 진영별 비중(%)을 살펴봅니다.",
    `<section class="card pane"><div class="pane-h"><h2>${ic("chart")}진영별 점수 비중</h2>${seg("lay5",[["jb","정사 본문"],["all","본문 + 주석"]],L.lay||"jb","정사 자료 범위")}</div>
      <div class="cmp5" id="cmp5"></div><div class="callout" id="r5" aria-live="polite"></div></section>
    <section class="card pane"><div class="pane-h"><h2>${ic("table")}인물별 비교</h2><span class="meta">연의 문단 · 정사 문장</span></div>
      <div class="tscroll"><table class="data"><thead><tr><th>인물</th><th class="n">연의 수전</th><th class="n">정사 수전</th><th class="n">연의 화공</th><th class="n">정사 화공</th><th class="n">연의 계책</th><th class="n">정사 계책</th></tr></thead><tbody id="ptab5"></tbody></table></div></section>`),
    {q:"조조의 화공 관련 지표가 높게 나온 이유는 무엇일까요?",opts:["조조가 화공에 가장 뛰어났기 때문입니다.","조조가 불에 피해를 입은 장면에도 관련 글자가 나오기 때문입니다.","데이터가 잘못 입력되었기 때문입니다."],ok:1,
     good:"관련 글자가 함께 나왔다는 사실만으로 공격한 쪽과 피해를 입은 쪽을 구분할 수는 없습니다. 자료를 바꾸면 같은 지표의 비중도 달라집니다. 따라서 수치의 정의와 출처를 함께 확인해야 합니다.",bad:"근거 문단에서 조조가 불을 지르는지, 불을 피해 달아나는지 기록을 다시 살펴보시지요.",
     ev:()=>{const a=share("yy"),b=share("jb");return `조조의 화공 지표 ${PP["曹操"].yy[1]}: 피해 장면도 포함 · 촉 비중 연의 ${a.shu}% → 정사 본문 ${b.shu}%`}});
  const r=roster(),ft=r.map(n=>({n,v:PP[n].yy[1]})).sort((a,b)=>b.v-a.v).slice(0,6);
  bars($("#firetop"),ft.map(x=>({label:PP[x.n].ko,v:x.v,c:fcol(PP[x.n].f)})),ft[0].v,"문단");
  const showV=()=>{const e=(EVID["曹操"]||{}).fire;$("#vict").innerHTML=e?`<blockquote class="evq">${esc(e[1])}</blockquote><p class="cap">이 문단에서 조조는 화공을 실행하는 인물이 아니라 불을 피해 달아나는 인물입니다.</p>`:""};
  $("#openv").onclick=()=>{setT("s5","victim");showV()};if(tk("s5","victim"))showV();
  function share(lens){const s=fs(lens),t=s.wei+s.wu+s.shu||1;return {wei:Math.round(s.wei/t*100),wu:Math.round(s.wu/t*100),shu:Math.round(s.shu/t*100)}}
  function d(){const lay=L.lay||"jb",a=share("yy"),b=share(lay);
    $("#cmp5").innerHTML=[["yy","연의",a],[lay,lay==="jb"?"정사 본문":"정사 본문+주석",b]].map(([k,l,s])=>`<div class="srow2"><span>${srcB(k==="all"?"jn":k,l)}</span><span class="stk">${FS.map(f=>`<i style="width:${s[f]}%;background:${fcol(f)}" title="${FN[f]} ${s[f]}%"></i>`).join("")}</span><b class="num"></b></div>`).join("")+`<div class="legend">${FS.map(f=>`<span><i class="dot" style="background:${fcol(f)}"></i>${FN[f]}</span>`).join("")}</div>`;
    $("#r5").innerHTML=`촉의 비중: 연의 <b>${a.shu}%</b> → ${lay==="jb"?"정사 본문":"정사+주석"} <b>${b.shu}%</b>. 오: ${a.wu}% → ${b.wu}%. 위: ${a.wei}% → ${b.wei}%. 자료에 따라 진영별 비중이 달라집니다. 이 차이만으로 소설의 과장 여부를 판단할 수는 없습니다.`;
    const keys=["諸葛亮","周瑜","龐統","黃蓋","曹操","魯肅","劉備","甘寧"].filter(n=>r.includes(n));
    const jv=n=>lay==="all"?PP[n].jb.map((x,i)=>x+PP[n].jn[i]):PP[n].jb;
    $("#ptab5").innerHTML=keys.map(n=>`<tr><td><i class="dot" style="background:${fcol(PP[n].f)}"></i>${PP[n].ko}</td>${[0,1,2].map(i=>`<td class="n">${PP[n].yy[i]}</td><td class="n ${jv(n)[i]===0&&PP[n].yy[i]>0?"dead":""}">${jv(n)[i]}</td>`).join("")}</tr>`).join("");
  }
  onSeg("lay5",v=>{L.lay=v;setT("s5","cmp");save();d()});d();
  if(!tk("s5","cmp")){/* first view counts after a toggle */}
}

/* ===== S6 What-if ===== */
function s6(){
  const L=S.t.s6x=S.t.s6x||{who:"諸葛亮",act:"wei",lens:"yy",wind:1,wmode:"env",wb:10,runs:[]};
  stage(6,[["s6","run","조건이 다른 시나리오 2개 기록하기"],["s6","lens","분석 자료 바꾸기"],["s6","wmode","바람에 관한 가정 바꾸기"]],
    step(1,"변경할 조건 선택하기","인물 한 명의 소속을 바꾸거나 분석 대상에서 제외합니다. 1장의 명단과 3장의 가중치는 현재 설정을 유지합니다.",
    `<section class="card pane"><div class="pane-h"><h2>${ic("sliders")}변경 시나리오</h2><span class="meta">빠른 선택</span></div>
      <div class="presets" id="presets">${[["諸葛亮","wei","제갈량을 위로 이동"],["龐統","out","방통을 분석 대상에서 제외"],["周瑜","wei","주유를 위로 이동"],["黃蓋","out","황개를 분석 대상에서 제외"],["曹操","wu","조조를 오로 이동"]].map(([n,a,t])=>`<button class="chip" data-n="${n}" data-a="${a}">${t}</button>`).join("")}</div>
      <div class="ctrls"><label class="field">인물<select id="who"></select></label><div class="field">변경할 소속${seg("act",[["wei","위로 이동"],["wu","오로 이동"],["shu","촉으로 이동"],["out","분석 대상에서 제외"]],L.act,"이동")}</div></div>
      <div class="ctrls"><div class="field">어떤 자료를 사용할까요?${seg("lens6",[["yy","연의"],["jb","정사 본문"]],L.lens,"분석 자료")}</div><div class="field">바람 발생 여부${seg("wind",[[1,"발생"],[0,"발생하지 않음"]],L.wind,"바람")}</div></div>
      <div class="field">바람에 어떤 가정을 적용할까요?${seg("wmode",[["env","환경 조건"],["zg","제갈량을 따르는 조건"]],L.wmode,"바람 가정")}</div>
      <p class="cap">환경 조건으로 설정하면 바람은 인물의 소속과 관계없이 연합 측에 유리하게 적용됩니다. 제갈량을 따르는 조건으로 설정하면 제갈량이 속한 진영에 보너스를 주고, 제외되면 보너스를 주지 않습니다. 두 방식 모두 이 실험에서 선택하는 가정입니다.</p></section>`)+
    step(2,"변경 전후의 결과 비교하기","연합과 위의 비교 점수 비율에 바람 보너스를 적용합니다. 지수가 높을수록 이 계산 규칙에서 연합에 유리합니다. 실제 승률이나 피해 규모를 뜻하지 않습니다.",
    `<div class="cols"><section class="card pane"><div class="pane-h"><h2>${ic("chart")}비교 점수 · 전 → 후</h2><span id="l6"></span></div>
        <div class="cmp" id="bf"></div><div class="formula" id="f6"></div></section>
      <section class="card pane asm"><div class="pane-h"><h2>${ic("wind")}연합 비교 지수</h2><span class="reg asm">학습용 계산값</span></div>
        <div class="scene" id="scene6"></div>
        <div class="meter"><div class="meter-row"><span class="big" id="idx">0</span><span class="verdict" id="vd"></span></div><div class="track" aria-hidden="true"><i class="pin" id="pin6"></i></div><div class="scale"><span>위 점수 우세</span><span>점수 비슷</span><span>연합 점수 우세</span></div></div>
        <div class="callout" id="r6" aria-live="polite"></div><button class="btn wind" id="rec6">${ic("plus")}이 시나리오 기록하기</button></section></div>
    <div class="cols"><section class="card pane"><div class="pane-h"><h2>${ic("table")}동시 등장 기록</h2><span class="meta">같은 회차에 이름이 함께 나온 횟수</span></div><div class="bars" id="links"></div><p class="cap" id="lcap"></p></section>
      <section class="card pane"><div class="pane-h"><h2>${ic("note")}시나리오 기록</h2></div><div class="tscroll"><table class="data"><thead><tr><th>#</th><th>시나리오</th><th>분석 자료 · 바람</th><th class="n">지수</th></tr></thead><tbody id="runs6"></tbody></table></div></section></div>`),
    {q:"이 실험만으로 실제 전투의 승패를 판단할 수 있을까요?",opts:["네. 계산 결과만으로 실제 승패를 판단할 수 있습니다.","아니요. 사용한 자료와 바람에 관한 가정에 따라 결과가 달라집니다.","아니요. 어떤 조건에서도 실제 전투는 연합의 승리로 끝납니다."],ok:1,
     good:"이 결과는 선택한 자료와 계산 규칙을 적용한 값입니다. 자료와 가정을 바꾸면 결과도 달라지므로, 실제 역사의 다른 결말을 입증하는 수치로 해석해서는 안 됩니다.",bad:"분석 자료와 바람 가정을 바꾼 시나리오를 비교해 보세요. 어떤 조건에서 결과가 달라졌는지 확인할 수 있습니다.",
     ev:()=>{const rs=L.runs.slice(-3);return rs.length?rs.map(x=>`${x.t}(${x.lens==="yy"?"연의":"정사"}·${x.wd}) ${x.i}`).join(" / "):"조건 변경 실험"}});
  const r=roster();const cands=r.filter(n=>PP[n].pa>=8).sort((a,b)=>PP[b].pa-PP[a].pa);
  if(!cands.includes(L.who))L.who=cands[0];
  $("#who").innerHTML=cands.map(n=>`<option value="${n}" ${n===L.who?"selected":""}>${PP[n].ko} (${FN[PP[n].f]})</option>`).join("");
  const idxOf=(lens,mut,zgSide)=>{const s=fs(lens,S.w,r,mut),A=s.wu+s.shu,W=s.wei;let i=A+W?A/(A+W)*100:50;
    if(L.wind){if(L.wmode==="env")i+=L.wb;else{if(zgSide==="ally")i+=L.wb;else if(zgSide==="wei")i-=L.wb}}return {i:Math.max(0,Math.min(100,Math.round(i))),A,W}};
  const zgSideOf=mut=>{if(!r.includes("諸葛亮"))return null;const f=mut&&mut["諸葛亮"]!==undefined?mut["諸葛亮"]:"shu";return f===null?null:f==="wei"?"wei":"ally"};
  const vd=i=>i>=65?"연합 점수 우세":i>=45?"점수 비슷":"위 점수 우세";
  function d(){
    $("#act").querySelectorAll("button").forEach(b=>b.disabled=b.dataset.v===PP[L.who].f);
    if(L.act===PP[L.who].f){L.act="out";$$("#act button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.v==="out"))}
    const mut={[L.who]:L.act==="out"?null:L.act};
    const b0=idxOf(L.lens,null,zgSideOf(null)),b1=idxOf(L.lens,mut,zgSideOf(mut));
    $("#l6").innerHTML=srcB(L.lens);
    const mx=Math.max(b0.A,b0.W,b1.A,b1.W)||1;
    $("#bf").innerHTML=[["연합 · 전",b0.A,"var(--wu)",1],["연합 · 후",b1.A,"var(--wu)",0],["위 · 전",b0.W,"var(--wei)",1],["위 · 후",b1.W,"var(--wei)",0]].map(([l,v,c,base])=>`<div class="bar"><span>${l}</span><span class="track"><span class="fill ${base?"base":""}" style="width:${v/mx*100}%;${base?"":`background:${c}`}"></span></span><span class="v">${v}</span></div>`).join("");
    const ps=scoreOf(L.who,L.lens);
    $("#f6").innerHTML=`${PP[L.who].ko}의 점수 <b>${ps}</b> (${L.lens==="yy"?"연의":"정사 본문"}) → ${L.act==="out"?"분석 대상에서 제외":`${FN[PP[L.who].f]}에서 ${FN[L.act]}로 이동`}. 지수 = 연합 ÷ (연합+위) × 100 ${L.wind?`${L.wmode==="env"?"+":"±"} 바람 ${L.wb}`:"(바람 없음)"}`;
    $("#idx").textContent=b1.i;$("#vd").textContent=vd(b1.i);$("#pin6").style.left=`calc(${b1.i}% - 2px)`;
    const delta=b1.i-b0.i,nm=PP[L.who].ko;
    $("#r6").innerHTML=`기준 시나리오 <b>${b0.i}</b>(${vd(b0.i)}) → 이 시나리오 <b>${b1.i}</b>(${vd(b1.i)}). ${delta===0?"지수 변화가 없습니다.":`연합 비교 지수가 ${Math.abs(delta)}점 ${delta<0?"낮아졌습니다":"높아졌습니다"}.`}${L.lens==="jb"&&Math.abs(delta)<4?` 정사로 세면 ${nm}${jo(nm,"의","의")} 비중이 작아 계산 결과에 미치는 영향도 작습니다.`:""}${L.wmode==="zg"&&L.who==="諸葛亮"&&L.wind?" (바람이 제갈량을 따라간다는 가정)":""}`;
    dScene(b1.i,L.wind,L.act,mut);dLinks();
  }
  function dLinks(){const i=NAMES.indexOf(L.who),acc={wei:0,wu:0,shu:0};EDGES.forEach(([a,b,k])=>{const o=a===i?b:b===i?a:-1;if(o<0)return;const n=NAMES[o];if(!r.includes(n))return;acc[PP[n].f]+=k});
    const mx=Math.max(...FS.map(f=>acc[f]))||1;bars($("#links"),FS.map(f=>({label:FN[f],v:acc[f],c:fcol(f)})),mx,"");
    const top=[...FS].sort((a,b)=>acc[b]-acc[a])[0];$("#lcap").textContent=`${PP[L.who].ko}${jo(PP[L.who].ko,"은","는")} ${FN[top]} 인물들과 가장 많이 함께 등장합니다. 이 실험에서는 소속을 바꾸어도 기존 동시 등장 기록은 바뀌지 않습니다. 따라서 관계의 변화까지 설명하는 모델은 아닙니다.`}
  function dScene(i,wind,act,mut){const burning=Math.round(i/100*6),xs=[340,378,416,454,492,530];
    const ship=(x,j)=>`<g transform="translate(${x},112)"><path d="M-17 0h34l-6 12h-22z" fill="var(--ink-2)"/><path d="M0 0v-26" stroke="var(--ink-2)" stroke-width="2"/><rect x="0" y="-26" width="12" height="8" fill="var(--wei)"/>${j<burning?`<g class="flame"><path d="M-8 0c0-9 6-11 4-19 7 5 11 11 9 19z" fill="var(--flame)"/><path d="M-3 0c0-5 3-7 2-11 4 3 6 7 5 11z" fill="var(--flame-2)"/></g>`:""}</g>`;
    const gai=[0,1,2].map(j=>`<g transform="translate(${70+j*44},${132+(j%2)*10})"><path d="M-14 0h28l-5 10h-18z" fill="var(--wu)"/><path d="M0 0v-18" stroke="var(--wu)" stroke-width="2"/><path d="M0-18l10 4-10 4" fill="var(--wu)"/></g>`).join("");
    const zs=zgSideOf(mut),against=L.wmode==="zg"&&zs==="wei";
    const w=wind&&!(L.wmode==="zg"&&zs===null)?[0,1,2].map(j=>against?`<path d="M${280-j*20} ${40+j*14}h-${120+j*30}" stroke="var(--wind)" stroke-width="2.5" fill="none" stroke-linecap="round"/>`:`<path d="M${40+j*20} ${40+j*14}h${120+j*30}" stroke="var(--wind)" stroke-width="2.5" fill="none" stroke-linecap="round"/>`).join("")+`<text x="40" y="26" style="font:600 12px var(--f-body);fill:var(--wind)">${against?"← 바람이 연합 쪽으로":"동남풍 →"}</text>`:`<text x="40" y="26" style="font:600 12px var(--f-body);fill:var(--ink-3)">바람 없음</text>`;
    $("#scene6").innerHTML=`<svg viewBox="0 0 600 180" role="img" aria-label="연합 비교 지수 ${i}, 화공 효과 ${burning}개 · 지수에 따른 장식 연출"><rect width="600" height="180" fill="var(--river)"/><rect y="150" width="600" height="30" fill="var(--river-2)"/>${w}<path d="M340 116H530" stroke="var(--ink-3)" stroke-width="2" stroke-dasharray="3 3"/>${xs.map(ship).join("")}${gai}<text x="560" y="170" text-anchor="end" style="font:12px var(--f-body);fill:var(--ink-2)">화공 연출 ${burning} / 6</text><text x="40" y="170" style="font:12px var(--f-body);fill:var(--ink-2)">연합의 배</text></svg>`}
  function dRuns(){$("#runs6").innerHTML=L.runs.length?L.runs.map((x,i)=>`<tr><td class="n">${i+1}</td><td style="white-space:normal">${x.t}</td><td>${x.lens==="yy"?"연의":"정사"} · ${x.wd}</td><td class="n"><b>${x.i}</b></td></tr>`).join(""):`<tr><td colspan="4" class="empty">기록한 시나리오를 이곳에서 비교할 수 있습니다.</td></tr>`;if(new Set(L.runs.map(x=>x.t+"|"+x.lens+"|"+x.wd)).size>=2)setT("s6","run")}
  $("#who").addEventListener("change",e=>{L.who=e.target.value;save();d()});
  onSeg("act",v=>{L.act=v;save();d()});onSeg("lens6",v=>{L.lens=v;setT("s6","lens");save();d()});onSeg("wind",v=>{L.wind=+v;save();d()});onSeg("wmode",v=>{L.wmode=v;setT("s6","wmode");save();d()});
  $("#presets").addEventListener("click",e=>{const b=e.target.closest(".chip");if(!b)return;if(!r.includes(b.dataset.n)){$("#r6").innerHTML="이 인물은 현재 분석 대상에 포함되어 있지 않습니다. 1장에서 선정 기준을 확인해 주세요.";return}L.who=b.dataset.n;L.act=b.dataset.a;$("#who").value=L.who;$$("#act button").forEach(x=>x.setAttribute("aria-pressed",x.dataset.v===L.act));save();d()});
  $("#rec6").onclick=()=>{const mut={[L.who]:L.act==="out"?null:L.act},x=idxOf(L.lens,mut,zgSideOf(mut));L.runs.push({t:`${PP[L.who].ko} ${L.act==="out"?"없음":"→ "+FN[L.act]}`,lens:L.lens,wd:L.wind?(L.wmode==="env"?"환경 조건":"제갈량 연동"):"바람 없음",i:x.i});if(L.runs.length>8)L.runs.shift();save();dRuns()};
  d();dRuns();
}

/* ===== 자료와 집계 기준 ===== */
function lib(){
  TASKS=[];
  $("#main").innerHTML=`${hero({hz:"史 料",where:"공개 데이터",title:"데이터와 집계 기준",sub:`<span class="reg rec">참고</span>자료와 집계 기준`,fx:"mist"})}
    <section class="card pane"><div class="pane-h"><h2>${ic("table")}공개 데이터의 구성</h2></div>
      <div class="tscroll"><table class="data lib"><thead><tr><th>데이터</th><th>내용</th><th>쓰는 장</th></tr></thead><tbody>
        <tr><td>${srcB("yy","연의 등장 기록")}</td><td>제43–50회에서 추출한 인물 63명의 기록 186건입니다. 각 기록에는 해당 인물의 이름이 포함된 문단이 연결되어 있습니다.</td><td>1 명단 · 2 등장 문단 수 · 3 지표</td></tr>
        <tr><td>${srcB("jb","정사 열전")}</td><td>인물 63명의 전기 본문입니다. 인물의 진영은 정사의 위·촉·오 분류를 따릅니다.</td><td>1 진영 · 5 · 6 정사 자료</td></tr>
        <tr><td>${srcB("jn","배송지 주석")}</td><td>배송지가 덧붙인 주석으로, 『강표전』 등 다른 문헌의 인용이 포함되어 있습니다. 이 데이터에서 바람의 방향에 관한 설명은 주석에 나타납니다.</td><td>5 본문+주석</td></tr>
        <tr><td><span class="sb jb">동시 등장</span></td><td>같은 회차에 이름이 함께 나온 인물 쌍 1,340개입니다.</td><td>6 연결</td></tr>
        <tr><td><span class="sb yy">번역 문단</span></td><td>연의 문단의 한국어 번역 210개입니다. 근거 문단을 제시할 때 사용합니다.</td><td>1 · 3 · 5</td></tr>
      </tbody></table></div></section>
    <section class="card pane"><div class="pane-h"><h2>${ic("note")}지표를 만든 규칙</h2></div>
      <ol class="rules"><li><b>등장 문단 수</b> = 이름이 포함된 문단 수입니다. 같은 문단에서 여러 번 나와도 1로 셉니다.</li><li><b>수전·화공·계책</b> = 이름이 포함된 문단(정사는 문장)에 船·舟·水軍·艦 / 火·燒·焚 / 計·謀·策 중 하나가 함께 나온 횟수입니다.</li><li><b>바람</b>(風)은 비교 점수에서는 제외하고, 6장에서 별도의 조건으로 적용합니다.</li><li>연의는 문단, 정사는 문장을 단위로 합니다. 두 자료의 횟수를 직접 비교하지 않고 진영별 비중을 비교합니다.</li></ol></section>`;
}
const RENDER=[home,s1,s2,s3,s4,s5,s6,lib];

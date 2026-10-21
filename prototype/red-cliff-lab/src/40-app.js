
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
  {id:"s1",q:"누가 이 싸움에 나왔을까?",short:"참전 명단 만들기",skill:"데이터 만들기",hz:"第四十三回 — 第五十回",where:"소설 『삼국지연의』 여덟 회",fx:"mist",
   why:"전력을 비교하려면 먼저 '누구를' 셀지 정해야 한다. 이름이 한 번 나왔다고 참전한 것은 아니다.",gain:"명단을 정하는 규칙이 이후 모든 숫자를 바꾼다는 것",
   say:["장간 · 위","f-jg","蔣","내 이름은 왜 명단에 없소? 대체 누가, 무슨 기준으로 명단을 정한 것이오?"]},
  {id:"s2",q:"위나라가 더 강했을까?",short:"평균의 함정",skill:"평균과 중앙값",hz:"第四十三回",where:"진영별 존재감 비교",fx:"mist",
   why:"합계·평균 같은 요약값 하나로 진영을 비교하면 한두 명의 특별한 인물에 결론이 끌려간다.",gain:"평균이 감추는 것과, 중앙값·분포로 다시 보는 법",
   say:["조조 · 위","f-cao","曹","장수 수로 보나 무엇으로 보나 우리가 앞섰다. 숫자로 보여 주마."]},
  {id:"s3",q:"그럼 승패를 가른 건 무엇일까?",short:"맞춤 지표 설계",skill:"지표 설계와 가중치",hz:"第四十六回 — 第四十九回",where:"수전 · 화공 · 계책",fx:"embers",
   why:"적벽은 강 위에서 불로 결판난 싸움이다. 이 상황에 맞는 지표를 직접 설계해야 한다.",gain:"텍스트에서 지표를 만들고 가중치로 묶는 법",
   say:["주유 · 오","f-zhou","周","강 위의 싸움은 머릿수가 아니라 물과 불을 다루는 솜씨로 결정되오."]},
  {id:"s4",q:"점수 규칙을 바꿔도 결론이 같을까?",short:"민감도 확인",skill:"민감도 분석",hz:"第四十八回",where:"215가지 점수 규칙",fx:"mist",
   why:"가중치는 내가 정한 가정이다. 가정을 바꿔도 결론이 버티는지 확인해야 믿을 수 있다.",gain:"결론이 가정에 얼마나 기대고 있는지 재는 법",
   say:["노숙 · 오","f-lu","魯","수전에 3점, 화공에 3점이라… 그 점수는 누가 정했소? 바꿔 보아도 같은 답이 나오오?"]},
  {id:"s5",q:"이 지표를 믿어도 될까?",short:"지표 검증",skill:"프록시와 출처",hz:"第四十九回",where:"연의와 정사의 대조",fx:"embers",
   why:"지표는 '글자가 함께 나온 횟수'일 뿐이다. 정말 능력을 재는지, 소설이 만든 숫자는 아닌지 확인해야 한다.",gain:"지표의 한계와, 사료를 바꾸면 숫자가 어떻게 달라지는지",
   say:["황개 · 오","f-huang","黃","불을 지른 건 나요. 그런데 장부에는 불에 탄 조조도 '화공'으로 셌다지?"]},
  {id:"s6",q:"만약 그 사람이 다른 편이었다면?",short:"What-if 실험",skill:"시뮬레이션",hz:"假 如",where:"기록에 없는 적벽",fx:"fire",
   why:"지금까지 만든 명단·지표·가중치를 그대로 써서, 인물 한 명을 옮기거나 빼고 다시 계산한다.",gain:"What-if 결과가 렌즈와 가정에 따라 얼마나 달라지는지",
   say:["조조 · 위","f-cao","曹","그자가 내 편이었다면 결과가 달랐을까? 계산해 보아라. 단, 바람까지 따라온다고 장담하지는 마라."]}
];
const VIEWS=[{id:"home"},...ST,{id:"src"}];

/* ===== chrome ===== */
function drawChrome(){
  const a=(id,hz,b,s,i,done)=>`<li><a href="#${id}" class="${done?"done":""}" ${cur===i?'aria-current="page"':""}><span class="st">${done?ic("check"):hz}</span><span><b>${b}</b><small>${s}</small></span></a></li>`;
  $("#navH").innerHTML=a("home","始","처음 화면","여섯 단계 소개",0,false);
  $("#navE").innerHTML=ST.map((e,i)=>a(e.id,i+1,e.short,e.skill,i+1,S.done[i+1])).join("");
  $("#navS").innerHTML=a("src","典","사료와 데이터","무엇을 어떻게 셌나",7,false);
  const n=Object.keys(S.done).length;
  $("#progTxt").textContent=`완료한 단계 ${n} / 6`;$("#progBar").style.width=n/6*100+"%";
  $("#board").innerHTML=ST.map((e,i)=>`<li class="${S.done[i+1]?"":"ph"}"><a href="#${e.id}"><span class="bno">${i+1}</span><span class="bh">${e.q}<small>${S.done[i+1]?esc(S.done[i+1]):e.skill}</small></span>${S.done[i+1]?`<span class="vchip v-t">완료</span>`:`<span class="vchip">아직</span>`}</a></li>`).join("");
  $("#boardSum").innerHTML="";
  $("#nbBadge").textContent=n;$("#nbBadge").hidden=!n;$("#nbCountTop").textContent=`${n}/6`;
  ["tabH","tabS"].forEach(id=>$("#"+id).removeAttribute("aria-current"));
  $(cur===7?"#tabS":"#tabH").setAttribute("aria-current","page");
}
function notes(open){$("#notebook").classList.toggle("open",open);$("#scrim").classList.toggle("open",open)}
document.addEventListener("click",e=>{if(e.target.closest("[data-open-notes]"))notes(true);else if(e.target.closest("[data-close-notes]"))notes(false);else if(e.target.closest("#board a"))notes(false)});
document.addEventListener("keydown",e=>{if(e.key==="Escape")notes(false)});
function route(){const h=(location.hash||"").slice(1);let i=VIEWS.findIndex(v=>v.id===h);if(i<0)i=S.last??0;cur=i;S.last=i;save();notes(false);drawChrome();stopFx();RENDER[i]();startHeroFx();window.scrollTo?.({top:0})}
addEventListener("hashchange",route);

/* ===== shared ui ===== */
function drawTasks(){const el=$("#tasks");if(!el)return;el.innerHTML=TASKS.map(([m,k,l])=>`<span class="task ${tk(m,k)?"ok":""}"><span class="tk">${tk(m,k)?ic("check"):""}</span>${l}</span>`).join("");const q=$("#qbox");if(q)q.classList.toggle("locked",!TASKS.every(([m,k])=>tk(m,k)))}
const step=(n,title,sub,body)=>`<section class="stepsec"><header class="step-h"><span class="sno">STEP ${n}</span><h2>${title}</h2>${sub?`<p>${sub}</p>`:""}</header>${body}</section>`;
function hero({hz,where,title,sub,fx,say}){return `<section class="scene-hero" data-fx="${fx}"><canvas class="fx" aria-hidden="true"></canvas><div class="lb" aria-hidden="true"></div><div class="hero-in"><p class="hero-meta"><span class="hz">${hz}</span><span>${where}</span></p><h1>${title}</h1><p class="hero-sub">${sub}</p>${say?`<figure class="subtitle"><blockquote>${say[3]}</blockquote><figcaption><span class="face ${say[1]}" aria-hidden="true">${say[2]}</span>${say[0]}</figcaption></figure>`:""}</div></section>`}
function stage(i,tasks,steps,chk){
  const e=ST[i-1];TASKS=tasks;
  const stepper=`<nav class="stepper" aria-label="단계 목록">${ST.map((x,j)=>`<a href="#${x.id}" class="${S.done[j+1]?"done":""}" ${j+1===i?'aria-current="page"':""}><span class="st">${S.done[j+1]?ic("check"):j+1}</span>${x.short}</a>`).join("")}</nav>`;
  const nsteps=steps.split('class="stepsec"').length;
  $("#main").innerHTML=`${stepper}${hero({hz:e.hz,where:e.where,title:e.q,sub:`<span class="reg rec">단계 ${i} / 6</span>배우는 것 · ${e.skill}`,fx:e.fx,say:e.say})}
  <section class="card brief3"><div><span>이번 질문</span><b>${e.q}</b></div><div><span>왜 필요한가</span><p>${e.why}</p></div><div><span>끝나면 알게 되는 것</span><p>${e.gain}</p></div></section>
  <div class="card taskbar"><div class="tasks" id="tasks" aria-label="확인 전에 할 일"></div><button class="btn ghost nb-open" data-open-notes>${ic("note")}배운 것 <span class="num">${Object.keys(S.done).length}/6</span></button></div>
  ${steps}${step(nsteps,"정리한다","이 단계에서 확인한 것을 한 문장으로 고른다.",`<section class="card q" id="qbox"><div id="vbox" style="display:grid;gap:12px"></div></section>`)}
  <div class="pager">${i>1?`<a class="btn ghost" href="#${ST[i-2].id}">${ic("left")}단계 ${i-1}</a>`:`<a class="btn ghost" href="#home">${ic("left")}처음 화면</a>`}${i<6?`<a class="btn" href="#${ST[i].id}">단계 ${i+1}${ic("right")}</a>`:`<a class="btn" href="#home">처음 화면${ic("right")}</a>`}</div>`;
  $$(".pager a").forEach(a=>a.style.textDecoration="none");drawTasks();
  const box=$("#vbox");
  box.innerHTML=`<h3>${chk.q}</h3><p class="lockline">${ic("lock")}위의 할 일을 마치면 고를 수 있다.</p><div class="opts">${chk.opts.map((o,k)=>`<button class="opt" data-i="${k}"><span class="k">${"ABC"[k]}</span><span>${o}</span></button>`).join("")}</div><div class="fbx" aria-live="polite"></div>`;
  const show=k=>{const ok=k===chk.ok;box.querySelectorAll(".opt").forEach(o=>{o.classList.remove("wrong");if(ok&&+o.dataset.i===chk.ok)o.classList.add("right")});if(!ok)box.querySelector(`.opt[data-i="${k}"]`).classList.add("wrong");
    const ev=typeof chk.ev==="function"?chk.ev():chk.ev;
    box.querySelector(".fbx").innerHTML=ok?`<div class="fb"><b>맞다.</b> ${chk.good}</div><div class="callout"><b>배운 것에 남김</b> ${esc(ev)}</div>`:`<div class="fb bad"><b>다시 볼 것.</b> ${chk.bad}</div>`;
    if(ok){box.querySelectorAll(".opt").forEach(o=>o.disabled=true);S.done[i]=ev;save();drawChrome()}};
  box.querySelector(".opts").addEventListener("click",ev=>{const b=ev.target.closest(".opt");if(!b||b.disabled)return;show(+b.dataset.i)});
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
  $("#main").innerHTML=`${hero({hz:"赤 壁",where:"208년 겨울 · 장강",title:"삼국지로도 데이터분석을 할 수 있을까?",sub:`<span class="reg rec">삼국지로 배우는 데이터분석</span>적벽대전 편`,fx:"embers"})}
  <section class="card pane home-lead"><p>적벽대전을 그린 소설과 역사책의 기록을 숫자로 바꿔, 두 진영의 전력을 비교하고 마지막에는 '만약 그 사람이 다른 편이었다면?'을 계산해 본다. 여섯 단계, 단계마다 5분.</p>
    <a class="btn" href="#${ST[next<0?0:next].id}" style="text-decoration:none">${n?(n===6?"처음부터 다시 보기":`이어서 단계 ${next+1}`):"단계 1부터 시작"}${ic("right")}</a></section>
  <section class="card pane primer"><div class="pane-h"><h2>${ic("book")}먼저 알아 둘 것</h2><a class="meta" href="#src">데이터 더 보기</a></div>
    <div class="primer-row"><div><span>적벽대전</span><p>208년 겨울, 조조의 대군(위)을 손권(오)·유비(촉) 연합군이 장강에서 불로 물리친 싸움.</p></div>
    <div><span>사용하는 기록</span><p>${srcB("yy","삼국지연의")} 1300년대 소설. 적벽은 120개 이야기 묶음(<b>회</b>) 중 <b>43~50회</b>에 나온다.</p><p>${srcB("jb","정사 삼국지")} 280년대 역사책. 인물별 전기(열전)로 되어 있다.</p></div></div>
    <ol class="chap-strip">${[["43","설전"],["44","주유 설득"],["45","장간의 실수"],["46","화살 10만 개"],["47","거짓 항복"],["48","강 위의 잔치"],["49","동남풍과 불"],["50","화용도"]].map(([a,b])=>`<li><b class="num">${a}회</b><span>${b}</span></li>`).join("")}</ol></section>
  <section class="eplist">${ST.map((e,i)=>`<a class="card epcard" href="#${e.id}"><span class="epno">단계 ${i+1} · ${e.skill}</span><b>${e.q}</b>${S.done[i+1]?`<span class="vchip v-t">완료</span>`:`<span class="vchip">아직</span>`}</a>`).join("")}</section>
  ${n===6?`<section class="card pane"><div class="pane-h"><h2>${ic("note")}여섯 단계에서 배운 것</h2></div><ol class="sumlist">${ST.map((e,i)=>`<li><span class="vchip v-t">${i+1}</span><span><b>${e.q}</b><small>${esc(S.done[i+1]||"")}</small></span></li>`).join("")}</ol><button class="btn ghost" id="reset">${ic("reset")}처음부터 다시</button></section>`:""}`;
  $("#reset")&&($("#reset").onclick=()=>{S={done:{},t:{},rule:{min:2,dead:1},w:{ship:3,fire:3,plan:2},seenIntro:1};save();location.hash="#s1";route()});
}

/* ===== S1 참전 명단 ===== */
function s1(){
  const L=S.t.s1x=S.t.s1x||{};
  stage(1,[["s1","look","기록 한 줄 살펴보기"],["s1","min","등장 기준 바꿔 보기"],["s1","dead","사망자 규칙 바꿔 보기"]],
    step(1,"기록이 어떻게 생겼는지 본다","seed DB의 연의 기록은 '이 인물이 이 회에 나왔고, 이름이 들어간 문단은 이것들이다'라는 한 줄로 되어 있다. 모두 186줄, 63명.",
    `<section class="card pane"><div class="pane-h"><h2>${ic("table")}기록 186줄 중 일부</h2>${srcB("yy","연의 43–50회")}</div>
      <div class="tscroll"><table class="data rec"><thead><tr><th>인물</th><th>진영</th><th class="n">회</th><th class="n">문단</th><th>문단 원문(번역) 중 하나</th></tr></thead><tbody id="recs"></tbody></table></div>
      <button class="btn ghost" id="more">${ic("search")}다른 기록 보기</button></section>`)+
    step(2,"명단 규칙을 정한다","이름이 한 번 언급된 사람까지 참전자로 볼지, 이미 죽은 사람을 뺄지 정한다. 여기서 정한 명단이 단계 2~6의 모든 계산에 쓰인다.",
    `<div class="cols"><section class="card pane"><div class="pane-h"><h2>${ic("sliders")}명단 규칙</h2></div>
      <div class="field">최소 몇 회에 나와야 참전으로 볼까?${seg("rMin",[[1,"1회 이상"],[2,"2회 이상"],[3,"3회 이상"],[4,"4회 이상"]],S.rule.min,"최소 등장 회")}</div>
      <div class="field">적벽(208년) 이전에 죽은 인물은?${seg("rDead",[[1,"뺀다"],[0,"포함한다"]],S.rule.dead,"사망자 처리")}</div>
      <p class="cap">기록은 이름만 나와도 한 줄로 남기 때문에, 적벽 이전에 이미 죽은 인물이 대화 속에 언급되기만 해도 장부에 들어 있다. 진영은 정사가 인물을 위·촉·오로 나눠 실은 분류를 따른다.</p>
      <div class="callout" id="rRead" aria-live="polite"></div></section>
      <section class="card pane"><div class="pane-h"><h2>${ic("note")}현재 명단</h2><span class="meta" id="rCnt"></span></div><div class="roster" id="roster"></div></section></div>`),
    {q:"참전 장수 명단에 대해 맞는 말은?",opts:["명단은 사료가 정해 준다","명단은 내가 정한 규칙에 따라 달라진다","이름이 나온 사람은 모두 참전했다"],ok:1,
     good:"같은 186줄이라도 '몇 회 이상', '사망자 제외' 같은 규칙에 따라 명단이 바뀐다. 데이터분석은 이 규칙을 정하는 데서 시작한다.",bad:"규칙을 바꿀 때마다 명단 인원이 어떻게 바뀌었는지 다시 볼 것.",
     ev:()=>{const r=roster();return `명단 규칙(${S.rule.min}회 이상${S.rule.dead?", 사망자 제외":""}) → 위 ${r.filter(n=>PP[n].f==="wei").length} · 오 ${r.filter(n=>PP[n].f==="wu").length} · 촉 ${r.filter(n=>PP[n].f==="shu").length}명`}});
  const pool=Object.keys(EVID).filter(n=>PP[n]);let off=0;
  function recs(){const pick=[0,1,2].map(j=>pool[(off+j*7)%pool.length]);
    $("#recs").innerHTML=pick.map(n=>{const e=Object.values(EVID[n])[0];return `<tr><td>${PP[n].ko}</td><td><i class="dot" style="background:${fcol(PP[n].f)}"></i>${FN[PP[n].f]}</td><td class="n">${e[0]}</td><td class="n">${PP[n].ch[e[0]-43]}</td><td class="excerpt">${esc(e[1].slice(0,90))}…</td></tr>`}).join("")}
  recs();$("#more").onclick=()=>{off+=3;setT("s1","look");recs()};
  function d(){
    const r=roster(),all=NAMES.length;
    $("#rCnt").textContent=`${r.length}명 / 전체 ${all}명`;
    $("#roster").innerHTML=FS.map(f=>{const m=r.filter(n=>PP[n].f===f);return `<div class="rgroup"><p><i class="dot" style="background:${fcol(f)}"></i>${FN[f]} <b class="num">${m.length}</b>명</p><div class="chips2">${m.map(n=>`<span class="pchip">${PP[n].ko}<small class="num">${PP[n].chs}</small></span>`).join("")}</div></div>`}).join("");
    const out=NAMES.filter(n=>!r.includes(n));
    $("#rRead").innerHTML=`빠진 사람 ${out.length}명. ${S.rule.dead?"적벽과 무관하게 이름만 언급된 사망자는 뺐다. ":"이름만 언급된 사망자도 들어 있다. "}${S.rule.min>1?`${S.rule.min}회 미만 등장자는 이름만 스쳐 간 인물로 보고 뺐다.`:"한 번만 언급된 사람도 모두 포함했다."}`;
  }
  onSeg("rMin",v=>{S.rule.min=+v;setT("s1","min");save();d()});
  onSeg("rDead",v=>{S.rule.dead=+v;setT("s1","dead");save();d()});
  d();
}

/* ===== S2 평균의 함정 ===== */
function s2(){
  const L=S.t.s2x=S.t.s2x||{stat:"sum",g:"three",drop:0};
  stage(2,[["s2","sum","합계 보기"],["s2","mean","평균 보기"],["s2","med","중앙값 보기"],["s2","drop","최고값 빼고 보기"]],
    step(1,"요약값 하나로 비교한다","지표: 인물별 '이름이 나온 문단 수'(존재감). 진영마다 합계·평균·중앙값으로 요약해 본다.",
    `<section class="card pane"><div class="pane-h"><h2>${ic("chart")}진영별 존재감</h2>${srcB("yy","연의 43–50회")}</div>
      <div class="ctrls">${seg("st",[["sum","합계"],["mean","1인당 평균"],["med","중앙값"]],L.stat,"요약 방식")}${seg("gp",[["three","위·오·촉"],["ally","위 vs 연합"]],L.g,"묶음")}</div>
      <div class="bars" id="sbars"></div><div class="callout" id="sread" aria-live="polite"></div></section>`)+
    step(2,"점 하나하나를 본다","요약값 뒤에 있는 인물 한 명 한 명을 점으로 찍어 본다. 가장 큰 점을 빼면 요약값이 어떻게 변하는지 본다.",
    `<section class="card pane"><div class="pane-h"><h2>${ic("table")}인물별 분포</h2><label class="toggle"><input type="checkbox" id="drop" ${L.drop?"checked":""}> 진영별 최고값 빼고 보기</label></div>
      <div id="strip" class="strip"></div><p class="cap">점 하나 = 인물 한 명, 가로축 = 이름이 나온 문단 수. 점에 마우스를 올리거나 누르면 이름이 보인다.</p></section>`),
    {q:"촉의 1인당 평균이 가장 높은 이유로 가장 알맞은 것은?",opts:["촉 장수들이 고르게 많이 나와서","한 명(제갈량)이 평균을 크게 끌어올려서","촉 인원이 가장 많아서"],ok:1,
     good:"촉 문단의 절반 이상이 제갈량 한 명이다. 평균은 극단값에 끌려가므로 중앙값과 분포를 함께 봐야 한다.",bad:"점 그림에서 촉의 점들이 어떻게 퍼져 있는지, 최고값을 빼면 평균이 어떻게 되는지 다시 볼 것.",
     ev:()=>{const r=roster(),v=f=>r.filter(n=>PP[n].f===f).map(n=>PP[n].pa);return `1인당 평균 촉 ${fmt(avg(v("shu")))} · 오 ${fmt(avg(v("wu")))} · 위 ${fmt(avg(v("wei")))} / 중앙값 촉 ${fmt(median(v("shu")))} · 오 ${fmt(median(v("wu")))} · 위 ${fmt(median(v("wei")))}`}});
  function vals(g){let m=roster().filter(n=>inG(n,g)).map(n=>PP[n].pa);if(L.drop&&m.length>1){m=[...m].sort((a,b)=>b-a).slice(1)}return m}
  function d(){
    const G=groups(L.g);const agg=a=>L.stat==="sum"?a.reduce((x,y)=>x+y,0):L.stat==="mean"?avg(a):median(a);
    const items=G.map(([g,l,c])=>({label:l,v:agg(vals(g)),c}));bars($("#sbars"),items,Math.max(...items.map(x=>x.v)),"");
    const top=[...items].sort((a,b)=>b.v-a.v)[0];
    const r=roster(),shu=r.filter(n=>PP[n].f==="shu"),shuT=shu.reduce((a,n)=>a+PP[n].pa,0),zg=PP["諸葛亮"];
    $("#sread").innerHTML=`<b>${L.stat==="sum"?"합계":L.stat==="mean"?"1인당 평균":"중앙값"}</b>으로 보면 ${top.label}${jo(top.label,"이","가")} 가장 크다.${L.stat==="sum"?" 합계는 인원이 많은 쪽이 유리하다.":""}${L.stat==="mean"&&shu.includes("諸葛亮")?` 촉 ${shuT}문단 중 ${zg.pa}문단(${Math.round(zg.pa/shuT*100)}%)이 제갈량 한 명이다.`:""}${L.drop?" (진영별 최고값 제외)":""}`;
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
  stage(3,[["s3","weight","가중치 정하기"],["s3","evid","근거 문단 열어 보기"]],
    step(1,"지표를 만든다","인물의 이름이 들어간 문단에 아래 글자가 함께 나오면 그 지표에 1을 더한다. 바람(風)은 사람의 능력이 아니라 날씨이므로 전력 점수에서 뺀다.",
    `<section class="card pane"><div class="pane-h"><h2>${ic("note")}지표 정의</h2>${srcB("yy","연의 문단 원문")}</div>
      <div class="kdef">${["ship","fire","plan"].map(k=>`<div><b>${KN[k]}</b><span class="num">${KW[k]}</span></div>`).join("")}<div class="muted"><b>바람</b><span class="num">${KW.wind}</span><small>환경 조건 · 단계 6에서 따로 다룬다</small></div></div></section>`)+
    step(2,"가중치를 정해 점수로 묶는다","강 위에서 불로 싸운 전투이니 수전·화공에 더 큰 점수를 줄 수도 있다. 점수는 내가 정하는 가정이다.",
    `<div class="cols"><section class="card pane asm"><div class="pane-h"><h2>${ic("sliders")}가중치</h2><span class="reg asm">내 규칙</span></div>
      <div class="weights" id="wts"></div><div class="formula" id="wform"></div></section>
      <section class="card pane"><div class="pane-h"><h2>${ic("chart")}진영별 전력 점수</h2>${seg("gp3",[["ally","위 vs 연합"],["three","위·오·촉"]],L.g,"묶음")}</div>
      <div class="stack" id="stack"></div><div class="callout" id="s3read" aria-live="polite"></div></section></div>
    <div class="cols"><section class="card pane"><div class="pane-h"><h2>${ic("table")}인물별 지표</h2><span class="meta">행을 누르면 근거 문단</span></div>
      <div class="tscroll"><table class="data"><thead><tr><th>인물</th><th class="n">수전</th><th class="n">화공</th><th class="n">계책</th><th class="n">점수</th></tr></thead><tbody id="ptab"></tbody></table></div></section>
      <section class="card pane" id="evbox" aria-live="polite"></section></div>`),
    {q:"이 '전력 점수'가 실제로 재는 것은?",opts:["장수의 실제 능력","그 인물이 나온 문단에 수전·화공·계책 관련 글자가 함께 나온 정도","전투에서 세운 공의 크기"],ok:1,
     good:"텍스트에서 만든 지표는 '능력'이 아니라 '함께 나온 글자'의 양이다. 그래도 같은 규칙으로 세면 진영을 비교할 수 있다. 이 지표를 믿어도 되는지는 단계 5에서 확인한다.",bad:"지표 정의 카드를 다시 볼 것. 무엇을 세었는지가 지표의 의미다.",
     ev:()=>{const s=fs("yy");return `연의 전력 점수(수전 ${S.w.ship}·화공 ${S.w.fire}·계책 ${S.w.plan}점): 연합 ${s.wu+s.shu} vs 위 ${s.wei}`}});
  function dW(){
    const row=(k)=>`<div class="w"><span>${KN[k]} 1회당</span><span class="stepper-n"><button data-w="${k}" data-d="-1" aria-label="${KN[k]} 줄이기">−</button><output class="num">${S.w[k]}점</output><button data-w="${k}" data-d="1" aria-label="${KN[k]} 늘리기">+</button></span></div>`;
    $("#wts").innerHTML=["ship","fire","plan"].map(row).join("");
    $("#wform").innerHTML=`전력 점수 = 수전×<b>${S.w.ship}</b> + 화공×<b>${S.w.fire}</b> + 계책×<b>${S.w.plan}</b>`;
  }
  function d(){
    const r=roster(),G=groups(L.g);
    const parts=G.map(([g,l,c])=>{const m=r.filter(n=>inG(n,g));const p=["ship","fire","plan"].map(k=>m.reduce((a,n)=>a+S.w[k]*PP[n].yy[KI[k]],0));return {l,c,p,t:p.reduce((a,b)=>a+b,0)}});
    const mx=Math.max(...parts.map(x=>x.t))||1;
    $("#stack").innerHTML=parts.map(x=>`<div class="srow2"><span><i class="dot" style="background:${x.c}"></i>${x.l}</span><span class="stk">${x.p.map((v,j)=>`<i class="seg${j}" style="width:${v/mx*100}%" title="${["수전","화공","계책"][j]} ${v}"></i>`).join("")}</span><b class="num">${x.t}</b></div>`).join("")+`<div class="legend"><span><i class="dot seg0"></i>수전</span><span><i class="dot seg1"></i>화공</span><span><i class="dot seg2"></i>계책</span></div>`;
    const s=fs("yy");$("#s3read").innerHTML=`연합 <b>${s.wu+s.shu}</b> 대 위 <b>${s.wei}</b>. 연합이 약 ${fmt((s.wu+s.shu)/Math.max(1,s.wei))}배. 오나라가 연합 점수의 ${Math.round(s.wu/(s.wu+s.shu)*100)}%를 차지한다.`;
    const top=r.map(n=>({n,s:scoreOf(n,"yy")})).sort((a,b)=>b.s-a.s).slice(0,10);
    $("#ptab").innerHTML=top.map(x=>`<tr class="clk ${x.n===L.sel?"flag":""}" data-n="${x.n}" tabindex="0"><td><i class="dot" style="background:${fcol(PP[x.n].f)}"></i>${PP[x.n].ko}</td><td class="n">${PP[x.n].yy[0]}</td><td class="n">${PP[x.n].yy[1]}</td><td class="n">${PP[x.n].yy[2]}</td><td class="n"><b>${x.s}</b></td></tr>`).join("");
    dE();
  }
  function dE(){const n=L.sel,e=(EVID[n]||{})[L.k];
    $("#evbox").innerHTML=`<div class="pane-h"><h2>${ic("scroll")}근거 문단 · ${PP[n].ko}</h2>${seg("ek",[["ship","수전"],["fire","화공"],["plan","계책"]],L.k,"지표")}</div>${e?`<p class="cap">${srcB("yy",`연의 ${e[0]}회`)} 이 인물과 '${KN[L.k]}' 글자가 함께 나온 문단 중 하나 (번역)</p><blockquote class="evq">${esc(e[1])}</blockquote>`:`<p class="empty">이 지표의 번역 문단이 없다.</p>`}`;
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
  stage(4,[["s4","run","215가지 규칙 돌려 보기"],["s4","alt","조건을 바꿔 다시 돌리기"]],
    step(1,"가중치를 모두 바꿔 본다","수전·화공·계책 가중치를 각각 0~5점으로 바꾼 모든 조합(0·0·0 제외, 215가지)으로 다시 계산해, 연합이 앞서는 조합이 몇 개인지 센다.",
    `<section class="card pane"><div class="pane-h"><h2>${ic("sliders")}검사 조건</h2></div>
      <div class="ctrls"><div class="field">어느 기록으로 셀까${seg("lens4",[["yy","연의"],["jb","정사 본문"]],L.lens||"yy","사료")}</div><div class="field">어떻게 비교할까${seg("agg4",[["sum","진영 합계"],["cap","1인당 평균"]],L.agg||"sum","집계")}</div></div>
      <button class="btn" id="run">${ic("chart")}215가지 규칙으로 돌려 보기</button><div id="sweep" aria-live="polite"></div></section>`)+
    step(2,"결과를 표로 모은다","지금까지 돌려 본 조건별 결과. 모든 조건에서 같은 결론이면 '강건하다', 조건에 따라 뒤집히면 '가정에 기댄다'고 말한다.",
    `<section class="card pane"><div class="tscroll"><table class="data"><thead><tr><th>사료</th><th>집계</th><th>명단</th><th class="n">연합 우세 조합</th><th>판단</th></tr></thead><tbody id="sweeps"></tbody></table></div></section>`),
    {q:"가중치를 바꿔도 연합 우세가 유지된다는 것의 뜻은?",opts:["가중치는 전혀 중요하지 않다","이 결론은 가중치 선택에 강건하다. 다만 다른 조건(사료·집계)에서도 따로 확인해야 한다","연합이 반드시 이긴다"],ok:1,
     good:"가정을 흔들어도 결론이 유지되면 그 결론을 더 믿을 수 있다. 하지만 사료나 집계 방식을 바꾸면 일부 조합에서 결과가 달라질 수 있으므로 함께 밝혀야 한다.",bad:"조건별 결과 표를 다시 볼 것.",
     ev:()=>{const rs=L.runs||[];return rs.length?rs.map(x=>`${x.lens==="yy"?"연의":"정사"}·${x.agg==="sum"?"합계":"1인당"} ${x.win}/${x.tot}`).join(" · "):"민감도 분석"}});
  L.runs=L.runs||[];
  function sweep(lens,agg){let win=0,tot=0;const r=roster(),A=r.filter(n=>PP[n].f!=="wei"),W=r.filter(n=>PP[n].f==="wei");let close=null;
    for(let a=0;a<=5;a++)for(let b=0;b<=5;b++)for(let c=0;c<=5;c++){if(!a&&!b&&!c)continue;const w={ship:a,fire:b,plan:c};
      let sa=A.reduce((s,n)=>s+scoreOf(n,lens,w),0),sw=W.reduce((s,n)=>s+scoreOf(n,lens,w),0);if(agg==="cap"){sa/=A.length;sw/=W.length}
      tot++;if(sa>sw)win++;const ratio=sa/(sw||1);if(!close||Math.abs(ratio-1)<Math.abs(close.r-1))close={r:ratio,w}}
    return {win,tot,close}}
  function dRuns(){$("#sweeps").innerHTML=L.runs.length?L.runs.map(x=>`<tr><td>${x.lens==="yy"?srcB("yy"):srcB("jb")}</td><td>${x.agg==="sum"?"진영 합계":"1인당 평균"}</td><td class="num">${x.rule}</td><td class="n"><b>${x.win}</b> / ${x.tot}</td><td>${x.win===x.tot?"강건":x.win>x.tot/2?"대체로 연합 우세":"가정에 따라 뒤집힘"}</td></tr>`).join(""):`<tr><td colspan="5" class="empty">위에서 돌려 본 결과가 여기에 쌓인다.</td></tr>`}
  function run(){const lens=L.lens||"yy",agg=L.agg||"sum",res=sweep(lens,agg);
    const rule=`${S.rule.min}회↑${S.rule.dead?"·사망자 제외":""}`;
    const key=lens+agg+rule;L.runs=L.runs.filter(x=>x.key!==key);L.runs.push({key,lens,agg,rule,win:res.win,tot:res.tot});
    if(L.runs.length>=2)setT("s4","alt");setT("s4","run");save();
    const pct=Math.round(res.win/res.tot*100),c=res.close;
    $("#sweep").innerHTML=`<div class="sweepres"><div class="big num">${res.win}<small> / ${res.tot}</small></div><div><b>${pct}%의 규칙에서 연합이 앞선다.</b><p>가장 아슬아슬한 규칙: 수전 ${c.w.ship}·화공 ${c.w.fire}·계책 ${c.w.plan}점 (연합/위 = ${c.r.toFixed(2)}배)</p></div></div><div class="pctbar"><i style="width:${pct}%"></i></div>`;dRuns()}
  onSeg("lens4",v=>{L.lens=v;save()});onSeg("agg4",v=>{L.agg=v;save()});
  $("#run").onclick=run;dRuns();
}

/* ===== S5 지표 검증 ===== */
function s5(){
  const L=S.t.s5x=S.t.s5x||{};
  stage(5,[["s5","victim","조조의 '화공' 근거 읽기"],["s5","cmp","연의 vs 정사 비교"]],
    step(1,"높은 점수의 근거를 직접 읽는다","조조는 화공 지표가 높다. 정말 불을 잘 다뤘을까? 근거 문단을 읽어 본다.",
    `<div class="cols"><section class="card pane"><div class="pane-h"><h2>${ic("table")}화공 지표 상위</h2>${srcB("yy")}</div><div class="bars" id="firetop"></div></section>
      <section class="card pane"><div class="pane-h"><h2>${ic("scroll")}조조 · 화공 근거</h2>${srcB("yy",`연의 ${(EVID["曹操"]||{}).fire?.[0]||""}회`)}</div>
        <button class="btn ghost" id="openv">${ic("search")}근거 문단 열기</button><div id="vict"></div></section></div>`)+
    step(2,"같은 지표를 역사책으로 잰다","정사 열전의 문장에서 같은 글자를 센다. 단위가 다르므로(문단 vs 문장) 숫자 대신 진영별 '비중(%)'을 비교한다.",
    `<section class="card pane"><div class="pane-h"><h2>${ic("chart")}진영별 점수 비중</h2>${seg("lay5",[["jb","정사 본문"],["all","본문 + 주석"]],L.lay||"jb","정사 층")}</div>
      <div class="cmp5" id="cmp5"></div><div class="callout" id="r5" aria-live="polite"></div></section>
    <section class="card pane"><div class="pane-h"><h2>${ic("table")}인물별 비교</h2><span class="meta">연의 문단 · 정사 문장</span></div>
      <div class="tscroll"><table class="data"><thead><tr><th>인물</th><th class="n">연의 수전</th><th class="n">정사 수전</th><th class="n">연의 화공</th><th class="n">정사 화공</th><th class="n">연의 계책</th><th class="n">정사 계책</th></tr></thead><tbody id="ptab5"></tbody></table></div></section>`),
    {q:"조조의 화공 지표가 높은 이유는?",opts:["조조가 화공의 달인이라서","불에 당한 장면에도 같은 글자가 나와서","데이터 입력 오류라서"],ok:1,
     good:"글자가 함께 나왔다는 것만으로는 불을 지른 쪽인지 당한 쪽인지 구분할 수 없다. 또 같은 지표를 정사로 재면 진영별 비중이 달라진다(촉은 줄어든다). 지표의 의미와 출처를 함께 밝혀야 한다.",bad:"근거 문단을 다시 읽어 볼 것. 조조가 무엇을 하고 있는가?",
     ev:()=>{const a=share("yy"),b=share("jb");return `조조의 화공 ${PP["曹操"].yy[1]}은 불에 당한 기록 · 촉 비중 연의 ${a.shu}% → 정사 본문 ${b.shu}%`}});
  const r=roster(),ft=r.map(n=>({n,v:PP[n].yy[1]})).sort((a,b)=>b.v-a.v).slice(0,6);
  bars($("#firetop"),ft.map(x=>({label:PP[x.n].ko,v:x.v,c:fcol(PP[x.n].f)})),ft[0].v,"문단");
  const showV=()=>{const e=(EVID["曹操"]||{}).fire;$("#vict").innerHTML=e?`<blockquote class="evq">${esc(e[1])}</blockquote><p class="cap">조조는 불을 지르는 쪽이 아니라 불에 놀라 달아나는 쪽이다.</p>`:""};
  $("#openv").onclick=()=>{setT("s5","victim");showV()};if(tk("s5","victim"))showV();
  function share(lens){const s=fs(lens),t=s.wei+s.wu+s.shu||1;return {wei:Math.round(s.wei/t*100),wu:Math.round(s.wu/t*100),shu:Math.round(s.shu/t*100)}}
  function d(){const lay=L.lay||"jb",a=share("yy"),b=share(lay);
    $("#cmp5").innerHTML=[["yy","연의",a],[lay,lay==="jb"?"정사 본문":"정사 본문+주석",b]].map(([k,l,s])=>`<div class="srow2"><span>${srcB(k==="all"?"jn":k,l)}</span><span class="stk">${FS.map(f=>`<i style="width:${s[f]}%;background:${fcol(f)}" title="${FN[f]} ${s[f]}%"></i>`).join("")}</span><b class="num"></b></div>`).join("")+`<div class="legend">${FS.map(f=>`<span><i class="dot" style="background:${fcol(f)}"></i>${FN[f]}</span>`).join("")}</div>`;
    $("#r5").innerHTML=`촉의 비중: 연의 <b>${a.shu}%</b> → ${lay==="jb"?"정사 본문":"정사+주석"} <b>${b.shu}%</b>. 오: ${a.wu}% → ${b.wu}%. 위: ${a.wei}% → ${b.wei}%. 연의에서 비중이 더 큰 쪽이 소설이 키운 쪽이다.`;
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
  stage(6,[["s6","run","시나리오 2개 이상 기록"],["s6","lens","렌즈 바꿔 보기"],["s6","wmode","바람 관점 바꿔 보기"]],
    step(1,"시나리오를 고른다","인물 한 명을 다른 진영으로 옮기거나 뺀다. 명단(단계 1)과 가중치(단계 3)는 지금까지 정한 그대로 쓴다.",
    `<section class="card pane"><div class="pane-h"><h2>${ic("sliders")}만약…</h2><span class="meta">빠른 선택</span></div>
      <div class="presets" id="presets">${[["諸葛亮","wei","제갈량이 위나라였다면"],["龐統","out","방통이 없었다면"],["周瑜","wei","주유가 위나라였다면"],["黃蓋","out","황개가 없었다면"],["曹操","wu","조조가 오나라였다면"]].map(([n,a,t])=>`<button class="chip" data-n="${n}" data-a="${a}">${t}</button>`).join("")}</div>
      <div class="ctrls"><label class="field">인물<select id="who"></select></label><div class="field">어떻게${seg("act",[["wei","위로"],["wu","오로"],["shu","촉으로"],["out","없었다면"]],L.act,"이동")}</div></div>
      <div class="ctrls"><div class="field">어느 기록으로 셀까${seg("lens6",[["yy","연의"],["jb","정사 본문"]],L.lens,"렌즈")}</div><div class="field">그날 바람은${seg("wind",[[1,"불었다"],[0,"불지 않았다"]],L.wind,"바람")}</div></div>
      <div class="field">바람을 무엇으로 볼까${seg("wmode",[["env","날씨 (누구 편도 아님)"],["zg","제갈량의 능력 (연의처럼)"]],L.wmode,"바람 관점")}</div>
      <p class="cap">'제갈량의 능력'으로 보면 바람은 제갈량이 있는 쪽에 유리하게 분다. 제갈량이 없으면 불지 않는다. 이것도 하나의 가정이다.</p></section>`)+
    step(2,"다시 계산한다","전력 점수(수전·화공·계책)에 바람 보너스를 더해 '연합 우세 지수'를 구한다. 50이 팽팽함, 높을수록 연합 우세.",
    `<div class="cols"><section class="card pane"><div class="pane-h"><h2>${ic("chart")}전력 점수 · 전 → 후</h2><span id="l6"></span></div>
        <div class="cmp" id="bf"></div><div class="formula" id="f6"></div></section>
      <section class="card pane asm"><div class="pane-h"><h2>${ic("wind")}연합 우세 지수</h2><span class="reg asm">추정치</span></div>
        <div class="scene" id="scene6"></div>
        <div class="meter"><div class="meter-row"><span class="big" id="idx">0</span><span class="verdict" id="vd"></span></div><div class="track" aria-hidden="true"><i class="pin" id="pin6"></i></div><div class="scale"><span>위 우세</span><span>접전</span><span>연합 우세</span></div></div>
        <div class="callout" id="r6" aria-live="polite"></div><button class="btn wind" id="rec6">${ic("plus")}이 시나리오 기록하기</button></section></div>
    <div class="cols"><section class="card pane"><div class="pane-h"><h2>${ic("table")}이 인물의 연결</h2><span class="meta">같은 회에 함께 나온 횟수</span></div><div class="bars" id="links"></div><p class="cap" id="lcap"></p></section>
      <section class="card pane"><div class="pane-h"><h2>${ic("note")}시나리오 기록</h2></div><div class="tscroll"><table class="data"><thead><tr><th>#</th><th>시나리오</th><th>렌즈 · 바람</th><th class="n">지수</th></tr></thead><tbody id="runs6"></tbody></table></div></section></div>`),
    {q:"'제갈량이 위나라였다면 조조가 이겼다'고 말할 수 있을까?",opts:["그렇다, 계산 결과가 그렇다","단정할 수 없다. 렌즈와 바람에 대한 가정에 따라 결과가 크게 달라진다","아니다, 어떤 경우에도 연합이 이긴다"],ok:1,
     good:"같은 What-if라도 연의로 세는지 정사로 세는지, 바람을 날씨로 보는지 제갈량의 능력으로 보는지에 따라 지수가 크게 움직인다. What-if의 답은 '이 가정이라면 이렇다'의 형태로만 말할 수 있다.",bad:"렌즈와 바람 관점을 바꿨을 때 지수가 어떻게 움직였는지 시나리오 기록을 다시 볼 것.",
     ev:()=>{const rs=L.runs.slice(-3);return rs.length?rs.map(x=>`${x.t}(${x.lens==="yy"?"연의":"정사"}·${x.wd}) ${x.i}`).join(" / "):"What-if 실험"}});
  const r=roster();const cands=r.filter(n=>PP[n].pa>=8).sort((a,b)=>PP[b].pa-PP[a].pa);
  if(!cands.includes(L.who))L.who=cands[0];
  $("#who").innerHTML=cands.map(n=>`<option value="${n}" ${n===L.who?"selected":""}>${PP[n].ko} (${FN[PP[n].f]})</option>`).join("");
  const idxOf=(lens,mut,zgSide)=>{const s=fs(lens,S.w,r,mut),A=s.wu+s.shu,W=s.wei;let i=A+W?A/(A+W)*100:50;
    if(L.wind){if(L.wmode==="env")i+=L.wb;else{if(zgSide==="ally")i+=L.wb;else if(zgSide==="wei")i-=L.wb}}return {i:Math.max(0,Math.min(100,Math.round(i))),A,W}};
  const zgSideOf=mut=>{if(!r.includes("諸葛亮"))return null;const f=mut&&mut["諸葛亮"]!==undefined?mut["諸葛亮"]:"shu";return f===null?null:f==="wei"?"wei":"ally"};
  const vd=i=>i>=65?"연합 우세":i>=45?"접전":"위 우세";
  function d(){
    $("#act").querySelectorAll("button").forEach(b=>b.disabled=b.dataset.v===PP[L.who].f);
    if(L.act===PP[L.who].f){L.act="out";$$("#act button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.v==="out"))}
    const mut={[L.who]:L.act==="out"?null:L.act};
    const b0=idxOf(L.lens,null,zgSideOf(null)),b1=idxOf(L.lens,mut,zgSideOf(mut));
    $("#l6").innerHTML=srcB(L.lens);
    const mx=Math.max(b0.A,b0.W,b1.A,b1.W)||1;
    $("#bf").innerHTML=[["연합 · 전",b0.A,"var(--wu)",1],["연합 · 후",b1.A,"var(--wu)",0],["위 · 전",b0.W,"var(--wei)",1],["위 · 후",b1.W,"var(--wei)",0]].map(([l,v,c,base])=>`<div class="bar"><span>${l}</span><span class="track"><span class="fill ${base?"base":""}" style="width:${v/mx*100}%;${base?"":`background:${c}`}"></span></span><span class="v">${v}</span></div>`).join("");
    const ps=scoreOf(L.who,L.lens);
    $("#f6").innerHTML=`${PP[L.who].ko}의 점수 <b>${ps}</b> (${L.lens==="yy"?"연의":"정사 본문"}) → ${L.act==="out"?"양쪽에서 뺌":`${FN[PP[L.who].f]}에서 ${FN[L.act]}로 이동`}. 지수 = 연합 ÷ (연합+위) × 100 ${L.wind?`${L.wmode==="env"?"+":"±"} 바람 ${L.wb}`:"(바람 없음)"}`;
    $("#idx").textContent=b1.i;$("#vd").textContent=vd(b1.i);$("#pin6").style.left=`calc(${b1.i}% - 2px)`;
    const delta=b1.i-b0.i,nm=PP[L.who].ko;
    $("#r6").innerHTML=`기록대로 <b>${b0.i}</b>(${vd(b0.i)}) → 이 시나리오 <b>${b1.i}</b>(${vd(b1.i)}). ${delta===0?"변화 없음.":`${Math.abs(delta)}만큼 ${delta<0?"위 쪽으로":"연합 쪽으로"} 움직였다.`}${L.lens==="jb"&&Math.abs(delta)<4?` 정사로 세면 ${nm}${jo(nm,"의","의")} 비중이 작아 영향도 작다.`:""}${L.wmode==="zg"&&L.who==="諸葛亮"&&L.wind?" (바람이 제갈량을 따라간다는 가정)":""}`;
    dScene(b1.i,L.wind,L.act,mut);dLinks();
  }
  function dLinks(){const i=NAMES.indexOf(L.who),acc={wei:0,wu:0,shu:0};EDGES.forEach(([a,b,k])=>{const o=a===i?b:b===i?a:-1;if(o<0)return;const n=NAMES[o];if(!r.includes(n))return;acc[PP[n].f]+=k});
    const mx=Math.max(...FS.map(f=>acc[f]))||1;bars($("#links"),FS.map(f=>({label:FN[f],v:acc[f],c:fcol(f)})),mx,"");
    const top=[...FS].sort((a,b)=>acc[b]-acc[a])[0];$("#lcap").textContent=`${PP[L.who].ko}${jo(PP[L.who].ko,"은","는")} ${FN[top]} 인물들과 가장 많이 함께 나온다. 진영을 옮겨도 이야기 속 관계는 그대로라는 점이 이 모델의 한계다.`}
  function dScene(i,wind,act,mut){const burning=Math.round(i/100*6),xs=[340,378,416,454,492,530];
    const ship=(x,j)=>`<g transform="translate(${x},112)"><path d="M-17 0h34l-6 12h-22z" fill="var(--ink-2)"/><path d="M0 0v-26" stroke="var(--ink-2)" stroke-width="2"/><rect x="0" y="-26" width="12" height="8" fill="var(--wei)"/>${j<burning?`<g class="flame"><path d="M-8 0c0-9 6-11 4-19 7 5 11 11 9 19z" fill="var(--flame)"/><path d="M-3 0c0-5 3-7 2-11 4 3 6 7 5 11z" fill="var(--flame-2)"/></g>`:""}</g>`;
    const gai=[0,1,2].map(j=>`<g transform="translate(${70+j*44},${132+(j%2)*10})"><path d="M-14 0h28l-5 10h-18z" fill="var(--wu)"/><path d="M0 0v-18" stroke="var(--wu)" stroke-width="2"/><path d="M0-18l10 4-10 4" fill="var(--wu)"/></g>`).join("");
    const zs=zgSideOf(mut),against=L.wmode==="zg"&&zs==="wei";
    const w=wind&&!(L.wmode==="zg"&&zs===null)?[0,1,2].map(j=>against?`<path d="M${280-j*20} ${40+j*14}h-${120+j*30}" stroke="var(--wind)" stroke-width="2.5" fill="none" stroke-linecap="round"/>`:`<path d="M${40+j*20} ${40+j*14}h${120+j*30}" stroke="var(--wind)" stroke-width="2.5" fill="none" stroke-linecap="round"/>`).join("")+`<text x="40" y="26" style="font:600 12px var(--f-body);fill:var(--wind)">${against?"← 바람이 연합 쪽으로":"동남풍 →"}</text>`:`<text x="40" y="26" style="font:600 12px var(--f-body);fill:var(--ink-3)">바람 없음</text>`;
    $("#scene6").innerHTML=`<svg viewBox="0 0 600 180" role="img" aria-label="연합 우세 지수 ${i}, 불붙은 배 ${burning}척"><rect width="600" height="180" fill="var(--river)"/><rect y="150" width="600" height="30" fill="var(--river-2)"/>${w}<path d="M340 116H530" stroke="var(--ink-3)" stroke-width="2" stroke-dasharray="3 3"/>${xs.map(ship).join("")}${gai}<text x="560" y="170" text-anchor="end" style="font:12px var(--f-body);fill:var(--ink-2)">불붙은 배 ${burning} / 6</text><text x="40" y="170" style="font:12px var(--f-body);fill:var(--ink-2)">연합의 배</text></svg>`}
  function dRuns(){$("#runs6").innerHTML=L.runs.length?L.runs.map((x,i)=>`<tr><td class="n">${i+1}</td><td style="white-space:normal">${x.t}</td><td>${x.lens==="yy"?"연의":"정사"} · ${x.wd}</td><td class="n"><b>${x.i}</b></td></tr>`).join(""):`<tr><td colspan="4" class="empty">시나리오를 기록하면 여기에 쌓인다.</td></tr>`;if(L.runs.length>=2)setT("s6","run")}
  $("#who").addEventListener("change",e=>{L.who=e.target.value;save();d()});
  onSeg("act",v=>{L.act=v;save();d()});onSeg("lens6",v=>{L.lens=v;setT("s6","lens");save();d()});onSeg("wind",v=>{L.wind=+v;save();d()});onSeg("wmode",v=>{L.wmode=v;setT("s6","wmode");save();d()});
  $("#presets").addEventListener("click",e=>{const b=e.target.closest(".chip");if(!b)return;if(!r.includes(b.dataset.n)){$("#r6").innerHTML="이 인물은 현재 명단(단계 1)에 없다.";return}L.who=b.dataset.n;L.act=b.dataset.a;$("#who").value=L.who;$$("#act button").forEach(x=>x.setAttribute("aria-pressed",x.dataset.v===L.act));save();d()});
  $("#rec6").onclick=()=>{const mut={[L.who]:L.act==="out"?null:L.act},x=idxOf(L.lens,mut,zgSideOf(mut));L.runs.push({t:`${PP[L.who].ko} ${L.act==="out"?"없음":"→ "+FN[L.act]}`,lens:L.lens,wd:L.wind?(L.wmode==="env"?"바람=날씨":"바람=제갈량"):"바람 없음",i:x.i});if(L.runs.length>8)L.runs.shift();save();dRuns()};
  d();dRuns();
}

/* ===== 사료와 데이터 ===== */
function lib(){
  TASKS=[];
  $("#main").innerHTML=`${hero({hz:"史 料",where:"seed DB",title:"무엇을 어떻게 셌나",sub:`<span class="reg rec">참고</span>사료와 데이터`,fx:"mist"})}
    <section class="card pane"><div class="pane-h"><h2>${ic("table")}seed DB의 구성</h2></div>
      <div class="tscroll"><table class="data lib"><thead><tr><th>데이터</th><th>내용</th><th>쓰는 단계</th></tr></thead><tbody>
        <tr><td>${srcB("yy","연의 등장 기록")}</td><td>43–50회, 인물 63명, 186줄. 줄마다 그 인물의 이름이 들어간 문단 원문.</td><td>1 명단 · 2 존재감 · 3 지표</td></tr>
        <tr><td>${srcB("jb","정사 열전")}</td><td>63명의 전기 본문. 위·촉·오 분류는 정사의 분류를 따랐다.</td><td>1 진영 · 5 · 6 정사 렌즈</td></tr>
        <tr><td>${srcB("jn","배송지 주석")}</td><td>429년에 붙은 주. 『강표전』 등 다른 책 인용. 동남풍의 방향은 여기에만 나온다.</td><td>5 본문+주석</td></tr>
        <tr><td><span class="sb jb">동시 등장</span></td><td>같은 회에 함께 나온 인물 쌍 1,340개.</td><td>6 연결</td></tr>
        <tr><td><span class="sb yy">번역 문단</span></td><td>연의 문단의 우리말 번역 210개. 근거 문단 보기에 사용.</td><td>1 · 3 · 5</td></tr>
      </tbody></table></div></section>
    <section class="card pane"><div class="pane-h"><h2>${ic("note")}지표를 만든 규칙</h2></div>
      <ol class="rules"><li><b>존재감</b> = 이름이 들어간 문단 수 (한 문단에 여러 번 나와도 1).</li><li><b>수전·화공·계책</b> = 이름이 들어간 문단(정사는 문장)에 船·舟·水軍·艦 / 火·燒·焚 / 計·謀·策 중 하나가 함께 나온 수.</li><li><b>바람</b>(風)은 사람의 능력이 아닌 환경 조건으로 보고 전력 점수에서 뺐다.</li><li>정사와 연의는 단위가 달라(문장 vs 문단) 숫자 대신 비중으로 비교한다.</li></ol></section>`;
}
const RENDER=[home,s1,s2,s3,s4,s5,s6,lib];

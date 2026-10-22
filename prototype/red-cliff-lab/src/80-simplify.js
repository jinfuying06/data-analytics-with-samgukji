/* Draft: simpler presentation layer. Calculations and data are unchanged.
   Principle: one thing to do and one result per screen; terms are named only after the learner has done the thing. */

/* ---------- home: question, one-line story, prediction, start ---------- */
const journeyHomeFull=journeyHome;
journeyHome=function(){
 journeyHomeFull();
 const main=$("#main");main.classList.add("simple");
 main.querySelector('.experiment-intro')?.remove();
 main.querySelector('.experiment-river figcaption')?.remove();
 main.querySelector('.experiment-edition').textContent='『삼국지연의』로 해 보는 데이터 실험';
 main.querySelector('.experiment-heading').insertAdjacentHTML('beforeend',
  `<p class="simple-story">208년 겨울, 손권·유비 연합군은 불로 조조군을 물리쳤습니다.<br><b>제갈량이 조조 편에 있었다면</b> 어떻게 됐을까요?</p>`);
 main.querySelector('.prediction-form legend').textContent='먼저 예상해 보세요';
 for(const sel of ['.journey-background','.journey-condition','.background-method'])main.querySelector(sel)?.remove();
 const status=$("#prediction-status");if(status&&!Number.isInteger(S.prediction))status.textContent='';
 const outline=main.querySelector('.journey-outline summary');if(outline)outline.firstChild.textContent='6단계 · 약 30분 ';
};
RENDER[0]=journeyHome;

/* ---------- every stage: one "할 일" line; purpose folded; activity chips hidden ---------- */
const SIMPLE_TODO=[
 "네 사람을 보고, 셀지 뺄지 골라 보세요.",
 "합계·평균·중앙값을 바꿔 보며, 누가 숫자를 끌어올리는지 찾으세요.",
 "배·불·계책에 몇 점을 줄지 정하고, 두 진영의 점수를 비교하세요.",
 "점수 규칙 215가지를 한 번에 돌려, 결론이 바뀌는지 확인하세요.",
 "조조의 '불' 점수가 어디서 왔는지 원문으로 확인하세요.",
 "제갈량을 조조 편으로 옮기고, 처음 예상과 결과를 비교하세요."
];
ST[0].q="누구를 세어야 할까요?";ST[0].where="첫 번째 데이터 만들기";
/* why each stage matters for the final question, and the one idea to keep (shown, not folded) */
const SIMPLE_WHY=[
 ["누구를 세느냐에 따라 두 편의 인원이 달라집니다. 마지막 What-if도 여기서 정한 명단으로 계산합니다.","기록에 이름이 있다고 모두 이 싸움에 나온 사람은 아닙니다."],
 ["제갈량 한 명을 옮기는 실험을 하려면, 한 사람이 숫자를 얼마나 흔드는지 먼저 알아야 합니다.","평균은 한 사람 때문에 크게 달라질 수 있습니다."],
 ["어느 편이 더 강했는지 비교하려면 무엇으로 잴지부터 정해야 합니다. 제갈량을 옮길 때 이 점수가 함께 옮겨 갑니다.","무엇을 세느냐가 결론을 정합니다."],
 ["내가 정한 점수에서만 나오는 결론이라면, What-if 결과도 믿기 어렵습니다.","점수를 바꿔도 같은 결론이면 믿을 만합니다."],
 ["숫자가 높아도 그 뜻이 생각과 다를 수 있습니다. 무엇을 센 숫자인지 확인해야 엉뚱한 결론을 피합니다.","숫자는 원문으로 확인합니다."],
 ["앞에서 만든 명단과 점수로 처음 질문에 답해 보는 단계입니다.","답은 어떤 가정을 하느냐에 따라 달라집니다. 가정도 함께 적습니다."]
];
function simplifyStage(i){
 const main=$("#main");main.classList.add("simple");
 main.querySelector('.experiment-stage-context')?.remove();
 main.querySelector('.scene-hero .hero-sub')?.remove();
 main.querySelector('.subtitle')?.remove();
 const brief=main.querySelector('.mission-brief')||main.querySelector('.brief3');
 if(brief){const [why,key]=SIMPLE_WHY[i-1];brief.outerHTML=`<section class="simple-todo"><span>할 일</span><p>${esc(SIMPLE_TODO[i-1])}</p><span class="why-l">왜</span><p class="why">${esc(why)}</p><span class="key-l">중요한 점</span><p class="key">${esc(key)}</p></section>`}
 main.querySelectorAll('.step-h p').forEach(p=>{if(p.textContent.length>60){const t=p.textContent;p.outerHTML=`<details class="step-more"><summary>설명 보기</summary><p>${esc(t)}</p></details>`}});
}
const stageFull=stage;
stage=function(i,tasks,steps,check){stageFull(i,tasks,steps,check);simplifyStage(i)};

/* bold the fire keyword (火 → 불) inside quoted paragraphs; skip 불러/불구 etc. */
const hiFire=t=>esc(t).replace(/불(?![러렀구과평만안편어었])/g,'<b class="kw-fire">불</b>');

/* ---------- stage 1: decide four concrete people, then name what you did ---------- */
const PEOPLE1=[
 {n:"曹操",fact:"적벽 편 모든 회에 나옴",tip:"위나라 대장. 빼면 조조군에 대장이 없어집니다."},
 {n:"許褚",fact:"2회 나옴",tip:"조조의 호위 장수. 두 번 나와 싸움에 함께한 인물입니다."},
 {n:"夏侯淵",fact:"딱 1회, 이름만 한 번",tip:"한 번 스치듯 언급됩니다. 셀지 말지는 정하기 나름입니다."},
 {n:"袁紹",fact:"5회 나옴 · 6년 전 사망한 조조의 옛 적<small class=\"pcard-why\">데이터에 '위'로 들어간 이유: 역사책(정사)이 원소의 전기를 「위서」에 실어서</small>",tip:"조조에게 패한 적장이라 조조군이 아닙니다. 대화 속에 이름만 나오고, 이 싸움에는 없었습니다. 분류를 그대로 믿고 세면 조조군 숫자가 부풀어요."}
];
const rosterTotals=()=>{const r=roster(),w=r.filter(n=>PP[n].f==='wei').length;return {all:r.length,wei:w,ally:r.length-w}};
RENDER[1]=()=>{
 const L=S.t.s1d=S.t.s1d||{};
 const cards=PEOPLE1.map(p=>`<div class="pcard" data-n="${p.n}"><div class="pcard-h"><i class="dot" style="background:${fcol(PP[p.n].f)}"></i><b>${PP[p.n].ko}</b><span>${FN[PP[p.n].f]}</span></div><p class="pcard-fact">${p.fact}</p><div class="pick" role="group" aria-label="${PP[p.n].ko}"><button data-v="1">셀래요</button><button data-v="0">뺄래요</button></div><p class="pcard-tip" hidden>${p.tip}</p></div>`).join('');
 originalStageRenderer(1,[["s1","cards","네 사람 정하기"]],
  step(1,"데이터에 '위'로 분류된 네 사람, 모두 조조군으로 셀까요?","",`<div class="pcards" id="pcards">${cards}</div>`)+
  `<section class="stepsec" id="s1reveal" hidden></section>`,
  {q:"해 보니 어떤가요?",opts:["누구를 셀지는 기록이 알아서 정해 준다","누구를 셀지에 따라 숫자가 달라진다","이름이 나온 사람은 모두 싸움에 나왔다"],ok:1,
   good:"기록에 이름이 있다고 다 세면 숫자가 부풀거나 엉뚱해집니다. 그래서 먼저 '누구를 셀지'를 정합니다.",bad:"원소처럼 이름만 나온 사람을 떠올려 보세요.",
   ev:()=>{const t=rosterTotals();return `내 기준: ${S.rule.min}회 이상 · 죽은 사람 ${S.rule.dead?'뺌':'셈'} → 조조군 ${t.wei}명, 연합군 ${t.ally}명`}});
 simplifyStage(1);
 const reveal=$("#s1reveal");
 const apply=()=>{const pick=n=>L[n];
  S.rule.min=pick("夏侯淵")===1?1:pick("許褚")===1?2:3;S.rule.dead=pick("袁紹")===1?0:1;save()};
 const drawCards=()=>{for(const c of $$("#pcards .pcard")){const v=L[c.dataset.n];c.querySelectorAll('.pick button').forEach(b=>b.setAttribute('aria-pressed',String(v!==undefined&&+b.dataset.v===v)));c.classList.toggle('chosen',v!==undefined)}};
 const drawReveal=()=>{
  const all=PEOPLE1.every(p=>L[p.n]!==undefined);if(!all){reveal.hidden=true;return}
  apply();setT("s1","cards");
  $$("#pcards .pcard-tip").forEach(t=>t.hidden=false);
  const t=rosterTotals();
  reveal.hidden=false;
  reveal.innerHTML=`<header class="step-h"><span class="sno">활동 2</span><h2>방금 한 일이 '기준 정하기'예요</h2></header>
   <section class="card pane simple-result"><p class="rule-line">내 기준: <b>${S.rule.min}회 이상 나온 사람</b>만, 이미 죽은 사람은 <b>${S.rule.dead?'빼고':'넣고'}</b></p>
   <div class="sides"><div class="side"><i style="background:var(--wei)"></i><span>조조군</span><b class="num">${t.wei}<small>명</small></b></div><div class="side"><i style="background:linear-gradient(90deg,var(--wu),var(--shu))"></i><span>손권·유비 연합군</span><b class="num">${t.ally}<small>명</small></b></div></div>
   <p class="simple-note">기록에 이름이 나온 63명 중 <b>${t.all}명</b>을 셉니다. 이 명단으로 끝까지 계산해요.</p>
   <details class="step-more"><summary>다르게 골랐다면? 기준 바꿔 보기</summary><div class="ctrls">${seg("rMin",[[1,"1회 이상"],[2,"2회 이상"],[3,"3회 이상"]],S.rule.min,"최소 등장")}${seg("rDead",[[1,"죽은 사람 빼기"],[0,"넣기"]],S.rule.dead,"사망자")}</div><p class="simple-note" id="altNote"></p></details></section>`;
  const alt=()=>{const a=rosterTotals();$("#altNote").textContent=`→ 조조군 ${a.wei}명 · 연합군 ${a.ally}명 (모두 ${a.all}명)`;};
  onSeg("rMin",v=>{S.rule.min=+v;save();alt()});onSeg("rDead",v=>{S.rule.dead=+v;save();alt()});alt();
 };
 $("#pcards").addEventListener('click',e=>{const b=e.target.closest('.pick button');if(!b)return;L[b.closest('.pcard').dataset.n]=+b.dataset.v;save();drawCards();drawReveal()});
 drawCards();drawReveal();
};

/* ---------- shared bits for stages 2–6 ---------- */
const SIDE2=[['wei','조조군','var(--wei)'],['ally','손권·유비 연합군','linear-gradient(90deg,var(--wu),var(--shu))']];
const twoSides=(vals,unit='')=>`<div class="sides">${SIDE2.map(([k,l,c])=>`<div class="side"><i style="background:${c}"></i><span>${l}</span><b class="num">${vals[k]}<small>${unit}</small></b></div>`).join('')}</div>`;
const named=(term,text)=>`<section class="card pane named"><span class="named-tag">방금 한 것</span><h3>${term}</h3><p>${text}</p></section>`;
const reveal=(id)=>`<div class="named-wrap" id="${id}" hidden></div>`;
const show=(id,html)=>{const el=$("#"+id);el.innerHTML=html;el.hidden=false};
const fmt1=x=>Number.isInteger(x)?String(x):x.toFixed(1);
const facMembers=f=>roster().filter(n=>PP[n].f===f);

/* ---------- stage 2: one person can lift an average ---------- */
SIMPLE_TODO[1]="세 진영의 '평균 등장 횟수'를 보고, 촉이 왜 높은지 알아보세요.";
ST[1].q="평균이 높으면 다들 많이 나온 걸까요?";
RENDER[2]=()=>{
 const L=S.t.s2d=S.t.s2d||{};
 const fac=[['shu','촉'],['wu','오'],['wei','위']];
 const avgOf=(f,drop)=>{let v=facMembers(f).map(n=>PP[n].pa).sort((a,b)=>b-a);if(drop)v=v.slice(1);return avg(v)};
 const top=f=>facMembers(f).sort((a,b)=>PP[b].pa-PP[a].pa)[0];
 const shuTop=top('shu');
 originalStageRenderer(2,[["s2","drop","가장 많이 나온 사람 빼 보기"]],
  step(1,"한 사람이 평균 몇 번 나올까요?","",`<section class="card pane"><div class="avgs" id="avgs"></div><p class="simple-note">숫자 = 한 사람이 평균 몇 개 문단에 나오는지</p></section>`)+
  step(2,`촉 사람들을 한 명씩 보면`,"",`<section class="card pane"><div class="bars" id="shuBars"></div><button class="btn" id="dropTop">${esc(PP[shuTop]?.ko||'')} 빼고 다시 계산하기</button><div id="dropRes"></div></section>`)+
  reveal('s2name'),
  {q:"촉의 평균이 높았던 진짜 이유는?",opts:["촉 사람들이 모두 많이 나와서","한 사람이 아주 많이 나와서 평균을 끌어올려서","촉 사람 수가 가장 많아서"],ok:1,
   good:"평균은 한 사람의 큰 숫자에 쉽게 끌려갑니다. 그래서 가운데 값(중앙값)도 함께 봅니다.",bad:"막대를 다시 보세요. 한 명만 유독 깁니다.",
   ev:()=>`촉 평균 ${fmt1(avgOf('shu'))} → ${PP[shuTop]?.ko} 빼면 ${fmt1(avgOf('shu',1))} · 중앙값 촉 ${fmt1(median(facMembers('shu').map(n=>PP[n].pa)))}`});
 simplifyStage(2);
 const mx=Math.max(...fac.map(([f])=>avgOf(f)));
 $("#avgs").innerHTML=fac.map(([f,l])=>`<div class="avg"><span><i class="dot" style="background:var(--${f})"></i>${l}</span><b class="num">${fmt1(avgOf(f))}</b><span class="track"><span class="fill" style="width:${avgOf(f)/mx*100}%;background:var(--${f})"></span></span></div>`).join('');
 const members=facMembers('shu').sort((a,b)=>PP[b].pa-PP[a].pa);
 bars($("#shuBars"),members.map(n=>({label:PP[n].ko,v:PP[n].pa,c:fcol('shu')})),PP[members[0]].pa,'');
 const done=()=>{
  $("#dropRes").innerHTML=`<p class="big-change">촉 평균 <b class="num">${fmt1(avgOf('shu'))}</b> → <b class="num">${fmt1(avgOf('shu',1))}</b></p><p class="simple-note">${esc(PP[shuTop].ko)} 한 명이 빠지자 평균이 확 내려갔습니다.</p>`;
  show('s2name',named("평균의 함정","한 사람의 숫자가 아주 크면 평균이 함께 올라가서 '다들 많이 나온 것처럼' 보입니다. 그래서 줄 세웠을 때 가운데 사람의 값(중앙값)도 같이 봅니다.")+
   `<section class="card pane"><p class="simple-note">가운데 값으로 보면</p><div class="avgs">${fac.map(([f,l])=>`<div class="avg"><span><i class="dot" style="background:var(--${f})"></i>${l}</span><b class="num">${fmt1(median(facMembers(f).map(n=>PP[n].pa)))}</b></div>`).join('')}</div></section>`);
 };
 $("#dropTop").onclick=()=>{L.dropped=1;save();setT("s2","drop");done()};
 if(L.dropped)done();
};

/* ---------- stage 3: build a score from words in the text ---------- */
SIMPLE_TODO[2]="강 위에서 불로 싸운 전투예요. 배·불·계책에 점수를 매겨 두 진영을 비교해 보세요.";
ST[2].q="무엇으로 비교해야 공정할까요?";
RENDER[3]=()=>{
 const ex=(EVID['周瑜']||{}).fire;
 const zy=PP['周瑜'].yy;
 originalStageRenderer(3,[["s3","weight","점수 정하기"]],
  step(1,"기록에서 '배·불·계책'을 셉니다","",`<section class="card pane"><p class="simple-note">예: 주유의 이름이 나온 문단 중에</p><div class="kcount"><div><b class="num">${zy[0]}</b><span>배(船) 글자가 나온 문단</span></div><div><b class="num">${zy[1]}</b><span>불(火) 글자가 나온 문단</span></div><div><b class="num">${zy[2]}</b><span>계책(計) 글자가 나온 문단</span></div></div>${ex?`<details class="step-more"><summary>'불' 글자가 나온 문단 하나 보기</summary><blockquote class="evq">${hiFire(ex[1])}</blockquote></details>`:''}</section>`)+
  step(2,"무엇이 더 중요할까요? 점수를 정하세요","",`<div class="cols"><section class="card pane"><div class="weights" id="wts3"></div><button class="btn" id="fixW">이 점수로 정하기</button></section><section class="card pane simple-result"><p class="simple-note">두 진영의 점수</p><div id="score3"></div><p class="simple-note" id="ratio3"></p></section></div>`)+
  reveal('s3name'),
  {q:"이 점수가 재는 것은 무엇일까요?",opts:["장수의 진짜 실력","그 사람이 나온 문단에 배·불·계책 글자가 함께 나온 정도","전투에서 세운 공"],ok:1,
   good:"글자를 센 숫자이지 실력 그 자체는 아닙니다. 그래도 모두에게 같은 규칙을 쓰면 비교할 수 있습니다.",bad:"1번 활동에서 무엇을 셌는지 떠올려 보세요.",
   ev:()=>{const s=fs("yy");return `점수(배 ${S.w.ship}·불 ${S.w.fire}·계책 ${S.w.plan}): 연합군 ${s.wu+s.shu} vs 조조군 ${s.wei}`}});
 simplifyStage(3);
 const draw=()=>{
  $("#wts3").innerHTML=[['ship','배'],['fire','불'],['plan','계책']].map(([k,l])=>`<div class="w"><span>${l} 1번에</span><span class="stepper-n"><button data-w="${k}" data-d="-1" aria-label="${l} 점수 내리기">−</button><output class="num">${S.w[k]}점</output><button data-w="${k}" data-d="1" aria-label="${l} 점수 올리기">+</button></span></div>`).join('');
  const s=fs("yy"),A=s.wu+s.shu,W=s.wei;
  $("#score3").innerHTML=twoSides({wei:W,ally:A},'점');
  $("#ratio3").textContent=W?`연합군 점수가 조조군의 약 ${(A/W).toFixed(1)}배`:'';
 };
 $("#wts3").addEventListener('click',e=>{const b=e.target.closest('button[data-w]');if(!b)return;const k=b.dataset.w;S.w[k]=Math.max(0,Math.min(5,S.w[k]+ +b.dataset.d));save();draw()});
 const fix=()=>{setT("s3","weight");show('s3name',named("지표 만들기","'무엇을 셀지'와 '몇 점을 줄지'를 정해 숫자 하나로 만든 것을 지표라고 합니다. 이 점수가 마지막 실험에서 그대로 쓰입니다."))};
 $("#fixW").onclick=fix;if(tk("s3","weight"))fix();
 draw();
};

/* ---------- stage 4: does the answer survive other people's scoring? ---------- */
SIMPLE_TODO[3]="다른 사람이 점수를 다르게 매기면 결과가 뒤집힐까요? 직접 확인해 보세요.";
ST[3].q="점수를 다르게 줘도 결과가 같을까요?";
RENDER[4]=()=>{
 const L4=S.t.s4d=S.t.s4d||{};
 const r=roster(),A=r.filter(n=>PP[n].f!=="wei"),W=r.filter(n=>PP[n].f==="wei");
 const lead=w=>{const a=A.reduce((s,n)=>s+scoreOf(n,"yy",w),0),b=W.reduce((s,n)=>s+scoreOf(n,"yy",w),0);return {a,b}};
 const FRIENDS=[["불만 중요해",{ship:0,fire:5,plan:0}],["배만 중요해",{ship:5,fire:0,plan:0}],["계책만 중요해",{ship:0,fire:0,plan:5}]];
 originalStageRenderer(4,[["s4","run","모든 점수 규칙 계산하기"]],
  step(1,"친구들은 이렇게 점수를 줬어요","",`<div class="pcards three" id="friends">${FRIENDS.map(([t,w],i)=>`<div class="pcard"><div class="pcard-h"><b>“${t}”</b></div><p class="pcard-fact">배 ${w.ship} · 불 ${w.fire} · 계책 ${w.plan}</p><button class="btn ghost" data-i="${i}">이 점수로 계산</button><p class="pcard-tip" hidden></p></div>`).join('')}</div>`)+
  step(2,"그럼 가능한 점수를 전부 해 볼까요?","",`<section class="card pane"><p class="simple-note">배·불·계책에 0~5점을 주는 모든 경우는 215가지입니다.</p><button class="btn" id="runAll">215가지 전부 계산하기</button><div id="allRes"></div></section>`)+
  reveal('s4name'),
  {q:"점수 규칙을 다 바꿔 봐도 연합군이 앞섰다면?",opts:["점수는 아무렇게나 정해도 된다","이 결론은 점수 규칙에 크게 흔들리지 않는다","연합군이 반드시 이긴다"],ok:1,
   good:"규칙을 바꿔도 같은 답이 나오면 그 답을 더 믿을 수 있습니다. 다만 '이 기록으로 센 점수'라는 조건은 남습니다.",bad:"215가지 결과를 다시 보세요.",
   ev:()=>`215가지 점수 규칙 중 ${L4.win}가지에서 연합군 점수가 더 높음`});
 simplifyStage(4);
 $("#friends").addEventListener('click',e=>{const b=e.target.closest('button[data-i]');if(!b)return;const [t,w]=FRIENDS[+b.dataset.i],{a,b:bb}=lead(w);const tip=b.nextElementSibling;tip.hidden=false;tip.innerHTML=`연합군 <b class="num">${a}</b> · 조조군 <b class="num">${bb}</b> → ${a>bb?'그래도 연합군이 앞섭니다':'조조군이 앞섭니다'}`});
 const run=()=>{let win=0,tot=0;for(let a=0;a<=5;a++)for(let b=0;b<=5;b++)for(let c=0;c<=5;c++){if(!a&&!b&&!c)continue;tot++;const x=lead({ship:a,fire:b,plan:c});if(x.a>x.b)win++}
  L4.win=win;L4.tot=tot;save();setT("s4","run");
  $("#allRes").innerHTML=`<p class="big-change"><b class="num">${win}</b> / ${tot}가지에서 연합군이 앞섭니다</p><div class="pctbar"><i style="width:${win/tot*100}%"></i></div>`;
  show('s4name',named("민감도 확인","내가 정한 점수 대신 다른 점수를 넣어 봐도 결론이 같은지 확인하는 것입니다. 거의 모든 경우에 같다면, 결론이 점수 고르기에 달려 있지 않다는 뜻입니다."))};
 $("#runAll").onclick=run;if(tk("s4","run"))run();
};

/* ---------- stage 5: read the record behind a surprising number ---------- */
SIMPLE_TODO[4]="조조의 '불' 점수가 높게 나왔어요. 정말 불을 잘 다뤘는지 원문으로 확인해 보세요.";
ST[4].q="숫자만 믿어도 될까요?";
RENDER[5]=()=>{
 const L5=S.t.s5d=S.t.s5d||{};
 const top=roster().map(n=>({n,v:PP[n].yy[1]})).sort((a,b)=>b.v-a.v).slice(0,4);
 const e=(EVID['曹操']||{}).fire;
 originalStageRenderer(5,[["s5","victim","원문 읽기"]],
  step(1,"'불' 글자와 함께 나온 횟수","",`<section class="card pane"><div class="bars" id="fire5"></div></section>`)+
  step(2,"조조는 불을 잘 다뤘을까요?","",`<section class="card pane"><div class="pick wide" id="guess5"><button data-v="1">잘 다뤘을 것 같다</button><button data-v="0">잘 모르겠다</button></div><button class="btn" id="open5" hidden>원문 읽어 보기</button><div id="txt5"></div></section>`)+
  reveal('s5name'),
  {q:"조조의 '불' 숫자가 높았던 이유는?",opts:["조조가 불을 가장 잘 다뤄서","불에 당한 장면에서도 '불' 글자가 함께 나와서","기록이 잘못돼서"],ok:1,
   good:"글자를 센 숫자는 불을 지른 쪽과 당한 쪽을 구분하지 못합니다. 그래서 숫자가 이상하면 원문을 확인합니다.",bad:"원문에서 조조가 무엇을 하고 있는지 다시 읽어 보세요.",
   ev:()=>`조조의 '불' ${PP['曹操'].yy[1]}회는 불에 당한 장면이 섞인 숫자`});
 simplifyStage(5);
 bars($("#fire5"),top.map(x=>({label:PP[x.n].ko,v:x.v,c:fcol(PP[x.n].f)})),top[0].v,'회');
 const drawGuess=()=>{$$("#guess5 button").forEach(b=>b.setAttribute('aria-pressed',String(L5.g!==undefined&&+b.dataset.v===L5.g)));$("#open5").hidden=L5.g===undefined};
 const open=()=>{setT("s5","victim");$("#open5").hidden=true;
  $("#txt5").innerHTML=e?`<p class="simple-note">${srcB('yy',`연의 ${e[0]}회`)} 조조와 '불'이 함께 나온 문단</p><blockquote class="evq">${hiFire(e[1])}</blockquote><p class="big-change">조조는 불을 지른 게 아니라 <b>불에 당하고 있습니다.</b></p>`:'';
  show('s5name',named("근거 확인","숫자가 이상해 보이면 그 숫자를 만든 원래 기록을 직접 읽어 확인합니다. 글자를 세는 방법은 '불을 지른 사람'과 '불에 당한 사람'을 구분하지 못했습니다."))};
 $("#guess5").addEventListener('click',ev=>{const b=ev.target.closest('button');if(!b)return;L5.g=+b.dataset.v;save();drawGuess()});
 $("#open5").onclick=open;drawGuess();if(tk("s5","victim"))open();
};

/* ---------- stage 6: move a person, then change one assumption ---------- */
SIMPLE_TODO[5]="제갈량을 조조 편으로 옮긴 뒤, 바람에 대한 생각을 바꿔 보세요.";
ST[5].q="제갈량이 조조 편이었다면?";
RENDER[6]=()=>{
 const L=S.t.s6x=S.t.s6x||{who:"諸葛亮",act:"wei",lens:"yy",wind:1,wmode:"env",wb:10,runs:[]};
 const D=S.t.s6d=S.t.s6d||{};
 const r=roster();
 const zside=mut=>{if(!r.includes("諸葛亮"))return null;const f=mut&&mut["諸葛亮"]!==undefined?mut["諸葛亮"]:"shu";return f===null?null:f==="wei"?"wei":"ally"};
 const idx=(mut,wmode)=>{const s=fs("yy",S.w,r,mut),A=s.wu+s.shu,W=s.wei;let i=A+W?A/(A+W)*100:50;if(wmode==='env')i+=10;else{const z=zside(mut);if(z==='ally')i+=10;else if(z==='wei')i-=10}return Math.max(0,Math.min(100,Math.round(i)))};
 const vd=i=>i>=65?"연합군이 크게 앞섬":i>=45?"비슷함":"조조군이 앞섬";
 const meter=(i,label)=>`<div class="meter"><div class="meter-row"><span class="big num">${i}</span><span class="verdict">${vd(i)}</span></div><div class="track" aria-hidden="true"><i class="pin" style="left:calc(${i}% - 2px)"></i></div><div class="scale"><span>조조군 앞섬</span><span>비슷함</span><span>연합군 앞섬</span></div>${label?`<p class="simple-note">${label}</p>`:''}</div>`;
 const moved={"諸葛亮":"wei"};
 originalStageRenderer(6,[["s6","move","제갈량 옮기기"],["s6","wind","바람 생각 바꾸기"]],
  step(1,"지금 기록대로 계산하면","",`<section class="card pane">${meter(idx(null,'env'),"앞 단계에서 정한 명단과 점수로 계산한 '연합군이 앞서는 정도' (0~100)")}<button class="btn" id="move6">제갈량을 조조 편으로 옮기기</button><div id="mv6"></div></section>`)+
  `<div class="named-wrap" id="wind6sec" hidden>${step(2,"그런데 바람은 누가 불게 했을까요?","",`<section class="card pane"><div class="pick wide" id="wind6"><button data-v="env">그냥 날씨였다 (누구 편도 아님)</button><button data-v="zg">제갈량이 불렀다 (소설처럼)</button></div><div id="wr6"></div></section>`)}</div>`+
  reveal('s6name')+
  `<div class="named-wrap" id="s6pred" hidden></div>`,
  {q:"'제갈량이 조조 편이었다면 조조가 이겼다'고 말할 수 있을까요?",opts:["그렇다, 계산이 그렇게 나왔다","단정할 수 없다. 바람에 대한 생각에 따라 결과가 크게 달라진다","아니다, 어떤 경우에도 연합군이 이긴다"],ok:1,
   good:"같은 실험이라도 어떤 가정을 하느냐에 따라 결과가 달라집니다. What-if의 답은 '이렇게 가정하면 이렇다'로 말해야 합니다.",bad:"바람에 대한 두 가지 생각에서 숫자가 어떻게 달랐는지 다시 보세요.",
   ev:()=>`기록대로 ${idx(null,'env')} → 제갈량 이동(바람=날씨) ${idx(moved,'env')} · (바람=제갈량) ${idx(moved,'zg')}`});
 simplifyStage(6);
 const afterMove=()=>{
  Object.assign(L,{who:"諸葛亮",act:"wei",lens:"yy",wind:1});save();setT("s6","move");
  $("#move6").hidden=true;
  $("#mv6").innerHTML=`<p class="big-change"><b class="num">${idx(null,'env')}</b> → <b class="num">${idx(moved,'env')}</b></p>${meter(idx(moved,'env'),"제갈량의 점수가 조조군으로 옮겨 갔습니다. 바람은 그대로 연합군 편이라고 두었습니다.")}`;
  $("#wind6sec").hidden=false;drawWind();
 };
 const drawWind=()=>{$$("#wind6 button").forEach(b=>b.setAttribute('aria-pressed',String(D.w===b.dataset.v)));
  if(!D.w)return;L.wmode=D.w;save();
  const tried=new Set(D.tried||[]);tried.add(D.w);D.tried=[...tried];save();
  $("#wr6").innerHTML=D.w==='zg'?`${meter(idx(moved,'zg'),"제갈량이 바람을 부른다면, 바람도 조조군 편으로 붑니다.")}`:`${meter(idx(moved,'env'),"바람이 그냥 날씨라면, 제갈량이 옮겨 가도 바람은 그대로 연합군 편입니다.")}`;
  if(tried.size>=2){setT("s6","wind");
   show('s6name',named("What-if와 가정",`같은 '제갈량 이동'인데도 바람을 날씨로 보면 <b>${idx(moved,'env')}</b>, 제갈량이 불렀다고 보면 <b>${idx(moved,'zg')}</b>입니다. 결과는 어떤 가정을 하느냐에 달려 있습니다. 그래서 What-if의 답에는 항상 가정을 함께 적습니다.`)+
    `<details class="card pane step-more"><summary>다른 사람도 옮겨 보기</summary><div class="ctrls"><label class="field">인물<select id="who6">${r.filter(n=>PP[n].pa>=8).sort((a,b)=>PP[b].pa-PP[a].pa).map(n=>`<option value="${n}">${PP[n].ko} (${FN[PP[n].f]})</option>`).join('')}</select></label>${seg("to6",[["wei","조조군으로"],["ally","연합군으로"],["out","빼기"]],"wei","어디로")}</div><p class="simple-note" id="other6"></p></details>`);
   const other=()=>{const n=$("#who6").value,to=$$("#to6 button").find(b=>b.getAttribute('aria-pressed')==='true')?.dataset.v||'wei';const m={[n]:to==='out'?null:to==='ally'?(PP[n].f==='wei'?'wu':PP[n].f):'wei'};$("#other6").textContent=`${PP[n].ko}: ${idx(null,'env')} → ${idx(m,'env')} (바람=날씨)`};
   $("#who6").onchange=other;onSeg("to6",other);other();
   const pred=Number.isInteger(S.prediction)&&PREDICTIONS[S.prediction];
   const p=$("#s6pred");p.hidden=false;p.innerHTML=`<section class="prediction-review"><span class="journey-eyebrow">처음 예상과 비교</span><div class="prediction-comparison"><div><h3>처음 예상</h3><p data-original-prediction>${pred?esc(pred):'처음 화면에서 남긴 예상이 없습니다.'}</p></div><div><h3>계산 결과</h3><p>바람=날씨 ${idx(moved,'env')} (${vd(idx(moved,'env'))}) · 바람=제갈량 ${idx(moved,'zg')} (${vd(idx(moved,'zg'))})</p></div></div><label for="prediction-reflection">생각이 어떻게 바뀌었나요? (선택)</label><textarea id="prediction-reflection" rows="3" maxlength="2000">${esc(S.reflection||'')}</textarea></section><details class="card pane step-more"><summary>더 해 보기: 역사책(정사)으로 보면 달라질까?</summary><p>지금까지는 소설 『삼국지연의』의 기록으로 계산했습니다. 같은 점수를 역사책 『정사 삼국지』로 세면 어떻게 달라지는지 비교해 볼 수 있습니다.</p><a class="btn ghost" href="#compare">정사와 비교하기</a></details>`;
   $("#prediction-reflection").oninput=e=>{S.reflection=e.target.value;save()};
  }
 };
 $("#move6").onclick=afterMove;
 $("#wind6").addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;D.w=b.dataset.v;save();drawWind()});
 if(tk("s6","move"))afterMove();
};

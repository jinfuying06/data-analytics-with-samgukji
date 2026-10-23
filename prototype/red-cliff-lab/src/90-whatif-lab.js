/* ===== What-if lab: many questions, one calculation =====
   Each What-if is one row of data: what to change (people, wind, scoring, record).
   The calculation is the same as stage 6, so a new question needs no new code. */
const WI_W={base:null,fire0:{ship:3,fire:0,plan:2},ship:{ship:5,fire:0,plan:0},plan:{ship:0,fire:0,plan:5}};
const WI_WIND={env:"바람은 날씨 (연합군 +10)",zg:"바람은 제갈량이 부름 (제갈량 편 +10)",none:"바람 없음"};
const WI_KIND={move:"인물 옮기기",drop:"인물 빼기",cond:"조건 바꾸기",multi:"여러 조건",source:"기록 바꾸기"};
const WHATIFS=[
 {id:"zg",kind:"move",q:"제갈량이 조조 편이었다면?",mut:{"諸葛亮":"wei"},review:"6단계"},
 {id:"zy",kind:"move",q:"주유가 조조 편이었다면?",mut:{"周瑜":"wei"},review:"6단계"},
 {id:"hg",kind:"move",q:"황개의 거짓 항복이 진짜였다면?",mut:{"黃蓋":"wei"},review:"6단계",note:"황개는 거짓으로 항복한 뒤 불붙은 배로 조조의 함대에 들어갔습니다."},
 {id:"zyout",kind:"drop",q:"주유가 병으로 빠졌다면?",mut:{"周瑜":null},review:"2단계 · 한 사람의 무게"},
 {id:"ptout",kind:"drop",q:"방통이 없었다면?",mut:{"龐統":null},review:"2단계 · 한 사람의 무게",note:"방통은 조조에게 배를 서로 묶으라고 권한 인물입니다."},
 {id:"nowind",kind:"cond",q:"바람이 불지 않았다면?",wind:"none",review:"6단계 · 가정"},
 {id:"nofire",kind:"cond",q:"화공이 통하지 않았다면? (불 점수 0)",w:"fire0",review:"5단계 · 숫자의 뜻",note:"조조의 '불' 점수는 불을 지른 기록이 아니라 불에 당한 기록이었습니다."},
 {id:"combo",kind:"multi",q:"주유·황개가 조조 편이고, 바람도 없었다면?",mut:{"周瑜":"wei","黃蓋":"wei"},wind:"none",review:"종합"},
 {id:"jb",kind:"source",q:"소설 대신 역사책(정사)으로 센다면?",lens:"jb",review:"5단계 · 근거"}
];
const WI_STORIES={
 zg:{teaser:"제갈량의 소속을 바꾸어 봅니다",story:"소설 속 제갈량은 손권과 유비가 힘을 모으는 데 관여하고, 적벽에서는 계책을 펼칩니다.",change:"제갈량의 점수를 연합군에서 빼고 조조군에 더합니다. 다른 인물과 바람의 조건은 그대로 둡니다.",method:"제갈량의 점수를 옮겨 두 진영을 견주어 봅시다",person:"諸葛亮",metric:"plan"},
 zy:{teaser:"연합군을 이끈 주유가 다른 편에 선다면",story:"주유는 손권의 군대를 이끌며 조조군에 맞섰습니다. 황개와 함께 화공을 준비한 인물이기도 하지요.",change:"주유의 기록으로 만든 점수를 연합군에서 빼고 조조군에 더합니다.",method:"주유 한 사람의 몫을 옮겨 봅시다",person:"周瑜",metric:"fire"},
 hg:{teaser:"거짓 항복이라는 계책을 바꾸어 봅니다",story:"황개는 조조에게 항복하겠다고 전한 뒤, 불붙은 배를 이끌고 함대로 향합니다. 항복은 화공을 위한 계책이었지요.",change:"이번 계산에서는 황개가 실제로 조조 편에 섰다고 두고, 황개의 점수만 조조군으로 옮깁니다.",method:"황개의 소속을 바꾸어 비교해 봅시다",person:"黃蓋",metric:"fire"},
 zyout:{teaser:"주유 한 사람이 빠진 자리를 살펴봅니다",story:"연합군의 주유는 전투를 지휘하고 화공을 준비했습니다. 그가 싸움에 참여하지 못했다면 연합군의 기록 점수는 얼마나 달라질까요?",change:"주유를 명단에서 제외해 연합군의 합계를 다시 셉니다. 나머지 조건은 유지합니다.",method:"주유를 빼기 전과 후를 견주어 봅시다",person:"周瑜",metric:"plan"},
 ptout:{teaser:"배를 묶으라는 방통의 제안이 없었다면",story:"소설에서 방통은 조조에게 배들을 서로 묶으라고 권합니다. 이어지는 화공 장면에서 이 선택이 중요한 구실을 하지요.",change:"방통의 기록 점수를 계산에서 제외합니다. 배를 묶지 않은 새로운 장면을 만들어 내는 계산은 아니므로, 기록 점수의 차이를 살펴봅니다.",method:"방통의 기록이 차지한 몫을 살펴봅시다",person:"龐統",metric:"ship"},
 nowind:{teaser:"그날 밤의 바람을 바꾸어 봅니다",story:"적벽의 밤, 동남풍이 불고 불붙은 배들이 조조의 함대로 향했습니다. 바람은 소설 속 화공 장면을 이끄는 조건이지요.",change:"인물별 기록 점수는 그대로 두고, 연합군에 더했던 바람 보너스 10만 뺍니다.",method:"바람의 조건만 달리해 봅시다",person:"諸葛亮",metric:"fire"},
 nofire:{teaser:"불에 주었던 점수를 없애 봅니다",story:"황개의 배에서 시작된 불길은 조조의 함대로 번졌습니다. 그런데 기록에 ‘불’이 많다는 사실은 공격과 피해를 모두 담고 있지요.",change:"두 진영 모두 불 관련 기록의 가중치를 0으로 바꿉니다. 화공이 실패한 전투를 재현하는 대신, 불 점수를 없앤 비교 결과를 확인합니다.",method:"불 점수를 빼고 다시 견주어 봅시다",person:"曹操",metric:"fire"},
 combo:{teaser:"인물의 소속과 바람을 함께 바꾸어 봅니다",story:"주유와 황개는 연합군에서 화공을 준비했고, 그날 밤의 바람은 불길이 번지는 조건이 되었습니다.",change:"주유와 황개의 점수를 조조군으로 옮기고, 연합군의 바람 보너스 10도 뺍니다.",method:"두 인물과 바람의 변화를 함께 살펴봅시다",person:"黃蓋",metric:"fire"},
 jb:{teaser:"같은 질문에 다른 기록을 펼쳐 봅니다",story:"지금까지의 질문은 『삼국지연의』 속 기록에서 출발했습니다. 역사책인 정사 『삼국지』에는 인물과 사건이 다른 분량과 방식으로 남아 있지요.",change:"인물 명단과 점수 규칙은 유지하고, 집계 자료를 정사 본문으로 바꿉니다. 자료에 따른 차이를 비교하며, 사실 여부를 자동으로 판정하지는 않습니다.",method:"같은 기준에 다른 자료를 넣어 봅시다",person:"曹操",metric:"fire"}
};
function wiOpening(x,L){
 const story=WI_STORIES[x.id],pred=L.pred[x.id];
 return `<section class="experiment-opening" aria-labelledby="wi-title"><div class="experiment-heading"><a class="linkbtn" href="#lab">다른 이야기 고르기</a><p class="experiment-edition">『삼국지연의』로 해 보는 데이터 실험 · ${String(WHATIFS.indexOf(x)+1).padStart(2,"0")}</p><h1 id="wi-title">${esc(x.q)}</h1><p class="simple-story">${esc(story.story)}</p></div>
 <figure class="experiment-river" aria-label="조조군과 손권·유비 연합군"><div class="river-armies"><div class="river-side wei">${flagPicture('wei','위')}<b>조조군</b></div><span class="river-divider" aria-hidden="true">VS</span><div class="river-side alliance"><div class="alliance-flags">${flagPicture('wu','오')}${flagPicture('shu','촉')}</div><b>손권·유비 연합군</b></div></div></figure>
 <form class="prediction-form" id="wiPrediction"><fieldset><legend>먼저 짐작해 보시지요</legend><div class="prediction-options">${WI_PRED.map(([v,t])=>`<label><input type="radio" name="prediction" value="${v}" ${pred===v?'checked':''}><span><i aria-hidden="true"></i>${t}</span></label>`).join("")}</div></fieldset><div class="prediction-footer"><p id="wiStatus" role="status"></p><button class="btn" type="submit" ${pred?'':'disabled'}>짐작 남기고 기록 펼치기</button></div></form></section>`;
}
const WI_UNANSWERABLE=[
 {q:"황개가 진짜 항복했다면 점수는 어떻게 바뀔까요?",ok:true,why:"사람을 옮기고 같은 방식으로 다시 세면 됩니다."},
 {q:"조조가 이겼다면 삼국은 더 빨리 통일되었을까요?",ok:false,why:"적벽 이후의 일은 이 기록(43~50회)에 없습니다."},
 {q:"제갈량이 조조 밑에서 어떤 계책을 냈을까요?",ok:false,why:"일어나지 않은 장면은 셀 수 없습니다. 데이터는 있었던 기록만 셉니다."}
];
function wiCalc({mut={},wind="env",w=null,lens="yy"}={}){
 const r=roster(),wt=w?WI_W[w]||w:S.w,s=fs(lens,wt,r,mut),A=s.wu+s.shu,W=s.wei;
 let i=A+W?A/(A+W)*100:50;
 if(wind==="env")i+=10;
 else if(wind==="zg"&&r.includes("諸葛亮")){const f=mut["諸葛亮"]!==undefined?mut["諸葛亮"]:PP["諸葛亮"].f;if(f==="wei")i-=10;else if(f)i+=10}
 return {i:Math.max(0,Math.min(100,Math.round(i))),A,W};
}
const wiVerdict=i=>i>=65?"연합군이 크게 앞섬":i>=45?"비슷함":"조조군이 앞섬";
const wiJosa=(w,a,b)=>{const c=w.charCodeAt(w.length-1)-44032;return c>=0&&c<11172&&c%28?a:b};
function wiAssume(x){
 const wt=x.w?WI_W[x.w]:S.w;
 const moves=Object.entries(x.mut||{}).map(([n,f])=>f===null?`${PP[n].ko} 빼기`:`${PP[n].ko} → ${f==="wei"?"조조군":"연합군"}`);
 return [moves.length?moves.join(", "):"인물 그대로",WI_WIND[x.wind||"env"],`점수 배${wt.ship}·불${wt.fire}·계책${wt.plan}`,x.lens==="jb"?"기록: 역사책(정사) 본문":"기록: 『삼국지연의』",`명단: ${S.rule.min}회 이상${S.rule.dead?", 사망자 제외":""}`].join(" · ");
}
function wiMeter(base,now){
 return `<div class="meter wi-meter"><div class="meter-row"><span class="big num">${base.i} → ${now.i}</span><span class="verdict">${wiVerdict(now.i)}</span></div><div class="track" aria-hidden="true"><i class="pin ghost" style="left:calc(${base.i}% - 2px)"></i><i class="pin" style="left:calc(${now.i}% - 2px)"></i></div><div class="scale"><span>조조군 앞섬</span><span>비슷함</span><span>연합군 앞섬</span></div></div>
 <p class="simple-note">연합군 점수 ${base.A.toLocaleString()} → <b>${now.A.toLocaleString()}</b> · 조조군 점수 ${base.W.toLocaleString()} → <b>${now.W.toLocaleString()}</b></p>`;
}
const wiDir=(base,now)=>Math.abs(now.i-base.i)<=3?"same":now.i>base.i?"up":"down";
const WI_PRED=[["up","연합군에 더 유리해질 것 같습니다"],["same","큰 차이가 없을 것 같습니다"],["down","조조군에 더 유리해질 것 같습니다"]];

VIEWS.push({id:"lab"});
const LAB_VIEW=VIEWS.length-1;
RENDER[LAB_VIEW]=()=>{
 if(typeof missionResultObserver!=="undefined"&&missionResultObserver){missionResultObserver.disconnect();missionResultObserver=null}
 document.body.classList.remove("experiment-home");TASKS=[];
 const L=S.t.lab=S.t.lab||{pred:{},b:{who:"周瑜",act:"wei",wind:"env",w:"base",lens:"yy"}};
 const base=wiCalc();
 const params=new URLSearchParams(location.hash.split("?")[1]||"");
 const chosen=WHATIFS.find(x=>x.id===params.get("question"));
 const tried=()=>Object.keys(L.opened||{}).length;
 const card=(x,i)=>`<button class="wi-card${L.opened?.[x.id]?" tried":""}" data-id="${x.id}"><span class="wi-kind">기록 실험 ${String(i+1).padStart(2,"0")}</span><b>${esc(x.q)}</b><small>${esc(WI_STORIES[x.id].teaser)}</small></button>`;
 document.body.classList.toggle("experiment-home",!!chosen);
 $("#main").classList.add("simple");
 const people=roster().filter(n=>PP[n].pa>=5).sort((a,b)=>PP[b].pa-PP[a].pa);
 $("#main").innerHTML=`${chosen?wiOpening(chosen,L):hero({hz:"假定",where:"적벽대전 · 기록 실험",title:"어느 이야기를 바꾸어 보시겠습니까?",sub:"",fx:"fire"})}
 <div class="lab-choice-nav"><a class="linkbtn" href="#lab" ${chosen?'':'hidden'}>다른 이야기 고르기</a><span><span id="labCount">${tried()}</span> / ${WHATIFS.length} 살펴봄</span></div><div id="wiPanel" ${chosen?'':'hidden'}></div>
 <section class="stepsec lab-catalog" ${chosen?'hidden':''}><header class="step-h"><h2>궁금한 질문부터 펼쳐 보시지요</h2><p>이야기를 읽고 짐작을 남긴 뒤, 기록으로 조건을 바꾸어 봅니다.</p></header><div class="wi-grid" id="wiGrid">${WHATIFS.map(card).join("")}</div></section>
 <details class="lab-tools"><summary>직접 질문을 만들거나 기록의 범위 살펴보기</summary>
 ${step(2,"직접 만들기","인물·바람·점수·기록을 골라, 궁금하신 질문을 만들어 보시지요.",`<section class="card pane wi-builder">
   <div class="ctrls"><label class="field">누구를<select id="wbWho">${people.map(n=>`<option value="${n}" ${n===L.b.who?"selected":""}>${PP[n].ko} (${FN[PP[n].f]})</option>`).join("")}</select></label>
   <div class="field">어떻게${seg("wbAct",[["wei","조조 편으로"],["ally","연합군 편으로"],["out","빼기"],["keep","그대로"]],L.b.act,"인물 변경")}</div>
   <div class="field">바람${seg("wbWind",[["env","날씨"],["zg","제갈량이 부름"],["none","없음"]],L.b.wind,"바람 가정")}</div>
   <div class="field">점수${seg("wbW",[["base","내 점수"],["fire0","불 0"],["ship","배만"],["plan","계책만"]],L.b.w,"점수 규칙")}</div>
   <div class="field">기록${seg("wbLens",[["yy","연의(소설)"],["jb","정사(역사책)"]],L.b.lens,"기록")}</div></div>
   <p class="wi-question" id="wbQ"></p><div id="wbRes"></div></section>`)}
 ${step(3,"데이터로 답할 수 있는 질문일까요?","",`<section class="card pane"><div class="wi-ask" id="wiAsk">${WI_UNANSWERABLE.map((x,k)=>`<div class="wi-ask-row" data-k="${k}"><p>${esc(x.q)}</p><div class="pick" role="group" aria-label="${esc(x.q)}"><button data-v="1">답을 살펴볼 수 있습니다</button><button data-v="0">이 자료로는 답하기 어렵습니다</button></div><p class="pcard-tip" hidden></p></div>`).join("")}</div></section>`)}
 </details>
 <p class="lab-back"><a class="btn ghost" href="#s1">분석 방법부터 살펴보기</a> <a class="btn ghost" href="#home">처음 화면</a></p>`;

 $("#main .scene-hero .hero-sub")?.remove();

 // Each question begins with its own story and prediction, like the main expedition.
 const open=id=>{
  const x=WHATIFS.find(v=>v.id===id),story=WI_STORIES[id],form=$("#wiPrediction");
  const evidence=(EVID[story.person]||{})[story.metric];
  $("#wiPanel").innerHTML=`<section class="wi-experiment" id="wiExperiment" hidden>
   <header class="step-h"><span class="sno">기록으로 확인하기</span><h2>${esc(story.method)}</h2></header>
   <section class="card pane wi-panel"><p class="simple-note">${esc(story.change)}</p><div id="wiOut" aria-live="polite"></div>
   <details class="step-more"><summary>계산에 쓴 기록과 규칙</summary><p class="simple-note">인물의 이름과 배·불·계책이 함께 나오는 문단을 세고, 같은 점수 규칙으로 두 진영을 비교합니다. 아래 숫자는 기록으로 만든 비교 지표입니다.</p>${evidence?`<p class="cap">『삼국지연의』 ${evidence[0]}회 · ${PP[story.person].ko} 관련 문단</p><blockquote class="evq">${esc(evidence[1])}</blockquote>`:''}<p class="simple-note">${esc(wiAssume({}))}</p><a class="linkbtn" href="#src">원문과 집계 방식 살펴보기</a></details></section>
   <nav class="wi-next" aria-label="실험 다음 행동"><a class="btn" href="#lab">다른 이야기 펼치기</a><a class="linkbtn" href="#s1">분석 방법부터 살펴보기</a></nav></section>`;
  const show=()=>{const now=wiCalc(x),d=wiDir(base,now),hit=L.pred[id]===d;
   $("#wiExperiment").hidden=false;
   $("#wiOut").innerHTML=`${wiMeter(base,now)}<p class="wi-hit ${hit?"ok":""}">${hit?"짐작하신 방향으로 나왔군요.":"짐작과 다른 결과가 나왔군요. 어느 점수가 달라졌는지 살펴보시지요."}</p><p class="wi-assume"><b>바꾼 조건</b> ${esc(wiAssume(x))}</p>`;
   form.querySelector('button[type="submit"]').textContent="조건을 적용해 다시 계산하기";
  };
  form.onchange=()=>{L.pred[id]=new FormData(form).get("prediction");save();form.querySelector('button[type="submit"]').disabled=false;$("#wiStatus").textContent="짐작을 남겨 두었습니다. 이제 기록으로 살펴보시지요."};
  form.onsubmit=e=>{e.preventDefault();if(!WI_PRED.some(([v])=>v===L.pred[id]))return;L.opened=L.opened||{};L.opened[id]=true;save();$("#labCount").textContent=tried();show();const title=$("#wiExperiment h2");title.setAttribute("tabindex","-1");title.focus({preventScroll:true});$("#wiExperiment").scrollIntoView?.({behavior:RM?"instant":"smooth",block:"start"})};
  if(L.opened?.[id])show();
 };
 $("#wiGrid").addEventListener("click",e=>{const b=e.target.closest(".wi-card");if(!b)return;L.last=b.dataset.id;save();history.pushState(null,'','#lab?question='+encodeURIComponent(b.dataset.id));route();const title=$("#main h1");title.setAttribute('tabindex','-1');title.focus({preventScroll:true})});

 // 2) builder: the question sentence is written from the choices
 const build=()=>{
  const b=L.b,n=b.who,ko=PP[n].ko,mut={};
  if(b.act==="wei"&&PP[n].f!=="wei")mut[n]="wei";else if(b.act==="ally"&&PP[n].f==="wei")mut[n]="wu";else if(b.act==="out")mut[n]=null;
  const parts=[];
  if(b.act==="out")parts.push(`${ko}${wiJosa(ko,"이","가")} 없었다면`);
  else if(n in mut)parts.push(`${ko}${wiJosa(ko,"이","가")} ${mut[n]==="wei"?"조조":"연합군"} 편이었다면`);
  if(b.wind==="none")parts.push("바람이 불지 않았다면");else if(b.wind==="zg")parts.push("바람을 제갈량이 불렀다면");
  if(b.w==="fire0")parts.push("화공이 통하지 않았다면");else if(b.w==="ship")parts.push("배 싸움만 따진다면");else if(b.w==="plan")parts.push("계책만 따진다면");
  if(b.lens==="jb")parts.push("역사책(정사)으로 센다면");
  const sameSide=(b.act==="wei"&&PP[n].f==="wei")||(b.act==="ally"&&PP[n].f!=="wei");
  $("#wbQ").innerHTML=parts.length?`만약 ${parts.map(esc).join(" · ")}?`:`<span class="simple-note">${sameSide?`${esc(ko)}${wiJosa(ko,"은","는")} 이미 그 편입니다. 다른 조건을 골라 보시지요.`:"바꿀 조건을 하나 이상 골라 보시지요."}</span>`;
  const x={mut,wind:b.wind,w:b.w==="base"?null:b.w,lens:b.lens};
  $("#wbRes").innerHTML=parts.length?`${wiMeter(base,wiCalc(x))}<p class="wi-assume"><b>바꾼 조건</b> ${esc(wiAssume(x))}</p>`:"";
  save();
 };
 $("#wbWho").onchange=e=>{L.b.who=e.target.value;build()};
 onSeg("wbAct",v=>{L.b.act=v;build()});onSeg("wbWind",v=>{L.b.wind=v;build()});onSeg("wbW",v=>{L.b.w=v;build()});onSeg("wbLens",v=>{L.b.lens=v;build()});
 build();

 // 3) which questions can data answer?
 $("#wiAsk").addEventListener("click",e=>{const btn=e.target.closest(".pick button");if(!btn)return;const row=btn.closest(".wi-ask-row"),x=WI_UNANSWERABLE[+row.dataset.k],right=(btn.dataset.v==="1")===x.ok;
  row.querySelectorAll(".pick button").forEach(b=>b.setAttribute("aria-pressed",String(b===btn)));const tip=row.querySelector(".pcard-tip");tip.hidden=false;tip.innerHTML=`<b>${right?"그렇지요.":"기록의 범위를 다시 살펴보시지요."}</b> ${esc(x.why)}`});
 if(chosen)open(chosen.id);
};

/* entry points: after the stage 6 comparison, and on the home outline */
(()=>{
 const r6=RENDER[6];
 RENDER[6]=function(){r6.apply(this,arguments);$("#main").insertAdjacentHTML("beforeend",`<a class="lab-link card" href="#lab"><span class="wi-kind">다음</span><b>다른 가정도 살펴보기</b><small>주유·황개·바람·화공… 9가지 질문과 직접 만들기</small></a>`)};
 const r0=RENDER[0];
 RENDER[0]=function(){r0.apply(this,arguments);const o=$("#main .experiment-opening");if(o)o.insertAdjacentHTML("afterend",`<a class="lab-link slim" href="#lab"><b>What-if 실험실</b><small>학습 순서와 관계없이, 궁금한 주제부터 실험하기</small></a>`)};
})();

addEventListener("popstate",route);

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
 {id:"nofire",kind:"cond",q:"화공이 통하지 않았다면? (불 점수 0)",w:"fire0",review:"5단계 · 숫자의 뜻",note:"5단계에서 본 것처럼, 조조의 '불' 점수는 불을 지른 기록이 아니라 불에 당한 기록이었습니다."},
 {id:"combo",kind:"multi",q:"주유·황개가 조조 편이고, 바람도 없었다면?",mut:{"周瑜":"wei","黃蓋":"wei"},wind:"none",review:"종합"},
 {id:"jb",kind:"source",q:"소설 대신 역사책(정사)으로 센다면?",lens:"jb",review:"5단계 · 근거"}
];
const WI_UNANSWERABLE=[
 {q:"황개가 진짜 항복했다면 점수는 어떻게 바뀔까?",ok:true,why:"사람을 옮기고 같은 방식으로 다시 세면 됩니다."},
 {q:"조조가 이겼다면 삼국은 더 빨리 통일됐을까?",ok:false,why:"적벽 이후의 일은 이 기록(43~50회)에 없습니다."},
 {q:"제갈량이 조조 밑에서 어떤 계책을 냈을까?",ok:false,why:"일어나지 않은 장면은 셀 수 없습니다. 데이터는 있었던 기록만 셉니다."}
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
const WI_PRED=[["up","연합군이 더 유리해진다"],["same","거의 그대로다"],["down","조조군이 더 유리해진다"]];

VIEWS.push({id:"lab"});
const LAB_VIEW=VIEWS.length-1;
RENDER[LAB_VIEW]=()=>{
 if(typeof missionResultObserver!=="undefined"&&missionResultObserver){missionResultObserver.disconnect();missionResultObserver=null}
 document.body.classList.remove("experiment-home");TASKS=[];
 const L=S.t.lab=S.t.lab||{pred:{},b:{who:"周瑜",act:"wei",wind:"env",w:"base",lens:"yy"}};
 const base=wiCalc();
 const tried=()=>Object.keys(L.pred).length;
 const card=x=>`<button class="wi-card${L.pred[x.id]?" tried":""}" data-id="${x.id}" aria-pressed="false"><span class="wi-kind">${WI_KIND[x.kind]}</span><b>${esc(x.q)}</b><small>복습 · ${esc(x.review)}</small></button>`;
 const people=roster().filter(n=>PP[n].pa>=5).sort((a,b)=>PP[b].pa-PP[a].pa);
 $("#main").innerHTML=`${hero({hz:"實驗室",where:"6단계를 마친 뒤",title:"다른 What-if도 계산해 볼까요?",sub:"",fx:"fire"})}
 <section class="simple-todo"><span>할 일</span><p>질문을 하나 고르고, 결과를 먼저 예상한 뒤 계산해 보세요.</p><span class="why-l">왜</span><p class="why">계산 방법은 6단계와 같습니다. 바꾸는 조건만 다릅니다. 무엇을 바꾸느냐에 따라 답이 얼마나 달라지는지 비교해 보세요.</p><span class="key-l">중요한 점</span><p class="key">What-if의 답에는 항상 '무엇을 가정했는지'를 함께 적습니다.</p></section>
 ${step(1,"질문 고르기",`기준: 기록대로 계산하면 <b>${base.i}</b> (${wiVerdict(base.i)}) · <span id="labCount">${tried()}</span> / ${WHATIFS.length} 해 봄`,`<div class="wi-grid" id="wiGrid">${WHATIFS.map(card).join("")}</div><div id="wiPanel"></div>`)}
 ${step(2,"직접 만들기","사람, 바람, 점수, 기록을 골라 나만의 질문을 만드세요.",`<section class="card pane wi-builder">
   <div class="ctrls"><label class="field">누구를<select id="wbWho">${people.map(n=>`<option value="${n}" ${n===L.b.who?"selected":""}>${PP[n].ko} (${FN[PP[n].f]})</option>`).join("")}</select></label>
   <div class="field">어떻게${seg("wbAct",[["wei","조조 편으로"],["ally","연합군 편으로"],["out","빼기"],["keep","그대로"]],L.b.act,"인물 변경")}</div>
   <div class="field">바람${seg("wbWind",[["env","날씨"],["zg","제갈량이 부름"],["none","없음"]],L.b.wind,"바람 가정")}</div>
   <div class="field">점수${seg("wbW",[["base","내 점수"],["fire0","불 0"],["ship","배만"],["plan","계책만"]],L.b.w,"점수 규칙")}</div>
   <div class="field">기록${seg("wbLens",[["yy","연의(소설)"],["jb","정사(역사책)"]],L.b.lens,"기록")}</div></div>
   <p class="wi-question" id="wbQ"></p><div id="wbRes"></div></section>`)}
 ${step(3,"데이터로 답할 수 있는 질문일까요?","",`<section class="card pane"><div class="wi-ask" id="wiAsk">${WI_UNANSWERABLE.map((x,k)=>`<div class="wi-ask-row" data-k="${k}"><p>${esc(x.q)}</p><div class="pick" role="group" aria-label="${esc(x.q)}"><button data-v="1">답할 수 있다</button><button data-v="0">답할 수 없다</button></div><p class="pcard-tip" hidden></p></div>`).join("")}</div></section>`)}
 <p class="lab-back"><a class="btn ghost" href="#s6">6단계로 돌아가기</a> <a class="btn ghost" href="#home">처음 화면</a></p>`;

 $("#main .scene-hero .hero-sub")?.remove();

 // 1) curated questions
 const open=id=>{
  const x=WHATIFS.find(v=>v.id===id);$$("#wiGrid .wi-card").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.id===id)));
  const p=L.pred[id];
  $("#wiPanel").innerHTML=`<section class="card pane wi-panel"><span class="wi-kind">${WI_KIND[x.kind]}</span><h3>${esc(x.q)}</h3>${x.note?`<p class="simple-note">${esc(x.note)}</p>`:""}
   <p class="wi-step">먼저 예상해 보세요</p><div class="pick wide three" id="wiPred">${WI_PRED.map(([v,t])=>`<button data-v="${v}" aria-pressed="${p===v}">${t}</button>`).join("")}</div><div id="wiOut"></div></section>`;
  const show=()=>{const now=wiCalc(x),d=wiDir(base,now),hit=L.pred[id]===d;
   $("#wiOut").innerHTML=`${wiMeter(base,now)}<p class="wi-hit ${hit?"ok":""}">${hit?"예상대로입니다.":"예상과 다릅니다. 점수가 어디서 바뀌었는지 위 숫자를 보세요."}</p><p class="wi-assume"><b>이 결과의 가정</b> ${esc(wiAssume(x))}</p>`};
  if(p)show();
  onSeg("wiPred",v=>{L.pred[id]=v;save();$(`#wiGrid .wi-card[data-id="${id}"]`).classList.add("tried");$("#labCount").textContent=tried();show()});
 };
 $("#wiGrid").addEventListener("click",e=>{const b=e.target.closest(".wi-card");if(b)open(b.dataset.id)});

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
  $("#wbQ").innerHTML=parts.length?`만약 ${parts.map(esc).join(" · ")}?`:`<span class="simple-note">${sameSide?`${esc(ko)}${wiJosa(ko,"은","는")} 이미 그 편입니다. 다른 조건을 골라 보세요.`:"바꿀 조건을 하나 이상 골라 보세요."}</span>`;
  const x={mut,wind:b.wind,w:b.w==="base"?null:b.w,lens:b.lens};
  $("#wbRes").innerHTML=parts.length?`${wiMeter(base,wiCalc(x))}<p class="wi-assume"><b>이 결과의 가정</b> ${esc(wiAssume(x))}</p>`:"";
  save();
 };
 $("#wbWho").onchange=e=>{L.b.who=e.target.value;build()};
 onSeg("wbAct",v=>{L.b.act=v;build()});onSeg("wbWind",v=>{L.b.wind=v;build()});onSeg("wbW",v=>{L.b.w=v;build()});onSeg("wbLens",v=>{L.b.lens=v;build()});
 build();

 // 3) which questions can data answer?
 $("#wiAsk").addEventListener("click",e=>{const btn=e.target.closest(".pick button");if(!btn)return;const row=btn.closest(".wi-ask-row"),x=WI_UNANSWERABLE[+row.dataset.k],right=(btn.dataset.v==="1")===x.ok;
  row.querySelectorAll(".pick button").forEach(b=>b.setAttribute("aria-pressed",String(b===btn)));const tip=row.querySelector(".pcard-tip");tip.hidden=false;tip.innerHTML=`<b>${right?"맞아요.":"다시 생각해 보세요."}</b> ${esc(x.why)}`});
 if(L.last)open(L.last);
 $("#wiGrid").addEventListener("click",e=>{const b=e.target.closest(".wi-card");if(b){L.last=b.dataset.id;save()}});
};

/* entry points: after the stage 6 comparison, and on the home outline */
(()=>{
 const r6=RENDER[6];
 RENDER[6]=function(){r6.apply(this,arguments);$("#main").insertAdjacentHTML("beforeend",`<a class="lab-link card" href="#lab"><span class="wi-kind">다음</span><b>다른 What-if도 계산해 보기</b><small>주유·황개·바람·화공… 9가지 질문과 직접 만들기</small></a>`)};
 const r0=RENDER[0];
 RENDER[0]=function(){r0.apply(this,arguments);const o=$("#main .journey-outline");if(o)o.insertAdjacentHTML("afterend",`<a class="lab-link slim" href="#lab"><b>What-if 실험실</b><small>다른 질문도 계산해 보기</small></a>`)};
})();

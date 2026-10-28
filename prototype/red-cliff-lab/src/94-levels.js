/* ===== Three levels of What-if =====
   Level 1 · 세어 보기      choose among what is given (the six stages as they are)
   Level 2 · 숫자 의심하기  sort the records before scoring (순서 3), hunt for the lowest index (순서 4)
   Level 3 · 가정 설계하기  set the assumptions and write the conclusion (순서 6)
   The other 순서 of levels 2 and 3 live in 96-level-paths.js. */
const LEVEL_OF={zg:1,zyout:1,ptout:1,zy:2,hg:2,nofire:2,nowind:3,combo:3,jb:3};
const LEVELS=[null,{name:"세어 보기",does:"주어진 것 중에서 고릅니다"},{name:"숫자 의심하기",does:"값을 바꿔 가며 찾아냅니다"},{name:"가정 설계하기",does:"조건을 정하고 결론을 씁니다"}];
WHATIFS.forEach(x=>x.level=LEVEL_OF[x.id]||1);
const levelNow=()=>scenario().level||1;

/* ---- the words that change with the level ---- */
const applyScenarioTextScene=applyScenarioText;
applyScenarioText=function(){
 applyScenarioTextScene();
 const x=scenario(),lv=x.level;
 if(lv===2){
  ST[2].q="‘불’ 기록부터 나누어 보시지요";
  SIMPLE_TODO[2]="세 문단의 ‘불’이 공격인지, 피해인지, 이름만 나온 것인지 나눈 뒤 점수를 매겨 보시지요.";
  SIMPLE_WHY[2]=["같은 글자라도 뜻이 다르면, 점수를 매기기 전에 나누어 보아야겠지요.","무엇을 셌는지 알고 나서 점수를 매깁니다."];
  ST[3].q="결과를 가장 크게 바꾸는 점수 규칙을 찾아보시지요";
  SIMPLE_TODO[3]="점수를 직접 바꿔 가며, 이번 질문의 지수가 가장 낮아지는 규칙을 찾아보시지요.";
  SIMPLE_WHY[3]=["어디까지 흔들 수 있는지 직접 찾아보면, 결론이 얼마나 단단한지 알 수 있겠지요.","가장 나쁜 경우를 찾아보는 것도 민감도를 확인하는 방법입니다."];
 }
 if(lv===3){
  ST[5].short="가정 정하고 결론 쓰기";
  SIMPLE_TODO[5]="바람·기록·조건을 직접 정하고, 그 가정을 담아 결론을 한 문장으로 써 보시지요.";
  SIMPLE_WHY[5]=["가정 실험의 답은 어떤 가정에서 나온 숫자인지까지 말해야 합니다.","결론에는 가정과 한계를 함께 적습니다."];
 }
};

/* ---- lab: questions grouped by level ---- */
(()=>{const lab=RENDER[LAB_VIEW];RENDER[LAB_VIEW]=function(){lab.apply(this,arguments);
 const grid=$("#wiGrid");if(!grid)return;
 const cards=[...grid.querySelectorAll(".wi-card")];
 grid.classList.remove("wi-grid");grid.classList.add("lab-levels");
 grid.innerHTML=[1,2,3].map(lv=>`<section class="lab-level" data-level="${lv}"><header><span class="num">${lv}단계</span><h2>${LEVELS[lv].name}</h2></header><div class="wi-grid"></div></section>`).join("");
 cards.forEach(c=>{const x=WHATIFS.find(w=>w.id===c.dataset.id);grid.querySelector(`.lab-level[data-level="${x.level}"] .wi-grid`).append(c)});
}})();

/* ---- level 2 · stage 3: sort the fire records, then score ---- */
const SORT_ITEMS=[["曹操","hurt"],["周瑜","attack"],["黃蓋","said"]];
const SORT_OPTS=[["attack","불을 지름"],["hurt","불에 당함"],["said","이름만 나옴"]];
const SORT_WHY={曹操:"조조는 불길을 뚫고 달아나고 있습니다.",周瑜:"주유는 불을 지르는 함대 한가운데에 있습니다.",黃蓋:"황개는 다른 사람의 대사 속에 이름만 나옵니다."};
function lv2Stage3({x,c}){
 const L=S.t.s3s=S.t.s3s||{};
 const item=([n])=>{const e=(EVID[n]||{}).fire;return `<section class="card pane sort-item" data-n="${n}"><p class="simple-note">${srcB('yy',`연의 ${e?e[0]:""}회`)} ${PP[n].ko}</p>${e?`<blockquote class="evq">${hiFire(e[1])}</blockquote>`:""}<div class="pick three" role="group" aria-label="${PP[n].ko}의 불">${SORT_OPTS.map(([v,t])=>`<button data-v="${v}">${t}</button>`).join("")}</div><p class="pcard-tip" hidden></p></section>`};
 originalStageRenderer(3,[["s3","weight","나누고 점수 정하기"]],
  step(1,"세 문단의 ‘불’은 같은 뜻일까요?","",`<div class="sort-list" id="sort3">${SORT_ITEMS.map(item).join("")}</div>`)+
  `<div class="named-wrap" id="s3score" hidden>${step(2,"나눈 것을 보고 점수를 정해 보시지요","",`<div class="cols"><section class="card pane"><div class="weights" id="wts3"></div><button class="btn" id="fixW">이 점수로 정하기</button></section><section class="card pane simple-result"><div id="score3"></div><p class="simple-note" id="ratio3"></p></section></div>`)}</div>`+reveal('s3name'),
  {q:"‘불’ 점수를 만들 때 알아 둘 것은?",opts:["‘불’ 글자는 모두 불을 지른 기록입니다.","공격·피해·언급이 함께 세어지므로, 점수의 뜻을 밝혀 두어야 합니다.","불 기록은 점수에 넣으면 안 됩니다."],ok:1,
   good:"글자를 세는 방법으로는 셋을 구분할 수 없습니다. 그래서 숫자가 무엇을 담고 있는지 먼저 나누어 봅니다.",bad:"방금 나눈 세 문단을 떠올려 보시지요.",
   ev:()=>`분류: ${SORT_ITEMS.map(([n])=>`${PP[n].ko} ${(SORT_OPTS.find(o=>o[0]===L[n])||[,"-"])[1]}`).join(" · ")}`});
 simplifyStage(3);
 const draw=()=>{for(const el of $$("#sort3 .sort-item")){const n=el.dataset.n,v=L[n],right=SORT_ITEMS.find(i=>i[0]===n)[1];
   el.querySelectorAll(".pick button").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.v===v)));
   const tip=el.querySelector(".pcard-tip");if(!v){tip.hidden=true;continue}tip.hidden=false;
   tip.innerHTML=v===right?`<b class="ok">맞습니다.</b> ${SORT_WHY[n]}`:`<b class="warn">다시 읽어 보시지요.</b> 이 문단에서 ${PP[n].ko}${wiJosa(PP[n].ko,"은","는")} 무엇을 하고 있나요?`}
  const all=SORT_ITEMS.every(([n,r])=>L[n]===r);$("#s3score").hidden=!all;
  if(all&&!$("#s3name").innerHTML)show('s3name',named("나누어 세기","같은 ‘불’ 글자에 공격·피해·이름만 나온 경우가 섞여 있었습니다. 숫자 하나로 합치기 전에 무엇이 섞였는지 알아 두면, 점수가 무엇을 뜻하는지 정직하게 말할 수 있지요."));
 };
 $("#sort3").addEventListener("click",e=>{const b=e.target.closest(".pick button");if(!b)return;L[b.closest(".sort-item").dataset.n]=b.dataset.v;save();draw()});
 const drawW=()=>{
  $("#wts3").innerHTML=[['ship','배'],['fire','불'],['plan','계책']].map(([k,l])=>`<div class="w"><span>${l} 1번에</span><span class="stepper-n"><button data-w="${k}" data-d="-1" aria-label="${l} 점수 내리기">−</button><output class="num">${S.w[k]}점</output><button data-w="${k}" data-d="1" aria-label="${l} 점수 올리기">+</button></span></div>`).join('');
  const s=fs("yy"),A=s.wu+s.shu,W=s.wei;$("#score3").innerHTML=twoSides({wei:W,ally:A},'점');
  const moved=c.who?c.who.reduce((t,n)=>t+(roster().includes(n)?scoreOf(n,"yy"):0),0):0;
  $("#ratio3").textContent=c.who?`이번 질문에서 옮겨 갈 점수 ${moved}점`:`조조군의 ‘불’ 점수 ${roster().filter(n=>PP[n].f==="wei").reduce((t,n)=>t+PP[n].yy[1]*S.w.fire,0)}점`;
 };
 $("#wts3").addEventListener('click',e=>{const b=e.target.closest('button[data-w]');if(!b)return;const k=b.dataset.w;S.w[k]=Math.max(0,Math.min(5,S.w[k]+ +b.dataset.d));save();drawW()});
 $("#fixW").onclick=()=>{setT("s3","weight")};
 draw();drawW();
}

/* ---- level 2 · stage 4: hunt for the rule that moves the answer most ---- */
function lv2Stage4({x,c}){
 const L=S.t.s4h=S.t.s4h||{w:{...S.w},tries:0};
 const fixFire=c.topic==="fire";
 if(fixFire)L.w.fire=0;
 const calc=w=>wiCalc({...x,w}).i;
 let min=100,max=0,best=null;for(let a=0;a<=5;a++)for(let b=0;b<=5;b++)for(let d=0;d<=5;d++){if(!a&&!b&&!d)continue;if(fixFire&&b)continue;const w={ship:a,fire:b,plan:d},v=calc(w);if(v<min){min=v;best=w}max=Math.max(max,v)}
 const P=c.who?c.who.map(n=>PP[n].ko).join("·"):"";
 originalStageRenderer(4,[["s4","run","가장 낮은 지수 찾기"]],
  step(1,"점수를 바꿔 가며 지수를 가장 낮춰 보시지요","",`<div class="cols"><section class="card pane"><div class="weights" id="wts4"></div><p class="simple-note" id="tries4"></p><button class="btn ghost" id="reveal4" hidden>모든 규칙 한 번에 계산하기</button></section><section class="card pane simple-result"><div id="meter4"></div><p class="big-change" id="best4"></p></section></div>`)+reveal('s4name'),
  {q:"가장 낮은 지수를 찾아보니 무엇을 알 수 있었습니까?",opts:["점수 규칙만 잘 고르면 어떤 결론이든 만들 수 있습니다.","점수를 어떻게 매겨도 이 범위 안에 있으므로, 그 범위까지 함께 말해야 합니다.","가장 낮은 지수가 정답입니다."],ok:1,
   good:"가장 나쁜 경우까지 찾아보면, 결론이 흔들릴 수 있는 범위를 알 수 있습니다.",bad:"찾은 가장 낮은 지수와 처음 지수를 견주어 보시지요.",
   ev:()=>`가장 낮은 지수 ${min} (배 ${best.ship}·불 ${best.fire}·계책 ${best.plan}) · 가장 높은 지수 ${max}`});
 simplifyStage(4);
 const done=how=>{setT("s4","run");L.found=1;save();$("#best4").innerHTML=`이 질문의 지수는 <b class="num">${min}</b>~<b class="num">${max}</b> 사이입니다`;
  show('s4name',named("민감도 탐색",`${how} 점수를 어떻게 매겨도 지수는 ${min}~${max} 사이에 머뭅니다. 결론을 말할 때는 이 범위까지 함께 말하는 것이 정직하지요.`))};
 const draw=()=>{
  $("#wts4").innerHTML=[['ship','배'],['fire','불'],['plan','계책']].map(([k,l])=>`<div class="w"><span>${l} 1번에</span><span class="stepper-n"><button data-w="${k}" data-d="-1" ${fixFire&&k==="fire"?"disabled":""} aria-label="${l} 점수 내리기">−</button><output class="num">${L.w[k]}점</output><button data-w="${k}" data-d="1" ${fixFire&&k==="fire"?"disabled":""} aria-label="${l} 점수 올리기">+</button></span></div>`).join('');
  const v=L.w.ship+L.w.fire+L.w.plan?calc(L.w):wiCalc(x).i;
  $("#meter4").innerHTML=`<div class="meter"><div class="meter-row"><span class="big num">${v}</span><span class="verdict">${wiVerdict(v)}</span></div><div class="track" aria-hidden="true"><i class="pin" style="left:calc(${v}% - 2px)"></i></div><div class="scale"><span>조조군 앞섬</span><span>비슷함</span><span>연합군 앞섬</span></div></div>`;
  $("#tries4").textContent=L.tries?`${L.tries}번 바꿔 봄`:"";
  $("#reveal4").hidden=L.tries<3||!!L.found;
  if(v===min&&!L.found)done(`가장 낮은 지수 ${min}을 직접 찾았습니다.`);
 };
 $("#wts4").addEventListener('click',e=>{const b=e.target.closest('button[data-w]');if(!b||b.disabled)return;const k=b.dataset.w;L.w[k]=Math.max(0,Math.min(5,L.w[k]+ +b.dataset.d));L.tries++;save();draw()});
 $("#reveal4").onclick=()=>{L.w={...best};save();draw();if(!L.found)done(`모든 규칙을 계산해 보니 가장 낮은 지수는 ${min}입니다(배 ${best.ship}·불 ${best.fire}·계책 ${best.plan}).`)};
 draw();if(L.found&&!$("#s4name").innerHTML)done("");
}

/* ---- level 3 · stage 6: set the assumptions, then write the conclusion ---- */
const LIMITS=["글자를 센 숫자이므로 실제 능력과는 다릅니다.","소설 『삼국지연의』의 서술을 따랐습니다.","적벽 편(43~50회)의 기록만 세었습니다.","바람을 어떻게 볼지는 해석의 문제입니다."];
function lv3Stage6(){
 const x=scenario(),q=x.q.replace(/\s*\(.*\)\s*$/,"");
 // the question's own change stays fixed; the learner sets the other assumptions
 const SHOW={nowind:["fire","lens"],combo:["fire","lens"],jb:["wind","layer"]}[x.id]||["wind","lens"];
 const D=S.t.s6c=S.t.s6c||{wind:x.wind||"env",bonus:10,fire:"keep",lens:x.lens||"yy",limit:null,own:"",checks:{}};
 const base=wiCalc().i;
 const cur=()=>{const w=D.fire==="zero"?{...S.w,fire:0}:null,wind=SHOW.includes("wind")?D.wind:(x.wind||"env");
  const raw=wiCalc({...x,w:w||x.w,wind:wind==="env"?"none":wind,lens:D.lens}).i;return wind==="env"?Math.max(0,Math.min(100,raw+(SHOW.includes("wind")?D.bonus:10))):raw};
 const eul=n=>[2,4,5,9].includes(n%10)?"를":"을";
 const assume=()=>{const parts=[];
  if(SHOW.includes("wind"))parts.push(D.wind==="none"?"바람은 불지 않았다":D.wind==="zg"?"바람은 제갈량이 불렀다":`바람은 날씨로 보아 연합군에 +${D.bonus}${eul(D.bonus)} 더했다`);
  if(SHOW.includes("fire"))parts.push(D.fire==="zero"?"불도 번지지 않아 불 점수를 0으로 두었다":"불 점수는 그대로 두었다");
  parts.push(D.lens==="jb"?"정사 본문을 세었다":D.lens==="all"?"정사 본문과 주석을 세었다":"『삼국지연의』를 세었다");
  return parts.map((p,i)=>i<parts.length-1?p.replace(/다$/,"고"):p).join(", ")};
 const sentence=()=>{const v=cur(),lim=D.limit==="own"?D.own.trim():LIMITS[D.limit];return `만약 ${q.replace(/\?$/,"")}, ${assume()}고 가정할 때 연합군 우세 지수는 ${v}(${wiVerdict(v)})입니다.${lim?` 다만 ${lim}`:""}`};
 originalStageRenderer(6,[["s6","move","가정 정하기"],["s6","wind","결론 남기기"]],
  (typeof lv3Nudge==="function"?lv3Nudge():"")+step(1,"가정을 직접 정해 보시지요","",`<section class="card pane wi-builder"><div class="ctrls">
    ${SHOW.includes("wind")?`<div class="field">바람${seg("d6wind",[["env","날씨"],["zg","제갈량이 부름"],["none","없음"]],D.wind,"바람")}</div>
    <div class="field" id="d6bonusF">바람 보너스${seg("d6bonus",[[0,"0"],[5,"5"],[10,"10"],[15,"15"],[20,"20"]],D.bonus,"바람 보너스")}</div>`:""}
    ${SHOW.includes("fire")?`<div class="field">불${seg("d6fire",[["keep","그대로"],["zero","번지지 않음 (0)"]],D.fire,"불 점수")}</div>`:""}
    ${SHOW.includes("layer")?`<div class="field">정사의 층${seg("d6lens",[["jb","본문"],["all","본문+주석"]],D.lens,"기록")}</div>`:`<div class="field">기록${seg("d6lens",[["yy","연의"],["jb","정사 본문"]],D.lens,"기록")}</div>`}</div>
    <div id="d6meter"></div></section>`)+
  step(2,"결론을 한 문장으로 남겨 보시지요","",`<section class="card pane conclusion">${lv3Decided()}<p class="conclusion-text" id="d6text"></p>
    <div class="field">한계 하나를 덧붙이기<div class="pick limits" id="d6limit">${LIMITS.map((t,i)=>`<button data-v="${i}">${t}</button>`).join("")}<button data-v="own">직접 쓰기</button></div><textarea id="d6own" rows="2" maxlength="300" hidden placeholder="이 결론의 한계를 한 줄로 적어 주세요">${esc(D.own)}</textarea></div>
    <fieldset class="checks" id="d6checks"><label><input type="checkbox" data-k="assume"> 어떤 가정을 했는지 적었다</label><label><input type="checkbox" data-k="range"> 어떤 기록을 셌는지 적었다</label><label><input type="checkbox" data-k="hedge"> ‘이겼다’고 단정하지 않았다</label></fieldset>
    <button class="btn" id="d6save" disabled>결론 남기기</button></section>`)+
  reveal('s6name')+`<div class="named-wrap" id="s6pred" hidden></div>`,
  {q:`‘${q}’에 대한 결론으로 가장 알맞은 것은?`,opts:[`${q.replace(/\?$/,"")}, 조조가 이겼을 것입니다.`,`정한 가정과 기록에서 지수는 ${cur()}(${wiVerdict(cur())})이고, 글자를 센 숫자라는 한계가 있습니다.`,"가정마다 숫자가 달라지므로 아무 말도 할 수 없습니다."],ok:1,
   good:"가정과 기록과 한계를 함께 적으면, 다른 사람도 같은 계산을 다시 해 볼 수 있습니다.",bad:"방금 쓴 결론에 무엇이 들어 있었는지 살펴보시지요.",ev:()=>S.reflection||sentence()});
 simplifyStage(6);
 const draw=()=>{
  const bf=$("#d6bonusF");if(bf)bf.hidden=D.wind!=="env";
  const v=cur();$("#d6meter").innerHTML=`<p class="big-change"><b class="num">${base}</b> → <b class="num">${v}</b></p><div class="meter"><div class="meter-row"><span class="big num">${v}</span><span class="verdict">${wiVerdict(v)}</span></div><div class="track" aria-hidden="true"><i class="pin" style="left:calc(${v}% - 2px)"></i></div><div class="scale"><span>조조군 앞섬</span><span>비슷함</span><span>연합군 앞섬</span></div></div>`;
  $("#d6text").textContent=sentence();
  $$("#d6limit button").forEach(b=>b.setAttribute("aria-pressed",String(String(D.limit)===b.dataset.v)));
  $("#d6own").hidden=D.limit!=="own";
  $$("#d6checks input").forEach(i=>i.checked=!!D.checks[i.dataset.k]);
  const ok=D.limit!==null&&(D.limit!=="own"||D.own.trim())&&["assume","range","hedge"].every(k=>D.checks[k]);
  $("#d6save").disabled=!ok;
 };
 const touch=()=>{setT("s6","move");save();draw()};
 $("#lvSkip")?.addEventListener("click",()=>{D.skip=1;save();$("#lvNudge").remove()});
 if($("#d6wind")){onSeg("d6wind",v=>{D.wind=v;touch()});onSeg("d6bonus",v=>{D.bonus=+v;touch()})}if($("#d6fire"))onSeg("d6fire",v=>{D.fire=v;touch()});onSeg("d6lens",v=>{D.lens=v;touch()});
 $("#d6limit").addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;D.limit=b.dataset.v==="own"?"own":+b.dataset.v;save();draw()});
 $("#d6own").oninput=e=>{D.own=e.target.value;save();draw()};
 $("#d6checks").addEventListener("change",e=>{const i=e.target.closest("input");if(!i)return;D.checks[i.dataset.k]=i.checked;save();draw()});
 const saved=()=>{
  show('s6name',named("결론 쓰기",`가정 실험의 답은 <b>가정 + 기록 + 숫자 + 한계</b>로 이루어집니다. 방금 남기신 문장이 그 형태이지요.`));
  const pred=Number.isInteger(S.prediction)&&PREDICTIONS[S.prediction];
  const p=$("#s6pred");p.hidden=false;p.innerHTML=`<section class="prediction-review"><div class="prediction-comparison"><div><h3>처음 예상</h3><p data-original-prediction>${pred?esc(pred):'처음에 남긴 예상이 없습니다.'}</p></div><div><h3>남긴 결론</h3><p>${esc(S.reflection)}</p></div></div></section>`;
 };
 $("#d6save").onclick=()=>{S.reflection=sentence();save();setT("s6","wind");saved()};
 draw();if(tk("s6","wind")&&S.reflection)saved();
 $("#main").insertAdjacentHTML("beforeend",`<a class="lab-link card" href="#lab"><b>다른 가정도 살펴보기</b></a>`);
}

/* ---- route the overrides by level ---- */
(()=>{
 const r3=RENDER[3],r4=RENDER[4],r6=RENDER[6];
 RENDER[3]=function(){if(levelNow()!==2)return r3.apply(this,arguments);applyScenarioText();lv2Stage3({x:scenario(),c:SC[scenario().id]});markScenario()};
 RENDER[4]=function(){if(levelNow()!==2)return r4.apply(this,arguments);applyScenarioText();lv2Stage4({x:scenario(),c:SC[scenario().id]});markScenario()};
 RENDER[6]=function(){if(levelNow()!==3)return r6.apply(this,arguments);applyScenarioText();lv3Stage6()};
})();

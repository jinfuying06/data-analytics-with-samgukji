/* ===== Level paths: every 순서 changes with the 단계 =====
   1단계 · 세어 보기      choose among what is given (92-scenario-stages.js / 80-simplify.js)
   2단계 · 숫자 의심하기  try, predict and check:
        1 change the roster rule and watch who comes and goes
        2 predict the average before removing anyone, then compare mean and median
        3 sort the fire records (94)        4 hunt for the lowest index (94)
        5 read the record first, then judge three claims about the number
        6 find where the verdict flips as the wind assumption changes
   3단계 · 가정 설계하기  decide, give a reason, and carry it to the conclusion:
        1 set the roster rule with a reason that fits it
        2 choose the representative value (mean or median) with a reason
        3 design the score with a reason that fits the weights
        4 set the bar for "the answer holds" before computing
        5 choose which record to verify and how to use it
        6 the conclusion lists everything decided above (94)
   Checks are written per question and per 단계; the answer is no longer always the second option. */

const qShort=x=>x.q.replace(/\s*\(.*\)\s*$/,"").replace(/\?$/,"");
const scCore=c=>c.s1.cards.find(r=>r[1]==="core")[0];
const lvJ=(w,a,b)=>wiJosa(w,a,b);
const lvPick=(id,opts,val,cls="wide")=>`<div class="pick ${cls}" id="${id}">${opts.map(([v,t])=>`<button data-v="${v}" aria-pressed="${String(val)===String(v)}">${esc(t)}</button>`).join("")}</div>`;
const lvPress=(id,val)=>$$("#"+id+" button").forEach(b=>b.setAttribute("aria-pressed",String(val!==undefined&&val!==null&&String(val)===b.dataset.v)));
const lvMeter=i=>`<div class="meter"><div class="meter-row"><span class="big num">${i}</span><span class="verdict">${wiVerdict(i)}</span></div><div class="track" aria-hidden="true"><i class="pin" style="left:calc(${i}% - 2px)"></i></div><div class="scale"><span>조조군 앞섬</span><span>비슷함</span><span>연합군 앞섬</span></div></div>`;
const lvTip=(ok,text)=>`<b class="${ok?"ok":"warn"}">${ok?"그렇지요.":"다시 생각해 보시지요."}</b> ${text}`;
const lvCombos=c=>{const out=[];for(let a=0;a<=5;a++)for(let b=0;b<=5;b++)for(let d=0;d<=5;d++){if(!a&&!b&&!d)continue;if(c.topic==="fire"&&b)continue;out.push({ship:a,fire:b,plan:d})}return out};
const ruleText=()=>`${S.rule.min}회 이상 나온 사람, 이미 죽은 사람은 ${S.rule.dead?"빼고":"넣고"}`;

/* ---- the words each 순서 uses at 단계 2 and 3 ---- */
const applyScenarioTextLevel=applyScenarioText;
applyScenarioText=function(){
 applyScenarioTextLevel();
 const x=scenario(),lv=x.level,c=SC[x.id];if(!c||lv===1)return;
 const P=c.who?c.who.map(scKo).join("·"):"",Pn=c.who?scKo(c.who[c.who.length-1]):"";
 const set=(i,q,todo,why,short)=>{ST[i].q=q;SIMPLE_TODO[i]=todo;SIMPLE_WHY[i]=why;if(short)ST[i].short=short};
 if(lv===2){
  set(0,"기준을 바꿔 가며 명단을 살펴보시지요","명단 기준을 여러 번 바꿔 보고, 네 사람이 들어오고 빠지는 모습을 살펴보시지요.",
   ["기준 하나가 명단을 바꾸고, 명단이 점수를 바꿉니다. 어느 사람이 기준에 흔들리는지 먼저 찾아야겠지요.","기준을 바꿔 보면, 명단이 기준에 얼마나 기대는지 보입니다."],"기준 바꿔 보기");
  if(c.who)set(1,`${P}${lvJ(Pn,"을","를")} 빼면 평균은 오를까요, 내릴까요?`,"먼저 결과를 예측한 뒤 계산하고, 평균과 가운데 값 중 무엇이 더 흔들렸는지 견주어 보시지요.",
   ["예측을 먼저 하면, 내 생각과 숫자가 어디서 갈리는지 보이지요.","평균은 한 사람에게 끌려가고, 가운데 값은 덜 움직입니다."],"예측하고 확인하기");
  else set(1,"조조 한 사람이 ‘불’ 기록을 얼마나 차지할까요?","조조의 몫을 먼저 어림한 뒤, 실제로 빼서 확인해 보시지요.",
   ["불 점수를 없애면 누가 더 잃을지는, 불 기록이 한 사람에게 몰려 있는지에 달려 있겠지요.","합계를 보기 전에 한 사람의 몫을 어림해 봅니다."],"몫 어림하기");
  set(4,`${scKo(c.s5.n)}${c.s5.n2?"·"+scKo(c.s5.n2):""}의 ‘${SC_KNAME[c.s5.k]}’ 기록, 세 문장을 가려 보시지요`,"원문을 먼저 읽고, 숫자에 대한 세 문장이 맞는지 하나씩 가려 보시지요.",
   ["숫자에 대한 설명이 원문과 맞는지 하나씩 확인해야, 그 숫자를 믿을 수 있겠지요.","숫자에 대한 문장은 원문으로 확인합니다."],"세 문장 가리기");
  ST[5].short="판정이 바뀌는 곳 찾기";
  SIMPLE_TODO[5]=`${WI_JOURNEY[x.id].act.replace(/기$/,"고")}, 바람 보너스를 바꿔 가며 판정이 바뀌는 곳을 찾아보시지요.`;
  SIMPLE_WHY[5]=["결론이 어떤 가정 위에 서 있는지 알려면, 그 가정을 어디까지 바꿔도 버티는지 봐야겠지요.","판정이 바뀌는 지점이 곧 결론의 한계입니다."];
 }
 if(lv===3){
  set(0,"명단 기준을 정하고 까닭을 남겨 보시지요","기준을 직접 정하고, 그 기준에 맞는 까닭을 하나 골라 남겨 보시지요.",
   ["마지막 결론에는 누구를 셌는지가 함께 들어갑니다.","기준에는 까닭을 함께 적습니다."],"기준과 까닭");
  set(1,"두 편을 무엇으로 견줄지 정해 보시지요","평균과 가운데 값을 보고, 두 편을 견줄 대표값과 그 까닭을 정해 보시지요.",
   ["무엇으로 견주느냐에 따라 두 편의 차이가 달라 보입니다.","대표값을 고른 까닭도 결론의 일부입니다."],"대표값 정하기");
  set(2,"점수를 설계하고 까닭을 남겨 보시지요","배·불·계책의 점수를 정하고, 그 점수에 맞는 까닭을 골라 남겨 보시지요.",
   ["점수 규칙은 내가 만든 가정입니다. 까닭이 있어야 다른 사람이 같은 계산을 해 볼 수 있지요.","지표에는 만든 까닭을 함께 적습니다."],"점수 설계");
  set(3,"얼마나 같으면 믿을지 먼저 정해 보시지요","믿을 기준을 먼저 정한 뒤, 모든 점수 규칙을 계산해 그 기준을 넘는지 보시지요.",
   ["계산한 뒤에 기준을 정하면, 결과에 맞춰 기준을 고르게 되지요.","기준은 확인하기 전에 정합니다."],"믿을 기준 정하기");
  set(4,c.topic==="wind"?"바람 기록 중 무엇부터 확인하시겠습니까?":c.topic==="source"?"정사의 어느 기록부터 확인하시겠습니까?":`${P}의 기록 중 무엇부터 확인하시겠습니까?`,"결론에 영향을 줄 기록 하나를 골라 원문을 펼치고, 그 숫자를 어떻게 쓸지 정해 보시지요.",
   ["모든 기록을 다 읽을 수는 없지요. 무엇부터 확인할지 고르는 것도 분석입니다.","확인한 뒤에는 그 숫자를 어떻게 쓸지 밝혀 둡니다."],"확인할 기록 고르기");
 }
};

/* ================= 단계 2 ================= */

// 1) change the rule, watch the four people
function lv2Stage1({x,c}){
 const L=S.t.s1x=S.t.s1x||{tried:[]};
 const key=()=>S.rule.min+"-"+S.rule.dead,core=scCore(c),coreK=scKo(core);
 const counts=[];
 originalStageRenderer(1,[["s1","rules","기준 세 가지 해 보기"]],
  step(1,"기준을 바꿔 보시지요","",`<section class="card pane simple-result"><div class="ctrls">${seg("rMin",[[1,"1회 이상"],[2,"2회 이상"],[3,"3회 이상"]],S.rule.min,"최소 등장")}${seg("rDead",[[1,"죽은 사람 빼기"],[0,"죽은 사람 넣기"]],S.rule.dead,"사망자")}</div><div id="rNow"></div><p class="simple-note" id="rTried"></p></section>`)+
  step(2,"네 사람은 어떻게 될까요?","",`<div class="pcards" id="rCards">${c.s1.cards.map(([n,,fact])=>`<div class="pcard" data-n="${n}"><div class="pcard-h"><i class="dot" style="background:${fcol(PP[n].f)}"></i><b>${scKo(n)}</b><span>${FN[PP[n].f]}</span></div><p class="pcard-fact">${fact}</p><p class="r-state"></p></div>`).join("")}</div>`)+reveal('s1name'),
  {q:`기준을 여러 번 바꿔 보니, ${coreK}${lvJ(coreK,"은","는")} 어떻게 되었습니까?`,
   opts:["어느 기준에서도 명단에 남았습니다.","‘3회 이상’으로 하면 명단에서 빠졌습니다.","죽은 사람을 넣을 때만 명단에 들어왔습니다."],ok:0,
   good:`${coreK}처럼 기록이 많은 사람은 기준에 흔들리지 않습니다. 기준에 따라 들고 나는 것은 기록이 적은 사람들이지요. 그래서 기준은 명단의 가장자리를 바꿉니다.`,bad:"기준을 바꿀 때마다 네 사람의 표시가 어떻게 달라졌는지 다시 보시지요.",
   ev:()=>`해 본 기준 ${L.tried.length}가지 · 지금 기준 ${ruleText()} → ${rosterTotals().all}명`});
 simplifyStage(1);
 const draw=()=>{
  const r=roster(),t=rosterTotals();
  if(!L.tried.includes(key())){L.tried.push(key());save()}
  $("#rNow").innerHTML=twoSides({wei:t.wei,ally:t.ally},"명");
  for(const el of $$("#rCards .pcard")){const inR=r.includes(el.dataset.n);el.classList.toggle("out",!inR);el.querySelector(".r-state").innerHTML=inR?`<b class="ok">명단에 있음</b>`:`<b class="warn">빠짐</b>`}
  $("#rTried").textContent=L.tried.length<3?`${L.tried.length} / 3가지 해 봄`:"";
  const miss=(c.who||[]).filter(n=>!r.includes(n));
  if(L.tried.length>=3){setT("s1","rules");
   const sizes=L.tried.map(k=>{const [m,d]=k.split("-").map(Number),keep={...S.rule};S.rule.min=m;S.rule.dead=d;const n=roster().length;Object.assign(S.rule,keep);return n});
   show('s1name',named("기준 견주기",`해 본 기준에 따라 명단은 <b>${Math.min(...sizes)}명</b>에서 <b>${Math.max(...sizes)}명</b>까지 달라졌습니다. ${esc(coreK)}처럼 기록이 많은 사람은 그대로 남고, 기록이 적거나 이미 세상을 떠난 사람이 들고 나지요.${miss.length?` 다만 지금 기준에서는 ${esc(miss.map(scKo).join("·"))}${lvJ(scKo(miss[miss.length-1]),"이","가")} 빠지므로, 이 질문을 따지려면 기준을 다시 골라야 합니다.`:""}`))}
 };
 onSeg("rMin",v=>{S.rule.min=+v;save();draw()});onSeg("rDead",v=>{S.rule.dead=+v;save();draw()});draw();
}

// 2) predict first, then compare mean and median
function lv2Stage2({x,c}){
 const L=S.t.s2p=S.t.s2p||{};
 if(c.who){
  const f=c.side,label=f==="shu"?"촉":"오",mem=facMembers(f).sort((a,b)=>PP[b].pa-PP[a].pa);
  const P=c.who.map(scKo).join("·"),Pn=scKo(c.who[c.who.length-1]);
  const without=()=>mem.filter(n=>!c.who.includes(n));
  const a=avg(mem.map(n=>PP[n].pa)),b=avg(without().map(n=>PP[n].pa)),m0=median(mem.map(n=>PP[n].pa)),m1=median(without().map(n=>PP[n].pa));
  const dir=b>a?"up":a-b<a*0.1?"flat":"down",da=Math.abs(a-b),dm=Math.abs(m0-m1);
  const less=Math.abs(da-dm)<0.05?2:dm<da?1:0;
  originalStageRenderer(2,[["s2","drop","예측하고 빼 보기"],["s2","measure","두 값 견주기"]],
   step(1,`${label} 사람들의 등장 횟수`,"",`<section class="card pane"><div class="bars" id="memBars"></div><p class="big-change">${label} 평균 <b class="num">${fmt1(a)}</b> · 가운데 값 <b class="num">${fmt1(m0)}</b></p></section>`)+
   step(2,`${esc(P)}${lvJ(Pn,"을","를")} 빼면 평균은?`,"",`<section class="card pane">${lvPick("pred2",[["up","오를 것 같습니다"],["flat","거의 그대로일 것 같습니다"],["down","내려갈 것 같습니다"]],L.p,"three")}<button class="btn" id="dropTop" ${L.p?"":"disabled"}>빼고 계산하기</button><div id="dropRes"></div></section>`)+
   `<div class="named-wrap" id="s2m" hidden>${step(3,"평균과 가운데 값, 무엇이 더 흔들렸을까요?","",`<section class="card pane">${lvPick("meas2",[["mean","평균"],["median","가운데 값"]],L.m)}<div id="measRes"></div></section>`)}</div>`+reveal('s2name'),
   {q:`${P}${lvJ(Pn,"을","를")} 빼 보니, 평균과 가운데 값 중 무엇이 덜 움직였습니까?`,opts:["평균","가운데 값","둘 다 똑같이 움직였습니다"],ok:less,
    good:less===1?"가운데 값은 줄 세운 한가운데 사람의 값이라, 한 사람이 빠져도 덜 움직입니다. 한 사람의 큰 숫자가 걱정될 때 가운데 값을 함께 보는 까닭이지요.":"이번에는 평균이 덜 움직였군요. 빠진 사람의 숫자가 평균과 가까우면 평균도 크게 흔들리지 않습니다.",
    bad:"두 값이 빼기 전과 뒤에 얼마나 달라졌는지 다시 견주어 보시지요.",
    ev:()=>`예측 ${({up:"오름",flat:"그대로",down:"내림"})[L.p]||"-"} · 평균 ${fmt1(a)}→${fmt1(b)} · 가운데 값 ${fmt1(m0)}→${fmt1(m1)}`});
  simplifyStage(2);
  bars($("#memBars"),mem.map(n=>({label:scKo(n)+(c.who.includes(n)?" ●":""),v:PP[n].pa,c:fcol(f)})),PP[mem[0]].pa,'');
  const DIRW={up:"올라갔습니다",flat:"거의 그대로입니다",down:"내려갔습니다"};
  const done=()=>{setT("s2","drop");$("#dropTop").hidden=true;$$("#pred2 button").forEach(b=>b.disabled=true);
   $("#dropRes").innerHTML=`<p class="big-change">평균 <b class="num">${fmt1(a)}</b> → <b class="num">${fmt1(b)}</b> · 가운데 값 <b class="num">${fmt1(m0)}</b> → <b class="num">${fmt1(m1)}</b></p><p class="simple-note">${L.p===dir?"예측이 맞았군요.":"예측과 달랐군요."} 평균은 ${DIRW[dir]}.</p>`;
   $("#s2m").hidden=false;drawM()};
  const drawM=()=>{lvPress("meas2",L.m);if(!L.m)return;
   const right=(L.m==="median")===(dm<da);
   $("#measRes").innerHTML=`<p class="pcard-tip">${lvTip(right,`평균은 ${fmt1(da)}만큼, 가운데 값은 ${fmt1(dm)}만큼 움직였습니다.`)}</p>`;
   if(right){setT("s2","measure");show('s2name',named("예측과 확인",`먼저 예측하고 계산하면, 내 짐작이 어디서 틀렸는지 보입니다. ${esc(P)}${lvJ(Pn,"이","가")} 빠지자 평균은 ${fmt1(da)}, 가운데 값은 ${fmt1(dm)} 움직였지요. 한 사람의 숫자가 클수록 평균이 더 크게 흔들립니다.`))}};
  $("#pred2").addEventListener("click",e=>{const btn=e.target.closest("button");if(!btn||btn.disabled)return;L.p=btn.dataset.v;save();lvPress("pred2",L.p);$("#dropTop").disabled=false});
  $("#meas2").addEventListener("click",e=>{const btn=e.target.closest("button");if(!btn)return;L.m=btn.dataset.v;save();drawM()});
  $("#dropTop").onclick=()=>{L.dropped=1;save();done()};if(L.dropped)done();
  return;
 }
 // fire: guess the share before seeing it
 const r=roster(),ki=1,who="曹操",side=r.filter(n=>PP[n].f==="wei").reduce((s,n)=>s+PP[n].yy[ki],0),v=PP[who].yy[ki],pct=Math.round(v/side*100);
 const bucket=pct<25?"low":pct<50?"mid":"high";
 originalStageRenderer(2,[["s2","drop","어림하고 확인하기"]],
  step(1,"조조군의 ‘불’ 문단, 조조의 몫은?","",`<section class="card pane"><p class="big-change">조조군 ‘불’ 문단 <b class="num">${side}</b>개</p>${lvPick("pred2",[["low","4분의 1이 안 될 것 같습니다"],["mid","4분의 1에서 절반 사이일 것 같습니다"],["high","절반이 넘을 것 같습니다"]],L.p,"three")}<button class="btn" id="dropTop" ${L.p?"":"disabled"}>조조 빼고 다시 세기</button><div id="dropRes"></div></section>`)+reveal('s2name'),
  {q:"조조군의 ‘불’ 문단에서 조조 한 사람의 몫은 얼마였습니까?",opts:["4분의 1이 안 됩니다.","4분의 1에서 절반 사이입니다.","절반이 넘습니다."],ok:{low:0,mid:1,high:2}[bucket],
   good:`조조 한 사람이 ${pct}%를 차지합니다. 불 점수를 없애면 조조군이 그만큼 많이 잃게 되지요. 그 기록이 어떤 장면인지는 다섯 번째 순서에서 확인합니다.`,bad:"조조를 빼기 전과 뒤의 문단 수를 다시 견주어 보시지요.",
   ev:()=>`조조군 불 문단 ${side}개 중 조조 ${v}개 (${pct}%) · 어림 ${({low:"¼ 미만",mid:"¼~½",high:"½ 이상"})[L.p]||"-"}`});
 simplifyStage(2);
 const done=()=>{setT("s2","drop");$("#dropTop").hidden=true;$$("#pred2 button").forEach(b=>b.disabled=true);
  $("#dropRes").innerHTML=`<p class="big-change">조조군 ‘불’ 문단 <b class="num">${side}</b> → <b class="num">${side-v}</b></p><p class="simple-note">${L.p===bucket?"어림이 맞았군요.":"어림과 달랐군요."} 조조 한 사람이 <b>${pct}%</b>를 차지하고 있었습니다.</p>`;
  show('s2name',named("어림하고 확인하기","합계를 보기 전에 한 사람의 몫을 어림해 보면, 숫자가 한쪽에 몰려 있을 때 바로 알아챌 수 있습니다. 몰린 숫자일수록 그 사람의 기록부터 확인해야 하지요."))};
 $("#pred2").addEventListener("click",e=>{const btn=e.target.closest("button");if(!btn||btn.disabled)return;L.p=btn.dataset.v;save();lvPress("pred2",L.p);$("#dropTop").disabled=false});
 $("#dropTop").onclick=()=>{L.dropped=1;save();done()};if(L.dropped)done();
}

// 5) read first, then judge three claims about the number
const LV2_CLAIMS={
 zy:[["주유는 이 문단에서 불을 지르는 쪽에 있습니다.",1],["주유의 ‘불’ 점수는 주유가 불에 당한 횟수입니다.",0],["‘불’ 글자 수가 주유의 실제 화공 실력을 잽니다.",0]],
 hg:[["황개는 이 문단에서 직접 배를 몹니다.",0],["다른 사람의 대사 속에 황개의 이름이 나옵니다.",1],["이 문단도 황개의 ‘불’ 기록으로 세어졌습니다.",1]],
 nofire:[["두 문단 모두 ‘불’ 기록으로 세어졌습니다.",1],["조조는 불을 지르는 쪽에 있습니다.",0],["불 점수를 0으로 두면, 불에 당한 기록도 함께 빠집니다.",1]]
};
function lv2Stage5({x,c}){
 const L=S.t.s5c=S.t.s5c||{},s=c.s5,claims=LV2_CLAIMS[x.id]||[];
 const quote=(n,k)=>{const e=(EVID[n]||{})[k];return e?`<p class="simple-note">${srcB('yy',`연의 ${e[0]}회`)} ${scKo(n)}</p><blockquote class="evq">${hiKw(e[1],k)}</blockquote>`:""};
 originalStageRenderer(5,[["s5","victim","세 문장 가리기"]],
  step(1,"원문을 먼저 읽어 보시지요","",`<section class="card pane">${quote(s.n,s.k)}${s.n2?quote(s.n2,s.k):""}</section>`)+
  step(2,"이 숫자에 대한 세 문장, 맞을까요?","",`<div class="sort-list" id="claims5">${claims.map(([t],i)=>`<section class="card pane sort-item" data-i="${i}"><p>${esc(t)}</p><div class="pick" role="group"><button data-v="1">맞습니다</button><button data-v="0">아닙니다</button></div><p class="pcard-tip" hidden></p></section>`).join("")}</div>`)+reveal('s5name'),
  {...s.check,good:"원문과 하나씩 맞춰 보니, 숫자가 무엇을 센 것인지 분명해졌습니다. 숫자에 대한 설명은 이렇게 원문으로 가려 봅니다.",bad:"방금 가린 세 문장을 다시 떠올려 보시지요.",
   ev:()=>claims.map(([t,v])=>`${v?"○":"×"} ${t}`).join(" ")});
 simplifyStage(5);
 const draw=()=>{for(const el of $$("#claims5 .sort-item")){const i=+el.dataset.i,v=L[i],right=claims[i][1];
   el.querySelectorAll(".pick button").forEach(b=>b.setAttribute("aria-pressed",String(v!==undefined&&+b.dataset.v===v)));
   const tip=el.querySelector(".pcard-tip");if(v===undefined){tip.hidden=true;continue}tip.hidden=false;
   tip.innerHTML=v===right?`<b class="ok">그렇지요.</b> 원문과 맞습니다.`:`<b class="warn">다시 읽어 보시지요.</b> 원문에서 이 사람이 무엇을 하고 있는지 보시지요.`}
  if(claims.every(([,r],i)=>L[i]===r)){setT("s5","victim");show('s5name',named("근거 대조",esc(s.take)))}};
 $("#claims5").addEventListener("click",e=>{const b=e.target.closest(".pick button");if(!b)return;L[+b.closest(".sort-item").dataset.i]=+b.dataset.v;save();draw()});
 draw();
}

// 6) apply the change, then find where the verdict flips
const LV2_BONUS=[0,5,10,15,20,25,30];
function lv2Stage6(){
 applyScenarioText();
 const x=scenario(),j=WI_JOURNEY[x.id],L=S.t.s6f=S.t.s6f||{seen:[]};
 const base=wiCalc().i,changed=wiCalc(x).i,raw=wiCalc({...x,wind:"none"}).i,at=b=>Math.max(0,Math.min(100,raw+b));
 const flips=[];for(let k=1;k<LV2_BONUS.length;k++)if(wiVerdict(at(LV2_BONUS[k]))!==wiVerdict(at(LV2_BONUS[k-1])))flips.push([LV2_BONUS[k-1],LV2_BONUS[k]]);
 const q=qShort(x);
 const chk=flips.length
  ?{q:`‘${q}’의 판정은 바람 가정에 얼마나 기대고 있습니까?`,opts:["바람을 어떻게 보든 판정은 같습니다.",`바람 보너스가 ${flips[0][0]}~${flips[0][1]}점 사이에서 판정이 바뀌므로, 바람 가정을 함께 말해야 합니다.`,"바람 보너스가 클수록 조조군이 앞섭니다."],ok:1,
    good:"판정이 바뀌는 지점을 알면, 결론이 어떤 가정에 기대는지 정확히 말할 수 있습니다.",bad:"바람 보너스를 바꿀 때 판정이 어디서 달라졌는지 다시 보시지요."}
  :{q:`‘${q}’의 판정은 바람 가정에 얼마나 기대고 있습니까?`,opts:[`바람 보너스를 0~30점으로 바꿔도 판정은 ‘${wiVerdict(at(0))}’ 그대로입니다.`,"바람 보너스에 따라 판정이 뒤집힙니다.","바람이 불지 않으면 조조군이 이깁니다."],ok:0,
    good:"바람을 어떻게 보아도 판정이 같다면, 이 질문의 결론은 바람 가정에 크게 기대지 않습니다. 그래도 어떤 범위를 살폈는지는 함께 적지요.",bad:"바람 보너스를 바꿔 가며 판정이 달라졌는지 다시 보시지요."};
 chk.ev=()=>`지수 ${base} → ${changed} · 바람 보너스 0~30: ${at(0)}~${at(30)}${flips.length?` · ${flips[0][0]}~${flips[0][1]}점에서 판정 바뀜`:" · 판정 그대로"}`;
 originalStageRenderer(6,[["s6","move",j.act],["s6","wind","판정이 바뀌는 곳 찾기"]],
  step(1,"지금 기록대로 계산하면","",`<section class="card pane">${lvMeter(base)}<button class="btn" id="move6">${esc(j.act)}</button><div id="mv6"></div></section>`)+
  `<div class="named-wrap" id="flip6sec" hidden>${step(2,"바람 보너스를 바꿔 보시지요","",`<section class="card pane"><div class="field">바람 보너스${seg("bonus6",LV2_BONUS.map(b=>[b,String(b)]),L.b===undefined?10:L.b,"바람 보너스")}</div><div id="flip6"></div><p class="simple-note" id="seen6"></p></section>`)}</div>`+
  reveal('s6name')+`<div class="named-wrap" id="s6pred" hidden></div>`,chk);
 simplifyStage(6);
 const afterMove=()=>{setT("s6","move");$("#move6").hidden=true;
  $("#mv6").innerHTML=`<p class="big-change"><b class="num">${base}</b> → <b class="num">${changed}</b></p><p class="simple-note">${esc(j.did)}</p>`;
  $("#flip6sec").hidden=false;draw()};
 const draw=()=>{const b=L.b===undefined?10:L.b,v=at(b);
  if(!L.seen.includes(b)){L.seen.push(b);save()}
  $("#flip6").innerHTML=lvMeter(v);
  $("#seen6").textContent=L.seen.length<4?`${L.seen.length} / 4가지 해 봄`:"";
  if(L.seen.length>=4){setT("s6","wind");
   show('s6name',named("판정이 바뀌는 곳",flips.length?`바람 보너스가 <b>${flips[0][0]}점</b>일 때는 ‘${wiVerdict(at(flips[0][0]))}’, <b>${flips[0][1]}점</b>일 때는 ‘${wiVerdict(at(flips[0][1]))}’입니다. 이 질문의 결론은 바람을 얼마로 보느냐에 기대고 있지요. 결론에는 이 경계를 함께 적습니다.`:`바람 보너스를 0점에서 30점까지 바꿔도 판정은 ‘${wiVerdict(at(0))}’ 그대로입니다. 이 질문의 결론은 바람 가정에 크게 기대지 않는군요.`));
   const pred=Number.isInteger(S.prediction)&&PREDICTIONS[S.prediction],p=$("#s6pred");p.hidden=false;
   p.innerHTML=`<section class="prediction-review"><div class="prediction-comparison"><div><h3>처음 예상</h3><p data-original-prediction>${pred?esc(pred):'처음 화면에서 남긴 예상이 없습니다.'}</p></div><div><h3>찾은 범위</h3><p>바람 보너스 0~30점 · 지수 ${at(0)}~${at(30)}</p></div></div></section>`}};
 $("#move6").onclick=afterMove;onSeg("bonus6",v=>{L.b=+v;save();draw()});
 if(tk("s6","move"))afterMove();
 $("#main").insertAdjacentHTML("beforeend",`<a class="lab-link card" href="#lab"><b>다른 가정도 살펴보기</b></a>`);
}

/* ================= 단계 3 ================= */

// 1) set the rule with a reason that fits it
const LV3_RULE_WHY=[["한 번 스친 이름은 이 싸움의 기록으로 보기 어렵습니다.",r=>r.min>=2,"기준이 ‘1회 이상’이면 한 번 스친 이름도 들어옵니다."],
 ["기록이 적은 사람도 놓치지 않으려 합니다.",r=>r.min<=2,"‘3회 이상’이면 기록이 적은 사람이 빠집니다."],
 ["이미 세상을 떠난 사람은 이 싸움에 나올 수 없습니다.",r=>r.dead===1,"죽은 사람을 넣는 기준과 맞지 않습니다."]];
function lv3Stage1({x,c}){
 const L=S.t.s1r=S.t.s1r||{};
 const fits=()=>L.why!==undefined&&LV3_RULE_WHY[L.why][1](S.rule);
 originalStageRenderer(1,[["s1","rules","기준 정하기"],["s1","reason","까닭 남기기"]],
  step(1,"명단 기준을 정해 보시지요","",`<section class="card pane simple-result"><div class="ctrls">${seg("rMin",[[1,"1회 이상"],[2,"2회 이상"],[3,"3회 이상"]],S.rule.min,"최소 등장")}${seg("rDead",[[1,"죽은 사람 빼기"],[0,"죽은 사람 넣기"]],S.rule.dead,"사망자")}</div><div id="rNow"></div><p class="simple-note" id="rOut"></p><button class="btn" id="rFix">이 기준으로 정하기</button></section>`)+
  `<div class="named-wrap" id="rWhySec" hidden>${step(2,"이 기준을 고른 까닭은?","",`<section class="card pane">${lvPick("rWhy",LV3_RULE_WHY.map((w,i)=>[i,w[0]]),L.why,"stack")}<p class="pcard-tip" id="rWhyTip" hidden></p></section>`)}</div>`+reveal('s1name'),
  {q:`‘${qShort(x)}’의 결론에, 이 명단 기준은 어떻게 적어야 할까요?`,opts:["기준은 계산 과정일 뿐이니 결론에 적지 않습니다.","기준과 그렇게 정한 까닭을 함께 적습니다.","가장 많이 나온 사람의 이름만 적습니다."],ok:1,
   good:"누구를 셌는지와 그 까닭을 적어 두면, 다른 사람도 같은 명단으로 다시 계산해 볼 수 있습니다.",bad:"이 순서에서 정한 두 가지를 다시 떠올려 보시지요.",
   ev:()=>`기준: ${ruleText()} · 까닭: ${L.why!==undefined?LV3_RULE_WHY[L.why][0]:"-"}`});
 simplifyStage(1);
 const draw=()=>{const r=roster(),t=rosterTotals();$("#rNow").innerHTML=twoSides({wei:t.wei,ally:t.ally},"명");
  const out=c.s1.cards.filter(([n])=>!r.includes(n)).map(([n])=>scKo(n)),miss=(c.who||[]).filter(n=>!r.includes(n));
  $("#rOut").innerHTML=`네 사람 중 빠지는 사람: ${out.length?esc(out.join("·")):"없음"}${miss.length?` <b class="warn">· 이 질문의 ${esc(miss.map(scKo).join("·"))}까지 빠집니다</b>`:""}`;
  $("#rFix").disabled=!!miss.length;
  lvPress("rWhy",L.why);const tip=$("#rWhyTip");
  if(L.why!==undefined){tip.hidden=false;tip.innerHTML=fits()?lvTip(true,"기준과 까닭이 맞습니다."):lvTip(false,LV3_RULE_WHY[L.why][2])}
  if(tk("s1","rules"))$("#rWhySec").hidden=false;
  if(fits()&&tk("s1","rules")){setT("s1","reason");show('s1name',named("기준과 까닭",`내 기준은 ‘${ruleText()}’, 까닭은 ‘${esc(LV3_RULE_WHY[L.why][0])}’입니다. 이 두 줄은 마지막 결론에 그대로 들어갑니다.`))}
  else $("#s1name").hidden=true};
 const reset=()=>{if(S.t.s1){delete S.t.s1.rules;delete S.t.s1.reason}save();drawTasks();draw()};
 onSeg("rMin",v=>{S.rule.min=+v;reset()});onSeg("rDead",v=>{S.rule.dead=+v;reset()});
 $("#rFix").onclick=()=>{L.rule={...S.rule};setT("s1","rules");draw()};
 $("#rWhy").addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;L.why=+b.dataset.v;save();draw()});
 draw();
}

// 2) choose the representative value with a reason
const LV3_MEAS_WHY=[["몇 사람의 큰 숫자에 끌려가지 않으려 합니다.","median"],["모든 사람의 기록을 빠짐없이 반영하려 합니다.","mean"],["두 편의 차이가 더 크게 보이게 하려 합니다.",null]];
function lv3Stage2({x,c}){
 const L=S.t.s2r=S.t.s2r||{};
 const sideVals=(mut={})=>{const r=roster(),fOf=n=>mut[n]!==undefined?mut[n]:PP[n].f;const pick=w=>r.filter(n=>fOf(n)&&(w?fOf(n)==="wei":fOf(n)!=="wei")).map(n=>PP[n].pa);return {wei:pick(1),ally:pick(0)}};
 const stat=(v,m)=>fmt1(m==="median"?median(v):avg(v));
 const now=sideVals(),moved=c.who?sideVals(x.mut||{}):null;
 const row=(lbl,v)=>`<tr><th>${lbl}</th><td class="num">${stat(v.wei,"mean")}</td><td class="num">${stat(v.wei,"median")}</td><td class="num">${stat(v.ally,"mean")}</td><td class="num">${stat(v.ally,"median")}</td></tr>`;
 originalStageRenderer(2,[["s2","measure","대표값과 까닭 정하기"]],
  step(1,"두 편의 등장 횟수, 평균과 가운데 값","",`<section class="card pane"><table class="lv-table"><thead><tr><th></th><th>조조군 평균</th><th>가운데 값</th><th>연합군 평균</th><th>가운데 값</th></tr></thead><tbody>${row("지금 기록",now)}${moved?row(`${c.who.map(scKo).join("·")} 옮긴 뒤`,moved):""}</tbody></table></section>`)+
  step(2,"무엇으로 견주시겠습니까?","",`<section class="card pane">${lvPick("meas3",[["mean","평균"],["median","가운데 값"]],L.m)}<div class="named-wrap" id="measWhySec" hidden>${lvPick("measWhy",LV3_MEAS_WHY.map((w,i)=>[i,w[0]]),L.why,"stack")}<p class="pcard-tip" id="measTip" hidden></p></div></section>`)+reveal('s2name'),
  {q:"두 편을 견줄 대표값을 정했다면, 결론에 함께 적을 것은?",opts:["가장 큰 숫자 하나만 적습니다.","대표값은 적지 않아도 됩니다.","어떤 대표값을 골랐고, 왜 골랐는지 적습니다."],ok:2,
   good:"평균으로 보느냐 가운데 값으로 보느냐에 따라 차이가 달라 보이지요. 그래서 무엇으로 견주었는지 밝혀 둡니다.",bad:"이 순서에서 정한 두 가지를 다시 떠올려 보시지요.",
   ev:()=>`대표값: ${L.m==="median"?"가운데 값":L.m==="mean"?"평균":"-"} · 까닭: ${L.why!==undefined?LV3_MEAS_WHY[L.why][0]:"-"}`});
 simplifyStage(2);
 const draw=()=>{lvPress("meas3",L.m);lvPress("measWhy",L.why);$("#measWhySec").hidden=!L.m;
  const tip=$("#measTip");if(L.why===undefined||!L.m){tip.hidden=true;return}tip.hidden=false;
  const need=LV3_MEAS_WHY[L.why][1],ok=need===L.m;
  tip.innerHTML=need===null?lvTip(false,"결과를 보고 대표값을 고르면, 보고 싶은 결론에 숫자를 맞추게 됩니다."):ok?lvTip(true,"대표값과 까닭이 맞습니다."):lvTip(false,"고른 대표값과 까닭이 맞지 않습니다.");
  if(ok){setT("s2","measure");const m=L.m,ratio=(stat(now.ally,m)/Math.max(0.1,stat(now.wei,m))).toFixed(1);
   show('s2name',named("대표값 고르기",`${m==="median"?"가운데 값":"평균"}으로 보면 연합군 한 사람은 조조군 한 사람의 약 <b>${ratio}배</b> 나옵니다. 어떤 값으로 견주었는지는 마지막 결론에 함께 들어갑니다.`))}};
 $("#meas3").addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;L.m=b.dataset.v;save();draw()});
 $("#measWhy").addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;L.why=+b.dataset.v;save();draw()});
 draw();
}

// 3) design the score with a reason that fits the weights
const LV3_W_WHY=[["불이 승부를 가른 싸움이라 불에 가장 무게를 둡니다.",w=>w.fire>=w.ship&&w.fire>=w.plan&&w.fire>0,"불보다 다른 점수가 더 크군요."],
 ["배·불·계책을 고르게 봅니다.",w=>Math.max(w.ship,w.fire,w.plan)-Math.min(w.ship,w.fire,w.plan)<=1,"세 점수의 차이가 2점 이상입니다."],
 ["수전이니 배에 가장 무게를 둡니다.",w=>w.ship>=w.fire&&w.ship>=w.plan&&w.ship>0,"배보다 다른 점수가 더 크군요."]];
function lv3Stage3({x,c}){
 const L=S.t.s3r=S.t.s3r||{};const lens=c.topic==="source"?"jb":"yy";
 const fits=()=>L.why!==undefined&&LV3_W_WHY[L.why][1](S.w);
 originalStageRenderer(3,[["s3","weight","점수와 까닭 정하기"]],
  step(1,"점수를 설계해 보시지요","",`<div class="cols"><section class="card pane"><div class="weights" id="wts3"></div></section><section class="card pane simple-result"><div id="score3"></div><p class="simple-note" id="ratio3"></p></section></div>`)+
  step(2,"이렇게 정한 까닭은?","",`<section class="card pane">${lvPick("wWhy",LV3_W_WHY.map((w,i)=>[i,w[0]]),L.why,"stack")}<p class="pcard-tip" id="wTip" hidden></p><button class="btn" id="fixW" disabled>이 점수로 정하기</button></section>`)+reveal('s3name'),
  {q:`내가 만든 점수 규칙으로 ‘${qShort(x)}’을 다른 사람이 다시 계산하려면?`,opts:["점수 규칙과 그렇게 정한 까닭을 함께 알려 줍니다.","결과 숫자만 알려 주면 됩니다.","규칙은 바꿀 수 있으니 알려 주지 않습니다."],ok:0,
   good:"규칙과 까닭을 알면, 다른 사람도 같은 숫자를 만들고 다른 규칙과 견주어 볼 수 있습니다.",bad:"이 순서에서 정한 두 가지를 다시 떠올려 보시지요.",
   ev:()=>`점수: 배 ${S.w.ship}·불 ${S.w.fire}·계책 ${S.w.plan} · 까닭: ${L.why!==undefined?LV3_W_WHY[L.why][0]:"-"}`});
 simplifyStage(3);
 const draw=()=>{
  $("#wts3").innerHTML=[['ship','배'],['fire','불'],['plan','계책']].map(([k,l])=>`<div class="w"><span>${l} 1번에</span><span class="stepper-n"><button data-w="${k}" data-d="-1" aria-label="${l} 점수 내리기">−</button><output class="num">${S.w[k]}점</output><button data-w="${k}" data-d="1" aria-label="${l} 점수 올리기">+</button></span></div>`).join('');
  const s=fs(lens),A=s.wu+s.shu,W=s.wei;$("#score3").innerHTML=twoSides({wei:W,ally:A},'점');
  $("#ratio3").textContent=c.who?`옮겨 갈 점수 ${c.who.reduce((t,n)=>t+(roster().includes(n)?scoreOf(n,lens):0),0)}점`:c.topic==="wind"?"바람은 점수에 넣지 않고, 마지막 순서에서 가정으로 다룹니다.":"정사 본문으로 센 점수입니다.";
  lvPress("wWhy",L.why);const tip=$("#wTip");
  if(L.why!==undefined){tip.hidden=false;tip.innerHTML=fits()?lvTip(true,"점수와 까닭이 맞습니다."):lvTip(false,LV3_W_WHY[L.why][2])}
  $("#fixW").disabled=!fits();
 };
 $("#wts3").addEventListener('click',e=>{const b=e.target.closest('button[data-w]');if(!b)return;const k=b.dataset.w;S.w[k]=Math.max(0,Math.min(5,S.w[k]+ +b.dataset.d));if(S.t.s3)delete S.t.s3.weight;save();drawTasks();$("#s3name").hidden=true;draw()});
 $("#wWhy").addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;L.why=+b.dataset.v;save();draw()});
 const fix=()=>{setT("s3","weight");show('s3name',named("점수 설계",`배 ${S.w.ship}·불 ${S.w.fire}·계책 ${S.w.plan}, 까닭은 ‘${esc(LV3_W_WHY[L.why][0])}’입니다. 이 규칙과 까닭도 마지막 결론에 들어갑니다.`))};
 $("#fixW").onclick=fix;draw();if(tk("s3","weight")&&fits())fix();
}

// 4) set the bar first, then compute
function lv3Stage4({x,c}){
 const L=S.t.s4r=S.t.s4r||{};
 const combos=lvCombos(c),cur=wiCalc(x).i,curV=wiVerdict(cur),after=w=>wiCalc({...x,w}).i;
 const q=qShort(x);
 const res=()=>{let same=0,min=100,max=0;for(const w of combos){const v=after(w);if(wiVerdict(v)===curV)same++;min=Math.min(min,v);max=Math.max(max,v)}return {same,min,max,pct:Math.round(same/combos.length*100)}};
 const R=res(),pass=th=>R.pct>=th;
 originalStageRenderer(4,[["s4","bar","믿을 기준 정하기"],["s4","run","모든 규칙 계산하기"]],
  step(1,"몇 % 이상 같으면 믿으시겠습니까?","",`<section class="card pane"><p class="simple-note">지금 판정은 ‘${curV}’입니다. 점수 규칙 ${combos.length}가지 중 몇 %에서 이 판정이 그대로여야 믿을 수 있을까요?</p>${seg("bar4",[[50,"50% 이상"],[70,"70% 이상"],[90,"90% 이상"]],L.th,"믿을 기준")}</section>`)+
  step(2,"이제 모두 계산해 보시지요","",`<section class="card pane"><button class="btn" id="runAll" ${L.th?"":"disabled"}>${combos.length}가지 전부 계산하기</button><div id="allRes"></div></section>`)+reveal('s4name'),
  {q:`미리 정한 기준에 비추어 보면, ‘${q}’의 결론은?`,opts:["기준을 넘었으므로, 점수 규칙에 크게 흔들리지 않는다고 말할 수 있습니다.","기준에 못 미쳤으므로, 점수 규칙에 따라 달라질 수 있다고 적어야 합니다.","결과를 보고 기준을 다시 정하면 됩니다."],ok:pass(L.th||70)?0:1,
   good:"계산하기 전에 정한 기준으로 판단해야, 결과에 맞춰 기준을 바꾸는 일을 피할 수 있습니다.",bad:"미리 정한 기준과 계산한 비율을 다시 견주어 보시지요.",
   ev:()=>`기준 ${L.th}% · ${combos.length}가지 중 ${R.same}가지(${R.pct}%)에서 ‘${curV}’ 유지 · 범위 ${R.min}~${R.max}`});
 simplifyStage(4);
 const run=()=>{setT("s4","run");L.ran=1;save();$("#runAll").hidden=true;$$("#bar4 button").forEach(b=>b.disabled=true);
  $("#allRes").innerHTML=`<p class="big-change"><b class="num">${R.same}</b> / ${combos.length}가지 · <b class="num">${R.pct}%</b></p><div class="pctbar"><i style="width:${R.pct}%"></i></div><p class="simple-note">기준 ${L.th}% ${pass(L.th)?"를 넘었습니다":"에 못 미쳤습니다"} · 지수 범위 ${R.min}~${R.max}</p>`;
  show('s4name',named(pass(L.th)?"기준을 넘은 결론":"기준에 못 미친 결론",pass(L.th)?`미리 정한 ${L.th}% 기준을 넘었습니다. 살펴본 점수 규칙에서는 ‘${curV}’이라는 판정이 크게 흔들리지 않는다고 말할 수 있지요.`:`미리 정한 ${L.th}% 기준에 못 미쳤습니다. 결론에는 점수 규칙에 따라 판정이 달라질 수 있다고 함께 적어야 합니다.`))};
 onSeg("bar4",v=>{if(L.ran)return;L.th=+v;setT("s4","bar");save();$("#runAll").disabled=false});
 $("#runAll").onclick=run;if(L.ran&&L.th)run();
}

// 5) choose which record to verify and how to use it
const LV3_RECORDS={
 nowind:[["諸葛亮","wind"],["周瑜","wind"],["曹操","wind"]],
 combo:[["周瑜","fire"],["黃蓋","fire"],["周瑜","plan"]],
 jb:[["諸葛亮","wind"],["諸葛亮","plan"],["周瑜","fire"]]
};
const LV3_USE=[["그대로 씁니다",0],["무엇을 센 것인지 밝히고 씁니다",1],["계산에서 뺍니다",0]];
function lv3Stage5({x,c}){
 const L=S.t.s5r=S.t.s5r||{},recs=LV3_RECORDS[x.id]||[[c.s5.n,c.s5.k]],jb=c.topic==="source";
 const count=([n,k])=>jb?`정사 본문 ${PP[n].jb[SC_KI[k]]} · 주석 ${PP[n].jn[SC_KI[k]]}문장`:`‘${SC_KNAME[k]}’ 문단 ${PP[n].yy[SC_KI[k]]}개`;
 originalStageRenderer(5,[["s5","victim","기록 고르고 쓰임 정하기"]],
  step(1,"어느 기록부터 확인하시겠습니까?","",`<div class="pcards three" id="recs5">${recs.map(([n,k],i)=>`<div class="pcard" data-i="${i}"><div class="pcard-h"><i class="dot" style="background:${fcol(PP[n].f)}"></i><b>${scKo(n)} · ${SC_KNAME[k]}</b></div><p class="pcard-fact">${count([n,k])}</p><button class="btn ghost" data-i="${i}">이 기록 펼치기</button></div>`).join("")}</div>`)+
  `<div class="named-wrap" id="rec5sec" hidden>${step(2,"이 숫자를 어떻게 쓰시겠습니까?","",`<section class="card pane simple-result"><div id="txt5"></div>${lvPick("use5",LV3_USE.map((u,i)=>[i,u[0]]),L.use,"three")}<p class="pcard-tip" id="useTip" hidden></p></section>`)}</div>`+reveal('s5name'),
  {q:"확인한 기록을 결론에 어떻게 남겨야 할까요?",opts:["숫자가 크면 그대로 믿고 적습니다.","확인한 기록이 무엇을 센 것인지 한 줄로 밝힙니다.","확인한 기록은 적지 않습니다."],ok:1,
   good:"어떤 기록을 확인했고 그 숫자가 무엇을 센 것인지 밝히면, 결론을 읽는 사람이 숫자의 뜻을 오해하지 않습니다.",bad:"방금 고른 쓰임을 다시 떠올려 보시지요.",
   ev:()=>{const r=recs[L.pick];return r?`${scKo(r[0])}의 ‘${SC_KNAME[r[1]]}’ 기록 확인 · ${LV3_USE[L.use]?LV3_USE[L.use][0]:"-"}`:"-"}});
 simplifyStage(5);
 const open=()=>{const r=recs[L.pick];if(!r)return;$$("#recs5 .pcard").forEach(p=>p.classList.toggle("chosen",+p.dataset.i===L.pick));
  const e=(EVID[r[0]]||{})[r[1]];
  $("#txt5").innerHTML=(jb?`<div class="sides"><div class="side"><i style="background:var(--old)"></i><span>정사 본문</span><b class="num">${PP[r[0]].jb[SC_KI[r[1]]]}<small>문장</small></b></div><div class="side"><i style="background:var(--wind)"></i><span>배송지 주석</span><b class="num">${PP[r[0]].jn[SC_KI[r[1]]]}<small>문장</small></b></div></div>`:"")+
   (e?`<p class="simple-note">${srcB('yy',`연의 ${e[0]}회`)} ${scKo(r[0])}</p><blockquote class="evq">${hiKw(e[1],r[1])}</blockquote>`:"");
  $("#rec5sec").hidden=false;drawUse()};
 const drawUse=()=>{lvPress("use5",L.use);const tip=$("#useTip");if(L.use===undefined){tip.hidden=true;return}tip.hidden=false;
  const ok=LV3_USE[L.use][1]===1;
  tip.innerHTML=ok?lvTip(true,"글자가 함께 나온 장면을 센 숫자라는 것을 밝혀 두면, 그대로 써도 오해가 없지요."):L.use===0?lvTip(false,"방금 읽은 장면처럼, 숫자에는 공격·피해·언급이 섞여 있을 수 있습니다."):lvTip(false,"빼 버리면 확인한 기록까지 잃게 됩니다. 뜻을 밝혀 두는 편이 낫지요.");
  if(ok){setT("s5","victim");const r=recs[L.pick];show('s5name',named("확인한 기록",`${esc(scKo(r[0]))}의 ‘${SC_KNAME[r[1]]}’ 기록을 확인하고, 무엇을 센 숫자인지 밝히고 쓰기로 했습니다. 이 한 줄도 마지막 결론에 들어갑니다.`))}};
 $("#recs5").addEventListener("click",e=>{const b=e.target.closest("button[data-i]");if(!b)return;L.pick=+b.dataset.i;delete L.use;if(S.t.s5)delete S.t.s5.victim;save();drawTasks();$("#s5name").hidden=true;open()});
 $("#use5").addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;L.use=+b.dataset.v;save();drawUse()});
 if(L.pick!==undefined)open();
}

/* 순서 1–5 not yet done at 단계 3: a gentle nudge above the conclusion, never a lock */
function lv3Missing(){const t=S.t,x=scenario(),recs=LV3_RECORDS[x.id];
 return [[1,t.s1r&&t.s1r.why!==undefined],[2,t.s2r&&t.s2r.m],[3,t.s3r&&t.s3r.why!==undefined],[4,t.s4r&&t.s4r.th],[5,recs&&t.s5r&&t.s5r.pick!==undefined]].filter(r=>!r[1]).map(r=>r[0])}
function lv3Nudge(){const miss=lv3Missing(),D=S.t.s6c||{};if(!miss.length||D.skip)return "";
 return `<section class="lv-nudge" id="lvNudge"><p>앞 순서에서 정한 것이 이 결론에 그대로 들어갑니다. ${miss.length===5?"아직 앞 순서를 하나도 하지 않으셨군요.":`아직 순서 ${miss.join("·")}${lvJ(String(miss[miss.length-1]),"을","를")} 마치지 않으셨군요.`} 먼저 해 보시기를 권합니다. 그래도 바로 쓰시겠습니까?</p><div class="lv-nudge-act"><a class="btn ghost" href="#s${miss[0]}">순서 ${miss[0]}로 가기</a><button class="linkbtn" id="lvSkip">그래도 바로 쓰기</button></div></section>`}

/* what 단계 3 decided before the conclusion (read by lv3Stage6) */
function lv3Decided(){
 const t=S.t,rows=[];
 if(t.s1r&&t.s1r.why!==undefined)rows.push(["명단",`${ruleText()} — ${LV3_RULE_WHY[t.s1r.why][0]}`]);
 if(t.s2r&&t.s2r.m)rows.push(["대표값",`${t.s2r.m==="median"?"가운데 값":"평균"}${t.s2r.why!==undefined?` — ${LV3_MEAS_WHY[t.s2r.why][0]}`:""}`]);
 if(t.s3r&&t.s3r.why!==undefined)rows.push(["점수",`배 ${S.w.ship}·불 ${S.w.fire}·계책 ${S.w.plan} — ${LV3_W_WHY[t.s3r.why][0]}`]);
 if(t.s4r&&t.s4r.th)rows.push(["믿을 기준",`${t.s4r.th}% 이상${S.done[4]?` — ${S.done[4].replace(/^기준 \d+% · /,"")}`:""}`]);
 const x=scenario(),recs=LV3_RECORDS[x.id];
 if(recs&&t.s5r&&t.s5r.pick!==undefined&&recs[t.s5r.pick])rows.push(["확인한 기록",`${scKo(recs[t.s5r.pick][0])}의 ‘${SC_KNAME[recs[t.s5r.pick][1]]}’${t.s5r.use===1?" — 무엇을 센 것인지 밝히고 씀":""}`]);
 return rows.length?`<dl class="lv-decided">${rows.map(([k,v])=>`<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>`:"";
}

/* ---- route by level ---- */
(()=>{
 const R=[null,RENDER[1],RENDER[2],RENDER[3],RENDER[4],RENDER[5],RENDER[6]];
 const P2={1:lv2Stage1,2:lv2Stage2,5:lv2Stage5},P3={1:lv3Stage1,2:lv3Stage2,3:lv3Stage3,4:lv3Stage4,5:lv3Stage5};
 for(const i of [1,2,3,4,5])RENDER[i]=function(){
  const x=scenario(),lv=x.level,fn=lv===2?P2[i]:lv===3?P3[i]:null;
  if(!fn||!SC[x.id])return R[i].apply(this,arguments);
  applyScenarioText();fn({x,c:SC[x.id]});markScenario();
 };
 RENDER[6]=function(){if(levelNow()!==2)return R[6].apply(this,arguments);lv2Stage6()};
})();

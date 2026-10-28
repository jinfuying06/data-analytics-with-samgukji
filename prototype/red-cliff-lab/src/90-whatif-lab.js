/* ===== What-if lab: many questions, one journey =====
   Each What-if is one row of data: what to change (people, wind, scoring, record).
   The calculation is the same as stage 6, so a new question needs no new code. */
const WI_W={base:null,fire0:{ship:3,fire:0,plan:2},ship:{ship:5,fire:0,plan:0},plan:{ship:0,fire:0,plan:5}};
const WI_WIND={env:"바람은 날씨 (연합군 +10)",zg:"바람은 제갈량이 부름 (제갈량 편 +10)",none:"바람 없음"};
const WI_KIND={move:"인물 옮기기",drop:"인물 빼기",cond:"조건 바꾸기",multi:"여러 조건",source:"기록 바꾸기"};
const WHATIFS=[
 {id:"zg",kind:"move",q:"제갈량이 조조 편이었다면?",mut:{"諸葛亮":"wei"},review:"순서 6"},
 {id:"zy",kind:"move",q:"주유가 조조 편이었다면?",mut:{"周瑜":"wei"},review:"순서 6"},
 {id:"hg",kind:"move",q:"황개의 거짓 항복이 진짜였다면?",mut:{"黃蓋":"wei"},review:"순서 6",note:"황개는 거짓으로 항복한 뒤 불붙은 배로 조조의 함대에 들어갔습니다."},
 {id:"zyout",kind:"drop",q:"주유가 병으로 빠졌다면?",mut:{"周瑜":null},review:"순서 2 · 한 사람의 무게"},
 {id:"ptout",kind:"drop",q:"방통이 없었다면?",mut:{"龐統":null},review:"순서 2 · 한 사람의 무게",note:"방통은 조조에게 배를 서로 묶으라고 권한 인물입니다."},
 {id:"nowind",kind:"cond",q:"바람이 불지 않았다면?",wind:"none",review:"순서 6 · 가정"},
 {id:"nofire",kind:"cond",q:"화공이 통하지 않았다면? (불 점수 0)",w:"fire0",review:"순서 5 · 숫자의 뜻",note:"조조의 '불' 점수는 불에 당한 기록에서 나온 숫자였습니다."},
 {id:"combo",kind:"multi",q:"주유·황개가 조조 편이고, 바람도 없었다면?",mut:{"周瑜":"wei","黃蓋":"wei"},wind:"none",review:"종합"},
 {id:"jb",kind:"source",q:"소설 대신 역사책⁠(정사)으로 센다면?",lens:"jb",review:"순서 5 · 근거"}
];
const WI_STORIES={
 zg:{teaser:"제갈량의 소속을 바꾸어 봅니다",story:"소설 속 제갈량은 손권과 유비가 힘을 모으는 데 관여하고, 적벽에서는 계책을 펼칩니다.",change:"제갈량의 점수를 연합군에서 빼고 조조군에 더합니다. 다른 인물과 바람의 조건은 그대로 둡니다.",method:"제갈량의 점수를 옮겨 두 진영을 견주어 봅시다",person:"諸葛亮",metric:"plan"},
 zy:{teaser:"연합군을 이끈 주유가 다른 편에 선다면",story:"주유는 손권의 군대를 이끌며 조조군에 맞섰습니다. 황개와 함께 화공을 준비한 인물이기도 하지요.",change:"주유의 기록으로 만든 점수를 연합군에서 빼고 조조군에 더합니다.",method:"주유 한 사람의 몫을 옮겨 봅시다",person:"周瑜",metric:"fire"},
 hg:{teaser:"거짓 항복이라는 계책을 바꾸어 봅니다",story:"황개는 조조에게 항복하겠다고 전한 뒤, 불붙은 배를 이끌고 함대로 향합니다. 항복은 화공을 위한 계책이었지요.",change:"이번 계산에서는 황개가 실제로 조조 편에 섰다고 두고, 황개의 점수만 조조군으로 옮깁니다.",method:"황개의 소속을 바꾸어 비교해 봅시다",person:"黃蓋",metric:"fire"},
 zyout:{teaser:"주유 한 사람이 빠진 자리를 살펴봅니다",story:"연합군의 주유는 전투를 지휘하고 화공을 준비했습니다. 그가 싸움에 참여하지 못했다면 연합군의 기록 점수는 얼마나 달라질까요?",change:"주유를 명단에서 제외해 연합군의 합계를 다시 셉니다. 나머지 조건은 유지합니다.",method:"주유를 빼기 전과 후를 견주어 봅시다",person:"周瑜",metric:"plan"},
 ptout:{teaser:"배를 묶으라는 방통의 제안이 없었다면",story:"소설에서 방통은 조조에게 배들을 서로 묶으라고 권합니다. 배를 묶어 둔 일이 이어지는 화공 장면에서 중요한 구실을 하지요.",change:"방통의 기록 점수를 계산에서 제외합니다. 배를 묶지 않은 새로운 장면을 만들어 내는 계산은 아니므로, 기록 점수의 차이를 살펴봅니다.",method:"방통의 기록이 차지한 몫을 살펴봅시다",person:"龐統",metric:"ship"},
 nowind:{teaser:"그날 밤의 바람을 바꾸어 봅니다",story:"적벽의 밤, 동남풍이 불고 불붙은 배들이 조조의 함대로 향했습니다. 바람은 소설 속 화공 장면을 이끄는 조건이지요.",change:"인물별 기록 점수는 그대로 두고, 연합군에 더했던 바람 보너스 10만 뺍니다.",method:"바람의 조건만 달리해 봅시다",person:"諸葛亮",metric:"fire"},
 nofire:{teaser:"불에 주었던 점수를 없애 봅니다",story:"황개의 배에서 시작된 불길은 조조의 함대로 번졌습니다. 그런데 기록에 ‘불’이 많다는 사실은 공격과 피해를 모두 담고 있지요.",change:"두 진영 모두 불 관련 기록의 가중치를 0으로 바꿉니다. 화공이 실패한 전투를 재현하는 대신, 불 점수를 없앤 비교 결과를 확인합니다.",method:"불 점수를 빼고 다시 견주어 봅시다",person:"曹操",metric:"fire"},
 combo:{teaser:"인물의 소속과 바람을 함께 바꾸어 봅니다",story:"주유와 황개는 연합군에서 화공을 준비했고, 그날 밤의 바람은 불길이 번지는 조건이 되었습니다.",change:"주유와 황개의 점수를 조조군으로 옮기고, 연합군의 바람 보너스 10도 뺍니다.",method:"두 인물과 바람의 변화를 함께 살펴봅시다",person:"黃蓋",metric:"fire"},
 jb:{teaser:"같은 질문에 다른 기록을 펼쳐 봅니다",story:"지금까지의 질문은 『삼국지연의』 속 기록에서 출발했습니다. 역사책인 정사 『삼국지』에는 인물과 사건이 다른 분량과 방식으로 남아 있지요.",change:"인물 명단과 점수 규칙은 유지하고, 집계 자료를 정사 본문으로 바꿉니다. 자료에 따른 차이를 비교하며, 사실 여부를 자동으로 판정하지는 않습니다.",method:"같은 기준에 다른 자료를 넣어 봅시다",person:"曹操",metric:"fire"}
};
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
 return [moves.length?moves.join(", "):"인물 그대로",WI_WIND[x.wind||"env"],`점수 배${wt.ship}·불${wt.fire}·계책${wt.plan}`,x.lens==="jb"?"기록: 역사책⁠(정사) 본문":"기록: 『삼국지연의』",`명단: ${S.rule.min}회 이상${S.rule.dead?", 사망자 제외":""}`].join(" · ");
}
function wiMeter(base,now){
 return `<div class="meter wi-meter"><div class="meter-row"><span class="big num">${base.i} → ${now.i}</span><span class="verdict">${wiVerdict(now.i)}</span></div><div class="track" aria-hidden="true"><i class="pin ghost" style="left:calc(${base.i}% - 2px)"></i><i class="pin" style="left:calc(${now.i}% - 2px)"></i></div><div class="scale"><span>조조군 앞섬</span><span>비슷함</span><span>연합군 앞섬</span></div></div>
 <p class="simple-note">연합군 점수 ${base.A.toLocaleString()} → <b>${now.A.toLocaleString()}</b> · 조조군 점수 ${base.W.toLocaleString()} → <b>${now.W.toLocaleString()}</b></p>`;
}
const wiDir=(base,now)=>Math.abs(now.i-base.i)<=3?"same":now.i>base.i?"up":"down";
const WI_PRED=[["up","연합군에 더 유리해질 것 같습니다"],["same","큰 차이가 없을 것 같습니다"],["down","조조군에 더 유리해질 것 같습니다"]];

/* ===== Every What-if runs the same journey as the main question =====
   Picking a question makes it the active scenario. The home screen, the six stages
   and the stage 6 experiment then use that question: story → prediction → stages →
   apply the change → change one assumption → compare with the prediction.
   Each question keeps its own progress, roster rule and weights; stages 1–5 look at
   the records that matter for it (see 92-scenario-stages.js). */
const WI_JOURNEY={
 zg:{title:"제갈량이 조조의 편이었다면?",act:"제갈량을 조조 편으로 옮기기",did:"제갈량의 점수가 조조군으로 옮겨 갔습니다. 바람은 그대로 연합군 편이라고 두었습니다.",todo:"제갈량을 조조 편으로 옮긴 뒤, 바람에 관한 가정도 바꾸어 보시지요.",before:"제갈량을 옮기기 전에",uses:"제갈량을 옮기면 그 사람의 점수도 함께 넘어갑니다.",
  altQ:"그런데 바람은 누가 불게 했을까요?",opts:[["env","바람은 환경 조건입니다","바람이 그냥 날씨라면, 제갈량이 옮겨 가도 바람은 그대로 연합군 편입니다.",{}],["zg","바람이 제갈량을 따라갑니다","제갈량이 바람을 부른다면, 바람도 조조군 편으로 붑니다.",{wind:"zg"}]]},
 zy:{act:"주유를 조조 편으로 옮기기",did:"주유의 점수가 조조군으로 옮겨 갔습니다. 바람은 날씨로 두었습니다.",todo:"주유를 조조 편으로 옮긴 뒤, 바람에 관한 가정도 바꾸어 보시지요.",before:"주유를 옮기기 전에",uses:"주유를 옮기면 그 사람의 점수도 함께 넘어갑니다.",
  altQ:"그날 밤 바람마저 불지 않았다면?",opts:[["env","바람은 그대로 불었습니다","바람은 날씨로 두고, 연합군에 더한 +10을 그대로 둡니다.",{}],["none","바람도 불지 않았습니다","바람 보너스까지 빼면 이렇게 됩니다.",{wind:"none"}]]},
 hg:{act:"황개를 조조 편으로 옮기기",did:"황개의 점수가 조조군으로 옮겨 갔습니다. 바람은 날씨로 두었습니다.",todo:"황개를 조조 편으로 옮긴 뒤, 바람에 관한 가정도 바꾸어 보시지요.",before:"황개를 옮기기 전에",uses:"황개를 옮기면 그 사람의 점수도 함께 넘어갑니다.",
  altQ:"그날 밤 바람마저 불지 않았다면?",opts:[["env","바람은 그대로 불었습니다","바람은 날씨로 두고, 연합군에 더한 +10을 그대로 둡니다.",{}],["none","바람도 불지 않았습니다","바람 보너스까지 빼면 이렇게 됩니다.",{wind:"none"}]]},
 zyout:{act:"주유를 명단에서 빼기",did:"주유의 점수가 연합군에서 빠졌습니다. 바람은 날씨로 두었습니다.",todo:"주유를 명단에서 뺀 뒤, 바람에 관한 가정도 바꾸어 보시지요.",before:"주유를 빼기 전에",uses:"주유를 빼면 그 사람의 점수도 함께 빠집니다.",
  altQ:"그날 밤 바람마저 불지 않았다면?",opts:[["env","바람은 그대로 불었습니다","바람은 날씨로 두고, 연합군에 더한 +10을 그대로 둡니다.",{}],["none","바람도 불지 않았습니다","바람 보너스까지 빼면 이렇게 됩니다.",{wind:"none"}]]},
 ptout:{act:"방통을 명단에서 빼기",did:"방통의 점수가 연합군에서 빠졌습니다. 바람은 날씨로 두었습니다.",todo:"방통을 명단에서 뺀 뒤, 바람에 관한 가정도 바꾸어 보시지요.",before:"방통을 빼기 전에",uses:"방통을 빼면 그 사람의 점수도 함께 빠집니다.",
  altQ:"그날 밤 바람마저 불지 않았다면?",opts:[["env","바람은 그대로 불었습니다","바람은 날씨로 두고, 연합군에 더한 +10을 그대로 둡니다.",{}],["none","바람도 불지 않았습니다","바람 보너스까지 빼면 이렇게 됩니다.",{wind:"none"}]]},
 nowind:{act:"바람 보너스 빼기",did:"인물 점수는 그대로 두고, 연합군에 더했던 바람 +10을 뺐습니다.",todo:"바람 보너스를 뺀 뒤, 불에 관한 가정도 바꾸어 보시지요.",before:"바람을 바꾸기 전에",uses:"바람은 이 점수와 따로 더하는 조건입니다.",
  altQ:"바람이 없으면 불도 번지지 않았을까요?",opts:[["keep","불 점수는 그대로입니다","기록 속 ‘불’ 점수는 그대로 둡니다.",{}],["fire0","불 점수도 0으로 둡니다","바람이 없어 불도 번지지 않았다고 보면 이렇게 됩니다.",{w:"fire0"}]]},
 nofire:{title:"화공이 통하지 않았다면?",act:"불 점수를 0으로 바꾸기",did:"두 진영 모두 ‘불’ 기록의 점수를 0으로 바꾸었습니다. 바람은 날씨로 두었습니다.",todo:"불 점수를 0으로 바꾼 뒤, 다른 점수 가정도 바꾸어 보시지요.",before:"불 점수를 바꾸기 전에",uses:"불 점수를 0으로 두면 이 점수가 다시 계산됩니다.",
  altQ:"불 대신 배 싸움으로만 겨루었다면?",opts:[["keep","배·계책 점수는 그대로입니다","배와 계책 점수는 앞에서 정한 대로 둡니다.",{}],["ship","배 점수만 남깁니다","배 싸움만 따진다면 이렇게 됩니다.",{w:"ship"}]]},
 combo:{title:"주유·황개가 조조 편이고, 바람도 없었다면?",act:"주유·황개를 옮기고 바람 빼기",did:"주유와 황개의 점수가 조조군으로 옮겨 갔고, 바람 보너스도 뺐습니다.",todo:"두 사람을 옮기고 바람을 뺀 뒤, 바람 가정을 되돌려 보시지요.",before:"두 사람을 옮기기 전에",uses:"주유와 황개를 옮기면 그 사람의 점수도 함께 넘어갑니다.",
  altQ:"바람만은 그대로 불었다면?",opts:[["none","바람도 불지 않았습니다","질문대로 바람 보너스를 뺍니다.",{}],["env","바람은 그대로 불었습니다","바람을 날씨로 되돌리면 이렇게 됩니다.",{wind:"env"}]]},
 jb:{title:"소설 대신 역사책⁠(정사)으로 센다면?",act:"정사 본문으로 바꿔 세기",did:"같은 명단과 점수 규칙으로 정사 본문을 다시 세었습니다.",todo:"정사 본문으로 바꿔 센 뒤, 주석까지 넣어 보시지요.",before:"기록을 바꾸기 전에",uses:"정사로 세면 이 점수가 다시 계산됩니다.",
  altQ:"배송지의 주석까지 함께 센다면?",opts:[["jb","정사 본문만 셉니다","정사 본문의 문장만 셉니다.",{}],["all","주석까지 함께 셉니다","배송지 주석까지 더해 세면 이렇게 됩니다.",{lens:"all"}]]}
};
const scenario=()=>WHATIFS.find(x=>x.id===S.scenario)||WHATIFS[0];
function setScenario(id){
 const next=WHATIFS.find(x=>x.id===id)?id:"zg",cur=S.scenario||"zg";
 if(next===cur){S.scenario=cur;return}
 // each question is its own journey: roster rule, weights, stage progress, prediction and notes
 const keep={lab:S.t.lab,sourceScope:S.t.sourceScope},t={...S.t};delete t.lab;delete t.sourceScope;
 S.scen=S.scen||{};
 S.scen[cur]={prediction:S.prediction,reflection:S.reflection,done:{...S.done},t,rule:{...S.rule},w:{...S.w}};
 const n=S.scen[next]||{};
 if(n.prediction===undefined)delete S.prediction;else S.prediction=n.prediction;
 if(n.reflection===undefined)delete S.reflection;else S.reflection=n.reflection;
 S.done={...(n.done||{})};S.t={...(n.t||{})};if(keep.lab)S.t.lab=keep.lab;if(keep.sourceScope)S.t.sourceScope=keep.sourceScope;
 S.rule={...(n.rule||{min:2,dead:1})};S.w={...(n.w||{ship:3,fire:3,plan:2})};
 S.scenario=next;save();
}
/* stage texts that name the question follow the active scenario */
const ZG_TEXT={todo:SIMPLE_TODO[5],why1:SIMPLE_WHY[1][0],why2:SIMPLE_WHY[2][0],q6:ST[5].q,short6:ST[5].short};
function applyScenarioText(){
 const x=scenario(),j=WI_JOURNEY[x.id];
 if(x.id==="zg"){SIMPLE_TODO[5]=ZG_TEXT.todo;SIMPLE_WHY[1][0]=ZG_TEXT.why1;SIMPLE_WHY[2][0]=ZG_TEXT.why2;ST[5].q=ZG_TEXT.q6;ST[5].short=ZG_TEXT.short6;return}
 SIMPLE_TODO[5]=j.todo;
 SIMPLE_WHY[1][0]=`${j.before}, 한 사람이 숫자에 미치는 영향을 살펴야겠지요.`;
 SIMPLE_WHY[2][0]=`두 진영의 기록을 비교하려면 셀 대상을 정해야겠지요. ${j.uses}`;
 ST[5].q=x.q.replace(/\s*\(.*\)\s*$/,"");ST[5].short="가정 실험하기";
}
/* the question being tested stays visible at the top of every stage */
function markScenario(){
 const x=scenario(),k=String(WHATIFS.indexOf(x)+1).padStart(2,"0"),hero=$("#main .scene-hero .hero-in");
 if(!hero||hero.querySelector(".hero-question"))return;
 const t=x.q.replace(/\s*\(.*\)\s*$/,"");
 hero.insertAdjacentHTML("afterbegin",`<a class="hero-question" href="#home">만약 ${esc(t)}</a>`);
}
for(let i=0;i<=6;i++){const r=RENDER[i];RENDER[i]=function(){applyScenarioText();const out=r.apply(this,arguments);if(i>=1&&i<=5)markScenario();return out}}

/* home: the same opening for every question */
(()=>{
 const r0=RENDER[0];
 RENDER[0]=function(){
  r0.apply(this,arguments);
  const x=scenario(),j=WI_JOURNEY[x.id],k=WHATIFS.indexOf(x)+1,main=$("#main");
  const ed=main.querySelector(".experiment-edition");if(ed)ed.innerHTML=`『삼국지연의』로 해 보는 데이터 실험 <span>${String(k).padStart(2,"0")}</span>`;
  if(x.id!=="zg"){
   main.querySelector("#experiment-title").innerHTML=`만약 ${j.title||esc(x.q.replace(/\s*\(.*\)\s*$/,""))}`;
   const st=main.querySelector(".simple-story");const hi=st?.querySelector(".keeper-welcome")?.outerHTML||"";if(st)st.innerHTML=`${hi}${esc(WI_STORIES[x.id].story)} <b>${esc(x.q.replace(/\s*\(.*\)\s*$/,"").replace(/\?$/,""))}</b>, 결과는 어떻게 달라졌을까요?`;
  }
  // a new question always starts with its own prediction
  const form=$("#prediction-form");
  if(form){const btn=form.querySelector('button[type="submit"]');if(btn&&!Number.isInteger(S.prediction))btn.disabled=true;
   const sub=form.onsubmit;form.onsubmit=e=>{e.preventDefault();if(!Number.isInteger(S.prediction))return;sub.call(form,e)};}
 };
})();

/* stage 6: apply the question's change, then change one assumption */
RENDER[6]=function(){
 applyScenarioText();
 const x=scenario(),j=WI_JOURNEY[x.id];
 const L=S.t.s6x=S.t.s6x||{who:"諸葛亮",act:"wei",lens:"yy",wind:1,wmode:"env",wb:10,runs:[]};
 const D=S.t.s6d=S.t.s6d||{};
 const r=roster();
 const vd=wiVerdict;
 const meter=(i,label)=>`<div class="meter"><div class="meter-row"><span class="big num">${i}</span><span class="verdict">${vd(i)}</span></div><div class="track" aria-hidden="true"><i class="pin" style="left:calc(${i}% - 2px)"></i></div><div class="scale"><span>조조군 앞섬</span><span>비슷함</span><span>연합군 앞섬</span></div>${label?`<p class="simple-note">${label}</p>`:''}</div>`;
 const base=wiCalc().i,changed=wiCalc(x).i;
 const optVal=o=>wiCalc({...x,...o[3]}).i;
 const v0=optVal(j.opts[0]),v1=optVal(j.opts[1]);
 const isZg=x.id==="zg",isMoveWind=/바람은 (날씨로|그대로)/.test(j.did);
 const check=isZg?{q:"'제갈량이 조조 편이었다면 조조가 이겼다'고 말할 수 있을까요?",opts:["계산 결과만으로 조조가 이겼다고 말할 수 있습니다.","바람에 관한 가정에 따라 결과가 달라지므로 단정할 수 없습니다.","어떤 조건에서도 연합군이 이깁니다."],ok:1,
   good:"같은 실험이라도 어떤 가정을 하느냐에 따라 결과가 달라집니다. 가정 실험의 답은 '이렇게 가정하면 이렇다'로 말해야 합니다.",bad:"바람에 관한 두 가정에서 숫자가 어떻게 달랐는지 살펴보시지요."}
  :{q:`'${ST[5].q}'의 답을 한 문장으로 말한다면?`,opts:["계산 결과 하나로 승패를 말할 수 있습니다.","어떤 가정을 두었는지에 따라 결과가 달라지므로, 가정과 함께 말해야 합니다.","어떤 조건에서도 결과는 같습니다."],ok:1,
   good:"같은 질문이라도 가정을 바꾸면 숫자가 달라집니다. 그래서 가정 실험의 답에는 가정을 함께 적습니다.",bad:"두 가정에서 숫자가 어떻게 달랐는지 살펴보시지요."};
 check.ev=()=>`기록대로 ${base} → ${j.act.replace(/기$/,"")}(${j.opts[0][1]}) ${v0} · (${j.opts[1][1]}) ${v1}`;
 originalStageRenderer(6,[["s6","move",j.act],["s6","wind","가정 하나 바꾸기"]],
  step(1,"지금 기록대로 계산하면",isMoveWind?"먼저 점수와 명단만 바꿔서 계산합니다. 바람은 처음 기록 그대로 둡니다.":"",`<section class="card pane">${meter(base)}<button class="btn" id="move6">${esc(j.act)}</button><div id="mv6"></div></section>`)+
  `<div class="named-wrap" id="wind6sec" hidden>${step(2,esc(j.altQ),isZg?"방금 숫자는 바람이 그대로 연합군 편으로 분다고 두고 계산한 결과입니다. 소설에서 동남풍을 불러온 사람은 제갈량입니다. 제갈량이 조조 편이 되면 바람도 따라갈까요?":isMoveWind?"방금 숫자에는 바람에 관한 가정이 숨어 있습니다. 그 가정을 바꾸면 결과가 어떻게 달라지는지 비교해 보세요.":"",`<section class="card pane"><div class="pick wide" id="wind6">${j.opts.map(o=>`<button data-v="${o[0]}">${esc(o[1])}</button>`).join("")}</div><div id="wr6"></div></section>`)}</div>`+
  reveal('s6name')+`<div class="named-wrap" id="s6pred" hidden></div>`,check);
 simplifyStage(6);
 const afterMove=()=>{
  if(isZg)Object.assign(L,{who:"諸葛亮",act:"wei",lens:"yy",wind:1});else Object.assign(L,{scenario:x.id});
  save();setT("s6","move");
  $("#move6").hidden=true;
  $("#mv6").innerHTML=`<p class="big-change"><b class="num">${base}</b> → <b class="num">${changed}</b></p>${meter(changed,esc(j.did))}`;
  $("#wind6sec").hidden=false;drawAlt();
 };
 const drawAlt=()=>{$$("#wind6 button").forEach(b=>b.setAttribute('aria-pressed',String(D.w===b.dataset.v)));
  const o=j.opts.find(o=>o[0]===D.w);if(!o)return;L.wmode=D.w;save();
  const tried=new Set((D.tried||[]).filter(v=>j.opts.some(o=>o[0]===v)));tried.add(D.w);D.tried=[...tried];save();
  $("#wr6").innerHTML=meter(optVal(o),esc(o[2]));
  if(tried.size>=2){setT("s6","wind");
   show('s6name',named("가정 실험과 전제",isZg?`같은 '제갈량 이동'인데도 바람을 날씨로 보면 <b>${v0}</b>, 제갈량이 불렀다고 보면 <b>${v1}</b>입니다. 결과는 어떤 가정을 하느냐에 달려 있습니다. 그래서 가정 실험의 답에는 항상 가정을 함께 적습니다.`:`같은 질문인데도 ‘${esc(j.opts[0][1])}’로 보면 <b>${v0}</b>, ‘${esc(j.opts[1][1])}’로 보면 <b>${v1}</b>입니다. 결과는 어떤 가정을 하느냐에 달려 있습니다. 그래서 가정 실험의 답에는 항상 가정을 함께 적습니다.`)+
    `<details class="card pane step-more"><summary>다른 사람도 옮겨 보기</summary><div class="ctrls"><label class="field">인물<select id="who6">${r.filter(n=>PP[n].pa>=8).sort((a,b)=>PP[b].pa-PP[a].pa).map(n=>`<option value="${n}">${PP[n].ko} (${FN[PP[n].f]})</option>`).join('')}</select></label>${seg("to6",[["wei","조조군으로"],["ally","연합군으로"],["out","빼기"]],"wei","어디로")}</div><p class="simple-note" id="other6"></p></details>`);
   const other=()=>{const n=$("#who6").value,to=$$("#to6 button").find(b=>b.getAttribute('aria-pressed')==='true')?.dataset.v||'wei';const m={[n]:to==='out'?null:to==='ally'?(PP[n].f==='wei'?'wu':PP[n].f):'wei'};$("#other6").textContent=`${PP[n].ko}: ${base} → ${wiCalc({mut:m}).i} (바람=날씨)`};
   $("#who6").onchange=other;onSeg("to6",other);other();
   const pred=Number.isInteger(S.prediction)&&PREDICTIONS[S.prediction];
   const p=$("#s6pred");p.hidden=false;p.innerHTML=`<section class="prediction-review"><span class="journey-eyebrow">처음 예상과 비교</span><div class="prediction-comparison"><div><h3>처음 예상</h3><p data-original-prediction>${pred?esc(pred):'처음에 남긴 예상이 없습니다.'}</p></div><div><h3>계산 결과</h3><p>${isZg?`바람=날씨 ${v0} (${vd(v0)}) · 바람=제갈량 ${v1} (${vd(v1)})`:`${esc(j.opts[0][1])} ${v0} (${vd(v0)}) · ${esc(j.opts[1][1])} ${v1} (${vd(v1)})`}</p></div></div><label for="prediction-reflection">기록을 살핀 뒤 생각은 어떻게 달라지셨습니까? (선택)</label><textarea id="prediction-reflection" rows="3" maxlength="2000">${esc(S.reflection||'')}</textarea></section><details class="card pane step-more"><summary>더 살펴보기: 정사의 기록으로 보면 달라질까요?</summary><p>지금까지는 소설 『삼국지연의』의 기록으로 계산했습니다. 같은 기준으로 정사의 기록을 세면 무엇이 달라질지 함께 살펴보시지요.</p><a class="btn ghost" href="#compare">정사와 비교하기</a></details>`;
   $("#prediction-reflection").oninput=e=>{S.reflection=e.target.value;save()};
  }
 };
 $("#move6").onclick=afterMove;
 $("#wind6").addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;D.w=b.dataset.v;save();drawAlt()});
 if(tk("s6","move"))afterMove();
};

/* the lab is the list of questions; choosing one starts its journey on the home screen */
VIEWS.push({id:"lab"});
const LAB_VIEW=VIEWS.length-1;
RENDER[LAB_VIEW]=()=>{
 if(typeof missionResultObserver!=="undefined"&&missionResultObserver){missionResultObserver.disconnect();missionResultObserver=null}
 const params=new URLSearchParams(location.hash.split("?")[1]||"");
 const asked=WHATIFS.find(x=>x.id===params.get("question"));
 if(asked){setScenario(asked.id);history.replaceState(null,"","#home");applyScenarioText();RENDER[0]();return}
 document.body.classList.remove("experiment-home");TASKS=[];
 const L=S.t.lab=S.t.lab||{b:{who:"周瑜",act:"wei",wind:"env",w:"base",lens:"yy"}};L.b=L.b||{who:"周瑜",act:"wei",wind:"env",w:"base",lens:"yy"};
 const base=wiCalc(),cur=scenario().id;
 const prog=id=>{const pack=id===cur?{prediction:S.prediction,done:S.done}:(S.scen||{})[id]||{};return {n:Object.keys(pack.done||{}).length,p:Number.isInteger(pack.prediction)}};
 const status=id=>{const {n,p}=prog(id);return n>=6?"끝까지 살펴봄":n?`${n} / 6`:p?"짐작을 골랐음":""};
 const tried=()=>WHATIFS.filter(x=>status(x.id)).length;
 // progress is shown, not written: a check when finished, a quiet n/6 while going, an accent edge on the current question
 const card=(x,i)=>{const {n}=prog(x.id),st=status(x.id),now=x.id===cur;return `<button class="wi-card${st?" tried":""}${now?" current":""}${n>=6?" finished":""}" data-id="${x.id}" ${now?'aria-current="true"':''} aria-label="${esc(x.q)}${now?", 지금 실험 중":""}${st?", "+st:""}"><b>${esc(x.q.replace(/\s*\(.*\)\s*$/,""))}</b>${n>=6?`<i class="wi-mark" aria-hidden="true">${ic("check")}</i>`:n?`<i class="wi-mark num" aria-hidden="true">${n}/6</i>`:""}</button>`};
 $("#main").classList.add("simple");
 const people=roster().filter(n=>PP[n].pa>=5).sort((a,b)=>PP[b].pa-PP[a].pa);
 $("#main").innerHTML=`<section class="lab-opening" aria-labelledby="lab-title"><div class="lab-head"><h1 id="lab-title">어느 이야기를 바꾸어 보시겠습니까?</h1><p class="lab-count num"><span id="labCount">${tried()}</span> / ${WHATIFS.length}</p></div>
 <div class="wi-grid lab-catalog" id="wiGrid">${WHATIFS.map(card).join("")}</div></section>
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
 <p class="lab-back"><a class="btn ghost" href="#home">시작으로</a></p>`;
 $("#wiGrid").addEventListener("click",e=>{const b=e.target.closest(".wi-card");if(!b)return;setScenario(b.dataset.id);location.hash="#home"});

 // builder: a sandbox that writes the question from the choices
 const build=()=>{
  const b=L.b,n=b.who,ko=PP[n].ko,mut={};
  if(b.act==="wei"&&PP[n].f!=="wei")mut[n]="wei";else if(b.act==="ally"&&PP[n].f==="wei")mut[n]="wu";else if(b.act==="out")mut[n]=null;
  const parts=[];
  if(b.act==="out")parts.push(`${ko}${wiJosa(ko,"이","가")} 없었다면`);
  else if(n in mut)parts.push(`${ko}${wiJosa(ko,"이","가")} ${mut[n]==="wei"?"조조":"연합군"} 편이었다면`);
  if(b.wind==="none")parts.push("바람이 불지 않았다면");else if(b.wind==="zg")parts.push("바람을 제갈량이 불렀다면");
  if(b.w==="fire0")parts.push("화공이 통하지 않았다면");else if(b.w==="ship")parts.push("배 싸움만 따진다면");else if(b.w==="plan")parts.push("계책만 따진다면");
  if(b.lens==="jb")parts.push("역사책⁠(정사)으로 센다면");
  const sameSide=(b.act==="wei"&&PP[n].f==="wei")||(b.act==="ally"&&PP[n].f!=="wei");
  $("#wbQ").innerHTML=parts.length?`만약 ${parts.map(esc).join(" · ")}?`:`<span class="simple-note">${sameSide?`${esc(ko)}${wiJosa(ko,"은","는")} 이미 그 편입니다. 다른 조건을 골라 보시지요.`:"바꿀 조건을 하나 이상 골라 보시지요."}</span>`;
  const x={mut,wind:b.wind,w:b.w==="base"?null:b.w,lens:b.lens};
  $("#wbRes").innerHTML=parts.length?`${wiMeter(base,wiCalc(x))}<p class="wi-assume"><b>바꾼 조건</b> ${esc(wiAssume(x))}</p>`:"";
  save();
 };
 $("#wbWho").onchange=e=>{L.b.who=e.target.value;build()};
 onSeg("wbAct",v=>{L.b.act=v;build()});onSeg("wbWind",v=>{L.b.wind=v;build()});onSeg("wbW",v=>{L.b.w=v;build()});onSeg("wbLens",v=>{L.b.lens=v;build()});
 build();

 $("#wiAsk").addEventListener("click",e=>{const btn=e.target.closest(".pick button");if(!btn)return;const row=btn.closest(".wi-ask-row"),x=WI_UNANSWERABLE[+row.dataset.k],right=(btn.dataset.v==="1")===x.ok;
  row.querySelectorAll(".pick button").forEach(b=>b.setAttribute("aria-pressed",String(b===btn)));const tip=row.querySelector(".pcard-tip");tip.hidden=false;tip.innerHTML=`<b>${right?"맞습니다.":"다시 생각해 보시지요."}</b> ${esc(x.why)}`});
};
/* entry points: after the stage 6 comparison, and on the home outline */
(()=>{
 const r6=RENDER[6];
 RENDER[6]=function(){r6.apply(this,arguments);$("#main").insertAdjacentHTML("beforeend",`<a class="lab-link card" href="#lab"><b>다른 가정도 살펴보기</b></a>`)};
 const r0=RENDER[0];
 // home footer: start button on its own line, then the six stages laid out openly (no folded box)
 RENDER[0]=function(){r0.apply(this,arguments);
  const main=$("#main"),form=$("#prediction-form"),prog=main.querySelector(".home-progress");if(!form||!prog)return;
  const btn=prog.querySelector('button[type="submit"]'),footer=form.querySelector(".prediction-footer");
  if(btn&&footer){footer.append(btn);btn.classList.add("home-start")}
  prog.remove();main.querySelector(".journey-outline")?.remove();
  const next=ST.findIndex((e,i)=>!S.done[i+1]);
  const steps=`<nav class="home-steps" aria-label="학습 장">${ST.map((e,i)=>{const done=!!S.done[i+1],now=i===next;return `<a href="#${e.id}" class="${done?"done":""}${now?" now":""}"${now?' aria-current="step"':""}><span class="num">${i+1}장${done?ic("check"):""}</span><b>${esc(e.short)}</b></a>`}).join("")}</nav>`;
  form.insertAdjacentHTML("afterend",steps);
  const replay=main.querySelector(".experiment-replay");if(replay)main.querySelector(".home-steps").after(replay);
 };
})();

addEventListener("popstate",route);

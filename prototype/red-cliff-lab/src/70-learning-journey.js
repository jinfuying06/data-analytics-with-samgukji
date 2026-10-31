/* One question connects the six stages; calculations remain in 40-app.js. */
const MISSION_QUESTION="만약 제갈량이 조조의 편이었다면?";
const MISSION_STEPS=[
 {short:"두 진영의 인물 구성 살펴보기",q:"먼저 두 진영에 누가 있었는지 살펴보시지요.",where:"소속을 바꾸기 전의 인물 구성",why:"제갈량의 소속을 바꾸기 전에, 조조군과 손권·유비 연합군이 어떤 인물들로 구성되어 있는지 먼저 살펴봅니다. 여기서 정한 명단으로 각 진영의 기록과 역할을 비교한 뒤, 같은 기준으로 소속 변경 전후의 차이를 계산합니다.",gain:"두 진영의 인물 구성과 이후 비교에 사용할 명단",card:"조조군과 손권·유비 연합군의 인물을 확인하고, 비교에 사용할 명단을 정합니다.",say:"소속이 바뀌었을 때의 차이를 보려면, 먼저 두 진영의 인물 구성을 알아야 합니다."},
 {short:"등장 기록 비교하기",q:"두 진영의 인물은 이야기에 얼마나 등장할까요?",where:"비교의 출발점 확인",why:"조건을 바꾸기 전에 현재 기록이 어떻게 다른지 살펴봅니다. 여기서는 이름이 포함된 문단 수를 비교합니다.",gain:"등장 문단 수의 차이와 평균·분포를 읽는 방법",card:"이름이 등장하는 문단 수를 세고, 평균과 분포로 이야기 속 비중을 비교합니다.",say:"제갈량의 등장 문단 수가 특히 많다면, 촉의 평균은 어떻게 달라질까요?"},
 {short:"적벽에 맞는 지표 만들기",q:"배·불·계책의 기록을 어떤 기준으로 비교할까요?",where:"소속을 바꿀 때 함께 이동할 점수",why:"마지막 실험에서는 인물의 비교 점수가 다른 진영으로 이동합니다. 배·불·계책 관련 기록을 무엇으로 세고, 어떻게 점수로 묶을지 정합니다.",gain:"실험에 사용할 지표와 가중치",card:"배·불·계책 관련 기록을 수치로 정리하고, 소속 변경 전후에 사용할 비교 점수를 만듭니다.",say:"제갈량의 어떤 기록을 점수로 정리해야, 소속을 바꾸기 전과 후를 비교할 수 있을까요?"},
 {short:"계산 기준 점검하기",q:"점수를 주는 기준을 바꾸어도 결론이 같을까요?",where:"한 가지 점수 규칙에만 기대지 않기",why:"가중치를 어떻게 정하느냐에 따라 비교 결과가 달라질 수 있습니다. 여러 조합을 미리 계산해, 마지막 실험의 결과를 얼마나 신중하게 해석해야 할지 확인합니다.",gain:"연의의 기록에서 가중치·집계 방식에 따른 결론의 변화",card:"215가지 가중치 조합을 비교해, 처음 정한 점수 규칙이 결론에 미치는 영향을 살펴봅니다.",say:"제갈량의 소속을 바꾸기 전에, 지금 정한 가중치만으로 결론이 결정되는지 확인합니다."},
 {short:"점수의 근거 확인하기",q:"기록에서 만든 점수는 무엇까지 설명할 수 있을까요?",where:"마지막 실험을 해석할 범위",why:"인물의 점수를 옮긴다고 해서 실제 능력이 그대로 이동하는 것은 아닙니다. 연의의 근거 문단을 직접 읽고, 마지막 실험에서 말할 수 있는 범위를 정합니다.",gain:"비교 점수의 근거와 해석의 한계",card:"연의의 근거 문단을 읽고, 점수로 설명할 수 있는 것과 없는 것을 구분합니다.",say:"불에 피해를 입은 장면도 화공 점수에 포함된다면, 그 점수를 어떻게 해석해야 할까요?"},
 {short:"가정 실험하기",q:"제갈량이 조조의 편이라면 계산 결과는 어떻게 달라질까요?",where:"준비한 기준으로 조건 변경 실험",why:"앞에서 정한 명단·지표·가중치를 사용합니다. 제갈량의 소속과 바람에 관한 가정을 바꾸고, 어떤 조건에서 결과가 달라지는지 확인합니다.",gain:"연의의 기록·조건·계산 결과를 함께 설명하는 분석 문장",card:"준비한 명단·지표·가중치로 소속을 바꾸어 계산하고, 결과가 달라진 이유를 설명합니다.",say:"어떤 자료와 가정을 사용했는지 밝히며, 소속 변경 전후의 차이를 남겨 주십시오."}
];
MISSION_STEPS.forEach((m,i)=>Object.assign(ST[i],{short:m.short,q:m.q,why:m.why,gain:m.gain,where:m.where,hz:`순서 ${i+1}`,say:[ST[i].say[0],ST[i].say[1],ST[i].say[2],m.say]}));
let missionResultObserver=null;
const originalStageRenderer=stage;
stage=function(i,tasks,steps,check){
 if(missionResultObserver){missionResultObserver.disconnect();missionResultObserver=null}
 document.body.classList.remove("experiment-home");
 originalStageRenderer(i,i===6?tasks.filter(([m,k])=>k!=="lens"):tasks,steps,check);
 const main=$("#main"),scene=main.querySelector('.scene-hero');
 scene.insertAdjacentHTML('beforebegin',`<p class="experiment-stage-context">『삼국지연의』 실험 01 <span aria-hidden="true">/</span> ${MISSION_QUESTION}</p>`);
 const brief=main.querySelector('.brief3');brief.classList.add('mission-brief');
 brief.innerHTML=`<div><span>이번 활동이 필요한 이유</span><p>${esc(ST[i-1].why)}</p></div><details><summary>${i===6?'실험 후 설명할 것':'이 장에서 남길 것'}</summary><p>${esc(ST[i-1].gain)}</p></details>`;
 const caption=main.querySelector('.subtitle');if(caption)caption.remove();
 if(i===1){
  const activities=main.querySelectorAll('.stepsec'),records=activities[0],composition=activities[1];
  records.before(composition);
  composition.querySelector('.sno').textContent='STEP 1';composition.querySelector('.step-h h2').textContent='진영별 인물 구성을 확인하고 명단 정하기';composition.querySelector('.step-h p').textContent='위로 분류된 조조군과 오·촉으로 분류된 손권·유비 연합군의 인물을 살펴보세요. 등장 기준을 바꾸면 각 진영에 포함되는 인물이 어떻게 달라지는지도 확인합니다.';
  records.querySelector('.sno').textContent='STEP 2';records.querySelector('.step-h h2').textContent='인물이 어떤 기록에 등장하는지 확인하기';records.querySelector('.step-h p').textContent='명단에 있는 인물이 소설의 어느 회차와 문단에 등장하는지 확인합니다. 다음 장에서는 이 등장 기록을 진영별로 비교합니다.';
  const rosterPane=main.querySelector('#roster').closest('.pane'),rulesPane=main.querySelector('#rMin').closest('.pane');rulesPane.before(rosterPane);
  rosterPane.querySelector('h2').textContent='진영별 인물 명단';
 }


};
const PREDICTIONS=["조조 쪽에 더 유리해질 것 같습니다","큰 차이가 없을 것 같습니다","아직 판단하기 어렵습니다"];
function flagPicture(f,label){return `<picture><source media="(prefers-reduced-motion: reduce)" srcset="/sprites/factions/${f}-flag.png"><img src="/sprites/factions/${f}-flag.gif" alt="${label} 국기" width="420" height="250"></picture>`}
function journeyHome(){
 if(missionResultObserver){missionResultObserver.disconnect();missionResultObserver=null}
 document.body.classList.add("experiment-home");
 TASKS=[];const count=Object.keys(S.done).length,next=ST.findIndex((_,i)=>!S.done[i+1]);
 const destination=count===6?'s6':ST[next<0?0:next].id;
 const selected=Number.isInteger(S.prediction)&&PREDICTIONS[S.prediction]!==undefined;
 const action=count===6?'결과 다시 보기':count?'이어서 하기':'시작하기';
 $("#main").innerHTML=`
 <section class="experiment-opening" aria-labelledby="experiment-title">
 <div class="experiment-heading"><p class="experiment-edition">『삼국지연의』 데이터 실험 <span>01</span></p><h1 id="experiment-title">만약 제갈량이 조조의 편이었다면?</h1><p class="experiment-intro">『삼국지연의』 속 인물과 사건을 데이터로 살펴봅니다. 두 진영의 인물 구성과 역할을 비교하고, 제갈량의 소속을 바꾸었을 때 계산 결과가 어떻게 달라지는지 확인합니다.</p></div>
 <figure class="experiment-river" aria-label="장강을 사이에 둔 조조군과 손권·유비 연합군"><div class="river-armies"><div class="river-side wei">${flagPicture('wei','위')}<b>조조군</b></div><span class="river-divider" aria-hidden="true">VS</span><div class="river-side alliance"><div class="alliance-flags">${flagPicture('wu','오')}${flagPicture('shu','촉')}</div><b>손권·유비 연합군</b></div></div><div class="river-lines" aria-hidden="true"></div><figcaption>제갈량의 소속을 바꾸어, 기록에서 만든 비교 점수의 변화를 살펴봅니다.</figcaption></figure>
 <form class="prediction-form" id="prediction-form"><fieldset><legend>어떤 결과가 나올지 먼저 짐작해 보시겠습니까?</legend><div class="prediction-options">${PREDICTIONS.map((label,i)=>`<label><input type="radio" name="prediction" value="${i}" ${S.prediction===i?'checked':''}><span><i aria-hidden="true"></i>${label}</span></label>`).join('')}</div></fieldset><div class="prediction-footer"><p id="prediction-status" role="status">${selected?'짐작을 골랐습니다. 마지막에 결과와 비교합니다.':'짐작을 하나 고르면 시작할 수 있습니다.'}</p><button class="btn" type="submit" ${selected||count>0?'':'disabled'}>${action}${ic('right')}</button></div></form>
 </section>
 <section class="journey-background" aria-labelledby="story-title"><div class="journey-story"><span class="journey-eyebrow">이야기</span><h2 id="story-title">적벽에서는 어떤 일이 있었을까요?</h2><p>조조군이 남쪽으로 내려오자 손권과 유비는 힘을 모았습니다. 연합군은 거짓 항복과 화공을 준비했고, 동남풍을 타고 번진 불길에 조조군은 물러났습니다. 제갈량은 이 과정에서 연합군의 계책과 바람에 관여합니다.</p><small>『삼국지연의』 제43–50회의 이야기를 학습을 위해 요약했습니다.</small></div></section>
 <section class="journey-condition" aria-labelledby="condition-title"><div><span class="journey-eyebrow">바꾸어 볼 조건</span><h2 id="condition-title">제갈량의 소속이 바뀌면 이야기도 달라질까요?</h2><p>이번에는 제갈량이 조조의 편에 있다고 가정합니다. 같은 인물들의 기록을 두고 소속만 바꾸면, 두 진영의 비교 결과는 어떻게 달라질까요?</p></div><div class="condition-change"><div><span>이야기 속 소속</span><b>손권·유비 연합군</b></div><span aria-hidden="true">→</span><div><span>바꾸어 볼 소속</span><b>조조군</b></div></div></section>
 <section class="background-method" aria-labelledby="method-title"><span class="journey-eyebrow">확인 방법</span><h2 id="method-title">예상을 어떻게 확인할까요?</h2><ol class="method-actions"><li><span>01</span><h3>먼저, 두 진영을 살펴봅니다.</h3><p>누가 있는지 확인하고, 각 인물의 등장 기록과 역할을 비교합니다.</p></li><li><span>02</span><h3>같은 기준으로 비교합니다.</h3><p>배·불·계책 관련 기록으로 점수를 만들고, 계산 기준과 근거를 점검합니다.</p></li><li><span>03</span><h3>소속을 바꾸어 계산합니다.</h3><p>앞에서 정한 기준을 유지한 채 제갈량의 소속을 바꾸고, 처음 예상과 결과를 비교합니다.</p></li></ol><p class="background-meta">기본 학습 6개 순서</p><p class="method-extension">실험 뒤에는 정사의 기록과 대조하며, 자료에 따라 해석이 달라지는지도 살펴볼 수 있습니다.</p><a href="#src">자료와 집계 기준 ${ic('right')}</a></section>
 <details class="journey-outline"><summary>전체 학습 과정 <span>${count} / 6 완료 ${ic('right')}</span></summary><ol>${ST.map((entry,i)=>`<li><a href="#${entry.id}"><span>${String(i+1).padStart(2,'0')}</span><b>${entry.short}</b><small>${S.done[i+1]?'완료':entry.skill}</small>${ic('right')}</a></li>`).join('')}</ol></details><button class="linkbtn experiment-replay" data-intro>서막 다시 보기</button>
 ${count===6?`<section class="journey-completed"><h2>이번 실험에서 남긴 학습 기록</h2><ol class="sumlist">${ST.map((entry,i)=>`<li><span class="sum-n">${i+1}장</span><span><b>${entry.short}</b><small>${esc(S.done[i+1]||'')}</small></span></li>`).join('')}</ol><button class="btn ghost" id="reset">${ic('reset')}학습 기록 초기화하기</button></section>`:''}`;
 const form=$("#prediction-form");form.onchange=()=>{S.prediction=Number(new FormData(form).get('prediction'));save();form.querySelector('button').disabled=false;$("#prediction-status").textContent='짐작을 골랐습니다. 마지막에 결과와 비교합니다.'};
 form.onsubmit=e=>{e.preventDefault();if(count===0&&(!Number.isInteger(S.prediction)||!PREDICTIONS[S.prediction]))return;location.hash='#'+destination};
 const reset=$("#reset");if(reset)reset.onclick=()=>{S={done:{},t:{},rule:{min:2,dead:1},w:{ship:3,fire:3,plan:2},seenIntro:1};save();location.hash='#home';route()};
}
RENDER[0]=journeyHome;
const originalRosterRenderer=RENDER[1];
RENDER[1]=()=>{
 originalRosterRenderer();
 const pane=$("#rMin").closest('.pane');pane.querySelector('h2').textContent='누구의 기록을 비교에 포함할까요?';
 pane.querySelector('.pane-h').insertAdjacentHTML('afterend','<p class="roster-guide-intro">포함한 인물의 기록만 다음 장에서 합치고 평균을 냅니다. 명단을 바꾸면 인원수와 비교에 쓰이는 기록이 함께 달라집니다.</p>');
 $("#rMin").insertAdjacentHTML('afterend','<p class="roster-control-help">기준을 낮추면 잠깐 언급된 인물도 포함됩니다. 높이면 여러 회에 등장하는 인물 위주가 되지만, 적게 등장해도 중요한 역할을 한 인물을 놓칠 수 있습니다.</p>');
 $("#rDead").insertAdjacentHTML('afterend','<p class="roster-control-help">소설에는 이미 사망한 인물의 이름도 언급됩니다. 제외하면 그 인물의 기록은 계산에서 빠집니다. 전투 당시 인물 구성을 살펴볼 때와, 이야기의 모든 언급을 셀 때는 포함 목적이 다릅니다.</p>');
 pane.querySelector('.cap').textContent='이번에는 소속 변경 전후를 비교할 명단을 정합니다. 이름이 등장했다는 사실만으로 실제 참전을 확인할 수는 없습니다.';
 const composition=$("#roster").closest('.cols');composition.insertAdjacentHTML('afterend',`<section class="roster-impact" aria-labelledby="roster-impact-title"><div class="roster-impact-heading"><span class="journey-eyebrow">기준을 바꾸면 달라지는 것</span><h3 id="roster-impact-title">명단이 바뀌면 비교에 쓰이는 숫자도 바뀝니다.</h3><p>먼저 ‘1회 이상’을 선택하고, 사망 인물을 ‘포함’했을 때도 살펴보세요. 아래에서 인원과 등장 기록의 변화를 함께 확인할 수 있습니다.</p></div><div id="roster-impact-result" aria-live="polite"></div><div class="roster-next"><b>어떤 기준을 남겨야 할까요?</b><p>주로 등장하는 인물을 볼지, 모든 언급을 볼지에 맞춰 명단을 정해 보시지요. 다음 장의 합계·평균과 마지막 실험의 비교 점수는 이 명단으로 계산합니다. 조건 변경 전후에는 같은 명단을 사용해야 소속을 바꾼 영향을 비교할 수 있습니다.</p></div></section>`);
 let previous=[...roster()];
 const stats=names=>{const groups=[['조조군',names.filter(n=>PP[n].f==='wei')],['손권·유비 연합군',names.filter(n=>PP[n].f!=='wei')]];return groups.map(([label,list])=>{const total=list.reduce((sum,n)=>sum+PP[n].pa,0);return {label,n:list.length,total,mean:list.length?total/list.length:0}})};
 const draw=(before,initial=false)=>{const current=[...roster()],a=stats(before),b=stats(current),added=current.filter(n=>!before.includes(n)),removed=before.filter(n=>!current.includes(n));
 const names=items=>items.length?items.map(n=>esc(PP[n].ko)).join(' · '):'없음';
 $("#rRead").textContent=`현재 기준: ${S.rule.min}회 이상 등장 · 사망 인물 ${S.rule.dead?'제외':'포함'}. 포함 ${current.length}명, 제외 ${NAMES.length-current.length}명.`;
 $("#roster-impact-result").innerHTML=`<p class="impact-comparison-label">${initial?'이름이 나온 모든 인물과 현재 명단을 비교합니다.':'직전 선택과 현재 선택을 비교합니다.'}</p><div class="tscroll"><table class="data"><caption>${initial?'전체 기록 → 현재 명단':'직전 선택 → 현재 선택'}</caption><thead><tr><th>진영</th><th class="n">인원</th><th class="n">등장 문단 수 합계</th><th class="n">1인당 평균</th></tr></thead><tbody>${b.map((row,i)=>`<tr><td>${row.label}</td><td class="n">${a[i].n} → <b>${row.n}</b>명</td><td class="n">${a[i].total} → <b>${row.total}</b></td><td class="n">${fmt(a[i].mean)} → <b>${fmt(row.mean)}</b></td></tr>`).join('')}</tbody></table></div><p class="cap">인물별 등장 문단 수를 더한 값입니다. 같은 문단에 여러 인물이 나오면 각 인물의 기록으로 셉니다. 인원이나 합계가 커졌다고 전투력이 높아진 것은 아닙니다.</p><details class="roster-changes"><summary>달라진 인물 확인하기 · 추가 ${added.length}명 / 제외 ${removed.length}명</summary><p><b>추가된 인물</b> ${names(added)}</p><p><b>제외된 인물</b> ${names(removed)}</p></details><p class="impact-interpretation">${initial?'현재 명단에 포함되지 않은 인물의 등장 기록은 이후 계산에서도 빠집니다. 기준을 바꾸어 두 진영에 미치는 영향을 살펴보세요.':added.length||removed.length?'포함되는 인물이 달라져 합계와 평균을 다시 계산했습니다. 평균은 인원이 늘어도 낮아질 수 있으므로, 합계와 함께 살펴보시지요.':'이번 선택에서는 명단이 달라지지 않아 집계값도 그대로입니다.'}</p>`;
 previous=current;
 };
 draw(NAMES,true);
 for(const id of ['rMin','rDead'])$("#"+id).addEventListener('click',e=>{const button=e.target.closest('button');if(button&&!button.disabled)draw(previous)});
};
const originalSensitivityRenderer=RENDER[4];
RENDER[4]=()=>{
 S.t.s4x=S.t.s4x||{};S.t.s4x.lens='yy';
 originalSensitivityRenderer();
 const sourceField=$("#lens4").closest('.field');sourceField.innerHTML='<span>분석 자료</span>『삼국지연의』 · 기본 학습';
};
RENDER[5]=()=>{
 stage(5,[["s5","victim","조조의 화공 근거 읽기"]],
 step(1,'점수가 높게 나온 이유 확인하기','연의에서 조조와 불에 관한 글자가 함께 나온 문단을 펼쳐 보시지요. 단어를 센 점수가 무엇을 뜻하는지 살펴봅니다.',
 `<div class="cols"><section class="card pane"><div class="pane-h"><h2>화공 관련 기록 상위</h2>${srcB('yy')}</div><div class="bars" id="firetop"></div></section><section class="card pane"><div class="pane-h"><h2>조조의 화공 근거</h2>${srcB('yy',`연의 ${(EVID['曹操']||{}).fire?.[0]||''}회`)}</div><button class="btn ghost" id="openv">${ic('search')}근거 문단 열기</button><div id="vict"></div></section></div>`),
 {q:'조조의 화공 관련 기록이 많다는 사실로 무엇을 알 수 있을까요?',opts:['조조가 화공에 가장 능숙했다는 뜻입니다.','불에 피해를 입은 기록도 포함되므로, 횟수만으로 능력을 판단할 수 없습니다.','조조가 실제 전투에서 이겼다는 뜻입니다.'],ok:1,good:'단어가 함께 등장한 횟수는 인물의 능력과 같지 않습니다. 계산에 어떤 기록이 포함되었는지 밝히며 마지막 실험을 해석해야 합니다.',bad:'근거 문단에서 조조가 불을 지르는지, 불에 피해를 입는지 확인해 보세요.',ev:()=>`연의에서 조조의 화공 관련 기록 ${PP['曹操'].yy[1]}건: 공격과 피해를 구분하지 않은 집계입니다.`});
 const top=roster().map(n=>({n,v:PP[n].yy[1]})).sort((a,b)=>b.v-a.v).slice(0,6);
 bars($("#firetop"),top.map(x=>({label:PP[x.n].ko,v:x.v,c:fcol(PP[x.n].f)})),Math.max(1,...top.map(x=>x.v)),'문단');
 const show=()=>{const e=(EVID['曹操']||{}).fire;$("#vict").innerHTML=e?`<blockquote class="evq">${esc(e[1])}</blockquote><p class="cap">이 문단에서 조조는 불에 피해를 입는 쪽입니다. 화공 관련 기록이 많아도 화공 능력이 높다는 뜻은 아닙니다.</p>`:'<p>현재 자료에서 근거 문단을 확인할 수 없습니다.</p>'};
 $("#openv").onclick=()=>{setT('s5','victim');show()};if(tk('s5','victim'))show();
};
const originalExperimentRenderer=RENDER[6];
function updateMissionExplanation(){
 const target=$("#mission-explanation");if(!target)return;
 const L=S.t.s6x;if(!L)return;
 const name=PP[L.who].ko,subject=name+jo(name,'을','를'),action=L.act==='out'?`${subject} 분석 대상에서 제외`:`${subject} ${FN[L.act]}로 이동`;
 const source=L.lens==='jb'?'정사 본문':'삼국지연의';
 const wind=L.wind?(L.wmode==='env'?'바람 발생 · 환경 조건':'바람 발생 · 제갈량 연동'):'바람 미발생';
 const result=$("#r6").textContent;
 target.innerHTML=`<span class="journey-eyebrow">처음의 질문에 답해 보기</span><h2>조건을 바꾸니 어떤 차이가 생겼나요?</h2><dl><div><dt>사용한 기준</dt><dd>${esc(source)} · 명단 ${roster().length}명 · 가중치 수전 ${S.w.ship}, 화공 ${S.w.fire}, 계책 ${S.w.plan}</dd></div><div><dt>바꾼 조건</dt><dd>${esc(action)} · ${esc(wind)}</dd></div><div><dt>이 조건의 결과</dt><dd>${esc(result)}</dd></div></dl><p class="mission-explanation-limit">이 결과는 선택한 기록과 규칙을 적용한 계산입니다. 실제 전투의 다른 결말을 확정하는 대신, 어떤 조건에서 결과가 달라지는지 설명할 수 있습니다.</p>`;
 const review=$("#prediction-review");
 if(review){review.querySelector('[data-original-prediction]').textContent=Number.isInteger(S.prediction)&&PREDICTIONS[S.prediction]?PREDICTIONS[S.prediction]:'처음에 남긴 예상이 없습니다. 결과를 확인한 뒤 자신의 해석을 남겨 주십시오.';review.querySelector('[data-current-result]').textContent=result;}
}
RENDER[6]=()=>{
 originalExperimentRenderer();
 const band=$("#main .scene-hero");band.insertAdjacentHTML('afterend',`<div class="mission-core-control"><p>처음의 질문은 <b>제갈량을 조조의 편으로 옮기는 경우</b>입니다. 확인한 뒤 다른 인물과 조건도 바꾸어 볼 수 있습니다.</p><button class="btn ghost" id="mission-core-scenario">처음 질문의 조건으로 맞추기 ${ic('reset')}</button></div>`);
 $("#mission-core-scenario").onclick=()=>{Object.assign(S.t.s6x,{who:'諸葛亮',act:'wei',lens:'yy',wind:1,wmode:'env'});save();route()};
 const quiz=$("#qbox").closest('.stepsec');quiz.insertAdjacentHTML('beforebegin','<section class="card mission-explanation" id="mission-explanation" aria-live="polite"></section>');
 const explanation=$("#mission-explanation");explanation.insertAdjacentHTML('afterend',`<section class="prediction-review" id="prediction-review" aria-labelledby="prediction-review-title"><span class="journey-eyebrow">처음의 예상과 비교하기</span><h2 id="prediction-review-title">분석한 뒤, 생각은 어떻게 달라지셨습니까?</h2><div class="prediction-comparison"><div><h3>분석 전의 예상</h3><p data-original-prediction></p></div><div><h3>현재 조건의 계산 결과</h3><p data-current-result></p></div></div><label for="prediction-reflection">어떤 기록이나 조건이 해석에 영향을 주었습니까?</label><textarea id="prediction-reflection" rows="4" maxlength="2000" placeholder="처음에는 …라고 예상했습니다. …라는 조건으로 계산하니 …로 나타났습니다.">${esc(S.reflection||'')}</textarea><p class="reflection-status" id="reflection-status" role="status">${S.reflection?'해석을 이 브라우저에 저장했습니다.':'예상과 달라도 괜찮습니다. 자료와 조건을 근거로 설명해 보세요.'}</p></section>`);
 $("#prediction-reflection").oninput=e=>{S.reflection=e.target.value;save();$("#reflection-status").textContent='해석을 이 브라우저에 저장했습니다.'};
 const review=$("#prediction-review");review.insertAdjacentHTML('afterend',`<details class="source-extension card pane" id="source-extension"><summary><span>확장 활동</span><b>정사의 기록으로 보면 달라질까요?</b></summary><p>지금까지는 연의의 기록으로 분석했습니다. 이제 같은 조건에 다른 자료를 적용해, 계산 결과가 자료에 얼마나 영향을 받는지 살펴보세요.</p><div id="extension-source-control"></div><p class="cap">정사는 사건의 사실 여부를 자동으로 판정하는 정답지가 아닙니다. 기록이 없다는 사실만으로 그 일이 없었다고 단정할 수도 없습니다.</p><a class="btn ghost" href="#compare">자료별 기록과 집계 방식 대조하기 ${ic('right')}</a></details>`);
 const lens=$("#lens6");$("#extension-source-control").append(lens.closest('.field'));if(S.t.s6x.lens==='jb')$("#source-extension").open=true;
 updateMissionExplanation();
 missionResultObserver=new MutationObserver(updateMissionExplanation);missionResultObserver.observe($("#r6"),{childList:true,subtree:true});
};

const originalMissionSources=lib;
lib=function(){document.body.classList.remove("experiment-home");if(missionResultObserver){missionResultObserver.disconnect();missionResultObserver=null}originalMissionSources()};

/* 지수 비교 차트: 50을 가운데 두고 앞선 쪽으로 막대가 뻗습니다.
   옅은 띠(45~64)는 '비슷함'으로 판정하는 구간이고, 값과 판정은 글로도 적습니다. */
function cmpChart(rows,{key=true}={}){
 return `<div class="cmp" role="img" aria-label="${esc(rows.map(r=>`${r.label} ${r.i}, ${wiVerdict(r.i)}`).join(' / '))}">
 <div class="cmp-axis" aria-hidden="true"><span>조조군 앞섬</span><span>비슷함</span><span>연합군 앞섬</span></div>
 ${rows.map(r=>{const ally=r.i>=50,w=Math.abs(r.i-50);return `<div class="cmp-row${r.now?" now":""}"><span class="cmp-l">${esc(r.label)}</span><span class="cmp-track" aria-hidden="true"><i class="cmp-band"></i><i class="cmp-mid"></i><i class="cmp-bar ${ally?"ally":"wei"}" style="left:${ally?50:r.i}%;width:${w}%"></i></span><span class="cmp-v"><b class="num">${r.i}</b>${esc(wiVerdict(r.i))}</span></div>`}).join("")}
 </div>${key?`<p class="cmp-key">숫자는 두 진영 점수 가운데 연합군의 몫(%)에 바람 보정을 더한 지수입니다. 50이면 똑같고, 50보다 크면 연합군, 작으면 조조군이 앞섭니다. 옅은 띠(45~64)는 '비슷함'으로 봅니다.</p>`:""}`;
}

/* 더 살펴보기: 같은 제갈량 실험을 역사책(정사)으로 다시 해 봅니다 */
VIEWS.push({id:'compare'});
RENDER[8]=()=>{
 if(missionResultObserver){missionResultObserver.disconnect();missionResultObserver=null}
 document.body.classList.remove('experiment-home');TASKS=[];
 const main=$("#main");main.classList.add("simple");
 main.innerHTML=`${hero({hz:'史 料',where:'연의와 정사',title:'다른 기록으로 세어도 같은 결론일까요?',sub:'소설과 역사책, 두 기록으로 같은 실험을 해 봅니다',fx:'mist'})}
 <p class="stage-concept"><span>분석 개념</span><b>출처 비교(교차 검증)</b>같은 질문을 다른 자료로 다시 계산해, 결론이 한 자료에만 기대고 있지 않은지 확인합니다.</p><section class="simple-todo"><span>할 일</span><p>지금까지는 소설 『삼국지연의』를 셌습니다. 두 기록이 진영을 얼마나 다르게 담는지 본 뒤, 같은 제갈량 실험을 역사책(정사)으로 다시 계산해 보시지요.</p><span class="why-l">왜</span><p class="why">소설은 이야기를 위해 인물의 활약을 더하기도 합니다. 결론이 소설의 기록에만 기대고 있다면, 기록을 바꿀 때 흔들리겠지요.</p></section>
 ${step(1,'두 기록은 진영을 얼마나 다르게 담고 있을까요?','막대 하나가 그 기록에서 센 점수 전체(100%)입니다. 칸의 크기가 각 진영의 몫이에요.',`<section class="card pane">${seg('compare-scope',[['jb','정사 본문만'],['all','본문과 주석까지']],S.t.sourceScope||'jb','정사 자료 범위')}<div id="source-shares" class="cmp5"></div><p class="simple-note" id="source-reading-result" aria-live="polite"></p></section>`)}
 ${step(2,'같은 실험을 정사로 다시 하면','6장과 같은 명단과 점수 규칙으로, 바람은 날씨로 두고 계산합니다.',`<section class="card pane"><div id="source-exp"></div><p class="wind-answer" id="source-exp-note"></p></section>`)}
 <details class="card pane step-more"><summary>인물별 원래 집계 횟수 보기</summary><p class="simple-note">연의는 문단, 정사는 문장을 셉니다. 횟수를 곧바로 능력 차이로 읽지 마세요.</p><div class="tscroll tall" tabindex="0" aria-label="인물별 집계 표, 스크롤하여 보기"><table class="data"><thead><tr><th>인물</th><th>자료</th><th class="n">배</th><th class="n">불</th><th class="n">계책</th></tr></thead><tbody id="source-counts"></tbody></table></div></details>
 <details class="card pane step-more"><summary>숫자만으로 알 수 없는 것</summary><p class="simple-note">연의는 제43–50회, 정사는 인물별 열전을 셉니다. 범위와 단위가 다르므로 이 비교는 자료의 차이를 보는 참고값입니다. 어느 기록이 사실인지는 사건별 원문과 문맥을 직접 읽어야 알 수 있습니다.</p></details>
 <div class="pager"><a class="btn ghost" href="#s6">${ic('left')}6장으로 돌아가기</a><a class="btn ghost" href="#src">자료와 집계 기준 ${ic('right')}</a></div>`;
 const draw=()=>{const scope=S.t.sourceScope||'jb',src=scope==='jb'?'정사 본문':'정사 본문과 주석',rows=[['yy','삼국지연의(소설)'],[scope,src]];const shares={};
  $("#source-shares").innerHTML=rows.map(([key,label])=>{const scores=fs(key),total=FS.reduce((sum,f)=>sum+scores[f],0);shares[key]=Object.fromEntries(FS.map(f=>[f,total?Math.round(scores[f]/total*100):0]));return `<div class="srow2"><span>${label}</span><span class="stk">${FS.map(f=>`<i style="width:${shares[key][f]}%;background:${fcol(f)}" title="${FN[f]} ${shares[key][f]}%"></i>`).join('')}</span><span class="cap">${FS.map(f=>`${FN[f]} ${shares[key][f]}%`).join(' · ')}</span></div>`}).join('');
  $("#source-reading-result").textContent=`촉의 몫은 연의 ${shares.yy.shu}%, ${src} ${shares[scope].shu}%입니다. 이 차이만으로 소설의 과장 여부나 사건의 사실 여부를 판단할 수는 없습니다.`;
  const mv={mut:{"諸葛亮":"wei"}},a0=wiCalc({lens:'yy'}).i,a1=wiCalc({...mv,lens:'yy'}).i,b0=wiCalc({lens:scope}).i,b1=wiCalc({...mv,lens:scope}).i;
  $("#source-exp").innerHTML=cmpChart([{label:'연의 · 기록 그대로',i:a0},{label:'연의 · 제갈량 이동',i:a1,now:1},{label:`${src} · 기록 그대로`,i:b0},{label:`${src} · 제갈량 이동`,i:b1,now:1}]);
  const da=a0-a1,db=b0-b1;
  $("#source-exp-note").textContent=`제갈량을 옮기면 연의에서는 ${da}점, ${src}에서는 ${db}점 내려갑니다. ${da===db?'두 기록에서 같은 만큼 움직입니다.':da>db?'정사에서는 덜 움직입니다. 제갈량의 기록이 차지하는 몫이 소설보다 작기 때문이지요.':'정사에서 더 크게 움직입니다. 제갈량의 기록이 차지하는 몫이 소설보다 크기 때문이지요.'} 판정은 연의 '${wiVerdict(a1)}', 정사 '${wiVerdict(b1)}'입니다.`;
  $("#source-counts").innerHTML=roster().map(n=>rows.map(([key,label])=>{const v=key==='yy'?PP[n].yy:key==='jb'?PP[n].jb:PP[n].jb.map((x,i)=>x+PP[n].jn[i]);return `<tr><td>${PP[n].ko}</td><td>${label}</td>${v.slice(0,3).map(x=>`<td class="n">${x}</td>`).join('')}</tr>`}).join('')).join('');};
 onSeg('compare-scope',value=>{S.t.sourceScope=value;save();draw()});draw();
};
/* 평균과 가운데 값: 질문하기 전에 작은 예시로 먼저 보여 줍니다 */
const MEAN_MED_CARD=`<section class="card pane mm-explain"><h3>먼저 알아 두기 · 평균과 가운데 값</h3><div class="mm-ex" aria-hidden="true"><span>1</span><span>2</span><span class="mid">3</span><span>4</span><span class="big">20</span></div><dl class="kw-list"><div><dt>평균</dt><dd>모두 더해 사람 수로 나눈 값입니다. (1+2+3+4+20)÷5 = <b>6</b><small>아주 큰 숫자 하나(20)에 끌려 올라갑니다.</small></dd></div><div><dt>가운데 값</dt><dd>작은 순서로 줄을 세웠을 때 한가운데 값입니다. → <b>3</b><small>큰 숫자 하나가 있어도 잘 움직이지 않습니다.</small></dd></div></dl><p class="simple-note">아래 그래프에서 흰 실선은 평균, 금색 점선은 가운데 값입니다.</p></section>`;

/* 전체 문단 보기: 5장의 숫자 뒤에 있는 문단을 모두 펼쳐 봅니다 */
const KW_HAN={ship:["船","舟","水軍","艦"],fire:["火","燒","焚"],plan:["計","謀","策"],wind:["風"]};
const KW_KO={ship:"배",fire:"불",plan:"계책",wind:"바람"};
const hiHan=(t,k)=>esc(t).replace(new RegExp(KW_HAN[k].join("|"),"g"),m=>`<b class="kw-fire">${m}</b>`);
const allParaLink=(n,k)=>{const L=(typeof EVID_ALL!=="undefined"&&EVID_ALL[n]||{})[k];return L&&L.length>1?`<p class="simple-note para-hint">위 문단은 ${L.length}개 가운데 하나입니다.</p><a class="btn ghost para-link" href="#para?n=${encodeURIComponent(n)}&k=${k}">${PP[n].ko}의 ‘${KW_KO[k]}’ 문단 ${L.length}개 모두 보기</a>`:""};
{const PI=VIEWS.push({id:'para'})-1;RENDER[PI]=()=>{
 if(missionResultObserver){missionResultObserver.disconnect();missionResultObserver=null}
 document.body.classList.remove('experiment-home');TASKS=[];
 const q=new URLSearchParams(location.hash.split("?")[1]||""),n=q.get("n"),k=q.get("k"),list=((typeof EVID_ALL!=="undefined"&&EVID_ALL[n])||{})[k]||[];
 const main=$("#main");main.classList.add("simple");
 if(!list.length||!PP[n]){main.innerHTML=`<p class="simple-note">보여 줄 문단이 없습니다.</p><div class="pager"><a class="btn" href="#s5">${ic('left')}5장으로 돌아가기</a></div>`;return}
 const ko=PP[n].ko;let shown=8;
 main.innerHTML=`${hero({hz:'原 文',where:'『삼국지연의』 제43–50회',title:`${ko}${jo(ko,'과','와')} ‘${KW_KO[k]}’이 함께 나온 문단`,sub:`모두 ${list.length}개 · 원문에 ${KW_HAN[k].join('·')} 가운데 하나가 들어 있습니다`,fx:'mist'})}
 <p class="simple-note para-guide">굵게 표시한 원문 글자 때문에 이 문단이 ‘${KW_KO[k]}’ 1로 세어졌습니다. 번역은 문단의 앞부분입니다. 같은 글자라도 장면이 다르니, 어떤 장면인지 읽어 보시지요.</p>
 <ol class="para-list" id="paraList"></ol><button class="btn ghost" id="paraMore" type="button"></button>
 <div class="pager"><a class="btn" href="#s5">${ic('left')}읽던 곳으로 돌아가기</a></div>`;
 const draw=()=>{$("#paraList").innerHTML=list.slice(0,shown).map(([ch,zh,kt],i)=>`<li class="card pane para"><div class="para-h"><span class="para-no num">${i+1}</span>${srcB('yy',`연의 ${ch}회`)}</div><p class="para-zh" lang="zh-Hant">${hiHan(zh,k)}</p>${kt?`<p class="para-ko">${esc(kt)}</p>`:`<p class="para-ko none">이 문단은 아직 한국어 번역이 없습니다.</p>`}</li>`).join('');
  const m=$("#paraMore");m.hidden=shown>=list.length;m.textContent=`${Math.min(8,list.length-shown)}개 더 보기 (${shown} / ${list.length})`};
 $("#paraMore").onclick=()=>{shown+=8;draw()};draw();
}}


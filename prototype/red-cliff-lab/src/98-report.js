/* ===== 계책 보고서 =====
   순서 6의 확인 문제를 마치면 '보고서 보기' 버튼이 나오고, 이번 질문에서 고른 것과 결과를
   한 장으로 모아 대화상자로 보여 줍니다. 값은 모두 S(예상, 순서별 근거, 해석)에서 가져옵니다. */
function reportText(){
 const x=scenario(),done=ST.map((e,i)=>[e,S.done[i+1]]);
 return {
  q:`만약 ${qShort(x)}?`,
  pred:Number.isInteger(S.prediction)&&PREDICTIONS[S.prediction]?PREDICTIONS[S.prediction]:"남긴 예상이 없습니다",
  steps:done.filter(([,ev])=>ev).map(([e,ev])=>[e.short,String(ev)]),
  missed:done.map(([,ev],i)=>ev?0:i+1).filter(Boolean),
  verdict:(S.reflection||"").trim(),
  skills:done.filter(([,ev])=>ev).map(([e])=>e.skill)
 };
}
const REPORT_LIMIT="이 숫자는 기록에 이름과 낱말이 나온 횟수로 만든 지표입니다. 이 결과만으로 실제 전투의 승패를 단정할 수는 없습니다.";
const reportHTML=r=>`<p class="report-eyebrow">計策錄 · 계책 보고서</p><h2 id="report-title">적벽대전 가정 분석</h2>
 <dl class="report-list">
  <div><dt>나의 가정</dt><dd>${esc(r.q)}</dd></div>
  <div><dt>처음 짐작</dt><dd>${esc(r.pred)}</dd></div>
  <div><dt>분석 과정</dt><dd><ol>${r.steps.map(([s,ev])=>`<li><b>${esc(s)}</b> ${esc(ev)}</li>`).join("")}</ol>${r.missed.length?`<p class="report-note">아직 마치지 않은 순서: ${r.missed.join("·")}</p>`:""}</dd></div>
  <div><dt>최종 판단</dt><dd>${r.verdict?esc(r.verdict):`<span class="report-note">6장의 해석 칸에 결론을 적으면 여기에 담깁니다.</span>`}<p class="report-note">${REPORT_LIMIT}</p></dd></div>
  <div><dt>익힌 분석 역량</dt><dd><ul class="report-skills">${r.skills.map(s=>`<li>${esc(s)}</li>`).join("")}</ul></dd></div>
 </dl>`;
const reportPlain=r=>[`計策錄 · 계책 보고서`,`나의 가정: ${r.q}`,`처음 짐작: ${r.pred}`,`분석 과정:`,...r.steps.map(([s,ev],k)=>`${k+1}. ${s} — ${ev}`),`최종 판단: ${r.verdict||"(적지 않음)"}`,REPORT_LIMIT,`익힌 분석 역량: ${r.skills.join(", ")}`].join("\n");

/* 이 질문의 진행만 지우고 시작 화면으로 돌아갑니다. 다른 질문의 기록은 그대로 둡니다. */
function restartQuestion(){
 const keep={lab:S.t.lab,sourceScope:S.t.sourceScope};
 S.done={};delete S.prediction;delete S.reflection;S.t={};
 if(keep.lab)S.t.lab=keep.lab;if(keep.sourceScope)S.t.sourceScope=keep.sourceScope;
 S.rule={min:2,dead:1};S.w={ship:3,fire:3,plan:2};save();
 closeReport();location.hash="#home";
}
// 한 번 누르면 묻고, 한 번 더 눌러야 지웁니다
const armRestart=b=>{b.onclick=()=>{if(b.dataset.armed){restartQuestion();return}b.dataset.armed="1";b.textContent="진행이 지워집니다. 한 번 더 누르면 다시 시작합니다"}};

const closeReport=()=>{const d=$("#reportDlg");if(!d)return;d.close?d.close():d.removeAttribute("open")};
function openReport(){
 let dlg=$("#reportDlg");
 if(!dlg){document.body.insertAdjacentHTML("beforeend",`<dialog class="report-dlg" id="reportDlg" aria-labelledby="report-title"><section class="card pane report" id="report"></section></dialog>`);dlg=$("#reportDlg");
  dlg.addEventListener("click",e=>{if(e.target===dlg)closeReport()})}
 const r=reportText();
 $("#report").innerHTML=reportHTML(r)+`<div class="report-actions"><button class="btn ghost" id="reportCopy" type="button">글로 복사</button><button class="btn ghost" id="reportRestart" type="button">처음부터 다시 하기</button><button class="btn" id="reportClose" type="button">닫기</button></div>`;
 $("#reportCopy").onclick=e=>{const b=e.currentTarget;navigator.clipboard?.writeText(reportPlain(r)).then(()=>{b.textContent="복사했습니다"},()=>{b.textContent="복사하지 못했습니다"})};
 $("#reportClose").onclick=closeReport;
 armRestart($("#reportRestart"));
 if(dlg.showModal&&!dlg.open)dlg.showModal();else dlg.setAttribute("open","");
}

function drawReport(){
 const old=$("#reportCta");
 if(location.hash.split("?")[0]!=="#s6"||!S.done[6]){old&&old.remove();return}
 if(old)return;
 const html=`<section class="report-cta" id="reportCta"><p><b>${Object.keys(S.done).length>=6?"여섯 장을 모두 마쳤습니다.":"가정 실험을 마쳤습니다."}</b> 이번 질문에서 고른 것과 결과를 계책 보고서 한 장으로 정리했습니다.</p><div class="report-actions"><button class="btn" id="reportOpen" type="button">계책 보고서 보기</button><button class="btn ghost" id="ctaRestart" type="button">처음부터 다시 하기</button></div></section>`;
 const pager=$("#main .pager");pager?pager.insertAdjacentHTML("beforebegin",html):$("#main").insertAdjacentHTML("beforeend",html);
 $("#reportOpen").onclick=openReport;armRestart($("#ctaRestart"));
}
(()=>{
 const r6=RENDER[6];RENDER[6]=function(){const out=r6.apply(this,arguments);drawReport();return out};
 const chrome=drawChrome;drawChrome=function(){const out=chrome.apply(this,arguments);drawReport();return out};
})();

/* ===== intro ===== */
let introStop=null,introReturnFocus=null;
function closeIntro(remember=true){
  const el=$("#intro");if(!el)return;
  // Hide immediately and explicitly: author display rules must not keep the modal visible.
  el.hidden=true;el.style.display="none";el.setAttribute("aria-hidden","true");el.classList.remove("out");
  document.body.style.overflow="";
  if(introStop){const stop=introStop;introStop=null;try{stop()}catch{}finally{FX.delete(stop)}}
  if(remember){S.seenIntro=1;save();const target=introReturnFocus&&introReturnFocus.isConnected?introReturnFocus:$("#main h1");
    if(target){if(!target.hasAttribute("tabindex"))target.setAttribute("tabindex","-1");target.focus({preventScroll:true})}}
  introReturnFocus=null;
}
/* the opening is a short film in five scenes: the battle, the fire, the question,
   counting, and how the analysis will go. "다음" moves on; the last one starts. */
let introAt=0;
function introScene(k){
  const el=$("#intro");if(!el)return;const scenes=[...el.querySelectorAll(".iscene")];introAt=Math.max(0,Math.min(k,scenes.length-1));
  scenes.forEach((s,j)=>{s.hidden=j!==introAt;s.classList.toggle("on",j===introAt)});
  el.querySelectorAll(".idots i").forEach((d,j)=>d.classList.toggle("on",j<=introAt));
  const last=introAt===scenes.length-1,enter=el.querySelector(".enter");enter.textContent=last?"시작하기":"다음";
  enter.style.animation="none";void enter.offsetWidth;enter.style.animation="";
  if(introStop){const stop=introStop;introStop=null;try{stop()}catch{}finally{FX.delete(stop)}}
  const heat=+(scenes[introAt]?.dataset.heat||.3);
  try{introStop=typeof nightFx==="function"?nightFx($("#introFx"),heat):fx($("#introFx"),"embers")}catch{introStop=null}
  el.style.setProperty("--heat",heat);
}
function introNext(){const el=$("#intro");if(!el)return;const n=el.querySelectorAll(".iscene").length;if(introAt>=n-1)closeIntro();else introScene(introAt+1)}
function intro(force=false){
  const el=$("#intro");if(!el)return;
  // Bind actions on every initialization, including returning visits, before optional effects.
  const enter=el.querySelector(".enter"),skip=el.querySelector(".skip");
  enter.type="button";skip.type="button";
  enter.onclick=()=>introNext();skip.onclick=()=>closeIntro();
  if(!force&&S.seenIntro){closeIntro(false);return}
  if(introStop){const stop=introStop;introStop=null;try{stop()}catch{}finally{FX.delete(stop)}}
  introReturnFocus=force&&document.activeElement?.closest("[data-intro]")?document.activeElement:null;
  el.hidden=false;el.style.display="grid";el.setAttribute("aria-hidden","false");el.classList.remove("out");document.body.style.overflow="hidden";
  introScene(0);
  enter.focus({preventScroll:true});
}
document.addEventListener("click",e=>{if(e.target.closest("[data-intro]"))intro(true)});
document.addEventListener("keydown",e=>{
  const el=$("#intro");if(!el||el.hidden)return;
  if(e.key==="Escape"){e.preventDefault();closeIntro();return}
  if(e.key==="ArrowRight"){e.preventDefault();introNext();return}
  if(e.key==="ArrowLeft"){e.preventDefault();introScene(introAt-1);return}
  if(e.key!=="Tab")return;
  const first=el.querySelector(".enter"),last=el.querySelector(".skip");
  if(e.shiftKey&&(document.activeElement===first||!el.contains(document.activeElement))){e.preventDefault();last.focus()}
  else if(!e.shiftKey&&(document.activeElement===last||!el.contains(document.activeElement))){e.preventDefault();first.focus()}
});

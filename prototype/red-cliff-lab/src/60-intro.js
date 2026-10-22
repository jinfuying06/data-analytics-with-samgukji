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
function intro(force=false){
  const el=$("#intro");if(!el)return;
  // Bind actions on every initialization, including returning visits, before optional effects.
  const enter=el.querySelector(".enter"),skip=el.querySelector(".skip");
  enter.type="button";skip.type="button";
  enter.onclick=()=>closeIntro();skip.onclick=()=>closeIntro();
  if(!force){closeIntro(false);return}
  if(introStop){const stop=introStop;introStop=null;try{stop()}catch{}finally{FX.delete(stop)}}
  introReturnFocus=force&&document.activeElement?.closest("[data-intro]")?document.activeElement:null;
  el.hidden=false;el.style.display="grid";el.setAttribute("aria-hidden","false");el.classList.remove("out");document.body.style.overflow="hidden";
  el.querySelectorAll(".l,.it,.enter").forEach(x=>{x.style.animation="none";void x.offsetWidth;x.style.animation=""});
  try{introStop=fx($("#introFx"),"embers")}catch{introStop=null}
  enter.focus({preventScroll:true});
}
document.addEventListener("click",e=>{if(e.target.closest("[data-intro]"))intro(true)});
document.addEventListener("keydown",e=>{
  const el=$("#intro");if(!el||el.hidden)return;
  if(e.key==="Escape"){e.preventDefault();closeIntro();return}
  if(e.key!=="Tab")return;
  const first=el.querySelector(".enter"),last=el.querySelector(".skip");
  if(e.shiftKey&&(document.activeElement===first||!el.contains(document.activeElement))){e.preventDefault();last.focus()}
  else if(!e.shiftKey&&(document.activeElement===last||!el.contains(document.activeElement))){e.preventDefault();first.focus()}
});

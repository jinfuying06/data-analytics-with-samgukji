/* ===== intro ===== */
function intro(force){
  if(!force&&S.seenIntro)return;
  const el=$("#intro");el.hidden=false;el.classList.remove("out");document.body.style.overflow="hidden";
  el.querySelectorAll(".l,.it,.enter").forEach(x=>{x.style.animation="none";void x.offsetWidth;x.style.animation=""});
  const stop=fx($("#introFx"),"embers");
  const close=()=>{S.seenIntro=1;save();el.classList.add("out");document.body.style.overflow="";setTimeout(()=>{el.hidden=true;stop();FX.delete(stop)},RM?0:700);$("#main h1")?.focus?.()};
  el.querySelector(".enter").onclick=close;el.querySelector(".skip").onclick=close;
  el.querySelector(".enter").focus({preventScroll:true});
}
document.addEventListener("click",e=>{if(e.target.closest("[data-intro]"))intro(true)});

/* Five scenes, with controls available only after the current scene is revealed. */
let introStop=null,introReturnFocus=null,introTimer=0,introAt=0,introReady=false;
function revealIntro(){
 const el=$("#intro");if(!el||el.hidden)return;
 clearTimeout(introTimer);introTimer=0;introReady=true;
 el.classList.add("ready","revealed");
 el.querySelector(".enter").disabled=false;el.querySelector(".intro-prev").disabled=introAt===0;
}
function closeIntro(remember=true){
 const el=$("#intro");if(!el)return;
 clearTimeout(introTimer);introTimer=0;introReady=false;
 el.hidden=true;el.style.display="none";el.setAttribute("aria-hidden","true");el.classList.remove("out","ready","revealed");
 document.body.style.overflow="";
 if(introStop){const stop=introStop;introStop=null;try{stop()}catch{}finally{FX.delete(stop)}}
 if(remember){S.seenIntro=1;save();const target=introReturnFocus&&introReturnFocus.isConnected?introReturnFocus:$("#main h1");
  if(target){if(!target.hasAttribute("tabindex"))target.setAttribute("tabindex","-1");target.focus({preventScroll:true})}}
 introReturnFocus=null;
}
function introScene(k){
 const el=$("#intro");if(!el)return;clearTimeout(introTimer);introTimer=0;introReady=false;
 el.classList.remove("ready","revealed");
 const scenes=[...el.querySelectorAll(".iscene")];introAt=Math.max(0,Math.min(k,scenes.length-1));
 scenes.forEach((s,j)=>{s.hidden=j!==introAt;s.classList.toggle("on",j===introAt)});
 el.querySelectorAll(".idots i").forEach((d,j)=>d.classList.toggle("on",j<=introAt));
 const scene=scenes[introAt],enter=el.querySelector(".enter");enter.textContent=introAt===scenes.length-1?"시작하기":"다음";
 enter.disabled=true;el.querySelector(".intro-prev").disabled=true;
 // One schedule controls both line animation and the moment navigation becomes available.
 let duration=0;
 [...scene.children].forEach((line,j)=>{const delay=200+j*700,ms=line.classList.contains("it")?1800:1000;
  line.style.animationDelay=delay+"ms";line.style.animationDuration=ms+"ms";duration=Math.max(duration,delay+ms)});
 scene.querySelectorAll(".isteps li").forEach((line,j)=>{const delay=600+j*200;line.style.animationDelay=delay+"ms";line.style.animationDuration="800ms";duration=Math.max(duration,delay+800)});
 if(RM)revealIntro();else introTimer=setTimeout(revealIntro,duration);
 const heat=+(scene.dataset.heat||.3);
 if(introStop?.setHeat)introStop.setHeat(heat);
 else try{introStop=typeof nightFx==="function"?nightFx($("#introFx"),heat):fx($("#introFx"),"embers")}catch{introStop=null}
 el.style.setProperty("--heat",heat);el.focus({preventScroll:true});
}
function introNext(){
 if(!introReady){revealIntro();return}
 const el=$("#intro");if(!el)return;const n=el.querySelectorAll(".iscene").length;
 if(introAt>=n-1)closeIntro();else introScene(introAt+1);
}
function intro(force=false){
 const el=$("#intro");if(!el)return;
 const enter=el.querySelector(".enter"),skip=el.querySelector(".skip");enter.type="button";skip.type="button";
 enter.onclick=()=>introNext();skip.onclick=()=>closeIntro();el.querySelector(".intro-prev").onclick=()=>introScene(introAt-1);
 // Click is also emitted for a normal touch tap. Revealing never advances the scene.
 el.onclick=e=>{if(!e.target.closest?.("button,a")&&!introReady)revealIntro()};
 if(!force&&S.seenIntro){closeIntro(false);return}
 if(introStop){const stop=introStop;introStop=null;try{stop()}catch{}finally{FX.delete(stop)}}
 introReturnFocus=force&&document.activeElement?.closest("[data-intro]")?document.activeElement:null;
 el.hidden=false;el.style.display="grid";el.setAttribute("aria-hidden","false");el.classList.remove("out");document.body.style.overflow="hidden";
 introScene(0);
}
document.addEventListener("click",e=>{if(e.target.closest("[data-intro]"))intro(true)});
document.addEventListener("keydown",e=>{
 const el=$("#intro");if(!el||el.hidden)return;
 if(e.key==="Escape"){e.preventDefault();closeIntro();return}
 if(e.key==="Enter"||e.key===" "){
  if(!introReady){e.preventDefault();if(!e.repeat)revealIntro();return}
  if(!e.target.closest?.("button,a")){e.preventDefault();if(!e.repeat)introNext();return}
 }
 if(e.key==="ArrowRight"){e.preventDefault();if(!e.repeat)introNext();return}
 if(e.key==="ArrowLeft"){e.preventDefault();if(!e.repeat){if(!introReady)revealIntro();else introScene(introAt-1)}return}
 if(e.key!=="Tab")return;
 const first=introReady?el.querySelector(".enter"):el.querySelector(".skip"),last=el.querySelector(".skip");
 if(e.shiftKey&&(document.activeElement===first||document.activeElement===el||!el.contains(document.activeElement))){e.preventDefault();last.focus()}
 else if(!e.shiftKey&&(document.activeElement===last||document.activeElement===el||!el.contains(document.activeElement))){e.preventDefault();first.focus()}
});

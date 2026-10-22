/* ===== cinema: one night on the river, the fire growing stage by stage =====
   Every page uses the same scene (river mist, embers) and the same
   cuts. Only the heat changes: calm at the start, full blaze at the What-if. */
const HEAT={home:.18,s1:.18,s2:.3,s3:.45,s4:.6,s5:.78,s6:1,compare:.12,src:.12};
const SCENE_NO=["一","二","三","四","五","六"];

function nightFx(cv,heat){
  let ctx;try{ctx=cv&&cv.getContext&&cv.getContext("2d")}catch{return()=>{}}if(!ctx)return()=>{};
  let w=0,h=0,raf=0,alive=true;const dpr=Math.min(2,devicePixelRatio||1);
  const size=()=>{const r=cv.getBoundingClientRect();w=r.width;h=r.height;cv.width=w*dpr;cv.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0)};size();
  const rnd=(a,b)=>a+Math.random()*(b-a);
  const fog=[...Array(6)].map(()=>({x:rnd(-.2,1.2),y:rnd(.2,.8),r:rnd(.3,.55),v:rnd(.00003,.0001)*(Math.random()<.5?-1:1)}));
  const sparks=[...Array(Math.round(12+70*heat))].map(()=>({x:rnd(0,1),y:rnd(0,1.2),r:rnd(.6,2),vy:rnd(.0002,.0008)*(.6+heat),vx:rnd(-.0002,.0002),ph:rnd(0,6.28)}));
  function draw(t){
    ctx.clearRect(0,0,w,h);
    // fire glow on the far bank: grows with heat, breathes slowly
    const breathe=1+.08*Math.sin(t/900);
    const g=ctx.createRadialGradient(w*.72,h*1.05,0,w*.72,h*1.05,Math.max(w,h)*(.35+.45*heat));
    g.addColorStop(0,`rgba(232,110,50,${(.1+.38*heat)*breathe})`);g.addColorStop(1,"rgba(232,110,50,0)");ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
    // river mist
    for(const f of fog){f.x+=f.v*16;if(f.x>1.4)f.x=-.4;if(f.x<-.4)f.x=1.4;const R=f.r*Math.max(w,h);const m=ctx.createRadialGradient(f.x*w,f.y*h,0,f.x*w,f.y*h,R);m.addColorStop(0,`rgba(170,190,205,${.07-.04*heat})`);m.addColorStop(1,"rgba(170,190,205,0)");ctx.fillStyle=m;ctx.fillRect(0,0,w,h)}
    // embers
    for(const p of sparks){p.y-=p.vy;p.x+=p.vx+Math.sin(t/700+p.ph)*.0004;if(p.y<-.05){p.y=1.05;p.x=rnd(.2,1)}
      const life=Math.max(0,Math.min(1,p.y));ctx.fillStyle=`rgba(255,${150+Math.round(60*(1-life))},70,${(.2+.6*life)*(.5+.5*heat)})`;ctx.beginPath();ctx.arc(p.x*w,p.y*h,p.r,0,6.28);ctx.fill()}
  }
  const loop=t=>{if(!alive)return;if(!document.hidden)draw(t);raf=requestAnimationFrame(loop)};
  if(RM)draw(0);else raf=requestAnimationFrame(loop);
  const ro=window.ResizeObserver?new ResizeObserver(()=>{size();if(RM)draw(0)}):null;ro&&ro.observe(cv);
  const stop=()=>{alive=false;cancelAnimationFrame(raf);ro&&ro.disconnect()};FX.add(stop);return stop;
}

function cinemaCut(){
  if(RM)return;let c=document.getElementById("cinema-cut");
  if(!c){c=document.createElement("div");c.id="cinema-cut";c.setAttribute("aria-hidden","true");document.body.appendChild(c)}
  c.classList.remove("on");void c.offsetWidth;c.classList.add("on");
}

startHeroFx=function(){
  const id=(location.hash||"#home").slice(1)||"home",heat=HEAT[id]??.2;
  document.documentElement.style.setProperty("--heat",heat);
  const main=$("#main");if(!main)return;
  const hero=main.querySelector(".scene-hero");
  if(hero){
    hero.dataset.fx="night";hero.style.setProperty("--heat",heat);
    const n=/^s([1-6])$/.exec(id);
    const meta=hero.querySelector(".hero-meta .hz");
    if(n&&meta){const i=+n[1];meta.textContent=`第${SCENE_NO[i-1]}場`;
      if(!hero.querySelector(".reel"))hero.querySelector(".hero-in")?.insertAdjacentHTML("afterbegin",`<div class="reel" aria-hidden="true">${SCENE_NO.map((_,k)=>`<i class="${k<i-1?"past":k===i-1?"now":""}"></i>`).join("")}</div>`)}
    nightFx(hero.querySelector("canvas"),heat);
  }else{
    const open=main.querySelector(".experiment-opening");
    if(open&&!open.querySelector(".cinema-bg")){open.insertAdjacentHTML("afterbegin",'<canvas class="cinema-bg" aria-hidden="true"></canvas>');nightFx(open.querySelector(".cinema-bg"),heat)}
  }
  cinemaCut();
};

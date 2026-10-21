const RM=!!(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches);
const FX=new Set();
function fx(cv,mode){
  const ctx=cv&&cv.getContext&&cv.getContext("2d");if(!ctx)return()=>{};let w=0,h=0,raf=0,alive=true;const dpr=Math.min(2,devicePixelRatio||1);
  const size=()=>{const r=cv.getBoundingClientRect();w=r.width;h=r.height;cv.width=w*dpr;cv.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0)};size();
  const rnd=(a,b)=>a+Math.random()*(b-a);
  const fog=[...Array(7)].map(()=>({x:rnd(-.2,1.2),y:rnd(.35,1),r:rnd(.25,.5),v:rnd(.00004,.00012)*(Math.random()<.5?-1:1),a:rnd(.05,.12)}));
  const n=mode==="mist"?18:mode==="embers"?55:85;
  const P=[...Array(n)].map(()=>({x:rnd(0,1),y:rnd(0,1.2),r:rnd(.6,2.2),vy:rnd(.00025,.0009),vx:rnd(-.0002,.0002),ph:rnd(0,6.28)}));
  function draw(t){
    ctx.clearRect(0,0,w,h);
    if(mode!=="mist"){const g=ctx.createLinearGradient(0,h,0,h*.3);g.addColorStop(0,mode==="fire"?"rgba(226,98,43,.38)":"rgba(226,98,43,.18)");g.addColorStop(1,"rgba(226,98,43,0)");ctx.fillStyle=g;ctx.fillRect(0,0,w,h)}
    for(const f of fog){f.x+=f.v*16;if(f.x>1.4)f.x=-.4;if(f.x<-.4)f.x=1.4;const R=f.r*Math.max(w,h);const g=ctx.createRadialGradient(f.x*w,f.y*h,0,f.x*w,f.y*h,R);const c=mode==="mist"?"200,214,224":"120,110,105";g.addColorStop(0,`rgba(${c},${f.a})`);g.addColorStop(1,`rgba(${c},0)`);ctx.fillStyle=g;ctx.fillRect(0,0,w,h)}
    for(const p of P){
      if(mode==="mist"){p.x+=p.vx*4+.0001;p.y+=Math.sin(t/2000+p.ph)*.0002;if(p.x>1.05)p.x=-.05;ctx.fillStyle="rgba(220,230,236,.35)";ctx.beginPath();ctx.arc(p.x*w,p.y*h,p.r*.8,0,6.28);ctx.fill();continue}
      p.y-=p.vy*(mode==="fire"?1.6:1);p.x+=p.vx+Math.sin(t/700+p.ph)*.0004;if(p.y<-.05){p.y=1.05;p.x=rnd(0,1)}
      const life=Math.max(0,Math.min(1,p.y));const a=.25+.6*life;
      ctx.fillStyle=`rgba(255,${150+Math.round(60*(1-life))},70,${a})`;ctx.beginPath();ctx.arc(p.x*w,p.y*h,p.r,0,6.28);ctx.fill();
    }
  }
  const loop=t=>{if(!alive)return;if(!document.hidden)draw(t);raf=requestAnimationFrame(loop)};
  if(RM)draw(0);else raf=requestAnimationFrame(loop);
  const ro=window.ResizeObserver?new ResizeObserver(()=>{size();if(RM)draw(0)}):null;ro&&ro.observe(cv);
  const stop=()=>{alive=false;cancelAnimationFrame(raf);ro&&ro.disconnect()};FX.add(stop);return stop;
}
function stopFx(){FX.forEach(f=>f());FX.clear()}
function startHeroFx(){const h=$(".scene-hero");if(h)fx(h.querySelector("canvas"),h.dataset.fx)}

const {JSDOM,VirtualConsole}=require(process.env.SAMGUKJI_JSDOM_PATH||'jsdom');
const fs=require('node:fs'),assert=require('node:assert/strict');
const html=fs.readFileSync('dist/index.html','utf8');
const context=()=>new Proxy({}, {get(o,k){if(k==='createLinearGradient'||k==='createRadialGradient')return ()=>({addColorStop(){}});return o[k]??(()=>{})},set(o,k,v){o[k]=v;return true}});
function open({seen=false,reduced=false,canvas='working',blockedStorage=false}={}){
 const errors=[],timers=new Map();let now=0,serial=0;const vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e));
 const dom=new JSDOM(html,{url:'https://example.test/',runScripts:'dangerously',pretendToBeVisual:true,virtualConsole:vc,beforeParse(w){
  w.matchMedia=()=>({matches:reduced});w.scrollTo=()=>{};
  w.setTimeout=(fn,ms)=>{timers.set(++serial,{fn,at:now+ms});return serial};w.clearTimeout=id=>timers.delete(id);
  w.HTMLCanvasElement.prototype.getContext=()=>{if(canvas==='throw')throw new Error('Canvas unavailable');return canvas==='none'?null:context()};
  if(blockedStorage)Object.defineProperty(w,'localStorage',{value:{getItem(){throw new Error('Storage blocked')},setItem(){throw new Error('Storage blocked')}}});
  else if(seen)w.localStorage.setItem('redcliff-v8',JSON.stringify({done:{},t:{},rule:{min:2,dead:1},w:{ship:3,fire:3,plan:2},seenIntro:1}));
 }});
 return {dom,w:dom.window,d:dom.window.document,errors,tick(ms){now+=ms;for(const [id,t] of [...timers])if(t.at<=now){timers.delete(id);t.fn()}}};
}
const reveal=intro=>{if(!intro.classList.contains('ready'))intro.click()};
const next=intro=>{reveal(intro);intro.querySelector('.enter').click()};
const finish=intro=>{while(!intro.hidden)next(intro)};
let checked=0;
for(const reduced of [false,true])for(const canvas of ['working','none','throw'])for(const action of ['next','skip']){
 const {dom,w,d,errors,tick}=open({reduced,canvas});try{
  const intro=d.querySelector('#intro'),enter=intro.querySelector('.enter'),prev=intro.querySelector('.intro-prev');
  assert.equal(intro.hidden,false);assert.equal(d.body.style.overflow,'hidden');assert.equal(intro.querySelectorAll('.iscene').length,5);
  assert.equal(enter.disabled,!reduced);assert.equal(prev.disabled,true);
  const scene=intro.querySelector('.iscene:not([hidden])');
  if(!reduced){enter.click();assert.equal(intro.querySelector('.iscene:not([hidden])'),scene,'unrevealed navigation cannot advance');tick(3999);assert.equal(enter.disabled,true,'button waits for last line');tick(1);assert.equal(enter.disabled,false,'controls appear once all lines finish')}
  const openingFx=w.eval('introStop');enter.click();assert.equal(w.eval('introAt'),1);assert.equal(enter.disabled,!reduced);if(canvas==='working')assert.equal(w.eval('introStop'),openingFx);
  // A tap reveals the current scene and both controls, without advancing it.
  intro.querySelector('.iscene:not([hidden]) p').click();assert.equal(w.eval('introAt'),1);assert.equal(enter.disabled,false);assert.equal(prev.disabled,false);
  prev.click();assert.equal(w.eval('introAt'),0);reveal(intro);assert.equal(prev.disabled,true);
  enter.click();const event=new w.KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true});intro.dispatchEvent(event);
  assert.equal(w.eval('introAt'),reduced?2:1,'first Enter reveals an unfinished scene, otherwise advances');
  if(!reduced){assert.equal(enter.disabled,false);intro.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Enter',repeat:true,bubbles:true,cancelable:true}));assert.equal(w.eval('introAt'),1,'held Enter cannot skip a scene')}
  if(action==='skip')intro.querySelector('.skip').click();else finish(intro);
  assert.equal(intro.hidden,true);assert.equal(w.getComputedStyle(intro).display,'none');assert.equal(d.body.style.overflow,'');assert.equal(JSON.parse(w.localStorage.getItem('redcliff-v8')).seenIntro,1);
  const replay=d.querySelector('#main [data-intro]');replay.focus();replay.click();assert.equal(w.eval('introAt'),0);assert.equal(d.activeElement,intro);
  // During reveal, Tab only reaches the always-available skip control.
  if(!reduced){intro.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Tab',bubbles:true,cancelable:true}));assert.equal(d.activeElement,intro.querySelector('.skip'))}
  reveal(intro);enter.focus();enter.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Tab',shiftKey:true,bubbles:true,cancelable:true}));assert.equal(d.activeElement,intro.querySelector('.skip'));
  intro.querySelector('.skip').dispatchEvent(new w.KeyboardEvent('keydown',{key:'Tab',bubbles:true,cancelable:true}));assert.equal(d.activeElement,enter);
  intro.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));assert.equal(intro.hidden,true);assert.equal(d.activeElement,replay);tick(10000);assert.equal(intro.hidden,true,'closing cancels the pending reveal');
  assert.equal(errors.length,0,errors.map(e=>e.message).join('\n'));checked++;
 }finally{dom.window.close()}
}
for(const reduced of [false,true])for(const canvas of ['working','none','throw']){
 const {dom,d,errors}=open({seen:true,reduced,canvas});try{const intro=d.querySelector('#intro');assert.equal(intro.hidden,true);d.querySelector('#main [data-intro]').click();finish(intro);assert.equal(errors.length,0);checked++}finally{dom.window.close()}
}
for(const action of ['next','skip']){
 const {dom,d,errors}=open({blockedStorage:true,canvas:'throw'});try{const intro=d.querySelector('#intro');if(action==='skip')intro.querySelector('.skip').click();else finish(intro);assert.equal(intro.hidden,true);assert.equal(errors.length,0);checked++}finally{dom.window.close()}
}
console.log(`PASS ${checked} intro scenarios: buttons wait for all text; tap/Enter reveal without advancing; simultaneous controls, disabled navigation, stable cinematic effect, held-key guard, focus trap, skip/replay, reduced motion and unavailable Canvas/storage.`);

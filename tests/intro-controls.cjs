const {JSDOM,VirtualConsole}=require(process.env.SAMGUKJI_JSDOM_PATH||'jsdom');
const fs=require('node:fs'),assert=require('node:assert/strict');
const html=fs.readFileSync('dist/index.html','utf8');
const context=()=>new Proxy({}, {get(o,k){if(k==='createLinearGradient'||k==='createRadialGradient')return ()=>({addColorStop(){}});return o[k]??(()=>{})},set(o,k,v){o[k]=v;return true}});
function open({seen=false,reduced=false,canvas='working',blockedStorage=false}={}){
 const errors=[];const vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e));
 const dom=new JSDOM(html,{url:'https://example.test/',runScripts:'dangerously',pretendToBeVisual:true,virtualConsole:vc,beforeParse(w){
  w.matchMedia=()=>({matches:reduced});w.scrollTo=()=>{};
  w.HTMLCanvasElement.prototype.getContext=()=>{if(canvas==='throw')throw new Error('Canvas unavailable');return canvas==='none'?null:context()};
  if(blockedStorage){Object.defineProperty(w,'localStorage',{value:{getItem(){throw new Error('Storage blocked')},setItem(){throw new Error('Storage blocked')}}})}
  else if(seen)w.localStorage.setItem('redcliff-v8',JSON.stringify({done:{},t:{},rule:{min:2,dead:1},w:{ship:3,fire:3,plan:2},seenIntro:1}));
 }});
 return {dom,w:dom.window,d:dom.window.document,errors};
}
// .enter moves to the next scene and starts the app on the last one; .skip closes at once.
const finish=(intro,action)=>{if(action==='.skip'){intro.querySelector('.skip').click();return}const n=intro.querySelectorAll('.iscene').length;for(let k=0;k<n-1;k++){intro.querySelector('.enter').click();assert.equal(intro.hidden,false,'opening stays open until the last scene')}assert.equal(intro.querySelector('.enter').textContent,'시작하기');intro.querySelector('.enter').click()};
let checked=0;
for(const reduced of [false,true])for(const canvas of ['working','none','throw'])for(const action of ['.enter','.skip']){
 const {dom,w,d,errors}=open({reduced,canvas});try{
  const intro=d.querySelector('#intro');assert.equal(intro.hidden,false,'first visit opens with the opening');assert.equal(intro.style.display,'grid');assert.equal(d.body.style.overflow,'hidden');
  assert.equal(intro.querySelectorAll('.iscene').length,5);assert.equal(intro.querySelectorAll('.iscene:not([hidden])').length,1);
  assert.equal(typeof intro.querySelector(action).onclick,'function');finish(intro,action);
  assert.equal(intro.hidden,true);assert.equal(intro.style.display,'none');assert.equal(w.getComputedStyle(intro).display,'none');assert.equal(d.body.style.overflow,'');assert.equal(JSON.parse(w.localStorage.getItem('redcliff-v8')).seenIntro,1);
  d.querySelector('#main [data-intro]').focus();d.querySelector('#main [data-intro]').click();assert.equal(intro.hidden,false);assert.equal(intro.querySelector('.iscene:not([hidden]) .k').textContent.includes('208'),true,'replay starts from the first scene');
  intro.querySelector('.enter').click();d.dispatchEvent(new w.KeyboardEvent('keydown',{key:'ArrowLeft',bubbles:true,cancelable:true}));assert.ok(intro.querySelector('.iscene:not([hidden]) .k').textContent.includes('208'),'ArrowLeft goes back');
  intro.querySelector('.skip').click();assert.equal(intro.hidden,true);assert.equal(d.activeElement,d.querySelector('#main [data-intro]'));
  const reopen=d.querySelector('#main [data-intro]');reopen.focus();reopen.click();assert.equal(intro.hidden,false);
  intro.querySelector('.enter').focus();intro.querySelector('.enter').dispatchEvent(new w.KeyboardEvent('keydown',{key:'Tab',shiftKey:true,bubbles:true,cancelable:true}));assert.equal(d.activeElement,intro.querySelector('.skip'));
  intro.querySelector('.skip').dispatchEvent(new w.KeyboardEvent('keydown',{key:'Tab',bubbles:true,cancelable:true}));assert.equal(d.activeElement,intro.querySelector('.enter'));
  d.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));assert.equal(intro.hidden,true);assert.equal(d.activeElement,reopen);
  reopen.click();assert.equal(intro.hidden,false);intro.querySelector('.skip').click();assert.equal(intro.hidden,true);assert.equal(errors.length,0,errors.map(e=>e.message).join('\n'));checked++;
 }finally{dom.window.close()}
}
for(const reduced of [false,true])for(const canvas of ['working','none','throw']){
 const {dom,w,d,errors}=open({seen:true,reduced,canvas});try{
  const intro=d.querySelector('#intro');assert.equal(intro.hidden,true);assert.equal(intro.style.display,'none');assert.equal(w.getComputedStyle(intro).display,'none');assert.equal(typeof intro.querySelector('.enter').onclick,'function');assert.equal(typeof intro.querySelector('.skip').onclick,'function');assert.equal(d.body.style.overflow,'');
  d.querySelector('#main [data-intro]').click();assert.equal(intro.hidden,false);finish(intro,'.enter');assert.equal(intro.hidden,true);assert.equal(errors.length,0);checked++;
 }finally{dom.window.close()}
}
for(const action of ['.enter','.skip']){
 const {dom,d,errors}=open({blockedStorage:true,canvas:'throw'});try{const intro=d.querySelector('#intro');assert.equal(intro.hidden,false,'blocked storage still shows the opening');finish(intro,action);assert.equal(d.querySelector('#intro').hidden,true);assert.equal(d.body.style.overflow,'');assert.equal(errors.length,0);checked++}finally{dom.window.close()}
}
console.log(`PASS ${checked} intro scenarios: five-scene opening on first visit, next/start/skip, return visits, replay, focus/Tab/Escape, reduced motion, unavailable Canvas and blocked storage.`);

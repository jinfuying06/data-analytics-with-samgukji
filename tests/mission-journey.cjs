const {JSDOM,VirtualConsole}=require(process.env.SAMGUKJI_JSDOM_PATH||'jsdom');
const fs=require('node:fs'),assert=require('node:assert/strict');
const errors=[];const vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
const dom=new JSDOM(fs.readFileSync('dist/index.html','utf8'),{url:'https://example.test/',runScripts:'dangerously',pretendToBeVisual:true,virtualConsole:vc,beforeParse(w){w.matchMedia=()=>({matches:true});w.scrollTo=()=>{};w.HTMLCanvasElement.prototype.getContext=()=>null;w.localStorage.setItem('redcliff-v8',JSON.stringify({done:{},t:{},rule:{min:2,dead:1},w:{ship:3,fire:3,plan:2},seenIntro:1}))}});
const w=dom.window,d=w.document,ev=s=>w.eval(s),route=id=>ev(`location.hash='#${id}';route()`),click=s=>{assert.ok(d.querySelector(s),s);d.querySelector(s).click()},answer=()=>click('#vbox .opt[data-i="1"]');
// Visible text length: skips hidden nodes and the bodies of closed <details>.
const visible=root=>{let t='';const walk=n=>{for(const c of n.childNodes){if(c.nodeType===3){t+=c.textContent;continue}if(c.nodeType!==1||['SCRIPT','STYLE','svg','CANVAS','NAV'].includes(c.tagName)||c.hidden)continue;if(c.tagName==='DETAILS'&&!c.open){t+=c.querySelector(':scope>summary')?.textContent||'';continue}walk(c)}};walk(root);return t.replace(/\s+/g,' ').trim().length};
try{
 // Home: one story line, the question, a prediction. No method essay up front.
 const home=d.querySelector('#main');assert.ok(home.querySelector('h1').textContent.includes('만약 제갈량이'));
 assert.equal(home.firstElementChild.className,'experiment-opening');assert.ok(d.body.classList.contains('experiment-home'));assert.equal(d.querySelector('.home-progress'),null,'no boxed progress panel');assert.equal(d.querySelectorAll('.home-steps a').length,6);assert.ok(d.querySelector('.home-steps a.now[href="#s1"]'));assert.ok(d.querySelector('.prediction-footer button.home-start[type="submit"]'));assert.ok(!d.querySelector('#main').textContent.includes('약 30분'));assert.equal(d.querySelectorAll('#prediction-form button[type="submit"]').length,1);
 assert.ok(home.querySelector('.simple-story').textContent.includes('208년 겨울'));
 for(const gone of ['.experiment-intro','.background-method','.journey-condition','.journey-background'])assert.equal(home.querySelector(gone),null,gone);
 assert.equal(home.querySelectorAll('.river-armies img').length,3);
 for(const image of home.querySelectorAll('.river-armies img'))assert.ok(fs.existsSync('dist'+image.getAttribute('src')));
 assert.equal(home.querySelector('.journey-outline'),null,'stages are laid out, not folded');
 assert.ok(visible(home)<400,'home should stay short');
 assert.equal(d.querySelector('#intro').hidden,true);
 assert.equal(d.querySelector('#prediction-form button').disabled,true);
 click('#prediction-form input[value="0"]');assert.equal(ev('S.prediction'),0);assert.equal(JSON.parse(w.localStorage.getItem('redcliff-v8')).prediction,0);
 click('#prediction-form button');assert.equal(w.location.hash,'#s1');

 // Every stage: a one-line task, explanation folded, no jargon walls.
 for(let i=1;i<=6;i++){route('s'+i);const m=d.querySelector('#main');
  assert.ok(m.querySelector('.simple-todo'),'s'+i+' task line');assert.ok(m.querySelector('.simple-todo .why').textContent.length>10,'s'+i+' why is visible');assert.ok(m.querySelector('.simple-todo .key').textContent.length>5,'s'+i+' key point is visible');
  assert.equal(m.querySelector('.mission-brief'),null);assert.equal(m.querySelector('.experiment-stage-context'),null);assert.equal(m.querySelector('.subtitle'),null);
  assert.ok(visible(m)<640,/* includes the always-visible question label */'s'+i+' visible text '+visible(m))}

 // Stage 1: decide on concrete people first; the rule is named afterwards.
 route('s1');assert.equal(d.querySelector('#s1reveal').hidden,true);
 click('.pcard[data-n="曹操"] .pick button[data-v="1"]');click('.pcard[data-n="許褚"] .pick button[data-v="1"]');click('.pcard[data-n="夏侯淵"] .pick button[data-v="0"]');
 answer();assert.equal(ev('!!S.done[1]'),false,'unfinished activity keeps the check locked');
 click('.pcard[data-n="袁紹"] .pick button[data-v="0"]');assert.equal(d.querySelector('#s1reveal').hidden,false);assert.equal(ev('roster().length'),42);answer();assert.ok(ev('!!S.done[1]'));

 // Stage 6: move 제갈량, then change the wind assumption; prediction and reflection persist.
 route('s6');assert.equal(d.querySelector('#s6pred').hidden,true);click('#move6');assert.ok(d.querySelector('#mv6').textContent.includes('72'));
 assert.equal(d.querySelector('#s6pred').hidden,true,'comparison waits for both assumptions');
 click('#wind6 button[data-v="zg"]');click('#wind6 button[data-v="env"]');assert.equal(d.querySelector('#s6pred').hidden,false);
 assert.ok(d.querySelector('[data-original-prediction]').textContent.includes('조조 쪽'));
 const reflection=d.querySelector('#prediction-reflection');reflection.value='바람을 어떻게 보느냐에 따라 달라집니다.';reflection.dispatchEvent(new w.Event('input'));
 assert.equal(ev('S.reflection'),'바람을 어떻게 보느냐에 따라 달라집니다.');
 assert.equal(ev('S.t.s6x.who'),'諸葛亮');assert.equal(ev('S.t.s6x.act'),'wei');

 // Optional historical comparison and source pages still work and clean up.
 route('compare');assert.equal(ev('missionResultObserver'),null);assert.ok(d.querySelector('#main h1').textContent.includes('다른 기록'));route('src');assert.equal(ev('missionResultObserver'),null);
 route('s6');assert.equal(d.querySelector('#prediction-reflection')?.value??ev('S.reflection'),'바람을 어떻게 보느냐에 따라 달라집니다.');

 // Home routing and reset.
 ev('S.done={1:"완료"}');route('home');click('#prediction-form input[value="1"]');click('#prediction-form button');assert.equal(w.location.hash,'#s2');
 ev('S.done={1:"완료",2:"완료",3:"완료",4:"완료",5:"완료",6:"완료"}');route('home');click('#prediction-form button');assert.equal(w.location.hash,'#s6');route('home');click('#reset');assert.equal(ev('S.prediction'),undefined);assert.equal(ev('S.reflection'),undefined);assert.equal(d.querySelector('#prediction-form button').disabled,true);
 assert.equal(errors.length,0,errors.join('\n'));
 console.log('PASS mission journey: short question-first home; task, why and key point visible per stage; concrete-first stage 1; move-then-assume stage 6; persisted prediction and reflection; optional source pages; routing and reset.');
}finally{dom.window.close()}

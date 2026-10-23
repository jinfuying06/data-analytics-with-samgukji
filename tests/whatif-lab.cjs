const {JSDOM,VirtualConsole}=require(process.env.SAMGUKJI_JSDOM_PATH||'jsdom');
const fs=require('node:fs'),assert=require('node:assert/strict');
const errors=[];const vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
const dom=new JSDOM(fs.readFileSync('dist/index.html','utf8'),{url:'https://example.test/',runScripts:'dangerously',pretendToBeVisual:true,virtualConsole:vc,beforeParse(w){w.matchMedia=()=>({matches:true});w.scrollTo=()=>{};w.HTMLCanvasElement.prototype.getContext=()=>null;w.localStorage.setItem('redcliff-v8',JSON.stringify({done:{},t:{},rule:{min:2,dead:1},w:{ship:3,fire:3,plan:2},seenIntro:1}))}});
const w=dom.window,d=w.document,q=s=>d.querySelector(s),e=s=>w.eval(s),route=id=>e(`location.hash='#${id}';route()`),click=s=>{assert.ok(q(s),s);q(s).click()};
const answer=()=>click('#vbox .opt[data-i="1"]');
try{
 // entry points
 route('home');assert.ok(q('#main .lab-link[href="#lab"]'),'home links to the lab');assert.ok(q('#main .scenario-switch[href="#lab"]'));
 route('s6');assert.ok(q('#main .lab-link[href="#lab"]'),'stage 6 links to the lab');

 // the lab is a list of questions; nothing is calculated there
 route('lab');assert.equal(q('#main h1').textContent,'어느 이야기를 바꾸어 보시겠습니까?');
 assert.equal(d.querySelectorAll('.wi-card').length,9);assert.equal(q('#wiPanel'),null);assert.equal(q('#wiOut'),null);
 assert.ok(q('.wi-card[data-id="zg"]').textContent.includes('지금 실험 중'));

 // finish stages 1–5 once with the main question; they are shared by every question
 for(let i=1;i<=5;i++)e(`S.done[${i}]="완료"`);e('save()');

 // every question runs the same journey: home story + prediction → stage 6 step by step → compare
 const expected={zg:['72','52'],zy:['69','59'],hg:['77','67'],zyout:['79','69'],ptout:['82','72'],nowind:['73','75'],nofire:['85','83'],combo:['54','64'],jb:['81','80']};
 for(const [id,[changed,alt]] of Object.entries(expected)){
  route('lab');click(`.wi-card[data-id="${id}"]`);e('route()');
  assert.equal(w.location.hash,'#home',id+' opens on the home screen');assert.equal(e('S.scenario'),id);
  assert.ok(q('#main>.experiment-opening'));assert.equal(d.querySelectorAll('.experiment-river img').length,3);
  assert.ok(q('#experiment-title').textContent.startsWith('만약 '),id);assert.ok(q('.simple-story').textContent.length>30);
  const start=q('#prediction-form button[type="submit"]');assert.equal(start.disabled,true,id+' asks for its own prediction first');
  q('#prediction-form').dispatchEvent(new w.Event('submit',{cancelable:true}));assert.equal(w.location.hash,'#home','no prediction, no start');
  q('#prediction-form input[value="0"]').click();q('#prediction-form').dispatchEvent(new w.Event('change'));assert.equal(start.disabled,false);
  q('#prediction-form').dispatchEvent(new w.Event('submit',{cancelable:true}));assert.equal(w.location.hash,'#s6',id+' continues to the experiment once stages 1–5 are done');
  route('s6');assert.equal(q('#main h1').textContent,e(`WHATIFS.find(x=>x.id==="${id}").q`).replace(/\s*\(.*\)\s*$/,''));
  assert.equal(q('#mv6').textContent,'','result waits for the change to be applied');assert.equal(q('#wind6sec').hidden,true);
  answer();assert.equal(e('!!S.done[6]'),false,'check stays locked before the experiment');
  click('#move6');assert.ok(q('#mv6 .big-change').textContent.endsWith(changed),id+' '+q('#mv6 .big-change').textContent);
  assert.equal(q('#s6pred').hidden,true,'comparison waits for the second assumption');
  const opts=d.querySelectorAll('#wind6 button');assert.equal(opts.length,2);opts[1].click();opts[0].click();
  assert.ok(q('#s6name .named p').textContent.includes(changed)&&q('#s6name .named p').textContent.includes(alt),id+' names both assumptions');
  assert.equal(q('#s6pred').hidden,false);assert.equal(q('[data-original-prediction]').textContent,'조조 쪽에 더 유리해질 것 같습니다');
  answer();assert.ok(e('!!S.done[6]'),id+' completes its own stage 6');
 }

 // prediction and stage 6 progress belong to each question; stages 1–5 are shared
 route('lab');assert.equal(q('#labCount').textContent,'9');assert.ok(q('.wi-card[data-id="zy"]').textContent.includes('끝까지 살펴봄'));
 e('S.t.s6d.w="none"');route('lab?question=zg');assert.equal(e('S.scenario'),'zg');assert.equal(w.location.hash,'#home');
 route('s6');assert.ok(q('#mv6 .big-change').textContent.endsWith('72'),'main question keeps its own progress');assert.deepEqual(JSON.parse(e('JSON.stringify(S.t.s6d.tried)')).sort(),['env','zg']);
 assert.equal(e('S.t.s6x.who'),'諸葛亮');assert.equal(e('S.t.s6x.act'),'wei');
 for(let i=1;i<=5;i++)assert.ok(e(`!!S.done[${i}]`));

 // a fresh question with unfinished stages starts at stage 1
 e('S.done={}');e('save()');route('lab');click('.wi-card[data-id="jb"]');e('route()');e('delete S.prediction');route('home');
 q('#prediction-form input[value="1"]').click();q('#prediction-form').dispatchEvent(new w.Event('change'));q('#prediction-form').dispatchEvent(new w.Event('submit',{cancelable:true}));assert.equal(w.location.hash,'#s1');
 route('s2');assert.ok(q('.simple-todo .why').textContent.startsWith('기록을 바꾸기 전에'),'stage texts follow the active question');
 for(const st of ['s1','s2','s3','s4','s5']){route(st);assert.ok(q('.scene-hero .hero-question').textContent.includes('만약 소설 대신 역사책(정사)으로 센다면?'),st+' keeps the question in view')}
 route('lab?question=zg');route('s2');assert.ok(q('.simple-todo .why').textContent.startsWith('제갈량을 옮기기 전에'));

 // builder: a sandbox that writes the question from the choices
 route('lab');q('.lab-tools').open=true;
 assert.equal(q('#wbQ').textContent,'만약 주유가 조조 편이었다면?');
 click('#wbWind button[data-v="none"]');assert.equal(q('#wbQ').textContent,'만약 주유가 조조 편이었다면 · 바람이 불지 않았다면?');assert.equal(q('#wbRes .big').textContent,'83 → 59');
 const who=q('#wbWho');who.value='曹操';who.dispatchEvent(new w.Event('change'));click('#wbAct button[data-v="wei"]');click('#wbWind button[data-v="env"]');
 assert.ok(q('#wbQ').textContent.includes('이미 그 편'));assert.equal(q('#wbRes').textContent,'');
 click('#wbAct button[data-v="out"]');assert.equal(q('#wbQ').textContent,'만약 조조가 없었다면?');

 // which questions can this data answer?
 click('#wiAsk .wi-ask-row[data-k="1"] button[data-v="0"]');assert.ok(q('#wiAsk .wi-ask-row[data-k="1"] .pcard-tip').textContent.startsWith('그렇지요.'));
 click('#wiAsk .wi-ask-row[data-k="0"] button[data-v="0"]');assert.ok(q('#wiAsk .wi-ask-row[data-k="0"] .pcard-tip').textContent.startsWith('기록의 범위를 다시 살펴보시지요.'));

 // navigation and old URLs
 route('lab?question=missing');assert.equal(q('#main h1').textContent,'어느 이야기를 바꾸어 보시겠습니까?');
 route('lab');assert.equal(q('.lab-topics'),null);assert.equal(d.querySelectorAll('.tabbar>*').length,4);assert.ok(q('#tabL .ico'));assert.equal(q('#tabL').getAttribute('aria-current'),'page');
 assert.ok(!fs.readFileSync('prototype/red-cliff-lab/src/10-styles-course.html','utf8').includes('repeat(3,1fr)!important'));
 route('lab?topic=people');assert.equal(d.querySelectorAll('.wi-card').length,9);assert.equal(q('.lab-topics'),null);
 assert.equal(errors.length,0,errors.join('\n'));
 console.log('PASS What-if lab: 9 questions each run the main journey (home story and prediction → shared stages 1–5 → apply the change → change one assumption → compare): 72/52, 69/59, 77/67, 79/69, 82/72, 73/75, 85/83, 54/64, 81/80; per-question prediction and stage 6 progress; stage texts follow the question; builder and answerable-question check.');
}finally{dom.window.close()}

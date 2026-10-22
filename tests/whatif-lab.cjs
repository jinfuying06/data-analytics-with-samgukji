const {JSDOM,VirtualConsole}=require(process.env.SAMGUKJI_JSDOM_PATH||'jsdom');
const fs=require('node:fs'),assert=require('node:assert/strict');
const errors=[];const vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
const dom=new JSDOM(fs.readFileSync('dist/index.html','utf8'),{url:'https://example.test/',runScripts:'dangerously',pretendToBeVisual:true,virtualConsole:vc,beforeParse(w){w.matchMedia=()=>({matches:true});w.scrollTo=()=>{};w.HTMLCanvasElement.prototype.getContext=()=>null;w.localStorage.setItem('redcliff-v8',JSON.stringify({done:{},t:{},rule:{min:2,dead:1},w:{ship:3,fire:3,plan:2},seenIntro:1}))}});
const w=dom.window,d=w.document,q=s=>d.querySelector(s),route=id=>w.eval(`location.hash='#${id}';route()`),click=s=>{assert.ok(q(s),s);q(s).click()};
try{
 // entry points
 route('home');assert.ok(q('#main .lab-link[href="#lab"]'),'home links to the lab');
 route('s6');assert.ok(q('#main .lab-link[href="#lab"]'),'stage 6 links to the lab');

 // curated questions: one calculation, many conditions (default roster and weights)
 route('lab');assert.equal(q('#main h1').textContent,'다른 What-if도 계산해 볼까요?');
 const expected={zg:'83 → 72',zy:'83 → 69',hg:'83 → 77',zyout:'83 → 79',ptout:'83 → 82',nowind:'83 → 73',nofire:'83 → 85',combo:'83 → 54',jb:'83 → 81'};
 assert.equal(d.querySelectorAll('.wi-card').length,Object.keys(expected).length);
 for(const [id,value] of Object.entries(expected)){
  click(`.wi-card[data-id="${id}"]`);assert.equal(q('#wiOut').textContent,'','result waits for a prediction');
  click('#wiPred button[data-v="down"]');assert.equal(q('#wiOut .big').textContent,value,id);
  assert.ok(q('#wiOut .wi-assume').textContent.includes('이 결과의 가정'),id+' states its assumptions');
 }
 assert.equal(q('#labCount').textContent,'9');assert.equal(Object.keys(w.eval('S.t.lab.pred')).length,9);
 click('.wi-card[data-id="nofire"]');assert.ok(q('#wiOut .wi-hit').textContent.includes('예상과 다릅니다'),'fire failure surprises: the index goes up');

 // builder writes the question from the choices
 assert.equal(q('#wbQ').textContent,'만약 주유가 조조 편이었다면?');
 click('#wbWind button[data-v="none"]');assert.equal(q('#wbQ').textContent,'만약 주유가 조조 편이었다면 · 바람이 불지 않았다면?');assert.equal(q('#wbRes .big').textContent,'83 → 59');
 const who=q('#wbWho');who.value='曹操';who.dispatchEvent(new w.Event('change'));click('#wbAct button[data-v="wei"]');click('#wbWind button[data-v="env"]');
 assert.ok(q('#wbQ').textContent.includes('이미 그 편'));assert.equal(q('#wbRes').textContent,'');
 click('#wbAct button[data-v="out"]');assert.equal(q('#wbQ').textContent,'만약 조조가 없었다면?');

 // which questions can this data answer?
 click('#wiAsk .wi-ask-row[data-k="1"] button[data-v="0"]');assert.ok(q('#wiAsk .wi-ask-row[data-k="1"] .pcard-tip').textContent.startsWith('맞아요.'));
 click('#wiAsk .wi-ask-row[data-k="0"] button[data-v="0"]');assert.ok(q('#wiAsk .wi-ask-row[data-k="0"] .pcard-tip').textContent.startsWith('다시 생각해 보세요.'));

 // lab does not count as one of the six stages
 assert.equal(w.eval('Object.keys(S.done).length'),0);
 assert.equal(errors.length,0,errors.join('\n'));
 console.log('PASS What-if lab: 9 curated questions on one calculation (72, 69, 77, 79, 82, 73, 85, 54, 81), predict-before-result, stated assumptions, question builder, answerable-question check, entry links from home and stage 6.');
}finally{dom.window.close()}

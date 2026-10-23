const {JSDOM,VirtualConsole}=require(process.env.SAMGUKJI_JSDOM_PATH||'jsdom');
const fs=require('node:fs'),assert=require('node:assert/strict');
const errors=[];const vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
const dom=new JSDOM(fs.readFileSync('dist/index.html','utf8'),{url:'https://example.test/',runScripts:'dangerously',pretendToBeVisual:true,virtualConsole:vc,beforeParse(w){w.matchMedia=()=>({matches:true});w.scrollTo=()=>{};w.HTMLCanvasElement.prototype.getContext=()=>null;w.localStorage.setItem('redcliff-v8',JSON.stringify({done:{},t:{},rule:{min:2,dead:1},w:{ship:3,fire:3,plan:2},seenIntro:1}))}});
const w=dom.window,d=w.document,q=s=>d.querySelector(s),e=s=>w.eval(s),route=id=>e(`location.hash='#${id}';route()`),click=s=>{assert.ok(q(s),s);q(s).click()};
const answer=()=>click('#vbox .opt[data-i="'+d.querySelector('#vbox').dataset.ok+'"]');
try{
 // entry points
 route('home');assert.equal(q('#main .lab-link'),null,'home relies on the tab bar for the lab');assert.equal(q('#main .scenario-switch'),null);assert.ok(q('#tabL[href="#lab"]'));
 route('s6');assert.ok(q('#main .lab-link[href="#lab"]'),'stage 6 links to the lab');

 // the lab is a list of questions; nothing is calculated there
 route('lab');assert.ok(q('#main h1').textContent.endsWith('바꾸어 보시겠습니까?'));
 assert.equal(d.querySelectorAll('.wi-card').length,9);assert.equal(q('#wiPanel'),null);assert.equal(q('#wiOut'),null);
 assert.ok(q('.wi-card[data-id="zg"]').classList.contains('current'));assert.ok(q('.wi-card[data-id="zg"]').getAttribute('aria-label').includes('지금 실험 중'));assert.equal(q('.wi-card small'),null,'no status sentences on cards');

 // every question runs the same six-stage journey, but stages 1–5 look at the records that matter for it
 const expected={
  zg:{cards:['조조','허저','하후연','원소'],s5:'조조',changed:'72',alt:'52'},
  zy:{cards:['주유','서성','여범','손책'],s2:'평균의 함정',s5:'주유',changed:'69',alt:'59'},
  hg:{cards:['황개','정봉','엄준','손책'],s2:'한 사람의 무게',s5:'황개',changed:'77',alt:'67'},
  zyout:{cards:['주유','서성','여범','손책'],s2:'평균의 함정',s5:'주유',changed:'79',alt:'69'},
  ptout:{cards:['유비','방통','손건','유표'],s2:'평균보다 작은 한 사람',s5:'방통',changed:'82',alt:'72'},
  nowind:{cards:['제갈량','서성','하후연','유표'],s2:'여러 사람에게 퍼진 기록',s5:'제갈량',changed:'73',alt:'75'},
  nofire:{cards:['황개','정봉','하후연','유표'],s2:'한 사람에게 몰린 기록',s5:'조조',changed:'85',alt:'83'},
  combo:{cards:['주유','정봉','여범','손책'],s2:'평균의 함정',s5:'황개',changed:'54',alt:'64'},
  jb:{cards:['제갈량','서성','여범','손책'],s2:'같은 사람, 다른 기록',changed:'81',alt:'80'}};
 const s1Titles=new Set(),s5Titles=new Set(),shapes={1:new Set(),2:new Set(),3:new Set()};
 for(const [id,x] of Object.entries(expected)){
  route('lab');click(`.wi-card[data-id="${id}"]`);e('route()');
  assert.equal(w.location.hash,'#home',id+' opens on the home screen');assert.equal(e('S.scenario'),id);
  assert.ok(q('#main>.experiment-opening'));assert.equal(d.querySelectorAll('.experiment-river img').length,3);
  assert.ok(q('#experiment-title').textContent.startsWith('만약 '),id);assert.ok(q('.simple-story').textContent.length>30);
  const start=q('#prediction-form button[type="submit"]');assert.equal(start.disabled,true,id+' asks for its own prediction first');assert.equal(start.textContent.trim(),'시작하기');
  q('#prediction-form').dispatchEvent(new w.Event('submit',{cancelable:true}));assert.equal(w.location.hash,'#home','no prediction, no start');
  q('#prediction-form input[value="0"]').click();q('#prediction-form').dispatchEvent(new w.Event('change'));assert.equal(start.disabled,false);
  q('#prediction-form').dispatchEvent(new w.Event('submit',{cancelable:true}));assert.equal(w.location.hash,'#s1',id+' starts its own stage 1');
  const lv=e(`WHATIFS.find(x=>x.id==="${id}").level`);
  const shape=[];
  // 순서 1 — 1단계 picks four cards; 2단계 tries three rules; 3단계 sets a rule and a reason that fits it
  route('s1');shape.push(q('#main .stepsec h2').textContent);
  if(id!=='zg')assert.ok(q('.scene-hero .hero-question').textContent.includes('만약'),id+' keeps the question in view');
  if(lv===1){
   assert.deepEqual([...d.querySelectorAll('#pcards .pcard-h b')].map(b=>b.textContent),x.cards,id+' stage 1 cards');s1Titles.add(q('.stepsec h2').textContent);
   for(const card of d.querySelectorAll('#pcards .pcard')){const n=card.dataset.n,role=card.dataset.role||({'曹操':'core','許褚':'two','夏侯淵':'one','袁紹':'dead'})[n];card.querySelector(`.pick button[data-v="${role==='core'||role==='two'?1:0}"]`).click()}
  }else if(lv===2){
   assert.equal(q('#pcards'),null,id+' level 2 does not pick cards');assert.deepEqual([...d.querySelectorAll('#rCards .pcard-h b')].map(b=>b.textContent),x.cards);
   answer();assert.equal(e('!!S.done[1]'),false,'needs three rules');
   click('#rMin button[data-v="1"]');click('#rMin button[data-v="3"]');assert.ok(q('#rCards .pcard.out'),'a card drops out under some rule');click('#rMin button[data-v="2"]');
   assert.equal(q('#s1name h3').textContent,'기준 견주기');
  }else{
   assert.equal(q('#pcards'),null);click('#rMin button[data-v="2"]');click('#rDead button[data-v="1"]');click('#rFix');
   click('#rWhy button[data-v="1"]');click('#rMin button[data-v="3"]');click('#rFix');assert.ok(q('#rWhyTip').textContent.startsWith('다시 생각'),'a reason that does not fit the rule is flagged');
   assert.equal(e('!!(S.t.s1&&S.t.s1.reason)'),false);click('#rMin button[data-v="2"]');click('#rFix');assert.equal(q('#s1name h3').textContent,'기준과 까닭');
  }
  answer();assert.ok(e('!!S.done[1]'),id+' stage 1');assert.equal(e('roster().length'),42);
  // 순서 2 — drop a person · predict then compare mean and median · choose the measure with a reason
  route('s2');shape.push(q('#main .stepsec h2').textContent);
  if(lv===1){click('#dropTop');if(x.s2)assert.equal(q('#s2name h3').textContent,x.s2,id+' stage 2 lesson')}
  else if(lv===2){assert.equal(q('#dropTop').disabled,true,id+' predicts before computing');click('#pred2 button');click('#dropTop');assert.ok(q('#dropRes').textContent.includes('예측')||q('#dropRes').textContent.includes('어림'));
   if(q('#meas2')){answer();assert.equal(e('!!S.done[2]'),false);click('#meas2 button[data-v="median"]');if(!e('!!(S.t.s2&&S.t.s2.measure)'))click('#meas2 button[data-v="mean"]')}}
  else{click('#meas3 button[data-v="median"]');click('#measWhy button[data-v="2"]');assert.ok(q('#measTip').textContent.startsWith('다시 생각'),'choosing by the result is flagged');click('#measWhy button[data-v="0"]');assert.equal(q('#s2name h3').textContent,'대표값 고르기')}
  answer();assert.ok(e('!!S.done[2]'),id+' stage 2');
  // 순서 3 — weights · sort first · weights with a reason
  route('s3');shape.push(q('#main .stepsec h2').textContent);
  if(lv===2){assert.ok(q('#sort3'),id+' level 2 sorts the records first');assert.equal(q('#s3score').hidden,true);
   for(const [n,v] of [['曹操','attack'],['周瑜','attack'],['黃蓋','said']])click(`.sort-item[data-n="${n}"] button[data-v="${v}"]`);
   assert.ok(q('.sort-item[data-n="曹操"] .pcard-tip').textContent.startsWith('다시 읽어'));assert.equal(q('#s3score').hidden,true,'scoring waits for a correct sort');
   click('.sort-item[data-n="曹操"] button[data-v="hurt"]');assert.equal(q('#s3score').hidden,false);click('#fixW')}
  else if(lv===3){assert.equal(q('#fixW').disabled,true,'needs a reason');click('#wts3 button[data-w="fire"][data-d="1"]');click('#wWhy button[data-v="2"]');assert.equal(q('#fixW').disabled,true,'ship is not the largest weight');click('#wWhy button[data-v="0"]');assert.equal(q('#fixW').disabled,false);click('#fixW');click('#wts3 button[data-w="fire"][data-d="-1"]');assert.equal(e('!!(S.t.s3&&S.t.s3.weight)'),false,'changing the score reopens the step');click('#wWhy button[data-v="1"]');click('#fixW')}
  else{assert.equal(q('#sort3'),null);click('#fixW')}
  answer();assert.ok(e('!!S.done[3]'),id+' stage 3');
  // 순서 4 — compute all · hunt the lowest · set the bar first
  route('s4');shape.push(q('#main .stepsec h2').textContent);
  if(lv===2){assert.equal(q('#runAll'),null,id+' level 2 hunts instead of computing everything');for(let k=0;k<3;k++)click('#wts4 button[data-w="ship"][data-d="1"]');assert.equal(q('#reveal4').hidden,false);click('#reveal4');assert.ok(/\d+~\d+/.test(q('#best4').textContent))}
  else if(lv===3){assert.equal(q('#runAll').disabled,true,id+' sets the bar before computing');click('#bar4 button[data-v="90"]');click('#runAll');assert.ok(q('#allRes').textContent.includes('90%'))}
  else{click('#runAll');assert.ok(q('#allRes').textContent.length>10)}
  answer();assert.ok(e('!!S.done[4]'),id+' stage 4');
  // 순서 5 — guess then open · read then judge claims · choose the record and its use
  route('s5');s5Titles.add(q('#main h1').textContent);shape.push(q('#main .stepsec h2').textContent);
  if(lv===1){if(id==='zg'){click('#guess5 button[data-v="1"]')}else click('#guess5 button[data-v="0"]');click('#open5');
   if(x.s5)assert.ok(q('#txt5').textContent.includes(x.s5),id+' stage 5 reads '+x.s5)}
  else if(lv===2){assert.equal(q('#guess5'),null);assert.ok(q('#main blockquote').textContent.length>20,'the record comes first');
   for(const it of d.querySelectorAll('#claims5 .sort-item'))it.querySelector('button[data-v="1"]').click();
   for(const it of d.querySelectorAll('#claims5 .sort-item'))if(it.querySelector('.warn'))it.querySelector('button[data-v="0"]').click();
   assert.equal(q('#s5name h3').textContent,'근거 대조')}
  else{click('#recs5 button[data-i="1"]');assert.ok(q('#txt5').textContent.length>5);click('#use5 button[data-v="0"]');assert.equal(e('!!(S.t.s5&&S.t.s5.victim)'),false);click('#use5 button[data-v="1"]');assert.equal(q('#s5name h3').textContent,'확인한 기록')}
  answer();assert.ok(e('!!S.done[5]'),id+' stage 5');
  // 순서 6
  route('s6');assert.equal(q('#main h1').textContent,e(`WHATIFS.find(x=>x.id==="${id}").q`).replace(/\s*\(.*\)\s*$/,''));shape.push(q('#main .stepsec h2').textContent);
  shapes[lv].add(shape.join('|'));
  if(lv===3){
   assert.equal(q('#move6'),null,id+' level 3 sets assumptions instead');assert.ok(q('#d6text').textContent.startsWith('만약 '));
   assert.equal(d.querySelectorAll('.lv-decided dt').length,5,id+' the conclusion lists the five decisions');
   assert.equal(q('#lvNudge'),null,'no nudge once 순서 1–5 are done');
   answer();assert.equal(e('!!S.done[6]'),false);assert.equal(q('#d6save').disabled,true,'needs a limit and the checklist');
   (q('#d6fire button[data-v="zero"]')||q('#d6wind button[data-v="zg"]')).click();click('#d6limit button[data-v="2"]');
   for(const box of d.querySelectorAll('#d6checks input')){box.checked=true;box.dispatchEvent(new w.Event('change',{bubbles:true}))}
   assert.equal(q('#d6save').disabled,false);click('#d6save');assert.equal(q('#s6name h3').textContent,'결론 쓰기');
   assert.ok(e('S.reflection').includes('가정할 때')&&e('S.reflection').includes('다만'),id+' conclusion has assumption and limit');
   assert.equal(q('[data-original-prediction]').textContent,'조조 쪽에 더 유리해질 것 같습니다');answer();assert.ok(e('!!S.done[6]'),id+' completes level 3 stage 6');continue}
  if(lv===2){
   assert.equal(q('#flip6sec').hidden,true);answer();assert.equal(e('!!S.done[6]'),false);
   click('#move6');assert.ok(q('#mv6 .big-change').textContent.endsWith(x.changed),id+' '+q('#mv6 .big-change').textContent);
   for(const v of [0,20,30])click(`#bonus6 button[data-v="${v}"]`);assert.equal(q('#s6name h3').textContent,'판정이 바뀌는 곳');
   if(id==='zy')assert.ok(q('#s6name p').textContent.includes('5점')&&q('#s6name p').textContent.includes('10점'),'zy flips between 5 and 10');
   assert.equal(q('#s6pred').hidden,false);answer();assert.ok(e('!!S.done[6]'),id+' completes level 2 stage 6');continue}
  assert.equal(q('#mv6').textContent,'','result waits for the change to be applied');assert.equal(q('#wind6sec').hidden,true);
  answer();assert.equal(e('!!S.done[6]'),false,'check stays locked before the experiment');
  click('#move6');assert.ok(q('#mv6 .big-change').textContent.endsWith(x.changed),id+' '+q('#mv6 .big-change').textContent);
  assert.equal(q('#s6pred').hidden,true,'comparison waits for the second assumption');
  const opts=d.querySelectorAll('#wind6 button');assert.equal(opts.length,2);opts[1].click();opts[0].click();
  assert.ok(q('#s6name .named p').textContent.includes(x.changed)&&q('#s6name .named p').textContent.includes(x.alt),id+' names both assumptions');
  assert.equal(q('#s6pred').hidden,false);assert.equal(q('[data-original-prediction]').textContent,'조조 쪽에 더 유리해질 것 같습니다');
  answer();assert.ok(e('!!S.done[6]'),id+' completes its own stage 6');
 }
 assert.ok(s1Titles.size>=3,'stage 1 differs by question');
 {const one=[...shapes[1]][0].split('|'),two=[...shapes[2]][0].split('|'),three=[...shapes[3]][0].split('|');for(let k=0;k<6;k++)assert.ok(new Set([one[k],two[k],three[k]]).size>=2,`순서 ${k+1} differs by level: ${one[k]} / ${two[k]} / ${three[k]}`);assert.ok(two.filter((t,k)=>t!==one[k]).length>=5&&three.filter((t,k)=>t!==one[k]).length>=5,'levels 2 and 3 change almost every 순서')}assert.equal(s5Titles.size,9,'stage 5 differs by question');
 route('lab');assert.deepEqual([...d.querySelectorAll('.lab-level h2')].map(h=>h.textContent),['세어 보기','숫자 의심하기','가정 설계하기']);assert.deepEqual([...d.querySelectorAll('.lab-level[data-level="3"] .wi-card')].map(c=>c.dataset.id),['nowind','combo','jb']);

 // each question keeps its own progress, rule and weights
 route('lab');assert.equal(q('#labCount').textContent,'9');assert.ok(q('.wi-card[data-id="zy"]').classList.contains('finished'));assert.ok(q('.wi-card[data-id="zy"] .wi-mark .ico'));
 e('S.w.ship=5');route('lab?question=zg');assert.equal(e('S.scenario'),'zg');assert.equal(w.location.hash,'#home');assert.equal(e('S.w.ship'),3,'weights belong to each question');
 route('s6');assert.ok(q('#mv6 .big-change').textContent.endsWith('72'),'main question keeps its own progress');assert.deepEqual(JSON.parse(e('JSON.stringify(S.t.s6d.tried)')).sort(),['env','zg']);
 assert.equal(e('S.t.s6x.who'),'諸葛亮');assert.equal(e('S.t.s6x.act'),'wei');
 for(let i=1;i<=6;i++)assert.ok(e(`!!S.done[${i}]`));
 route('lab?question=jb');route('s2');assert.ok(q('.simple-todo .why').textContent.startsWith('무엇으로 견주느냐'),'stage texts follow the level');route('lab?question=ptout');route('s2');assert.ok(q('.simple-todo .why').textContent.includes('방통'),'stage texts follow the active question');
 route('lab?question=zg');route('s2');assert.ok(q('.simple-todo .why').textContent.startsWith('제갈량을 옮기기 전에'));
 // a question whose person drops out of the roster says so
 route('lab?question=ptout');e('S.t.s1d={}');route('s1');for(const card of d.querySelectorAll('#pcards .pcard'))card.querySelector(`.pick button[data-v="${card.dataset.role==='core'?1:0}"]`).click();
 assert.ok(q('#s1reveal .wi-hit').textContent.includes('방통'),'removing 방통 by rule is flagged');
 route('lab?question=zg');
 // doubtful cards (already dead, one passing mention) steer toward leaving them out
 route('lab?question=ptout');e('S.t.s1d={}');route('s1');click('.pcard[data-n="劉表"] .pick button[data-v="1"]');
 assert.ok(q('.pcard[data-n="劉表"] .pcard-tip').textContent.startsWith('다시 생각해 보시지요.'));assert.ok(q('.pcard[data-n="劉表"] .pick button[data-v="0"]').classList.contains('nudge'));
 click('.pcard[data-n="劉表"] .pick button[data-v="0"]');assert.ok(q('.pcard[data-n="劉表"] .pcard-tip').textContent.startsWith('그렇지요.'));assert.equal(q('.pcard[data-n="劉表"] .nudge'),null);
 route('lab?question=zg');route('s1');e('S.t.s1d={}');route('s1');click('.pcard[data-n="夏侯淵"] .pick button[data-v="1"]');assert.ok(q('.pcard[data-n="夏侯淵"] .pcard-tip').textContent.includes('빼는 편을 권합니다'));

 // 단계 3: skipping ahead to the conclusion suggests going back, but does not block
 route('lab?question=jb');e('delete S.t.s2r;delete S.t.s4r;S.t.s6c&&delete S.t.s6c.skip');route('s6');assert.ok(q('#lvNudge').textContent.includes('순서 2·4'));assert.equal(q('#lvNudge a').getAttribute('href'),'#s2');assert.ok(q('#d6text'),'the conclusion stays usable');
 click('#lvSkip');assert.equal(q('#lvNudge'),null);route('s6');assert.equal(q('#lvNudge'),null,'skipping is remembered');route('lab?question=zg');

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
 route('lab?question=missing');assert.ok(q('#main h1').textContent.endsWith('바꾸어 보시겠습니까?'));
 route('lab');assert.equal(q('.lab-topics'),null);assert.equal(d.querySelectorAll('.tabbar>*').length,4);assert.ok(q('#tabL .ico'));assert.equal(q('#tabL').getAttribute('aria-current'),'page');
 assert.ok(!fs.readFileSync('prototype/red-cliff-lab/src/10-styles-course.html','utf8').includes('repeat(3,1fr)!important'));
 route('lab?topic=people');assert.equal(d.querySelectorAll('.wi-card').length,9);assert.equal(q('.lab-topics'),null);
 assert.equal(errors.length,0,errors.join('\n'));
 console.log('PASS What-if lab: three 단계 that change every 순서 (choose · predict and check · decide with reasons and write the conclusion), checks follow the correct option wherever it sits; 9 questions each run their own six-stage journey (question-specific roster cards, weight/concentration lesson, score, sensitivity and source reading; then apply the change and vary one assumption): 72/52, 69/59, 77/67, 79/69, 82/72, 73/75, 85/83, 54/64, 81/80; per-question progress, rule and weights; builder and answerable-question check.');
}finally{dom.window.close()}

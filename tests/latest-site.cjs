const {JSDOM,VirtualConsole}=require(process.env.SAMGUKJI_JSDOM_PATH||'jsdom');
const fs=require('node:fs'),assert=require('node:assert/strict');
const errors=[];const consoleProxy=new VirtualConsole();consoleProxy.on('jsdomError',e=>errors.push(e));
const dom=new JSDOM(fs.readFileSync('dist/index.html','utf8'),{url:'https://example.test/',runScripts:'dangerously',pretendToBeVisual:true,virtualConsole:consoleProxy,beforeParse(w){w.matchMedia=()=>({matches:true});w.scrollTo=()=>{};w.HTMLCanvasElement.prototype.getContext=()=>null;w.localStorage.setItem('redcliff-v8',JSON.stringify({done:{},t:{},rule:{min:2,dead:1},w:{ship:3,fire:3,plan:2},seenIntro:1}))}});
const w=dom.window,d=w.document,e=s=>w.eval(s),click=s=>{const el=d.querySelector(s);assert.ok(el,s);el.click()},route=s=>e(`location.hash=${JSON.stringify('#'+s)};route()`),answer=()=>click('#vbox .opt[data-i="'+d.querySelector('#vbox').dataset.ok+'"]');
try{
 assert.equal(errors.length,0,errors.map(e=>e.message).join('\n'));
 assert.equal(d.documentElement.lang,'ko');assert.ok(d.querySelector('meta[name="viewport"]'));assert.equal(d.querySelectorAll('style').length,8);assert.equal(d.querySelectorAll('#navE a').length,6);
 assert.equal(e('DB.length'),63);assert.equal(e('EDGES.length'),1340);assert.equal(e('roster().length'),42);
 assert.deepEqual(JSON.parse(e('JSON.stringify(FS.map(f=>roster().filter(n=>PP[n].f===f).length))')),[15,20,7]);
 assert.equal(e('fs("yy").wu+fs("yy").shu'),1255);assert.equal(e('fs("yy").wei'),467);
 // Exercise the actual pager links, including the reported stage 5 → stage 6 path.
 route('s1');
 for(let i=1;i<6;i++){
  const next=d.querySelector('#main>.pager a:last-child');assert.equal(next.getAttribute('href'),'#s'+(i+1));
  assert.ok(next.textContent.includes('다음 순서'));
  const event=new w.MouseEvent('click',{bubbles:true,cancelable:true,button:0});
  assert.equal(next.dispatchEvent(event),false,'internal stage link prevents a full-document navigation');
  assert.equal(w.location.hash,'#s'+(i+1));assert.equal(e('cur'),i+1);assert.equal(d.querySelector('.experiment-opening'),null,'next step must not render the home question');
  assert.equal(d.querySelector('.stepper [aria-current="page"]').getAttribute('href'),'#s'+(i+1));
 }
 assert.ok(d.querySelector('#move6'),'stage 6 has the experiment controls');
 click('#main>.pager a:first-child');assert.equal(w.location.hash,'#s5');assert.ok(d.querySelector('#open5'));
 click('.stepper a[href="#s6"]');assert.equal(w.location.hash,'#s6');assert.ok(d.querySelector('#move6'));
 // Opening questions use the same medium-intensity treatment.
 route('home');const homeHeat=d.documentElement.style.getPropertyValue('--heat');
 assert.equal(d.querySelector('[data-intro].experiment-replay').textContent,'서막 다시 보기');
 route('lab?question=zy');assert.equal(d.documentElement.style.getPropertyValue('--heat'),homeHeat);assert.ok(d.querySelector('.experiment-opening>.cinema-bg'));
 assert.equal(d.querySelector('#main h1').textContent,'만약 주유가 조조 편이었다면?');assert.equal(w.location.hash,'#home','a question opens on the shared home screen');
 route('lab?question=zg');assert.equal(e('S.scenario'),'zg');

 route('s1');answer();assert.equal(e('Object.keys(S.done).length'),0,'unfinished activity must reject keyboard/programmatic activation');for(const [n,v] of [['曹操',1],['許褚',1],['夏侯淵',0],['袁紹',0]])click(`.pcard[data-n="${n}"] .pick button[data-v="${v}"]`);assert.equal(e('JSON.stringify(S.rule)'),JSON.stringify({min:2,dead:1}));assert.equal(e('roster().length'),42);answer();assert.ok(e('!!S.done[1]'));
 route('s2');answer();assert.ok(!e('!!S.done[2]'));click('#dropTop');assert.ok(d.querySelector('#dropRes').textContent.includes('22.9'));assert.ok(d.querySelector('#dropRes').textContent.includes('11.7'));answer();assert.ok(e('!!S.done[2]'));
 route('s3');assert.ok(d.querySelector('#score3').textContent.includes('1,255')||d.querySelector('#score3').textContent.includes('1255'));click('#fixW');answer();assert.ok(e('!!S.done[3]'));
 route('s4');click('#friends button[data-i="0"]');click('#runAll');assert.ok(d.querySelector('#allRes').textContent.includes('215'));answer();assert.ok(e('!!S.done[4]'));
 route('s5');click('#open5');assert.ok(d.querySelector('#main blockquote'));click('#ask5 button[data-v="2"]');assert.ok(d.querySelector('#askfb5').textContent.startsWith('맞습니다.'));answer();assert.ok(e('!!S.done[5]'));
 route('s6');answer();assert.ok(!e('!!S.done[6]'));click('#move6');assert.ok(d.querySelector('#mv6 .big-change').textContent.includes('83')&&d.querySelector('#mv6 .big-change').textContent.includes('72'));click('#wind6 button[data-v="zg"]');click('#wind6 button[data-v="env"]');assert.ok(d.querySelector('#s6name').textContent.includes('52'));answer();assert.ok(e('!!S.done[6]'),'core lesson must finish without switching to historical data');
 assert.equal(e('Object.keys(S.done).length'),6);assert.ok(d.querySelector('#progTxt').textContent.includes('6 / 6'));
 route('src');assert.ok(d.querySelector('#main h1'),'data page still renders');assert.ok(!d.querySelector('#main').textContent.includes('이 사이트의 데이터와 계산'),'the build-info block is gone');
 route('home');assert.ok(d.querySelector('#reset'));assert.equal(errors.length,0,errors.map(e=>e.message).join('\n'));
 assert.ok(!d.querySelector('#main').textContent.includes('할 수 있을까?'));
 assert.ok(d.querySelector('#main').textContent.includes('조조의 편이었다면?'));
 for(const id of ['s1','s2','s3','s4','s5','s6','src']){route(id);const clone=d.querySelector('#main').cloneNode(true);clone.querySelectorAll('.evq,.excerpt').forEach(n=>n.remove());const text=clone.textContent;assert.ok(!/(?:정해요는|해요다|기댄다|주마|보아라|돌려 보기|소설이 키운 쪽)/.test(text),id);}
 route('s1');assert.ok(d.querySelector('#main').textContent.includes('명단에 올릴 인물'));assert.equal(d.querySelector('.subtitle'),null);
 route('compare');assert.ok(d.querySelector('#source-reading-result').textContent.includes('사건의 사실 여부를 판단할 수는 없습니다.'));assert.equal(d.querySelectorAll('#source-counts tr').length,e('roster().length')*2);click('#compare-scope [data-v="all"]');assert.ok(d.querySelector('#source-shares').textContent.includes('주석'));assert.equal(e('Object.keys(S.done).length'),6);
 console.log('PASS latest app: 63 persons, 1340 edges, 42-person roster, scores 1255/467, YY sensitivity 215/215, simulator 83→72 and wind assumption 52, six hands-on activities without a historical-source gate, optional source comparison, completion gate, saved progress and source view.');
}finally{dom.window.close()}

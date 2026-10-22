const {JSDOM,VirtualConsole}=require(process.env.SAMGUKJI_JSDOM_PATH||'jsdom');
const fs=require('node:fs'),assert=require('node:assert/strict');
const errors=[];const consoleProxy=new VirtualConsole();consoleProxy.on('jsdomError',e=>errors.push(e));
const dom=new JSDOM(fs.readFileSync('dist/index.html','utf8'),{url:'https://example.test/',runScripts:'dangerously',pretendToBeVisual:true,virtualConsole:consoleProxy,beforeParse(w){w.matchMedia=()=>({matches:true});w.scrollTo=()=>{};w.HTMLCanvasElement.prototype.getContext=()=>null;w.localStorage.setItem('redcliff-v8',JSON.stringify({done:{},t:{},rule:{min:2,dead:1},w:{ship:3,fire:3,plan:2},seenIntro:1}))}});
const w=dom.window,d=w.document,e=s=>w.eval(s),click=s=>{const el=d.querySelector(s);assert.ok(el,s);el.click()},route=s=>e(`location.hash=${JSON.stringify('#'+s)};route()`),answer=()=>click('#vbox .opt[data-i="1"]');
try{
 assert.equal(errors.length,0,errors.map(e=>e.message).join('\n'));
 assert.equal(d.documentElement.lang,'ko');assert.ok(d.querySelector('meta[name="viewport"]'));assert.equal(d.querySelectorAll('style').length,5);assert.equal(d.querySelectorAll('#navE a').length,6);
 assert.equal(e('DB.length'),63);assert.equal(e('EDGES.length'),1340);assert.equal(e('roster().length'),42);
 assert.deepEqual(JSON.parse(e('JSON.stringify(FS.map(f=>roster().filter(n=>PP[n].f===f).length))')),[15,20,7]);
 assert.equal(e('fs("yy").wu+fs("yy").shu'),1255);assert.equal(e('fs("yy").wei'),467);
 route('s1');answer();assert.equal(e('Object.keys(S.done).length'),0,'unfinished activity must reject keyboard/programmatic activation');click('#more');click('#rMin [data-v="2"]');click('#rDead [data-v="1"]');answer();assert.ok(e('!!S.done[1]'));
 route('s2');click('#st [data-v="mean"]');click('#st [data-v="med"]');const drop=d.querySelector('#drop');drop.checked=true;drop.dispatchEvent(new w.Event('change'));answer();assert.ok(e('!!S.done[2]'));
 route('s3');click('#wts [data-w="ship"][data-d="1"]');click('#wts [data-w="ship"][data-d="-1"]');click('#ek [data-v="fire"]');answer();assert.ok(e('!!S.done[3]'));
 route('s4');click('#run');assert.ok(d.querySelector('#sweep').textContent.includes('215'));assert.equal(d.querySelector('#lens4'),null);click('#agg4 [data-v="cap"]');click('#run');assert.ok(d.querySelector('#sweep').textContent.includes('215'));assert.equal(e('S.t.s4x.lens'),'yy');answer();assert.ok(e('!!S.done[4]'));
 route('s5');click('#openv');assert.ok(d.querySelector('#vict blockquote'));assert.equal(d.querySelector('#lay5'),null);answer();assert.ok(e('!!S.done[5]'));
 route('s6');assert.equal(d.querySelector('#idx').textContent,'72');click('#rec6');click('#wind [data-v="0"]');click('#rec6');click('#wmode [data-v="zg"]');answer();assert.ok(e('!!S.done[6]'),'core lesson must finish without switching to historical data');assert.equal(e('S.t.s6x.lens'),'yy');d.querySelector('#source-extension').open=true;click('#lens6 [data-v="jb"]');click('#wmode [data-v="zg"]');click('#wind [data-v="1"]');assert.equal(d.querySelector('#idx').textContent,'56');answer();assert.ok(e('!!S.done[6]'));
 assert.equal(e('Object.keys(S.done).length'),6);assert.ok(d.querySelector('#progTxt').textContent.includes('6 / 6'));
 route('src');assert.ok(d.querySelector('#main').textContent.includes('5113da1'));assert.ok(d.querySelector('#main').textContent.includes('실시간 FastAPI 연결은 사용하지 않습니다'));
 route('home');assert.ok(d.querySelector('#reset'));assert.equal(errors.length,0,errors.map(e=>e.message).join('\n'));
 assert.ok(!d.querySelector('#main').textContent.includes('할 수 있을까?'));
 assert.ok(d.querySelector('#main').textContent.includes('조조의 편이었다면?'));
 for(const id of ['s1','s2','s3','s4','s5','s6','src']){route(id);const clone=d.querySelector('#main').cloneNode(true);clone.querySelectorAll('.evq,.excerpt').forEach(n=>n.remove());const text=clone.textContent;assert.ok(!/(?:정해요는|해요다|기댄다|주마|보아라|돌려 보기|소설이 키운 쪽)/.test(text),id);}
 route('s1');assert.ok(d.querySelector('#main').textContent.includes('분석 대상'));assert.equal(d.querySelector('.subtitle'),null);
 route('compare');assert.ok(d.querySelector('#source-reading-result').textContent.includes('사건의 사실 여부를 판단할 수는 없습니다.'));assert.equal(d.querySelectorAll('#source-counts tr').length,e('roster().length')*2);click('#compare-scope [data-v="all"]');assert.ok(d.querySelector('#source-shares').textContent.includes('주석'));assert.equal(e('Object.keys(S.done).length'),6);
 route('s6');assert.ok(d.querySelector('#main').textContent.includes('학습용 계산값'));
 console.log('PASS latest app: 63 persons, 1340 edges, 42-person roster, scores 1255/467, YY sensitivity 215 with both aggregations, simulator 72 and 56, six activities without a historical-source gate, optional source comparison, completion gate, saved progress and source view.');
}finally{dom.window.close()}

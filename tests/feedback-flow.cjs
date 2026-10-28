const {JSDOM,VirtualConsole}=require(process.env.SAMGUKJI_JSDOM_PATH||'jsdom');
const fs=require('node:fs'),assert=require('node:assert/strict');
const errors=[];const vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
const dom=new JSDOM(fs.readFileSync('dist/index.html','utf8'),{url:'https://example.test/',runScripts:'dangerously',pretendToBeVisual:true,virtualConsole:vc,beforeParse(w){w.matchMedia=()=>({matches:true});w.scrollTo=()=>{};w.HTMLCanvasElement.prototype.getContext=()=>null;w.localStorage.setItem('redcliff-v8',JSON.stringify({done:{},t:{},rule:{min:2,dead:1},w:{ship:3,fire:3,plan:2},seenIntro:1}))}});
const w=dom.window,d=w.document,q=s=>d.querySelector(s),e=s=>w.eval(s),route=id=>e(`location.hash='#${id}';route()`),click=s=>{assert.ok(q(s),s);q(s).click()};
const answer=()=>click('#vbox .opt[data-i="'+d.querySelector('#vbox').dataset.ok+'"]');
try{
 assert.equal(errors.length,0,errors.join('\n'));
 // 화면 이동과 홈 전용 상태: 홈에서만 사이드바를 숨긴다
 const home=()=>d.body.classList.contains('experiment-home');
 route('home');assert.equal(home(),true,'home hides the sidebar');route('src');assert.equal(home(),false,'home -> src shows the sidebar');
 route('home');route('lab');assert.equal(home(),false,'home -> lab');route('src');assert.equal(home(),false,'lab -> src');
 route('s1');assert.equal(home(),false);route('home');assert.equal(home(),true);
 e('location.hash="#lab?question=zy";route()');assert.equal(home(),true,'starting a lab question lands on its home');e('setScenario("zg")');route('home');
 // 이름 기준: 시작(메인 화면) · 서막(오프닝 연출)
 assert.equal(q('#anH').textContent,'시작');assert.equal(q('#tabH').textContent,'시작');assert.equal(q('[data-intro]').textContent.trim().length>0,true);
 // 완료 수 막대: 전용 클래스를 쓰고(.bar 그리드와 충돌 금지) 폭이 완료 수에 비례한다
 assert.equal(q('#progBar').parentElement.className,'prog-bar');
 e('S.done={};drawChrome()');assert.equal(q('#progTxt').textContent,'완료 0 / 6');assert.equal(q('#progBar').style.width,'0%');
 e('S.done={1:"x",2:"x",3:"x"};drawChrome()');assert.equal(q('#progTxt').textContent,'완료 3 / 6');assert.equal(q('#progBar').style.width,'50%');
 e('S.done={1:"x",2:"x",3:"x",4:"x",5:"x",6:"x"};drawChrome()');assert.equal(q('#progBar').style.width,'100%');e('S.done={};drawChrome()');
 // 가정 실험 탭: 질문을 고르는 화면이므로 순서·진행을 숨기고, 카드에 완료 상태를 글과 색으로 보여 준다
 route('lab');assert.equal(d.body.classList.contains('view-lab'),true);route('src');assert.equal(d.body.classList.contains('view-src'),true,'reference page also hides the steps');assert.equal(d.body.classList.contains('view-lab'),false);route('s1');assert.equal(d.body.classList.contains('view-lab')||d.body.classList.contains('view-src'),false);
 assert.ok(q('#progQ').textContent.length>3,'sidebar names the question being worked on');
 e('S.done={1:"x",2:"x",3:"x",4:"x",5:"x"};save()');route('lab');
 const zgCard=q('.wi-card[data-id="zg"]');assert.ok(zgCard.textContent.includes('5/6 완료'),zgCard.textContent);assert.ok(zgCard.querySelector('.wi-prog b').style.width.startsWith('83'));assert.ok(!zgCard.classList.contains('finished'));
 assert.ok(q('.lab-count').textContent.includes('완료 0 / 9')&&q('.lab-count').textContent.includes('진행 중 1'),q('.lab-count').textContent);
 e('S.done={1:"x",2:"x",3:"x",4:"x",5:"x",6:"x"};save()');route('lab');
 assert.ok(q('.wi-card[data-id="zg"]').classList.contains('finished'));assert.ok(q('.wi-card[data-id="zg"]').textContent.includes('완료'));assert.ok(q('.lab-count').textContent.includes('완료 1 / 9'),q('.lab-count').textContent);assert.ok(!q('.lab-count').textContent.includes('진행 중'));
 e('S.done={};save()');route('s1');
 // 사이드바 그룹 이름
 route('s1');assert.ok([...d.querySelectorAll('.navgrp p')].map(p=>p.textContent).includes('순서'));assert.ok(![...d.querySelectorAll('.navgrp p')].some(p=>p.textContent.includes('여섯')));
 // 1단계 카드: 처음부터 맞게 골라도 "맞습니다."가 나온다
 const pick=(n,v)=>{click(`.pcard[data-n="${n}"] .pick button[data-v="${v}"]`);return q(`.pcard[data-n="${n}"] .pcard-tip`).textContent};
 assert.ok(pick('曹操',1).startsWith('맞습니다.'),'core included');assert.ok(pick('許褚',1).startsWith('맞습니다.'));assert.ok(pick('許褚',0).startsWith('맞습니다.'));
 assert.ok(pick('夏侯淵',0).startsWith('맞습니다.'));assert.ok(pick('袁紹',0).startsWith('맞습니다.'));assert.ok(pick('袁紹',1).startsWith('다시 생각해 보시지요.'));
 // 학습 확인: 정답을 고른 뒤에도 다른 보기를 눌러 볼 수 있다
 route('s2');e('TASKS.length=0');
 const ok=q('#vbox').dataset.ok,wrong=[...d.querySelectorAll('#vbox .opt')].find(o=>o.dataset.i!==ok);
 click(`#vbox .opt[data-i="${ok}"]`);assert.ok(q('#vbox .fbx').textContent.startsWith('맞습니다.'));assert.ok(e('!!S.done[2]'));
 assert.ok([...d.querySelectorAll('#vbox .opt')].every(o=>!o.disabled),'options stay clickable after the right answer');
 wrong.click();assert.ok(q('#vbox .fbx').textContent.startsWith('다시 생각해 보시지요.'));assert.ok(e('!!S.done[2]'),'record kept');assert.ok(q(`#vbox .opt[data-i="${ok}"]`).classList.contains('right'));
 click(`#vbox .opt[data-i="${ok}"]`);assert.ok(q('#vbox .fbx').textContent.startsWith('맞습니다.'));
 // 2단계: 질문의 답을 짧게 적어 준다
 assert.ok(/촉 .*문단.*가장 높습니다/.test(q('#avgNote').textContent),q('#avgNote').textContent);assert.ok(/문단에 나오고, 나머지 촉 사람들은 평균/.test(q('#shuNote').textContent));
 // 4단계: 미리 보기와 전체 계산을 구분한다
 route('s4');assert.ok([...d.querySelectorAll('#friends button')].every(b=>b.textContent==='계산해 보기'));assert.ok(q('#main').textContent.includes('모든 규칙은 다음 활동에서 한꺼번에 계산합니다'));
 // 6단계: 옮기기 전에는 바람 질문이 보이지 않는다
 route('s6');assert.equal(w.getComputedStyle(q('#wind6sec')).display,'none','wind question hidden before the move');
 click('#move6');assert.equal(q('#wind6sec').hidden,false);assert.ok(q('#wind6sec').textContent.includes('소설에서 동남풍을 불러온 사람은 제갈량입니다'));
 assert.equal(errors.length,0,errors.join('\n'));
 // 화면 점검에서 찾은 문제의 회귀 방지
 // 1) hidden 속성은 버튼 스타일보다 우선한다 (눌러서 숨긴 버튼이 계속 보이던 문제)
 e('S.done={};S.t={};save()');
 route('s2');click('#dropTop');assert.equal(w.getComputedStyle(q('#dropTop')).display,'none','2장: used button is hidden');
 route('s5');click('#open5');assert.equal(w.getComputedStyle(q('#open5')).display,'none','5장: used button is hidden');
 route('s6');click('#move6');assert.equal(w.getComputedStyle(q('#move6')).display,'none','6장: used button is hidden');
 // 2) 1장 카드: 맞는 선택은 right(초록), 다시 생각은 doubt(주황), 선택 자체는 중립
 e('S.done={};S.t={};save()');route('s1');
 const cardOf=n=>q(`.pcard[data-n="${n}"]`);
 click('.pcard[data-n="夏侯淵"] .pick button[data-v="0"]');assert.ok(cardOf('夏侯淵').classList.contains('right')&&!cardOf('夏侯淵').classList.contains('doubt'));
 click('.pcard[data-n="袁紹"] .pick button[data-v="1"]');assert.ok(cardOf('袁紹').classList.contains('doubt')&&!cardOf('袁紹').classList.contains('right'));
 click('.pcard[data-n="袁紹"] .pick button[data-v="0"]');assert.ok(cardOf('袁紹').classList.contains('right')&&!cardOf('袁紹').classList.contains('doubt'),'switching to the right answer clears the doubt state');
 // 3) 번호는 "1장" 글자, 숫자만 단독으로 쓰지 않는다
 e('S.done={1:"x",2:"x",3:"x",4:"x",5:"x",6:"x"};save()');route('home');
 assert.deepEqual([...d.querySelectorAll('.sum-n')].map(n=>n.textContent),['1장','2장','3장','4장','5장','6장']);
 assert.ok(q('#nbCountTop').textContent.startsWith('완료 '),q('#nbCountTop').textContent);
 // 4) 단계 헤더의 설명은 120자까지 접지 않는다 (6장 연결 문장)
 e('S.done={};S.t={};save()');route('s6');assert.ok(q('#wind6sec').textContent.includes('소설에서 동남풍을 불러온 사람은 제갈량입니다'));assert.equal(q('#wind6sec .step-more'),null,'bridge sentence is not folded');
 e('S.done={};S.t={};save()');route('home');
 console.log('PASS feedback flow: first-try correct picks say 맞습니다, answered quizzes stay clickable, stage notes, preview vs full run, wind question after the move');
}finally{dom.window.close()}

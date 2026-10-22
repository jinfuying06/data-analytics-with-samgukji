import {readFileSync,writeFileSync,mkdirSync,rmSync,cpSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
const run=(command,args)=>{const r=spawnSync(command,args,{stdio:'inherit'});if(r.status!==0)process.exit(r.status??1)};
run('python',['scripts/build_red_cliff_lab_data.py']);
const base='prototype/red-cliff-lab/src/';
const copy=JSON.parse(readFileSync('scripts/site-copy.json','utf8'));
const escaped=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const matcher=new RegExp(Object.keys(copy).sort((a,b)=>b.length-a.length).map(escaped).join('|'),'g');
const polish=s=>s.replace(matcher,match=>copy[match]);
let head=readFileSync(base+'00-head.html','utf8');
const svgAt=head.indexOf('\n<svg');const symbols=head.slice(svgAt);head=head.slice(0,svgAt).replace(/<meta name="claude:viewport-fit-sides"[^>]*>/,'');
head+=readFileSync(base+'10-styles-course.html','utf8')+readFileSync(base+'11-styles-stages.html','utf8')+readFileSync(base+'12-styles-journey.html','utf8');
const markup=polish(readFileSync(base+'20-markup.html','utf8'));
let app=polish(readFileSync(base+'40-app.js','utf8'));
// Opening the root URL always starts with the experiment question; explicit stage links still resume.
app=app.replace('if(i<0)i=S.last??0','if(i<0)i=0');
// Questions in the scene are editorial prompts, not quotations from historical sources.
app=app.replace('${say[0]}</figcaption>', '${say[0]} · 학습용 질문</figcaption>');
// Enforce the existing activity gate for keyboard and programmatic activation too.
app=app.replace('if(!b||b.disabled)return;show(+b.dataset.i)','if(!b||b.disabled||!TASKS.every(([m,k])=>tk(m,k)))return;show(+b.dataset.i)');
// Recording the same assumptions twice does not complete a comparison activity.
app=app.replace('if(L.runs.length>=2)setT("s6","run")','if(new Set(L.runs.map(x=>x.t+"|"+x.lens+"|"+x.wd)).size>=2)setT("s6","run")');
const sourceInfo=`<section class="card pane"><h2>이 사이트의 데이터와 계산</h2><p>공개 SQLite에서 추출한 기록을 사용해 브라우저에서 계산합니다. 실시간 FastAPI 연결은 사용하지 않습니다. 비교 점수와 바람 보너스는 학습용 규칙이며 실제 능력이나 역사적 승률을 나타내지 않습니다. 촉 표시는 유비 세력을 구분하기 위한 분류입니다. 화공 효과와 배의 수는 지수에 따른 장식 연출이며 실제 피해 규모를 나타내지 않습니다.</p><p><a href="https://github.com/jinfuying06/data-analytics-with-samgukji/tree/5113da1b85b0492f131507f6f9fc17bf8aeb1962" target="_blank" rel="noreferrer">기준 코드 5113da1 확인 ↗</a></p></section>`;
const scripts=[readFileSync(base+'30-data.js','utf8'),app,readFileSync(base+'70-learning-journey.js','utf8'),readFileSync(base+'50-fx.js','utf8'),readFileSync(base+'60-intro.js','utf8'),`RENDER[7]=()=>{lib();document.querySelector('#main').insertAdjacentHTML('beforeend',${JSON.stringify(sourceInfo)})};\nroute();intro();`].join('\n');
const html=`<!doctype html>\n<html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><meta name="description" content="삼국지연의의 기록으로 배우는 데이터 분석: 명단, 평균, 지표, 민감도, 출처 검증, What-if 실험.">${head}</head><body>${symbols}${markup}<script>${scripts}</script></body></html>`;
rmSync('dist',{recursive:true,force:true});mkdirSync('dist',{recursive:true});writeFileSync('dist/index.html',html);
cpSync('frontend/public/sprites/factions','dist/sprites/factions',{recursive:true});
console.log('Built latest GitHub six-stage app from 5113da1, with polite UI copy and preserved source calculations.');

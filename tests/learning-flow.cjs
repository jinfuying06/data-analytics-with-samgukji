// Exercise the actual component's state transitions without a browser or DOM.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const ts=require('../frontend/node_modules/typescript');
let state=[],cursor=0,route='';const session=new Map();
const hookReact={useState(initial){const i=cursor++;if(!(i in state))state[i]=initial;return [state[i],value=>{state[i]=typeof value==='function'?value(state[i]):value}]},useRef(){cursor++;return {current:null}},useEffect(){}};
const jsx=(type,props)=>({type,props:props||{}});
const cache={};
function load(file){if(cache[file])return cache[file];const exports={};cache[file]=exports;
 const source=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
 const req=name=>{if(name==='react')return hookReact;if(name==='react/jsx-runtime')return {jsx,jsxs:jsx};if(name==='next/link')return {__esModule:true,default:'a'};if(name==='next/navigation')return {useRouter:()=>({push:path=>{route=path}})};if(name.endsWith('.css'))return {};if(name.endsWith('.json'))return JSON.parse(fs.readFileSync('frontend/lib/seed-snapshot.json','utf8'));return load('frontend/lib/'+name.split('/').at(-1)+'.ts')};
 vm.runInNewContext(source,{exports,require:req,process:{env:{NEXT_PUBLIC_STATIC_PROTOTYPE:'1'}},sessionStorage:{setItem:(k,v)=>session.set(k,v)},setTimeout:fn=>fn(),console});return exports;
}
const Journey=load('frontend/components/learning/LearningJourney.tsx').default;
function render(home=false){cursor=0;return Journey({home})}
function all(node){if(!node||typeof node!=='object')return [];return [node,...(Array.isArray(node.props?.children)?node.props.children:[node.props?.children]).flat(Infinity).flatMap(all)]}
function text(node){if(node==null||typeof node==='boolean')return '';if(typeof node!=='object')return String(node);return (Array.isArray(node.props?.children)?node.props.children:[node.props?.children]).flat(Infinity).map(text).join('')}
function button(tree,label){const result=all(tree).find(n=>n.type==='button'&&text(n).includes(label));assert.ok(result,`button: ${label}`);return result}
function click(tree,label){const b=button(tree,label);assert.ok(!b.props.disabled,`enabled: ${label}`);return b.props.onClick()}
(async()=>{
 let tree=render(true);assert.equal(button(tree,'이야기에서 답 찾으러 가기').props.disabled,true);
 click(tree,'조조');tree=render(true);click(tree,'이야기에서 답 찾으러 가기');assert.equal(route,'/learn/');assert.equal(session.get('samgukji-child-guess'),'曹操');
 state=[];tree=render();assert.equal(button(tree,'실제 기록도 세어 보자').props.disabled,true);
 for(const name of ['조조','제갈량','손권','주유']){click(tree,name);tree=render()}
 click(tree,'내가 만든 표 확인하기');tree=render();assert.equal(button(tree,'실제 기록도 세어 보자').props.disabled,true);
 click(tree,'주유');tree=render();click(tree,'내가 만든 표 확인하기');tree=render();assert.equal(button(tree,'실제 기록도 세어 보자').props.disabled,false);
 click(tree,'실제 기록도 세어 보자');tree=render();assert.equal(button(tree,'이 숫자는 무슨 뜻일까?').props.disabled,true);
 await click(tree,'몇 편에 나오는지 세어 보기');tree=render();assert.ok(text(tree).includes('8편 중 8편'));assert.equal(button(tree,'이 숫자는 무슨 뜻일까?').props.disabled,false);
 const bars=all(tree).filter(n=>n.type==='button'&&n.props['aria-label']?.includes('편. 기록 보기'));assert.equal(bars.length,6);assert.ok(bars[0].props['aria-label'].includes('조조, 8편'));
 click(tree,'숫자 표');tree=render();assert.ok(all(tree).some(n=>n.type==='table'&&text(n).includes('조조8편')));
 const selects=all(tree).filter(n=>n.type==='select');selects[0].props.onChange({target:{value:'50'}});tree=render();assert.equal(button(tree,'이 숫자는 무슨 뜻일까?').props.disabled,true);
 all(tree).filter(n=>n.type==='select')[1].props.onChange({target:{value:'43'}});tree=render();await click(tree,'몇 편에 나오는지 세어 보기');tree=render();assert.ok(text(tree).includes('범위를 다시 골라주세요'));
 all(tree).filter(n=>n.type==='select')[0].props.onChange({target:{value:'43'}});tree=render();all(tree).filter(n=>n.type==='select')[1].props.onChange({target:{value:'50'}});tree=render();await click(tree,'몇 편에 나오는지 세어 보기');tree=render();
 click(tree,'이 숫자는 무슨 뜻일까?');tree=render();assert.equal(button(tree,'오늘의 발견 정리하기').props.disabled,true);
 click(tree,'싸움도 가장 잘했을 거야');tree=render();assert.equal(button(tree,'오늘의 발견 정리하기').props.disabled,true);
 click(tree,'알 수 없어');tree=render();click(tree,'오늘의 발견 정리하기');tree=render();assert.ok(text(tree).includes('너도 첫 데이터 분석을 해냈어'));assert.ok(text(tree).includes('다른 책에도 쓸 수 있어요'));assert.ok(all(tree).some(n=>n.props?.href==='/simulation/'));
 console.log('PASS learning flow: prediction, practice correction, real counts, chart/table, stale/invalid filters, interpretation gating, completion and optional experiment');
})().catch(e=>{console.error(e);process.exitCode=1});

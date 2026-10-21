const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const ts=require('../frontend/node_modules/typescript');
function load(name){let exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(`frontend/lib/${name}.ts`,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports});return exports;}
const {simulate,baseline}=load('simulation');const base=simulate(baseline);
assert.deepEqual(JSON.parse(JSON.stringify(base)),{fire:90,fleetLoss:86,retreat:78,allied:87,outcome:'연합군의 대승'});
const outcomes=new Set();let count=0;
for(const surrender of [true,false])for(const wind of [true,false])for(const defense of [0,1,2]){const input={surrender,wind,defense},a=simulate(input),b=simulate(input);assert.equal(JSON.stringify(a),JSON.stringify(b));for(const key of ['fire','fleetLoss','retreat','allied'])assert.ok(a[key]>=0&&a[key]<=100);outcomes.add(a.outcome);count++}
assert.equal(outcomes.size,4);
const {aggregateRows}=load('analytics'),seed=require('../frontend/lib/seed-snapshot.json');
const results=[];for(let start=43;start<=50;start++)for(let end=start;end<=50;end++)results.push({start,end,results:aggregateRows(seed.rows,start,end)});
fs.mkdirSync('.test-results',{recursive:true});
fs.writeFileSync('.test-results/analytics-results.json',JSON.stringify(results));
assert.equal(aggregateRows([],43,50).length,0);
assert.equal(aggregateRows([{name:'A',chapter:43},{name:'A',chapter:43}],43,50)[0].chapter_count,1);
console.log(`PASS model baseline, ${count} deterministic combinations, 4 outcomes; 36 analytics ranges exported`);
const {checkPractice}=load('lesson');
const names=['曹操','諸葛亮','孫權','周瑜'];
for(let mask=0;mask<16;mask++){
 const marked=names.filter((_,i)=>mask&(1<<i));
 assert.equal(checkPractice(marked),mask===7,'Only the three names in the story can complete the exercise');
}
console.log('PASS 16 practice answer combinations; unrelated names and missing marks cannot complete the activity');

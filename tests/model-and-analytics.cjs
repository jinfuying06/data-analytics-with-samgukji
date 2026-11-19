const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const ts=require('../frontend/node_modules/typescript');
function load(name){let exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(`frontend/lib/${name}.ts`,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports});return exports;}
const {aggregateRows}=load('analytics'),seed=require('../frontend/lib/seed-snapshot.json');
const results=[];for(let start=43;start<=50;start++)for(let end=start;end<=50;end++)results.push({start,end,results:aggregateRows(seed.rows,start,end)});
fs.mkdirSync('.test-results',{recursive:true});
fs.writeFileSync('.test-results/analytics-results.json',JSON.stringify(results));
assert.equal(aggregateRows([],43,50).length,0);
assert.equal(aggregateRows([{name:'A',chapter:43},{name:'A',chapter:43}],43,50)[0].chapter_count,1);
console.log("PASS 36 analytics ranges exported");

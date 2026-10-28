import {readFileSync,writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
const result=spawnSync(process.execPath,['scripts/build-imported-site.mjs'],{stdio:'inherit'});
if(result.status!==0)process.exit(result.status??1);
const flags=Object.fromEntries(['wei','wu','shu'].map(faction=>[faction,Object.fromEntries(['gif','png'].map(extension=>{
 const bytes=readFileSync(`frontend/public/sprites/factions/${faction}-flag.${extension}`);
 return [extension,`data:image/${extension};base64,${bytes.toString('base64')}`];
}))]));
const portrait=readFileSync('frontend/public/images/zhuge-liang-pixel-icon.png');
let html=readFileSync('dist/index.html','utf8');
// dist는 GitHub Pages용 상대 경로(sprites/…, images/…)를 쓴다. 예전 절대 경로도 함께 처리한다.
for(const extension of ['gif','png'])html=html.replaceAll(new RegExp('/?sprites/factions/\\$\\{f\\}-flag\\.'+extension,'g'),()=>'${STANDALONE_FLAGS[f].'+extension+'}');
html=html.replace(/\/?images\/zhuge-liang-pixel-icon\.png/,()=>`data:image/png;base64,${portrait.toString('base64')}`);
html=html.replace('<script>','<script>const STANDALONE_FLAGS='+JSON.stringify(flags)+';\n');
writeFileSync('prototype/red-cliff-lab/index.html',html);
console.log('Built standalone index.html with existing faction flags embedded.');

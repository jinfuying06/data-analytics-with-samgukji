import {spawnSync} from 'node:child_process';
import {cpSync,mkdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const memoryShim=fileURLToPath(new URL('./restricted-memory.cjs',import.meta.url));
process.env.NODE_OPTIONS=[process.env.NODE_OPTIONS,`--require ${memoryShim}`].filter(Boolean).join(' ');
const run=(cmd,args,cwd='.')=>{const p=spawnSync(cmd,args,{cwd,stdio:'inherit',env:{...process.env,STATIC_PROTOTYPE:'1',NEXT_PUBLIC_STATIC_PROTOTYPE:'1'}});if(p.status!==0)process.exit(p.status??1)};
run('python',['scripts/export_prototype_data.py']);
run('npm',['run','build','--','--webpack'],'frontend');
mkdirSync('dist',{recursive:true});cpSync('frontend/out','dist',{recursive:true});

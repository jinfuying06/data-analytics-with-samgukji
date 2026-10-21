export function aggregateRows(rows: {name:string; chapter:number}[], start:number, end:number) {
 const groups=new Map<string,Set<number>>();
 for(const r of rows.filter(r=>r.chapter>=start&&r.chapter<=end)){
  if(!groups.has(r.name))groups.set(r.name,new Set());
  groups.get(r.name)!.add(r.chapter);
 }
 return Array.from(groups,([name,chapters])=>({name,chapter_count:chapters.size}))
 .sort((a,b)=>b.chapter_count-a.chapter_count||(a.name<b.name?-1:a.name>b.name?1:0));
}

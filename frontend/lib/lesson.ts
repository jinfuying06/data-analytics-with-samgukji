export const people = [
 {name:'曹操',ko:'조조',initial:'조',color:'red',intro:'많은 군사를 이끌고 남쪽으로 내려온 인물'},
 {name:'劉備',ko:'유비',initial:'유',color:'green',intro:'조조에게 맞서기 위해 힘을 모으려는 인물'},
 {name:'諸葛亮',ko:'제갈량',initial:'제',color:'gold',intro:'유비를 돕고, 손권에게 함께 싸우자고 설득한 인물'},
];
export const koreanNames:Record<string,string>={曹操:'조조',劉備:'유비',諸葛亮:'제갈량',孫權:'손권',周瑜:'주유',魯肅:'노숙',黃蓋:'황개',甘寧:'감녕',袁紹:'원소',韓當:'한당',周泰:'주태',太史慈:'태사자',關羽:'관우',張飛:'장비',趙雲:'조운',程普:'정보',張遼:'장료',龐統:'방통',蔣幹:'장간',張昭:'장소',闞澤:'감택'};
export const displayName=(name:string)=>koreanNames[name]||name;
export const practicePeople=[{name:'曹操',ko:'조조'},{name:'諸葛亮',ko:'제갈량'},{name:'孫權',ko:'손권'},{name:'周瑜',ko:'주유'}];
export const practiceAnswer=['曹操','諸葛亮','孫權'];
export function checkPractice(marked:string[]){return marked.length===practiceAnswer.length&&practiceAnswer.every(n=>marked.includes(n));}

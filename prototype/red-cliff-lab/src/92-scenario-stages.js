/* ===== Stages 1–5 follow the question =====
   Every question keeps the same six skills (who to count → one person's weight →
   build a score → does the answer survive other scores → read the record → What-if),
   but each one looks at the records that matter for it: the person being moved or
   removed, the wind, the fire, or the other book (정사). The main question (zg)
   keeps the stages defined in 80-simplify.js. */

const SC_KW={fire:/불(?![러렀구과평만안편어었])/g,ship:/(배|전선|함대|함선)/g,plan:/(계책|계략|연환계|고육계|꾀)/g,wind:/(바람|동남풍|풍향)/g};
const hiKw=(t,k)=>esc(t).replace(SC_KW[k]||SC_KW.fire,m=>`<b class="kw-fire">${m}</b>`);
const SC_KNAME={ship:"배",fire:"불",plan:"계책",wind:"바람"};
const SC_KI={ship:0,fire:1,plan:2,wind:3};
const scKo=n=>PP[n].ko;
const scJosa=(w,a,b)=>wiJosa(w,a,b);

/* ---- what each question looks at ---- */
const SC={
 zy:{who:["周瑜"],side:"wu",verb:"옮기기",
  s1:{title:"오나라로 분류된 네 사람, 모두 셀까요?",cards:[
    ["周瑜","core","적벽 편 7회에 나옴","연합군을 지휘한 인물이지요. 이번 질문에서 조조 편으로 옮길 사람입니다."],
    ["徐盛","two","2회 나옴","바람이 분 뒤 제갈량을 뒤쫓은 오나라 장수이지요."],
    ["呂範","one","딱 1회, 이름만 한 번","주유가 정한 순찰 임무에 이름이 한 번 나옵니다."],
    ["孫策","dead","2회 언급 · 8년 전 사망한 손권의 형","대화 속에 이름만 나옵니다. 이 싸움에는 없었지요."]]},
  s5:{n:"周瑜",k:"fire",q:"주유의 ‘불’ 기록은 어떤 장면일까요?",ask:{opts:["불에 당해 달아나는 장면", "불을 지르는 연합군 함대 속에서 공격하는 장면", "이름만 한 번 스치는 장면"],ok:1,good:"주유는 불을 지르는 쪽입니다. 조조의 ‘불’ 기록과 달리 공격하는 장면입니다.",bad:"원문에서 주유가 무엇을 하는지 읽어 보시지요."},
   take:"주유는 불을 지르는 연합군 함대 한가운데에 있습니다. 조조의 ‘불’ 기록이 불에 당한 장면이었던 것과 달리, 주유의 기록은 공격하는 장면입니다. 같은 글자라도 장면을 읽어야 뜻을 알 수 있지요.",
   check:{q:"주유의 ‘불’ 점수는 무엇을 센 것이었습니까?",opts:["주유가 불에 당한 장면","주유가 화공을 이끄는 장면에 ‘불’ 글자가 함께 나온 것","주유의 실제 화공 능력"],ok:1}}},
 hg:{who:["黃蓋"],side:"wu",verb:"옮기기",
  s1:{title:"오나라로 분류된 네 사람, 모두 셀까요?",cards:[
    ["黃蓋","core","적벽 편 6회에 나옴","거짓 항복과 화공을 맡은 인물이지요. 이번 질문에서 조조 편으로 옮길 사람입니다."],
    ["丁奉","two","2회 나옴","서성과 함께 제갈량을 뒤쫓은 오나라 장수이지요."],
    ["嚴畯","one","딱 1회, 이름만 한 번","항복을 논하는 자리에서 이름이 한 번 나옵니다."],
    ["孫策","dead","2회 언급 · 8년 전 사망한 손권의 형","대화 속에 이름만 나옵니다. 이 싸움에는 없었지요."]]},
  s5:{n:"黃蓋",k:"fire",q:"황개의 ‘불’ 기록은 어떤 장면일까요?",ask:{opts:["다른 사람의 대사 속에 이름이 나오는 장면", "황개가 불붙은 배를 직접 모는 장면", "황개가 불에 당하는 장면"],ok:0,good:"이 문단에서 황개는 직접 나서지 않습니다. 대사 속에 이름만 나오고, 같은 문단의 ‘불태워도’ 때문에 ‘불’로 세어졌습니다.",bad:"원문에서 황개가 직접 무엇을 하는지 읽어 보시지요."},
   take:"이 문단에서 황개는 직접 나서지 않습니다. 누군가 방통을 붙잡고 ‘황개는 고육계를 쓰고…’라고 말하는 대사 속에 이름이 있고, 같은 문단에 ‘불태워도’가 나와 ‘불’로 세어졌지요. 이름이 대사 속에 나와도 기록으로 세어집니다.",
   check:{q:"황개의 ‘불’ 기록에서 알 수 있는 것은?",opts:["황개가 직접 불을 지른 장면만 세어졌습니다.","다른 사람의 대사 속에 이름이 나와도 같은 문단의 글자와 함께 세어집니다.","황개의 기록은 잘못 들어간 것입니다."],ok:1}}},
 zyout:{who:["周瑜"],side:"wu",verb:"빼기",
  s1:null,s5:null},
 ptout:{who:["龐統"],side:"shu",verb:"빼기",
  s1:{title:"방통과 함께 살펴볼 네 사람, 모두 셀까요?",cards:[
    ["劉備","core","적벽 편 7회에 나옴","연합군의 한 축인 유비이지요."],
    ["龐統","two","2회만 나옴","이번 질문의 주인공이지요. 두 회에만 나오므로, 기준을 ‘3회 이상’으로 하면 명단에서 빠집니다."],
    ["孫乾","one","딱 1회, 이름만 한 번","유비의 신하로 이름이 한 번 나옵니다."],
    ["劉表","dead","2회 언급 · 적벽 직전에 사망","유비가 몸을 의탁했던 형주의 유표이지요. 자료에는 ‘위’로 분류됩니다."]]},
  s5:{n:"龐統",k:"ship",q:"방통의 ‘배’ 기록은 어떤 장면일까요?",ask:{opts:["방통이 배를 지휘하는 장면", "방통이 배를 타고 달아나는 장면", "배를 묶으라고 권한 뒤 붙잡히는 장면"],ok:2,good:"방통은 배를 지휘하지 않습니다. 조조에게 배를 묶으라고 권하는 연환계를 꾸민 뒤 붙잡히는 장면입니다.",bad:"원문에서 방통이 무엇을 하는지 읽어 보시지요."},
   take:"방통은 배를 지휘하지 않습니다. 조조에게 배를 서로 묶으라고 권하는 연환계를 꾸민 뒤, 그 계책을 꿰뚫어 본 사람에게 붙잡히는 장면이지요. 방통의 ‘배’ 점수는 조조의 배를 묶게 한 계책에서 나온 숫자입니다.",
   check:{q:"방통의 ‘배’ 점수는 무엇을 센 것이었습니까?",opts:["방통이 연합군의 배를 지휘한 기록","조조의 배를 묶게 한 연환계 장면에 ‘배’ 글자가 함께 나온 것","방통의 수전 능력"],ok:1}}},
 combo:{who:["周瑜","黃蓋"],side:"wu",verb:"옮기기",s1:null,s5:null},
 nowind:{topic:"wind",
  s1:{title:"‘바람(風)’ 글자와 함께 이름이 나온 네 사람, 모두 셀까요?",cards:[
    ["諸葛亮","core","7회에 나옴 · 바람 문단 11","바람 기록이 가장 많은 사람이지요."],
    ["徐盛","two","2회 나옴 · 바람 문단 3","바람이 분 뒤 제갈량을 뒤쫓은 장수이지요."],
    ["夏侯淵","one","딱 1회 · 바람 기록 없음","이름만 한 번 나옵니다."],
    ["劉表","dead","2회 언급 · 적벽 직전에 사망 · 바람 문단 1","이미 세상을 떠난 유표의 이름도 바람 문단에 섞여 있습니다."]]},
  s5:{n:"諸葛亮",k:"wind",q:"소설은 그날의 바람을 어떻게 적었을까요?",ask:{opts:["그냥 날씨로 적었습니다", "바람이 불지 않았다고 적었습니다", "제갈량의 처방과 엮어 적었습니다"],ok:2,good:"소설은 바람을 제갈량의 ‘처방’과 엮어 씁니다. 병이 난 주유에게 제갈량이 열여섯 자를 써 주는 장면입니다.",bad:"원문에서 바람이 누구와 함께 나오는지 읽어 보시지요."},
   take:"소설은 바람을 제갈량의 ‘처방’과 엮어 씁니다. 병이 난 주유에게 제갈량이 몰래 열여섯 자를 써 주는 장면이지요. 바람을 날씨로 볼지, 제갈량의 능력으로 볼지는 해석의 문제입니다. 그래서 마지막 순서에서 가정으로 다룹니다.",
   check:{q:"바람 기록에서 알 수 있는 것은?",opts:["바람은 제갈량의 능력이라고 데이터가 증명합니다.","소설은 바람을 제갈량과 엮어 서술하므로, 바람을 어떻게 볼지는 가정으로 정해야 합니다.","바람은 기록에 나오지 않습니다."],ok:1}}},
 nofire:{topic:"fire",
  s1:{title:"‘불(火)’ 글자와 함께 이름이 나온 네 사람, 모두 셀까요?",cards:[
    ["黃蓋","core","6회에 나옴 · 불 문단 9","불붙은 배를 몬 인물로 알려져 있지요."],
    ["丁奉","two","2회 나옴 · 불 문단 2","제갈량을 뒤쫓은 오나라 장수이지요."],
    ["夏侯淵","one","딱 1회 · 불 기록 없음","이름만 한 번 나옵니다."],
    ["劉表","dead","2회 언급 · 적벽 직전에 사망 · 불 문단 2","이미 세상을 떠난 유표의 이름이 불 문단에 섞여 있습니다."]]},
  s5:{n:"曹操",n2:"周瑜",k:"fire",q:"두 사람의 ‘불’ 기록, 누가 불을 질렀을까요?",ask:{opts:["둘 다 불을 지르고 있습니다", "둘 다 불에 당하고 있습니다", "주유는 공격하고, 조조는 불을 피해 달아납니다"],ok:2,good:"주유는 공격하고 조조는 불을 뚫고 달아납니다. ‘불’ 점수에는 공격과 피해가 함께 들어 있습니다.",bad:"두 문단에서 각자 무엇을 하는지 읽어 보시지요."},
   take:"두 문단 모두 ‘불’로 세어졌지만, 주유는 공격하고 조조는 불을 뚫고 달아나고 있지요. ‘불’ 점수에는 공격과 피해가 함께 들어 있습니다. 불 점수를 0으로 두면 조조군이 더 많이 잃는 까닭입니다.",
   check:{q:"불 점수를 0으로 두면 왜 연합군 쪽 지수가 올라갈까요?",opts:["연합군이 불을 쓰지 않아서","조조군의 ‘불’ 점수 상당수가 불에 당한 기록이라, 함께 빠지기 때문에","계산이 잘못되어서"],ok:1}}},
 jb:{topic:"source",
  s1:{title:"소설과 역사책에 남은 기록이 다른 네 사람, 모두 셀까요?",cards:[
    ["諸葛亮","core","소설 7회 · 정사 본문 관련 문장 14","소설에서는 가장 많이 나오지만, 정사 본문에서는 훨씬 적습니다."],
    ["徐盛","two","소설 2회 · 정사 본문 관련 문장 5","두 기록 모두에 조금씩 나옵니다."],
    ["呂範","one","소설 딱 1회 · 정사 본문 관련 문장 12","소설에는 한 번 나오지만 정사에는 기록이 많지요. 명단 기준은 소설의 회 수로 정합니다."],
    ["孫策","dead","소설 2회 언급 · 사망 · 정사 본문 관련 문장 22","정사에서는 큰 인물이지만, 적벽 때는 이미 세상을 떠났지요."]]},
  s5:{n:"諸葛亮",k:"wind",q:"정사의 본문과 주석은 같은 이야기를 할까요?",ask:{opts:["분량이 같습니다", "주석에 바람 기록이 훨씬 더 많습니다", "본문에 바람 기록이 더 많습니다"],ok:1,good:"바람 기록은 정사 본문에 1문장, 배송지 주석에 6문장입니다. 어느 층을 세느냐에 따라 숫자가 달라집니다.",bad:"두 층의 숫자를 비교해 보시지요."},
   take:"제갈량의 바람 기록은 정사 본문에 1문장, 배송지 주석에 6문장 있습니다. 계책 기록도 본문 12문장, 주석 20문장이지요. 주석은 훗날 덧붙인 다른 책들의 기록입니다. 어느 층을 세느냐에 따라 숫자가 달라집니다.",
   check:{q:"정사로 셀 때 주의할 점은?",opts:["정사는 하나의 기록이라 어떻게 세어도 같습니다.","본문과 주석은 성격이 다른 기록이므로, 무엇을 셌는지 밝혀야 합니다.","정사에는 제갈량이 나오지 않습니다."],ok:1}}}
};
SC.zyout.s1=SC.zy.s1&&{...SC.zy.s1,cards:SC.zy.s1.cards.map(c=>c[0]==="周瑜"?["周瑜","core","적벽 편 7회에 나옴","연합군을 지휘한 인물이지요. 이번 질문에서 명단에서 뺄 사람입니다."]:c)};
SC.zyout.s5={n:"周瑜",k:"plan",q:"주유의 ‘계책’ 기록에는 무엇이 들어 있을까요?",ask:{opts:["주유가 계책을 세우는 장면", "주유가 계책에 당하는 장면", "회를 마무리하는 이야기꾼의 한 줄"],ok:2,good:"이 문단은 회를 마무리하는 한 줄입니다. 숫자에는 이야기를 이어 주는 말도 섞여 있습니다.",bad:"원문이 어떤 문장인지 읽어 보시지요."},
 take:"이 문단은 회를 마무리하는 한 줄입니다. ‘주유가 어떤 계책으로 공명을 복종시킬지, 다음 회를 보라’는 이야기꾼의 말이지요. 주유를 명단에서 빼면 이런 문장까지 함께 빠집니다. 숫자에는 장면과 이야기를 이어 주는 말이 함께 섞여 있습니다.",
 check:{q:"주유의 ‘계책’ 점수를 볼 때 주의할 점은?",opts:["모두 주유가 계책을 세운 장면입니다.","회를 마무리하는 문장처럼 장면 밖의 글도 함께 세어질 수 있습니다.","계책 점수는 믿을 수 없으니 버려야 합니다."],ok:1}};
SC.combo.s1={...SC.zy.s1,cards:[["周瑜","core","적벽 편 7회에 나옴","연합군을 지휘한 인물이지요. 이번 질문에서 황개와 함께 조조 편으로 옮길 사람입니다."],SC.hg.s1.cards[1],SC.zy.s1.cards[2],SC.zy.s1.cards[3]]};
SC.combo.s5={n:"周瑜",n2:"黃蓋",k:"fire",q:"두 사람의 ‘불’ 기록은 같은 장면일까요?",ask:{opts:["둘 다 직접 불을 지르는 장면", "둘 다 대사 속에 이름만 나오는 장면", "주유는 공격하는 장면이고, 황개는 대사 속에 이름만 나옵니다"],ok:2,good:"주유는 함대를 이끌고 공격하고, 황개는 다른 사람의 대사 속에 이름이 나옵니다. 성격이 다른 기록입니다.",bad:"두 문단을 각각 읽어 보시지요."},
 take:"주유의 기록은 함대를 이끌고 공격하는 장면이고, 황개의 기록은 다른 사람의 대사 속에 이름이 나온 장면입니다. 두 사람을 함께 옮기면, 성격이 다른 기록이 한꺼번에 조조군으로 옮겨 가는 셈이지요.",
 check:{q:"두 사람의 ‘불’ 기록을 함께 옮길 때 알아 둘 점은?",opts:["둘 다 같은 종류의 기록입니다.","공격 장면과 대사 속 언급처럼 성격이 다른 기록이 함께 옮겨 갑니다.","불 기록은 옮겨 가지 않습니다."],ok:1}};

/* ---- the words each stage uses, per question ---- */
function scText(x){
 const c=SC[x.id],P=c.who?c.who.map(scKo).join("·"):"",Pn=c.who?scKo(c.who[c.who.length-1]):"",
  obj=c.who?`${P}${scJosa(Pn,"을","를")}`:"",act=c.who?(c.verb==="빼기"?`${obj} 빼면`:`${obj} 옮기면`):"",
  side=c.side==="shu"?"촉":"오나라";
 if(c.who)return {
  q:[`${P}${scJosa(Pn,"과","와")} 같은 편의 기록부터 살펴보시지요`,c.who.length>1?`${P} 두 사람의 몫은 얼마나 될까요?`:`${P} 한 사람의 몫은 얼마나 될까요?`,`${P}의 기록으로 점수를 매겨 보시지요`,`점수 규칙을 바꿔도 ${act.replace(/면$/,"")} 결과가 같을까요?`.replace("빼 결과","뺀 결과").replace("옮기 결과","옮긴 결과"),c.s5.q],
  todo:[`${side}${side==="촉"?"으로":"로"} 분류된 네 사람을 보고, 명단에 올릴지 골라 보시지요.`,`${side} 사람들의 등장 횟수를 보고, ${P}${scJosa(Pn,"을","를")} 빼면 평균이 어떻게 되는지 살펴보시지요.`,`${P}의 배·불·계책 기록을 보고, 무엇에 무게를 둘지 정해 보시지요.`,`점수 규칙을 바꿔 가며, ${act} 나오는 결과가 달라지는지 살펴보시지요.`,`${scKo(c.s5.n)}의 ‘${SC_KNAME[c.s5.k]}’ 점수가 어떤 장면에서 나왔는지 원문을 펼쳐 보시지요.`],
  why:[[`${act} 연합군 쪽 명단이 달라집니다. 누구를 세는지부터 정해야겠지요.`,"이름이 기록에 남았어도, 모두 이 싸움에 나온 것은 아니지요."],
   [`${act} 결과가 얼마나 흔들릴지는, ${P}의 몫이 얼마나 큰지에 달려 있겠지요.`,"평균과 크게 다른 한 사람은 평균을 크게 움직입니다."],
   c.verb==="빼기"?[`${act} 그 사람의 점수도 함께 빠집니다.`,"계산에서는 그 사람의 기록으로 만든 점수가 합계에서 빠집니다."]:[`${act} 그 사람의 점수도 함께 넘어갑니다.`,"계산에서는 그 사람의 기록으로 만든 점수가 다른 편에 더해집니다."],
   ["내가 고른 점수에서만 나오는 결과라면 믿기 어렵겠지요.","여러 규칙에서 같은 방향이면, 결과를 더 믿을 수 있습니다."],
   [`옮기거나 빼는 점수가 실제로 무엇을 센 것인지 확인해야겠지요.`,"같은 글자라도 장면에 따라 뜻이 다릅니다."]]};
 if(c.topic==="wind")return {
  q:["바람 기록에 나오는 사람부터 살펴보시지요","바람 기록은 누구에게 몰려 있을까요?","바람은 점수에 넣어야 할까요?","바람 보너스를 얼마로 두어도 결론이 같을까요?",c.s5.q],
  todo:["‘바람’ 글자와 함께 나온 네 사람을 보고, 명단에 올릴지 골라 보시지요.","바람 문단 수를 사람별로 보고, 한 사람을 빼면 어떻게 되는지 살펴보시지요.","배·불·계책·바람 기록을 보고, 점수에 넣을 것과 따로 둘 것을 정해 보시지요.","바람 보너스의 크기와 점수 규칙을 바꿔 가며 결론이 달라지는지 살펴보시지요.","소설이 바람을 어떻게 적었는지 원문을 펼쳐 보시지요."],
  why:[["바람이 없었다면 누구의 기록이 달라질지 보려면, 먼저 셀 사람을 정해야겠지요.","이름이 기록에 남았어도, 모두 이 싸움에 나온 것은 아니지요."],
   ["바람 기록이 한 사람에게 몰려 있다면, 바람을 어떻게 보느냐가 그 사람의 평가와 엮이겠지요.","기록이 한쪽에 몰려 있으면, 그 사람에 대한 가정이 결과를 좌우합니다."],
   ["바람은 사람의 능력일까요, 날씨일까요? 점수에 넣을지부터 정해야겠지요.","무엇을 점수에 넣고 무엇을 따로 둘지가 결론을 바꿉니다."],
   ["바람 보너스 +10은 우리가 정한 숫자입니다. 다른 숫자로도 확인해야겠지요.","정한 숫자를 바꿔도 결론이 같은지 살피는 일이지요."],
   ["바람을 날씨로 볼지는 기록이 어떻게 쓰였는지 보고 정해야겠지요.","해석이 필요한 부분은 가정으로 밝혀 둡니다."]]};
 if(c.topic==="fire")return {
  q:["불 기록에 나오는 사람부터 살펴보시지요","불 기록은 어느 편에 더 많을까요?","불에 얼마만큼 무게를 둘까요?","불 점수를 빼도 결론이 같을까요?",c.s5.q],
  todo:["‘불’ 글자와 함께 나온 네 사람을 보고, 명단에 올릴지 골라 보시지요.","두 편의 불 문단 수를 보고, 조조 한 사람의 몫을 살펴보시지요.","조조와 황개의 불 기록을 견주며, 무엇에 무게를 둘지 정해 보시지요.","불 점수를 0으로 둔 채 다른 점수를 바꿔 가며 결론이 달라지는지 살펴보시지요.","두 사람의 ‘불’ 기록이 어떤 장면인지 원문을 펼쳐 보시지요."],
  why:[["화공이 통하지 않았다면 누구의 기록이 달라질지 보려면, 먼저 셀 사람을 정해야겠지요.","이름이 기록에 남았어도, 모두 이 싸움에 나온 것은 아니지요."],
   ["불 점수를 빼면 어느 편이 더 잃을지는, 불 기록이 어디에 몰려 있는지에 달려 있겠지요.","합계 속에서 한 사람이 차지하는 몫을 함께 봐야 합니다."],
   ["불에 주는 점수가 클수록 이번 질문의 영향도 커지겠지요.","무엇에 무게를 두었는지에 따라 결과도 달라지지요."],
   ["불 점수를 뺀 뒤에도 다른 점수 규칙에서 같은 결론인지 확인해야겠지요.","여러 규칙에서 같은 방향이면, 결과를 더 믿을 수 있습니다."],
   ["불 점수가 공격을 센 것인지 피해를 센 것인지 원문으로 확인해야겠지요.","같은 글자라도 장면에 따라 뜻이 다릅니다."]]};
 return {
  q:["두 기록에 남은 사람부터 살펴보시지요","두 기록에서 각 편이 차지하는 몫은 같을까요?","문단과 문장, 무엇을 세는지 알고 점수를 매겨 보시지요","정사로 세면 점수 규칙에 더 흔들릴까요?",c.s5.q],
  todo:["소설과 정사에 남은 기록이 다른 네 사람을 보고, 명단에 올릴지 골라 보시지요.","같은 명단으로 소설과 정사의 점수 비중을 견주어 보시지요.","제갈량의 기록을 두 책에서 견주며, 무엇에 무게를 둘지 정해 보시지요.","정사로 셀 때 점수 규칙을 바꿔 가며 결론이 달라지는지 살펴보시지요.","정사의 본문과 주석에 남은 기록을 견주어 보시지요."],
  why:[["기록을 바꾸기 전에, 누구를 셀지 같은 기준으로 정해야겠지요.","두 기록에서 사람의 비중이 다를 수 있지요."],
   ["기록을 바꾸면 각 편의 몫이 얼마나 달라지는지부터 봐야겠지요.","같은 사람이라도 어떤 책을 세느냐에 따라 몫이 달라집니다."],
   ["소설은 문단을, 정사는 문장을 셉니다. 단위가 다르다는 것을 알고 점수를 매겨야겠지요.","단위가 다른 숫자는 비중(%)으로 비교합니다."],
   ["기록을 바꾸면 결론이 점수 규칙에 더 민감해질 수도 있겠지요.","기록마다 결론의 안정성도 다를 수 있습니다."],
   ["정사도 본문과 주석의 성격이 다르지요. 무엇을 셌는지 확인해야겠지요.","어느 층의 기록을 세었는지 밝혀 둡니다."]]};
}
const ZG_STAGE={todo:SIMPLE_TODO.slice(0,5),why:SIMPLE_WHY.slice(0,5).map(x=>[...x]),q:ST.slice(0,5).map(x=>x.q)};
const applyScenarioTextBase=applyScenarioText;
applyScenarioText=function(){
 applyScenarioTextBase();
 const x=scenario();
 for(let i=0;i<5;i++){
  if(x.id==="zg"){SIMPLE_TODO[i]=ZG_STAGE.todo[i];SIMPLE_WHY[i]=[...ZG_STAGE.why[i]];ST[i].q=ZG_STAGE.q[i];continue}
  const t=scText(x);SIMPLE_TODO[i]=t.todo[i];SIMPLE_WHY[i]=[...t.why[i]];ST[i].q=t.q[i];
 }
};

/* ---- stage renderers for the other questions ---- */
const MAIN_STAGE=[null,RENDER[1],RENDER[2],RENDER[3],RENDER[4],RENDER[5]];
const scnFor=()=>{const x=scenario();return x.id==="zg"?null:{x,c:SC[x.id]}};

// 1) who to count: four cards picked for the question
function scStage1({x,c}){
 const L=S.t.s1d=S.t.s1d||{};
 const cards=c.s1.cards.map(([n,role,fact,tip])=>`<div class="pcard" data-n="${n}" data-role="${role}"><div class="pcard-h"><i class="dot" style="background:${fcol(PP[n].f)}"></i><b>${scKo(n)}</b><span>${FN[PP[n].f]}</span></div><p class="pcard-fact">${fact}</p><div class="pick" role="group" aria-label="${scKo(n)}"><button data-v="1">명단에 넣기</button><button data-v="0">명단에서 빼기</button></div><p class="pcard-tip" hidden>${tip}</p></div>`).join("");
 const must=(c.who||[]);
 originalStageRenderer(1,[["s1","cards","네 사람 정하기"]],
  step(1,esc(c.s1.title),"",`<div class="pcards" id="pcards">${cards}</div>`)+`<section class="stepsec" id="s1reveal" hidden></section>`,
  {q:(()=>{const dn=scKo(c.s1.cards.find(r=>r[1]==="dead")[0]);return `이미 세상을 떠난 ${dn}까지 명단에 넣으면 어떻게 될까요?`})(),opts:["명단이 더 정확해집니다.","이 싸움에 없던 사람의 기록까지 숫자에 섞입니다.","아무것도 달라지지 않습니다."],ok:1,
   good:"이름이 나왔다고 모두 이 싸움에 있던 것은 아니지요. 누구를 세느냐에 따라 숫자가 달라지므로, 먼저 기준을 정합니다.",bad:"이미 세상을 떠난 사람이 이 싸움에 나올 수 있었는지 살펴보시지요.",
   ev:()=>{const t=rosterTotals();return `내 기준: ${S.rule.min}회 이상 · 죽은 사람 ${S.rule.dead?'뺌':'셈'} → 조조군 ${t.wei}명, 연합군 ${t.ally}명`}});
 simplifyStage(1);
 const role=r=>c.s1.cards.find(cd=>cd[1]===r)[0];
 const reveal=$("#s1reveal");
 const apply=()=>{S.rule.min=L[role("one")]===1?1:L[role("two")]===1?2:3;S.rule.dead=L[role("dead")]===1?0:1;save()};
 const drawCards=()=>{for(const el of $$("#pcards .pcard")){const v=L[el.dataset.n];el.querySelectorAll('.pick button').forEach(b=>b.setAttribute('aria-pressed',String(v!==undefined&&+b.dataset.v===v)));el.classList.toggle('chosen',v!==undefined)}};
 const drawReveal=()=>{
  if(!c.s1.cards.every(([n])=>L[n]!==undefined)){reveal.hidden=true;return}
  apply();setT("s1","cards");$$("#pcards .pcard-tip").forEach(t=>t.hidden=false);
  const t=rosterTotals(),r=roster(),missing=must.filter(n=>!r.includes(n));
  reveal.hidden=false;
  reveal.innerHTML=`<header class="step-h"><span class="sno">활동 2</span><h2>방금 하신 일이 ‘기준 정하기’입니다</h2></header>
   <section class="card pane simple-result"><p class="rule-line">내 기준: <b>${S.rule.min}회 이상 나온 사람</b>만, 이미 죽은 사람은 <b>${S.rule.dead?'빼고':'넣고'}</b></p>
   <div class="sides"><div class="side"><i style="background:var(--wei)"></i><span>조조군</span><b class="num">${t.wei}<small>명</small></b></div><div class="side"><i style="background:linear-gradient(90deg,var(--wu),var(--shu))"></i><span>손권·유비 연합군</span><b class="num">${t.ally}<small>명</small></b></div></div>
   ${missing.length?`<p class="wi-hit">이 기준이라면 ${missing.map(scKo).join("·")}${scJosa(scKo(missing[missing.length-1]),"이","가")} 명단에서 빠집니다. 이번 질문은 그 사람을 다루므로, 이대로는 비교할 수 없겠지요. 기준을 다시 골라 보시지요.</p>`:`<p class="simple-note">기록에 이름이 나온 63명 중 <b>${t.all}명</b>을 셉니다. 이 명단으로 이번 질문의 마지막 실험까지 계산하는 것이지요.</p>`}</section>`;
 };
 $("#pcards").addEventListener('click',e=>{const b=e.target.closest('.pick button');if(!b)return;L[b.closest('.pcard').dataset.n]=+b.dataset.v;save();drawCards();drawReveal()});
 drawCards();drawReveal();
}

// 2) one person's weight (people), where a record concentrates (wind/fire), or two books (source)
function scStage2({x,c}){
 const L=S.t.s2d=S.t.s2d||{};
 const r=roster();
 if(c.who){
  const f=c.side,label=f==="shu"?"촉":"오",mem=facMembers(f).sort((a,b)=>PP[b].pa-PP[a].pa),drop=c.who.filter(n=>mem.includes(n));
  const avgOf=without=>avg(mem.filter(n=>!without||!drop.includes(n)).map(n=>PP[n].pa));
  const P=c.who.map(scKo).join("·");
  originalStageRenderer(2,[["s2","drop",`${P} 빼 보기`]],
   step(1,`${label} 사람들을 한 명씩 보면`,"",`<section class="card pane"><div class="bars" id="memBars"></div><p class="big-change" id="avgNow">${label} 평균 <b class="num">${fmt1(avgOf())}</b> <span class="simple-note">(${mem.length}명)</span></p>${drop.length?`<button class="btn" id="dropTop">${esc(P)} 빼고 다시 계산하기</button>`:`<p class="wi-hit">${esc(P)}${scJosa(scKo(c.who[c.who.length-1]),"이","가")} 지금 명단에 없습니다. 첫 번째 순서에서 기준을 다시 골라 보시지요.</p>`}<div id="dropRes"></div></section>`)+reveal('s2name'),
   {q:`${P}${scJosa(scKo(c.who[c.who.length-1]),"을","를")} 빼자 평균이 달라진 까닭은?`,opts:["모두가 똑같이 나와서","빠진 사람의 숫자가 평균과 많이 달라서","사람 수가 많아서"],ok:1,
    good:"평균과 크게 다른 사람이 빠지면 평균이 크게 움직입니다. 그 사람이 평균보다 적게 나왔다면 오히려 올라가기도 하지요.",bad:"막대에서 빠진 사람이 다른 사람들과 얼마나 다른지 살펴보시지요.",
    ev:()=>`${label} 평균 ${fmt1(avgOf())} → ${P} 빼면 ${fmt1(avgOf(1))} · 중앙값 ${fmt1(median(mem.map(n=>PP[n].pa)))}`});
  simplifyStage(2);
  bars($("#memBars"),mem.map(n=>({label:scKo(n)+(c.who.includes(n)?" ●":""),v:PP[n].pa,c:fcol(f)})),PP[mem[0]].pa,'');
  const done=()=>{const a=avgOf(),b=avgOf(1),up=b>a,small=!up&&a-b<a*0.1;
   $("#avgNow").hidden=true;$("#dropRes").innerHTML=`<p class="big-change">${label} 평균 <b class="num">${fmt1(a)}</b> → <b class="num">${fmt1(b)}</b></p><p class="simple-note">${esc(P)}${scJosa(scKo(c.who[c.who.length-1]),"이","가")} 빠지자 평균이 ${up?"오히려 올라갔습니다. 평균보다 적게 나온 사람이었기 때문이지요.":small?"조금 내려갔습니다. 평균보다 약간 많이 나온 사람이었기 때문이지요.":"크게 내려갔습니다. 평균보다 훨씬 많이 나온 사람이었기 때문이지요."}</p>`;
   show('s2name',named(up?"평균보다 작은 한 사람":small?"한 사람의 무게":"평균의 함정",small?`${esc(P)}의 숫자는 ${label} 평균과 크게 다르지 않아서, 빼도 평균이 조금만 움직입니다. 한 사람이 결과를 얼마나 흔들지는, 그 사람의 숫자가 평균과 얼마나 다른지에 달려 있지요.`:up?`${esc(P)}의 숫자는 ${label} 평균보다 작습니다. 그래서 빼면 평균이 올라가지요. 한 사람을 옮기거나 뺄 때는, 그 사람의 숫자가 평균보다 큰지 작은지부터 보아야 합니다.`:`${esc(P)}의 숫자가 커서 ${label} 평균을 끌어올리고 있었습니다. 이런 사람을 옮기거나 빼면 결과가 크게 흔들리지요. 가운데 값(중앙값 ${fmt1(median(mem.map(n=>PP[n].pa)))})도 함께 살펴야 합니다.`))};
  const btn=$("#dropTop");if(btn)btn.onclick=()=>{L.dropped=1;save();setT("s2","drop");done()};if(L.dropped&&btn)done();
  return;
 }
 if(c.topic==="wind"||c.topic==="fire"){
  const k=c.topic,ki=SC_KI[k],top=r.map(n=>({n,v:PP[n].yy[ki]})).filter(o=>o.v>0).sort((a,b)=>b.v-a.v).slice(0,7);
  const total=r.reduce((s,n)=>s+PP[n].yy[ki],0),side=f=>r.filter(n=>f==="wei"?PP[n].f==="wei":PP[n].f!=="wei").reduce((s,n)=>s+PP[n].yy[ki],0);
  const who=k==="wind"?"諸葛亮":"曹操";
  originalStageRenderer(2,[["s2","drop",`${scKo(who)} 빼 보기`]],
   step(1,`‘${SC_KNAME[k]}’ 글자와 함께 나온 문단 수`,"",`<section class="card pane">${twoSides({wei:side("wei"),ally:side("ally")},"문단")}<div class="bars" id="memBars"></div><button class="btn" id="dropTop">${scKo(who)} 빼고 다시 세기</button><div id="dropRes"></div></section>`)+reveal('s2name'),
   k==="wind"?{q:"바람 기록을 사람별로 나누어 본 까닭은?",opts:["바람을 누가 일으켰는지 숫자로 증명하려고","바람 기록이 누구에게 얼마나 몰려 있는지 알아야, 바람에 대한 가정이 결과를 얼마나 바꿀지 짐작할 수 있어서","바람은 계산과 관계없어서"],ok:1,good:"글자 수로는 누가 바람을 일으켰는지 증명할 수 없습니다. 다만 기록이 어떻게 퍼져 있는지는 알 수 있지요.",bad:"막대에서 한 사람이 차지하는 몫을 살펴보시지요.",ev:()=>`바람 문단 ${total}개 중 제갈량 ${PP[who].yy[ki]}개`}
   :{q:"조조군의 ‘불’ 문단이 많은 까닭을 알려면?",opts:["조조군이 불을 잘 썼다고 보면 됩니다.","조조 한 사람의 몫이 큰지, 그 기록이 어떤 장면인지 살펴야 합니다.","불 기록은 볼 필요가 없습니다."],ok:1,good:"합계 속에 한 사람이 큰 몫을 차지하면, 그 사람의 기록부터 확인해야 하지요. 다섯 번째 순서에서 원문을 펼쳐 봅니다.",bad:"조조군 합계에서 조조 한 사람이 차지하는 몫을 살펴보시지요.",ev:()=>`조조군 불 문단 ${side("wei")}개 중 조조 ${PP[who].yy[ki]}개`});
  simplifyStage(2);
  bars($("#memBars"),top.map(o=>({label:scKo(o.n),v:o.v,c:fcol(PP[o.n].f)})),top[0].v,'문단');
  const done=()=>{const v=PP[who].yy[ki],base=k==="wind"?total:side("wei"),pct=Math.round(v/base*100);
   $("#dropRes").innerHTML=`<p class="big-change">${k==="wind"?"바람 문단":"조조군의 불 문단"} <b class="num">${base}</b> → <b class="num">${base-v}</b></p><p class="simple-note">${scKo(who)} 한 사람이 <b>${pct}%</b>를 차지하고 있었습니다.</p>`;
   show('s2name',named(k==="wind"&&pct<30?"여러 사람에게 퍼진 기록":"한 사람에게 몰린 기록",k==="wind"?(pct<30?`제갈량은 바람 기록이 가장 많지만 전체의 ${pct}%이고, 나머지는 주유·조조 등 여러 사람에게 퍼져 있습니다. 글자 수만으로는 바람이 제갈량의 능력이라고 말하기 어렵지요. 그래서 바람은 마지막 순서에서 가정으로 다룹니다.`:`바람 기록의 ${pct}%가 제갈량 한 사람에게 몰려 있습니다. 그래서 바람을 제갈량의 능력으로 볼지, 날씨로 볼지가 결과를 크게 바꿉니다.`):`조조군 ‘불’ 기록의 ${pct}%가 조조 한 사람에게서 나옵니다. 불 점수를 없애면 조조군이 많이 잃게 되는 까닭이 여기 있지요. 그 기록이 어떤 장면인지는 다섯 번째 순서에서 확인합니다.`))};
  $("#dropTop").onclick=()=>{L.dropped=1;save();setT("s2","drop");done()};if(L.dropped)done();
  return;
 }
 // source: share of each side in the novel vs the history
 const share=lens=>{const s=fs(lens),A=s.wu+s.shu,W=s.wei,T=A+W||1;return {wei:Math.round(W/T*100),ally:Math.round(A/T*100),shu:Math.round(s.shu/T*100)}};
 originalStageRenderer(2,[["s2","drop","정사로 바꿔 보기"]],
  step(1,"같은 명단, 두 기록의 몫","",`<section class="card pane"><p class="simple-note">『삼국지연의』(소설)로 센 점수의 비중</p>${twoSides(share("yy"),"%")}<button class="btn" id="dropTop">정사 본문으로 바꿔 보기</button><div id="dropRes"></div></section>`)+reveal('s2name'),
  {q:"두 기록에서 각 편의 몫이 달랐다면?",opts:["한쪽 기록이 틀린 것입니다.","같은 사람이라도 어떤 책을 세느냐에 따라 몫이 달라집니다.","몫은 언제나 같습니다."],ok:1,good:"소설과 역사책은 같은 사람을 다른 분량으로 다룹니다. 그래서 어느 기록을 셌는지 밝혀 둡니다.",bad:"두 기록의 비중을 견주어 보시지요.",ev:()=>`촉의 비중 연의 ${share("yy").shu}% → 정사 본문 ${share("jb").shu}%`});
 simplifyStage(2);
 const done=()=>{const a=share("yy"),b=share("jb");
  $("#dropRes").innerHTML=`<p class="simple-note">정사 본문으로 센 점수의 비중</p>${twoSides(b,"%")}<p class="big-change">촉의 비중 <b class="num">${a.shu}%</b> → <b class="num">${b.shu}%</b></p>`;
  show('s2name',named("같은 사람, 다른 기록",`같은 명단인데도 소설에서는 촉이 ${a.shu}%, 정사 본문에서는 ${b.shu}%입니다. 소설은 제갈량과 유비 쪽 이야기를 더 많이 다루지요. 어떤 책을 세느냐가 이미 결과의 일부입니다.`))};
 $("#dropTop").onclick=()=>{L.dropped=1;save();setT("s2","drop");done()};if(L.dropped)done();
}

// 3) build the score from the records of the person (or topic) in question
function scStage3({x,c}){
 const lens=c.topic==="source"?"jb":"yy";
 const ex=c.who?c.who:c.topic==="wind"?["諸葛亮"]:c.topic==="fire"?["曹操","黃蓋"]:["諸葛亮"];
 const row=(n,ln)=>{const v=ln==="jb"?PP[n].jb:PP[n].yy;return `<div class="kcount"><div><b class="num">${v[0]}</b><span>배와 함께</span></div><div><b class="num">${v[1]}</b><span>불과 함께</span></div><div><b class="num">${v[2]}</b><span>계책과 함께</span></div>${c.topic==="wind"?`<div><b class="num">${v[3]}</b><span>바람과 함께</span></div>`:""}</div>`};
 const examples=c.topic==="source"?`<p class="simple-note">제갈량 · 소설(문단)</p>${row("諸葛亮","yy")}<p class="simple-note">제갈량 · 정사 본문(문장)</p>${row("諸葛亮","jb")}`:ex.map(n=>`<p class="simple-note">${scKo(n)}의 이름이 나온 문단 중에</p>${row(n,"yy")}`).join("");
 const note=c.topic==="wind"?`<p class="wi-assume"><b>바람은 따로 둡니다</b> 바람은 사람의 능력인지 날씨인지 정할 수 없어 점수에 넣지 않고, 마지막 순서에서 +10이라는 가정으로 다룹니다.</p>`:c.topic==="source"?`<p class="wi-assume"><b>단위가 다릅니다</b> 소설은 문단을, 정사는 문장을 셉니다. 그래서 두 기록은 비중(%)으로 견줍니다.</p>`:"";
 originalStageRenderer(3,[["s3","weight","점수 정하기"]],
  step(1,c.who?`${c.who.map(scKo).join("·")}의 기록을 셉니다`:c.topic==="wind"?"바람도 세어 봅니다":c.topic==="fire"?"두 사람의 ‘불’ 기록":"두 책에서 같은 사람을 셉니다","",`<section class="card pane">${examples}${note}</section>`)+
  step(2,"무엇에 무게를 둘지 정해 보시지요","",`<div class="cols"><section class="card pane"><div class="weights" id="wts3"></div><button class="btn" id="fixW">이 점수로 정하기</button></section><section class="card pane simple-result"><p class="simple-note">두 진영의 점수${lens==="jb"?" (정사 본문)":""}</p><div id="score3"></div><p class="simple-note" id="ratio3"></p></section></div>`)+reveal('s3name'),
  {...(c.who?{q:`${c.who.map(scKo).join("·")}의 점수가 ${c.verb==="빼기"?"빠지면":"옮겨 가면"}, 무엇이 함께 움직일까요?`,opts:["그 사람의 실제 능력이 움직입니다.","그 사람의 이름과 배·불·계책 글자가 함께 나온 기록이 움직입니다.","두 편의 점수는 그대로입니다."],ok:1,
    good:"넘어가거나 빠지는 것은 기록에서 센 숫자입니다. 그래서 무엇을 셌는지가 결론의 뜻을 정하지요.",bad:"점수를 무엇으로 만들었는지 떠올려 보시지요."}
   :c.topic==="wind"?{q:"바람을 배·불·계책 점수에 넣지 않은 까닭은?",opts:["바람은 기록에 나오지 않아서","바람이 사람의 능력인지 날씨인지 기록만으로 정할 수 없어서","바람은 결과와 관계없어서"],ok:1,good:"해석이 갈리는 것은 점수에 섞지 않고, 따로 가정으로 둡니다.",bad:"바람이 누구의 것인지 기록이 말해 주는지 살펴보시지요."}
   :c.topic==="fire"?{q:"‘불’에 준 점수가 클수록 이번 질문은 어떻게 될까요?",opts:["불 점수를 0으로 둘 때 달라지는 폭이 커집니다.","아무 차이가 없습니다.","연합군 점수만 줄어듭니다."],ok:0,good:"불에 무게를 많이 둘수록, 불을 없애는 가정의 영향도 커집니다.",bad:"불 점수를 0으로 바꾸면 무엇이 빠지는지 보시지요."}
   :{q:"소설과 정사의 점수를 그대로 견주지 않는 까닭은?",opts:["정사가 더 정확해서","소설은 문단을, 정사는 문장을 세어 단위가 다르기 때문에","두 책의 인물이 달라서"],ok:1,good:"단위가 다른 숫자는 비중(%)으로 바꾸어 견줍니다.",bad:"두 책에서 무엇을 세었는지 보시지요."}),
   ev:()=>{const s=fs(lens);return `점수(배 ${S.w.ship}·불 ${S.w.fire}·계책 ${S.w.plan}): 연합군 ${s.wu+s.shu} vs 조조군 ${s.wei}`}});
 simplifyStage(3);
 const draw=()=>{
  $("#wts3").innerHTML=[['ship','배'],['fire','불'],['plan','계책']].map(([k,l])=>`<div class="w"><span>${l} 1번에</span><span class="stepper-n"><button data-w="${k}" data-d="-1" aria-label="${l} 점수 내리기">−</button><output class="num">${S.w[k]}점</output><button data-w="${k}" data-d="1" aria-label="${l} 점수 올리기">+</button></span></div>`).join('');
  const s=fs(lens),A=s.wu+s.shu,W=s.wei;$("#score3").innerHTML=twoSides({wei:W,ally:A},'점');
  const moved=c.who?c.who.reduce((t,n)=>t+(roster().includes(n)?scoreOf(n,lens):0),0):0;
  $("#ratio3").textContent=c.who?`이번 질문에서 ${c.verb==="빼기"?"빠질":"옮겨 갈"} 점수: ${moved}점 (연합군 점수의 ${A?Math.round(moved/A*100):0}%)`:W?`연합군 점수가 조조군의 약 ${(A/W).toFixed(1)}배`:'';
 };
 $("#wts3").addEventListener('click',e=>{const b=e.target.closest('button[data-w]');if(!b)return;const k=b.dataset.w;S.w[k]=Math.max(0,Math.min(5,S.w[k]+ +b.dataset.d));save();draw()});
 const fix=()=>{setT("s3","weight");show('s3name',named("지표 만들기",c.who?`'무엇을 셀지'와 '몇 점을 줄지'를 정해 숫자 하나로 만든 것을 지표라고 합니다. 마지막 순서에서 ${esc(c.who.map(scKo).join("·"))}의 이 점수가 그대로 ${c.verb==="빼기"?"빠집니다":"조조군으로 옮겨 갑니다"}.`:c.topic==="wind"?"점수에 넣을 것(배·불·계책)과 따로 둘 것(바람)을 나눈 것도 지표를 만드는 일입니다. 바람은 마지막 순서에서 가정으로 다룹니다.":c.topic==="fire"?"불에 준 점수가 클수록 '화공이 통하지 않았다면?'의 영향도 커집니다. 마지막 순서에서는 이 불 점수를 0으로 바꿉니다.":"단위가 다른 기록을 견줄 때는, 같은 규칙으로 센 뒤 비중으로 비교합니다. 마지막 순서에서는 이 규칙 그대로 정사 본문을 셉니다."))};
 $("#fixW").onclick=fix;if(tk("s3","weight"))fix();draw();
}

// 4) does the question's answer survive other scores (and, for wind, other bonus sizes)?
function scStage4({x,c}){
 const L4=S.t.s4d=S.t.s4d||{};
 const wv=v=>wiVerdict(v);
 const after=w=>wiCalc({...x,w}).i,before=w=>wiCalc({w}).i;
 const combos=[];for(let a=0;a<=5;a++)for(let b=0;b<=5;b++)for(let d=0;d<=5;d++){if(!a&&!b&&!d)continue;if(c.topic==="fire"&&b)continue;combos.push({ship:a,fire:b,plan:d})}
 const FRIENDS=c.topic==="wind"?[["바람 보너스를 0으로 보겠습니다",0],["바람 보너스를 10으로 보겠습니다",10],["바람 보너스를 20으로 보겠습니다",20]]
  :[["불에만 무게를 두겠습니다",{ship:0,fire:5,plan:0}],["배에만 무게를 두겠습니다",{ship:5,fire:0,plan:0}],["계책에만 무게를 두겠습니다",{ship:0,fire:0,plan:5}]].filter(f=>!(c.topic==="fire"&&f[1].fire));
 const cur=wiCalc(x).i,curV=wv(cur);
 const P=c.who?c.who.map(scKo).join("·"):"";
 originalStageRenderer(4,[["s4","run","모든 점수 규칙 계산하기"]],
  step(1,c.topic==="wind"?"바람 보너스를 달리 두면":"이런 점수 규칙도 생각해 볼 수 있지요","",`<div class="pcards three" id="friends">${FRIENDS.map(([t,w],i)=>`<div class="pcard"><div class="pcard-h"><b>“${t}”</b></div><p class="pcard-fact">${typeof w==="number"?`바람 +${w}`:`배 ${w.ship} · 불 ${w.fire} · 계책 ${w.plan}`}</p><button class="btn ghost" data-i="${i}">이 규칙으로 계산</button><p class="pcard-tip" hidden></p></div>`).join('')}</div>`)+
  step(2,"가능한 점수 규칙을 모두 살펴보시지요","",`<section class="card pane"><p class="simple-note">${c.topic==="fire"?"불 점수를 0으로 둔 채, 배·계책에 0~5점을 주는 모든 경우는 "+combos.length+"가지입니다.":"배·불·계책에 0~5점을 주는 모든 경우는 215가지입니다."} 각 경우마다 이번 질문의 조건을 적용해 계산합니다.</p><button class="btn" id="runAll">${combos.length}가지 전부 계산하기</button><div id="allRes"></div></section>`)+reveal('s4name'),
  {q:c.topic==="wind"?"바람 보너스와 점수 규칙을 바꿔 봐도 판정이 같다면, ‘바람이 불지 않았다면?’에 대해 말할 수 있는 것은?":`점수 규칙을 다 바꿔 봐도 ‘${x.q.replace(/\s*\(.*\)\s*$/,"").replace(/\?$/,"")}’의 판정이 대부분 같았다면?`,opts:["점수 규칙은 어떻게 정해도 상관없습니다.","살펴본 범위에서 이번 질문의 결론이 점수 규칙에 크게 흔들리지 않습니다.","결론이 반드시 맞습니다."],ok:1,
   good:"규칙을 바꿔도 같은 답이 나오면 그 답을 더 믿을 수 있습니다. 다만 '이 기록으로 센 점수'라는 조건은 남습니다.",bad:"전부 계산한 결과를 살펴보시지요.",
   ev:()=>`${L4.tot}가지 중 ${L4.same}가지에서 판정 '${curV}' 유지 · 범위 ${L4.min}~${L4.max}`});
 simplifyStage(4);
 $("#friends").addEventListener('click',e=>{const b=e.target.closest('button[data-i]');if(!b)return;const [,w]=FRIENDS[+b.dataset.i];const tip=b.nextElementSibling;tip.hidden=false;
  if(typeof w==="number"){const raw=wiCalc({...x,wind:"none"}).i,v=Math.max(0,Math.min(100,raw+w));tip.innerHTML=`지수 <b class="num">${v}</b> → ${wv(v)}`}
  else{const v0=before(w),v1=after(w);tip.innerHTML=`<b class="num">${v0}</b> → <b class="num">${v1}</b> · ${wv(v1)}`}});
 const run=()=>{let same=0,min=100,max=0,down=0;for(const w of combos){const v=after(w),b=before(w);if(wv(v)===curV)same++;min=Math.min(min,v);max=Math.max(max,v);if(v<b)down++}
  Object.assign(L4,{same,tot:combos.length,min,max,down});save();setT("s4","run");
  $("#allRes").innerHTML=`<p class="big-change"><b class="num">${same}</b> / ${combos.length}가지에서 판정 ‘${curV}’이 그대로입니다</p><div class="pctbar"><i style="width:${same/combos.length*100}%"></i></div><p class="simple-note">이번 질문을 적용한 지수는 ${min}~${max} 사이에 있습니다.${c.who?` 그중 ${down}가지에서 ${esc(P)}${scJosa(scKo(c.who[c.who.length-1]),"을","를")} ${c.verb==="빼기"?"빼면":"옮기면"} 지수가 내려갑니다.`:""}</p>`;
  show('s4name',named("민감도 확인",c.topic==="wind"?"바람 보너스와 점수 규칙을 바꿔 봐도 판정이 같은지 확인했습니다. 보너스를 얼마로 두느냐에 따라 숫자는 움직이지만, 판정이 바뀌는 지점이 어디인지 보는 것이 이 확인의 목적이지요.":"내가 정한 점수 대신 다른 점수를 넣어 봐도 이번 질문의 판정이 같은지 확인하는 것입니다. 대부분 같다면, 결론이 점수 고르기에 달려 있지 않다는 뜻입니다."))};
 $("#runAll").onclick=run;if(tk("s4","run"))run();
}

// 5) read the record behind the number that matters for the question
function scStage5({x,c}){
 const L5=S.t.s5d=S.t.s5d||{},s=c.s5;
 const quote=(n,k)=>{const e=(EVID[n]||{})[k];return e?`<p class="simple-note">${srcB('yy',`연의 ${e[0]}회`)} ${scKo(n)}${scJosa(scKo(n),"과","와")} ‘${SC_KNAME[k]}’이 함께 나온 문단</p><blockquote class="evq">${hiKw(e[1],k)}</blockquote>`:""};
 const layers=c.topic==="source"?`<div class="sides"><div class="side"><i style="background:var(--old)"></i><span>정사 본문 · 바람 / 계책</span><b class="num">${PP["諸葛亮"].jb[3]} / ${PP["諸葛亮"].jb[2]}<small>문장</small></b></div><div class="side"><i style="background:var(--wind)"></i><span>배송지 주석 · 바람 / 계책</span><b class="num">${PP["諸葛亮"].jn[3]} / ${PP["諸葛亮"].jn[2]}<small>문장</small></b></div></div>`:"";
 const lead=c.topic==="source"?`<p class="simple-note">제갈량의 기록을 정사의 두 층에서 셉니다.</p>`:`<p class="simple-note">${scKo(s.n)}의 ‘${SC_KNAME[s.k]}’ 문단 ${PP[s.n].yy[SC_KI[s.k]]}개${s.n2?` · ${scKo(s.n2)}의 ‘${SC_KNAME[s.k]}’ 문단 ${PP[s.n2].yy[SC_KI[s.k]]}개`:""}</p>`;
 originalStageRenderer(5,[["s5","victim","원문 읽기"]],
  step(1,"원문을 먼저 읽어 보시지요","",`<section class="card pane">${lead}<button class="btn" id="open5">${c.topic==="source"?"두 층 펼쳐 보기":"원문 펼치기"}</button><div id="txt5"></div></section>`)+ask5Html(s.q,"방금 읽은 기록을 보고 골라 보세요.",s.ask.opts,2)+reveal('s5name'),
  {...s.check,good:"숫자만으로는 알 수 없던 것을 원문에서 확인했습니다. 그래서 뜻밖의 숫자는 기록을 펼쳐 봅니다.",bad:"방금 펼친 기록을 읽어 보시지요.",ev:()=>s.take.slice(0,60)+"…"});
 simplifyStage(5);
 const drawAsk=ask5Wire(L5,s.ask,()=>show('s5name',named("근거 확인",esc(s.take))));
 const open=()=>{setT("s5","victim");$("#open5").hidden=true;
  $("#txt5").innerHTML=c.topic==="source"?layers:quote(s.n,s.k)+(s.n2?quote(s.n2,s.k):"");
  $("#ask5sec").hidden=false;drawAsk()};
 $("#open5").onclick=open;if(tk("s5","victim"))open();
}

/* stage 1 guidance: when a card is doubtful (already dead, or only one passing mention),
   steer toward leaving it out instead of simply confirming the choice */
const MAIN_ROLES={"曹操":"core","許褚":"two","夏侯淵":"one","袁紹":"dead"};
const CARD_SAY={
 dead:{1:["다시 생각해 보시지요.","이미 세상을 떠난 사람입니다. 이름은 나오지만 이 싸움에 참여할 수는 없었지요. 명단에서 빼는 편이 맞겠습니다."],0:["맞습니다.","이름만 언급된 사람은 이 싸움의 기록으로 세지 않습니다."]},
 one:{1:["다시 생각해 보시지요.","딱 한 번 이름만 스친 사람입니다. 이것만으로 싸움에 참여했다고 보기는 어렵지요. 빼는 편을 권합니다."],0:["맞습니다.","한 번 스친 이름까지 세면 명단이 흐려집니다."]},
 core:{0:["다시 생각해 보시지요.","이번 질문의 중심이 되는 사람입니다. 빼면 비교 자체가 어려워지지요. 명단에 넣어 두시지요."],1:["맞습니다.","이번 질문의 중심이 되는 사람입니다. 명단에 있어야 두 진영을 비교할 수 있습니다."]},
 two:{1:["맞습니다.","두 회에 나오므로 ‘2회 이상’ 기준이면 명단에 들어갑니다."],0:["맞습니다.","‘3회 이상’ 기준이라면 빠지는 사람입니다. 어느 쪽이든 기준을 함께 적어 두세요."]}
};
function cardGuide(){
 const L=S.t.s1d||{};
 for(const card of $$("#pcards .pcard")){
  const n=card.dataset.n,role=card.dataset.role||MAIN_ROLES[n],v=L[n],tip=card.querySelector(".pcard-tip");if(!tip)continue;
  if(card.dataset.tip===undefined)card.dataset.tip=tip.innerHTML;
  card.querySelectorAll(".pick button").forEach(b=>b.classList.remove("nudge"));card.classList.remove("doubt");
  if(v===undefined)continue;
  const say=(CARD_SAY[role]||{})[v];
  tip.hidden=false;tip.innerHTML=say?`<b class="${say[0].startsWith("맞")?"ok":"warn"}">${say[0]}</b> ${say[1]}`:card.dataset.tip;
  if(say&&!say[0].startsWith("맞")){card.classList.add("doubt");card.querySelector(`.pick button[data-v="${v?0:1}"]`)?.classList.add("nudge")}
 }
}
const SC_RENDER=[null,scStage1,scStage2,scStage3,scStage4,scStage5];
for(let i=1;i<=5;i++){const main=RENDER[i];RENDER[i]=function(){const sc=scnFor();if(!sc)main.apply(this,arguments);else{applyScenarioText();SC_RENDER[i](sc);markScenario()}
 if(i===1){const box=$("#pcards");if(box){box.addEventListener("click",()=>cardGuide());cardGuide()}}}}

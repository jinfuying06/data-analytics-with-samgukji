// 계책록 계산 코어(prototype/game-demo/core.js)가 기존 화면(red-cliff-lab)과 같은 숫자를 내는지 확인한다.
// 기대값은 tests/latest-site.cjs가 기존 화면에서 확인하는 값과 같다.
const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict');
const Core = require('../prototype/game-demo/core.js').battle;
const ctx = {};
vm.runInNewContext(fs.readFileSync('prototype/red-cliff-lab/src/30-data.js', 'utf8') + ';this.DB=DB;this.BATTLE=BATTLE;this.JEONGSA=JEONGSA', ctx);
const C = Core(ctx.BATTLE);

const PP = C.people(ctx.DB);
const rule = { min: 2, dead: 1 }, w = { ship: 3, fire: 3, plan: 2 };
const r = C.roster(PP, rule);
const count = f => r.filter(n => PP[n].f === f).length;

assert.equal(Object.keys(PP).length, 88, '전체 인물 88명');
assert.equal(r.length, 53, '기본 명단 53명');
assert.deepEqual([count('wei'), count('wu'), count('shu')], [20, 24, 9], '위 20 · 오 24 · 촉 9');

const s = C.factionScores(PP, w, r);
assert.equal(s.wu + s.shu, 1356, '연합 점수');
assert.equal(s.wei, 647, '위 점수');

const MOVED = { 諸葛亮: 'wei' };
assert.equal(C.allyIndex(PP, w, r, null, 'env'), 78, '기록대로');
assert.equal(C.allyIndex(PP, w, r, MOVED, 'env'), 68, '제갈량 이동, 바람=날씨');
assert.equal(C.allyIndex(PP, w, r, MOVED, 'zg'), 48, '제갈량 이동, 바람=제갈량');

const sv = C.sensitivity(PP, r);
assert.equal(sv.cells.length, 215);
assert.equal(sv.win, 215, '215가지 모두 연합 우세');

// 촉 평균과 제갈량을 뺀 평균 (2순서, 기존 화면 20.6 → 11.9)
const shu = r.filter(n => PP[n].f === 'shu');
assert.equal(C.avg(shu.map(n => PP[n].pa)).toFixed(1), '20.6');
assert.equal(C.avg(shu.filter(n => n !== '諸葛亮').map(n => PP[n].pa)).toFixed(1), '11.9');

// 경계: 빈 배열, 0~100 범위, 같은 입력 같은 결과
assert.equal(C.avg([]), 0); assert.equal(C.median([]), 0); assert.equal(C.median([3, 1, 2, 10]), 2.5);
assert.equal(C.allyIndex(PP, w, [], null, 'zg'), 50);
for (const min of [1, 2, 3, 5, 8]) for (const dead of [0, 1]) for (const mode of ['env', 'zg']) {
  const rr = C.roster(PP, { min, dead }), i = C.allyIndex(PP, w, rr, MOVED, mode);
  assert.ok(i >= 0 && i <= 100); assert.equal(i, C.allyIndex(PP, w, rr, MOVED, mode));
}
// 다른 전투 모양: 촉 대 오, 위는 어느 편도 아님, 점수 지표 2개
const Y = Core({ ...ctx.BATTLE, score: ['fire', 'plan'], dead: [],
  sides: { a: { short: '촉군', factions: ['shu'] }, b: { short: '오군', factions: ['wu'] } } });
const ry = Y.roster(PP, { min: 1, dead: 1 }), wy = { fire: 1, plan: 1 };
const sum = f => ry.filter(n => PP[n].f === f).reduce((x, n) => x + PP[n].yy[1] + PP[n].yy[2], 0);
assert.deepEqual(Y.lead(PP, ry, wy), { a: sum('shu'), b: sum('wu') }, '위는 세지 않음');
assert.deepEqual(Object.keys(Y.factionScores(PP, wy, ry)).sort(), ['shu', 'wu']);
assert.equal(Y.sensitivity(PP, ry).cells.length, 35, '지표 2개 → 6×6−1');
assert.equal(Y.verdict(80), '촉군이 크게 앞섬');
// 이릉대전: 오(a) 대 촉(b), 육손을 빼는 가정 실험
const yc = {};
vm.runInNewContext(fs.readFileSync('prototype/game-demo/battles/yiling-data.js', 'utf8') + ';this.DB=DB;this.BATTLE=BATTLE', yc);
const YL = Core(yc.BATTLE), YP = YL.people(yc.DB), yr = YL.roster(YP, rule), yw = { fire: 3, plan: 3, camp: 2 }, OUT = { 陸遜: null };
assert.deepEqual([yr.filter(n => YP[n].f === 'wu').length, yr.filter(n => YP[n].f === 'shu').length], [18, 13], '이릉 명단 오 18 · 촉 13 (미방·사인은 전투 당시 소속인 오)');
assert.deepEqual(YL.factionScores(YP, yw, yr), { wu: 363, shu: 441 });
assert.deepEqual([YL.allyIndex(YP, yw, yr, null, 'env'), YL.allyIndex(YP, yw, yr, OUT, 'env'), YL.allyIndex(YP, yw, yr, OUT, 'zg')], [55, 49, 39], '육손을 빼면 보너스가 따라 빠짐');
assert.equal(YL.sensitivity(YP, yr).win, 13, '215가지 중 13가지만 이긴 오가 앞섬');

// 관도대전: 조조(a) 대 원소(b, 이 전투의 세력 yuan), 허유를 원소 곁에 남기는 가정 실험. 회차가 둘뿐이라 1회 이상 명단
const gc = {};
vm.runInNewContext(fs.readFileSync('prototype/game-demo/battles/guandu-data.js', 'utf8') + ';this.DB=DB;this.BATTLE=BATTLE', gc);
const GD = Core(gc.BATTLE), GP = GD.people(gc.DB), gr = GD.roster(GP, { min: 1, dead: 1 }), gw = { fire: 3, plan: 3, grain: 2 }, STAY = { 許攸: 'yuan' };
assert.deepEqual([gr.filter(n => GP[n].f === 'wei').length, gr.filter(n => GP[n].f === 'yuan').length], [21, 14], '관도 명단 조조군 21 · 원소군 14 (허유·장합·고람은 넘어간 뒤 소속)');
assert.deepEqual(GD.factionScores(GP, gw, gr), { wei: 383, yuan: 254 });
assert.deepEqual([GD.allyIndex(GP, gw, gr, null, 'env'), GD.allyIndex(GP, gw, gr, STAY, 'env'), GD.allyIndex(GP, gw, gr, STAY, 'zg')], [70, 64, 44], '허유를 남기면 오소 가정에 따라 비슷함 / 원소군이 앞섬');
assert.equal(GD.sensitivity(GP, gr).win, 215);
assert.ok(GP['袁紹'].yy[1] > GP['曹操'].yy[1], "원소의 '계책'(16)이 조조(15)보다 많음");
assert.equal(GD.roster(GP, rule).includes('許攸'), false, '2회 기준이면 허유가 빠짐(퀘스트 1의 함정)');

// 전투 내용 파일: 엔진이 읽는 칸이 모두 있는지
for (const id of ['red-cliff', 'yiling', 'guandu']) {
  const w = {}; vm.runInNewContext(fs.readFileSync(`prototype/game-demo/battles/${id}.js`, 'utf8'), { window: w });
  const K = w.CONTENT, B = { 'red-cliff': ctx.BATTLE, yiling: yc.BATTLE, guandu: gc.BATTLE }[id], P = { 'red-cliff': PP, yiling: YP, guandu: GP }[id];
  assert.equal(K.stages.length, 6, id); assert.equal(K.q1.cards.length, 4, id); assert.equal(K.predictions.length, 3, id);
  K.stages.forEach((s, i) => assert.ok(s.short && s.q && s.concept.length === 2 && s.say.length === 4 && s.check.opts.length === 3 && s.check.ok in s.check.opts, `${id} stage ${i + 1}`));
  for (const n of [...K.q1.cards.map(c => c.n), K.q3.example, K.q5.person, K.q6.mover]) assert.ok(P[n], `${id}: ${n} in data`);
  assert.ok(B.winner === 'a' || B.winner === 'b', `${id} winner`);
  assert.ok(B.score.includes(K.q5.indicator) && B.indicators[K.q5.indicator], `${id} q5 indicator`);
  for (const k of ['ev', 'named', 'note', 'askTitle']) assert.ok(K.q5[k], `${id} q5.${k}`);
  for (const k of ['ev', 'named', 'moveButton', 'baseNote', 'movedNote', 'askTitle']) assert.ok(K.q6[k], `${id} q6.${k}`);
  for (const k of ['result', 'interpret', 'movedLean']) assert.ok(K.report[k], `${id} report.${k}`);
  for (const r of K.requests || []) {
    for (const n of r.guessPeople || [r.person]) assert.ok(P[n], `${id} request ${r.id}: ${n} in data`);
    assert.ok(r.cards.length && r.check.why.length === r.check.opts.length && r.reward && r.conclusion, `${id} request ${r.id} fields`);
    if (r.type === 'classify') {
      const keys = r.cats.map(c => c[0]), fi = Object.keys(B.indicators).indexOf(r.indicator);
      assert.equal(r.cards.length, P[r.person].yy[fi], `${id} ${r.id}: 카드 수 = ${r.person}의 '${r.indicator}' 문단 수`);
      r.cards.forEach((c, k) => assert.ok(c.ans.length && c.ans.every(a => keys.includes(a)) && c.why, `${id} ${r.id} card ${k}`));
    }
  }
  assert.ok(fs.readFileSync('prototype/game-demo/index.html', 'utf8').includes(`id:"${id}"`) && new RegExp(`id:"${id}"[^}]*key:"${K.saveKey}"`).test(fs.readFileSync('prototype/game-demo/index.html', 'utf8')), `${id}: 연표 key = saveKey`);
  const sideF = [...B.sides.a.factions, ...B.sides.b.factions], html = fs.readFileSync('prototype/game-demo/index.html', 'utf8');
  assert.ok(K.q6.to === null || sideF.includes(K.q6.to), `${id}: q6.to는 두 편의 세력`);
  for (const f of sideF) assert.ok(new RegExp(`const FN=\\{[^}]*${f}:`).test(html) && html.includes(`--${f}:`), `${id}: 세력 ${f}의 이름과 색이 엔진에 있음`);
  if (K.requests?.length || K.design) assert.ok(K.unlock?.length && K.unlock.every(s => s.length === 4), `${id}: 사다리 열림 대사`);
  if (K.design) for (const k of ['q', 'env', 'follow', 'envShort', 'followShort', 'limit', 'condTitle']) assert.ok(K.design[k], `${id} design.${k}`);
}
assert.equal(JSON.stringify(ctx.JEONGSA['周瑜']), '[150,101]', '정사 주유 본문 150·주석 101문장');
assert.equal(JSON.stringify(ctx.JEONGSA['曹操']), '[1810,1319]', '정사 조조');
console.log('PASS game core: roster 53 (20/24/9), scores 1356/647, index 78→68 and 48, sensitivity 215/215, shu average 20.6→11.9, bounds, other battle shape; yiling 18/13, 363/441, 55→49/39, sensitivity 13/215; guandu 21/14, 383/254, 70→64/44; all content files complete; jeongsa counts');

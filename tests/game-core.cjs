// 계책록 계산 코어(prototype/game-demo/core.js)가 기존 화면(red-cliff-lab)과 같은 숫자를 내는지 확인한다.
// 기대값은 tests/latest-site.cjs가 기존 화면에서 확인하는 값과 같다.
const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict');
const Core = require('../prototype/game-demo/core.js').battle;
const ctx = {};
vm.runInNewContext(fs.readFileSync('prototype/red-cliff-lab/src/30-data.js', 'utf8') + ';this.DB=DB;this.BATTLE=BATTLE', ctx);
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

// 전투 내용 파일: 엔진이 읽는 칸이 모두 있는지
for (const id of ['red-cliff', 'yiling']) {
  const w = {}; vm.runInNewContext(fs.readFileSync(`prototype/game-demo/battles/${id}.js`, 'utf8'), { window: w });
  const K = w.CONTENT, B = id === 'red-cliff' ? ctx.BATTLE : yc.BATTLE, P = id === 'red-cliff' ? PP : YP;
  assert.equal(K.stages.length, 6, id); assert.equal(K.q1.cards.length, 4, id); assert.equal(K.predictions.length, 3, id);
  K.stages.forEach((s, i) => assert.ok(s.short && s.q && s.concept.length === 2 && s.say.length === 4 && s.check.opts.length === 3 && s.check.ok in s.check.opts, `${id} stage ${i + 1}`));
  for (const n of [...K.q1.cards.map(c => c.n), K.q3.example, K.q5.person, K.q6.mover]) assert.ok(P[n], `${id}: ${n} in data`);
  assert.ok(B.winner === 'a' || B.winner === 'b', `${id} winner`);
  assert.ok(B.score.includes(K.q5.indicator) && B.indicators[K.q5.indicator], `${id} q5 indicator`);
  for (const k of ['ev', 'named', 'note', 'askTitle']) assert.ok(K.q5[k], `${id} q5.${k}`);
  for (const k of ['ev', 'named', 'moveButton', 'baseNote', 'movedNote', 'askTitle']) assert.ok(K.q6[k], `${id} q6.${k}`);
  for (const k of ['result', 'interpret', 'movedLean']) assert.ok(K.report[k], `${id} report.${k}`);
}
console.log('PASS game core: roster 53 (20/24/9), scores 1356/647, index 78→68 and 48, sensitivity 215/215, shu average 20.6→11.9, bounds, other battle shape; yiling 18/13, 363/441, 55→49/39, sensitivity 13/215; both content files complete');

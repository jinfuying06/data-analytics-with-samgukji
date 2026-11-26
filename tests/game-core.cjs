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

assert.equal(Object.keys(PP).length, 63, '전체 인물 63명');
assert.equal(r.length, 42, '기본 명단 42명');
assert.deepEqual([count('wei'), count('wu'), count('shu')], [15, 20, 7], '위 15 · 오 20 · 촉 7');

const s = C.factionScores(PP, w, r);
assert.equal(s.wu + s.shu, 1255, '연합 점수');
assert.equal(s.wei, 467, '위 점수');

const MOVED = { 諸葛亮: 'wei' };
assert.equal(C.allyIndex(PP, w, r, null, 'env'), 83, '기록대로');
assert.equal(C.allyIndex(PP, w, r, MOVED, 'env'), 72, '제갈량 이동, 바람=날씨');
assert.equal(C.allyIndex(PP, w, r, MOVED, 'zg'), 52, '제갈량 이동, 바람=제갈량');

const sv = C.sensitivity(PP, r);
assert.equal(sv.cells.length, 215);
assert.equal(sv.win, 215, '215가지 모두 연합 우세');

// 촉 평균과 제갈량을 뺀 평균 (2순서, 기존 화면 22.9 → 11.7)
const shu = r.filter(n => PP[n].f === 'shu');
assert.equal(C.avg(shu.map(n => PP[n].pa)).toFixed(1), '22.9');
assert.equal(C.avg(shu.filter(n => n !== '諸葛亮').map(n => PP[n].pa)).toFixed(1), '11.7');

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
console.log('PASS game core: roster 42 (15/20/7), scores 1255/467, index 83→72 and 52, sensitivity 215/215, shu average 22.9→11.7, bounds, other battle shape');

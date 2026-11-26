/* 계책록 계산 코어.
   화면 상태(S)를 모르는 순수 함수만 둔다. 같은 입력이면 같은 결과.
   전투마다 다른 값(편, 지표, 사망자, 보너스)은 BATTLE(data/curated/battles.json → 게임 데이터)에서 받는다.
   브라우저: const C = Core.battle(BATTLE) / Node 테스트: require("./core.js").battle(BATTLE) */
(function (root) {
  // 게임 데이터의 DB 행 → 인물 사전. chs: 등장한 회 수, pa: 등장 문단 합계, yy: 지표별 문단 수(BATTLE.indicators 순서)
  function people(DB) {
    const PP = {};
    DB.forEach(r => {
      PP[r[0]] = { id: r[0], ko: r[1], f: r[2], ch: r[3], yy: r[4],
        chs: r[3].filter(x => x).length, pa: r[3].reduce((a, b) => a + b, 0) };
    });
    return PP;
  }

  const avg = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0;
  const median = a => {
    if (!a.length) return 0;
    const s = [...a].sort((x, y) => x - y), m = s.length >> 1;
    return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
  };

  function battle(B) {
    const DEAD = new Set(B.dead);
    const at = Object.fromEntries(Object.keys(B.indicators).map((k, i) => [k, i]));
    const A = B.sides.a.factions, W = B.sides.b.factions;
    const side = f => A.includes(f) ? "a" : W.includes(f) ? "b" : null;
    const factionOf = (PP, n, mut) => mut && mut[n] !== undefined ? mut[n] : PP[n].f;

    // 명단: rule.min회 이상 나오고, rule.dead면 이 전투 전에 죽은 사람은 뺀다.
    const roster = (PP, rule) => Object.keys(PP).filter(n => PP[n].chs >= rule.min && !(rule.dead && DEAD.has(n)));

    // 한 사람의 점수 = 점수 지표별 기록 수 × 가중치
    const score = (PP, n, w) => B.score.reduce((s, k) => s + w[k] * PP[n].yy[at[k]], 0);

    // 세력별 점수 합계. mut: {이름: 옮길 세력}으로 소속을 바꿔 계산한다.
    function factionScores(PP, w, r, mut) {
      const o = Object.fromEntries([...A, ...W].map(f => [f, 0]));
      r.forEach(n => { const f = factionOf(PP, n, mut); if (f in o) o[f] += score(PP, n, w); });
      return o;
    }

    // 편 a의 우세 지수(0~100). wmode: "env"=보너스는 환경이라 B.bonus.side(기본 a) 편에 붙고,
    // 그 밖에는 보너스가 B.bonus.person을 따라간다(그 사람이 명단에 있을 때 편 a면 +, 편 b면 −, 명단에서 빠지면 0)
    function allyIndex(PP, w, r, mut, wmode) {
      const s = factionScores(PP, w, r, mut), a = A.reduce((x, f) => x + s[f], 0), b = W.reduce((x, f) => x + s[f], 0);
      let i = a + b ? a / (a + b) * 100 : 50;
      const { points, person } = B.bonus, sign = s => s === "a" ? points : s === "b" ? -points : 0;
      if (wmode === "env") i += sign(B.bonus.side || "a");
      else if (r.includes(person)) i += sign(side(factionOf(PP, person, mut)));
      return Math.max(0, Math.min(100, Math.round(i)));
    }

    const verdict = i => i >= 65 ? `${B.sides.a.short}이 크게 앞섬` : i >= 45 ? "비슷함" : `${B.sides.b.short}이 앞섬`;

    // 편 a와 편 b의 점수 합계 (어느 편에도 없는 세력은 세지 않음)
    function lead(PP, r, w) {
      let a = 0, b = 0;
      r.forEach(n => { const s = side(PP[n].f); if (s === "a") a += score(PP, n, w); else if (s === "b") b += score(PP, n, w); });
      return { a, b };
    }

    // 민감도: 점수 지표마다 0~5점을 주는 모든 규칙(전부 0 제외)에서 편 a가 앞서는지. 지표 3개면 215가지
    function sensitivity(PP, r) {
      const cells = [];
      const walk = (i, w) => {
        if (i === B.score.length) {
          if (B.score.some(k => w[k])) { const x = lead(PP, r, w); cells.push({ w: { ...w }, ok: x.a > x.b }); }
          return;
        }
        for (let v = 0; v <= 5; v++) { w[B.score[i]] = v; walk(i + 1, w); }
      };
      walk(0, {});
      return { win: cells.filter(c => c.ok).length, cells };
    }

    return { B, DEAD, people, avg, median, roster, score, factionScores, allyIndex, verdict, lead, sensitivity };
  }

  root.Core = { people, avg, median, battle };
  if (typeof module !== "undefined") module.exports = root.Core;
})(typeof window !== "undefined" ? window : globalThis);

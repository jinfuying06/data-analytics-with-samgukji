/* 계책록 계산 코어.
   화면 상태(S)를 모르는 순수 함수만 둔다. 같은 입력이면 같은 결과.
   규칙 출처: prototype/red-cliff-lab/src/40-app.js, 80-simplify.js
   브라우저: window.Core / Node 테스트: require("./core.js") */
(function (root) {
  // 적벽(208년) 전에 죽은 인물. 명단 기준 '죽은 사람 뺌'에 쓴다.
  const DEAD = { 袁紹: 202, 呂布: 198, 孫策: 200, 袁術: 199, 董卓: 192, 郭嘉: 207, 劉表: 208 };

  // 30-data.js의 DB 행 → 인물 사전. chs: 등장한 회 수, pa: 등장 문단 합계, yy: [배, 불, 계책, ...]
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

  // 명단: rule.min회 이상 나오고, rule.dead면 적벽 전에 죽은 사람은 뺀다.
  const roster = (PP, rule) => Object.keys(PP).filter(n => PP[n].chs >= rule.min && !(rule.dead && DEAD[n]));

  // 한 사람의 점수 = 배·불·계책 기록 수 × 가중치
  const score = (PP, n, w) => { const v = PP[n].yy; return w.ship * v[0] + w.fire * v[1] + w.plan * v[2]; };

  // 진영별 점수 합계. mut: {이름: 옮길 진영}으로 소속을 바꿔 계산한다.
  function factionScores(PP, w, r, mut) {
    const o = { wei: 0, wu: 0, shu: 0 };
    r.forEach(n => {
      const f = mut && mut[n] !== undefined ? mut[n] : PP[n].f;
      if (f) o[f] += score(PP, n, w);
    });
    return o;
  }

  // 연합군 우세 지수(0~100). wmode: "env"=바람은 날씨라 연합군 +10, "zg"=바람은 제갈량을 따라감(±10)
  function allyIndex(PP, w, r, mut, wmode) {
    const s = factionScores(PP, w, r, mut), A = s.wu + s.shu, W = s.wei;
    let i = A + W ? A / (A + W) * 100 : 50;
    if (wmode === "env") i += 10;
    else if (r.includes("諸葛亮")) {
      const f = mut && mut["諸葛亮"] !== undefined ? mut["諸葛亮"] : "shu";
      i += f === "wei" ? -10 : 10;
    }
    return Math.max(0, Math.min(100, Math.round(i)));
  }

  const verdict = i => i >= 65 ? "연합군이 크게 앞섬" : i >= 45 ? "비슷함" : "조조군이 앞섬";

  // 연합(위가 아닌 쪽)과 위의 점수 합계
  function lead(PP, r, w) {
    let a = 0, b = 0;
    r.forEach(n => { if (PP[n].f === "wei") b += score(PP, n, w); else a += score(PP, n, w); });
    return { a, b };
  }

  // 민감도: 배·불·계책에 0~5점을 주는 215가지(전부 0 제외) 규칙마다 연합군이 앞서는지
  function sensitivity(PP, r) {
    const cells = [];
    for (let ship = 0; ship <= 5; ship++) for (let fire = 0; fire <= 5; fire++) for (let plan = 0; plan <= 5; plan++) {
      if (!ship && !fire && !plan) continue;
      const w = { ship, fire, plan }, x = lead(PP, r, w);
      cells.push({ w, ok: x.a > x.b });
    }
    return { win: cells.filter(c => c.ok).length, cells };
  }

  root.Core = { DEAD, people, avg, median, roster, score, factionScores, allyIndex, verdict, lead, sensitivity };
  if (typeof module !== "undefined") module.exports = root.Core;
})(typeof window !== "undefined" ? window : globalThis);

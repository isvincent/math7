/* 線性規劃 — 課程內容（依據 選修數學乙(下) 第1章 線性規劃 課本 p.6–23） */
'use strict';
const sys = (...a) => `<span class="sys">${a.map(x => `<span>${x}</span>`).join('')}</span>`;
const fr = (a, b) => `<span class="fr"><span>${a}</span><span>${b}</span></span>`;
const M = s => `<span class="mn">${s}</span>`;
const H = (a, b, c, op) => ({ a, b, c, op });

/* ================= 書中圖形 ================= */
const Q1 = { xmin: -1, xmax: 7, ymin: -1, ymax: 5 };
const FIG = {
  f1(h) {
    const p = new Plot(h, { xmin: -4, xmax: 5, ymin: -4, ymax: 5 });
    [-3, -1.5, 0, 1.5, 3].forEach((c, i) => p.line(-1, 2, 2 * c, { color: i === 2 ? 'var(--c1)' : COL[(i + 1) % 5], w: i === 2 ? 3.4 : 2.4, anim: true }));
    p.arrow(1, 0.5, 1, 3.4, { color: 'var(--c6)' }); p.arrow(1, 0.5, 1, -2.4, { color: 'var(--c6)' });
  },
  f2(h) { const p = new Plot(h, { xmin: -4, xmax: 5, ymin: -4, ymax: 5 }); p.line(1, -1, 0, { color: 'var(--c1)', label: 'L₀：x−y=0', at: .9 }); },
  f3(h) {
    const p = new Plot(h, { xmin: -2, xmax: 6, ymin: -4, ymax: 5 });
    p.line(1, -1, 0, { color: 'var(--c1)', label: 'L₀：x−y=0', at: .93, anim: true });
    [1, 2, 3].forEach((c, i) => { p.line(1, -1, c, { color: COL[i + 1], label: `L${'₁₂₃'[i]}：x−y=${c}`, at: .96 - i * .04, anim: true }); p.point(c, 0, { r: 4, color: COL[i + 1] }); });
    p.arrow(0, 0, 3, 0, { color: 'var(--c6)', w: 2.5 });
  },
  f4(h) { const p = new Plot(h, { xmin: -4, xmax: 5, ymin: -4, ymax: 5 }); p.line(1, -1, 0, { color: 'var(--c1)', label: 'L₀：x−y=0', at: .9 }); },
  f4s(h) {
    const p = new Plot(h, { xmin: -5, xmax: 4, ymin: -3, ymax: 6 });
    p.line(1, -1, 0, { color: 'var(--c1)', label: 'L₀：x−y=0', at: .55 });
    [-1, -2, -3].forEach((c, i) => { p.line(1, -1, c, { color: COL[i + 1], label: `L${'₄₅₆'[i]}：x−y=${fmt(c)}`, at: .9 - i * .05, anim: true }); p.point(c, 0, { r: 4, color: COL[i + 1] }); });
  },
  f5(h) {
    const p = new Plot(h, { xmin: -1, xmax: 7, ymin: -1, ymax: 7 });
    [1, 2, 3, 5].forEach((n, i) => p.line(1, 1, n, { color: COL[i], label: `L${i < 3 ? '₁₂₃'[i] : 'ₙ'}：x+y−${i < 3 ? n : 'n'}=0`, at: .1, anim: true }));
    p.text(4.3, 0.9, '…', { size: 22 });
  },
  f6(h) {
    const p = new Plot(h, { xmin: -1, xmax: 5, ymin: -1, ymax: 7 });
    [2, 4, 6].forEach((c, i) => { p.line(2, 1, c, { color: COL[i], label: `L${'₁₂₃'[i]}：2x+y=${c}`, at: .08, anim: true }); p.point(c / 2, 0, { color: COL[i], label: `(${c / 2}, 0)`, dy: 18, dx: 4 }); });
  },
  f7a(h) { const p = new Plot(h, { xmin: -2, xmax: 4, ymin: -2, ymax: 4, ticks: false }); p.line(1, 1, 2, { color: 'var(--c5)', label: 'L：x+y=2', at: .85 }); },
  f7b(h) { const p = new Plot(h, { xmin: -2, xmax: 4, ymin: -2, ymax: 4, ticks: false }); p.half(H(1, 1, 2, '>')); p.line(1, 1, 2, { color: 'var(--c5)', dash: true, label: 'L', at: .9 }); p.text(2.2, 2.6, 'E₁', { size: 20, bold: true }); },
  f7c(h) { const p = new Plot(h, { xmin: -2, xmax: 4, ymin: -2, ymax: 4, ticks: false }); p.half(H(1, 1, 2, '<'), { fill: 'var(--hp2)' }); p.line(1, 1, 2, { color: 'var(--c5)', dash: true, label: 'L', at: .9 }); p.text(-1.3, -0.8, 'E₂', { size: 20, bold: true }); },
  f8a(h) { const p = new Plot(h, { xmin: -2, xmax: 4, ymin: -2, ymax: 4, ticks: false }); p.half(H(1, 1, 2, '>=')); p.line(1, 1, 2, { color: 'var(--c5)' }); p.text(.6, 3.4, 'x+y≥2', { size: 18, bold: true }); },
  f8b(h) { const p = new Plot(h, { xmin: -2, xmax: 4, ymin: -2, ymax: 4, ticks: false }); p.half(H(1, 1, 2, '<='), { fill: 'var(--hp2)' }); p.line(1, 1, 2, { color: 'var(--c5)' }); p.text(-1.7, -1.3, 'x+y≤2', { size: 18, bold: true }); },
  f8c(h) { const p = new Plot(h, { xmin: -2, xmax: 4, ymin: -2, ymax: 4, ticks: false }); p.half(H(1, 1, 2, '<'), { fill: 'var(--hp2)' }); p.line(1, 1, 2, { color: 'var(--c5)', dash: true }); p.text(-1.7, -1.3, 'x+y<2', { size: 18, bold: true }); },
  f9(h) { const p = new Plot(h, { xmin: -5, xmax: 5, ymin: -5, ymax: 5 }); p.half(H(1, -2, -2, '<=')); p.line(1, -2, -2, { color: 'var(--c5)', label: 'L₁：x−2y+2=0', at: .95 }); p.point(0, 0, { color: 'var(--c2)', r: 4 }); },
  f10(h) { const p = new Plot(h, { xmin: -5, xmax: 5, ymin: -5, ymax: 5 }); p.half(H(1, 1, -2, '>'), { fill: 'var(--hp2)' }); p.line(1, 1, -2, { color: 'var(--c2)', dash: true, label: 'L₂：x+y+2=0', at: .25 }); p.point(0, 0, { color: 'var(--c5)', r: 4 }); },
  f11(h) {
    const p = new Plot(h, { xmin: -5, xmax: 5, ymin: -5, ymax: 5 });
    p.regionOf([H(1, -2, -2, '<='), H(1, 1, -2, '>')], { fill: 'var(--region)' });
    p.line(1, -2, -2, { color: 'var(--c5)', label: 'L₁：x−2y+2=0', at: .95 }); p.line(1, 1, -2, { color: 'var(--c2)', dash: true, label: 'L₂：x+y+2=0', at: .25 });
    p.point(-2, 0, { hollow: true, color: 'var(--c1)', label: '(−2, 0)', dy: 20, dx: -50 });
  },
  blank(h) { new Plot(h, { xmin: -5, xmax: 5, ymin: -5, ymax: 5 }); },
  f12s(h) { const p = new Plot(h, { xmin: -5, xmax: 5, ymin: -5, ymax: 5 }); p.half(H(2, -1, 2, '<=')); p.line(2, -1, 2, { color: 'var(--c5)', label: '2x−y−2=0', at: .9 }); },
  f13s(h) {
    const p = new Plot(h, { xmin: -5, xmax: 5, ymin: -5, ymax: 5 });
    p.regionOf([H(2, -1, 2, '<='), H(1, 3, 3, '>')]);
    p.line(2, -1, 2, { color: 'var(--c5)', label: '2x−y−2=0', at: .9 }); p.line(1, 3, 3, { color: 'var(--c2)', dash: true, label: 'x+3y−3=0', at: .08 });
    p.point(9 / 7, 4 / 7, { hollow: true, color: 'var(--c1)', label: '(9/7, 4/7)', dx: 10, dy: 18 });
  },
  f14(h) {
    const p = new Plot(h, { xmin: -4, xmax: 8, ymin: -2, ymax: 6 });
    const hs = [H(1, 2, 6, '>='), H(1, -1, 2, '<='), H(0, 1, 4, '<=')];
    p.regionOf(hs);
    p.cons(hs[0], { color: 'var(--c5)', label: 'x+2y=6', at: .05 }); p.cons(hs[1], { color: 'var(--c2)', label: 'x−y=2', at: .95 }); p.cons(hs[2], { color: 'var(--c7)', label: 'y=4', at: .02, ldy: -2 });
    p.point(-2, 4, { label: 'A(−2, 4)', dy: -10, dx: -10 }); p.point(10 / 3, 4 / 3, { label: 'B(10/3, 4/3)', dy: 22, dx: 4 }); p.point(6, 4, { label: 'C(6, 4)', dy: -10, dx: -30 });
  },
  f15(h) {
    FIG.f14(h);
    const p = h.__plot || null;
  },
  f16(h) {
    const p = new Plot(h, { xmin: -1, xmax: 7, ymin: -1, ymax: 7 });
    const hs = [H(1, 2, 6, '<='), H(2, 1, 6, '<='), H(1, 0, 0, '>='), H(0, 1, 0, '>=')];
    p.regionOf(hs); p.cons(hs[0], { color: 'var(--c5)', label: 'x+2y=6', at: .8 }); p.cons(hs[1], { color: 'var(--c2)', label: '2x+y=6', at: .12 });
    p.point(3, 0, { label: 'A(3, 0)', dy: 20 }); p.point(2, 2, { label: 'B(2, 2)' }); p.point(0, 3, { label: 'C(0, 3)', dx: 8, dy: -4 }); p.point(0, 0, { color: 'var(--c6)' });
  },
  f17(h) {
    const p = new Plot(h, { xmin: -1, xmax: 7, ymin: -1, ymax: 7 });
    const hs = [H(1, 2, 6, '<='), H(2, 1, 6, '<='), H(1, 0, 0, '>='), H(0, 1, 0, '>=')];
    p.regionOf(hs); p.cons(hs[0], { color: 'var(--c5)' }); p.cons(hs[1], { color: 'var(--c2)' });
    [0, 3, 6, 9, 12].forEach((k, i) => p.line(1, 3, k, { color: 'var(--c6)', dash: true, w: 2, op: .85, label: `x+3y=${k}`, at: .97, anim: true }));
    p.point(3, 0, { label: 'A(3, 0)', dy: 20 }); p.point(2, 2, { label: 'B(2, 2)' }); p.point(0, 3, { label: 'C(0, 3)', dx: 8, dy: -4, color: 'var(--c1)' }); p.point(0, 0, { color: 'var(--c6)' });
  },
  f20(h) {
    const p = new Plot(h, { xmin: -2, xmax: 18, ymin: -3, ymax: 32, h: 520, tickX: 2, tickY: 5, stepX: 2, stepY: 5 });
    const hs = [H(5, 4, 80, '<='), H(3, 1, 30, '<='), H(1, 0, 0, '>='), H(0, 1, 0, '>=')];
    p.regionOf(hs); p.cons(hs[0], { color: 'var(--c5)', label: '5x+4y=80', at: .85 }); p.cons(hs[1], { color: 'var(--c2)', label: '3x+y=30', at: .15 });
    p.point(40 / 7, 90 / 7, { label: '(40/7, 90/7)', color: 'var(--c1)' }); p.point(10, 0, {}); p.point(0, 20, {});
    p.line(25, 12, 2080 / 7, { color: 'var(--c6)', dash: true, w: 2, label: '25x+12y=2080/7', at: .9 });
  },
  f21(h) {
    const p = new Plot(h, { xmin: -1, xmax: 12, ymin: -1, ymax: 12 });
    const hs = [H(1, 2, 8, '>='), H(2, 1, 10, '>='), H(1, 0, 0, '>='), H(0, 1, 0, '>=')];
    p.regionOf(hs); p.cons(hs[0], { color: 'var(--c5)', label: 'x+2y=8', at: .9 }); p.cons(hs[1], { color: 'var(--c2)', label: '2x+y=10', at: .62 });
    p.point(0, 10, { label: '(0, 10)' }); p.point(4, 2, { label: '(4, 2)', color: 'var(--c1)' }); p.point(8, 0, { label: '(8, 0)', dy: -10 });
  },
  pr4s(h) {
    const p = new Plot(h, { xmin: -2, xmax: 14, ymin: -2, ymax: 14, tickStep: 2, step: 2 });
    const hs = [H(1, 1, 10, '>='), H(1, -1, 0, '<='), H(0, 1, 10, '<=')];
    p.regionOf(hs); p.cons(hs[0], { color: 'var(--c5)', label: 'x+y=10', at: .9 }); p.cons(hs[1], { color: 'var(--c2)', label: 'x−y=0', at: .9 }); p.cons(hs[2], { color: 'var(--c7)', label: 'y=10', at: .02 });
    p.point(5, 5, { label: '(5, 5)', dy: 18 }); p.point(0, 10, { label: '(0, 10)', dy: -8, dx: -6, anchor: 'end' }); p.point(10, 10, { label: '(10, 10)', dy: -8 });
  },
  pr5s(h) {
    const p = new Plot(h, { xmin: -2, xmax: 22, ymin: -3, ymax: 48, h: 520, tickX: 2, tickY: 5, stepX: 2, stepY: 5 });
    const hs = [H(5, 2, 90, '<='), H(1, 1, 30, '<='), H(1, 0, 0, '>='), H(0, 1, 0, '>=')];
    p.regionOf(hs); p.cons(hs[0], { color: 'var(--c5)', label: '5x+2y=90', at: .12 }); p.cons(hs[1], { color: 'var(--c2)', label: 'x+y=30', at: .9 });
    p.point(18, 0, { label: '(18, 0)', dy: -10 }); p.point(10, 20, { label: '(10, 20)', color: 'var(--c1)' }); p.point(0, 30, { label: '(0, 30)' });
  },
  pr6s(h) {
    const p = new Plot(h, { xmin: -1, xmax: 12, ymin: -1, ymax: 10 });
    const hs = [H(2, 1, 8, '>='), H(2, 7, 20, '>='), H(1, 0, 0, '>='), H(0, 1, 0, '>=')];
    p.regionOf(hs); p.cons(hs[0], { color: 'var(--c5)', label: '2x+y=8', at: .2 }); p.cons(hs[1], { color: 'var(--c2)', label: '2x+7y=20', at: .9 });
    p.point(0, 8, { label: '(0, 8)' }); p.point(3, 2, { label: '(3, 2)', color: 'var(--c1)' }); p.point(10, 0, { label: '(10, 0)', dy: -10 });
  },
  ex1s(h) {
    const p = new Plot(h, { xmin: -5, xmax: 6, ymin: -4, ymax: 8 });
    const hs = [H(3, 2, 12, '<='), H(1, 1, 2, '>')];
    p.regionOf(hs); p.cons(hs[0], { color: 'var(--c5)', label: '3x+2y−12=0', at: .2 }); p.cons(hs[1], { color: 'var(--c2)', label: 'x+y−2=0', at: .95 });
  },
  ex2(h) {
    const p = new Plot(h, { xmin: -1, xmax: 8, ymin: -1, ymax: 4 });
    p.half(H(2, 3, 12, '>'), { fill: 'var(--hp2)' });
    p.regionOf([H(2, 3, 12, '<'), H(1, -3, -3, '<')], { fill: 'var(--hp)' });
    p.regionOf([H(1, -3, -3, '>'), H(2, 3, 12, '<=')], { fill: 'rgba(255,93,143,.42)' });
    p.line(1, -3, -3, { color: 'var(--c2)', dash: true }); p.line(2, 3, 12, { color: 'var(--c5)', w: 2 });
    sv('line', { x1: p.X(3), y1: p.Y(2), x2: p.X(7.5), y2: p.Y(-1), stroke: 'var(--c1)', 'stroke-width': 3.2 }, p.L.lines);
    p.point(0, 1, { hollow: true, color: 'var(--c1)', label: '(0, 1)', dy: 18 }); p.point(3, 2, { hollow: true, color: 'var(--c1)', label: '(3, 2)', dy: -10, dx: -18 }); p.point(6, 0, { color: 'var(--c1)', label: '(6, 0)', dy: -10 });
  },
  ex4(h) {
    const p = new Plot(h, { xmin: -0.5, xmax: 4.5, ymin: -0.5, ymax: 4.2, ticks: false, step: .5 });
    p.line(1, -2, 0, { color: 'var(--c5)', label: 'L：x−2y=0', at: .9, ldy: -8 });
    [['A', 1, 2], ['B', 1, 3.5], ['C', 2.5, 3.5], ['D', 2.5, 2]].forEach(([n, x, y]) => p.point(x, y, { color: 'var(--c2)', label: n, dx: -18, dy: -6 }));
  },
  ex6(h) {
    const p = new Plot(h, { xmin: -3, xmax: 3, ymin: -2, ymax: 5, ticks: false });
    [[-3, 'L₁', 'var(--c5)'], [1, 'L₂', 'var(--c7)'], [4, 'L₃', 'var(--c2)']].forEach(([c, n, col]) => p.line(-3, 1, c, { color: col, label: n, at: .97 }));
  },
  ex7(h) {
    const p = new Plot(h, { xmin: -3, xmax: 3, ymin: -0.8, ymax: 4.2, ticks: false, step: .5 });
    const s3 = Math.sqrt(3), V = [['A', -1, 0], ['B', 1, 0], ['C', 2, s3], ['D', 1, 2 * s3], ['E', -1, 2 * s3], ['F', -2, s3]];
    p.polygon(V.map(v => [v[1], v[2]]), { fill: 'rgba(58,134,255,.12)', stroke: 'var(--c5)', w: 2.5 });
    V.forEach(([n, x, y]) => p.point(x, y, { r: 4, color: 'var(--c5)', label: n, dx: x < 0 ? -18 : 8, dy: y === 0 ? 20 : -6 }));
  },
  ex9(h) {
    const p = new Plot(h, { xmin: -6, xmax: 24, ymin: -4, ymax: 38, h: 540, tickStep: 5, step: 5 });
    const A = [4, 1], B = [21, 35], C = [-23 / 7, 75 / 7];
    p.polygon([A, B, C], { fill: 'rgba(58,134,255,.22)', stroke: 'var(--c5)', w: 2 });
    p.line(2, -1, 7, { color: 'var(--ink2)', w: 1.5 }); p.line(1, -1, -14, { color: 'var(--ink2)', w: 1.5 }); p.line(4, 3, 19, { color: 'var(--ink2)', w: 1.5 });
    p.point(...A, { color: 'var(--ink)', label: 'A', dy: 18 }); p.point(...B, { color: 'var(--ink)', label: 'B' }); p.point(...C, { color: 'var(--ink)', label: 'C', dx: -16 });
    p.point(5, 3, { label: '(5, 3)', dx: 10, dy: 10 }); p.point(7, 7, { label: '(7, 7)', dx: 10 });
  },
  ex8s(h) {
    const p = new Plot(h, { xmin: -5, xmax: 50, ymin: -5, ymax: 55, tickStep: 10, step: 5 });
    const hs = [H(1, 1, 50, '<='), H(1, 1, 30, '>='), H(1, 0, 0, '>='), H(1, 0, 40, '<='), H(0, 1, 0, '>='), H(0, 1, 50, '<=')];
    p.regionOf(hs); p.cons(hs[0], { color: 'var(--c5)', label: 'x+y=50', at: .9 }); p.cons(hs[1], { color: 'var(--c2)', label: 'x+y=30', at: .9 }); p.cons(hs[3], { color: 'var(--c7)', label: 'x=40', at: .95 });
    Geo.vertices(hs).forEach(v => p.point(v[0], v[1], { r: 4.5, label: ptT(v), color: v[0] === 40 && v[1] === 10 ? 'var(--c1)' : 'var(--c6)', dx: 6, dy: v[1] > 40 ? 16 : -6 }));
  },
  ex10s(h) {
    const p = new Plot(h, { xmin: -2, xmax: 28, ymin: -3, ymax: 46, h: 540, tickX: 4, tickY: 5, stepX: 2, stepY: 5 });
    const hs = [H(7, 2, 84, '>='), H(1, 2, 24, '>='), H(3, 2, 60, '>='), H(1, 0, 0, '>='), H(0, 1, 0, '>=')];
    p.regionOf(hs); p.cons(hs[0], { color: 'var(--c5)', label: '7x+2y=84', at: .05 }); p.cons(hs[1], { color: 'var(--c7)', label: 'x+2y=24', at: .95 }); p.cons(hs[2], { color: 'var(--c2)', label: '3x+2y=60', at: .6 });
    [[0, 42], [6, 21], [18, 3], [24, 0]].forEach(v => p.point(v[0], v[1], { label: ptT(v), color: v[0] === 18 ? 'var(--c1)' : 'var(--c6)', dx: 8, dy: v[1] === 0 ? -10 : -4 }));
  }
};
FIG.f15 = h => {
  const p = new Plot(h, { xmin: -4, xmax: 11, ymin: -2, ymax: 7 });
  const hs = [H(1, 2, 6, '>='), H(1, -1, 2, '<='), H(0, 1, 4, '<=')];
  p.regionOf(hs);
  p.cons(hs[0], { color: 'var(--c5)', label: 'x+2y=6', at: .03 }); p.cons(hs[1], { color: 'var(--c2)', label: 'x−y=2', at: .95 }); p.cons(hs[2], { color: 'var(--c7)', label: 'y=4', at: .02 });
  [[2, 'x+y=2'], [7, 'x+y=7'], [10, 'x+y=10']].forEach(([k, l], i) => p.line(1, 1, k, { color: 'var(--c6)', dash: true, w: 2, label: l, at: .93, anim: true }));
  p.point(-2, 4, { label: 'A(−2, 4)', dy: -10, dx: -10 }); p.point(10 / 3, 4 / 3, { label: 'B(10/3, 4/3)', dy: 22, dx: -40 }); p.point(6, 4, { label: 'C(6, 4)', dy: -10 });
};
FIG.f19 = FIG.f16;

/* ================= 課文 ================= */
const CHAPTER_INTRO = {
  zh: '生活上及科技上的許多實際問題，常常是需要在某些限制條件之下求某個量的最大值或最小值，這也是數學的重要應用之一。本章的線性規劃，就是要處理這一類問題，能夠在一些特殊的情況下求出最佳解。線性規劃在經濟學、商業、管理、作業研究等領域中都有大量的應用，如物流路線設計、商品庫存等問題，都可以用線性規劃來描述並求解。',
  en: 'Many practical problems in daily life and technology ask for the maximum or minimum of some quantity under certain constraints — one of the most important applications of mathematics. Linear programming, the topic of this chapter, handles exactly this kind of problem and finds the optimal solution in special situations. It is used widely in economics, business, management and operations research, e.g. for designing logistics routes and managing inventory.'
};

const LESSONS = [
  {
    id: 'l1', icon: '📏', color: 'bgy', pages: [8, 11],
    title: { zh: '1　平行直線系', en: '1  Families of Parallel Lines' },
    sub: { zh: '直線平移、斜率與截距的變化', en: 'Translating lines, slope and intercepts' },
    blocks: [
      { k: 'h', zh: '章首引例：學期成績最多幾分？', en: 'Opening problem: the highest possible semester grade' },
      { k: 'p', zh: '數學老師計算學期成績的方法是平時成績（<i>x</i>）占 30％，段考成績（<i>y</i>）占 70％，已知小毅平時成績加上段考成績（<i>x</i>＋<i>y</i>）不超過 150 分，那麼學期成績最多可能有幾分？類似這樣的問題（在某些條件下求某個量的最大值或最小值）是日常生活中常常碰到的。',
        en: 'A math teacher computes the semester grade as 30% of the daily score (<i>x</i>) plus 70% of the exam score (<i>y</i>). Xiao-Yi\'s daily score plus exam score (<i>x</i>+<i>y</i>) is at most 150. What is the highest possible semester grade? Problems like this — maximizing or minimizing a quantity under conditions — appear everywhere in daily life.' },
      { k: 'table', html: `<table class="t"><tr><th></th><th data-zh="平時成績（30％）" data-en="Daily (30%)"></th><th data-zh="段考成績（70％）" data-en="Exam (70%)"></th><th data-zh="學期成績" data-en="Semester"></th></tr><tr><td data-zh="小如" data-en="Ru"></td><td>⋯</td><td>⋯</td><td>⋯</td></tr><tr><td data-zh="小偉" data-en="Wei"></td><td>⋯</td><td>⋯</td><td>⋯</td></tr><tr><td data-zh="小毅" data-en="Yi"></td><td class="m">x</td><td class="m">y</td><td>？</td></tr></table>` },
      { k: 'p', zh: `在這個例子中，我們在 ${M('0≤x≤100，0≤y≤100，x＋y≤150')} 的條件下求 ${M('0.3x＋0.7y')} 的最大值，正是本章要介紹的「線性規劃」的例子。本章一開始先複習平行直線、二元一次不等式等相關概念，再介紹線性規劃。`,
        en: `Here we maximize ${M('0.3x + 0.7y')} subject to ${M('0 ≤ x ≤ 100, 0 ≤ y ≤ 100, x + y ≤ 150')} — exactly a "linear programming" problem. We first review parallel lines and linear inequalities in two variables, then introduce linear programming.` },
      { k: 'widget', w: 'grade' },
      { k: 'h', zh: '平行直線系', en: 'Families of parallel lines' },
      { k: 'p', zh: '在第一冊中曾經介紹過兩平行直線的斜率相等，反之，斜率相等的兩相異直線必平行。第一冊中也介紹過直線平移只會改變直線的位置，不會改變斜率。因此，如圖 1 所示，將一直線平移後可得到一系列互相平行的直線，這些直線稱為<b>平行直線系</b>。',
        en: 'In Book 1 we learned that parallel lines have equal slopes, and conversely two distinct lines with equal slopes are parallel. Translating a line changes only its position, not its slope. So, as in Figure 1, translating a line gives a series of mutually parallel lines, called a <b>family of parallel lines</b>.' },
      { k: 'figs', items: [{ id: 'f1', cap: { zh: '圖 1', en: 'Figure 1' } }] },
      { k: 'ex', no: 1,
        q: { zh: '設 L₀ 的方程式為 x－y＝0，將直線 L₀ 分別向右平移 1 單位、2 單位、3 單位，得直線 L₁、L₂、L₃，試在坐標平面上畫出直線 L₁，L₂，L₃，並求其方程式。',
             en: 'Let L₀ be x − y = 0. Translate L₀ to the right by 1, 2 and 3 units to get L₁, L₂, L₃. Draw L₁, L₂, L₃ on the coordinate plane and find their equations.' },
        figs: [{ id: 'f2', cap: { zh: '圖 2', en: 'Figure 2' } }],
        sol: { zh: '如圖 3 所示，直線 L₀ 為過原點 O(0, 0) 且斜率為 1 的直線。將直線 L₀ 分別向右平移 1、2、3 單位，得直線 L₁、L₂、L₃。<br>所以直線 L₁ 為過點 (1, 0) 且斜率為 1 的直線，其方程式為 <b>x－y＝1</b>。<br>直線 L₂ 為過點 (2, 0) 且斜率為 1 的直線，其方程式為 <b>x－y＝2</b>。<br>直線 L₃ 為過點 (3, 0) 且斜率為 1 的直線，其方程式為 <b>x－y＝3</b>。',
               en: 'As in Figure 3, L₀ passes through the origin O(0, 0) with slope 1. Translating it right by 1, 2, 3 units gives L₁, L₂, L₃.<br>L₁ passes through (1, 0) with slope 1: <b>x − y = 1</b>.<br>L₂ passes through (2, 0) with slope 1: <b>x − y = 2</b>.<br>L₃ passes through (3, 0) with slope 1: <b>x − y = 3</b>.' },
        solFigs: [{ id: 'f3', cap: { zh: '圖 3', en: 'Figure 3' } }] },
      { k: 'pr', id: 'p1',
        q: { zh: '承例題 1，將直線 L₀ 分別向左平移 1 單位、2 單位、3 單位，得直線 L₄、L₅、L₆，試在坐標平面上畫出直線 L₄，L₅，L₆，並求其方程式。',
             en: 'Continuing Example 1, translate L₀ to the left by 1, 2, 3 units to get L₄, L₅, L₆. Draw them and find their equations.' },
        figs: [{ id: 'f4', cap: { zh: '圖 4', en: 'Figure 4' } }],
        check: { t: 'num', pre: { zh: '方程式 x－y＝□，請填入常數：', en: 'Equation x − y = □. Fill in the constants:' }, f: [{ lab: 'L₄', a: -1 }, { lab: 'L₅', a: -2 }, { lab: 'L₆', a: -3 }] },
        sol: { zh: 'L₄ 過 (−1, 0) 且斜率為 1：<b>x－y＝−1</b>；L₅ 過 (−2, 0)：<b>x－y＝−2</b>；L₆ 過 (−3, 0)：<b>x－y＝−3</b>。',
               en: 'L₄ passes through (−1, 0) with slope 1: <b>x − y = −1</b>; L₅ through (−2, 0): <b>x − y = −2</b>; L₆ through (−3, 0): <b>x − y = −3</b>.' },
        solFigs: [{ id: 'f4s', cap: { zh: '解答圖', en: 'Solution' } }] },
      { k: 'p', zh: '從例題 1 中，我們知道直線 x－y＝0、x－y＝1、x－y＝2、x－y＝3 這些直線都是互相平行的。',
        en: 'From Example 1, the lines x − y = 0, x − y = 1, x − y = 2, x − y = 3 are all parallel.' },
      { k: 'key', zh: `另外，因為直線 L：ax＋by＋c＝0（b≠0）的斜率為 ${fr('−a', 'b')}，所以如果維持 x、y 的係數不變，只改變常數項，如此可得一系列斜率相等、位置不同的直線，稱為<b>平行直線系</b>。`,
        en: `Since the line L: ax + by + c = 0 (b ≠ 0) has slope ${fr('−a', 'b')}, keeping the coefficients of x and y fixed and changing only the constant term gives a series of lines with equal slope but different positions — a <b>family of parallel lines</b>.` },
      { k: 'figs', items: [{ id: 'f5', cap: { zh: '圖 5', en: 'Figure 5' } }] },
      { k: 'p', zh: '如圖 5 所示，L₁，L₂，L₃，⋯，Lₙ 即構成一個平行直線系。在圖 5 中，直線 L₁ 往上方平行移動得到 L₂，L₃，⋯，Lₙ，其 x 截距會愈來愈大，y 截距也會愈來愈大，截距的變化跟常數項的改變有直接的關係。',
        en: 'In Figure 5, L₁, L₂, L₃, …, Lₙ form a family of parallel lines. Moving L₁ upward gives L₂, L₃, …, Lₙ; both the x-intercept and y-intercept keep increasing — the change in intercepts is directly related to the change in the constant term.' },
      { k: 'widget', w: 'family' },
      { k: 'ex', no: 2,
        q: { zh: '已知坐標平面上有三直線 L₁：2x＋y＝2，L₂：2x＋y＝4，L₃：2x＋y＝6。設直線 L₁、L₂、L₃ 與 x 軸的交點分別為 (a₁, 0)、(a₂, 0)、(a₃, 0)，試比較 a₁，a₂，a₃ 的大小關係。',
             en: 'Three lines L₁: 2x + y = 2, L₂: 2x + y = 4, L₃: 2x + y = 6 meet the x-axis at (a₁, 0), (a₂, 0), (a₃, 0). Compare a₁, a₂, a₃.' },
        sol: { zh: '如圖 6 所示，<br>直線 L₁ 與 x 軸交點為 (1, 0)，所以得 a₁＝1。<br>直線 L₂ 與 x 軸交點為 (2, 0)，所以得 a₂＝2。<br>直線 L₃ 與 x 軸交點為 (3, 0)，所以得 a₃＝3。<br>因此得 <b>a₁＜a₂＜a₃</b>。',
               en: 'As in Figure 6,<br>L₁ meets the x-axis at (1, 0), so a₁ = 1.<br>L₂ meets it at (2, 0), so a₂ = 2.<br>L₃ meets it at (3, 0), so a₃ = 3.<br>Hence <b>a₁ < a₂ < a₃</b>.' },
        solFigs: [{ id: 'f6', cap: { zh: '圖 6', en: 'Figure 6' } }] },
      { k: 'pr', id: 'p2',
        q: { zh: '承例題 2，設直線 L₁、L₂、L₃ 與 y 軸的交點分別為 (0, b₁)、(0, b₂)、(0, b₃)，試比較 b₁，b₂，b₃ 的大小關係。',
             en: 'Continuing Example 2, L₁, L₂, L₃ meet the y-axis at (0, b₁), (0, b₂), (0, b₃). Compare b₁, b₂, b₃.' },
        check: { t: 'mc', o: [{ zh: 'b₁＜b₂＜b₃', en: 'b₁ < b₂ < b₃' }, { zh: 'b₁＞b₂＞b₃', en: 'b₁ > b₂ > b₃' }, { zh: 'b₁＝b₂＝b₃', en: 'b₁ = b₂ = b₃' }, { zh: 'b₂＜b₁＜b₃', en: 'b₂ < b₁ < b₃' }], a: 0 },
        sol: { zh: '令 x＝0：L₁ 得 y＝2，L₂ 得 y＝4，L₃ 得 y＝6，所以 b₁＝2，b₂＝4，b₃＝6，即 <b>b₁＜b₂＜b₃</b>。', en: 'Put x = 0: L₁ gives y = 2, L₂ gives y = 4, L₃ gives y = 6, so b₁ = 2, b₂ = 4, b₃ = 6, i.e. <b>b₁ < b₂ < b₃</b>.' } }
    ]
  },
  {
    id: 'l2', icon: '🌗', color: 'bgg', pages: [12, 14],
    title: { zh: '2　二元一次不等式', en: '2  Linear Inequalities in Two Variables' },
    sub: { zh: '半平面、實線與虛線、聯立不等式', en: 'Half-planes, solid vs dashed lines, systems' },
    blocks: [
      { k: 'p', zh: '在第一冊中我們已經介紹過二元一次不等式及其圖形。例如：x＋y＝2 的圖形是圖 7a 中的直線 L，x＋y＞2 的圖形是圖 7b 中的半平面 E₁，x＋y＜2 的圖形是圖 7c 中的半平面 E₂。',
        en: 'Book 1 introduced linear inequalities in two variables and their graphs. E.g. the graph of x + y = 2 is the line L in Fig. 7a, x + y > 2 is the half-plane E₁ in Fig. 7b, and x + y < 2 is the half-plane E₂ in Fig. 7c.' },
      { k: 'figs', items: [{ id: 'f7a', cap: { zh: '圖 7a', en: 'Fig. 7a' } }, { id: 'f7b', cap: { zh: '圖 7b', en: 'Fig. 7b' } }, { id: 'f7c', cap: { zh: '圖 7c', en: 'Fig. 7c' } }] },
      { k: 'p', zh: '如果將半平面 E₁ 與直線 L 合起來，就是 x＋y≥2 的圖形，如圖 8a；將半平面 E₂ 與直線 L 合起來，就是 x＋y≤2，如圖 8b。',
        en: 'Combining E₁ with the line L gives the graph of x + y ≥ 2 (Fig. 8a); combining E₂ with L gives x + y ≤ 2 (Fig. 8b).' },
      { k: 'figs', items: [{ id: 'f8a', cap: { zh: '圖 8a　x＋y≥2', en: 'Fig. 8a  x+y≥2' } }, { id: 'f8b', cap: { zh: '圖 8b　x＋y≤2', en: 'Fig. 8b  x+y≤2' } }, { id: 'f8c', cap: { zh: '圖 8c　x＋y＜2', en: 'Fig. 8c  x+y<2' } }] },
      { k: 'key', zh: '當不等式<b>含等號</b>時，圖形就包含界線 L，此時直線 L 以<b>實線</b>表示；當不等式<b>不含等號</b>時，圖形就不包含界線 L，此時直線 L 以<b>虛線</b>表示，如圖 8c 所示。',
        en: 'When the inequality <b>includes equality</b>, the graph includes the boundary L, drawn as a <b>solid line</b>; when it <b>does not</b>, the boundary is excluded and drawn as a <b>dashed line</b> (Fig. 8c).' },
      { k: 'h', zh: '怎麼決定取哪一個半平面？', en: 'Which half-plane to take?' },
      { k: 'p', zh: '實際畫圖時，怎麼決定取哪一個半平面呢？以 x＋y＜2 為例，先畫出 x＋y＝2 的直線，然後任取一點（通常取原點 O(0, 0)），發現 0＋0＜2，意思是 (0, 0) 在 x＋y＜2 的半平面上。也就是說，包含 (0, 0) 的那個半平面就是 x＋y＜2 的圖形。若直線通過原點，則可取點 (1, 0) 或 (0, 1) 來驗算。',
        en: 'How do we decide which half-plane to shade? Take x + y < 2: first draw the line x + y = 2, then pick any test point (usually the origin O(0, 0)). Since 0 + 0 < 2, (0, 0) lies in the half-plane x + y < 2, so the half-plane containing (0, 0) is the graph. If the line passes through the origin, test (1, 0) or (0, 1) instead.' },
      { k: 'widget', w: 'testpoint' },
      { k: 'ex', no: 3,
        q: { zh: `試在坐標平面上，畫出下列不等式的圖形。<br>⑴ 二元一次不等式 x－2y＋2≤0。<br>⑵ 二元一次聯立不等式 ${sys('x－2y＋2≤0，', 'x＋y＋2＞0。')}`,
             en: `Draw the graphs of:<br>(1) the inequality x − 2y + 2 ≤ 0;<br>(2) the system ${sys('x − 2y + 2 ≤ 0,', 'x + y + 2 > 0.')}` },
        sol: { zh: `⑴ 先畫出直線 L₁：x－2y＋2＝0，將原點 O(0, 0) 代入 x－2y＋2 得 0－0＋2＝2＞0。故不等式 x－2y＋2≤0 的圖形為<b>不含原點</b> O(0, 0) 的半平面與 L₁，如圖 9 所示。<br>⑵ 第⑴小題中，已畫出 x－2y＋2≤0 的圖形，再畫 x＋y＋2＞0 的圖形。畫出直線 L₂：x＋y＋2＝0，將原點 O(0, 0) 代入 x＋y＋2 得 0＋0＋2＝2＞0，故不等式 x＋y＋2＞0 的圖形為<b>含原點</b> O(0, 0) 的半平面，如圖 10 所示。<br>上述兩圖形的共同部分，即為聯立不等式 ${sys('x－2y＋2≤0，', 'x＋y＋2＞0')} 的圖形，如圖 11 紅色部分所示。`,
               en: `(1) Draw L₁: x − 2y + 2 = 0. Substituting O(0, 0): 0 − 0 + 2 = 2 > 0. So the graph of x − 2y + 2 ≤ 0 is the half-plane <b>not containing the origin</b>, together with L₁ (Fig. 9).<br>(2) Now draw x + y + 2 > 0. Draw L₂: x + y + 2 = 0; substituting O gives 2 > 0, so the graph is the half-plane <b>containing the origin</b> (Fig. 10), boundary excluded.<br>The common part of the two graphs is the graph of the system — the red region in Fig. 11.` },
        solFigs: [{ id: 'f9', cap: { zh: '圖 9', en: 'Figure 9' } }, { id: 'f10', cap: { zh: '圖 10', en: 'Figure 10' } }, { id: 'f11', cap: { zh: '圖 11', en: 'Figure 11' } }] },
      { k: 'pr', id: 'p3',
        q: { zh: `⑴ 試在圖 12 的坐標平面上，畫出二元一次不等式 2x－y－2≤0 的圖形。<br>⑵ 試在圖 13 的坐標平面上，畫出二元一次聯立不等式 ${sys('2x－y－2≤0，', 'x＋3y－3＞0')} 的圖形。`,
             en: `(1) On Fig. 12, draw the graph of 2x − y − 2 ≤ 0.<br>(2) On Fig. 13, draw the graph of the system ${sys('2x − y − 2 ≤ 0,', 'x + 3y − 3 > 0')}.` },
        check: { t: 'shade', hs: [H(2, -1, 2, '<='), H(1, 3, 3, '>')], names: ['2x−y−2≤0', 'x+3y−3>0'] },
        sol: { zh: '⑴ 畫直線 2x－y－2＝0（實線），原點代入得 −2≤0 成立，取<b>含原點</b>的半平面（含界線）。<br>⑵ 再畫 x＋3y－3＝0（虛線），原點代入得 −3＞0 不成立，取<b>不含原點</b>的半平面；兩者共同部分即為所求，兩直線交於 (9/7, 4/7)。',
               en: '(1) Draw 2x − y − 2 = 0 (solid). The origin gives −2 ≤ 0, true, so take the half-plane <b>containing the origin</b> (with the line).<br>(2) Draw x + 3y − 3 = 0 (dashed). The origin gives −3 > 0, false, so take the half-plane <b>not containing the origin</b>. The common part is the answer; the lines meet at (9/7, 4/7).' },
        solFigs: [{ id: 'f12s', cap: { zh: '⑴ 圖 12 解答', en: '(1) Fig. 12 answer' } }, { id: 'f13s', cap: { zh: '⑵ 圖 13 解答', en: '(2) Fig. 13 answer' } }] }
    ]
  },
  {
    id: 'l3', icon: '🎯', color: 'bgr', pages: [14, 20],
    title: { zh: '3　線性規劃', en: '3  Linear Programming' },
    sub: { zh: '可行解區域、目標函數、平行線法與頂點法', en: 'Feasible region, objective, parallel-line & vertex methods' },
    blocks: [
      { k: 'p', zh: '許多日常生活中所產生的現實問題都和二元一次聯立不等式有關。例如商人在有限資源限制下，尋找資源最佳分配的生產方法，以獲得最大利潤的問題，這樣的問題，是可以利用數學方法處理的。如何找出一組符合限制條件的最佳解是本章所要討論的重點。',
        en: 'Many real-world problems involve systems of linear inequalities — e.g. a merchant with limited resources seeking the best allocation to maximize profit. Such problems can be handled mathematically; finding the best solution that satisfies the constraints is the focus of this chapter.' },
      { k: 'p', zh: `我們先來看一個例子：已知實數數對 (x, y) 滿足 ${sys('x＋2y≥6，', 'x－y≤2，', 'y≤4，')} 那麼，要如何求 x＋y 的最大值或最小值呢？`,
        en: `An example: real pairs (x, y) satisfy ${sys('x + 2y ≥ 6,', 'x − y ≤ 2,', 'y ≤ 4.')} How do we find the maximum or minimum of x + y?` },
      { k: 'key', zh: '首先，我們把滿足聯立不等式的數對 (x, y) 稱為<b>可行解</b>，所有可行解在平面上所形成的區域稱為<b>可行解區域</b>，如圖 14 中的 △ABC 內部及邊界區域。',
        en: 'A pair (x, y) satisfying the system is a <b>feasible solution</b>; the region formed by all feasible solutions is the <b>feasible region</b> — the interior and boundary of △ABC in Figure 14.' },
      { k: 'figs', items: [{ id: 'f14', cap: { zh: '圖 14', en: 'Figure 14' } }] },
      { k: 'key', zh: '在這個問題中，我們要求 x＋y 的最大值或最小值，x＋y 稱為本問題的<b>目標函數</b>，產生最大值或最小值的點 (x, y) 稱為<b>最佳解</b>。',
        en: 'Here we want the maximum or minimum of x + y; x + y is the <b>objective function</b>, and a point (x, y) giving the maximum or minimum is an <b>optimal solution</b>.' },
      { k: 'p', zh: '當目標函數的值為某一常數 k 時，即 x＋y＝k，這是一條斜率為 −1 的直線，且其 x 截距為 k。因此，當這一條直線平行移動時，愈往右上方，k 值愈大；愈往左下方，k 值愈小。',
        en: 'When the objective equals a constant k, i.e. x + y = k, this is a line with slope −1 and x-intercept k. So as the line moves parallel to itself, k increases toward the upper right and decreases toward the lower left.' },
      { k: 'figs', items: [{ id: 'f15', cap: { zh: '圖 15', en: 'Figure 15' } }] },
      { k: 'p', zh: '如圖 15 所示，當直線 x＋y＝k 通過可行解區域時，此直線上的所有可行解均使 x＋y 的值為 k，例如：直線 x＋y＝7 上的可行解，均使 x＋y 的值為 7。直線 x＋y＝10 通過可行解區域最右上方的 C(6, 4)，而當 k＞10 時，直線 x＋y＝k 不再通過可行解區域，故目標函數 x＋y 的<b>最大值為 10</b>。同理，直線 x＋y＝2 通過可行解區域最左上方的 A(−2, 4)，而當 k＜2 時，直線 x＋y＝k 不再通過可行解區域，故目標函數 x＋y 的<b>最小值為 2</b>。',
        en: 'As in Fig. 15, when the line x + y = k passes through the feasible region, every feasible point on it makes x + y equal k — e.g. feasible points on x + y = 7 all give 7. The line x + y = 10 passes through the upper-right-most point C(6, 4); for k > 10 the line no longer meets the region, so the <b>maximum is 10</b>. Similarly x + y = 2 passes through A(−2, 4) and for k < 2 the line misses the region, so the <b>minimum is 2</b>.' },
      { k: 'widget', w: 'sweep15' },
      { k: 'ex', no: 4,
        q: { zh: `在 ${sys('x＋2y≤6，', '2x＋y≤6，', 'x≥0，', 'y≥0')} 的可行解區域中，試求目標函數 x＋3y 的最大值及最小值。`,
             en: `Over the feasible region of ${sys('x + 2y ≤ 6,', '2x + y ≤ 6,', 'x ≥ 0,', 'y ≥ 0')} find the maximum and minimum of the objective x + 3y.` },
        sol: { zh: '先依題意畫出可行解區域的圖形，如圖 16 所示。將直線 x＋3y＝0 平行移動通過上述可行解區域，如圖 17。由這些直線平行移動的方式，可知目標函數 x＋3y 在點 C(0, 3) 有最大值，在點 O(0, 0) 有最小值，故<b>最大值為 9，最小值為 0</b>。',
               en: 'First draw the feasible region (Fig. 16). Translate the line x + 3y = 0 across the region (Fig. 17). From how these parallel lines move, x + 3y is largest at C(0, 3) and smallest at O(0, 0), so the <b>maximum is 9 and the minimum is 0</b>.' },
        solFigs: [{ id: 'f16', cap: { zh: '圖 16', en: 'Figure 16' } }, { id: 'f17', cap: { zh: '圖 17', en: 'Figure 17' } }] },
      { k: 'pr', id: 'p4',
        q: { zh: `在 ${sys('x＋y≥10，', 'x－y≤0，', 'y≤10')} 的可行解區域中，試求目標函數 2x＋y 的最大值及最小值。`,
             en: `Over the feasible region of ${sys('x + y ≥ 10,', 'x − y ≤ 0,', 'y ≤ 10')} find the maximum and minimum of 2x + y.` },
        check: { t: 'num', f: [{ lab: { zh: '最大值', en: 'Max' }, a: 30 }, { lab: { zh: '最小值', en: 'Min' }, a: 10 }] },
        sol: { zh: '可行解區域為三角形，頂點 (5, 5)、(0, 10)、(10, 10)。代入 2x＋y：(5, 5)→15，(0, 10)→10，(10, 10)→30。故<b>最大值 30</b>（在 (10, 10)），<b>最小值 10</b>（在 (0, 10)）。',
               en: 'The feasible region is a triangle with vertices (5, 5), (0, 10), (10, 10). Values of 2x + y: 15, 10, 30. So the <b>maximum is 30</b> at (10, 10) and the <b>minimum is 10</b> at (0, 10).' },
        solFigs: [{ id: 'pr4s', cap: { zh: '解答圖', en: 'Solution' } }] },
      { k: 'h', zh: '平行線法與頂點法', en: 'The parallel-line method and the vertex method' },
      { k: 'key', zh: '本章的目標函數均為一次函數（線型函數），且可行解區域的邊界均為直線，解決這類問題的方法稱為<b>線性規劃</b>。<br>在實際求解線性規劃的問題時，我們通常要①適當地假設變數，然後②依限制條件列出聯立不等式，接著③在坐標平面上畫出可行解區域，最後④可由目標函數產生的平行直線系求出最佳解，稱為<b>平行線法</b>。',
        en: 'In this chapter the objective is always a linear function and the feasible region is bounded by straight lines; the method for such problems is called <b>linear programming</b>.<br>To solve one: ① choose variables, ② write the system of inequalities from the constraints, ③ draw the feasible region, ④ use the family of parallel lines generated by the objective to find the optimum — the <b>parallel-line method</b>.' },
      { k: 'p', zh: '另外，由例題 4 的求解過程，同學們可以體會到，如果可行解區域的邊界均為直線，且目標函數為一次函數的話，這類的線性規劃問題所求之極值，若存在則必在可行解區域的<b>頂點（或邊界）</b>出現。這裡的頂點指的是落在可行解區域，並為至少兩條邊界直線的交點。由於邊界上必有頂點，所以只要將所有頂點代入目標函數，即可求出極值，稱為<b>頂點法</b>。例如，在例題 4 中，可行解區域的頂點為 (0, 0)，(3, 0)，(2, 2)，(0, 3)。將它們分別代入目標函數 x＋3y，如表 1 所示。',
        en: 'From Example 4 you can see: if the feasible region is bounded by lines and the objective is linear, then the extreme value, if it exists, must occur at a <b>vertex (or along an edge)</b> of the feasible region. A vertex here is a point of the feasible region where at least two boundary lines meet. Since every edge has a vertex, substituting all vertices into the objective finds the extremes — the <b>vertex method</b>. In Example 4 the vertices are (0, 0), (3, 0), (2, 2), (0, 3); substituting into x + 3y gives Table 1.' },
      { k: 'table', html: `<table class="t"><caption data-zh="表 1" data-en="Table 1"></caption><tr><th>(x, y)</th><td>(0, 0)</td><td>(3, 0)</td><td>(2, 2)</td><td>(0, 3)</td></tr><tr><th>x＋3y</th><td>0</td><td>3</td><td>8</td><td><b>9</b></td></tr></table>` },
      { k: 'p', zh: '由表 1 知例題 4 的最大值為 9，最小值為 0。同學們可試著比較與平行線法求解的異同，解題時兩種方法可搭配使用。我們來看下面的例子。',
        en: 'Table 1 shows the maximum is 9 and the minimum is 0. Compare this with the parallel-line method — the two can be used together. Now some applications.' },
      { k: 'figs', items: [{ id: 'f19', cap: { zh: '圖 19', en: 'Figure 19' } }] },
      { k: 'ex', no: 5,
        q: { zh: '用一公噸原料 A 和一公噸原料 B 分別可提煉精油 25 公斤和 12 公斤。但生產過程中會產生廢棄物，每公噸原料 A 和原料 B 分別會產生 75 公斤和 25 公斤的廢棄物。已知原料 A 和原料 B 每公噸的成本分別為 15 萬元和 12 萬元，今若希望成本不超過 240 萬元，而廢棄物不超過 750 公斤，試問最多可提煉多少公斤的精油？',
             en: 'One tonne of raw material A yields 25 kg of essential oil and one tonne of B yields 12 kg. Production creates waste: 75 kg per tonne of A and 25 kg per tonne of B. A costs 150,000 and B costs 120,000 per tonne. If cost must not exceed 2,400,000 and waste must not exceed 750 kg, what is the most oil that can be produced?' },
        sol: { zh: `假設原料 A 有 x 公噸和原料 B 有 y 公噸，由題意列式得 ${sys('15x＋12y≤240，', '75x＋25y≤750，', 'x≥0，', 'y≥0，')} 即 ${sys('5x＋4y≤80，', '3x＋y≤30，', 'x≥0，', 'y≥0，')}<br>依此繪出可行解區域如圖 20 所示，其中 (${fr(40, 7)}, ${fr(90, 7)}) 為直線 5x＋4y＝80 與 3x＋y＝30 的交點。<br>目標函數 P 表精油產量，依題意 P＝25x＋12y，本題即求可行解區域內的點 (x, y)，使 P 的值為最大。<br>⑴ 當 P 為任一常數 k 時，k＝25x＋12y 均為斜率 ${fr('−25', 12)} 的直線。<br>⑵ 如圖 20 所示，將斜率為 ${fr('−25', 12)} 的直線逐漸向右上方平移，最後通過可行解區域中的點為 (${fr(40, 7)}, ${fr(90, 7)})，此時的直線為 25x＋12y＝25．${fr(40, 7)}＋12．${fr(90, 7)}＝${fr(2080, 7)}。<br>由⑴、⑵得知最多可提煉 <b>${fr(2080, 7)}（≈297.14）公斤</b>的精油。`,
               en: `Let x tonnes of A and y tonnes of B be used. Then ${sys('15x + 12y ≤ 240,', '75x + 25y ≤ 750,', 'x ≥ 0, y ≥ 0,')} i.e. ${sys('5x + 4y ≤ 80,', '3x + y ≤ 30,', 'x ≥ 0, y ≥ 0.')}<br>The feasible region is shown in Fig. 20, where (${fr(40, 7)}, ${fr(90, 7)}) is the intersection of 5x + 4y = 80 and 3x + y = 30.<br>Let P = 25x + 12y be the oil produced; we maximize P over the region.<br>(1) For any constant k, k = 25x + 12y is a line with slope ${fr('−25', 12)}.<br>(2) Sliding this line toward the upper right, the last feasible point it touches is (${fr(40, 7)}, ${fr(90, 7)}), where 25·${fr(40, 7)} + 12·${fr(90, 7)} = ${fr(2080, 7)}.<br>So at most <b>${fr(2080, 7)} (≈ 297.14) kg</b> of oil can be produced.` },
        solFigs: [{ id: 'f20', cap: { zh: '圖 20', en: 'Figure 20' } }] },
      { k: 'pr', id: 'p5',
        q: { zh: '大禹鍛冶工廠使用礦砂為主要原料，生產兩種成分不同的合金，其中 A 合金每公斤使用紅色礦砂 50 公克、黃色礦砂 40 公克；B 合金每公斤使用紅色礦砂 20 公克、黃色礦砂 40 公克。已知每售出一公斤的 A 合金，工廠可賺 50 元；每售出一公斤的 B 合金，工廠可賺 30 元。現在工廠進了 900 公克的紅色礦砂及 1200 公克的黃色礦砂。若將這些礦砂用來生產這兩種合金，試問售出成品後工廠最多可賺多少元？',
             en: 'Da-Yu Forge makes two alloys from ore. Each kg of alloy A uses 50 g of red ore and 40 g of yellow ore; each kg of alloy B uses 20 g of red ore and 40 g of yellow ore. Profit is 50 per kg of A and 30 per kg of B. The forge has 900 g of red ore and 1200 g of yellow ore. What is the maximum profit?' },
        check: { t: 'num', f: [{ lab: { zh: '最大利潤（元）', en: 'Max profit' }, a: 1100 }] },
        sol: { zh: `設生產 A 合金 x 公斤、B 合金 y 公斤，則 ${sys('50x＋20y≤900，', '40x＋40y≤1200，', 'x≥0，y≥0')} 即 ${sys('5x＋2y≤90，', 'x＋y≤30，', 'x≥0，y≥0')}<br>目標函數 P＝50x＋30y。頂點：(0, 0)→0，(18, 0)→900，(10, 20)→1100，(0, 30)→900。<br>故生產 A 合金 10 公斤、B 合金 20 公斤時，<b>最多可賺 1100 元</b>。`,
               en: `Let x kg of A and y kg of B be made. Then ${sys('50x + 20y ≤ 900,', '40x + 40y ≤ 1200,', 'x ≥ 0, y ≥ 0')} i.e. ${sys('5x + 2y ≤ 90,', 'x + y ≤ 30,', 'x ≥ 0, y ≥ 0.')}<br>Objective P = 50x + 30y. Vertices: (0, 0)→0, (18, 0)→900, (10, 20)→1100, (0, 30)→900.<br>So making 10 kg of A and 20 kg of B gives the <b>maximum profit 1100</b>.` },
        solFigs: [{ id: 'pr5s', cap: { zh: '解答圖', en: 'Solution' } }] },
      { k: 'ex', no: 6,
        q: { zh: '某公司有兩工廠，生產成分相同但比例不同的合金。甲工廠生產的合金中，每百公克中含 A 金屬 2 公克、B 金屬 6 公克，其成本為 60000 元。乙工廠生產的合金中，每百公克中含 A 金屬 4 公克、B 金屬 3 公克，其成本為 40000 元。今有一訂單要求該公司提供合金，其中的 A 金屬、B 金屬至少各含 16、30 公克，試問甲、乙兩工廠需各生產多少百公克的合金，才能達成需求並使成本最低？',
             en: 'A company has two factories making alloys of the same metals in different proportions. Every 100 g from factory Jia contains 2 g of metal A and 6 g of metal B, costing 60,000. Every 100 g from factory Yi contains 4 g of A and 3 g of B, costing 40,000. An order needs at least 16 g of A and 30 g of B. How many hundred-grams should each factory produce to meet the order at minimum cost?' },
        sol: { zh: `設甲工廠生產合金 x 百公克，乙工廠生產合金 y 百公克，依題意列式得 ${sys('2x＋4y≥16，', '6x＋3y≥30，', 'x≥0，', 'y≥0，')} 即 ${sys('x＋2y≥8，', '2x＋y≥10，', 'x≥0，', 'y≥0，')}<br>畫出可行解區域，如圖 21 所示。目標函數 P＝60000x＋40000y，以目標函數產生的平行線掃過可行解區域，可知本題所求的最小值存在。本題可行解區域的頂點有 (0, 10)，(4, 2)，(8, 0)，其對應的目標函數值如表 2。<br><table class="t"><caption>表 2</caption><tr><th>(x, y)</th><td>(0, 10)</td><td>(4, 2)</td><td>(8, 0)</td></tr><tr><th>60000x＋40000y</th><td>400000</td><td><b>320000</b></td><td>480000</td></tr></table>故當 (x, y)＝(4, 2) 時，P 有最小值 320000，即<b>甲工廠生產合金 4 百公克，乙工廠生產合金 2 百公克</b>，可使成本最低並達成需求。`,
               en: `Let factory Jia produce x hundred-grams and Yi produce y hundred-grams. Then ${sys('2x + 4y ≥ 16,', '6x + 3y ≥ 30,', 'x ≥ 0, y ≥ 0,')} i.e. ${sys('x + 2y ≥ 8,', '2x + y ≥ 10,', 'x ≥ 0, y ≥ 0.')}<br>The feasible region is shown in Fig. 21 (unbounded). With P = 60000x + 40000y, sweeping the parallel lines shows the minimum exists. The vertices are (0, 10), (4, 2), (8, 0):<br><table class="t"><caption>Table 2</caption><tr><th>(x, y)</th><td>(0, 10)</td><td>(4, 2)</td><td>(8, 0)</td></tr><tr><th>60000x + 40000y</th><td>400000</td><td><b>320000</b></td><td>480000</td></tr></table>So at (4, 2) P has minimum 320000: <b>Jia makes 400 g and Yi makes 200 g</b>.` },
        solFigs: [{ id: 'f21', cap: { zh: '圖 21', en: 'Figure 21' } }] },
      { k: 'pr', id: 'p6',
        q: { zh: '有甲，乙兩工廠生產 A，B 兩種不同產品，甲工廠每天可生產 A、B 各 4、2 公噸，乙工廠每天可生產 A、B 各 2、7 公噸，今有一訂單需求 A、B 各 16、20 公噸，假設甲工廠運轉一天成本 10000 元，乙工廠運轉一天成本 20000 元，試問甲、乙兩工廠各運轉幾天會使得成本最低並達成需求？',
             en: 'Factories Jia and Yi make products A and B. Per day Jia makes 4 t of A and 2 t of B; Yi makes 2 t of A and 7 t of B. An order needs 16 t of A and 20 t of B. Running Jia costs 10,000 per day and Yi 20,000 per day. How many days should each run to meet the order at minimum cost?' },
        check: { t: 'num', f: [{ lab: { zh: '甲（天）', en: 'Jia (days)' }, a: 3 }, { lab: { zh: '乙（天）', en: 'Yi (days)' }, a: 2 }, { lab: { zh: '最低成本', en: 'Min cost' }, a: 70000 }] },
        sol: { zh: `設甲運轉 x 天、乙運轉 y 天，則 ${sys('4x＋2y≥16，', '2x＋7y≥20，', 'x≥0，y≥0')} 即 ${sys('2x＋y≥8，', '2x＋7y≥20，', 'x≥0，y≥0')}<br>目標函數 P＝10000x＋20000y。頂點：(0, 8)→160000，(3, 2)→70000，(10, 0)→100000。<br>故<b>甲運轉 3 天、乙運轉 2 天</b>，最低成本 70000 元。`,
               en: `Let Jia run x days and Yi run y days. Then ${sys('4x + 2y ≥ 16,', '2x + 7y ≥ 20,', 'x ≥ 0, y ≥ 0')} i.e. ${sys('2x + y ≥ 8,', '2x + 7y ≥ 20,', 'x ≥ 0, y ≥ 0.')}<br>P = 10000x + 20000y. Vertices: (0, 8)→160000, (3, 2)→70000, (10, 0)→100000.<br>So <b>Jia runs 3 days and Yi runs 2 days</b>, minimum cost 70000.` },
        solFigs: [{ id: 'pr6s', cap: { zh: '解答圖', en: 'Solution' } }] },
      { k: 'note', title: { zh: '📜 數學小故事', en: '📜 A bit of history' },
        zh: '線性規劃最早起源於 1920∼1930 年代，由坎拓羅維奇（Leonid Kantorovich，1912∼1986）及李安鐵夫（Wassily Leontief，1905∼1999）等人所提出的研究方式演化而成。雖然發展並不算早，但現在已經發展得很成熟了。輔以電腦強大的計算能力，線性規劃方法已經廣泛應用在經濟學及相關領域上，獲得極大的成功。',
        en: 'Linear programming originated in the 1920s–1930s, evolving from research by Leonid Kantorovich (1912–1986), Wassily Leontief (1905–1999) and others. Though relatively young, it is now very mature; with powerful computers it is widely and very successfully used in economics and related fields.' }
    ]
  }
];

/* ================= 習題 1 ================= */
const EXERCISES = [
  { n: 1, lv: 'basic',
    q: { zh: `在坐標平面上畫出二元一次聯立不等式 ${sys('3x＋2y－12≤0，', 'x＋y－2＞0')} 的圖形。`, en: `Draw the graph of the system ${sys('3x + 2y − 12 ≤ 0,', 'x + y − 2 > 0.')}` },
    check: { t: 'shade', hs: [H(3, 2, 12, '<='), H(1, 1, 2, '>')], names: ['3x+2y−12≤0', 'x+y−2>0'] },
    hint: { zh: '先畫兩條界線（哪一條用實線？哪一條用虛線？），再用原點測試。', en: 'Draw both boundaries (which is solid, which dashed?) and test the origin.' },
    sol: { zh: '3x＋2y－12＝0 畫實線，原點代入 −12≤0 成立 → 取含原點側；x＋y－2＝0 畫虛線，原點代入 −2＞0 不成立 → 取不含原點側。兩者共同部分為一個向左下與右下延伸的無界帶狀區域（見圖）。',
           en: '3x + 2y − 12 = 0 is solid; the origin gives −12 ≤ 0, true → origin side. x + y − 2 = 0 is dashed; the origin gives −2 > 0, false → the other side. The common part is an unbounded wedge-shaped region (see figure).' },
    solFigs: [{ id: 'ex1s', cap: { zh: '解答圖', en: 'Solution' } }] },
  { n: 2, lv: 'basic',
    q: { zh: '若二元一次聯立不等式的解集合如右圖紅色區域所示，試寫出此聯立不等式。', en: 'The solution set of a system of linear inequalities is the red region in the figure. Write the system.' },
    figs: [{ id: 'ex2', cap: { zh: '習題 2 圖', en: 'Figure for Q2' } }],
    check: { t: 'mc', o: [
      { zh: sys('x－3y＋3＞0，', '2x＋3y－12≤0'), en: sys('x − 3y + 3 > 0,', '2x + 3y − 12 ≤ 0') },
      { zh: sys('x－3y＋3≥0，', '2x＋3y－12＜0'), en: sys('x − 3y + 3 ≥ 0,', '2x + 3y − 12 < 0') },
      { zh: sys('x－3y＋3＜0，', '2x＋3y－12≤0'), en: sys('x − 3y + 3 < 0,', '2x + 3y − 12 ≤ 0') },
      { zh: sys('3x－y＋1＞0，', '3x＋2y－6≤0'), en: sys('3x − y + 1 > 0,', '3x + 2y − 6 ≤ 0') }], a: 0 },
    hint: { zh: '虛線過 (0, 1)、(3, 2)；實線過 (3, 2)、(6, 0)。原點在紅色區域內嗎？', en: 'The dashed line passes (0, 1), (3, 2); the solid line passes (3, 2), (6, 0). Is the origin in the red region?' },
    sol: { zh: `虛線過 (0, 1)、(3, 2)：斜率 1/3，方程式 x－3y＋3＝0；實線過 (3, 2)、(6, 0)：方程式 2x＋3y－12＝0。紅色區域含原點，代入得 3＞0、−12＜0，再配合虛線不含、實線包含界線，得 ${sys('x－3y＋3＞0，', '2x＋3y－12≤0')}`,
           en: `Dashed line through (0, 1), (3, 2): slope 1/3, x − 3y + 3 = 0. Solid line through (3, 2), (6, 0): 2x + 3y − 12 = 0. The red region contains the origin (3 > 0, −12 < 0); the dashed boundary is excluded, the solid one included: ${sys('x − 3y + 3 > 0,', '2x + 3y − 12 ≤ 0')}` } },
  { n: 3, lv: 'basic',
    q: { zh: '已知直線 L₁：2x－y＝1，L₂：2x－y＝3，試回答下列問題。<br>⑴ 若 L₁ 向右平移 k 單位，可得 L₂，則 k 值為何？<br>⑵ 若 L₂ 向上平移 h 單位，可得 L₁，則 h 值為何？',
         en: 'L₁: 2x − y = 1, L₂: 2x − y = 3.<br>(1) If shifting L₁ right by k units gives L₂, find k.<br>(2) If shifting L₂ up by h units gives L₁, find h.' },
    check: { t: 'num', f: [{ lab: 'k', a: 1 }, { lab: 'h', a: 2 }] },
    hint: { zh: '向右平移 k：把 x 換成 x－k；向上平移 h：把 y 換成 y－h。', en: 'Shift right by k: replace x with x − k. Shift up by h: replace y with y − h.' },
    sol: { zh: '⑴ L₁ 向右平移 k：2(x－k)－y＝1 ⇒ 2x－y＝1＋2k＝3，得 <b>k＝1</b>（亦可看 x 截距：1/2 → 3/2）。<br>⑵ L₂ 向上平移 h：2x－(y－h)＝3 ⇒ 2x－y＝3－h＝1，得 <b>h＝2</b>（y 截距：−3 → −1）。',
           en: '(1) Shift L₁ right by k: 2(x − k) − y = 1 ⇒ 2x − y = 1 + 2k = 3, so <b>k = 1</b> (x-intercept 1/2 → 3/2).<br>(2) Shift L₂ up by h: 2x − (y − h) = 3 ⇒ 2x − y = 3 − h = 1, so <b>h = 2</b> (y-intercept −3 → −1).' } },
  { n: 4, lv: 'basic',
    q: { zh: '右圖為 A，B，C，D 四點及直線 L：x－2y＝0，試問 A，B，C，D 四個點坐標 (x, y) 分別代入 x－2y＝k，哪一點所得 k 值最大？', en: 'The figure shows points A, B, C, D and the line L: x − 2y = 0. Substituting each point into x − 2y = k, which gives the largest k?' },
    figs: [{ id: 'ex4', cap: { zh: '習題 4 圖', en: 'Figure for Q4' } }],
    check: { t: 'mc', o: [{ zh: 'A', en: 'A' }, { zh: 'B', en: 'B' }, { zh: 'C', en: 'C' }, { zh: 'D', en: 'D' }], a: 3 },
    hint: { zh: 'x－2y＝k 的 x 截距為 k；直線往哪個方向平移，k 會變大？', en: 'The x-intercept of x − 2y = k is k. In which direction does k grow?' },
    sol: { zh: 'x－2y＝k 為與 L 平行的直線系，x 截距為 k，直線愈往右下方，k 值愈大。四點中 D 位於最右下方（x 較大、y 較小），故 <b>D</b> 所得 k 值最大。', en: 'x − 2y = k is a family parallel to L with x-intercept k; the further to the lower right, the larger k. D is the lower-right-most point (large x, small y), so <b>D</b> gives the largest k.' } },
  { n: 5, lv: 'basic',
    q: { zh: `已知 x，y 為整數，試求滿足二元一次聯立不等式 ${sys('3x＋2y≤6，', 'x≥0，', 'y≥0')} 的 (x, y) 共有幾組？`, en: `If x, y are integers, how many pairs (x, y) satisfy ${sys('3x + 2y ≤ 6,', 'x ≥ 0,', 'y ≥ 0')}?` },
    check: { t: 'num', f: [{ lab: { zh: '組數', en: 'Pairs' }, a: 7 }] },
    hint: { zh: '分別討論 x＝0，1，2。', en: 'Consider x = 0, 1, 2 separately.' },
    sol: { zh: 'x＝0：2y≤6，y＝0，1，2，3（4 組）；x＝1：2y≤3，y＝0，1（2 組）；x＝2：2y≤0，y＝0（1 組）。共 <b>7 組</b>。', en: 'x = 0: y = 0, 1, 2, 3 (4); x = 1: y = 0, 1 (2); x = 2: y = 0 (1). Total <b>7</b>.' },
    widget: 'lattice' },
  { n: 6, lv: 'adv',
    q: { zh: '假設 L₁：ax＋by＝c₁、L₂：ax＋by＝c₂、L₃：ax＋by＝c₃，若 a＜0，試回答下列問題。<br>⑴ b 是正數或負數？<br>⑵ c₁，c₂，c₃ 的大小關係為何？', en: 'L₁: ax + by = c₁, L₂: ax + by = c₂, L₃: ax + by = c₃ with a < 0 (see figure).<br>(1) Is b positive or negative?<br>(2) Order c₁, c₂, c₃.' },
    figs: [{ id: 'ex6', cap: { zh: '習題 6 圖', en: 'Figure for Q6' } }],
    check: { t: 'mc2', parts: [
      { q: { zh: '⑴ b 為', en: '(1) b is' }, o: [{ zh: '正數', en: 'positive' }, { zh: '負數', en: 'negative' }], a: 0 },
      { q: { zh: '⑵ 大小關係', en: '(2) Order' }, o: [{ zh: 'c₁＜c₂＜c₃', en: 'c₁ < c₂ < c₃' }, { zh: 'c₁＞c₂＞c₃', en: 'c₁ > c₂ > c₃' }, { zh: 'c₂＜c₁＜c₃', en: 'c₂ < c₁ < c₃' }], a: 0 }] },
    hint: { zh: '斜率 −a/b 為正（直線往右上）。y 截距為 c/b。', en: 'The slope −a/b is positive (lines rise to the right). The y-intercept is c/b.' },
    sol: { zh: '⑴ 由圖知斜率 −a/b＞0，又 a＜0，所以 <b>b＞0（正數）</b>。<br>⑵ y 截距為 c/b，且 b＞0；由圖 L₃ 的 y 截距最大、L₁ 最小，所以 <b>c₁＜c₂＜c₃</b>。', en: '(1) The slope −a/b > 0 and a < 0, so <b>b > 0 (positive)</b>.<br>(2) The y-intercept is c/b with b > 0; L₃ has the largest y-intercept and L₁ the smallest, so <b>c₁ < c₂ < c₃</b>.' } },
  { n: 7, lv: 'adv',
    q: { zh: '右圖為正六邊形 ABCDEF，若直線 L 的方程式為 3x－2y－k＝0，試問直線 L 通過哪一個頂點時，可使 k 值最大？', en: 'ABCDEF is a regular hexagon (figure). If L: 3x − 2y − k = 0, through which vertex must L pass to make k largest?' },
    figs: [{ id: 'ex7', cap: { zh: '習題 7 圖', en: 'Figure for Q7' } }],
    check: { t: 'mc', o: 'ABCDEF'.split('').map(c => ({ zh: c, en: c })), a: 1 },
    hint: { zh: '設邊長為 2，寫出各頂點坐標再代入 3x－2y。', en: 'Let the side be 2, write each vertex and evaluate 3x − 2y.' },
    sol: { zh: '設邊長 2：A(−1, 0)，B(1, 0)，C(2, √3)，D(1, 2√3)，E(−1, 2√3)，F(−2, √3)。k＝3x－2y：A＝−3，B＝3，C＝6－2√3≈2.54，D＝3－4√3＜0，E、F 更小。故通過 <b>B</b> 時 k 最大。（k＝3x－2y 的直線愈往右下方 k 愈大。）', en: 'With side 2: A(−1, 0), B(1, 0), C(2, √3), D(1, 2√3), E(−1, 2√3), F(−2, √3). k = 3x − 2y: A = −3, B = 3, C = 6 − 2√3 ≈ 2.54, D = 3 − 4√3 < 0, E, F smaller. So <b>B</b> gives the largest k.' } },
  { n: 8, lv: 'adv',
    q: { zh: `某進出口公司有甲、乙兩貨倉，儲存某原料各 50 公噸、60 公噸。該公司接到 A、B 兩工廠分別訂購該原料 40 公噸、50 公噸，若每公噸運費如右表，則應自各貨倉運多少原料至各工廠才能使得運費最少？此時的運費為多少元？<div class="tablewrap"><table class="t"><tr><th></th><th>A 工廠</th><th>B 工廠</th></tr><tr><th>貨倉甲</th><td>500 元</td><td>600 元</td></tr><tr><th>貨倉乙</th><td>650 元</td><td>700 元</td></tr></table></div>`,
         en: `An import–export company stores 50 t of a raw material in warehouse Jia and 60 t in warehouse Yi. Factories A and B order 40 t and 50 t. With shipping costs per tonne below, how much should be shipped from each warehouse to each factory to minimize cost, and what is the minimum cost?<div class="tablewrap"><table class="t"><tr><th></th><th>Factory A</th><th>Factory B</th></tr><tr><th>Jia</th><td>500</td><td>600</td></tr><tr><th>Yi</th><td>650</td><td>700</td></tr></table></div>` },
    check: { t: 'num', f: [{ lab: { zh: '甲→A', en: 'Jia→A' }, a: 40 }, { lab: { zh: '甲→B', en: 'Jia→B' }, a: 10 }, { lab: { zh: '最少運費', en: 'Min cost' }, a: 54000 }] },
    hint: { zh: '設甲運往 A 為 x、運往 B 為 y，則乙運往 A、B 分別為 40－x、50－y。', en: 'Let Jia ship x to A and y to B; then Yi ships 40 − x to A and 50 − y to B.' },
    sol: { zh: `設貨倉甲運 x 公噸至 A、y 公噸至 B，則貨倉乙運 40－x 至 A、50－y 至 B。限制條件：${sys('x＋y≤50，', '(40－x)＋(50－y)≤60 ⇒ x＋y≥30，', '0≤x≤40，0≤y≤50')}<br>運費 P＝500x＋600y＋650(40－x)＋700(50－y)＝61000－150x－100y。<br>頂點：(30, 0)→56500，(40, 0)→55000，(40, 10)→<b>54000</b>，(0, 50)→56000，(0, 30)→58000。<br>故<b>甲運 40 公噸至 A、10 公噸至 B；乙運 0 公噸至 A、40 公噸至 B</b>，最少運費 <b>54000 元</b>。`,
           en: `Let Jia ship x t to A and y t to B; Yi ships 40 − x to A and 50 − y to B. Constraints: ${sys('x + y ≤ 50,', '(40 − x) + (50 − y) ≤ 60 ⇒ x + y ≥ 30,', '0 ≤ x ≤ 40, 0 ≤ y ≤ 50')}<br>Cost P = 500x + 600y + 650(40 − x) + 700(50 − y) = 61000 − 150x − 100y.<br>Vertices: (30, 0)→56500, (40, 0)→55000, (40, 10)→<b>54000</b>, (0, 50)→56000, (0, 30)→58000.<br>So <b>Jia ships 40 t to A and 10 t to B; Yi ships 0 t to A and 40 t to B</b>; minimum cost <b>54000</b>.` },
    solFigs: [{ id: 'ex8s', cap: { zh: '解答圖', en: 'Solution' } }] },
  { n: 9, lv: 'adv',
    q: { zh: '如右圖，直線 AB：2x－y－7＝0、直線 BC：x－y＋14＝0、直線 CA：4x＋3y＝19，設可行解區域為 A，B，C 三點所圍成的三角形區域及邊界，目標函數為 x＋ky，且在 (5, 3) 與 (7, 7) 有最大值，則 k 值為何？', en: 'Line AB: 2x − y − 7 = 0, BC: x − y + 14 = 0, CA: 4x + 3y = 19. The feasible region is triangle ABC with its boundary; the objective x + ky attains its maximum at both (5, 3) and (7, 7). Find k.' },
    figs: [{ id: 'ex9', cap: { zh: '習題 9 圖', en: 'Figure for Q9' } }],
    check: { t: 'num', f: [{ lab: 'k', a: -0.5 }] },
    hint: { zh: '(5, 3)、(7, 7) 都在哪一條邊上？最大值同時出現在兩點，代表目標函數的等值線與那條邊平行。', en: 'Which edge contains both (5, 3) and (7, 7)? A maximum at two points means the level lines are parallel to that edge.' },
    sol: { zh: '(5, 3)、(7, 7) 均滿足 2x－y－7＝0，都在邊 AB 上。最大值同時出現在兩點，表示 x＋ky＝t 與 AB 平行（整條邊 AB 都是最佳解）：斜率 −1/k＝2，得 <b>k＝−1/2</b>。驗證：A(4, 1)、B(21, 35) 代入 x－y/2 皆為 3.5，C(−23/7, 75/7) 為負值，故 3.5 確為最大值。', en: '(5, 3) and (7, 7) both satisfy 2x − y − 7 = 0, so both lie on edge AB. A maximum at two points means x + ky = t is parallel to AB (the whole edge is optimal): −1/k = 2, so <b>k = −1/2</b>. Check: A(4, 1), B(21, 35) give x − y/2 = 3.5, C(−23/7, 75/7) gives a negative value, so 3.5 is indeed the maximum.' } },
  { n: 10, lv: 'lit',
    q: { zh: '為預防禽流感，營養師吩咐雞場主人每天必須從飼料中提供至少 84 單位的營養素 A、至少 72 單位的營養素 B 和至少 60 單位的營養素 C 給他的雞群。這三種營養素可由兩種飼料中獲得，且知第一種飼料每公斤售價 5 元並含有 7 單位的營養素 A、3 單位的營養素 B 與 3 單位的營養素 C；第二種飼料每公斤售價 4 元並含有 2 單位的營養素 A、6 單位的營養素 B 與 2 單位的營養素 C。若雞場主人每天使用 x 公斤的第一種飼料與 y 公斤的第二種飼料就能符合營養師吩咐。<br>⑴ 除了 x≥0，y≥0 兩個條件外，寫下 x，y 必須滿足的聯立不等式。<br>⑵ 若雞場主人想以最少的飼料成本來達到雞群的營養要求，其目標函數為何？<br>⑶ 若雞場主人想以最少的飼料成本來達到雞群的營養要求，最少的飼料成本又是多少元？',
         en: 'To prevent avian flu, a nutritionist tells a farmer to give his chickens at least 84 units of nutrient A, 72 units of B and 60 units of C per day. Feed 1 costs 5 per kg and contains 7 A, 3 B, 3 C per kg; feed 2 costs 4 per kg and contains 2 A, 6 B, 2 C per kg. The farmer uses x kg of feed 1 and y kg of feed 2 daily.<br>(1) Besides x ≥ 0, y ≥ 0, write the inequalities x, y must satisfy.<br>(2) To minimize feed cost, what is the objective function?<br>(3) What is the minimum daily feed cost?' },
    check: { t: 'num', f: [{ lab: { zh: '最少成本（元）', en: 'Min cost' }, a: 102 }] },
    hint: { zh: '三個營養素各一條「至少」的不等式（≥）。可行解區域無界，但最小值存在。', en: 'One "at least" (≥) inequality per nutrient. The region is unbounded, but the minimum exists.' },
    sol: { zh: `⑴ ${sys('7x＋2y≥84，', '3x＋6y≥72（即 x＋2y≥24），', '3x＋2y≥60')}<br>⑵ 目標函數 <b>P＝5x＋4y</b>（求最小值）。<br>⑶ 頂點：(0, 42)→168，(6, 21)→114，(18, 3)→<b>102</b>，(24, 0)→120。故每天使用第一種飼料 18 公斤、第二種 3 公斤，<b>最少成本 102 元</b>。`,
           en: `(1) ${sys('7x + 2y ≥ 84,', '3x + 6y ≥ 72 (i.e. x + 2y ≥ 24),', '3x + 2y ≥ 60')}<br>(2) Objective <b>P = 5x + 4y</b> (minimize).<br>(3) Vertices: (0, 42)→168, (6, 21)→114, (18, 3)→<b>102</b>, (24, 0)→120. Use 18 kg of feed 1 and 3 kg of feed 2: <b>minimum cost 102</b>.` },
    solFigs: [{ id: 'ex10s', cap: { zh: '解答圖', en: 'Solution' } }] }
];

/* ================= 測驗題庫 ================= */
const QUIZ = [
  { q: { zh: '下列哪一條直線與 2x＋3y＝6 平行？', en: 'Which line is parallel to 2x + 3y = 6?' }, o: ['2x＋3y＝−1', '3x＋2y＝6', '2x－3y＝6', '3x－2y＝1'], a: 0, tag: 'l1' },
  { q: { zh: '直線 x－y＝0 向右平移 2 單位後的方程式為何？', en: 'Shifting x − y = 0 right by 2 units gives:' }, o: ['x－y＝2', 'x－y＝−2', 'x＋y＝2', 'x＋y＝−2'], a: 0, tag: 'l1' },
  { q: { zh: '平行直線系 x＋y＝k 中，k 值愈大，直線愈往哪個方向？', en: 'In the family x + y = k, as k increases the line moves toward the…' }, o: [{ zh: '右上方', en: 'upper right' }, { zh: '左下方', en: 'lower left' }, { zh: '左上方', en: 'upper left' }, { zh: '右下方', en: 'lower right' }], a: 0, tag: 'l1' },
  { q: { zh: '直線 ax＋by＋c＝0（b≠0）的斜率為何？', en: 'The slope of ax + by + c = 0 (b ≠ 0) is' }, o: ['−a/b', 'a/b', '−b/a', '−c/b'], a: 0, tag: 'l1' },
  { q: { zh: '三直線 2x＋y＝2、2x＋y＝4、2x＋y＝6 的 y 截距 b₁，b₂，b₃ 大小關係為何？', en: 'The y-intercepts b₁, b₂, b₃ of 2x + y = 2, 4, 6 satisfy' }, o: ['b₁＜b₂＜b₃', 'b₁＞b₂＞b₃', 'b₁＝b₂＝b₃', 'b₂＜b₁＜b₃'], a: 0, tag: 'l1' },
  { q: { zh: '直線 L₁：2x－y＝1 向右平移 k 單位得 L₂：2x－y＝3，則 k＝？', en: 'Shifting L₁: 2x − y = 1 right by k gives L₂: 2x − y = 3. k = ?' }, o: ['1', '2', '1/2', '3'], a: 0, tag: 'l1' },
  { q: { zh: '畫不等式圖形時，若不等式「含等號」，界線應如何表示？', en: 'If an inequality includes equality, the boundary line is drawn' }, o: [{ zh: '實線', en: 'solid' }, { zh: '虛線', en: 'dashed' }, { zh: '不畫出', en: 'not drawn' }, { zh: '紅色粗線', en: 'thick red' }], a: 0, tag: 'l2' },
  { q: { zh: '原點 (0, 0) 是否在 x－2y＋2≤0 的圖形中？', en: 'Is the origin in the graph of x − 2y + 2 ≤ 0?' }, o: [{ zh: '否，因為代入得 2＞0', en: 'No, it gives 2 > 0' }, { zh: '是，因為代入得 2＞0', en: 'Yes, it gives 2 > 0' }, { zh: '在界線上', en: 'It is on the boundary' }, { zh: '無法判斷', en: 'Cannot tell' }], a: 0, tag: 'l2' },
  { q: { zh: '下列哪一點在 2x－y－2≤0 的圖形中？', en: 'Which point lies in the graph of 2x − y − 2 ≤ 0?' }, o: ['(0, 0)', '(3, 0)', '(2, 1)', '(5, 5)'], a: 0, tag: 'l2' },
  { q: { zh: '若界線通過原點，判斷半平面時應該怎麼做？', en: 'If the boundary passes through the origin, how do you pick the half-plane?' }, o: [{ zh: '改取 (1, 0) 或 (0, 1) 代入檢驗', en: 'Test (1, 0) or (0, 1) instead' }, { zh: '仍用原點代入', en: 'Still test the origin' }, { zh: '兩邊都塗色', en: 'Shade both sides' }, { zh: '直接取上方', en: 'Always take the upper side' }], a: 0, tag: 'l2' },
  { q: { zh: '點 (1, 1) 是否屬於 x＋y＞2 的圖形？', en: 'Is (1, 1) in the graph of x + y > 2?' }, o: [{ zh: '否，它在界線上，而不等式不含等號', en: 'No — it is on the boundary, which is excluded' }, { zh: '是', en: 'Yes' }, { zh: '是，因為 1＋1＝2', en: 'Yes, because 1 + 1 = 2' }, { zh: '無法判斷', en: 'Cannot tell' }], a: 0, tag: 'l2' },
  { q: { zh: '聯立不等式 x＋y≥2、x≥0、y≥0 的圖形是什麼形狀？', en: 'What is the graph of x + y ≥ 2, x ≥ 0, y ≥ 0?' }, o: [{ zh: '第一象限中、直線 x＋y＝2 右上方的無界區域', en: 'An unbounded region in quadrant I above x + y = 2' }, { zh: '三角形', en: 'A triangle' }, { zh: '一條線段', en: 'A segment' }, { zh: '空集合', en: 'Empty' }], a: 0, tag: 'l2' },
  { q: { zh: '滿足聯立不等式（限制條件）的數對 (x, y) 稱為什麼？', en: 'A pair (x, y) satisfying all the constraints is called a' }, o: [{ zh: '可行解', en: 'feasible solution' }, { zh: '最佳解', en: 'optimal solution' }, { zh: '目標函數', en: 'objective function' }, { zh: '頂點', en: 'vertex' }], a: 0, tag: 'l3' },
  { q: { zh: '使目標函數產生最大值或最小值的點稱為什麼？', en: 'A point at which the objective attains its max or min is a' }, o: [{ zh: '最佳解', en: 'optimal solution' }, { zh: '可行解區域', en: 'feasible region' }, { zh: '截距', en: 'intercept' }, { zh: '平行直線系', en: 'parallel family' }], a: 0, tag: 'l3' },
  { q: { zh: '可行解區域的邊界為直線且目標函數為一次函數時，極值若存在必出現在哪裡？', en: 'With straight-line boundaries and a linear objective, an extreme value (if it exists) occurs' }, o: [{ zh: '可行解區域的頂點（或邊界）', en: 'at a vertex (or on an edge) of the feasible region' }, { zh: '可行解區域的正中心', en: 'at the centre of the region' }, { zh: '原點', en: 'at the origin' }, { zh: '任意內部點', en: 'at any interior point' }], a: 0, tag: 'l3' },
  { q: { zh: '章首引例：0≤x≤100，0≤y≤100，x＋y≤150，求 0.3x＋0.7y 的最大值。', en: 'Opening problem: 0 ≤ x ≤ 100, 0 ≤ y ≤ 100, x + y ≤ 150. Max of 0.3x + 0.7y?' }, o: ['85', '70', '65', '105'], a: 0, tag: 'l3' },
  { q: { zh: '在 x＋2y≤6，2x＋y≤6，x≥0，y≥0 中，x＋3y 的最大值為何？', en: 'Over x + 2y ≤ 6, 2x + y ≤ 6, x ≥ 0, y ≥ 0, the maximum of x + 3y is' }, o: ['9', '8', '6', '12'], a: 0, tag: 'l3' },
  { q: { zh: '同上可行解區域，3x＋y 的最大值為何？', en: 'Same region: the maximum of 3x + y is' }, o: ['9', '8', '3', '6'], a: 0, tag: 'l3' },
  { q: { zh: '在 x＋y≥10，x－y≤0，y≤10 中，2x＋y 的最小值為何？', en: 'Over x + y ≥ 10, x − y ≤ 0, y ≤ 10, the minimum of 2x + y is' }, o: ['10', '15', '20', '30'], a: 0, tag: 'l3' },
  { q: { zh: '以平行線法求 P＝25x＋12y 的極值時，所用直線的斜率為何？', en: 'Using the parallel-line method for P = 25x + 12y, the lines have slope' }, o: ['−25/12', '25/12', '−12/25', '12/25'], a: 0, tag: 'l3' },
  { q: { zh: '頂點 (0, 10)、(4, 2)、(8, 0) 代入 60000x＋40000y，最小值為何？', en: 'Evaluating 60000x + 40000y at (0, 10), (4, 2), (8, 0), the minimum is' }, o: ['320000', '400000', '480000', '240000'], a: 0, tag: 'l3' },
  { q: { zh: '例題 5 中，最多可提煉多少公斤的精油？', en: 'In Example 5, the most essential oil that can be produced is' }, o: ['2080/7 公斤', '300 公斤', '250 公斤', '240 公斤'], a: 0, tag: 'l3' },
  { q: { zh: '已知 x，y 為整數，滿足 3x＋2y≤6，x≥0，y≥0 的 (x, y) 共有幾組？', en: 'Integer pairs with 3x + 2y ≤ 6, x ≥ 0, y ≥ 0:' }, o: ['7', '6', '8', '10'], a: 0, tag: 'ex' },
  { q: { zh: '目標函數 x＋ky 在 (5, 3) 與 (7, 7) 同時有最大值（兩點在邊 2x－y－7＝0 上），則 k＝？', en: 'x + ky has its maximum at both (5, 3) and (7, 7) (on edge 2x − y − 7 = 0). k = ?' }, o: ['−1/2', '1/2', '−2', '2'], a: 0, tag: 'ex' },
  { q: { zh: '當可行解區域「無界」時，下列敘述何者正確？', en: 'When the feasible region is unbounded,' }, o: [{ zh: '最大值或最小值可能不存在', en: 'the max or min may not exist' }, { zh: '一定沒有最小值', en: 'there is never a minimum' }, { zh: '最大值一定存在', en: 'a maximum always exists' }, { zh: '無法使用頂點法', en: 'the vertex method can never be used' }], a: 0, tag: 'l3' },
  { q: { zh: '線性規劃最早起源於哪一個年代？', en: 'Linear programming originated in the' }, o: [{ zh: '1920∼1930 年代', en: '1920s–1930s' }, { zh: '1800 年代', en: '1800s' }, { zh: '1970 年代', en: '1970s' }, { zh: '古希臘時期', en: 'ancient Greece' }], a: 0, tag: 'l3' },
  { q: { zh: '解線性規劃應用題的正確步驟順序為何？', en: 'The correct order of steps for an LP word problem is' }, o: [{ zh: '設變數 → 列不等式 → 畫可行解區域 → 求最佳解', en: 'variables → inequalities → feasible region → optimum' }, { zh: '畫圖 → 設變數 → 求最佳解 → 列不等式', en: 'draw → variables → optimum → inequalities' }, { zh: '求最佳解 → 驗算 → 設變數 → 畫圖', en: 'optimum → check → variables → draw' }, { zh: '列不等式 → 求最佳解 → 設變數 → 畫圖', en: 'inequalities → optimum → variables → draw' }], a: 0, tag: 'l3' },
  { q: { zh: '雞飼料問題（習題 10）中，最少的飼料成本為何？', en: 'In the chicken-feed problem (Q10), the minimum cost is' }, o: ['102', '114', '120', '168'], a: 0, tag: 'ex' },
  { q: { zh: '運輸問題（習題 8）中，最少運費為多少元？', en: 'In the transport problem (Q8), the minimum cost is' }, o: ['54000', '55000', '56000', '61000'], a: 0, tag: 'ex' },
  { q: { zh: '可行解區域頂點為 (0, 0)、(4, 0)、(3, 2)、(0, 3)，2x＋3y 的最大值為何？', en: 'Feasible vertices (0, 0), (4, 0), (3, 2), (0, 3). Max of 2x + 3y?' }, o: ['12', '8', '9', '13'], a: 0, tag: 'l3' },
  { q: { zh: '正六邊形 ABCDEF（A、B 在 x 軸上），直線 3x－2y－k＝0 通過哪個頂點時 k 最大？', en: 'Regular hexagon ABCDEF (A, B on the x-axis): through which vertex is k largest for 3x − 2y − k = 0?' }, o: ['B', 'C', 'D', 'A'], a: 0, tag: 'ex' }
];

/* ================= 學習指引 ================= */
const GUIDE = {
  goals: [
    { zh: '理解平行直線系：同斜率的直線只差常數項，並能判斷常數項與截距的變化方向。', en: 'Understand parallel families: same slope, different constant term; relate the constant to the intercepts.' },
    { zh: '能畫出二元一次不等式與聯立不等式的圖形（實線／虛線、選擇半平面）。', en: 'Graph linear inequalities and systems (solid/dashed lines, choosing half-planes).' },
    { zh: '理解可行解、可行解區域、目標函數、最佳解等名詞。', en: 'Know the terms feasible solution, feasible region, objective function, optimal solution.' },
    { zh: '能用平行線法與頂點法求線性規劃問題的最大值與最小值。', en: 'Use the parallel-line and vertex methods to find maxima and minima.' },
    { zh: '能將生活情境（生產、成本、運輸、營養）轉化為線性規劃模型並解釋結果。', en: 'Model real situations (production, cost, transport, nutrition) as LP problems and interpret results.' }
  ],
  prereq: [
    { zh: '直線方程式與斜率（第一冊）', en: 'Equations of lines and slope (Book 1)' },
    { zh: '二元一次聯立方程式求交點', en: 'Solving 2×2 linear systems for intersections' },
    { zh: '二元一次不等式的圖形（第一冊）', en: 'Graphs of linear inequalities (Book 1)' }
  ],
  steps: [
    { h: { zh: '暖身：章首引例', en: 'Warm-up: the opening problem' }, d: { zh: '在第 1 節開頭玩「學期成績」滑桿，先憑直覺找最大值。', en: 'Play with the grade sliders at the start of Section 1 and guess the maximum.' }, link: 'l1', t: 10 },
    { h: { zh: '第 1 節　平行直線系', en: 'Section 1  Parallel families' }, d: { zh: '讀例題 1、2，完成隨堂練習；到實驗室「平行直線系」拖拉常數項。', en: 'Study Examples 1–2, do the practices; try the Lab "Parallel family".' }, link: 'l1', t: 25 },
    { h: { zh: '第 2 節　二元一次不等式', en: 'Section 2  Linear inequalities' }, d: { zh: '掌握「實線/虛線」與「代入原點」；在實驗室用「半平面探索器」點點看。', en: 'Master solid/dashed and the origin test; click around in the Half-plane Explorer.' }, link: 'l2', t: 30 },
    { h: { zh: '第 3 節　線性規劃', en: 'Section 3  Linear programming' }, d: { zh: '理解可行解區域與目標函數；比較平行線法與頂點法；完成例題 4～6。', en: 'Understand the feasible region and objective; compare both methods; do Examples 4–6.' }, link: 'l3', t: 50 },
    { h: { zh: '習題 1　基本→進階→素養', en: 'Exercises  basic → advanced → literacy' }, d: { zh: '先自己算，再看提示，最後對照詳解。', en: 'Try first, then hints, then full solutions.' }, link: 'ex', t: 50 },
    { h: { zh: '反覆練習＋測驗', en: 'Practice + quiz' }, d: { zh: '隨機題目練到連對 5 題，再挑戰 10 題測驗（目標 80 分以上）。', en: 'Practise until a 5-question streak, then take the 10-question quiz (aim for 80+).' }, link: 'practice', t: 30 },
    { h: { zh: '延伸與反思', en: 'Extension & reflection' }, d: { zh: '閱讀進階內容（整數解、無界區域、多重最佳解），下載學習歷程。', en: 'Read the extension topics (integer solutions, unbounded regions, multiple optima) and download your log.' }, link: 'adv', t: 20 }
  ],
  tips: [
    { zh: '畫圖四步驟：畫界線 → 決定實/虛線 → 代入測試點 → 塗出共同區域。', en: 'Four drawing steps: boundary → solid/dashed → test point → shade the common part.' },
    { zh: '求頂點：把兩條界線聯立求交點，記得檢查交點是否滿足其他所有條件！', en: 'For vertices: solve two boundary equations, then check the point satisfies all other constraints!' },
    { zh: '平行線法看「方向」：P＝ax＋by 的值沿 (a, b) 方向增加。', en: 'Parallel-line method: P = ax + by increases in the direction (a, b).' },
    { zh: '應用題別忘了 x≥0、y≥0 這類「隱藏條件」，以及答案要不要是整數。', en: 'In word problems, don\'t forget hidden constraints such as x ≥ 0, y ≥ 0, and whether answers must be integers.' }
  ],
  errors: [
    { zh: '把「不超過」寫成「＜」：「不超過」是 ≤，「至少」是 ≥。', en: '"Not exceeding" is ≤ (not <); "at least" is ≥.' },
    { zh: '把兩直線交點當頂點，卻沒檢查它在不在可行解區域內。', en: 'Taking an intersection as a vertex without checking it is feasible.' },
    { zh: '可行解區域無界時，仍說一定有最大值。', en: 'Claiming a maximum must exist even when the region is unbounded.' },
    { zh: '係數約分後忘了目標函數要用原本的數值計算。', en: 'Simplifying constraints is fine — but evaluate the original objective.' }
  ],
  checks: [
    { zh: '我能說明為什麼 x－y＝1 與 x－y＝3 平行。', en: 'I can explain why x − y = 1 and x − y = 3 are parallel.' },
    { zh: '我能判斷不等式的界線要畫實線還是虛線。', en: 'I can tell whether a boundary is solid or dashed.' },
    { zh: '我會用代入測試點決定半平面。', en: 'I can choose the half-plane with a test point.' },
    { zh: '我能畫出聯立不等式的可行解區域並求出頂點。', en: 'I can draw a feasible region and find its vertices.' },
    { zh: '我會用平行線法說明最大值、最小值出現的位置。', en: 'I can explain where the max/min occurs using parallel lines.' },
    { zh: '我會用頂點法列表求極值。', en: 'I can tabulate vertex values to find extremes.' },
    { zh: '我能把文字應用題轉成線性規劃模型。', en: 'I can turn a word problem into an LP model.' }
  ]
};

/* 線性規劃 — 互動視覺化元件 */
'use strict';
const dec = v => String(Math.round(v * 100) / 100).replace('-', '−');
const tr = (zh, en) => (window.App && App.lang === 'en') ? en : zh;
const sfx = n => window.Snd && Snd[n] && Snd[n]();
const logv = (t, d) => window.Log && Log.add(t, d);

function h(tag, attrs = {}, html = '') {
  const e = document.createElement(tag);
  for (const k in attrs) { if (k === 'class') e.className = attrs[k]; else if (k.startsWith('on')) e.addEventListener(k.slice(2), attrs[k]); else e.setAttribute(k, attrs[k]); }
  if (html) e.innerHTML = html;
  return e;
}
function slider(label, min, max, step, val, on, fmtFn) {
  const w = h('label', { class: 'rng' });
  w.innerHTML = `<span>${label}</span><input type="range" min="${min}" max="${max}" step="${step}" value="${val}"><output></output>`;
  const inp = w.querySelector('input'), out = w.querySelector('output');
  const show = () => { out.textContent = (fmtFn || fmt)(+inp.value); };
  let last = +inp.value;
  inp.addEventListener('input', () => { show(); if (Math.round(+inp.value) !== Math.round(last)) sfx('tick'); last = +inp.value; on(+inp.value); });
  show();
  w.set = v => { inp.value = v; show(); };
  w.get = () => +inp.value;
  w.inp = inp;
  return w;
}
function mkPlot(host, box, size = 460) {
  const [x0, x1, y0, y1] = box, ar = (y1 - y0) / (x1 - x0);
  const eq = ar > .6 && ar < 1.4 && (x1 - x0) <= 30;
  const o = { xmin: x0, xmax: x1, ymin: y0, ymax: y1, size };
  if (!eq) { o.h = size * Math.min(1.15, Math.max(.75, ar)); }
  const tx = Plot.prototype.autoTick(x1 - x0), ty = Plot.prototype.autoTick(y1 - y0);
  o.tickX = tx; o.tickY = ty; o.stepX = tx; o.stepY = ty; o.step = Math.min(tx, ty);
  return new Plot(host, o);
}
function wbox(host, title, icon) {
  const c = h('div', { class: 'card wbox' });
  c.innerHTML = `<h3>${icon || '🧪'} ${title}</h3>`;
  const lab = h('div', { class: 'lab' }), ph = h('div', { class: 'plothost' }), ctrl = h('div', { class: 'ctrl' });
  lab.append(ph, ctrl); c.append(lab); host.append(c);
  return { c, ph, ctrl };
}

/* ================= presets ================= */
const PRESETS = [
  { id: 'f14', name: { zh: '第3節 引例（圖14）', en: 'Sec.3 intro (Fig.14)' }, hs: [H(1, 2, 6, '>='), H(1, -1, 2, '<='), H(0, 1, 4, '<=')], box: [-4, 9, -2, 7], p: 1, q: 1 },
  { id: 'ex4', name: { zh: '例題 4', en: 'Example 4' }, hs: [H(1, 2, 6, '<='), H(2, 1, 6, '<='), H(1, 0, 0, '>='), H(0, 1, 0, '>=')], box: [-1, 7, -1, 7], p: 1, q: 3 },
  { id: 'pr4', name: { zh: '例題 4 隨堂練習', en: 'Practice after Ex.4' }, hs: [H(1, 1, 10, '>='), H(1, -1, 0, '<='), H(0, 1, 10, '<=')], box: [-2, 14, -2, 14], p: 2, q: 1 },
  { id: 'intro', name: { zh: '章首引例（成績）', en: 'Opening problem (grades)' }, hs: [H(1, 0, 0, '>='), H(1, 0, 100, '<='), H(0, 1, 0, '>='), H(0, 1, 100, '<='), H(1, 1, 150, '<=')], box: [-15, 120, -15, 120], p: 0.3, q: 0.7 },
  { id: 'ex5', name: { zh: '例題 5 精油', en: 'Ex.5 essential oil' }, hs: [H(5, 4, 80, '<='), H(3, 1, 30, '<='), H(1, 0, 0, '>='), H(0, 1, 0, '>=')], box: [-2, 20, -2, 24], p: 25, q: 12 },
  { id: 'pr5', name: { zh: '隨堂練習 大禹合金', en: 'Practice: Da-Yu alloys' }, hs: [H(5, 2, 90, '<='), H(1, 1, 30, '<='), H(1, 0, 0, '>='), H(0, 1, 0, '>=')], box: [-2, 34, -2, 34], p: 50, q: 30 },
  { id: 'ex6', name: { zh: '例題 6 合金成本', en: 'Ex.6 alloy cost' }, hs: [H(1, 2, 8, '>='), H(2, 1, 10, '>='), H(1, 0, 0, '>='), H(0, 1, 0, '>=')], box: [-1, 12, -1, 12], p: 6, q: 4, note: { zh: '目標函數 60000x＋40000y 與 6x＋4y 方向相同', en: '60000x + 40000y points the same way as 6x + 4y' } },
  { id: 'pr6', name: { zh: '隨堂練習 甲乙工廠', en: 'Practice: two factories' }, hs: [H(2, 1, 8, '>='), H(2, 7, 20, '>='), H(1, 0, 0, '>='), H(0, 1, 0, '>=')], box: [-1, 12, -1, 10], p: 1, q: 2 },
  { id: 'ex10', name: { zh: '習題 10 雞飼料', en: 'Q10 chicken feed' }, hs: [H(7, 2, 84, '>='), H(1, 2, 24, '>='), H(3, 2, 60, '>='), H(1, 0, 0, '>='), H(0, 1, 0, '>=')], box: [-2, 30, -2, 46], p: 5, q: 4 }
];
const clone = hs => hs.map(x => Object.assign({}, x));
function presetSelect(onPick, sel = 0) {
  const s = h('select');
  PRESETS.forEach((p, i) => { const o = h('option', { value: i }); o.textContent = L(p.name); if (i === sel) o.selected = true; s.append(o); });
  s.addEventListener('change', () => { sfx('click'); onPick(PRESETS[+s.value], +s.value); });
  return s;
}
function drawRegion(p, hs, o = {}) {
  p.regionOf(hs, { fill: 'var(--region)' });
  hs.forEach((c, i) => { if ((c.a === 0 || c.b === 0) && c.c === 0 && o.skipAxes !== false) return; p.cons(c, { color: COL[i % COL.length], label: o.labels === false ? null : lin(c.a, c.b) + '=' + fmt(c.c), at: .08 + (i * .17) % .8 }); });
  const V = Geo.vertices(hs);
  if (o.vertices !== false) V.forEach(v => p.point(v[0], v[1], { r: 5, color: 'var(--c6)', label: o.vlabels === false ? null : ptT(v), dy: -8 }));
  return V;
}

const W = {
  /* ---------- 章首引例：學期成績 ---------- */
  grade(host) {
    const { ph, ctrl } = wbox(host, tr('動手試：學期成績最多幾分？', 'Try it: the highest semester grade'), '🎓');
    const hs = PRESETS[3].hs;
    const p = mkPlot(ph, [-15, 120, -15, 120], 440);
    let x = 60, y = 60, best = 0;
    const ro = h('div', { class: 'readout' });
    const sx = slider(tr('平時 x', 'Daily x'), 0, 100, 1, x, v => { x = v; draw(); });
    const sy = slider(tr('段考 y', 'Exam y'), 0, 100, 1, y, v => { y = v; draw(); });
    const rev = h('button', { class: 'btn sm orange', onclick: () => { shown = true; sfx('win'); draw(); logv('lab', tr('章首引例：揭曉答案', 'Opening problem: revealed')); } }, tr('💡 揭曉最佳解', '💡 Reveal optimum'));
    let shown = false;
    ctrl.append(h('p', { class: 'muted' }, tr('拖曳滑桿（或點圖形）改變 x、y，紅色區域代表符合條件的成績組合。', 'Move the sliders (or tap the graph). The red region holds all allowed (x, y).')), sx, sy, ro, rev);
    p.onClick(([px, py]) => { x = Math.round(Math.min(100, Math.max(0, px))); y = Math.round(Math.min(100, Math.max(0, py))); sx.set(x); sy.set(y); sfx('click'); draw(); });
    function draw() {
      p.clearAll('region', 'lines', 'pts', 'lbl', 'ui');
      drawRegion(p, hs, { vlabels: true, labels: false });
      p.line(1, 1, 150, { color: 'var(--c5)', label: 'x+y=150', at: .2 });
      const ok = x + y <= 150, g = 0.3 * x + 0.7 * y;
      if (ok && g > best) { best = g; if (g >= 85 - 1e-9) { sfx('win'); } }
      p.line(0.3, 0.7, g, { color: 'var(--c2)', dash: true, w: 2 });
      p.point(x, y, { r: 8, color: ok ? 'var(--c7)' : 'var(--bad)', label: `(${x}, ${y})`, bold: true });
      if (shown) { p.line(0.3, 0.7, 85, { color: 'var(--c6)', w: 3, label: '0.3x+0.7y=85', at: .1 }); p.point(50, 100, { r: 9, color: 'var(--c6)', label: '(50, 100)', dy: 22 }); }
      ro.innerHTML = `x＋y＝<b>${x + y}</b> ${ok ? '✅ ≤ 150' : tr('❌ 超過 150', '❌ exceeds 150')}<br>${tr('學期成績', 'Semester grade')} 0.3x＋0.7y＝<b>${fmt(Math.round(g * 10) / 10)}</b><br>${tr('你找到的最高分', 'Your best so far')}：<b>${fmt(Math.round(best * 10) / 10)}</b>` + (shown ? `<br>🏆 ${tr('最佳解：x＝50，y＝100，最高 85 分', 'Optimum: x = 50, y = 100, max 85')}` : '');
    }
    draw();
  },

  /* ---------- 平行直線系 ---------- */
  family(host, o = {}) {
    const { ph, ctrl } = wbox(host, tr('平行直線系：改變常數項 c', 'Parallel family: change the constant c'), '📏');
    let a = o.a ?? 1, b = o.b ?? 1, c = o.c ?? 2, timer = null;
    const p = mkPlot(ph, [-8, 8, -8, 8], 440);
    const ro = h('div', { class: 'readout' });
    const sa = slider('a', -5, 5, 1, a, v => { a = v; draw(); });
    const sb = slider('b', -5, 5, 1, b, v => { b = v; draw(); });
    const sc = slider('c', -12, 12, 0.5, c, v => { c = v; draw(); });
    const play = h('button', { class: 'btn sm', onclick: () => {
      if (timer) { clearInterval(timer); timer = null; play.textContent = tr('▶ 自動平移', '▶ Animate'); return; }
      play.textContent = tr('⏸ 暫停', '⏸ Pause'); let dir = 1;
      timer = setInterval(() => { if (!document.body.contains(play)) { clearInterval(timer); return; } c += dir * .25; if (c >= 12 || c <= -12) dir *= -1; sc.set(c); if (Number.isInteger(c)) sfx('tick'); draw(); }, 70);
      logv('lab', tr('平行直線系：自動平移', 'Parallel family: animate'));
    } }, tr('▶ 自動平移', '▶ Animate'));
    ctrl.append(h('div', { class: 'readout' }, `${tr('方程式', 'Equation')}　<b class="mn">ax＋by＝c</b>`), sa, sb, sc, h('div', { class: 'row' }), ro);
    ctrl.lastChild.previousSibling.append(play);
    function draw() {
      p.clearAll('lines', 'pts', 'lbl', 'ui');
      if (a === 0 && b === 0) { ro.innerHTML = tr('a、b 不可同時為 0', 'a and b cannot both be 0'); return; }
      for (let d = -12; d <= 12; d += 2) if (Math.abs(d - c) > .01) p.line(a, b, d, { color: 'var(--ink2)', w: 1.2, op: .35 });
      p.line(a, b, c, { color: 'var(--c1)', w: 3.6, label: lin(a, b) + '=' + fmt(c), at: .85 });
      let s = '';
      if (b !== 0) { const yi = c / b; p.point(0, yi, { color: 'var(--c5)', label: `(0, ${fmt(yi)})`, dx: 8 }); s += `${tr('y 截距', 'y-intercept')}＝<b>${fmt(yi)}</b>　`; }
      if (a !== 0) { const xi = c / a; p.point(xi, 0, { color: 'var(--c2)', label: `(${fmt(xi)}, 0)`, dy: 20 }); s += `${tr('x 截距', 'x-intercept')}＝<b>${fmt(xi)}</b>`; }
      const n = Math.hypot(a, b), d0 = c / n;
      p.arrow(0, 0, a / n * 2, b / n * 2, { color: 'var(--c6)' });
      const slope = b !== 0 ? fmt(-a / b) : tr('不存在（鉛直線）', 'undefined (vertical)');
      ro.innerHTML = `${tr('斜率', 'Slope')} −a/b＝<b>${slope}</b><br>${s}<br><span class="muted">${tr('紫色箭頭為 (a, b) 方向：c 增加時，直線朝箭頭方向平移。', 'The purple arrow is the direction (a, b): increasing c moves the line that way.')}</span>`;
    }
    draw();
  },

  /* ---------- 半平面探索器 ---------- */
  halfplane(host, o = {}) {
    const { ph, ctrl } = wbox(host, o.title || tr('半平面探索器：點一點，代入檢驗', 'Half-plane explorer: tap to test points'), '🌗');
    let hp = Object.assign({ a: 1, b: 1, c: 2, op: '<' }, o.h || {}), pts = [];
    const p = mkPlot(ph, [-6, 6, -6, 6], 440);
    const ro = h('div', { class: 'readout' });
    const sa = slider('a', -5, 5, 1, hp.a, v => { hp.a = v; pts = []; draw(); });
    const sb = slider('b', -5, 5, 1, hp.b, v => { hp.b = v; pts = []; draw(); });
    const sc = slider('c', -8, 8, 1, hp.c, v => { hp.c = v; pts = []; draw(); });
    const op = h('select'); ['<', '<=', '>', '>='].forEach(k => { const e = h('option', { value: k }); e.textContent = OPS[k]; if (k === hp.op) e.selected = true; op.append(e); });
    op.addEventListener('change', () => { hp.op = op.value; sfx('click'); draw(); });
    const shade = h('label', {}, `<input type="checkbox" checked> ${tr('顯示塗色區域', 'Show shading')}`);
    shade.querySelector('input').addEventListener('change', draw);
    const btnO = h('button', { class: 'btn sm alt', onclick: () => { test(0, 0); } }, tr('代入原點 O(0, 0)', 'Test origin O(0, 0)'));
    const btnC = h('button', { class: 'btn sm alt', onclick: () => { pts = []; draw(); } }, tr('清除測試點', 'Clear points'));
    const r1 = h('div', { class: 'row' }); r1.append(h('span', { style: 'font-weight:700' }, `<span class="mn">ax＋by</span>`), op, h('span', { class: 'mn' }, 'c'), shade);
    const r2 = h('div', { class: 'row' }); r2.append(btnO, btnC);
    if (!o.fixed) ctrl.append(sa, sb, sc);
    ctrl.append(r1, r2, ro, h('p', { class: 'muted' }, tr('點擊圖上任一點，就會把該點代入不等式檢驗。', 'Tap any point on the graph to substitute it into the inequality.')));
    p.onClick(([x, y]) => test(Math.round(x * 2) / 2, Math.round(y * 2) / 2));
    function test(x, y) {
      const ok = Geo.sat(hp, x, y);
      pts.push([x, y, ok]); if (pts.length > 12) pts.shift();
      sfx(ok ? 'ok' : 'bad'); draw();
      const v = hp.a * x + hp.b * y;
      ro.innerHTML = `${tr('代入', 'Substitute')} (${fmt(x)}, ${fmt(y)})：${fmt(hp.a)}·(${fmt(x)})＋${fmt(hp.b)}·(${fmt(y)})＝<b>${fmt(v)}</b> ${OPS[hp.op]} ${fmt(hp.c)}　${ok ? tr('✅ 成立，點在圖形內', '✅ true — inside the graph') : tr('❌ 不成立，點不在圖形內', '❌ false — not in the graph')}` + (Math.abs(v - hp.c) < 1e-9 ? `<br>${tr('（點在界線上', '(on the boundary — ')}${hp.op.length === 2 ? tr('，含等號所以包含）', 'included since ≤/≥)') : tr('，不含等號所以不包含）', 'excluded since </>)')}` : '');
      logv('lab', tr('半平面測試點 ', 'Half-plane test ') + `(${fmt(x)},${fmt(y)}) ${ok ? '✓' : '✗'}`);
    }
    function draw() {
      p.clearAll('region', 'lines', 'pts', 'lbl');
      if (hp.a === 0 && hp.b === 0) { ro.innerHTML = tr('a、b 不可同時為 0', 'a and b cannot both be 0'); return; }
      if (shade.querySelector('input').checked) p.half(hp, { fill: 'var(--region)' });
      p.cons(hp, { color: 'var(--c5)', w: 3, label: hpText(hp), at: .85 });
      pts.forEach(([x, y, ok]) => p.point(x, y, { r: 7, color: ok ? 'var(--ok)' : 'var(--bad)', label: ok ? '✓' : '✗' }));
      if (!pts.length) ro.innerHTML = `${tr('不等式', 'Inequality')}：<b class="mn">${hpText(hp)}</b><br>${tr('界線', 'Boundary')}：${hp.op.length === 2 ? tr('實線（含等號）', 'solid (includes =)') : tr('虛線（不含等號）', 'dashed (excludes =)')}`;
    }
    draw();
  },

  /* ---------- 可行解區域建構器 ---------- */
  region(host) {
    const { ph, ctrl } = wbox(host, tr('可行解區域建構器', 'Feasible-region builder'), '🧱');
    let pre = PRESETS[0], hs = clone(pre.hs), p;
    const list = h('div', { class: 'cons' }), ro = h('div', { class: 'readout' });
    const sel = presetSelect(pr => { pre = pr; hs = clone(pr.hs); build(); }, 0);
    const add = h('button', { class: 'btn sm green', onclick: () => { if (hs.length >= 7) return; hs.push(H(1, 1, 3, '<=')); sfx('click'); build(); } }, tr('＋ 新增條件', '+ Add constraint'));
    const r = h('div', { class: 'row' }); r.append(h('b', {}, tr('範例：', 'Preset:')), sel);
    ctrl.append(r, list, add, ro);
    function build() {
      ph.innerHTML = ''; p = mkPlot(ph, pre.box, 460);
      list.innerHTML = '';
      hs.forEach((c, i) => {
        const row = h('div', { class: 'ci' });
        row.innerHTML = `<span class="sw" style="background:${COL[i % COL.length]}"></span><input type="number" step="any" value="${c.a}"> <i>x</i> ＋ <input type="number" step="any" value="${c.b}"> <i>y</i> <select>${['<=', '<', '>=', '>'].map(k => `<option value="${k}" ${k === c.op ? 'selected' : ''}>${OPS[k]}</option>`).join('')}</select> <input type="number" step="any" value="${c.c}"> <button class="btn sm alt" title="del">✖</button>`;
        const ins = row.querySelectorAll('input');
        ins[0].addEventListener('input', e => { c.a = +e.target.value || 0; draw(); });
        ins[1].addEventListener('input', e => { c.b = +e.target.value || 0; draw(); });
        ins[2].addEventListener('input', e => { c.c = +e.target.value || 0; draw(); });
        row.querySelector('select').addEventListener('change', e => { c.op = e.target.value; draw(); });
        row.querySelector('button').addEventListener('click', () => { hs.splice(i, 1); sfx('click'); build(); });
        list.append(row);
      });
      draw();
    }
    function draw() {
      p.clearAll('region', 'lines', 'pts', 'lbl');
      const ok = hs.filter(c => c.a || c.b);
      p.regionOf(ok, { fill: 'var(--region)' });
      ok.forEach((c, i) => p.cons(c, { color: COL[hs.indexOf(c) % COL.length], w: 2.4 }));
      const V = Geo.vertices(ok);
      V.forEach(v => p.point(v[0], v[1], { r: 5.5, color: 'var(--c6)', label: ptT(v) }));
      const empty = Geo.empty(ok), bounded = Geo.bounded(ok);
      ro.innerHTML = empty ? tr('⚠️ 可行解區域為空集合（條件互相矛盾）', '⚠️ The feasible region is empty (constraints conflict).') :
        `${bounded ? tr('🔒 有界區域（多邊形）', '🔒 Bounded region (polygon)') : tr('♾️ 無界區域：最大值或最小值可能不存在', '♾️ Unbounded region: a max or min may not exist')}<br>${tr('頂點', 'Vertices')}（${V.length}）：${V.map(v => ptH(v)).join('、') || '—'}`;
    }
    build();
  },

  /* ---------- 平行線法掃描 ---------- */
  sweep(host, o = {}) {
    const { ph, ctrl } = wbox(host, o.title || tr('平行線法：移動目標函數直線', 'Parallel-line method: slide the objective line'), '🎯');
    let pre = o.preset || PRESETS[0], P = pre.p, Q = pre.q, p, k, sk, timer = null;
    const ro = h('div', { class: 'readout' }), objBox = h('div', { class: 'row' });
    if (!o.fixed) {
      const sel = presetSelect(pr => { pre = pr; P = pr.p; Q = pr.q; ip.value = P; iq.value = Q; build(); }, o.sel || 0);
      const r = h('div', { class: 'row' }); r.append(h('b', {}, tr('範例：', 'Preset:')), sel); ctrl.append(r);
      objBox.innerHTML = `<b>${tr('目標函數', 'Objective')}</b> <span class="mn">P＝</span><input type="number" step="any" style="width:5em" value="${P}"><i>x</i>＋<input type="number" step="any" style="width:5em" value="${Q}"><i>y</i>`;
      var [ip, iq] = objBox.querySelectorAll('input');
      ip.addEventListener('change', () => { P = +ip.value || 0; build(); }); iq.addEventListener('change', () => { Q = +iq.value || 0; build(); });
      ctrl.append(objBox);
    }
    const kHost = h('div');
    const play = h('button', { class: 'btn sm', onclick: () => {
      if (timer) { stop(); return; }
      play.textContent = tr('⏸ 暫停', '⏸ Pause');
      const [kmin, kmax] = range(); k = kmin; let last = null;
      timer = setInterval(() => {
        if (!document.body.contains(play)) return stop();
        k += (kmax - kmin) / 120; if (k > kmax) { stop(); return; }
        sk.set(k); const st = draw(); if (st !== last) { if (st === 'in') sfx('ok'); if (st === 'out' && last === 'in') sfx('bad'); last = st; }
      }, 45);
      logv('lab', tr('平行線法動畫：', 'Sweep animation: ') + L(pre.name));
    } }, tr('▶ 自動掃描', '▶ Auto sweep'));
    const rr = h('div', { class: 'row' }); rr.append(play);
    ctrl.append(kHost, rr, ro);
    function stop() { clearInterval(timer); timer = null; play.textContent = tr('▶ 自動掃描', '▶ Auto sweep'); }
    function range() {
      const [x0, x1, y0, y1] = pre.box, vals = [[x0, y0], [x0, y1], [x1, y0], [x1, y1]].map(([x, y]) => P * x + Q * y);
      return [Math.min(...vals), Math.max(...vals)];
    }
    function build() {
      ph.innerHTML = ''; p = mkPlot(ph, pre.box, 460);
      const [kmin, kmax] = range(); const opt = Geo.optimize(pre.hs, P, Q);
      k = opt.min != null ? opt.min : (kmin + kmax) / 2;
      kHost.innerHTML = '';
      const st = Math.max((kmax - kmin) / 400, 1e-3);
      sk = slider('k', kmin, kmax, st, k, v => { k = v; draw(); }, dec);
      kHost.append(sk);
      draw();
    }
    function draw() {
      p.clearAll('region', 'lines', 'pts', 'lbl', 'ui');
      drawRegion(p, pre.hs, { labels: true });
      if (!P && !Q) { ro.textContent = tr('請輸入目標函數係數', 'Enter objective coefficients'); return; }
      const opt = Geo.optimize(pre.hs, P, Q);
      const lo = opt.min == null ? -Infinity : opt.min, hi = opt.max == null ? Infinity : opt.max;
      const tol = Math.max(1e-6, (Math.abs(hi) + Math.abs(lo)) * 1e-3 || 1e-6);
      const inside = k >= lo - tol && k <= hi + tol;
      const atMax = opt.max != null && Math.abs(k - opt.max) <= tol * 3, atMin = opt.min != null && Math.abs(k - opt.min) <= tol * 3;
      p.line(P, Q, k, { color: inside ? (atMax || atMin ? 'var(--c1)' : 'var(--c7)') : 'var(--ink2)', w: inside ? 3.6 : 2, dash: !inside, label: `${lin(P, Q)}=${dec(k)}`, at: .9 });
      const V = opt.V; if (V.length) { const cx = V.reduce((s, v) => s + v[0], 0) / V.length, cy = V.reduce((s, v) => s + v[1], 0) / V.length; const n = Math.hypot(P, Q), sc = (pre.box[1] - pre.box[0]) / 8; p.arrow(cx, cy, cx + P / n * sc, cy + Q / n * sc, { color: 'var(--c6)' }); }
      if (atMax) opt.argmax.forEach(v => p.point(v[0], v[1], { r: 10, color: 'var(--c1)', label: 'MAX', bold: true, dy: 22 }));
      if (atMin) opt.argmin.forEach(v => p.point(v[0], v[1], { r: 10, color: 'var(--c5)', label: 'MIN', bold: true, dy: 22 }));
      ro.innerHTML = `${tr('目前直線', 'Current line')}：<b class="mn">${lin(P, Q)}＝${dec(k)}</b><br>` +
        (inside ? tr('🟢 直線通過可行解區域：線上的可行解都使 P＝k', '🟢 The line meets the feasible region: every feasible point on it gives P = k') : tr('⚪ 直線不再通過可行解區域', '⚪ The line no longer meets the feasible region')) +
        `<br>${tr('最大值', 'Max')}：<b>${opt.max == null ? tr('不存在', 'none') : fmt(opt.max)}</b>　${tr('最小值', 'Min')}：<b>${opt.min == null ? tr('不存在', 'none') : fmt(opt.min)}</b>` +
        (atMax ? `<br>🔴 ${tr('到達最大值！最後碰到的點', 'Maximum reached at')} ${opt.argmax.map(ptH).join('、')}` : '') +
        (atMin ? `<br>🔵 ${tr('到達最小值！', 'Minimum reached at')} ${opt.argmin.map(ptH).join('、')}` : '') +
        `<br><span class="muted">${tr('紫色箭頭 (a, b) 指向 P 增加的方向。', 'The purple arrow (a, b) points where P increases.')}${pre.note ? ' ' + L(pre.note) : ''}</span>`;
      return inside ? 'in' : 'out';
    }
    build();
  },

  /* ---------- 頂點法 + 目標函數轉盤 ---------- */
  vertex(host) {
    const { ph, ctrl } = wbox(host, tr('頂點法＋目標函數方向轉盤', 'Vertex method + objective direction dial'), '🧭');
    let pre = PRESETS[1], th = 72, p;
    const tbl = h('div', { class: 'tablewrap' }), ro = h('div', { class: 'readout' });
    const sel = presetSelect(pr => { pre = pr; build(); }, 1);
    const sth = slider(tr('方向角 θ', 'Angle θ'), 0, 359, 1, th, v => { th = v; draw(); }, v => v + '°');
    const r = h('div', { class: 'row' }); r.append(h('b', {}, tr('範例：', 'Preset:')), sel);
    ctrl.append(r, h('p', { class: 'muted' }, tr('目標函數 P＝ax＋by，其中 (a, b)＝(cos θ, sin θ)。轉動 θ，看看最佳頂點如何改變；當 (a, b) 垂直於某一邊時，整條邊都是最佳解！', 'Objective P = ax + by with (a, b) = (cos θ, sin θ). Turn θ to see the optimal vertex change; when (a, b) is perpendicular to an edge, the whole edge is optimal!')), sth, tbl, ro);
    function build() { ph.innerHTML = ''; p = mkPlot(ph, pre.box, 460); draw(); }
    function draw() {
      const a = +Math.cos(th * Math.PI / 180).toFixed(4), b = +Math.sin(th * Math.PI / 180).toFixed(4);
      p.clearAll('region', 'lines', 'pts', 'lbl', 'ui');
      drawRegion(p, pre.hs, { vertices: false });
      const opt = Geo.optimize(pre.hs, a, b), V = opt.V;
      const cx = V.reduce((s, v) => s + v[0], 0) / (V.length || 1), cy = V.reduce((s, v) => s + v[1], 0) / (V.length || 1), sc = (pre.box[1] - pre.box[0]) / 6;
      p.arrow(cx, cy, cx + a * sc, cy + b * sc, { color: 'var(--c6)', w: 4 });
      if (opt.max != null) p.line(a, b, opt.max, { color: 'var(--c1)', dash: true, w: 2 });
      if (opt.min != null) p.line(a, b, opt.min, { color: 'var(--c5)', dash: true, w: 2 });
      V.forEach((v, i) => {
        const isMax = opt.argmax.some(u => u === v), isMin = opt.argmin.some(u => u === v);
        p.point(v[0], v[1], { r: isMax || isMin ? 9 : 5.5, color: isMax ? 'var(--c1)' : isMin ? 'var(--c5)' : 'var(--c6)', label: ptT(v) });
      });
      tbl.innerHTML = `<table class="t"><tr><th>${tr('頂點', 'Vertex')}</th><th>P＝${a.toFixed(2)}x＋${b.toFixed(2)}y</th></tr>${V.map((v, i) => `<tr class="${opt.argmax.includes(v) ? 'max' : opt.argmin.includes(v) ? 'min' : ''}"><td>${ptH(v)}</td><td>${(opt.vals[i]).toFixed(2)}</td></tr>`).join('')}</table>`;
      const multi = opt.argmax.length > 1 ? tr('🎉 多重最佳解：最大值出現在整條邊上！', '🎉 Multiple optima: the maximum occurs along a whole edge!') : opt.argmin.length > 1 ? tr('🎉 多重最佳解：最小值出現在整條邊上！', '🎉 Multiple optima: the minimum occurs along a whole edge!') : '';
      if (multi) sfx('ok');
      ro.innerHTML = `🔴 ${tr('最大值', 'Max')}：${opt.max == null ? tr('不存在（區域無界）', 'none (unbounded)') : opt.max.toFixed(2) + ' @ ' + opt.argmax.map(ptH).join('、')}<br>🔵 ${tr('最小值', 'Min')}：${opt.min == null ? tr('不存在（區域無界）', 'none (unbounded)') : opt.min.toFixed(2) + ' @ ' + opt.argmin.map(ptH).join('、')}` + (multi ? '<br>' + multi : '');
    }
    build();
  },

  /* ---------- 整數格點 ---------- */
  lattice(host, o = {}) {
    const hs = o.hs || [H(3, 2, 6, '<='), H(1, 0, 0, '>='), H(0, 1, 0, '>=')];
    const { ph, ctrl } = wbox(host, o.title || tr('格點計數：點出所有整數解', 'Lattice points: tap every integer solution'), '🔢');
    const p = mkPlot(ph, o.box || [-1, 4, -1, 4], 420);
    const sel = new Set(); let revealed = false;
    const all = []; const [x0, x1, y0, y1] = o.box || [-1, 4, -1, 4];
    for (let x = Math.ceil(x0); x <= x1; x++) for (let y = Math.ceil(y0); y <= y1; y++) if (Geo.satAll(hs, x, y) && hs.every(c => Geo.sat(c, x, y))) all.push(x + ',' + y);
    const ro = h('div', { class: 'readout' });
    const chk = h('button', { class: 'btn sm green', onclick: () => {
      const ok = all.length === sel.size && all.every(k => sel.has(k));
      sfx(ok ? 'win' : 'bad'); ro.innerHTML = ok ? tr(`🎉 完全正確！共 ${all.length} 組。`, `🎉 Perfect! ${all.length} pairs.`) : tr(`還差一點：你選了 ${sel.size} 點，其中 ${[...sel].filter(k => all.includes(k)).length} 點正確。`, `Not yet: you picked ${sel.size}, ${[...sel].filter(k => all.includes(k)).length} correct.`);
      logv('lab', tr('格點計數 ', 'Lattice count ') + (ok ? '✓' : '✗'));
    } }, tr('✔ 檢查', '✔ Check'));
    const rev = h('button', { class: 'btn sm alt', onclick: () => { revealed = true; draw(); ro.innerHTML = tr(`共 ${all.length} 組：`, `${all.length} pairs: `) + all.map(k => `(${k.replace(',', ', ')})`).join('、'); } }, tr('顯示答案', 'Show answer'));
    const r = h('div', { class: 'row' }); r.append(chk, rev);
    ctrl.append(h('div', { class: 'readout' }, `${tr('條件', 'Constraints')}：${sys(...hs.map(hpText))}<br>${tr('點擊格點來選取 / 取消。', 'Tap lattice points to select / unselect.')}`), r, ro);
    p.onClick(([x, y]) => { const k = Math.round(x) + ',' + Math.round(y); if (Math.hypot(x - Math.round(x), y - Math.round(y)) > .35) return; sel.has(k) ? sel.delete(k) : sel.add(k); sfx('click'); draw(); });
    function draw() {
      p.clearAll('region', 'lines', 'pts', 'lbl');
      p.regionOf(hs, { fill: 'var(--region)' }); hs.forEach((c, i) => { if (!(c.c === 0 && (c.a === 0 || c.b === 0))) p.cons(c, { color: COL[i] }); });
      for (let x = Math.ceil(x0); x <= x1; x++) for (let y = Math.ceil(y0); y <= y1; y++) {
        const k = x + ',' + y, s = sel.has(k), good = all.includes(k);
        p.point(x, y, { r: s ? 8 : 4, color: s ? (revealed && !good ? 'var(--bad)' : 'var(--c6)') : (revealed && good ? 'var(--c7)' : 'var(--ink2)'), hollow: !s && !(revealed && good) });
      }
      ro.innerHTML = ro.innerHTML || `${tr('已選', 'Selected')}：${sel.size}`;
    }
    draw();
  },

  /* ---------- 情境模擬器 ---------- */
  scenario(host) {
    const SC = [
      { name: { zh: '例題 5：精油提煉（最大化）', en: 'Example 5: essential oil (maximize)' }, x: { zh: '原料 A（公噸）', en: 'Material A (t)' }, y: { zh: '原料 B（公噸）', en: 'Material B (t)' }, max: [16, 30], step: .1, goal: 'max',
        obj: { p: 25, q: 12, n: { zh: '精油產量（公斤）', en: 'Oil (kg)' } }, best: 2080 / 7,
        lim: [{ n: { zh: '成本（萬元）', en: 'Cost (10k)' }, a: 15, b: 12, c: 240, op: '<=' }, { n: { zh: '廢棄物（公斤）', en: 'Waste (kg)' }, a: 75, b: 25, c: 750, op: '<=' }], box: [-1, 18, -1, 22] },
      { name: { zh: '隨堂練習：大禹合金（最大化）', en: 'Practice: Da-Yu alloys (maximize)' }, x: { zh: 'A 合金（公斤）', en: 'Alloy A (kg)' }, y: { zh: 'B 合金（公斤）', en: 'Alloy B (kg)' }, max: [20, 32], step: .5, goal: 'max',
        obj: { p: 50, q: 30, n: { zh: '利潤（元）', en: 'Profit' } }, best: 1100,
        lim: [{ n: { zh: '紅色礦砂（公克）', en: 'Red ore (g)' }, a: 50, b: 20, c: 900, op: '<=' }, { n: { zh: '黃色礦砂（公克）', en: 'Yellow ore (g)' }, a: 40, b: 40, c: 1200, op: '<=' }], box: [-1, 22, -1, 34] },
      { name: { zh: '習題 10：雞飼料（最小化）', en: 'Q10: chicken feed (minimize)' }, x: { zh: '第一種飼料（公斤）', en: 'Feed 1 (kg)' }, y: { zh: '第二種飼料（公斤）', en: 'Feed 2 (kg)' }, max: [30, 45], step: .5, goal: 'min',
        obj: { p: 5, q: 4, n: { zh: '飼料成本（元）', en: 'Feed cost' } }, best: 102,
        lim: [{ n: { zh: '營養素 A', en: 'Nutrient A' }, a: 7, b: 2, c: 84, op: '>=' }, { n: { zh: '營養素 B', en: 'Nutrient B' }, a: 3, b: 6, c: 72, op: '>=' }, { n: { zh: '營養素 C', en: 'Nutrient C' }, a: 3, b: 2, c: 60, op: '>=' }], box: [-1, 30, -1, 46] }
    ];
    const { ph, ctrl } = wbox(host, tr('情境模擬器：當一次廠長！', 'Scenario simulator: run the factory!'), '🏭');
    let sc = SC[0], x = 4, y = 6, p, best = null;
    const sel = h('select'); SC.forEach((s, i) => { const e = h('option', { value: i }); e.textContent = L(s.name); sel.append(e); });
    sel.addEventListener('change', () => { sc = SC[+sel.value]; x = sc.goal === 'min' ? sc.max[0] * .8 : 2; y = sc.goal === 'min' ? sc.max[1] * .8 : 2; best = null; sfx('click'); build(); });
    const sliders = h('div', { class: 'ctrl' }), meters = h('div', { class: 'ctrl' }), ro = h('div', { class: 'readout' });
    const rev = h('button', { class: 'btn sm orange', onclick: () => { showOpt = true; draw(); sfx('win'); } }, tr('💡 顯示最佳解', '💡 Show optimum'));
    let showOpt = false, sx, sy;
    ctrl.append(sel, sliders, meters, ro, rev);
    function build() {
      showOpt = false; ph.innerHTML = ''; p = mkPlot(ph, sc.box, 460);
      p.onClick(([px, py]) => { x = Math.max(0, Math.round(px / sc.step) * sc.step); y = Math.max(0, Math.round(py / sc.step) * sc.step); sx.set(x); sy.set(y); sfx('click'); draw(); });
      sliders.innerHTML = '';
      sx = slider(L(sc.x), 0, sc.max[0], sc.step, x, v => { x = v; draw(); }); sy = slider(L(sc.y), 0, sc.max[1], sc.step, y, v => { y = v; draw(); });
      sliders.append(sx, sy); draw();
    }
    function draw() {
      const hs = sc.lim.map(l => H(l.a, l.b, l.c, l.op)).concat([H(1, 0, 0, '>='), H(0, 1, 0, '>=')]);
      p.clearAll('region', 'lines', 'pts', 'lbl', 'ui');
      drawRegion(p, hs, { labels: false, vlabels: false });
      let feas = true;
      meters.innerHTML = sc.lim.map((l, i) => {
        const v = l.a * x + l.b * y, ok = l.op === '<=' ? v <= l.c + 1e-9 : v >= l.c - 1e-9; if (!ok) feas = false;
        const pct = Math.min(100, v / (l.op === '<=' ? l.c : l.c * 2) * 100);
        return `<div><div class="row" style="justify-content:space-between"><b>${L(l.n)}</b><span>${dec(v)} ${OPS[l.op]} ${l.c} ${ok ? '✅' : '❌'}</span></div><div class="meter ${ok ? '' : 'over'}"><i style="width:${pct}%;background:${COL[i]}"></i></div></div>`;
      }).join('');
      const val = sc.obj.p * x + sc.obj.q * y;
      if (feas && (best == null || (sc.goal === 'max' ? val > best : val < best))) { best = val; if (Math.abs(val - sc.best) < 1e-6) sfx('win'); }
      p.line(sc.obj.p, sc.obj.q, val, { color: 'var(--c6)', dash: true, w: 2 });
      p.point(x, y, { r: 9, color: feas ? 'var(--c7)' : 'var(--bad)', label: `(${fmt(Math.round(x * 10) / 10)}, ${fmt(Math.round(y * 10) / 10)})`, bold: true });
      if (showOpt) { const o = Geo.optimize(hs, sc.obj.p, sc.obj.q); (sc.goal === 'max' ? o.argmax : o.argmin).forEach(v => p.point(v[0], v[1], { r: 11, color: 'var(--c1)', label: '★ ' + ptT(v), dy: 24 })); }
      const gap = best == null ? '' : Math.abs(best - sc.best) < 1e-6 ? tr('🏆 你找到最佳解了！', '🏆 You found the optimum!') : tr(`距離最佳值還差 ${dec(Math.abs(best - sc.best))}`, `Gap to optimum: ${dec(Math.abs(best - sc.best))}`);
      ro.innerHTML = `${L(sc.obj.n)}　P＝${sc.obj.p}x＋${sc.obj.q}y＝<b class="big">${dec(val)}</b> ${feas ? '' : tr('（不可行！）', '(infeasible!)')}<br>${tr('目前最佳紀錄', 'Best feasible so far')}：<b>${best == null ? '—' : dec(best)}</b>　${gap}` + (showOpt ? `<br>★ ${tr('最佳值', 'Optimum')}：<b>${fmtH(sc.best)}</b>` : '');
    }
    build();
  },

  /* ---------- 塗色挑戰（隨堂練習 / 習題用） ---------- */
  shade(host, hs, names, onDone) {
    const wrap = h('div', { class: 'shadepick' });
    wrap.innerHTML = `<p class="muted">${tr('依序為每個不等式「點選應保留的那一側」：', 'For each inequality, tap the side that should be kept:')}</p>`;
    const ph = h('div', { style: 'max-width:420px' }), ro = h('div', { class: 'readout' });
    wrap.append(ph, ro); host.append(wrap);
    const box = [-6, 6, -6, 6]; const p = mkPlot(ph, box, 420);
    let i = 0; const done = [];
    function draw() {
      p.clearAll('region', 'lines', 'pts', 'lbl');
      done.forEach((c) => p.half(c, { fill: 'var(--hp)' }));
      if (i >= hs.length) p.regionOf(hs, { fill: 'var(--region)' });
      hs.forEach((c, j) => { if (j <= i) p.cons(c, { color: COL[j], w: 3, label: names[j], at: .1 + j * .7 }); });
      ro.innerHTML = i < hs.length ? `${tr('第', 'Step ')}${i + 1}${tr(' 步：', ': ')}<b class="mn">${names[i]}</b> ${tr('— 界線是', '— boundary is')} ${hs[i].op.length === 2 ? tr('實線', 'solid') : tr('虛線', 'dashed')}${tr('，點選要保留的一側', '; tap the side to keep')}` : tr('🎉 完成！紅色部分就是聯立不等式的圖形。', '🎉 Done! The red part is the graph of the system.');
    }
    p.onClick(([x, y]) => {
      if (i >= hs.length) return;
      const c = hs[i]; if (Math.abs(Geo.val(c, x, y)) < .15) return;
      if (Geo.sat(c, x, y)) { sfx('ok'); done.push(c); i++; draw(); if (i >= hs.length) { sfx('win'); onDone && onDone(true); } }
      else { sfx('bad'); ro.innerHTML = `❌ ${tr('代入', 'Substituting')} (${fmt(Math.round(x * 10) / 10)}, ${fmt(Math.round(y * 10) / 10)}) ${tr('不滿足', 'does not satisfy')} <b class="mn">${names[i]}</b>${tr('，請選另一側！', ' — try the other side!')}`; onDone && onDone(false); }
    });
    draw();
  }
};
W.testpoint = host => W.halfplane(host, { h: { a: 1, b: 1, c: 2, op: '<' }, fixed: true, title: tr('試試看：哪些點滿足 x＋y＜2？', 'Try it: which points satisfy x + y < 2?') });
W.sweep15 = host => W.sweep(host, { preset: PRESETS[0], fixed: true, title: tr('動手掃：x＋y＝k 平行移動（圖 15）', 'Slide x + y = k across the region (Fig. 15)') });

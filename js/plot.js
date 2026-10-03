/* 線性規劃 — SVG plotting engine & geometry helpers */
'use strict';
const SVGNS = 'http://www.w3.org/2000/svg';
function sv(tag, attrs, parent) {
  const e = document.createElementNS(SVGNS, tag);
  for (const k in attrs) if (attrs[k] != null) e.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(e);
  return e;
}

/* ---------- number formatting ---------- */
function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; }
function toFrac(x, maxDen = 60) {
  if (!isFinite(x)) return null;
  for (let d = 1; d <= maxDen; d++) {
    const n = Math.round(x * d);
    if (Math.abs(n / d - x) < 1e-7) { const g = gcd(n, d) || 1; return [n / g, d / g]; }
  }
  return null;
}
/* plain text: 40/7, −2 */
function fmt(x) {
  if (Math.abs(x) < 1e-9) x = 0;
  const f = toFrac(x);
  if (!f) return (Math.round(x * 100) / 100).toString().replace('-', '−');
  const [n, d] = f;
  const s = d === 1 ? String(Math.abs(n)) : Math.abs(n) + '/' + d;
  return (n < 0 ? '−' : '') + s;
}
/* HTML: stacked fraction */
function fmtH(x) {
  if (Math.abs(x) < 1e-9) x = 0;
  const f = toFrac(x);
  if (!f) return fmt(x);
  const [n, d] = f;
  if (d === 1) return (n < 0 ? '−' : '') + Math.abs(n);
  return (n < 0 ? '−' : '') + `<span class="fr"><span>${Math.abs(n)}</span><span>${d}</span></span>`;
}
function ptH(p) { return `（${fmtH(p[0])}，${fmtH(p[1])}）`; }
function ptT(p) { return `(${fmt(p[0])}, ${fmt(p[1])})`; }
/* linear expression text: a x + b y (+ c) */
function lin(a, b, c, vars = ['x', 'y']) {
  const parts = [];
  const term = (k, v) => {
    if (Math.abs(k) < 1e-12) return;
    const sgn = k < 0 ? '−' : '+';
    const ak = Math.abs(k);
    const kk = v ? (ak === 1 ? '' : fmt(ak)) : fmt(ak);
    parts.push([sgn, kk + (v || '')]);
  };
  term(a, vars[0]); term(b, vars[1]); if (c != null) term(c, '');
  if (!parts.length) return '0';
  return parts.map((p, i) => (i === 0 ? (p[0] === '−' ? '−' : '') : p[0]) + p[1]).join('');
}
const OPS = { '<=': '≤', '<': '<', '>=': '≥', '>': '>', '=': '=' };
function hpText(h) { return lin(h.a, h.b) + OPS[h.op] + fmt(h.c); }

/* ---------- geometry (half-plane a x + b y OP c) ---------- */
const Geo = {
  val: (h, x, y) => h.a * x + h.b * y - h.c,
  side: (h, x, y) => (h.op[0] === '<' ? -1 : 1) * (h.a * x + h.b * y - h.c),
  sat(h, x, y, eps = 1e-7) {
    const v = h.a * x + h.b * y - h.c;
    switch (h.op) {
      case '<=': return v <= eps; case '>=': return v >= -eps;
      case '<': return v < -eps; case '>': return v > eps; default: return Math.abs(v) <= eps;
    }
  },
  satAll(hs, x, y, eps = 1e-7) { return hs.every(h => Geo.sat(Object.assign({}, h, { op: h.op.replace(/^([<>])$/, '$1=') }), x, y, eps)); },
  clip(poly, h) {
    const out = [], n = poly.length;
    for (let i = 0; i < n; i++) {
      const P = poly[i], Q = poly[(i + 1) % n];
      const sp = Geo.side(h, P[0], P[1]), sq = Geo.side(h, Q[0], Q[1]);
      if (sp >= -1e-10) out.push(P);
      if ((sp > 1e-10 && sq < -1e-10) || (sp < -1e-10 && sq > 1e-10)) {
        const t = sp / (sp - sq);
        out.push([P[0] + t * (Q[0] - P[0]), P[1] + t * (Q[1] - P[1])]);
      }
    }
    return Geo.dedupe(out);
  },
  dedupe(pts) {
    const r = [];
    for (const p of pts) if (!r.some(q => Math.abs(q[0] - p[0]) < 1e-7 && Math.abs(q[1] - p[1]) < 1e-7)) r.push(p);
    return r;
  },
  region(hs, box) {
    let poly = [[box[0], box[2]], [box[1], box[2]], [box[1], box[3]], [box[0], box[3]]];
    for (const h of hs) { poly = Geo.clip(poly, h); if (!poly.length) break; }
    return poly;
  },
  inter(h1, h2) {
    const d = h1.a * h2.b - h2.a * h1.b;
    if (Math.abs(d) < 1e-12) return null;
    return [(h1.c * h2.b - h2.c * h1.b) / d, (h1.a * h2.c - h2.a * h1.c) / d];
  },
  vertices(hs) {
    const v = [];
    for (let i = 0; i < hs.length; i++) for (let j = i + 1; j < hs.length; j++) {
      const p = Geo.inter(hs[i], hs[j]);
      if (p && Geo.satAll(hs, p[0], p[1], 1e-7)) v.push(p);
    }
    const u = Geo.dedupe(v);
    if (u.length > 2) {
      const cx = u.reduce((s, p) => s + p[0], 0) / u.length, cy = u.reduce((s, p) => s + p[1], 0) / u.length;
      u.sort((p, q) => Math.atan2(p[1] - cy, p[0] - cx) - Math.atan2(q[1] - cy, q[0] - cx));
    }
    return u;
  },
  bounded(hs) {
    const big = 1e5, poly = Geo.region(hs, [-big, big, -big, big]);
    if (!poly.length) return true;
    return !poly.some(p => Math.abs(p[0]) > big * 0.99 || Math.abs(p[1]) > big * 0.99);
  },
  empty(hs) { return Geo.region(hs, [-1e5, 1e5, -1e5, 1e5]).length < 3; },
  /* evaluate objective over region: returns {max,min,argmax[],argmin[],bounded} */
  optimize(hs, p, q) {
    const V = Geo.vertices(hs);
    const big = 1e5, poly = Geo.region(hs, [-big, big, -big, big]);
    let unbMax = false, unbMin = false;
    if (poly.length) {
      const vals = poly.map(pt => p * pt[0] + q * pt[1]);
      const vv = V.map(pt => p * pt[0] + q * pt[1]);
      const mx = vv.length ? Math.max(...vv) : -Infinity, mn = vv.length ? Math.min(...vv) : Infinity;
      if (Math.max(...vals) > mx + 1e-3) unbMax = true;
      if (Math.min(...vals) < mn - 1e-3) unbMin = true;
    }
    const vals = V.map(pt => p * pt[0] + q * pt[1]);
    const max = Math.max(...vals), min = Math.min(...vals);
    return {
      V, vals, max: unbMax ? null : max, min: unbMin ? null : min,
      argmax: unbMax ? [] : V.filter((_, i) => Math.abs(vals[i] - max) < 1e-7),
      argmin: unbMin ? [] : V.filter((_, i) => Math.abs(vals[i] - min) < 1e-7)
    };
  }
};

/* ---------- Plot ---------- */
class Plot {
  constructor(host, o = {}) {
    this.o = Object.assign({ xmin: -5, xmax: 5, ymin: -5, ymax: 5, size: 460, step: 1, ticks: true, tickStep: null, grid: true, axes: true, title: '' }, o);
    const { xmin, xmax, ymin, ymax, size } = this.o;
    this.W = size; this.H = o.h ? Math.round(o.h) : Math.round(size * (ymax - ymin) / (xmax - xmin));
    this.fs = Math.max(12, Math.round(size / 30));
    this.svg = sv('svg', { viewBox: `0 0 ${this.W} ${this.H}`, class: 'plot', role: 'img', 'aria-label': this.o.title || 'graph' }, host);
    const defs = sv('defs', {}, this.svg);
    this.uid = 'p' + Math.random().toString(36).slice(2, 8);
    const mk = sv('marker', { id: this.uid + 'ar', viewBox: '0 0 10 10', refX: 8, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' }, defs);
    sv('path', { d: 'M0,0 L10,5 L0,10 z', fill: 'var(--plot-axis)' }, mk);
    this.L = {};
    for (const n of ['grid', 'region', 'axes', 'lines', 'pts', 'lbl', 'ui']) this.L[n] = sv('g', { class: 'L-' + n }, this.svg);
    if (this.o.grid) this.drawGrid();
    if (this.o.axes) this.drawAxes();
  }
  get box() { const o = this.o; return [o.xmin, o.xmax, o.ymin, o.ymax]; }
  X(x) { return (x - this.o.xmin) / (this.o.xmax - this.o.xmin) * this.W; }
  Y(y) { return this.H - (y - this.o.ymin) / (this.o.ymax - this.o.ymin) * this.H; }
  toXY(e) {
    const r = this.svg.getBoundingClientRect();
    const fx = (e.clientX - r.left) / r.width, fy = (e.clientY - r.top) / r.height;
    return [this.o.xmin + fx * (this.o.xmax - this.o.xmin), this.o.ymax - fy * (this.o.ymax - this.o.ymin)];
  }
  clear(layer) { const g = this.L[layer]; while (g.firstChild) g.removeChild(g.firstChild); }
  clearAll(...ls) { for (const l of ls) this.clear(l); }
  drawGrid() {
    const { xmin, xmax, ymin, ymax, step } = this.o, g = this.L.grid;
    const sx = this.o.stepX || step, sy = this.o.stepY || step;
    for (let x = Math.ceil(xmin / sx) * sx; x <= xmax + 1e-9; x += sx) sv('line', { x1: this.X(x), x2: this.X(x), y1: 0, y2: this.H, class: 'gl' }, g);
    for (let y = Math.ceil(ymin / sy) * sy; y <= ymax + 1e-9; y += sy) sv('line', { y1: this.Y(y), y2: this.Y(y), x1: 0, x2: this.W, class: 'gl' }, g);
  }
  drawAxes() {
    const { xmin, xmax, ymin, ymax } = this.o, g = this.L.axes, fs = this.fs;
    const ax = Math.min(Math.max(0, ymin), ymax), ay = Math.min(Math.max(0, xmin), xmax);
    sv('line', { x1: 0, x2: this.W - 2, y1: this.Y(ax), y2: this.Y(ax), class: 'ax', 'marker-end': `url(#${this.uid}ar)` }, g);
    sv('line', { x1: this.X(ay), x2: this.X(ay), y1: this.H, y2: 2, class: 'ax', 'marker-end': `url(#${this.uid}ar)` }, g);
    this.textPx(this.W - 10, this.Y(ax) + fs * 1.15, 'x', { size: fs * 1.05, it: true, anchor: 'end' }, g);
    this.textPx(this.X(ay) + 8, fs * 1.0, 'y', { size: fs * 1.05, it: true }, g);
    if (xmin <= 0 && ymin <= 0) this.textPx(this.X(0) - 5, this.Y(0) + fs * 1.05, 'O', { size: fs, it: true, anchor: 'end' }, g);
    if (this.o.ticks) {
      const ts = this.o.tickX || this.o.tickStep || this.autoTick(xmax - xmin), tsy = this.o.tickY || this.o.tickStep || this.autoTick(ymax - ymin);
      for (let x = Math.ceil(xmin / ts) * ts; x < xmax - 1e-9; x += ts) {
        if (Math.abs(x) < 1e-9) continue;
        sv('line', { x1: this.X(x), x2: this.X(x), y1: this.Y(ax) - 3, y2: this.Y(ax) + 3, class: 'ax' }, g);
        this.textPx(this.X(x), this.Y(ax) + fs * 1.05, fmt(x), { size: fs * .8, anchor: 'middle', cls: 'tk' }, g);
      }
      for (let y = Math.ceil(ymin / tsy) * tsy; y < ymax - 1e-9; y += tsy) {
        if (Math.abs(y) < 1e-9) continue;
        sv('line', { y1: this.Y(y), y2: this.Y(y), x1: this.X(ay) - 3, x2: this.X(ay) + 3, class: 'ax' }, g);
        this.textPx(this.X(ay) - 6, this.Y(y) + fs * .3, fmt(y), { size: fs * .8, anchor: 'end', cls: 'tk' }, g);
      }
    }
  }
  autoTick(span) {
    const c = [1, 2, 5, 10, 20, 25, 50, 100, 200, 500, 1000];
    return c.find(s => span / s <= 12) || 1000;
  }
  textPx(px, py, str, o = {}, g) {
    const t = sv('text', { x: px, y: py, 'font-size': o.size || this.fs, 'text-anchor': o.anchor || 'start', class: (o.cls || '') + (o.halo !== false ? ' lbl' : ''), 'font-style': o.it ? 'italic' : null, 'font-weight': o.bold ? 700 : null }, g || this.L.lbl);
    if (o.color) t.style.fill = o.color;
    t.textContent = str;
    return t;
  }
  text(x, y, str, o = {}) { return this.textPx(this.X(x) + (o.dx || 0), this.Y(y) + (o.dy || 0), str, o, o.layer ? this.L[o.layer] : this.L.lbl); }
  seg(a, b, c) {
    /* segment of a x + b y = c within box */
    const [x0, x1, y0, y1] = this.box, P = [];
    if (Math.abs(b) > 1e-12) { for (const x of [x0, x1]) { const y = (c - a * x) / b; if (y >= y0 - 1e-9 && y <= y1 + 1e-9) P.push([x, y]); } }
    if (Math.abs(a) > 1e-12) { for (const y of [y0, y1]) { const x = (c - b * y) / a; if (x >= x0 - 1e-9 && x <= x1 + 1e-9) P.push([x, y]); } }
    const u = Geo.dedupe(P);
    return u.length >= 2 ? [u[0], u[u.length - 1]] : null;
  }
  line(a, b, c, o = {}) {
    const s = this.seg(a, b, c);
    if (!s) return null;
    const g = o.layer ? this.L[o.layer] : this.L.lines;
    const el = sv('line', { x1: this.X(s[0][0]), y1: this.Y(s[0][1]), x2: this.X(s[1][0]), y2: this.Y(s[1][1]), stroke: o.color || 'var(--c5)', 'stroke-width': o.w || 2.6, 'stroke-dasharray': o.dash ? '8 6' : null, 'stroke-linecap': 'round', class: o.anim ? 'anim-line' : null, opacity: o.op }, g);
    if (o.label) this.lineLabel(a, b, c, o.label, o);
    return el;
  }
  lineLabel(a, b, c, label, o = {}) {
    const s = this.seg(a, b, c);
    if (!s) return;
    const t = o.at != null ? o.at : 0.82;
    let px = this.X(s[0][0] + (s[1][0] - s[0][0]) * t), py = this.Y(s[0][1] + (s[1][1] - s[0][1]) * t);
    px = Math.min(Math.max(px, 6), this.W - 6); py = Math.min(Math.max(py, this.fs), this.H - 6);
    const anchor = px > this.W * .6 ? 'end' : 'start';
    this.textPx(px + (anchor === 'end' ? -6 : 6) + (o.ldx || 0), py - 6 + (o.ldy || 0), label, { size: this.fs * .92, anchor, color: o.color, bold: true });
  }
  polygon(pts, o = {}) {
    if (!pts || pts.length < 3) return null;
    return sv('polygon', { points: pts.map(p => this.X(p[0]) + ',' + this.Y(p[1])).join(' '), fill: o.fill || 'var(--region)', stroke: o.stroke || 'none', 'stroke-width': o.w || 0, opacity: o.op }, o.layer ? this.L[o.layer] : this.L.region);
  }
  half(h, o = {}) { return this.polygon(Geo.region([h], this.box), Object.assign({ fill: 'var(--hp)' }, o)); }
  regionOf(hs, o = {}) { return this.polygon(Geo.region(hs, this.box), o); }
  /* draw a constraint line with proper solid/dashed style */
  cons(h, o = {}) { return this.line(h.a, h.b, h.c, Object.assign({ dash: h.op === '<' || h.op === '>' }, o)); }
  point(x, y, o = {}) {
    const g = o.layer ? this.L[o.layer] : this.L.pts;
    const c = sv('circle', { cx: this.X(x), cy: this.Y(y), r: o.r || 5.5, fill: o.hollow ? 'var(--plot-bg)' : (o.color || 'var(--c1)'), stroke: o.color || 'var(--c1)', 'stroke-width': o.hollow ? 2.2 : 1.5 }, g);
    if (o.label) this.textPx(this.X(x) + (o.dx != null ? o.dx : 8), this.Y(y) + (o.dy != null ? o.dy : -8), o.label, { size: this.fs * .9, anchor: o.anchor || 'start', color: o.lcolor, bold: o.bold });
    return c;
  }
  arrow(x1, y1, x2, y2, o = {}) {
    const id = this.uid + 'a' + Math.random().toString(36).slice(2, 6);
    const mk = sv('marker', { id, viewBox: '0 0 10 10', refX: 8, refY: 5, markerWidth: 6, markerHeight: 6, orient: 'auto' }, this.svg.querySelector('defs'));
    sv('path', { d: 'M0,0 L10,5 L0,10 z', fill: o.color || 'var(--c6)' }, mk);
    return sv('line', { x1: this.X(x1), y1: this.Y(y1), x2: this.X(x2), y2: this.Y(y2), stroke: o.color || 'var(--c6)', 'stroke-width': o.w || 3, 'marker-end': `url(#${id})` }, o.layer ? this.L[o.layer] : this.L.ui);
  }
  onClick(fn) { this.svg.classList.add('clickable'); this.svg.addEventListener('pointerdown', e => { fn(this.toXY(e), e); }); }
}

/* label helpers for book figures */
const COL = ['var(--c1)', 'var(--c5)', 'var(--c7)', 'var(--c2)', 'var(--c6)', 'var(--c4)'];

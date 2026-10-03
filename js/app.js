/* 線性規劃 互動學習網 — 主程式 */
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const store = {
  get(k, d) { try { const v = localStorage.getItem('lp_' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('lp_' + k, JSON.stringify(v)); } catch (e) { } }
};
const DEF = { sound: true, device: 'auto', layout: 'auto', lang: 'zh', font: 'normal', theme: 'system' };
const App = {
  set: Object.assign({}, DEF, store.get('settings', {})),
  get lang() { return this.set.lang; },
  done: store.get('done', {}),
  visited: store.get('visited', {}),
  time: store.get('time', {}),
  profile: store.get('profile', { name: '', cls: '', seat: '' }),
  checks: store.get('checks', {}),
  route: null, enter: Date.now()
};
function L(o) { if (o == null) return ''; if (typeof o === 'string' || typeof o === 'number') return String(o); return o[App.lang] ?? o.zh; }

/* ================= UI 字串 ================= */
const T = {
  zh: { title: '線性規劃', sub: '選修數學乙（下）第 1 章　互動學習網', home: '首頁', guide: '學習指引', l1: '平行直線系', l2: '二元一次不等式', l3: '線性規劃', lab: '互動實驗室', ex: '習題', adv: '進階延伸', practice: '練習', quiz: '測驗', log: '學習歷程', book: '課本 PDF',
    settings: '顯示與操作設定', fs: '全螢幕', sound: '音效', device: '裝置', layout: '版面', lang: '語言', font: '字體', theme: '色系', on: '開啟', off: '關閉', auto: '自動', phone: '手機', tablet: '平板', desktop: '電腦', portrait: '直式', landscape: '橫式', small: '縮小', normal: '標準', large: '放大', system: '跟隨系統', light: '亮色', dark: '暗色', reset: '恢復預設',
    example: '例題', practiceTag: '隨堂練習', key: '重點', showSol: '看詳解', check: '檢查答案', correct: '答對了！', wrong: '再想想看～', hint: '提示', prev: '上一節', next: '下一節', bookPage: '課本頁', progress: '學習進度' },
  en: { title: 'Linear Programming', sub: 'Elective Math B (II) · Chapter 1 · Interactive course', home: 'Home', guide: 'Guide', l1: 'Parallel Lines', l2: 'Inequalities', l3: 'Linear Programming', lab: 'Lab', ex: 'Exercises', adv: 'Extension', practice: 'Practice', quiz: 'Quiz', log: 'Learning Log', book: 'Textbook PDF',
    settings: 'Display & Controls', fs: 'Fullscreen', sound: 'Sound', device: 'Device', layout: 'Layout', lang: 'Language', font: 'Font size', theme: 'Theme', on: 'On', off: 'Off', auto: 'Auto', phone: 'Phone', tablet: 'Tablet', desktop: 'Desktop', portrait: 'Portrait', landscape: 'Landscape', small: 'Small', normal: 'Standard', large: 'Large', system: 'System', light: 'Light', dark: 'Dark', reset: 'Reset',
    example: 'Example', practiceTag: 'Practice', key: 'Key idea', showSol: 'Solution', check: 'Check', correct: 'Correct!', wrong: 'Not quite — try again', hint: 'Hint', prev: 'Previous', next: 'Next', bookPage: 'Book p.', progress: 'Progress' }
};
const t = k => T[App.lang][k] ?? k;
const ROUTES = [
  { id: 'home', ico: '🏠' }, { id: 'guide', ico: '🧭' }, { id: 'l1', ico: '📏' }, { id: 'l2', ico: '🌗' }, { id: 'l3', ico: '🎯' },
  { id: 'lab', ico: '🧪' }, { id: 'ex', ico: '📝' }, { id: 'adv', ico: '🚀' }, { id: 'practice', ico: '🔁' }, { id: 'quiz', ico: '🏆' }, { id: 'log', ico: '📒' }, { id: 'book', ico: '📘' }
];

/* ================= 音效 ================= */
const Snd = {
  ctx: null,
  tone(f, d = .12, type = 'sine', vol = .14, delay = 0, f2) {
    if (!App.set.sound) return;
    try {
      this.ctx = this.ctx || new (window.AudioContext || window.webkitAudioContext)();
      const c = this.ctx, t0 = c.currentTime + delay, o = c.createOscillator(), g = c.createGain();
      o.type = type; o.frequency.setValueAtTime(f, t0); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t0 + d);
      g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol, t0 + .01); g.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
      o.connect(g).connect(c.destination); o.start(t0); o.stop(t0 + d + .02);
    } catch (e) { }
  },
  click() { this.tone(700, .06, 'triangle', .08); },
  tick() { this.tone(1300, .025, 'square', .025); },
  page() { this.tone(520, .07, 'sine', .07); this.tone(780, .08, 'sine', .06, .06); },
  ok() { this.tone(660, .1, 'triangle', .14); this.tone(990, .18, 'triangle', .14, .09); },
  bad() { this.tone(260, .16, 'sawtooth', .06, 0, 180); this.tone(170, .2, 'sawtooth', .05, .12); },
  win() { [523, 659, 784, 1047, 1319].forEach((f, i) => this.tone(f, .2, 'triangle', .12, i * .09)); },
  whoosh() { this.tone(300, .25, 'sine', .06, 0, 900); }
};

/* ================= 學習歷程 ================= */
const Log = {
  data: store.get('log', []),
  add(type, detail, result = '') {
    this.data.push({ t: new Date().toISOString(), type, route: App.route, detail: String(detail).replace(/<[^>]+>/g, ''), result });
    if (this.data.length > 3000) this.data.shift();
    store.set('log', this.data);
  },
  typeName(k) { return L({ visit: { zh: '瀏覽', en: 'Visit' }, sol: { zh: '查看詳解', en: 'Solution' }, check: { zh: '作答', en: 'Answer' }, practice: { zh: '練習', en: 'Practice' }, quiz: { zh: '測驗', en: 'Quiz' }, lab: { zh: '實驗室', en: 'Lab' }, self: { zh: '自我檢核', en: 'Self-check' }, note: { zh: '學習反思', en: 'Reflection' } }[k] || k); }
};
function stamp(iso) { const d = new Date(iso); const p = n => String(n).padStart(2, '0'); return `${d.getFullYear()}/${p(d.getMonth() + 1)}/${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`; }

/* ================= 共用 ================= */
function toast(msg) { const e = $('#toast'); e.textContent = msg; e.classList.add('on'); clearTimeout(e._t); e._t = setTimeout(() => e.classList.remove('on'), 2200); }
function confetti() {
  const cv = $('#confetti'), cx = cv.getContext('2d'); cv.width = innerWidth; cv.height = innerHeight;
  const cols = ['#ff5d73', '#ff9f1c', '#ffd23f', '#2ec4b6', '#3a86ff', '#8338ec', '#06d6a0'];
  const P = Array.from({ length: 140 }, () => ({ x: Math.random() * cv.width, y: -20 - Math.random() * cv.height * .5, vx: (Math.random() - .5) * 4, vy: 2 + Math.random() * 4, r: 4 + Math.random() * 6, c: cols[Math.random() * 7 | 0], a: Math.random() * 6 }));
  let n = 0; (function f() { cx.clearRect(0, 0, cv.width, cv.height); P.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += .05; p.a += .1; cx.save(); cx.translate(p.x, p.y); cx.rotate(p.a); cx.fillStyle = p.c; cx.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2); cx.restore(); }); if (++n < 200) requestAnimationFrame(f); else cx.clearRect(0, 0, cv.width, cv.height); })();
}
function parseNum(s) {
  s = String(s).trim().replace(/[−－–]/g, '-').replace(/[＋]/g, '+').replace(/[／]/g, '/').replace(/[，,\s元]/g, '').replace(/[０-９]/g, d => String.fromCharCode(d.charCodeAt(0) - 65248));
  if (!s) return NaN;
  if (/^[+-]?\d+(\.\d+)?\/[+-]?\d+(\.\d+)?$/.test(s)) { const [a, b] = s.split('/'); return +a / +b; }
  return /^[+-]?(\d+\.?\d*|\.\d+)$/.test(s) ? +s : NaN;
}
function numOk(input, ans) { const v = parseNum(input); if (isNaN(v)) return false; if (Math.abs(v - ans) < 1e-6) return true; return /\./.test(input) && Math.abs(v - ans) < 0.01; }
function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0;[a[i], a[j]] = [a[j], a[i]]; } return a; }
function rnd(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
function rndNZ(a, b) { let v; do v = rnd(a, b); while (v === 0); return v; }
function i18nFill(root) { $$('[data-zh]', root).forEach(e => { e.innerHTML = e.dataset[App.lang] || e.dataset.zh; }); }
function markDone(id) { if (!App.done[id]) { App.done[id] = true; store.set('done', App.done); updateProg(); } }
const TOTAL_CHECKS = 6 + 10;
function progress() {
  const vis = ['guide', 'l1', 'l2', 'l3', 'lab', 'ex', 'adv', 'practice', 'quiz', 'book'].filter(k => App.visited[k]).length;
  const dn = Object.keys(App.done).filter(k => /^(p\d|ex\d+)$/.test(k)).length;
  const q = store.get('quizBest', 0) >= 80 ? 1 : 0;
  return Math.round((vis / 10 * 40) + (dn / TOTAL_CHECKS * 45) + q * 15);
}
function updateProg() { const e = $('#progmini'); if (e) e.textContent = `${t('progress')} ${progress()}%`; }

/* ================= 內容區塊渲染 ================= */
function figsHTML(list) { return list && list.length ? `<div class="figs">${list.map(f => `<figure class="fig" data-fig="${f.id}"><figcaption>${L(f.cap)}</figcaption></figure>`).join('')}</div>` : ''; }
function mountFigs(root) {
  $$('figure.fig[data-fig]', root).forEach(f => {
    if (f._m) return; f._m = 1;
    const host = document.createElement('div'); f.insertBefore(host, f.firstChild);
    try { FIG[f.dataset.fig](host); } catch (e) { console.error(f.dataset.fig, e); }
  });
}
function checkHTML(ck, id) {
  if (!ck) return '';
  if (ck.t === 'num') return `<div class="answer" data-ck="${id}">${ck.pre ? `<span>${L(ck.pre)}</span>` : ''}${ck.f.map((f, i) => `<label>${L(f.lab)} <input type="text" inputmode="decimal" data-i="${i}" placeholder="${App.lang === 'en' ? 'answer' : '答案'}"></label>`).join('')}<button class="btn sm green" data-act="num">✔ ${t('check')}</button><span class="fb"></span></div>`;
  if (ck.t === 'mc') return `<div data-ck="${id}"><div class="opts">${ck.o.map((o, i) => `<button class="opt" data-act="mc" data-i="${i}">${String.fromCharCode(65 + i)}. ${L(o)}</button>`).join('')}</div><span class="fb"></span></div>`;
  if (ck.t === 'mc2') return `<div data-ck="${id}">${ck.parts.map((pt, j) => `<div style="margin-top:8px"><b>${L(pt.q)}</b><div class="opts" data-part="${j}">${pt.o.map((o, i) => `<button class="opt" data-act="mc2" data-p="${j}" data-i="${i}">${L(o)}</button>`).join('')}</div></div>`).join('')}<span class="fb"></span></div>`;
  if (ck.t === 'shade') return `<div data-ck="${id}" class="shadehost"></div>`;
  return '';
}
function bindChecks(root, map) {
  $$('[data-ck]', root).forEach(box => {
    const id = box.dataset.ck, ck = map[id]; if (!ck) return;
    const fb = box.querySelector('.fb');
    const say = (ok, extra = '') => { if (!fb) return; fb.className = 'fb ' + (ok ? 'ok' : 'bad'); fb.textContent = (ok ? '🎉 ' + t('correct') : '🤔 ' + t('wrong')) + extra; void fb.offsetWidth; };
    if (ck.t === 'num') {
      const go = () => {
        const ins = $$('input', box); let all = true;
        ins.forEach((inp, i) => { const ok = numOk(inp.value, ck.f[i].a); inp.style.borderColor = ok ? 'var(--ok)' : 'var(--bad)'; if (!ok) all = false; });
        say(all); Snd[all ? 'ok' : 'bad'](); if (all) { markDone(id); confettiSmall(box); }
        Log.add('check', `${id}: ${ins.map(i => i.value).join(' / ')}`, all ? '✔' : '✘');
      };
      box.querySelector('[data-act=num]').addEventListener('click', go);
      $$('input', box).forEach(i => i.addEventListener('keydown', e => { if (e.key === 'Enter') go(); }));
    } else if (ck.t === 'mc') {
      $$('[data-act=mc]', box).forEach(b => b.addEventListener('click', () => {
        const i = +b.dataset.i, ok = i === ck.a;
        b.classList.add(ok ? 'ok' : 'bad'); if (ok) { $$('.opt', box).forEach(x => x.disabled = true); markDone(id); confettiSmall(box); }
        say(ok); Snd[ok ? 'ok' : 'bad'](); Log.add('check', `${id}: ${String.fromCharCode(65 + i)}`, ok ? '✔' : '✘');
      }));
    } else if (ck.t === 'mc2') {
      const st = ck.parts.map(() => false);
      $$('[data-act=mc2]', box).forEach(b => b.addEventListener('click', () => {
        const j = +b.dataset.p, i = +b.dataset.i, ok = i === ck.parts[j].a;
        b.classList.add(ok ? 'ok' : 'bad'); Snd[ok ? 'ok' : 'bad']();
        if (ok) { st[j] = true; $$(`[data-p="${j}"]`, box).forEach(x => x.disabled = true); }
        if (st.every(Boolean)) { say(true); markDone(id); confettiSmall(box); } else if (!ok) say(false);
        Log.add('check', `${id}(${j + 1}): ${L(ck.parts[j].o[i])}`, ok ? '✔' : '✘');
      }));
    } else if (ck.t === 'shade') {
      W.shade(box, ck.hs, ck.names, ok => { if (ok) { markDone(id); Log.add('check', `${id}: ${App.lang === 'en' ? 'shading' : '塗色'}`, '✔'); } });
    }
  });
}
function confettiSmall(el) { el.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.02)' }, { transform: 'scale(1)' }], { duration: 400 }); }
function bindSol(root) {
  $$('details.solbox', root).forEach(d => d.addEventListener('toggle', () => { if (d.open) { mountFigs(d); Snd.page(); Log.add('sol', d.dataset.name || ''); } }));
}
function blockHTML(b, ckMap) {
  switch (b.k) {
    case 'h': return `<h3 class="blk">🔹 ${L(b)}</h3>`;
    case 'p': return `<p>${L(b)}</p>`;
    case 'key': return `<div class="key"><span class="tag key">💡 ${t('key')}</span><div>${L(b)}</div></div>`;
    case 'note': return `<div class="note"><span class="tag note">${L(b.title)}</span><div>${L(b)}</div></div>`;
    case 'figs': return figsHTML(b.items);
    case 'table': return `<div class="tablewrap">${b.html}</div>`;
    case 'widget': return `<div class="blk" data-widget="${b.w}"></div>`;
    case 'ex': return `<div class="ex" id="ex-${b.no}"><span class="tag ex">📘 ${t('example')} ${b.no}</span><div>${L(b.q)}</div>${figsHTML(b.figs)}
      <details class="solbox" data-name="${t('example')} ${b.no}"><summary>🔍 ${t('showSol')}</summary><div class="sol">${L(b.sol)}${figsHTML(b.solFigs)}</div></details></div>`;
    case 'pr': ckMap[b.id] = b.check; return `<div class="pr" id="${b.id}"><span class="tag pr">✏️ ${t('practiceTag')}${App.done[b.id] ? ' ✅' : ''}</span><div>${L(b.q)}</div>${figsHTML(b.figs)}${checkHTML(b.check, b.id)}
      <details class="solbox" data-name="${t('practiceTag')} ${b.id}" style="margin-top:10px"><summary>🔍 ${t('showSol')}</summary><div class="sol">${L(b.sol)}${figsHTML(b.solFigs)}</div></details></div>`;
  }
  return '';
}
function mountWidgets(root) { $$('[data-widget]', root).forEach(w => { if (w._m) return; w._m = 1; try { W[w.dataset.widget](w); } catch (e) { console.error(e); } }); }
function afterRender(root, ckMap) { i18nFill(root); mountFigs(root.querySelector('.lesson-body') ? root : root); bindChecks(root, ckMap || {}); bindSol(root); mountWidgets(root); }

/* ================= 頁面 ================= */
const heroArt = `<svg class="hero-art" viewBox="0 0 300 260" aria-hidden="true">
  <defs><clipPath id="hc"><rect width="300" height="260"/></clipPath></defs>
  <g clip-path="url(#hc)" opacity=".95">
  <polygon points="40,220 220,220 260,120 150,40 40,110" fill="rgba(255,255,255,.28)" stroke="#fff" stroke-width="4"/>
  <g class="sweep"><line x1="0" y1="250" x2="300" y2="20" stroke="#ffd23f" stroke-width="6" stroke-dasharray="14 10" stroke-linecap="round"/></g>
  <circle cx="260" cy="120" r="12" fill="#ffd23f" class="float"/><circle cx="40" cy="220" r="8" fill="#fff"/><circle cx="220" cy="220" r="8" fill="#fff"/><circle cx="150" cy="40" r="8" fill="#fff"/><circle cx="40" cy="110" r="8" fill="#fff"/>
  <text x="200" y="110" fill="#fff" font-size="26" font-weight="900">MAX</text></g></svg>`;

const Pages = {
  home() {
    const tiles = [
      ['guide', 'bgv', { zh: '學習目標、路徑、常見錯誤與自我檢核', en: 'Goals, roadmap, pitfalls and self-check' }],
      ['l1', 'bgy', LESSONS[0].sub], ['l2', 'bgg', LESSONS[1].sub], ['l3', 'bgr', LESSONS[2].sub],
      ['lab', 'bgb', { zh: '7 個可操作的圖形實驗', en: '7 hands-on graph experiments' }],
      ['ex', 'bgo', { zh: '基本題・進階題・素養題', en: 'Basic · Advanced · Literacy' }],
      ['adv', 'bgk', { zh: '無界區域、多重解、整數解、單形法', en: 'Unbounded, multiple optima, integers, simplex' }],
      ['practice', 'bgg', { zh: '隨機出題，無限反覆演練', en: 'Endless random problems' }],
      ['quiz', 'bgy', { zh: '10 題計時測驗，驗收理解', en: '10-question timed quiz' }],
      ['log', 'bgb', { zh: '紀錄過程，一鍵下載', en: 'Record & download your learning' }],
      ['book', 'bgv', { zh: '原始教材 PDF 下載與逐頁瀏覽', en: 'Download and browse the original PDF' }]
    ];
    const pg = progress();
    return `<section class="hero"><h2>📈 ${t('title')}</h2>
      <p>${L(CHAPTER_INTRO)}</p>
      <p>● ${t('l1')}　● ${t('l2')}　● ${t('l3')}</p>
      <div class="row"><a class="btn" href="#guide">🧭 ${App.lang === 'en' ? 'Start here' : '從學習指引開始'}</a><a class="btn alt" href="#lab">🧪 ${App.lang === 'en' ? 'Open the Lab' : '直接玩實驗室'}</a></div>${heroArt}</section>
      <div class="card"><div class="row" style="justify-content:space-between"><b>📊 ${t('progress')}</b><b>${pg}%</b></div><div class="progress" style="margin-top:8px"><i style="width:${pg}%"></i></div>
      <p class="muted" style="margin:.5em 0 0">${App.lang === 'en' ? 'Progress = sections visited (40%) + practice/exercise items solved (45%) + quiz ≥ 80 (15%).' : '進度＝瀏覽單元（40%）＋完成隨堂練習與習題（45%）＋測驗達 80 分（15%）。'}</p></div>
      <div class="grid">${tiles.map(([id, bg, d]) => { const r = ROUTES.find(x => x.id === id); return `<a class="tile" href="#${id}"><div class="em ${bg}">${r.ico}</div>${App.visited[id] ? '<span class="check">✅</span>' : ''}<h3>${t(id)}</h3><p>${L(d)}</p></a>`; }).join('')}</div>`;
  },
  guide() {
    const G = GUIDE, en = App.lang === 'en';
    return `<h2 class="sec"><span class="ico">🧭</span>${t('guide')}</h2>
    <div class="g2"><div class="card"><h3>🎯 ${en ? 'Learning goals' : '學習目標'}</h3><ol>${G.goals.map(g => `<li>${L(g)}</li>`).join('')}</ol></div>
    <div class="card"><h3>🧰 ${en ? 'Prerequisites' : '先備知識'}</h3><ul>${G.prereq.map(g => `<li>${L(g)}</li>`).join('')}</ul>
      <h3>🗺️ ${en ? 'Concept map' : '概念地圖'}</h3>${conceptMap()}</div></div>
    <div class="card"><h3>🚶 ${en ? 'Suggested learning path' : '建議學習路徑'}（${en ? 'about' : '約'} ${G.steps.reduce((s, x) => s + x.t, 0)} ${en ? 'min' : '分鐘'}）</h3><ol class="steps">${G.steps.map(s => `<li><h4>${L(s.h)} <span class="pill">⏱ ${s.t} ${en ? 'min' : '分'}</span></h4><div>${L(s.d)} <a href="#${s.link}">→ ${t(s.link)}</a></div></li>`).join('')}</ol></div>
    <div class="g2"><div class="card"><h3>💡 ${en ? 'Study tips' : '學習策略'}</h3><ul>${G.tips.map(g => `<li>${L(g)}</li>`).join('')}</ul></div>
    <div class="card"><h3>⚠️ ${en ? 'Common mistakes' : '常見錯誤'}</h3><ul>${G.errors.map(g => `<li>${L(g)}</li>`).join('')}</ul></div></div>
    <div class="card"><h3>✅ ${en ? 'Self-check (saved to your log)' : '自我檢核（會記錄到學習歷程）'}</h3><div class="checklist">${G.checks.map((c, i) => `<label><input type="checkbox" data-sc="${i}" ${App.checks[i] ? 'checked' : ''}><span>${L(c)}</span></label>`).join('')}</div></div>`;
  },
  lesson(id) {
    const ls = LESSONS.find(x => x.id === id), i = LESSONS.indexOf(ls), ck = {};
    const exs = ls.blocks.filter(b => b.k === 'ex' || b.k === 'pr');
    const html = `<h2 class="sec"><span class="ico">${ls.icon}</span>${L(ls.title)}</h2>
      <p class="lead">${L(ls.sub)}　<a class="bookref" href="#book" data-page="${ls.pages[0]}">📖 ${t('bookPage')} ${ls.pages[0]}–${ls.pages[1]}</a></p>
      <div class="toc">${exs.map(b => `<a href="javascript:void 0" data-jump="${b.k === 'ex' ? 'ex-' + b.no : b.id}">${b.k === 'ex' ? '📘 ' + t('example') + ' ' + b.no : '✏️ ' + t('practiceTag') + (App.done[b.id] ? ' ✅' : '')}</a>`).join('')}</div>
      <article class="card lesson">${ls.blocks.map(b => blockHTML(b, ck)).join('')}</article>
      <div class="lesson-nav">${i > 0 ? `<a class="btn alt" href="#${LESSONS[i - 1].id}">← ${L(LESSONS[i - 1].title)}</a>` : `<a class="btn alt" href="#guide">← ${t('guide')}</a>`}
      ${i < 2 ? `<a class="btn" href="#${LESSONS[i + 1].id}">${L(LESSONS[i + 1].title)} →</a>` : `<a class="btn" href="#ex">${t('ex')} →</a>`}</div>`;
    return { html, ck };
  },
  lab() {
    return `<h2 class="sec"><span class="ico">🧪</span>${t('lab')}</h2><p class="lead">${App.lang === 'en' ? 'Seven interactive tools to see the mathematics behind linear programming. Drag sliders, tap the graphs, and watch what changes.' : '七個可以動手操作的圖形元件，幫你「看見」線性規劃背後的數學原理。拖拉滑桿、點擊圖形，觀察什麼改變了、什麼沒變。'}</p>
      <div class="labtabs">${LABS.map((l, i) => `<button data-lab="${i}" class="${i === (App.labTab || 0) ? 'on' : ''}">${l.ico} ${L(l.n)}</button>`).join('')}</div>
      <div id="labhost"></div><div class="card note"><span class="tag note">🔎 ${App.lang === 'en' ? 'Observe' : '觀察重點'}</span><div id="labnote"></div></div>`;
  },
  ex() {
    const ck = {}, f = App.exFilter || 'all', en = App.lang === 'en';
    const LV = { basic: { zh: '一、基本題', en: 'I. Basic' }, adv: { zh: '二、進階題', en: 'II. Advanced' }, lit: { zh: '三、素養題', en: 'III. Literacy' } };
    const body = ['basic', 'adv', 'lit'].filter(lv => f === 'all' || f === lv).map(lv => `<h3 class="blk">${L(LV[lv])}</h3>` + EXERCISES.filter(e => e.lv === lv).map(e => {
      const id = 'ex' + e.n; ck[id] = e.check;
      return `<div class="pr" id="${id}"><span class="tag pr">📝 ${e.n}.${App.done[id] ? ' ✅' : ''}</span><div>${L(e.q)}</div>${figsHTML(e.figs)}${checkHTML(e.check, id)}
        ${e.widget ? `<div class="blk" data-widget="${e.widget}"></div>` : ''}
        <div class="row" style="margin-top:10px"><details class="solbox" data-name="${t('hint')} ${e.n}"><summary>💡 ${t('hint')}</summary><div class="sol">${L(e.hint)}</div></details>
        <details class="solbox" data-name="${t('ex')} ${e.n}"><summary>🔍 ${t('showSol')}</summary><div class="sol">${L(e.sol)}${figsHTML(e.solFigs)}</div></details></div></div>`;
    }).join('')).join('');
    const html = `<h2 class="sec"><span class="ico">📝</span>${en ? 'Exercises 1' : '習題 1'}</h2><p class="lead">${en ? 'Try each problem yourself, check your answer, then open the hint or full solution.' : '每題先自己算 → 輸入答案檢查 → 需要時再看提示或詳解。'} <a class="bookref" href="#book" data-page="21">📖 ${t('bookPage')} 21–23</a></p>
      <div class="labtabs">${[['all', { zh: '全部', en: 'All' }], ['basic', { zh: '基本題', en: 'Basic' }], ['adv', { zh: '進階題', en: 'Advanced' }], ['lit', { zh: '素養題', en: 'Literacy' }]].map(([k, n]) => `<button data-exf="${k}" class="${f === k ? 'on' : ''}">${L(n)}</button>`).join('')}</div>
      <article class="card lesson">${body}</article>`;
    return { html, ck };
  },
  adv() { return advHTML(); },
  practice() { return `<h2 class="sec"><span class="ico">🔁</span>${t('practice')}</h2><div id="prac"></div>`; },
  quiz() { return `<h2 class="sec"><span class="ico">🏆</span>${t('quiz')}</h2><div id="quizhost"></div>`; },
  log() { return logHTML(); },
  book() {
    const en = App.lang === 'en', map = [[6, { zh: '章名頁', en: 'Cover' }], [7, { zh: '章首：線性規劃', en: 'Chapter opener' }], [8, { zh: '1 平行直線系', en: '1 Parallel lines' }], [12, { zh: '2 二元一次不等式', en: '2 Inequalities' }], [14, { zh: '3 線性規劃', en: '3 Linear programming' }], [21, { zh: '習題 1', en: 'Exercises 1' }]];
    return `<h2 class="sec"><span class="ico">📘</span>${t('book')}</h2>
      <div class="card"><div class="row" style="justify-content:space-between"><div><b>選修數學乙(下)課本_線性規劃.pdf</b><div class="muted">${en ? '18 pages · textbook pp. 6–23 · about 8 MB' : '共 18 頁・課本第 6～23 頁・約 8 MB'}</div></div>
      <div class="row"><a class="btn" href="assets/線性規劃課本.pdf" download="選修數學乙(下)課本_線性規劃.pdf" id="dlpdf">⬇️ ${en ? 'Download PDF' : '下載原始教材 PDF'}</a><a class="btn alt" href="assets/線性規劃課本.pdf" target="_blank" rel="noopener">🔗 ${en ? 'Open in new tab' : '新分頁開啟'}</a></div></div>
      <div class="toc" style="margin-top:12px">${map.map(([p, n]) => `<a href="javascript:void 0" data-goto="${p}">p.${p} ${L(n)}</a>`).join('')}</div></div>
      <div class="book"><div class="thumbs">${Array.from({ length: 18 }, (_, i) => `<button data-pg="${i + 6}"><img loading="lazy" src="assets/pages/p${String(i + 1).padStart(2, '0')}.webp" alt="p${i + 6}"><span>${i + 6}</span></button>`).join('')}</div>
      <div><div class="row" style="justify-content:center;margin-bottom:10px"><button class="btn sm alt" id="pgprev">◀</button><b id="pglbl"></b><button class="btn sm alt" id="pgnext">▶</button></div><div class="pageview"><img id="pgimg" alt="page"></div></div></div>`;
  }
};

function conceptMap() {
  const en = App.lang === 'en';
  const n = [[en ? 'Parallel family' : '平行直線系', 70, 40, '#ffd23f'], [en ? 'Half-planes' : '二元一次不等式', 230, 40, '#2ec4b6'], [en ? 'Feasible region' : '可行解區域', 150, 120, '#ff5d73'], [en ? 'Objective P=ax+by' : '目標函數', 60, 200, '#3a86ff'], [en ? 'Vertices' : '頂點', 240, 200, '#8338ec'], [en ? 'Optimal solution' : '最佳解（極值）', 150, 275, '#ff9f1c']];
  const e = [[0, 3], [1, 2], [2, 4], [3, 5], [4, 5], [2, 3]];
  return `<svg viewBox="0 0 300 310" style="width:100%;max-width:360px;display:block;margin:auto">${e.map(([a, b]) => `<line x1="${n[a][1]}" y1="${n[a][2]}" x2="${n[b][1]}" y2="${n[b][2]}" stroke="var(--ink2)" stroke-width="2" stroke-dasharray="5 4"/>`).join('')}
  ${n.map(([s, x, y, c]) => `<g><rect x="${x - 62}" y="${y - 18}" width="124" height="36" rx="18" fill="${c}" opacity=".9"/><text x="${x}" y="${y + 5}" text-anchor="middle" font-size="${s.length > 10 ? 11 : 14}" font-weight="700" fill="#1d1a2e">${s}</text></g>`).join('')}
  <text x="150" y="80" text-anchor="middle" font-size="11" fill="var(--ink2)">${en ? 'system of inequalities' : '聯立'}</text><text x="88" y="245" font-size="11" fill="var(--ink2)">${en ? 'parallel-line method' : '平行線法'}</text><text x="196" y="245" font-size="11" fill="var(--ink2)">${en ? 'vertex method' : '頂點法'}</text></svg>`;
}

/* ================= 實驗室 ================= */
const LABS = [
  { w: 'family', ico: '📏', n: { zh: '平行直線系', en: 'Parallel family' }, note: { zh: '固定 a、b 只改 c：斜率不變、直線平移；c 的變化直接影響 x、y 截距。改變 a 或 b 時斜率才會改變。', en: 'Fix a, b and change c: the slope stays, the line translates, and the intercepts change with c. Only changing a or b changes the slope.' } },
  { w: 'halfplane', ico: '🌗', n: { zh: '半平面探索器', en: 'Half-plane explorer' }, note: { zh: '同一側的點代入 ax＋by 結果同號；含等號畫實線、不含等號畫虛線。試著讓直線通過原點，再用 (1, 0) 檢驗。', en: 'Points on the same side give ax + by values on the same side of c. ≤/≥ → solid, </> → dashed. Make the line pass through the origin, then test (1, 0).' } },
  { w: 'region', ico: '🧱', n: { zh: '可行解區域建構器', en: 'Region builder' }, note: { zh: '每多加一個條件，區域就被「再切一刀」。注意頂點是「至少兩條界線的交點且在區域內」。試著做出無界區域或空集合。', en: 'Each constraint cuts the region again. A vertex is an intersection of boundaries that is feasible. Try making an unbounded or empty region.' } },
  { w: 'sweep', ico: '🎯', n: { zh: '平行線法', en: 'Parallel-line method' }, note: { zh: '目標函數 P＝ax＋by 的等值線是一族平行線。沿紫色箭頭 (a, b) 方向推，最後碰到的點就是最大值；反方向最後碰到的是最小值。', en: 'Level lines of P = ax + by form a parallel family. Push along the purple arrow (a, b): the last point touched gives the max; the opposite direction gives the min.' } },
  { w: 'vertex', ico: '🧭', n: { zh: '頂點法轉盤', en: 'Vertex dial' }, note: { zh: '轉動目標函數方向，最佳解總是在頂點跳動；當方向恰好垂直某一邊時會出現多重最佳解（對應習題 9）。', en: 'Rotate the objective: the optimum jumps from vertex to vertex; when the direction is perpendicular to an edge, the whole edge is optimal (cf. Q9).' } },
  { w: 'lattice', ico: '🔢', n: { zh: '整數格點', en: 'Lattice points' }, note: { zh: '若變數必須是整數（人數、台數），可行解只剩區域內的格點（習題 5）。', en: 'If variables must be integers (people, machines), the feasible solutions are only the lattice points in the region (Q5).' } },
  { w: 'scenario', ico: '🏭', n: { zh: '情境模擬器', en: 'Scenario simulator' }, note: { zh: '親手調整產量，觀察資源用量條；只有所有條件都 ✅ 才是可行解。猜猜看最佳解在哪個角落？', en: 'Adjust the quantities and watch the resource bars; only when every bar is ✅ is the plan feasible. Which corner is optimal?' } }
];
function renderLab() {
  const i = App.labTab || 0, host = $('#labhost'); host.innerHTML = '';
  W[LABS[i].w](host); $('#labnote').innerHTML = L(LABS[i].note);
  Log.add('lab', L(LABS[i].n));
}

/* ================= 進階延伸 ================= */
function advHTML() {
  const en = App.lang === 'en';
  const C = (ico, title, body, extra = '') => `<div class="card"><h3>${ico} ${title}</h3>${body}${extra}</div>`;
  return `<h2 class="sec"><span class="ico">🚀</span>${t('adv')}</h2><p class="lead">${en ? 'Go beyond the textbook: special cases, integer solutions, how computers solve LP, history and real-world uses.' : '超越課本：特殊情況、整數解、電腦如何解線性規劃、歷史人物與生活應用。'}</p>
  ${C('♾️', en ? '1. Unbounded feasible regions' : '1. 可行解區域無界時', `<p>${en ? 'In Example 6 the region extends forever to the upper right. Sliding 60000x + 40000y = k toward the lower left, the last point touched is (4, 2), so the <b>minimum exists</b>. But sliding toward the upper right the line never leaves the region — <b>there is no maximum</b>. With an unbounded region always check which extreme exists!' : '例題 6 的可行解區域往右上方無限延伸。把 60000x＋40000y＝k 往左下方推，最後碰到 (4, 2)，所以<b>最小值存在</b>；但往右上方推時直線永遠不會離開區域，所以<b>最大值不存在</b>。遇到無界區域，一定要先判斷哪一種極值存在！'}</p>`, `<div data-advw="unb"></div>`)}
  ${C('🟰', en ? '2. Multiple optimal solutions' : '2. 多重最佳解', `<p>${en ? 'If the level lines of the objective are parallel to an edge of the region, every point on that edge is optimal (Exercise 9: x − ½y is maximal on all of AB). Use the dial in the Lab to make it happen.' : '若目標函數的等值線恰好與可行解區域的某一邊平行，該邊上的每一點都是最佳解（習題 9：x－½y 在整條 AB 上都取得最大值）。到實驗室的「頂點法轉盤」親自轉出來！'}</p><p><a class="btn sm" href="#lab" data-labgo="4">🧭 ${en ? 'Open the vertex dial' : '開啟頂點法轉盤'}</a></p>`)}
  ${C('🔢', en ? '3. Integer linear programming' : '3. 整數規劃：答案必須是整數時', `<p>${en ? 'If in Example 5 the raw materials had to be whole tonnes, the optimum (40/7, 90/7) would not be allowed. Among the lattice points in the region the best is (6, 12) with 25·6 + 12·12 = <b>294 kg</b>, slightly less than 2080/7 ≈ 297.14. Note: the integer optimum is <i>not</i> always the rounded LP optimum!' : '若例題 5 的原料必須以「整公噸」購買，最佳解 (40/7, 90/7) 就不被允許。在區域內所有格點中，最佳的是 (6, 12)，精油 25×6＋12×12＝<b>294 公斤</b>，比 2080/7≈297.14 少一點。注意：整數最佳解不一定是把小數最佳解四捨五入！'}</p>`, `<div data-advw="int"></div>`)}
  ${C('🚫', en ? '4. No feasible solution' : '4. 無可行解（空集合）', `<p>${en ? 'Constraints can contradict each other, e.g. x + y ≤ 1 and x + y ≥ 3. Then the feasible region is empty and the problem has no solution. In real life this means the requirements must be relaxed.' : '條件可能互相矛盾，例如 x＋y≤1 與 x＋y≥3 同時成立是不可能的，可行解區域為空集合，問題無解。在真實情境中，這代表必須放寬需求（例如增加預算）。'}</p>`)}
  ${C('🖥️', en ? '5. More variables & the simplex method' : '5. 更多變數與單形法', `<p>${en ? 'Real problems may have thousands of variables — no picture possible. In 1947 George Dantzig invented the <b>simplex method</b>: it walks from vertex to neighbouring vertex of a high-dimensional polytope, always improving the objective — exactly the "vertex method" idea! In 1984 Karmarkar\'s <b>interior-point method</b> moves through the inside instead. With 3 variables the feasible region is a polyhedron and level sets are parallel planes.' : '真實問題可能有成千上萬個變數，無法畫圖。1947 年丹齊格（George Dantzig）提出<b>單形法</b>：在高維多面體上從一個頂點走到相鄰、目標值更好的頂點，直到無法再改進——這正是「頂點法」的精神！1984 年卡馬卡（Karmarkar）提出從內部前進的<b>內點法</b>。三個變數時，可行解區域是立體的多面體，目標函數的等值面則是一族平行平面。'}</p>`)}
  ${C('⚖️', en ? '6. Duality (a peek)' : '6. 對偶問題（一窺）', `<p>${en ? 'Every LP has a "twin" called its dual. If a factory maximizes profit from limited resources, the dual asks: what is the lowest fair price for each resource? Remarkably, both problems have the same optimal value — the basis of "shadow prices" in economics.' : '每個線性規劃都有一個「雙胞胎」問題，稱為對偶問題。若工廠要用有限資源使利潤最大，對偶問題就問：每單位資源最少值多少錢？令人驚奇的是兩個問題的最佳值相同——這就是經濟學中「影子價格」的基礎。'}</p>`)}
  <div class="g2">${C('👨‍🏫', en ? '7. People in the story' : '7. 歷史人物', `<ul><li><b>${en ? 'Leonid Kantorovich' : '坎拓羅維奇'}（1912–1986）</b>：${en ? '1939 work on organizing production; Nobel Prize in Economics 1975 (with Koopmans).' : '1939 年發表《生產組織與計畫的數學方法》，1975 年與庫普曼斯共獲諾貝爾經濟學獎。'}</li><li><b>${en ? 'Wassily Leontief' : '李安鐵夫'}（1905–1999）</b>：${en ? 'input–output analysis; Nobel Prize 1973.' : '提出投入產出分析，1973 年諾貝爾經濟學獎。'}</li><li><b>${en ? 'George Dantzig' : '丹齊格'}（1914–2005）</b>：${en ? 'simplex method, 1947.' : '1947 年提出單形法。'}</li></ul>`)}
  ${C('🌏', en ? '8. Where is LP used?' : '8. 生活中的線性規劃', `<ul><li>🚚 ${en ? 'Logistics: shortest-cost delivery routes' : '物流配送：運費最低的路線與配貨（習題 8）'}</li><li>🏭 ${en ? 'Production planning (Examples 5, 6)' : '生產規劃：原料、產量、利潤（例題 5、6）'}</li><li>🥗 ${en ? 'Diet / feed formulation (Exercise 10)' : '營養配方：最省錢的飼料或菜單（習題 10）'}</li><li>👩‍⚕️ ${en ? 'Staff scheduling, airline crews' : '排班：醫院、航空公司人員排程'}</li><li>📢 ${en ? 'Advertising budget allocation' : '廣告預算分配、電力調度'}</li></ul>`)}</div>
  ${C('🛠️', en ? '9. Tools to try' : '9. 動手用工具', `<ul><li><b>GeoGebra</b>：${en ? 'type <code>x+2y≤6 ∧ 2x+y≤6 ∧ x≥0 ∧ y≥0</code> to shade the region; add a slider k and the line x+3y=k.' : '在輸入列輸入 <code>x+2y≤6 ∧ 2x+y≤6 ∧ x≥0 ∧ y≥0</code> 即可畫出可行解區域；再建立滑桿 k 與直線 x+3y=k 模擬平行線法。'}</li><li><b>Excel ${en ? 'Solver' : '規劃求解'}</b>：${en ? 'put x, y in cells, write the objective and constraint formulas, then Data → Solver → "Simplex LP".' : '把 x、y 放在儲存格，寫好目標函數與限制式公式，資料 → 規劃求解 → 選「單純 LP」。'}</li><li><b>Python</b>：<code>scipy.optimize.linprog(c=[-25,-12], A_ub=[[5,4],[3,1]], b_ub=[80,30])</code> ${en ? 'solves Example 5 (maximize by minimizing the negative).' : '即可解例題 5（求最大值時把係數取負號）。'}</li></ul>`)}
  ${C('🧗', en ? '10. Challenge problems' : '10. 延伸挑戰題', advChallenges())}`;
}
function advChallenges() {
  const en = App.lang === 'en';
  const P = [
    { q: { zh: '例題 4 的可行解區域中，若目標函數改為 ax＋y（a＞0），a 在什麼範圍時，最大值都出現在 B(2, 2)？', en: 'In Example 4\'s region, with objective ax + y (a > 0), for which a is the maximum attained at B(2, 2)?' }, s: { zh: 'B 的兩條鄰邊為 x＋2y＝6（斜率 −1/2）與 2x＋y＝6（斜率 −2）。ax＋y＝k 的斜率為 −a，需介於兩邊之間：−2≤−a≤−1/2，得 <b>1/2≤a≤2</b>（端點時整條邊都是最佳解）。', en: 'The edges at B are x + 2y = 6 (slope −1/2) and 2x + y = 6 (slope −2). The level line ax + y = k has slope −a, which must lie between them: −2 ≤ −a ≤ −1/2, so <b>1/2 ≤ a ≤ 2</b> (at the endpoints a whole edge is optimal).' } },
    { q: { zh: '在 x＋2y≤8，3x＋y≤9，x≥0，y≥0 中，求 3x＋4y 的最大值。', en: 'Maximize 3x + 4y subject to x + 2y ≤ 8, 3x + y ≤ 9, x ≥ 0, y ≥ 0.' }, s: { zh: '頂點 (0, 0)、(3, 0)、(2, 3)、(0, 4)，代入得 0、9、18、16，<b>最大值 18</b>（在 (2, 3)）。', en: 'Vertices (0, 0), (3, 0), (2, 3), (0, 4) give 0, 9, 18, 16: <b>maximum 18</b> at (2, 3).' } },
    { q: { zh: '承例題 5，若原料只能整公噸購買，最多可提煉多少公斤精油？', en: 'In Example 5, if materials must be whole tonnes, what is the most oil?' }, s: { zh: '檢查最佳點 (40/7, 90/7)≈(5.7, 12.9) 附近的格點：(5, 13)→281、(6, 12)→294、(4, 15)→280、(7, 9)→283。最大為 <b>(6, 12)，294 公斤</b>。', en: 'Check lattice points near (40/7, 90/7) ≈ (5.7, 12.9): (5, 13)→281, (6, 12)→294, (4, 15)→280, (7, 9)→283. Best: <b>(6, 12), 294 kg</b>.' } }
  ];
  return P.map((p, i) => `<div class="pr"><span class="tag pr">🧗 ${en ? 'Challenge' : '挑戰'} ${i + 1}</span><div>${L(p.q)}</div><details class="solbox" data-name="challenge ${i + 1}"><summary>🔍 ${t('showSol')}</summary><div class="sol">${L(p.s)}</div></details></div>`).join('');
}
function mountAdv(root) {
  const u = $('[data-advw=unb]', root); if (u) W.sweep(u, { preset: PRESETS[6], fixed: true, title: App.lang === 'en' ? 'Example 6: the minimum exists, the maximum does not' : '例題 6：最小值存在、最大值不存在' });
  const it = $('[data-advw=int]', root);
  if (it) {
    const hs = PRESETS[4].hs, card = document.createElement('div'); card.className = 'card'; it.append(card);
    card.innerHTML = `<h3>🔢 ${App.lang === 'en' ? 'Integer points in Example 5' : '例題 5 的整數可行解'}</h3><div style="max-width:480px;margin:auto"></div><div class="readout"></div>`;
    const p = mkPlot(card.children[1], [-1, 18, -1, 22], 460);
    p.regionOf(hs); hs.slice(0, 2).forEach((c, i) => p.cons(c, { color: COL[i] }));
    let best = null;
    for (let x = 0; x <= 17; x++) for (let y = 0; y <= 21; y++) if (hs.every(c => Geo.sat(c, x, y))) { const v = 25 * x + 12 * y; if (!best || v > best[2]) best = [x, y, v]; p.point(x, y, { r: 3, color: 'var(--c5)' }); }
    p.point(40 / 7, 90 / 7, { r: 7, color: 'var(--c6)', label: 'LP (40/7, 90/7)', dx: -120 }); p.point(best[0], best[1], { r: 9, color: 'var(--c1)', label: `★ (${best[0]}, ${best[1]})`, dy: 22 });
    p.line(25, 12, best[2], { color: 'var(--c1)', dash: true, w: 2 });
    card.children[2].innerHTML = App.lang === 'en' ? `Blue dots: feasible integer points. Integer optimum ★ (${best[0]}, ${best[1]}) gives <b>${best[2]} kg</b>; the LP optimum gives 2080/7 ≈ 297.14 kg.` : `藍點：所有整數可行解。整數最佳解 ★ (${best[0]}, ${best[1]})，精油 <b>${best[2]} 公斤</b>；連續最佳解為 2080/7≈297.14 公斤。`;
  }
}

/* ================= 練習（隨機出題） ================= */
const GEN = {
  shift() {
    const a = rndNZ(-4, 4), b = rndNZ(-4, 4), c = rnd(-6, 6), k = rnd(1, 4), d = ['R', 'L', 'U', 'D'][rnd(0, 3)];
    const nc = d === 'R' ? c + a * k : d === 'L' ? c - a * k : d === 'U' ? c + b * k : c - b * k;
    const dn = { R: ['向右', 'right'], L: ['向左', 'left'], U: ['向上', 'up'], D: ['向下', 'down'] }[d];
    return { kind: 'num', q: { zh: `將直線 <b class="mn">${lin(a, b)}＝${fmt(c)}</b> ${dn[0]}平移 ${k} 單位，所得直線為 <span class="mn">${lin(a, b)}＝□</span>，求 □。`, en: `Shift <b class="mn">${lin(a, b)} = ${fmt(c)}</b> ${dn[1]} by ${k} units to get <span class="mn">${lin(a, b)} = □</span>. Find □.` }, ans: nc,
      ex: { zh: `${d === 'R' || d === 'L' ? `把 x 換成 x${d === 'R' ? '−' : '＋'}${k}` : `把 y 換成 y${d === 'U' ? '−' : '＋'}${k}`}：常數項變為 ${fmt(c)}${(nc - c) >= 0 ? '＋' : '−'}${fmt(Math.abs(nc - c))}＝<b>${fmt(nc)}</b>。`, en: `${d === 'R' || d === 'L' ? `Replace x by x${d === 'R' ? '−' : '+'}${k}` : `Replace y by y${d === 'U' ? '−' : '+'}${k}`}: the constant becomes <b>${fmt(nc)}</b>.` } };
  },
  intercept() {
    const a = rndNZ(-5, 5), b = rndNZ(-5, 5), c = rndNZ(-10, 10), isX = Math.random() < .5, ans = isX ? c / a : c / b;
    return { kind: 'num', q: { zh: `求直線 <b class="mn">${lin(a, b)}＝${fmt(c)}</b> 的 ${isX ? 'x' : 'y'} 截距。（可填分數，如 −3/2）`, en: `Find the ${isX ? 'x' : 'y'}-intercept of <b class="mn">${lin(a, b)} = ${fmt(c)}</b>. (Fractions like −3/2 are fine.)` }, ans,
      ex: { zh: `令 ${isX ? 'y' : 'x'}＝0，得 ${isX ? 'x' : 'y'}＝${fmt(c)}÷${fmt(isX ? a : b)}＝<b>${fmt(ans)}</b>。`, en: `Put ${isX ? 'y' : 'x'} = 0: ${isX ? 'x' : 'y'} = ${fmt(c)} ÷ ${fmt(isX ? a : b)} = <b>${fmt(ans)}</b>.` } };
  },
  parallel() {
    const a = rndNZ(-4, 4), b = rndNZ(-4, 4), c = rnd(-6, 6), m = [2, 3, -1, -2][rnd(0, 3)];
    const good = `${lin(a * m, b * m)}＝${fmt(rnd(-9, 9))}`;
    const bads = [`${lin(b, a)}＝${fmt(c)}`, `${lin(a, -b)}＝${fmt(c)}`, `${lin(-b, a)}＝${fmt(c + 1)}`, `${lin(a + 1, b)}＝${fmt(c)}`].filter(s => { return true; });
    const pool = [];
    [[b, a], [a, -b], [-b, a], [a + 1, b], [a, b + 1]].forEach(([p, q]) => { if ((p || q) && Math.abs(p * b - q * a) > 1e-9) { const s = `${lin(p, q)}＝${fmt(rnd(-6, 6))}`; if (!pool.includes(s)) pool.push(s); } });
    const opts = shuffle([good, ...pool.slice(0, 3)]);
    return { kind: 'mc', q: { zh: `下列哪一條直線與 <b class="mn">${lin(a, b)}＝${fmt(c)}</b> 平行（或重合）？`, en: `Which line is parallel to (or coincides with) <b class="mn">${lin(a, b)} = ${fmt(c)}</b>?` }, opts, ans: opts.indexOf(good),
      ex: { zh: `平行直線的 x、y 係數成比例：${good} 的係數是原式的 ${m} 倍，斜率同為 ${fmt(-a / b)}。`, en: `Parallel lines have proportional x, y coefficients: ${good} is ${m} times the original; slope ${fmt(-a / b)}.` } };
  },
  testpt() {
    const a = rndNZ(-4, 4), b = rndNZ(-4, 4), c = rnd(-6, 6), op = ['<', '<=', '>', '>='][rnd(0, 3)], hp = H(a, b, c, op);
    let x = rnd(-4, 4), y = rnd(-4, 4); if (Math.random() < .2 && b !== 0 && (c - a * x) % b === 0) y = (c - a * x) / b;
    const ok = Geo.sat(hp, x, y), v = a * x + b * y;
    const opts = [L({ zh: '是，在圖形內', en: 'Yes, inside' }), L({ zh: '否，不在圖形內', en: 'No, not inside' })];
    return { kind: 'mc', q: { zh: `點 (${x}, ${y}) 是否在不等式 <b class="mn">${hpText(hp)}</b> 的圖形中？`, en: `Is (${x}, ${y}) in the graph of <b class="mn">${hpText(hp)}</b>?` }, opts, ans: ok ? 0 : 1,
      ex: { zh: `代入：${fmt(v)} ${OPS[op]} ${fmt(c)} ${ok ? '成立' : '不成立'}。${v === c ? (op.length === 2 ? '點在界線上，含等號所以包含。' : '點在界線上，不含等號所以不包含。') : ''}`, en: `Substitute: ${fmt(v)} ${OPS[op]} ${fmt(c)} is ${ok ? 'true' : 'false'}.${v === c ? (op.length === 2 ? ' On the boundary, included.' : ' On the boundary, excluded.') : ''}` },
      fig: host => { const p = new Plot(host, { xmin: -6, xmax: 6, ymin: -6, ymax: 6, size: 360 }); p.cons(hp, { color: 'var(--c5)', label: hpText(hp) }); p.point(x, y, { color: 'var(--c2)', label: `(${x}, ${y})` }); } };
  },
  solid() {
    const a = rndNZ(-4, 4), b = rndNZ(-4, 4), c = rnd(-6, 6), op = ['<', '<=', '>', '>='][rnd(0, 3)];
    const opts = [L({ zh: '實線', en: 'Solid' }), L({ zh: '虛線', en: 'Dashed' })];
    return { kind: 'mc', q: { zh: `畫 <b class="mn">${hpText(H(a, b, c, op))}</b> 的圖形時，界線 ${lin(a, b)}＝${fmt(c)} 應畫成？`, en: `When graphing <b class="mn">${hpText(H(a, b, c, op))}</b>, the boundary ${lin(a, b)} = ${fmt(c)} is drawn` }, opts, ans: op.length === 2 ? 0 : 1,
      ex: { zh: op.length === 2 ? '含等號 → 包含界線 → 實線。' : '不含等號 → 不包含界線 → 虛線。', en: op.length === 2 ? 'Includes equality → boundary included → solid.' : 'Strict → boundary excluded → dashed.' } };
  },
  lpmax() {
    let u, v, a1, b1, a2, b2;
    do { u = rnd(1, 6); v = rnd(1, 6); a1 = rnd(1, 5); b1 = rnd(1, 5); a2 = rnd(1, 5); b2 = rnd(1, 5); } while (!(a1 * b2 > a2 * b1));
    const hs = [H(a1, b1, a1 * u + b1 * v, '<='), H(a2, b2, a2 * u + b2 * v, '<='), H(1, 0, 0, '>='), H(0, 1, 0, '>=')];
    const p = rnd(1, 6), q = rnd(1, 6), o = Geo.optimize(hs, p, q);
    const ext = Math.max(...o.V.map(t => Math.max(t[0], t[1]))) + 1;
    return { kind: 'num', q: { zh: `在 ${sys(hpText(hs[0]) + '，', hpText(hs[1]) + '，', 'x≥0，y≥0')} 的可行解區域中，求 <b class="mn">${lin(p, q)}</b> 的最大值。`, en: `Over ${sys(hpText(hs[0]) + ',', hpText(hs[1]) + ',', 'x ≥ 0, y ≥ 0')} find the maximum of <b class="mn">${lin(p, q)}</b>.` }, ans: o.max,
      ex: { zh: `頂點與目標值：${o.V.map((t, i) => `${ptH(t)}→${fmtH(o.vals[i])}`).join('，')}。最大值 <b>${fmtH(o.max)}</b>。`, en: `Vertices: ${o.V.map((t, i) => `${ptH(t)}→${fmtH(o.vals[i])}`).join(', ')}. Max <b>${fmtH(o.max)}</b>.` },
      fig: host => { const pl = mkPlot(host, [-1, ext, -1, ext], 360); drawRegion(pl, hs); } };
  },
  lpmin() {
    let u, v, a1, b1, a2, b2;
    do { u = rnd(1, 6); v = rnd(1, 6); a1 = rnd(1, 5); b1 = rnd(1, 5); a2 = rnd(1, 5); b2 = rnd(1, 5); } while (!(a1 * b2 > a2 * b1));
    const hs = [H(a1, b1, a1 * u + b1 * v, '>='), H(a2, b2, a2 * u + b2 * v, '>='), H(1, 0, 0, '>='), H(0, 1, 0, '>=')];
    const p = rnd(1, 6), q = rnd(1, 6), o = Geo.optimize(hs, p, q);
    const ext = Math.max(...o.V.map(t => Math.max(t[0], t[1]))) + 2;
    return { kind: 'num', q: { zh: `在 ${sys(hpText(hs[0]) + '，', hpText(hs[1]) + '，', 'x≥0，y≥0')} 的可行解區域中，求 <b class="mn">${lin(p, q)}</b> 的最小值。`, en: `Over ${sys(hpText(hs[0]) + ',', hpText(hs[1]) + ',', 'x ≥ 0, y ≥ 0')} find the minimum of <b class="mn">${lin(p, q)}</b>.` }, ans: o.min,
      ex: { zh: `區域無界但最小值存在。頂點與目標值：${o.V.map((t, i) => `${ptH(t)}→${fmtH(o.vals[i])}`).join('，')}。最小值 <b>${fmtH(o.min)}</b>。`, en: `Unbounded region, but the minimum exists. Vertices: ${o.V.map((t, i) => `${ptH(t)}→${fmtH(o.vals[i])}`).join(', ')}. Min <b>${fmtH(o.min)}</b>.` },
      fig: host => { const pl = mkPlot(host, [-1, ext, -1, ext], 360); drawRegion(pl, hs); } };
  },
  vertexval() {
    const V = [[0, 0], [rnd(2, 6), 0], [rnd(2, 5), rnd(2, 5)], [0, rnd(2, 6)]];
    const p = rndNZ(-3, 5), q = rndNZ(-3, 5), wantMax = Math.random() < .5, vals = V.map(v => p * v[0] + q * v[1]);
    const ans = wantMax ? Math.max(...vals) : Math.min(...vals);
    return { kind: 'num', q: { zh: `可行解區域的頂點為 ${V.map(ptH).join('、')}，求目標函數 <b class="mn">${lin(p, q)}</b> 的${wantMax ? '最大' : '最小'}值。`, en: `The feasible region has vertices ${V.map(ptH).join(', ')}. Find the ${wantMax ? 'maximum' : 'minimum'} of <b class="mn">${lin(p, q)}</b>.` }, ans,
      ex: { zh: `代入各頂點：${V.map((v, i) => `${ptH(v)}→${vals[i]}`).join('，')}，${wantMax ? '最大' : '最小'}值為 <b>${ans}</b>。`, en: `Values: ${V.map((v, i) => `${ptH(v)}→${vals[i]}`).join(', ')}; the ${wantMax ? 'max' : 'min'} is <b>${ans}</b>.` } };
  },
  lattice() {
    const a = rnd(1, 4), b = rnd(1, 4), c = rnd(3, 9);
    let n = 0; for (let x = 0; a * x <= c; x++) for (let y = 0; a * x + b * y <= c; y++) n++;
    return { kind: 'num', q: { zh: `x，y 為整數，滿足 ${sys(`${lin(a, b)}≤${c}，`, 'x≥0，', 'y≥0')} 的 (x, y) 共有幾組？`, en: `How many integer pairs (x, y) satisfy ${sys(`${lin(a, b)} ≤ ${c},`, 'x ≥ 0,', 'y ≥ 0')}?` }, ans: n,
      ex: { zh: `逐一討論 x＝0，1，2，⋯ 時 y 的個數，共 <b>${n}</b> 組。`, en: `Count the y values for each x = 0, 1, 2, …: <b>${n}</b> pairs.` } };
  }
};
const GEN_NAMES = { mix: { zh: '🎲 綜合', en: '🎲 Mixed' }, shift: { zh: '直線平移', en: 'Shifting lines' }, intercept: { zh: '截距', en: 'Intercepts' }, parallel: { zh: '平行判斷', en: 'Parallel?' }, testpt: { zh: '點與半平面', en: 'Point test' }, solid: { zh: '實線/虛線', en: 'Solid/dashed' }, vertexval: { zh: '頂點代入', en: 'Vertex values' }, lpmax: { zh: '求最大值', en: 'Maximize' }, lpmin: { zh: '求最小值（無界）', en: 'Minimize (unbounded)' }, lattice: { zh: '整數解個數', en: 'Integer count' } };
const Prac = { type: 'mix', cur: null, n: 0, right: 0, streak: 0, best: store.get('pracBest', 0), answered: false };
function renderPractice() {
  const host = $('#prac'), en = App.lang === 'en';
  host.innerHTML = `<div class="stat" style="margin-bottom:14px"><div class="s"><b id="ps1">${Prac.n}</b><span>${en ? 'answered' : '已作答'}</span></div><div class="s"><b id="ps2">${Prac.n ? Math.round(Prac.right / Prac.n * 100) : 0}%</b><span>${en ? 'accuracy' : '正確率'}</span></div><div class="s"><b id="ps3">🔥 ${Prac.streak}</b><span>${en ? 'streak' : '連對'}</span></div><div class="s"><b id="ps4">${Prac.best}</b><span>${en ? 'best streak' : '最佳連對'}</span></div></div>
  <div class="labtabs">${Object.keys(GEN_NAMES).map(k => `<button data-pt="${k}" class="${Prac.type === k ? 'on' : ''}">${L(GEN_NAMES[k])}</button>`).join('')}</div>
  <div class="card qcard" id="pq"></div>`;
  $$('[data-pt]', host).forEach(b => b.addEventListener('click', () => { Prac.type = b.dataset.pt; Snd.click(); renderPractice(); }));
  nextQ();
}
function nextQ() {
  const keys = Object.keys(GEN).filter(k => k !== 'mix'), k = Prac.type === 'mix' ? keys[rnd(0, keys.length - 1)] : Prac.type;
  Prac.cur = Object.assign(GEN[k](), { gen: k }); Prac.answered = false;
  const q = Prac.cur, box = $('#pq'), en = App.lang === 'en';
  box.innerHTML = `<div class="qhead"><span class="pill">${L(GEN_NAMES[k])}</span><span class="muted">#${Prac.n + 1}</span></div><div>${L(q.q)}</div>
    ${q.fig ? `<details class="solbox" style="margin:8px 0"><summary>📈 ${en ? 'Show graph hint' : '顯示圖形提示'}</summary><div class="sol" style="max-width:380px" id="pfig"></div></details>` : ''}
    ${q.kind === 'num' ? `<div class="answer"><input type="text" id="pin" inputmode="decimal" placeholder="${en ? 'answer (e.g. 3/4)' : '答案（可填分數 3/4）'}"><button class="btn green" id="pgo">✔ ${t('check')}</button></div>` : `<div class="opts">${q.opts.map((o, i) => `<button class="opt" data-pi="${i}">${String.fromCharCode(65 + i)}. ${o}</button>`).join('')}</div>`}
    <div id="pfb" style="margin-top:10px"></div><div class="row" style="margin-top:10px"><button class="btn alt" id="pskip">⏭ ${en ? 'Skip' : '跳過'}</button><button class="btn hidden" id="pnext">${en ? 'Next' : '下一題'} →</button></div>`;
  if (q.fig) { const d = box.querySelector('details'); d.addEventListener('toggle', () => { if (d.open && !d._m) { d._m = 1; q.fig($('#pfig')); } }); }
  const answer = (ok, given) => {
    if (Prac.answered) return; Prac.answered = true; Prac.n++; if (ok) { Prac.right++; Prac.streak++; if (Prac.streak > Prac.best) { Prac.best = Prac.streak; store.set('pracBest', Prac.best); } } else Prac.streak = 0;
    Snd[ok ? 'ok' : 'bad'](); if (ok && Prac.streak && Prac.streak % 5 === 0) { Snd.win(); confetti(); toast(en ? `🔥 ${Prac.streak} in a row!` : `🔥 連對 ${Prac.streak} 題！`); }
    $('#pfb').innerHTML = `<span class="fb ${ok ? 'ok' : 'bad'}">${ok ? '🎉 ' + t('correct') : (en ? '❌ Answer: ' : '❌ 正確答案：') + (q.kind === 'num' ? fmtH(q.ans) : String.fromCharCode(65 + q.ans))}</span><div class="sol">${L(q.ex)}</div>`;
    $('#pnext').classList.remove('hidden'); $('#pskip').classList.add('hidden');
    $('#ps1').textContent = Prac.n; $('#ps2').textContent = Math.round(Prac.right / Prac.n * 100) + '%'; $('#ps3').textContent = '🔥 ' + Prac.streak; $('#ps3').classList.add('streak'); $('#ps4').textContent = Prac.best;
    Log.add('practice', `${L(GEN_NAMES[q.gen])}：${L(q.q)}`.slice(0, 160) + ` → ${given}`, ok ? '✔' : '✘');
  };
  if (q.kind === 'num') { const go = () => { const v = $('#pin').value; if (!v.trim()) return; answer(numOk(v, q.ans), v); }; $('#pgo').addEventListener('click', go); $('#pin').addEventListener('keydown', e => { if (e.key === 'Enter') { Prac.answered ? nextQ() : go(); } }); $('#pin').focus({ preventScroll: true }); }
  else $$('[data-pi]', box).forEach(b => b.addEventListener('click', () => { if (Prac.answered) return; const i = +b.dataset.pi, ok = i === q.ans; b.classList.add(ok ? 'ok' : 'bad'); box.querySelector(`[data-pi="${q.ans}"]`).classList.add('ok'); answer(ok, String.fromCharCode(65 + i)); }));
  $('#pnext').addEventListener('click', () => { Snd.click(); nextQ(); });
  $('#pskip').addEventListener('click', () => { Snd.click(); nextQ(); });
}

/* ================= 測驗 ================= */
const Quiz = { qs: [], i: 0, ans: [], t0: 0, timer: null };
function renderQuizStart() {
  const en = App.lang === 'en', hist = store.get('quizHist', []);
  $('#quizhost').innerHTML = `<div class="card" style="text-align:center"><div style="font-size:4rem" class="float">🏆</div><h3>${en ? '10 questions drawn at random from a bank of ' : '從題庫隨機抽出 10 題（題庫共 '}${QUIZ.length}${en ? '' : ' 題）'}</h3>
    <p class="muted">${en ? 'Each question has one correct answer. Your score, time and every answer are saved to the learning log.' : '每題單選，作答後立即回饋。分數、用時與每題作答都會寫入學習歷程。'}</p>
    <div class="stat" style="justify-content:center;margin:14px 0"><div class="s"><b>${store.get('quizBest', 0)}</b><span>${en ? 'best score' : '最高分'}</span></div><div class="s"><b>${hist.length}</b><span>${en ? 'attempts' : '測驗次數'}</span></div></div>
    <button class="btn" id="qstart" style="font-size:1.15rem">🚀 ${en ? 'Start quiz' : '開始測驗'}</button></div>
    ${hist.length ? `<div class="card"><h3>📈 ${en ? 'History' : '歷次成績'}</h3><div class="bars">${hist.slice(-8).map(h => `<div class="b"><span>${stamp(h.t).slice(5, 16)}</span><div class="progress"><i style="width:${h.s}%"></i></div><b>${h.s}</b></div>`).join('')}</div></div>` : ''}`;
  $('#qstart').addEventListener('click', () => {
    Quiz.qs = shuffle(QUIZ).slice(0, 10).map(q => { const order = shuffle(q.o.map((_, i) => i)); return { q: q.q, o: order.map(i => q.o[i]), a: order.indexOf(q.a), tag: q.tag }; });
    Quiz.i = 0; Quiz.ans = []; Quiz.t0 = Date.now(); Snd.whoosh(); clearInterval(Quiz.timer);
    Quiz.timer = setInterval(() => { const e = $('#qtime'); if (!e) { clearInterval(Quiz.timer); return; } const s = (Date.now() - Quiz.t0) / 1000 | 0; e.textContent = `⏱ ${String(s / 60 | 0).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; }, 500);
    renderQuizQ();
  });
}
function renderQuizQ() {
  const q = Quiz.qs[Quiz.i], en = App.lang === 'en';
  $('#quizhost').innerHTML = `<div class="card qcard"><div class="qhead"><b>${en ? 'Question' : '第'} ${Quiz.i + 1} / 10 ${en ? '' : '題'}</b><span class="timer" id="qtime">⏱ 00:00</span></div>
    <div class="progress" style="margin-bottom:12px"><i style="width:${Quiz.i * 10}%"></i></div><div style="font-size:1.12rem">${L(q.q)}</div>
    <div class="opts">${q.o.map((o, i) => `<button class="opt" data-qi="${i}">${String.fromCharCode(65 + i)}. ${L(o)}</button>`).join('')}</div><div id="qfb" style="margin-top:10px"></div>
    <div class="row" style="margin-top:12px;justify-content:flex-end"><button class="btn hidden" id="qnext">${Quiz.i < 9 ? (en ? 'Next' : '下一題') + ' →' : (en ? 'See results' : '看成績') + ' 🏁'}</button></div></div>`;
  $$('[data-qi]').forEach(b => b.addEventListener('click', () => {
    if (Quiz.ans[Quiz.i] != null) return;
    const i = +b.dataset.qi, ok = i === q.a; Quiz.ans[Quiz.i] = i;
    b.classList.add(ok ? 'ok' : 'bad'); $(`[data-qi="${q.a}"]`).classList.add('ok'); $$('[data-qi]').forEach(x => x.disabled = true);
    Snd[ok ? 'ok' : 'bad'](); $('#qfb').innerHTML = `<span class="fb ${ok ? 'ok' : 'bad'}">${ok ? '🎉 ' + t('correct') : (en ? '❌ Correct answer: ' : '❌ 正確答案：') + String.fromCharCode(65 + q.a)}</span>`;
    $('#qnext').classList.remove('hidden');
  }));
  $('#qnext').addEventListener('click', () => { Snd.click(); if (Quiz.i < 9) { Quiz.i++; renderQuizQ(); } else renderQuizEnd(); });
}
function renderQuizEnd() {
  clearInterval(Quiz.timer);
  const en = App.lang === 'en', right = Quiz.qs.filter((q, i) => Quiz.ans[i] === q.a).length, score = right * 10, secs = (Date.now() - Quiz.t0) / 1000 | 0;
  const hist = store.get('quizHist', []); hist.push({ t: new Date().toISOString(), s: score, secs }); store.set('quizHist', hist);
  if (score > store.get('quizBest', 0)) store.set('quizBest', score);
  Log.add('quiz', `${en ? 'Quiz' : '測驗'} ${right}/10，${en ? 'time' : '用時'} ${secs}s；` + Quiz.qs.map((q, i) => `${i + 1}${Quiz.ans[i] === q.a ? '✔' : '✘'}`).join(' '), score);
  updateProg();
  if (score >= 80) { Snd.win(); confetti(); } else Snd.page();
  const C = 2 * Math.PI * 60, msg = score === 100 ? (en ? 'Perfect! LP master!' : '滿分！線性規劃大師！') : score >= 80 ? (en ? 'Great job! Goal reached.' : '太棒了！達成目標！') : score >= 60 ? (en ? 'Passed — review the ones you missed.' : '及格了，複習一下錯題吧！') : (en ? 'Keep going — revisit the lessons and Lab.' : '再加油！回到課文與實驗室複習。');
  $('#quizhost').innerHTML = `<div class="card" style="text-align:center"><svg class="score-ring" viewBox="0 0 150 150"><circle cx="75" cy="75" r="60" fill="none" stroke="var(--bg2)" stroke-width="16"/><circle cx="75" cy="75" r="60" fill="none" stroke="url(#sg)" stroke-width="16" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C}" transform="rotate(-90 75 75)" id="ring"/><defs><linearGradient id="sg"><stop offset="0" stop-color="#2ec4b6"/><stop offset="1" stop-color="#8338ec"/></linearGradient></defs><text x="75" y="88" text-anchor="middle" font-size="38" font-weight="900" fill="var(--ink)">${score}</text></svg>
    <h3>${msg}</h3><p class="muted">${right}/10 ・ ${en ? 'time' : '用時'} ${secs}s</p><div class="row" style="justify-content:center"><button class="btn" id="qagain">🔁 ${en ? 'Try again' : '再測一次'}</button><a class="btn alt" href="#log">📒 ${t('log')}</a></div></div>
    <div class="card"><h3>🧐 ${en ? 'Review' : '錯題檢討'}</h3><ol class="review">${Quiz.qs.map((q, i) => `<li>${Quiz.ans[i] === q.a ? '✅' : '❌'} ${L(q.q)}<br><span class="muted">${en ? 'Answer' : '答案'}：${L(q.o[q.a])}${Quiz.ans[i] !== q.a ? `　${en ? 'yours' : '你的作答'}：${L(q.o[Quiz.ans[i]])}` : ''}</span> ${Quiz.ans[i] !== q.a ? `<a href="#${q.tag}">→ ${t(q.tag)}</a>` : ''}</li>`).join('')}</ol></div>`;
  requestAnimationFrame(() => { const r = $('#ring'); r.style.transition = 'stroke-dashoffset 1.2s ease'; requestAnimationFrame(() => r.setAttribute('stroke-dashoffset', C * (1 - score / 100))); });
  $('#qagain').addEventListener('click', () => { Snd.click(); renderQuizStart(); });
}

/* ================= 學習歷程 ================= */
function logHTML() {
  const en = App.lang === 'en', D = Log.data, pr = D.filter(d => d.type === 'practice'), ck = D.filter(d => d.type === 'check'), qz = store.get('quizHist', []);
  const tt = Object.values(App.time).reduce((s, x) => s + x, 0), min = Math.round(tt / 60);
  const acc = a => a.length ? Math.round(a.filter(d => d.result === '✔').length / a.length * 100) : 0;
  const times = ROUTES.filter(r => App.time[r.id]).map(r => [t(r.id), Math.round(App.time[r.id] / 60 * 10) / 10]);
  const mx = Math.max(1, ...times.map(x => x[1]));
  return `<h2 class="sec"><span class="ico">📒</span>${t('log')}</h2>
  <div class="card"><h3>👤 ${en ? 'Student' : '學生資料'}</h3><div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(min(100%,180px),1fr))">
    <label class="field">${en ? 'Class' : '班級'}<input id="pfcls" value="${App.profile.cls || ''}"></label><label class="field">${en ? 'Seat No.' : '座號'}<input id="pfseat" value="${App.profile.seat || ''}"></label><label class="field">${en ? 'Name' : '姓名'}<input id="pfname" value="${App.profile.name || ''}"></label></div></div>
  <div class="stat" style="margin-bottom:18px"><div class="s"><b>${progress()}%</b><span>${t('progress')}</span></div><div class="s"><b>${min}</b><span>${en ? 'minutes' : '學習分鐘'}</span></div><div class="s"><b>${Object.keys(App.done).length}/${TOTAL_CHECKS}</b><span>${en ? 'items solved' : '完成題目'}</span></div><div class="s"><b>${pr.length}</b><span>${en ? 'practice Qs' : '練習題數'}</span></div><div class="s"><b>${acc(pr)}%</b><span>${en ? 'practice acc.' : '練習正確率'}</span></div><div class="s"><b>${store.get('quizBest', 0)}</b><span>${en ? 'best quiz' : '測驗最高分'}</span></div><div class="s"><b>${qz.length}</b><span>${en ? 'quizzes' : '測驗次數'}</span></div></div>
  <div class="g2"><div class="card"><h3>⏱ ${en ? 'Time per section (min)' : '各單元學習時間（分鐘）'}</h3><div class="bars">${times.map(([n, v]) => `<div class="b"><span>${n}</span><div class="progress"><i style="width:${v / mx * 100}%"></i></div><b>${v}</b></div>`).join('') || '<p class="muted">—</p>'}</div></div>
  <div class="card"><h3>✍️ ${en ? 'Reflection' : '學習反思'}</h3><textarea id="refl" rows="5" style="width:100%;border-radius:12px;border:2px solid var(--line);padding:10px;background:var(--card)" placeholder="${en ? 'What did I learn? What is still confusing?' : '我學到了什麼？哪裡還不太懂？'}"></textarea><button class="btn sm" id="reflsave" style="margin-top:8px">💾 ${en ? 'Save to log' : '寫入歷程'}</button></div></div>
  <div class="card"><div class="row" style="justify-content:space-between"><h3 style="margin:0">🗂️ ${en ? 'Activity record' : '學習紀錄'}（${D.length}）</h3>
    <div class="row noprint"><button class="btn sm green" id="dlcsv">⬇️ CSV</button><button class="btn sm" id="dljson">⬇️ JSON</button><button class="btn sm orange" id="dlhtml">⬇️ ${en ? 'Report (HTML)' : '學習報告 (HTML)'}</button><button class="btn sm alt" id="prt">🖨️ ${en ? 'Print' : '列印'}</button><button class="btn sm alt" id="clr">🗑️ ${en ? 'Clear' : '清除'}</button></div></div>
    <div class="logwrap" style="margin-top:12px"><table class="log-table"><thead><tr><th>${en ? 'Time' : '時間'}</th><th>${en ? 'Type' : '類型'}</th><th>${en ? 'Content' : '內容'}</th><th>${en ? 'Result' : '結果'}</th></tr></thead><tbody>
    ${D.slice().reverse().slice(0, 400).map(d => `<tr><td style="white-space:nowrap">${stamp(d.t)}</td><td>${Log.typeName(d.type)}</td><td>${d.detail}</td><td>${d.result}</td></tr>`).join('') || `<tr><td colspan="4" class="muted">${en ? 'No records yet' : '尚無紀錄'}</td></tr>`}</tbody></table></div></div>`;
}
function download(name, text, type) { const b = new Blob([text], { type }); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = name; document.body.append(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500); }
function fileStem() { const p = App.profile; return `線性規劃學習歷程_${[p.cls, p.seat, p.name].filter(Boolean).join('_') || 'student'}_${new Date().toISOString().slice(0, 10)}`; }
function bindLog() {
  const en = App.lang === 'en';
  ['cls', 'seat', 'name'].forEach(k => $('#pf' + k).addEventListener('input', e => { App.profile[k] = e.target.value; store.set('profile', App.profile); }));
  $('#reflsave').addEventListener('click', () => { const v = $('#refl').value.trim(); if (!v) return; Log.add('note', v); Snd.ok(); toast(en ? 'Saved' : '已寫入'); render(); });
  const P = App.profile, head = [en ? 'Class' : '班級', P.cls, en ? 'Seat' : '座號', P.seat, en ? 'Name' : '姓名', P.name];
  $('#dlcsv').addEventListener('click', () => {
    const esc = s => `"${String(s ?? '').replace(/"/g, '""')}"`;
    const rows = [head.map(esc).join(','), [en ? 'Progress' : '學習進度', progress() + '%', en ? 'Best quiz' : '測驗最高分', store.get('quizBest', 0)].map(esc).join(','), '', [en ? 'Time' : '時間', en ? 'Type' : '類型', en ? 'Page' : '頁面', en ? 'Content' : '內容', en ? 'Result' : '結果'].map(esc).join(',')]
      .concat(Log.data.map(d => [stamp(d.t), Log.typeName(d.type), d.route ? t(d.route) : '', d.detail, d.result].map(esc).join(',')));
    download(fileStem() + '.csv', '﻿' + rows.join('\r\n'), 'text/csv;charset=utf-8'); Snd.ok();
  });
  $('#dljson').addEventListener('click', () => { download(fileStem() + '.json', JSON.stringify({ profile: P, progress: progress(), done: App.done, time: App.time, quiz: store.get('quizHist', []), selfCheck: App.checks, log: Log.data }, null, 2), 'application/json'); Snd.ok(); });
  $('#dlhtml').addEventListener('click', () => {
    const qz = store.get('quizHist', []);
    const html = `<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><title>${fileStem()}</title><style>body{font-family:"Microsoft JhengHei",sans-serif;max-width:900px;margin:30px auto;padding:0 16px;line-height:1.6;font-size:16px}h1{color:#6c3cf0}table{border-collapse:collapse;width:100%}td,th{border:1px solid #ccc;padding:4px 8px;font-size:14px;text-align:left}th{background:#f3eefe}</style></head><body>
      <h1>📈 線性規劃 學習歷程報告</h1><p>班級：${P.cls || '—'}　座號：${P.seat || '—'}　姓名：${P.name || '—'}　產生時間：${stamp(new Date().toISOString())}</p>
      <h2>學習摘要</h2><ul><li>學習進度：${progress()}%</li><li>學習時間：${Math.round(Object.values(App.time).reduce((s, x) => s + x, 0) / 60)} 分鐘</li><li>完成題目：${Object.keys(App.done).length} / ${TOTAL_CHECKS}</li><li>測驗：${qz.length} 次，最高 ${store.get('quizBest', 0)} 分</li><li>自我檢核：${GUIDE.checks.filter((_, i) => App.checks[i]).map(c => c.zh).join('；') || '—'}</li></ul>
      <h2>學習紀錄</h2><table><tr><th>時間</th><th>類型</th><th>內容</th><th>結果</th></tr>${Log.data.map(d => `<tr><td>${stamp(d.t)}</td><td>${Log.typeName(d.type)}</td><td>${d.detail.replace(/</g, '&lt;')}</td><td>${d.result}</td></tr>`).join('')}</table></body></html>`;
    download(fileStem() + '.html', html, 'text/html;charset=utf-8'); Snd.ok();
  });
  $('#prt').addEventListener('click', () => window.print());
  $('#clr').addEventListener('click', () => { if (confirm(en ? 'Clear all learning records on this device?' : '確定要清除這台裝置上的所有學習紀錄嗎？')) { Log.data = []; store.set('log', []); App.done = {}; store.set('done', {}); App.time = {}; store.set('time', {}); store.set('quizHist', []); store.set('quizBest', 0); App.visited = {}; store.set('visited', {}); Snd.bad(); render(); } });
}

/* ================= 課本瀏覽 ================= */
function bindBook(start) {
  let pg = start || 6;
  const show = n => { pg = Math.min(23, Math.max(6, n)); $('#pgimg').src = `assets/pages/p${String(pg - 5).padStart(2, '0')}.webp`; $('#pglbl').textContent = `p.${pg}　(${pg - 5}/18)`; $$('.thumbs button').forEach(b => b.classList.toggle('on', +b.dataset.pg === pg)); const on = $('.thumbs button.on'); on && on.scrollIntoView({ block: 'nearest', inline: 'nearest' }); };
  $$('.thumbs button').forEach(b => b.addEventListener('click', () => { Snd.page(); show(+b.dataset.pg); }));
  $$('[data-goto]').forEach(b => b.addEventListener('click', () => { Snd.page(); show(+b.dataset.goto); }));
  $('#pgprev').addEventListener('click', () => { Snd.click(); show(pg - 1); }); $('#pgnext').addEventListener('click', () => { Snd.click(); show(pg + 1); });
  $('#dlpdf').addEventListener('click', () => Log.add('visit', App.lang === 'en' ? 'Downloaded textbook PDF' : '下載原始教材 PDF'));
  show(pg);
}

/* ================= 路由 ================= */
function leave() { if (App.route) { const s = (Date.now() - App.enter) / 1000; if (s > 1 && s < 3600) { App.time[App.route] = (App.time[App.route] || 0) + s; store.set('time', App.time); } } }
function render() {
  const id = (location.hash.slice(1) || 'home').split('?')[0];
  const route = ROUTES.some(r => r.id === id) ? id : 'home';
  if (route !== App.route) { leave(); App.route = route; App.enter = Date.now(); Log.add('visit', t(route)); }
  App.visited[route] = true; store.set('visited', App.visited);
  const main = $('#main'); let out;
  if (/^l[123]$/.test(route)) out = Pages.lesson(route); else out = Pages[route]();
  const html = typeof out === 'string' ? out : out.html;
  main.innerHTML = `<div class="view">${html}</div>`;
  afterRender(main, out.ck);
  if (route === 'guide') $$('[data-sc]').forEach(c => c.addEventListener('change', () => { App.checks[c.dataset.sc] = c.checked; store.set('checks', App.checks); Snd[c.checked ? 'ok' : 'click'](); Log.add('self', L(GUIDE.checks[c.dataset.sc]), c.checked ? '✔' : '—'); }));
  if (route === 'lab') { $$('[data-lab]').forEach(b => b.addEventListener('click', () => { App.labTab = +b.dataset.lab; $$('[data-lab]').forEach(x => x.classList.toggle('on', x === b)); Snd.click(); renderLab(); })); renderLab(); }
  if (route === 'ex') $$('[data-exf]').forEach(b => b.addEventListener('click', () => { App.exFilter = b.dataset.exf; Snd.click(); render(); }));
  if (route === 'adv') { mountAdv(main); $$('[data-labgo]').forEach(a => a.addEventListener('click', () => { App.labTab = +a.dataset.labgo; })); }
  if (route === 'practice') renderPractice();
  if (route === 'quiz') renderQuizStart();
  if (route === 'log') bindLog();
  if (route === 'book') bindBook(App.bookPage); App.bookPage = null;
  $$('[data-page]', main).forEach(a => a.addEventListener('click', () => { App.bookPage = +a.dataset.page; }));
  $$('[data-jump]', main).forEach(a => a.addEventListener('click', () => { const e = document.getElementById(a.dataset.jump); if (e) { e.scrollIntoView({ behavior: 'smooth', block: 'start' }); Snd.click(); } }));
  $$('nav.tabs a').forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + route));
  const on = $('nav.tabs a.on'); on && on.scrollIntoView({ block: 'nearest', inline: 'center' });
  updateProg();
}
function buildChrome() {
  document.title = `${t('title')}｜${App.lang === 'en' ? 'Interactive course' : '互動學習網'}`;
  document.documentElement.lang = App.lang === 'en' ? 'en' : 'zh-Hant';
  $('#t-title').textContent = t('title'); $('#t-sub').textContent = t('sub');
  $('#tabs').innerHTML = ROUTES.map(r => `<a href="#${r.id}">${r.ico} ${t(r.id)}</a>`).join('');
  $('#tabs').addEventListener('click', e => { if (e.target.closest('a')) Snd.page(); });
  buildSettings();
}

/* ================= 設定面板 ================= */
function applySettings() {
  const d = document.documentElement, S = App.set;
  d.dataset.device = S.device; d.dataset.layout = S.layout; d.dataset.font = S.font;
  if (S.theme === 'system') delete d.dataset.theme; else d.dataset.theme = S.theme;
  store.set('settings', S);
}
function buildSettings() {
  const S = App.set, fsOn = !!document.fullscreenElement;
  const seg = (key, opts) => `<div class="seg" data-set="${key}">${opts.map(o => `<button data-v="${o}" class="${String(key === 'fs' ? fsOn : S[key]) === String(o) ? 'on' : ''}">${t(o === true ? 'on' : o === false ? 'off' : o === 'zh' ? '' : o === 'en' ? '' : o) || (o === 'zh' ? '繁體中文' : 'English')}</button>`).join('')}</div>`;
  const row = (ico, key, opts) => `<div class="set"><div class="lab2">${ico} ${t(key)}</div>${seg(key, opts)}</div>`;
  $('#drawer').innerHTML = `<h3><span>⚙️ ${t('settings')}</span><button class="iconbtn" id="dclose" aria-label="close">✖</button></h3>
    ${row('⛶', 'fs', [true, false])}${row('🔊', 'sound', [true, false])}${row('📱', 'device', ['auto', 'phone', 'tablet', 'desktop'])}${row('🔄', 'layout', ['auto', 'portrait', 'landscape'])}
    ${row('🌐', 'lang', ['zh', 'en'])}${row('🔠', 'font', ['small', 'normal', 'large'])}${row('🎨', 'theme', ['system', 'light', 'dark'])}
    <div class="set"><button class="btn alt" id="sreset">↺ ${t('reset')}</button></div>`;
  $$('#drawer [data-set]').forEach(g => g.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    const key = g.dataset.set; let v = b.dataset.v; if (v === 'true') v = true; if (v === 'false') v = false;
    if (key === 'fs') { try { v ? document.documentElement.requestFullscreen() : document.fullscreenElement && document.exitFullscreen(); } catch (err) { toast('Fullscreen not supported'); } }
    else { S[key] = v; applySettings(); }
    Snd.click();
    $$('button', g).forEach(x => x.classList.toggle('on', x === b));
    if (key === 'lang') { buildChrome(); render(); openDrawer(true); }
    if (key === 'device' || key === 'layout' || key === 'font') setTimeout(() => window.dispatchEvent(new Event('resize')), 50);
    Log.add('visit', `${t('settings')}：${t(key)} → ${b.textContent}`);
  }));
  $('#dclose').addEventListener('click', () => openDrawer(false));
  $('#sreset').addEventListener('click', () => { Object.assign(S, DEF); applySettings(); buildChrome(); render(); openDrawer(true); Snd.click(); });
}
function openDrawer(on) { $('#drawer').classList.toggle('on', on); $('#scrim').classList.toggle('on', on); }
document.addEventListener('fullscreenchange', () => { $$('[data-set=fs] button').forEach(b => b.classList.toggle('on', String(!!document.fullscreenElement) === b.dataset.v)); });

window.addEventListener('hashchange', () => { render(); window.scrollTo(0, 0); });
window.addEventListener('beforeunload', leave);
document.addEventListener('visibilitychange', () => { if (document.hidden) { leave(); App.enter = Date.now(); } else App.enter = Date.now(); });
document.addEventListener('DOMContentLoaded', () => {
  applySettings(); buildChrome();
  $('#gear').addEventListener('click', () => { Snd.click(); openDrawer(true); });
  $('#scrim').addEventListener('click', () => openDrawer(false));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') openDrawer(false); });
  render();
});

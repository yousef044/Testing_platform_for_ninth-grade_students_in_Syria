'use strict';
const SUBJ_HEX = { science: '#10b981', social: '#f43f5e', math: '#8b5cf6', arabic: '#ec4899', english: '#0ea5e9', french: '#d946ef', islamic: '#059669' };
const SUBJECTS = [
            { id: 'science', name: 'العلوم العامة', count: 405, icon: 'fa-atom', color: 'from-emerald-500 to-teal-600' },
            { id: 'social', name: 'الاجتماعيات', count: 249, icon: 'fa-globe', color: 'from-rose-500 to-orange-600' },
            { id: 'math', name: 'الرياضيات', count: 253, icon: 'fa-square-root-variable', color: 'from-purple-500 to-indigo-600' },
            { id: 'arabic', name: 'لغة عربية', count: 160, icon: 'fa-book-open', color: 'from-pink-500 to-rose-600' },
            { id: 'english', name: 'لغة إنجليزية', count: 234, icon: 'fa-language', color: 'from-sky-500 to-blue-600' },
            { id: 'french', name: 'لغة فرنسية', count: 169, icon: 'fa-comment-dots', color: 'from-fuchsia-500 to-pink-600' },
            { id: 'islamic', name: 'تربية إسلامية', count: 181, icon: 'fa-mosque', color: 'from-emerald-600 to-green-700' }
        ];
// الدورات: تُعرَض داخل كل مادة. لإضافة دورة جديدة أضف عنصراً هنا ثم ضع "c":"<id>" في أسئلتها داخل data/*.js
const COURSES = [
  { id: '2026', name: 'دورة 2026', icon: 'fa-calendar-check' },
  { id: '2025', name: 'دورة 2025', icon: 'fa-calendar-check' },
  { id: '2024', name: 'دورة 2024', icon: 'fa-calendar-check' },
  { id: '2023', name: 'دورة 2023', icon: 'fa-calendar-check' },
  { id: '2022', name: 'دورة 2022', icon: 'fa-calendar-check' }
];
// دروس كل مادة (تُستعمل في «التدرّب حسب الدرس»). الوسم k في كل سؤال داخل data/*.js
const TOPICS = {
  science: [['neuro','الجهاز العصبي'],['endo','الغدد والهرمونات'],['skin','الجلد والإفراز'],['senses','الحواس'],['bones','الجهاز الحركي (عظام وعضلات)'],['blood','الدورة الدموية والهضم والبيئة'],['repro','التكاثر والمناعة والأمراض'],['elec','الكهرباء'],['magnet','المغناطيسية والتحريض'],['sound','الصوت والاهتزازات'],['light','الضوء'],['mech','القوى والحركة والطاقة'],['organic','الكيمياء العضوية'],['acids','الحموض والقواعد والأملاح'],['chem','الكيمياء العامة']],
  social: [['ottoman','الدولة العثمانية والمسألة الشرقية'],['mandate','الاستعمار والانتداب والمعاهدات'],['revolt','الثورات والحركة الوطنية والاستقلال'],['arabworld','العالم العربي والقضايا الدولية'],['climate','الجغرافيا: المناخ والتضاريس والخرائط'],['pop','الجغرافيا: السكان'],['econ','الجغرافيا: الموارد والاقتصاد'],['sci','التطور العلمي والطبي والجمعيات في سورية']],
  math: [['factor','النشر والتحليل'],['equations','المعادلات والمتراجحات'],['functions','التوابع والمستقيم'],['powers','الأعداد والجذور والنسب'],['triangle','المثلثات'],['circle','الدائرة'],['geo','المضلعات والتحويلات الهندسية'],['solids','المجسمات والحجوم'],['stats','الإحصاء والاحتمال']],
  arabic: [['grammar','النحو والإعراب'],['morph','الصرف والمعجم والإملاء'],['rhetoric','البلاغة'],['poem','النص الشعري'],['text','الفهم والتعبير']],
  english: [['reading','القراءة (Reading)'],['grammar','الأزمنة والقواعد (Grammar)'],['vocab','المفردات (Vocabulary)'],['prep','حروف الجر والأفعال المركبة'],['quant','أدوات التنكير والمقادير'],['wh','أدوات الاستفهام']],
  french: [['reading','القراءة (Lecture)'],['grammar','التصريف والأزمنة والتطابق'],['pron','الضمائر وأدوات الوصل'],['prep','حروف الجر والنفي والربط'],['vocab','المفردات والتعابير'],['order','ترتيب النص والكتابة']],
  islamic: [['quran','القرآن الكريم والتجويد'],['hadith','الحديث الشريف'],['faith','العقيدة والإيمان'],['worship','العبادات والفقه'],['seerah','السيرة والتاريخ'],['ethics','الأخلاق والقيم']]
};
const topicName = (sid, k) => ((TOPICS[sid] || []).find(t => t[0] === k) || [0, k])[1];
const SPECIAL = ['wrong', 'notebook', 'weak', 'weakall', 'challenge'];          // اختبارات لا تُحفظ لها «أفضل نتيجة»
const WEAK_SUBJECT = { id: 'weak', name: 'أسئلتي الضعيفة', count: 0, icon: 'fa-bullseye', color: 'from-amber-500 to-orange-600' };
const TTS_LANG = { english: 'en-US', french: 'fr-FR' };
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// عرض آمن: يسمح فقط بـ sup/sub/br/span ويحوّل الكيانات (&radic; ...) ويُسقط أي وسم آخر مع إبقاء نصه
function rich(s) {
  const t = document.createElement('template'); t.innerHTML = String(s);
  const walk = n => [...n.childNodes].map(c => {
    if (c.nodeType === 3) return esc(c.textContent);
    if (c.nodeType !== 1) return '';
    const k = c.tagName.toLowerCase();
    if (k === 'br') return '<br>';
    if (k === 'sup' || k === 'sub') return `<${k}>${walk(c)}</${k}>`;
    if (k === 'span') return `<span dir="rtl" style="unicode-bidi:isolate">${walk(c)}</span>`;
    return walk(c);
  }).join('');
  return walk(t.content);
}
const plain = s => { const t = document.createElement('template'); t.innerHTML = String(s); return t.content.textContent; };
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
};
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
window.BANK = window.BANK || {};
const SECS_PER_Q = 45; // الوقت يتناسب مع عدد الأسئلة
let timerId = null, timeLeft = 0, timeTotal = 0, timedOut = false;
function fmtTime(t) { return String(Math.floor(t / 60)).padStart(2, '0') + ':' + String(t % 60).padStart(2, '0'); }
function drawTimer() {
  $('timer-text').textContent = fmtTime(timeLeft);
  $('timer-box').firstElementChild.classList.toggle('text-rose-700', timeLeft <= timeTotal * 0.2);
}
function stopTimer() { if (timerId) clearInterval(timerId); timerId = null; }
function startTimer(sec, tt) {
  timeTotal = tt || sec; timeLeft = sec;
  $('timer-box').classList.remove('hidden'); drawTimer();
  timerId = setInterval(() => {
    if (--timeLeft <= 0) { timeLeft = 0; drawTimer(); timedOut = true; showCompletion(); return; }
    drawTimer();
  }, 1000);
}
let subject = null, bank = [], course = 'all', questions = [], idx = 0, answers = {}, startTs = Date.now(), shownQ = null;
let challengeInfo = null, chSeed = 0;   // تحدّي الأصدقاء: نتيجة الصديق وبذرة ترتيب الخيارات

function setCount(id, n) {
  const s = SUBJECTS.find(x => x.id === id); if (!s) return;
  s.count = n; document.querySelectorAll(`[data-count="${id}"]`).forEach(e => e.textContent = n);
}
const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const buildQ = q => {
  const o = shuffle(q.opts.map((t, k) => ({ t, ok: k === q.corr })));
  return { text: q.q, options: o.map(x => x.t), correct: o.findIndex(x => x.ok), exp: q.exp || '', s: q.s || (subject ? subject.id : ''), k: q.k || '', ctx: q.ctx || '', img: q.img || '', eimg: q.eimg || '', alt: q.alt || '' };
};
// نسخة بترتيب خيارات ثابت (للتحدّي): نفس البذرة تعطي نفس الترتيب عند الصديق
function mulberry32(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function buildQSeeded(q, seed, i) {
  const rnd = mulberry32((seed || 1) + i * 7919), o = q.opts.map((t, k) => ({ t, ok: k === q.corr }));
  for (let j = o.length - 1; j > 0; j--) { const k = Math.floor(rnd() * (j + 1)); [o[j], o[k]] = [o[k], o[j]]; }
  return { text: q.q, options: o.map(x => x.t), correct: o.findIndex(x => x.ok), exp: q.exp || '', s: q.s || (subject ? subject.id : ''), k: q.k || '', ctx: q.ctx || '', img: q.img || '', eimg: q.eimg || '', alt: q.alt || '' };
}
// ===== الصور والأشكال داخل الأسئلة =====
// يقبل: مسار ملف (img/shape1.png) أو رابط https أو data:image أو كود <svg>…</svg> مباشرة
function figHtml(src, alt, small) {
  src = String(src || '').trim(); if (!src) return '';
  const u = /^<svg[\s>]/i.test(src) ? 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(src) : src;
  if (!/^(data:image\/(png|jpe?g|webp|gif|svg\+xml)[;,]|https?:\/\/|[\w./-]+\.(png|jpe?g|webp|gif|svg|avif))/i.test(u)) return '';
  return `<img src="${esc(u)}" alt="${esc(alt || 'شكل توضيحي')}" loading="lazy" decoding="async" tabindex="0" role="button" title="اضغط للتكبير" onclick="zoomImg(this.src)" onkeydown="if(event.key==='Enter')zoomImg(this.src)" style="background:#fff" class="${small ? 'mt-3 max-h-56' : 'max-h-72'} w-auto max-w-full mx-auto block rounded-2xl border border-slate-200 p-2 cursor-zoom-in">`;
}
function zoomImg(src) {
  const o = document.createElement('div');
  o.className = 'fixed inset-0 z-[60] bg-black/85 flex items-center justify-center p-4 cursor-zoom-out';
  o.setAttribute('role', 'dialog'); o.setAttribute('aria-label', 'عرض الشكل مكبّراً');
  const im = document.createElement('img'); im.src = src; im.alt = ''; im.style.cssText = 'background:#fff;max-width:100%;max-height:100%;border-radius:1rem;padding:.5rem';
  const x = document.createElement('button'); x.type = 'button'; x.setAttribute('aria-label', 'إغلاق');
  x.className = 'absolute top-4 left-4 w-11 h-11 rounded-full bg-white/90 text-slate-800 flex items-center justify-center text-lg'; x.innerHTML = '<i class="fa-solid fa-xmark"></i>';
  const onKey = e => { if (e.key === 'Escape') close(); };
  const close = () => { o.remove(); document.removeEventListener('keydown', onKey); };
  o.onclick = close; document.addEventListener('keydown', onKey);
  o.append(im, x); document.body.appendChild(o); x.focus();
}
const figs = q => { const o = {}; if (q.img) o.img = q.img; if (q.eimg) o.eimg = q.eimg; if (q.alt) o.alt = q.alt; return o; };

function loadBank(id) {
  return new Promise((res, rej) => {
    if (BANK[id]) return res(BANK[id]);
    const s = document.createElement('script');
    s.src = `data/${id}.js`;
    s.onload = () => res(BANK[id]);
    s.onerror = () => rej(new Error('bank'));
    document.head.appendChild(s);
  });
}
// ===== التنقل وأزرار الرجوع في المتصفح =====
let popping = false, completionReady = false;
function pushView(v) {
  if (popping) return;
  const cur = history.state && history.state.v;
  if (!cur || cur === v) history.replaceState({ v }, '');
  else history.pushState({ v }, '');
}
window.addEventListener('popstate', e => {
  const v = (e.state && e.state.v) || 'home';
  popping = true;
  try {
    if (v === 'courses' && subject && subject.id !== 'weak' && bank.length) renderCourses();
    else if (v === 'quiz' && subject && questions.length) { show('quiz-view'); $('timer-box').classList.add('hidden'); counters(); renderQuestion(); window.scrollTo({ top: 0 }); }
    else if (v === 'completion' && subject && questions.length && completionReady) { show('completion-view'); window.scrollTo({ top: 0 }); }
    else if (v === 'notebook') openNotebook();
    else if (v === 'stats') openStats();
    else initHome();
  } finally { popping = false; }
});
const show = (...ids) => { if (!ids.includes('quiz-view')) { if (liveRun && !ids.includes('completion-view')) reportLive(); stopTimer(); stopSpeech(); } return ['home-view', 'courses-view', 'quiz-view', 'completion-view', 'notebook-view', 'stats-view'].forEach(v => $(v).classList.toggle('hidden', !ids.includes(v))); };

// ===== دفتري =====
const NB_MAX = 500;
const nbGet = () => store.get('notebook', []);
const nbSame = (n, s, t) => n.s === s && n.q === t;
const nbHas = (s, t) => nbGet().some(n => nbSame(n, s, t));
function updateNbBadge() {
  const n = nbGet().length, b = $('nb-badge');
  b.textContent = n > 99 ? '99+' : n;
  b.style.display = n ? 'flex' : 'none';
}
function updateNbBtn() {
  const b = $('nb-btn'), q = questions[idx];
  if (!b || !q || !subject) return;
  const saved = nbHas(q.s || subject.id, q.text);
  b.innerHTML = saved ? '<i class="fa-solid fa-bookmark"></i> في دفتري (إزالة)' : '<i class="fa-regular fa-bookmark"></i> إضافة إلى دفتري';
  b.setAttribute('aria-pressed', saved);
  b.className = 'border px-3 sm:px-5 py-2.5 min-h-[44px] rounded-xl font-bold text-xs sm:text-sm transition flex items-center gap-2 ' +
    (saved ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200');
}
function toggleNotebook() {
  const q = questions[idx]; if (!q || !subject) return;
  let list = nbGet();
  const sid = q.s || subject.id;
  if (nbHas(sid, q.text)) list = list.filter(n => !nbSame(n, sid, q.text));
  else list.push({ s: sid, q: q.text, opts: q.options, corr: q.correct, exp: q.exp || '', ...figs(q), t: Date.now() });
  store.set('notebook', list.slice(-NB_MAX));
  updateNbBtn(); updateNbBadge();
}
let nbFilter = 'all';
function openNotebook() {
  $('header-nav-btn').classList.remove('hidden');
  renderNotebook(); show('notebook-view'); pushView('notebook');
  window.scrollTo({ top: 0 });
}
function renderNotebook() {
  const list = nbGet();
  const counts = {}; list.forEach(n => counts[n.s] = (counts[n.s] || 0) + 1);
  if (nbFilter !== 'all' && !counts[nbFilter]) nbFilter = 'all';
  const chip = (id, label, n) => `<button type="button" data-f="${id}" class="px-3 py-1.5 rounded-xl border text-xs md:text-sm font-bold transition ${nbFilter === id ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'}">${esc(label)} (${n})</button>`;
  const fb = $('nb-filters');
  fb.innerHTML = list.length
    ? chip('all', 'الكل', list.length) + SUBJECTS.filter(s => counts[s.id]).map(s => chip(s.id, s.name, counts[s.id])).join('') +
      '<button type="button" id="nb-clear" class="mr-auto px-3 py-1.5 rounded-xl text-xs md:text-sm font-bold text-rose-600 hover:bg-red-50 transition"><i class="fa-solid fa-trash-can ml-1"></i> مسح الدفتر</button>'
    : '';
  fb.querySelectorAll('[data-f]').forEach(b => b.onclick = () => { nbFilter = b.dataset.f; renderNotebook(); });
  const clr = $('nb-clear');
  if (clr) clr.onclick = () => { if (confirm('سيتم حذف كل الأسئلة المحفوظة في دفتري. هل تريد المتابعة؟')) { store.set('notebook', []); nbFilter = 'all'; renderNotebook(); updateNbBadge(); } };
  const box = $('nb-list');
  const items = list.map((n, i) => ({ n, i })).filter(x => nbFilter === 'all' || x.n.s === nbFilter).reverse();
  if (!items.length) {
    box.innerHTML = '<div class="bg-white border border-slate-100 rounded-3xl p-8 text-center space-y-3"><div class="text-4xl text-indigo-600"><i class="fa-regular fa-bookmark"></i></div><p class="font-bold text-slate-900">دفترك فارغ حتى الآن</p><p class="text-sm text-slate-500">أثناء الاختبار اضغط «إضافة إلى دفتري» تحت أي سؤال لحفظه هنا مع حله.</p></div>';
    return;
  }
  box.innerHTML = items.map(({ n, i }) => {
    const sub = SUBJECTS.find(s => s.id === n.s);
    return `
    <div class="bg-white border border-slate-100 rounded-3xl p-5 md:p-6 shadow-sm space-y-4">
      <div class="flex items-center justify-between gap-3">
        <span class="bg-indigo-50 text-indigo-700 text-xs font-black rounded-lg px-2.5 py-1">${esc(sub ? sub.name : n.s)}</span>
        <button type="button" data-rm="${i}" aria-label="إزالة من دفتري" class="w-9 h-9 rounded-xl bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 flex items-center justify-center transition"><i class="fa-solid fa-trash-can"></i></button>
      </div>
      <p class="font-bold text-slate-900 text-base md:text-lg leading-relaxed" dir="auto">${rich(n.q)}</p>
      ${figHtml(n.img, n.alt, true)}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm font-semibold">
        ${n.opts.map((o, k) => k === n.corr
          ? `<div class="bg-emerald-50 border border-emerald-500 text-emerald-800 rounded-xl p-3 flex items-center justify-between gap-2"><span dir="auto">${rich(o)}</span><i class="fa-solid fa-circle-check text-emerald-600"></i></div>`
          : `<div class="bg-white border border-slate-200 text-slate-500 rounded-xl p-3"><span dir="auto">${rich(o)}</span></div>`).join('')}
      </div>
      ${n.exp ? `<div class="bg-indigo-50 border border-indigo-100 text-indigo-900 rounded-2xl p-4 text-sm leading-relaxed"><span class="font-black">الحل: </span>${rich(n.exp)}${figHtml(n.eimg, n.alt, true)}</div>` : ''}
    </div>`;
  }).join('');
  box.querySelectorAll('[data-rm]').forEach(b => b.onclick = () => {
    const l = nbGet(); l.splice(+b.dataset.rm, 1); store.set('notebook', l);
    renderNotebook(); updateNbBadge();
  });
}

// ===== الدخول =====
function unlock() { $('login-view').classList.add('hidden'); }
function loginMsg(msg, cls) { const e = $('login-error'); e.textContent = msg; e.className = 'text-xs font-bold ' + cls; }
async function doLogin() {
  const raw = $('access-code-input').value.trim();
  if (!raw) return loginMsg('أدخل كود التفعيل.', 'text-rose-600');
  if (!window.verifyCode) return loginMsg('تعذّر تحميل خدمة التحقق. تأكد من اتصالك بالإنترنت ثم أعد تحميل الصفحة.', 'text-rose-600');
  const btn = $('login-btn'); btn.disabled = true;
  loginMsg('جارٍ التحقق من الكود...', 'text-blue-600');
  const r = await window.verifyCode(raw);
  btn.disabled = false;
  if (r.ok) { try { localStorage.setItem('bound_device_code', raw); } catch {} unlock(); checkChallenge(); }
  else loginMsg(r.warn ? r.msg + ' إن كان هذا كودك وتغيّر جهازك فاضغط «استعادة الدخول» أدناه.' : r.msg, r.warn ? 'text-orange-600' : 'text-rose-600');
}

// ===== الرئيسية =====
function initHome() {
  const stats = store.get('stats', {});
  const grid = $('subjects-grid'); grid.innerHTML = '';
  SUBJECTS.forEach(sub => {
    const st = stats[sub.id];
    const tr = histOf(sub.id).length;
    const card = document.createElement('div');
    card.className = 'bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition duration-300 cursor-pointer flex flex-col justify-between group';
    card.tabIndex = 0; card.setAttribute('role', 'button');
    card.onclick = () => openSubject(sub.id);
    card.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openSubject(sub.id); } };
    card.classList.add('overflow-hidden');
    const hex = SUBJ_HEX[sub.id] || '#6366f1', dn = Math.min(subDone(sub.id) || 0, sub.count), pp = sub.count ? Math.round(dn / sub.count * 100) : 0;
    card.classList.add('relative');
    card.style.backgroundImage = `linear-gradient(135deg, ${hex}1f 0%, ${hex}08 45%, transparent 75%)`;
    card.innerHTML = `
      <div class="h-1.5 -mx-6 -mt-6 mb-5 bg-gradient-to-l ${sub.color} relative z-10"></div>
      <i aria-hidden="true" class="fa-solid ${sub.icon} absolute -left-5 -bottom-5 text-[7rem] leading-none pointer-events-none transition duration-500 group-hover:scale-110 group-hover:-rotate-6" style="color:${hex};opacity:.09"></i>
      <div class="relative z-10 flex items-start justify-between gap-3">
        <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr ${sub.color} text-white flex items-center justify-center text-2xl shadow-md"><i class="fa-solid ${sub.icon}"></i></div>
        <div class="relative w-14 h-14 shrink-0" role="img" aria-label="نسبة الإنجاز ${pp}%" title="أنجزت ${dn} من ${sub.count} سؤال">
          <svg viewBox="0 0 48 48" class="w-full h-full -rotate-90"><circle cx="24" cy="24" r="20" fill="none" stroke-width="5" class="ring-track"/><circle cx="24" cy="24" r="20" fill="none" stroke-width="5" stroke-linecap="round" stroke="${hex}" stroke-dasharray="125.66" stroke-dashoffset="${(125.66 * (1 - pp / 100)).toFixed(2)}" style="transition: stroke-dashoffset .8s ease-out"/></svg>
          <span class="absolute inset-0 flex items-center justify-center text-[11px] font-black text-slate-700">${pp}%</span>
        </div>
      </div>
      <div class="relative z-10 mt-4">
        <h3 class="text-lg font-bold text-slate-900">${sub.name}</h3>
        <p class="text-sm text-slate-500 mt-1"><span data-count="${sub.id}">${sub.count}</span> سؤال${dn ? ` · أنجزت ${dn}` : ''}</p>
      </div>
      <div class="relative z-10 mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-indigo-600 font-bold text-sm">
        <span>${st ? `أفضل نتيجة: ${st.best}%${tr ? ' · ' + tr + ' محاولة' : ''}` : 'ابدأ الاختبار'}</span>
        <i class="fa-solid fa-arrow-left transition group-hover:-translate-x-1"></i>
      </div>`;
    grid.appendChild(card);
  });
  renderHomeExtras(); renderInstall(); updateNbBadge();
  $('header-nav-btn').classList.add('hidden');
  show('home-view'); pushView('home');
}
function returnToHome() { initHome(); }

// ===== الاختبار =====
const inCourse = (q, id) => Array.isArray(q.c) ? q.c.includes(id) : q.c === id;
const statKey = () => course === 'all' ? subject.id : subject.id + ':' + course;
async function openSubject(id) {
  subject = SUBJECTS.find(s => s.id === id);
  try { bank = await loadBank(id); setCount(id, bank.length); }
  catch { alert('تعذّر تحميل أسئلة المادة. تحقق من الاتصال وأعد المحاولة.'); return; }
  renderCourses();
}
function renderCourses() {
  const stats = store.get('stats', {});
  $('courses-subject-title').textContent = subject.name;
  $('courses-subject-icon').className = `w-14 h-14 rounded-2xl flex items-center justify-center text-2xl text-white shadow-md bg-gradient-to-tr ${subject.color}`;
  $('courses-subject-icon').innerHTML = `<i class="fa-solid ${subject.icon}"></i>`;
  const wrongBank = store.get('wrong', []).filter(w => w.s === subject.id);
  const items = [{ id: 'all', name: 'جميع الأسئلة', icon: 'fa-layer-group', n: bank.length }]
    .concat(COURSES.map(c => ({ ...c, n: bank.filter(q => inCourse(q, c.id)).length })));
  if (wrongBank.length) items.push({ id: 'wrong', name: 'أخطائي المحفوظة', icon: 'fa-rotate-left', n: wrongBank.length });
  const weakBank = weakList().filter(w => w.s === subject.id);
  if (weakBank.length) items.push({ id: 'weak', name: 'أسئلتي الضعيفة', icon: 'fa-bullseye', n: weakBank.length });
  const nbBank = nbGet().filter(w => w.s === subject.id);
  if (nbBank.length) items.push({ id: 'notebook', name: 'دفتري', icon: 'fa-bookmark', n: nbBank.length });
  if (!$('qlen')) $('courses-grid').insertAdjacentHTML('beforebegin', '<div class="flex items-center gap-2 mb-4 text-sm font-bold"><label for="qlen">عدد الأسئلة في كل اختبار:</label><select id="qlen" class="rounded-xl border border-slate-300 px-3 py-2 bg-white text-slate-800"><option value="10">10</option><option value="20">20</option><option value="40">40</option><option value="0">الكل</option></select></div>');
  $('qlen').value = String(store.get('qlen', 20));
  $('qlen').onchange = () => store.set('qlen', +$('qlen').value);
  const grid = $('courses-grid'); grid.innerHTML = '';
  items.forEach(c => {
    const st = stats[c.id === 'all' ? subject.id : subject.id + ':' + c.id];
    const empty = c.n === 0;
    const card = document.createElement('div');
    card.className = 'bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between transition duration-300 ' +
      (empty ? 'opacity-60' : 'hover:shadow-xl hover:-translate-y-1 cursor-pointer');
    if (!empty) {
      card.tabIndex = 0; card.setAttribute('role', 'button');
      card.onclick = () => startCourse(c.id);
      card.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); startCourse(c.id); } };
    }
    card.classList.add('overflow-hidden');
    card.innerHTML = `
      <div class="h-1.5 -mx-6 -mt-6 mb-5 bg-gradient-to-l ${subject.color}"></div>
      <div class="space-y-4">
        <div class="w-12 h-12 rounded-2xl ${c.id === 'challenge' ? 'bg-amber-50 text-amber-600' : 'bg-indigo-50 text-indigo-600'} flex items-center justify-center text-xl"><i class="fa-solid ${esc(c.icon || 'fa-folder')}"></i></div>
        <div><h3 class="text-lg font-bold text-slate-900">${esc(c.name)}</h3>
        <p class="text-xs text-slate-500 mt-1">${empty ? 'لا توجد أسئلة بعد' : c.desc || c.n + ' سؤال'}</p></div>
      </div>
      ${progHtml(courseDone(c), c.n, subject.color)}
      <div class="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-indigo-600 font-bold text-xs">
        <span>${empty ? 'قريباً' : c.cta || (st ? `أفضل نتيجة: ${st.best}%` : 'ابدأ الاختبار')}</span>
        ${empty ? '<i class="fa-solid fa-lock"></i>' : '<i class="fa-solid fa-arrow-left"></i>'}
      </div>`;
    grid.appendChild(card);
  });
  renderTopics(); renderSubjectChart();
  $('header-nav-btn').classList.remove('hidden');
  show('courses-view'); pushView('courses');
  window.scrollTo({ top: 0 });
}
function startCourse(cid) {
  challengeInfo = null;
  course = cid;
  let list = cid === 'all' ? bank : cid === 'wrong' ? store.get('wrong', []).filter(w => w.s === subject.id) : cid === 'notebook' ? nbGet().filter(w => w.s === subject.id) : cid === 'weak' ? weakList().filter(w => w.s === subject.id) : cid.startsWith('t:') ? bank.filter(q => q.k === cid.slice(2)) : bank.filter(q => inCourse(q, cid));
  if (!list.length) return;
  const n = (cid === 'wrong' || cid === 'notebook') ? 0 : store.get('qlen', 20);
  list = shuffle(list); if (n > 0) list = list.slice(0, n);
  questions = list.map(buildQ);
  begin();
}
// قبل أي اختبار: سؤال «هل تريد مؤقتاً؟» ثم العدّ التنازلي 3-2-1
let pendingBegin = false;
function begin(rs) {
  if (rs) return beginNow(rs);
  if (pendingBegin) return;
  pendingBegin = true; liveRun = false;
  askTimer(questions.length).then(async sec => {
    if (sec === null) return;
    if (sec > 0) await runCountdown();
    beginNow(null, sec);
  }).finally(() => { pendingBegin = false; });
}
function beginNow(rs, sec) {
  idx = rs ? rs.idx : 0; answers = rs ? rs.answers : {}; timedOut = false; completionReady = false; stopTimer(); stopSpeech(); startTs = Date.now() - (rs ? rs.elapsed * 1000 : 0); shownQ = null;
  if (!rs) { try { localStorage.removeItem('resume'); } catch {} store.set('resume_q', questions); }
  const cn = course === 'all' || course === 'weakall' ? null : course === 'wrong' ? 'أخطائي' : course === 'notebook' ? 'دفتري' : course === 'weak' ? 'أسئلتي الضعيفة' : String(course).startsWith('t:') ? topicName(subject.id, course.slice(2)) : course === 'challenge' ? 'تحدّي الأصدقاء' : (COURSES.find(c => c.id === course) || {}).name;
  $('current-subject-title').textContent = cn ? `${subject.name} - ${cn}` : subject.name;
  $('current-subject-icon').className = `w-10 h-10 md:w-12 md:h-12 shrink-0 rounded-xl flex items-center justify-center text-xl md:text-2xl text-white shadow bg-gradient-to-tr ${subject.color}`;
  $('current-subject-icon').innerHTML = `<i class="fa-solid ${subject.icon}"></i>`;
  $('total-q-label').textContent = $('total-q-num').textContent = questions.length;
  $('questions-navigator-bar').innerHTML = '';
  $('header-nav-btn').classList.remove('hidden');
  show('quiz-view'); pushView('quiz');
  counters(); renderQuestion();
  if (rs && rs.left != null) startTimer(Math.max(5, rs.left), rs.tt || rs.left);
  else if (sec > 0) startTimer(sec);
  else $('timer-box').classList.add('hidden');
  window.scrollTo({ top: 0 });
  saveResume();
}
const rb = q => buildQ({ q: q.text, opts: q.options, corr: q.correct, exp: q.exp, s: q.s, k: q.k, ctx: q.ctx, img: q.img, eimg: q.eimg, alt: q.alt });
function restartQuiz() { questions = shuffle(questions).map(rb); begin(); }
function retryWrong() {
  const w = questions.filter((q, i) => answers[i] !== undefined && answers[i] !== q.correct);
  if (!w.length) return;
  questions = shuffle(w).map(rb);
  begin();
}
function counters() {
  let c = 0, w = 0;
  for (const i in answers) answers[i] === questions[i].correct ? c++ : w++;
  $('live-correct-count').textContent = c; $('live-incorrect-count').textContent = w;
  $('quiz-progress').style.width = (questions.length ? Object.keys(answers).length / questions.length * 100 : 0) + '%';
}
// يفصل عنوان النص القرائي (Text 1 (...) – / Texte (...) –) عن نص السؤال ليظهر كشارة مستقلة
function splitLabel(t) {
  const m = String(t).match(/^([.?!"\s]*)((?:Texte?)\s*\d*\s*\([^)]*\))\s*[–-]\s*([\s\S]*)$/);
  return m ? { label: m[2], text: m[1] + m[3] } : { label: '', text: String(t) };
}
function renderQuestion(justAnswered) {
  const q = questions[idx], done = answers[idx] !== undefined;
  const fresh = shownQ !== q; shownQ = q;
  if (fresh) stopSpeech();
  $('current-q-num').textContent = idx + 1;
  const { label, text } = splitLabel(q.text);
  const lb = $('q-label');
  lb.classList.toggle('hidden', !label);
  lb.innerHTML = label ? `<i class="fa-solid fa-book-open"></i><span dir="ltr">${esc(label)}</span>` : '';
  const cx = $('q-ctx');
  cx.classList.toggle('hidden', !q.ctx);
  if (q.ctx) { cx.lastElementChild.innerHTML = rich(q.ctx); if (fresh) cx.open = false; }
  $('question-text').innerHTML = rich(text);
  const fgh = figHtml(q.img, q.alt), fg = $('q-figure');
  fg.classList.toggle('hidden', !fgh); fg.innerHTML = fgh;
  const lang = TTS_LANG[q.s || (subject && subject.id)], canSpeak = !!lang && 'speechSynthesis' in window;
  $('tts-btn').classList.toggle('hidden', !canSpeak);
  $('tts-ans-btn').classList.toggle('hidden', !(canSpeak && done && /_{2,}/.test(plain(text))));
  const card = $('q-card');
  if (fresh && !reduceMotion) { card.classList.remove('q-anim'); void card.offsetWidth; card.classList.add('q-anim'); }
  const box = $('options-container'); box.innerHTML = '';
  q.options.forEach((opt, i) => {
    const b = document.createElement('button');
    let cls = 'w-full text-right p-4 rounded-2xl border font-semibold text-sm md:text-base transition duration-200 flex items-center justify-between gap-3 ';
    let icon = '';
    if (done) {
      b.disabled = true;
      if (i === q.correct) { cls += 'opt-ok border-emerald-500 text-emerald-800 shadow-sm ' + (justAnswered ? 'pop' : ''); icon = '<i class="fa-solid fa-circle-check text-emerald-600 text-lg"></i>'; }
      else if (i === answers[idx]) { cls += 'opt-bad border-rose-500 text-rose-800 shadow-sm ' + (reduceMotion || !justAnswered ? '' : 'animate-shake'); icon = '<i class="fa-solid fa-circle-xmark text-rose-600 text-lg"></i>'; }
      else cls += 'bg-white border-slate-200 text-slate-500 opacity-75';
    } else {
      cls += 'bg-white border-slate-200 text-slate-700 hover:border-indigo-500 hover:bg-indigo-50/30 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600';
      b.onclick = () => selectAnswer(i);
      if (fresh && !reduceMotion) { cls += ' fade-up'; b.style.animationDelay = (i * 60) + 'ms'; }
    }
    b.className = cls;
    const LET = ['english', 'french'].includes(q.s || (subject && subject.id)) ? ['A', 'B', 'C', 'D', 'E', 'F'] : ['أ', 'ب', 'ج', 'د', 'هـ', 'و'];
    const bd = done && i === q.correct ? 'bg-emerald-500 text-white' : done && i === answers[idx] ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-600';
    b.insertAdjacentHTML('beforeend', `<span aria-hidden="true" class="opt-letter shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-black ${bd}">${LET[i] || i + 1}</span>`);
    const span = document.createElement('span'); span.dir = 'auto'; span.className = 'flex-1'; span.innerHTML = rich(opt);
    b.appendChild(span); b.insertAdjacentHTML('beforeend', icon);
    box.appendChild(b);
  });
  const ex = $('explanation');
  const hasEx = !!(q.exp || figHtml(q.eimg));
  ex.classList.toggle('hidden', !(done && hasEx));
  ex.classList.toggle('slide-down', !!(justAnswered && done && hasEx));
  ex.innerHTML = done && hasEx ? rich(q.exp || '') + figHtml(q.eimg, q.alt, true) : '';
  $('prev-btn').disabled = idx === 0;
  $('next-btn').innerHTML = idx === questions.length - 1 ? 'إنهاء الاختبار <i class="fa-solid fa-flag-checkered"></i>' : 'التالي <i class="fa-solid fa-arrow-left"></i>';
  updateNavigator(); updateNbBtn(); saveResume();
}
function selectAnswer(i) {
  if (answers[idx] !== undefined) return;
  answers[idx] = i;
  const q = questions[idx], ok = i === q.correct;
  trackAnswer(q, ok);
  counters(); renderQuestion(true);
}
function updateNavigator() {
  const bar = $('questions-navigator-bar');
  if (bar.children.length !== questions.length) {
    bar.innerHTML = '';
    questions.forEach((_, i) => { const b = document.createElement('button'); b.textContent = i + 1; b.onclick = () => goTo(i); bar.appendChild(b); });
  }
  const base = 'min-w-[2.75rem] h-11 px-3 rounded-xl font-bold text-sm transition flex items-center justify-center shrink-0 border ';
  questions.forEach((q, i) => {
    const a = answers[i];
    bar.children[i].className = base + (i === idx ? 'bg-indigo-600 text-white border-indigo-600 shadow-md scale-105'
      : a === undefined ? 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
      : a === q.correct ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-rose-50 text-rose-700 border-rose-300');
  });
  bar.children[idx]?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', inline: 'center', block: 'nearest' });
}
function goTo(i) { idx = i; renderQuestion(); }
function nextQuestion() { idx < questions.length - 1 ? goTo(idx + 1) : showCompletion(); }
function prevQuestion() { if (idx > 0) goTo(idx - 1); }

// ===== النتيجة =====
const RING_C = 326.73;
let lastResult = null;
async function shareOut({ text, title, file, url: u }) {
  const url = u || location.href.split(/[?#]/)[0], full = text + '\n' + url;
  try {
    if (file && navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title, text: full }); return; }
    if (navigator.share) { await navigator.share({ title, text, url }); return; }
  } catch (e) { if (e && e.name === 'AbortError') return; }
  try { await navigator.clipboard.writeText(full); toast('تم نسخ النص، يمكنك لصقه وإرساله لأصدقائك.'); }
  catch (e) { toast('تعذّرت المشاركة تلقائياً، انسخ النص يدوياً.'); }
}
function rrect(x, px, py, w, h, r) {
  x.beginPath(); x.moveTo(px + r, py); x.arcTo(px + w, py, px + w, py + h, r); x.arcTo(px + w, py + h, px, py + h, r);
  x.arcTo(px, py + h, px, py, r); x.arcTo(px, py, px + w, py, r); x.closePath();
}
async function resultCard(r) {
  try { await Promise.all([document.fonts.load('900 64px Cairo'), document.fonts.load('700 36px Cairo')]); } catch {}
  const W = 1080, H = 1080, c = document.createElement('canvas'); c.width = W; c.height = H;
  const x = c.getContext('2d'), col = pctColor(r.pct); x.textAlign = 'center'; x.textBaseline = 'alphabetic'; x.direction = 'rtl';
  const g = x.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#4f46e5'); g.addColorStop(1, '#2563eb');
  x.fillStyle = g; x.fillRect(0, 0, W, H);
  x.fillStyle = '#fff'; x.font = '900 52px Cairo, sans-serif'; x.fillText('منصة الاختبار السريع', W / 2, 110);
  x.fillStyle = 'rgba(255,255,255,.85)'; x.font = '700 32px Cairo, sans-serif'; x.fillText('شهادة التعليم الأساسي (التاسع) - سوريا', W / 2, 160);
  x.fillStyle = '#fff'; rrect(x, 90, 215, W - 180, 700, 56); x.fill();
  x.fillStyle = '#0f172a'; x.font = '900 60px Cairo, sans-serif'; x.fillText(r.name, W / 2, 315, W - 280);
  const cy = 535, R = 140;
  x.lineWidth = 30; x.lineCap = 'round'; x.strokeStyle = '#e2e8f0'; x.beginPath(); x.arc(W / 2, cy, R, 0, Math.PI * 2); x.stroke();
  if (r.pct > 0) { x.strokeStyle = col; x.beginPath(); x.arc(W / 2, cy, R, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * r.pct / 100); x.stroke(); }
  x.fillStyle = col; x.direction = 'ltr'; x.font = '900 100px Cairo, sans-serif'; x.fillText(r.pct + '%', W / 2, cy + 36); x.direction = 'rtl';
  x.fillStyle = '#475569'; x.font = '700 44px Cairo, sans-serif'; x.fillText(`${r.correct} صحيحة من ${r.total}`, W / 2, 785);
  x.fillStyle = col; x.font = '900 46px Cairo, sans-serif';
  x.fillText(r.pct >= 90 ? 'نتيجة ممتازة 🏆' : r.pct >= 70 ? 'نتيجة جيدة 👏' : r.pct >= 50 ? 'في منتصف الطريق 💪' : 'أحتاج مراجعة إضافية 📚', W / 2, 865);
  x.fillStyle = 'rgba(255,255,255,.9)'; x.font = '700 34px Cairo, sans-serif'; x.fillText('جرّب أنت أيضاً وتحدّ نفسك!', W / 2, 990);
  return new Promise(res => c.toBlob(res, 'image/png'));
}
async function shareResult() {
  if (!lastResult) return;
  const r = lastResult, btn = $('share-btn');
  const text = `حصلت على ${r.pct}% (${r.correct} من ${r.total}) في ${r.name} على منصة الاختبار السريع لشهادة التاسع. جرّب أنت أيضاً!`;
  let file = null;
  if (btn) btn.disabled = true;
  try { const blob = await resultCard(r); if (blob) file = new File([blob], 'نتيجتي.png', { type: 'image/png' }); } catch {}
  if (btn) btn.disabled = false;
  await shareOut({ text, title: 'نتيجتي في منصة الاختبار السريع', file });
}
const pctColor = p => p >= 70 ? '#10b981' : p >= 50 ? '#f59e0b' : '#f43f5e';
function fmtDur(sec) { const m = Math.floor(sec / 60), r = sec % 60; return m ? `${m} د ${String(r).padStart(2, '0')} ث` : `${r} ث`; }
function showCompletion() {
  stopTimer(); stopSpeech(); clearResume();
  const wasLive = liveRun; reportLive();
  const total = questions.length;
  const answered = Object.keys(answers).length;
  const correct = questions.filter((q, i) => answers[i] === q.correct).length;
  const wrong = answered - correct, skipped = total - answered, pct = total ? Math.round(correct / total * 100) : 0;
  const sec = Math.max(1, Math.round((Date.now() - startTs) / 1000));
  $('final-total').textContent = total; $('final-correct').textContent = correct; $('final-wrong').textContent = wrong;
  $('final-skipped').textContent = skipped; $('final-time').textContent = fmtDur(sec);
  $('final-percent').textContent = pct + '%';
  $('final-msg').textContent = (pct >= 90 ? 'نتيجة ممتازة، استمر على هذا المستوى.' : pct >= 70 ? 'نتيجة جيدة، راجع الأسئلة الخاطئة لتثبّت المعلومة.' : pct >= 50 ? 'أنت في منتصف الطريق، أعد الأسئلة الخاطئة حتى تتقنها.' : 'تحتاج مراجعة إضافية للمادة، ثم أعد المحاولة.')
    + (timedOut ? ' انتهى الوقت المحدد للاختبار.' : '') + (skipped ? ` لم تجب عن ${skipped} سؤال.` : '');
  const col = pctColor(pct);
  $('final-percent').style.color = col;
  const ic = $('final-icon');
  ic.style.color = col; ic.style.background = col + '22';
  ic.innerHTML = `<i class="fa-solid ${pct >= 90 ? 'fa-trophy' : pct >= 70 ? 'fa-award' : pct >= 50 ? 'fa-thumbs-up' : 'fa-book-open-reader'}"></i>`;
  const ring = $('final-ring');
  ring.setAttribute('stroke', col); ring.setAttribute('stroke-dashoffset', RING_C);
  $('retry-wrong-btn').classList.toggle('hidden', wrong === 0);
  const special = SPECIAL.includes(course) || String(course).startsWith('t:');
  let cmp = '';
  if (subject) {
    let wr = store.get('wrong', []);
    questions.forEach((q, i) => {
      if (answers[i] === undefined) return;
      const sid = q.s || subject.id;
      wr = wr.filter(w => !(w.s === sid && w.q === q.text));
      if (answers[i] !== q.correct) wr.push({ s: sid, q: q.text, opts: q.options, corr: q.correct, exp: q.exp, ...figs(q) });
    });
    store.set('wrong', wr.slice(-300));
  }
  const stats = store.get('stats', {});
  if (answered === total && subject && !special) {
    const key = statKey(), prev = stats[key];
    if (prev) cmp = pct > prev.best ? `رقم قياسي جديد! كان أفضل نتيجة سابقة ${prev.best}%` : pct === prev.best ? `تعادلت مع أفضل نتيجة سابقة (${prev.best}%)` : `أفضل نتيجة سابقة: ${prev.best}%`;
    stats[key] = { best: Math.max(pct, prev ? prev.best : 0), last: pct, date: new Date().toISOString().slice(0, 10) };
    store.set('stats', stats);
  }
  if (answered > 0 && subject) {
    const h = store.get('hist', []);
    h.push({ s: subject.id, c: course, pct, ok: correct, n: total, d: Date.now(), sec });
    store.set('hist', h.slice(-300));
  }
  const liveShown = !!(live && live.reported && course === 'challenge');
  $('live-board').classList.toggle('hidden', !liveShown);
  $('restart-btn').classList.toggle('hidden', liveShown);
  if (liveShown) { cmp = live.over ? '' : 'بانتظار انتهاء بقية الزملاء...'; renderLiveBoard(); }
  const cm = $('final-compare');
  cm.classList.toggle('hidden', !cmp); cm.textContent = cmp;
  lastResult = { pct, correct, total, name: subject ? subject.name : '' };
  renderWrongReview(); completionReady = true; show('completion-view'); pushView('completion');
  if (pct >= 80 && answered >= Math.min(total, 5) && !reduceMotion && settings.effects && window.confetti) setTimeout(() => { confetti({ particleCount: 140, spread: 80, origin: { y: 0.5 } }); confetti({ particleCount: 60, angle: 60, spread: 55, origin: { x: 0, y: 0.7 } }); confetti({ particleCount: 60, angle: 120, spread: 55, origin: { x: 1, y: 0.7 } }); }, 350);
  window.scrollTo({ top: 0 });
  requestAnimationFrame(() => requestAnimationFrame(() => ring.setAttribute('stroke-dashoffset', RING_C * (1 - pct / 100))));
}
function renderWrongReview() {
  const wrong = questions.map((q, i) => i).filter(i => answers[i] !== undefined && answers[i] !== questions[i].correct);
  const box = $('wrong-review');
  if (!Object.keys(answers).length) { box.innerHTML = '<div class="bg-slate-50 border border-slate-200 text-slate-600 rounded-2xl p-4 text-sm font-bold text-center">لم تُجب عن أي سؤال.</div>'; return; }
  if (!wrong.length) { box.innerHTML = '<div class="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl p-4 text-sm font-bold text-center"><i class="fa-solid fa-star ml-1"></i> ممتاز! لا توجد أي إجابة خاطئة.</div>'; return; }
  box.innerHTML = `<h4 class="text-lg font-black text-slate-900 flex items-center gap-2"><i class="fa-solid fa-circle-xmark text-rose-600"></i> الأسئلة التي أخطأت فيها (${wrong.length})</h4>` +
    wrong.map(i => { const q = questions[i]; return `
    <div class="bg-rose-50/40 border border-rose-100 rounded-2xl p-4 space-y-3">
      <div class="flex items-start gap-3"><span class="shrink-0 bg-rose-100 text-rose-700 text-xs font-black rounded-lg px-2.5 py-1">${i + 1}</span>
        <p class="font-bold text-slate-900 text-sm md:text-base leading-relaxed">${rich(q.text)}</p></div>${figHtml(q.img, q.alt, true)}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm font-semibold">
        <div class="bg-white border border-rose-300 text-rose-700 rounded-xl p-3"><span class="block text-xs opacity-70">إجابتك</span><span dir="auto">${rich(q.options[answers[i]])}</span></div>
        <div class="bg-white border border-emerald-300 text-emerald-700 rounded-xl p-3"><span class="block text-xs opacity-70">الإجابة الصحيحة</span><span dir="auto">${rich(q.options[q.correct])}</span></div>
      </div>${q.exp ? `<p class="text-xs text-slate-600 leading-relaxed">${rich(q.exp)}</p>` : ''}${figHtml(q.eimg, q.alt, true)}
    </div>`; }).join('');
}

// ===== التشغيل =====
document.addEventListener('keydown', e => {
  if (!$('login-view').classList.contains('hidden') || $('quiz-view').classList.contains('hidden')) return;
  if (e.key === 'ArrowLeft') nextQuestion();
  else if (e.key === 'ArrowRight') prevQuestion();
  else if (/^[1-4]$/.test(e.key) && questions[idx] && +e.key <= questions[idx].options.length) selectAnswer(+e.key - 1);
});
window.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('bound_device_code')) unlock();
  $('login-btn').addEventListener('click', doLogin);
  $('access-code-input').addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
  $('recover-btn').addEventListener('click', () => {
    const code = $('access-code-input').value.trim();
    if (!code) return loginMsg('اكتب كودك في الخانة أعلاه أولاً، ثم اضغط «استعادة الدخول».', 'text-orange-600');
    const msg = `مرحباً، أرغب في استعادة الدخول إلى منصة الاختبار السريع.\nالكود: ${code}\nالسبب: غيّرت جهازي أو مسحت بيانات المتصفح.`;
    try { navigator.clipboard.writeText(msg).catch(() => {}); } catch {}
    window.open('https://t.me/Yz044?text=' + encodeURIComponent(msg), '_blank', 'noopener');
    loginMsg('فتحنا لك المحادثة على تيليجرام. إن لم تظهر الرسالة جاهزة فقد نسخناها، ألصقها وأرسلها.', 'text-blue-600');
  });
  history.replaceState({ v: 'home' }, '');
  initHome(); updateNbBadge();
  if (localStorage.getItem('bound_device_code')) checkChallenge();
});

// ===== الخيارات والوضع الليلي =====
let settings = Object.assign({ effects: true, timer: false, font: 1 }, store.get('settings', {}));
const FONTS = [90, 100, 115, 130];
if (!FONTS[settings.font]) settings.font = 1;
const saveSettings = () => store.set('settings', settings);
function setSwitch(id, on) {
  const b = $(id);
  b.setAttribute('aria-checked', on);
  b.classList.toggle('bg-indigo-600', on); b.classList.toggle('bg-slate-300', !on);
  b.firstElementChild.style.transform = on ? 'translateX(-1.25rem)' : 'none';
}
function applyTheme(dark, persist) {
  document.documentElement.classList.toggle('dark', dark);
  $('theme-btn').innerHTML = `<i class="fa-solid ${dark ? 'fa-sun' : 'fa-moon'}"></i>`;
  $('theme-btn').setAttribute('aria-label', dark ? 'تفعيل الوضع النهاري' : 'تفعيل الوضع الليلي');
  document.querySelector('meta[name="theme-color"]').content = dark ? '#0f172a' : '#4f46e5';
  setSwitch('sw-dark', dark);
  if (persist) try { localStorage.setItem('theme', dark ? 'dark' : 'light'); } catch {}
}
function applyFont() {
  document.documentElement.style.fontSize = FONTS[settings.font] + '%';
  $('font-label').textContent = FONTS[settings.font] + '%';
  $('font-minus').disabled = settings.font === 0;
  $('font-plus').disabled = settings.font === FONTS.length - 1;
}
function refreshCodeRow() {
  let c = ''; try { c = localStorage.getItem('bound_device_code') || ''; } catch {}
  $('code-row').classList.toggle('hidden', !c);
  if (c) $('code-text').textContent = c.length > 6 ? c.slice(0, 3) + '••••' + c.slice(-3) : '••••••';
}
function toggleMenu(open) {
  const m = $('options-menu');
  open = open ?? m.classList.contains('hidden');
  if (open) refreshCodeRow();
  m.classList.toggle('hidden', !open);
  $('menu-btn').setAttribute('aria-expanded', open);
}
document.addEventListener('DOMContentLoaded', () => {
  const flip = () => applyTheme(!document.documentElement.classList.contains('dark'), true);
  applyTheme(document.documentElement.classList.contains('dark'), false);
  setSwitch('sw-effects', settings.effects); applyFont();
  $('theme-btn').onclick = $('sw-dark').onclick = flip;
  $('sw-effects').onclick = () => { settings.effects = !settings.effects; setSwitch('sw-effects', settings.effects); saveSettings(); };
  $('font-minus').onclick = () => { settings.font--; applyFont(); saveSettings(); };
  $('font-plus').onclick = () => { settings.font++; applyFont(); saveSettings(); };
  $('reset-progress').onclick = () => {
    if (confirm('سيتم مسح أفضل نتائجك في كل المواد. هل تريد المتابعة؟')) { store.set('stats', {}); initHome(); toggleMenu(false); }
  };
  $('copy-code').onclick = async () => {
    let c = ''; try { c = localStorage.getItem('bound_device_code') || ''; } catch {}
    if (!c) return;
    try { await navigator.clipboard.writeText(c); toast('تم نسخ كودك. احتفظ به في مكان آمن لتستعيد دخولك إن غيّرت جهازك.'); } catch { toast('تعذّر النسخ تلقائياً.'); }
  };
  $('menu-btn').onclick = e => { e.stopPropagation(); toggleMenu(); };
  document.addEventListener('click', e => { if (!$('options-menu').contains(e.target)) toggleMenu(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') toggleMenu(false); });
});

// ===== البحث وتحديث أعداد الأسئلة =====
const norm = s => plain(s).toLowerCase().replace(/[\u064B-\u065F\u0670\u0640]/g, '').replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه');
let searchIdx = null, searchTimer = null;
async function buildSearchIdx() {
  if (searchIdx) return searchIdx;
  const banks = await Promise.all(SUBJECTS.map(s => loadBank(s.id).then(b => { setCount(s.id, b.length); return b; })));
  return searchIdx = banks.flatMap((b, k) => b.map(q => ({ s: SUBJECTS[k].id, q, n: norm(q.q + ' ' + q.opts.join(' ')) })));
}
async function runSearch() {
  const v = norm($('search-input').value.trim()), box = $('search-results');
  const hideRest = on => ['subjects-grid', 'notebook-entry'].forEach(i => $(i).style.display = on ? 'none' : '');
  if (v.length < 2) { box.classList.add('hidden'); hideRest(false); return; }
  hideRest(true); box.classList.remove('hidden');
  box.innerHTML = '<p class="text-center text-sm text-slate-500 font-bold">جارٍ البحث...</p>';
  let idxs; try { idxs = await buildSearchIdx(); } catch { box.innerHTML = '<p class="text-center text-sm text-rose-600 font-bold">تعذّر تحميل الأسئلة. تحقق من الاتصال.</p>'; return; }
  if (norm($('search-input').value.trim()) !== v) return;
  const hits = idxs.filter(x => x.n.includes(v)), shown = hits.slice(0, 30);
  if (!hits.length) { box.innerHTML = '<p class="text-center text-sm text-slate-500 font-bold">لا توجد نتائج مطابقة.</p>'; return; }
  box.innerHTML = `<p class="text-xs text-slate-500 font-bold">${hits.length} نتيجة${hits.length > 30 ? ' (يظهر أول 30)' : ''}</p>` + shown.map((x, i) => {
    const sub = SUBJECTS.find(s => s.id === x.s), q = x.q;
    return `<div class="bg-white border border-slate-100 rounded-2xl p-4 space-y-3 shadow-sm">
      <div class="flex items-center justify-between gap-2"><span class="bg-indigo-50 text-indigo-700 text-xs font-black rounded-lg px-2.5 py-1">${esc(sub.name)}</span>
      <button type="button" data-sr="${i}" class="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 min-h-[40px] rounded-xl text-xs font-bold transition"></button></div>
      <p class="font-bold text-slate-900 text-sm md:text-base leading-relaxed" dir="auto">${rich(q.q)}</p>
      <div class="bg-emerald-50 border border-emerald-500 text-emerald-800 rounded-xl p-3 text-sm font-semibold" dir="auto"><i class="fa-solid fa-circle-check ml-1"></i>${rich(q.opts[q.corr])}</div>
      ${q.exp ? `<p class="text-xs text-slate-600 leading-relaxed">${rich(q.exp)}</p>` : ''}</div>`;
  }).join('');
  const paint = (b, x) => b.innerHTML = nbHas(x.s, x.q.q) ? '<i class="fa-solid fa-bookmark"></i> في دفتري' : '<i class="fa-regular fa-bookmark"></i> إضافة إلى دفتري';
  box.querySelectorAll('[data-sr]').forEach(b => {
    const x = shown[+b.dataset.sr]; paint(b, x);
    b.onclick = () => {
      let l = nbGet();
      if (nbHas(x.s, x.q.q)) l = l.filter(n => !nbSame(n, x.s, x.q.q));
      else l.push({ s: x.s, q: x.q.q, opts: x.q.opts, corr: x.q.corr, exp: x.q.exp || '', ...figs(x.q), t: Date.now() });
      store.set('notebook', l.slice(-NB_MAX)); paint(b, x); updateNbBadge();
    };
  });
}
window.addEventListener('DOMContentLoaded', () => {
  $('search-input').addEventListener('input', () => { clearTimeout(searchTimer); searchTimer = setTimeout(runSearch, 250); });
  const idle = window.requestIdleCallback || (f => setTimeout(f, 1500));
  idle(() => SUBJECTS.reduce((p, s) => p.then(() => loadBank(s.id).then(b => setCount(s.id, b.length)).catch(() => {})), Promise.resolve()));
});


// ===== أدوات مساعدة للإضافات الجديدة =====
const qh = t => { let h = 5381; t = String(t); for (let i = 0; i < t.length; i++) h = ((h * 33) ^ t.charCodeAt(i)) >>> 0; return h.toString(36); };
const mastGet = () => store.get('mast', {});
const subDone = sid => Object.keys(mastGet()[sid] || {}).length;
function courseDone(c) {
  if (SPECIAL.includes(c.id)) return null;
  const m = mastGet()[subject.id] || {};
  return bank.filter(q => (c.id === 'all' || inCourse(q, c.id)) && m[qh(q.q)]).length;
}
function progHtml(done, total, color) {
  if (done === null || !total) return '<div class="mt-4"></div>';
  done = Math.min(done, total);
  const p = Math.round(done / total * 100);
  return `<div class="mt-4 space-y-1.5">
    <div class="flex items-center justify-between text-[11px] font-bold text-slate-500"><span>أنجزت ${done} من ${total} سؤال</span><span>${p}%</span></div>
    <div class="h-2 rounded-full bg-slate-100 overflow-hidden" role="progressbar" aria-label="نسبة الإنجاز" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${p}"><div class="h-full rounded-full bg-gradient-to-l ${color} transition-all duration-700" style="width:${p}%"></div></div></div>`;
}
const histGet = () => store.get('hist', []);
const histOf = sid => histGet().filter(x => x.s === sid);
const barColorCls = p => p >= 70 ? 'bg-emerald-500' : p >= 50 ? 'bg-amber-500' : 'bg-rose-500';
const barHtml = st => `<div class="mt-4 h-1.5 rounded-full bg-slate-100 overflow-hidden"><div class="h-full rounded-full ${st ? barColorCls(st.best) : 'bg-indigo-600'}" style="width:${st ? st.best : 0}%"></div></div>`;
function toast(msg) {
  const t = $('toast'); if (!t) return;
  t.textContent = msg; t.classList.remove('hidden');
  clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.add('hidden'), 4000);
}
function spark(vals, h = 44) {
  if (!vals.length) return '';
  const w = vals.length * 16;
  const bars = vals.map((v, i) => {
    const bh = Math.max(4, Math.round(v / 100 * h));
    return `<rect x="${i * 16 + 2}" y="${h - bh}" width="12" height="${bh}" rx="3" fill="${pctColor(v)}"><title>${v}%</title></rect>`;
  }).join('');
  return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="آخر النتائج: ${vals.join('%، ')}%">${bars}</svg>`;
}
const avg = a => a.length ? Math.round(a.reduce((x, y) => x + y, 0) / a.length) : 0;
function courseLabel(sid, c) {
  if (c === 'all') return 'كل الأسئلة';
  if (c === 'wrong') return 'أخطائي';
  if (c === 'notebook') return 'دفتري';
  if (c === 'weak' || c === 'weakall') return 'أسئلتي الضعيفة';
  if (c === 'challenge') return 'تحدّي الأصدقاء';
  if (String(c).startsWith('t:')) return topicName(sid, c.slice(2));
  return (COURSES.find(x => x.id === c) || {}).name || c;
}

// ===== الهدف اليومي والمواظبة =====
const dayStr = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const yesterdayStr = () => { const d = new Date(); d.setDate(d.getDate() - 1); return dayStr(d); };
function dailyGet() { const d = store.get('daily', {}); return d.d === dayStr() ? d : { d: dayStr(), n: 0 }; }
function streakInfo() {
  const s = store.get('streak', { n: 0, last: '' });
  return { n: (s.last === dayStr() || s.last === yesterdayStr()) ? s.n : 0, last: s.last };
}

// ===== الأسئلة الضعيفة (أخطأ فيها الطالب أكثر من مرة) + تسجيل الإجابات =====
const MISS_MAX = 400;
const missGet = () => store.get('miss', {});
const weakList = () => Object.values(missGet()).filter(m => m.n >= 2);
function trackAnswer(q, ok) {
  const sid = q.s || (subject && subject.id) || '';
  const miss = missGet(), key = sid + '|' + q.text, cur = miss[key];
  if (!ok) {
    delete miss[key];
    miss[key] = { s: sid, q: q.text, opts: q.options, corr: q.correct, exp: q.exp || '', k: q.k || '', ...figs(q), n: (cur ? cur.n : 0) + 1 };
  } else if (cur) { cur.n--; if (cur.n <= 0) delete miss[key]; }
  const keys = Object.keys(miss);
  if (keys.length > MISS_MAX) keys.slice(0, keys.length - MISS_MAX).forEach(k => delete miss[k]);
  store.set('miss', miss);
  const mast = mastGet(), hh = qh(q.text); (mast[sid] = mast[sid] || {});
  if (ok) mast[sid][hh] = 1; else delete mast[sid][hh];
  store.set('mast', mast);
  const goal = (settings && settings.goal) || 10;
  const d = dailyGet(); d.n++; store.set('daily', d);
  const dl = store.get('dayLog', {}), dk = dayStr(); dl[dk] = dl[dk] || { n: 0, ok: 0 }; dl[dk].n++; if (ok) dl[dk].ok++;
  const dks = Object.keys(dl).sort(); if (dks.length > 60) dks.slice(0, dks.length - 60).forEach(k => delete dl[k]);
  store.set('dayLog', dl);
  const st = store.get('streak', { n: 0, last: '' });
  if (d.n >= goal && st.last !== dayStr()) {
    store.set('streak', { n: (st.last === yesterdayStr() ? st.n : 0) + 1, last: dayStr() });
    toast('أحسنت! حققت هدفك اليومي 🎉');
  }
}
// ===== نوافذ مساعدة: المؤقّت والعدّ التنازلي =====
function ovl(id, z) {
  const old = $(id); if (old) old.remove();
  const el = document.createElement('div'); el.id = id;
  el.className = `fixed inset-0 ${z || 'z-40'} bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto`;
  document.body.appendChild(el); return el;
}
const dlg = (inner, label) => `<div role="dialog" aria-modal="true" aria-label="${label}" class="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 my-auto">${inner}</div>`;
const btnCls = {
  pri: 'w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold text-sm shadow-md transition',
  sec: 'w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-bold text-sm transition',
  warn: 'w-full bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-xl font-bold text-sm shadow-md transition',
  bad: 'w-full bg-rose-50 hover:bg-rose-100 text-rose-700 py-3 rounded-xl font-bold text-sm transition'
};
const inpCls = 'w-full rounded-xl border border-slate-300 px-3 py-2.5 bg-white text-slate-800 text-sm font-semibold focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none';

// يعيد: عدد الثواني (0 = بدون مؤقّت) أو null عند الإلغاء
function askTimer(n) {
  return new Promise(resolve => {
    const rec = Math.max(1, Math.round(n * SECS_PER_Q / 60));
    const el = ovl('timer-modal', 'z-50');
    let done = false;
    const onKey = e => { if (e.key === 'Escape') fin(null); };
    const fin = v => { if (done) return; done = true; document.removeEventListener('keydown', onKey); el.remove(); resolve(v); };
    document.addEventListener('keydown', onKey);
    el.onclick = e => { if (e.target === el) fin(null); };
    const step1 = () => {
      el.innerHTML = dlg(`
        <div class="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-3xl"><i class="fa-regular fa-clock"></i></div>
        <h2 class="text-xl font-black text-slate-900 text-center">هل تريد الاختبار بمؤقّت؟</h2>
        <p class="text-sm text-slate-600 text-center leading-relaxed">${n} سؤالاً. المؤقّت يحاكي جو الامتحان الحقيقي.</p>
        <div class="space-y-2"><button type="button" id="tm-yes" class="${btnCls.pri}"><i class="fa-solid fa-stopwatch ml-1"></i> نعم، بمؤقّت</button>
        <button type="button" id="tm-no" class="${btnCls.sec}">لا، ابدأ بدون مؤقّت</button></div>
        <button type="button" id="tm-x" class="w-full text-xs font-bold text-slate-500 hover:text-slate-700 py-1">إلغاء</button>`, 'اختيار المؤقّت');
      $('tm-yes').onclick = step2; $('tm-no').onclick = () => fin(0); $('tm-x').onclick = () => fin(null); $('tm-yes').focus();
    };
    const step2 = () => {
      el.innerHTML = dlg(`
        <h2 class="text-xl font-black text-slate-900 text-center">كم دقيقة تريد؟</h2>
        <p class="text-xs text-slate-500 text-center">المقترح: ${rec} دقيقة لـ ${n} سؤال</p>
        <div class="flex flex-wrap justify-center gap-2" id="tm-chips">${[5, 10, 15, 20, 30, 45, 60].map(m => `<button type="button" data-m="${m}" class="px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-bold hover:bg-indigo-50 transition">${m}</button>`).join('')}</div>
        <div class="flex items-center gap-2"><label for="tm-min" class="text-sm font-bold text-slate-700 shrink-0">المدة بالدقائق</label><input id="tm-min" type="number" min="1" max="180" inputmode="numeric" value="${rec}" class="${inpCls} text-center" dir="ltr"></div>
        <p id="tm-err" class="text-xs font-bold text-rose-600 text-center min-h-[1rem]"></p>
        <div class="flex gap-3"><button type="button" id="tm-back" class="flex-1 ${btnCls.sec}">رجوع</button><button type="button" id="tm-go" class="flex-1 ${btnCls.pri}"><i class="fa-solid fa-play ml-1"></i> ابدأ</button></div>`, 'تحديد مدة الاختبار');
      const inp = $('tm-min');
      el.querySelectorAll('[data-m]').forEach(b => b.onclick = () => { inp.value = b.dataset.m; });
      $('tm-back').onclick = step1;
      const go = () => { const m = Math.round(+inp.value); if (!(m >= 1 && m <= 180)) { $('tm-err').textContent = 'أدخل مدة بين 1 و180 دقيقة.'; return; } fin(m * 60); };
      $('tm-go').onclick = go; inp.onkeydown = e => { if (e.key === 'Enter') go(); };
      inp.focus(); inp.select();
    };
    step1();
  });
}
(function () {
  const st = document.createElement('style');
  st.textContent = `@keyframes chPop{0%{transform:scale(.3);opacity:0}30%{transform:scale(1.15);opacity:1}70%{transform:scale(1);opacity:1}100%{transform:scale(1.7);opacity:0}}
@keyframes chRing{0%{transform:scale(.6);opacity:.55}100%{transform:scale(2.2);opacity:0}}
.ch-num{animation:chPop 1s ease-out both}.ch-ring{animation:chRing 1s ease-out both}
@media (prefers-reduced-motion:reduce){.ch-num,.ch-ring{animation:none}}`;
  document.head.appendChild(st);
})();
function runCountdown() {
  return new Promise(resolve => {
    const el = document.createElement('div');
    el.className = 'fixed inset-0 z-[80] flex flex-col items-center justify-center text-white select-none';
    el.style.background = 'linear-gradient(135deg,#4f46e5,#2563eb 55%,#0ea5e9)';
    el.setAttribute('role', 'alert'); el.setAttribute('aria-live', 'assertive');
    el.innerHTML = `<p class="text-lg font-bold opacity-90 mb-6">استعدّ، سيبدأ الاختبار الآن</p>
      <div class="relative w-56 h-56 flex items-center justify-center"><span id="cd-ring" class="absolute inset-0 rounded-full border-4 border-white/60"></span>
      <span id="cd-num" dir="ltr" class="font-black leading-none" style="font-size:9rem"></span></div>`;
    document.body.appendChild(el);
    const seq = ['3', '2', '1', 'انطلق!'];
    let i = 0;
    const tick = () => {
      if (i >= seq.length) { el.remove(); return resolve(); }
      const n = $('cd-num'), r = $('cd-ring');
      n.textContent = seq[i]; n.style.fontSize = i === 3 ? '4.5rem' : '9rem';
      [n, r].forEach(x => { x.classList.remove('ch-num', 'ch-ring'); void x.offsetWidth; });
      n.classList.add('ch-num'); r.classList.add('ch-ring');
      i++; setTimeout(tick, i === 4 ? 700 : 1000);
    };
    tick();
  });
}

// ===== تحدّي الأصدقاء المباشر (عدة لاعبين، يبدأ بعد موافقة الجميع) =====
let live = null, liveRun = false;
const CH_MAX_GUESTS = 5, CH_COLL = 'challenges';
const chPid = () => { let p = ''; try { p = localStorage.getItem('ch_pid') || ''; } catch {} if (!/^p[a-z0-9]{8,}$/.test(p)) { p = 'p' + Math.random().toString(36).slice(2, 12).padEnd(10, '0'); try { localStorage.setItem('ch_pid', p); } catch {} } return p; };
const chDoneHas = id => store.get('ch_done', []).includes(id);
const chMarkDone = id => { const l = store.get('ch_done', []); if (!l.includes(id)) l.push(id); store.set('ch_done', l.slice(-60)); };
const chLink = id => location.href.split(/[?#]/)[0] + '#ch=' + id;
const chRef = id => window.fb.doc(window.fb.db, CH_COLL, id);
const newChId = () => { const a = 'abcdefghjkmnpqrstuvwxyz23456789'; let r = ''; const u = new Uint8Array(8); (crypto.getRandomValues ? crypto.getRandomValues(u) : u.forEach((_, i) => u[i] = Math.random() * 256)); for (const b of u) r += a[b % a.length]; return r; };
const fbOK = () => { if (!window.fb) { toast('تعذّر الاتصال بخدمة التحدّي. تأكد من الإنترنت وأعد تحميل الصفحة.'); return false; } return true; };
const mins = d => Math.round(d.secs / 60);
const minLbl = m => m === 1 ? 'دقيقة واحدة' : m === 2 ? 'دقيقتان' : m <= 10 ? m + ' دقائق' : m + ' دقيقة';

function openChallengeSetup(defSid) {
  if (!fbOK()) return;
  const sid0 = SUBJECTS.some(s => s.id === defSid) ? defSid : 'science';
  const el = ovl('ch-setup');
  const close = () => el.remove();
  el.onclick = e => { if (e.target === el) close(); };
  const opt = (arr, d, f) => arr.map(v => `<option value="${v}" ${v === d ? 'selected' : ''}>${f ? f(v) : v}</option>`).join('');
  el.innerHTML = dlg(`
    <div class="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center text-2xl shadow-md"><i class="fa-solid fa-bolt"></i></div>
    <h2 class="text-xl font-black text-slate-900 text-center">تحدّي الأصدقاء</h2>
    <p class="text-xs text-slate-600 text-center leading-relaxed">الأسئلة وترتيب الخيارات متطابقة للجميع، ولا يبدأ التحدّي إلا بعد قبول كل الزملاء.</p>
    <div class="space-y-3 text-sm font-bold text-slate-700">
      <label class="block">اسمك<input id="chs-name" maxlength="20" class="${inpCls} mt-1" placeholder="مثال: يوسف" value="${esc(store.get('ch_name', ''))}"></label>
      <label class="block">المادة<select id="chs-sub" class="${inpCls} mt-1">${SUBJECTS.map(s => `<option value="${s.id}" ${s.id === sid0 ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}</select></label>
      <div class="grid grid-cols-3 gap-2">
        <label class="block">الأسئلة<input id="chs-n" type="number" min="3" max="50" inputmode="numeric" value="10" dir="ltr" class="${inpCls} mt-1 text-center"></label>
        <label class="block">الوقت (د)<input id="chs-min" type="number" min="1" max="180" inputmode="numeric" value="5" dir="ltr" class="${inpCls} mt-1 text-center"></label>
        <label class="block">الزملاء<select id="chs-need" class="${inpCls} mt-1">${opt([1, 2, 3, 4, 5], 1)}</select></label>
      </div>
    </div>
    <p id="chs-err" class="text-xs font-bold text-rose-600 text-center min-h-[1rem]"></p>
    <div class="flex gap-3"><button type="button" id="chs-x" class="flex-1 ${btnCls.sec}">إلغاء</button><button type="button" id="chs-go" class="flex-1 ${btnCls.warn}"><i class="fa-solid fa-paper-plane ml-1"></i> إنشاء ومشاركة</button></div>`, 'إنشاء تحدّي');
  $('chs-x').onclick = close;
  $('chs-go').onclick = async () => {
    const name = $('chs-name').value.trim().slice(0, 20);
    if (!name) { $('chs-err').textContent = 'اكتب اسمك ليظهر لزملائك.'; $('chs-name').focus(); return; }
    const n = Math.round(+$('chs-n').value), mn = Math.round(+$('chs-min').value);
    if (!(n >= 3 && n <= 50)) { $('chs-err').textContent = 'عدد الأسئلة بين 3 و50.'; return; }
    if (!(mn >= 1 && mn <= 180)) { $('chs-err').textContent = 'الوقت بين 1 و180 دقيقة.'; return; }
    $('chs-go').disabled = true; $('chs-err').textContent = 'جارٍ إنشاء التحدّي...';
    store.set('ch_name', name);
    const ok = await createChallenge({ name, sid: $('chs-sub').value, n, min: mn, need: Math.min(CH_MAX_GUESTS, +$('chs-need').value) });
    if (ok) close(); else { $('chs-go').disabled = false; $('chs-err').textContent = ''; }
  };
  $('chs-name').focus();
}
async function createChallenge(o) {
  let b; try { b = await loadBank(o.sid); } catch { toast('تعذّر تحميل أسئلة المادة. تحقق من الاتصال.'); return false; }
  const seen = new Set(), list = [];
  shuffle(b).forEach(q => { const h = qh(q.q); if (!seen.has(h) && list.length < o.n) { seen.add(h); list.push(q); } });
  if (list.length < Math.min(o.n, 3)) { toast('عدد أسئلة هذه المادة قليل.'); return false; }
  const pid = chPid(), id = newChId();
  try {
    await window.fb.setDoc(chRef(id), {
      v: 1, sid: o.sid, seed: (Math.random() * 2 ** 30 | 0) + 1, h: list.map(q => qh(q.q)), n: list.length, secs: o.min * 60, need: o.need,
      status: 'waiting', hostId: pid, createdAt: window.fb.serverTimestamp(),
      players: { [pid]: { name: o.name, role: 'host', st: 'accepted', done: false } }
    });
  } catch (e) { console.error(e); toast('تعذّر إنشاء التحدّي. تأكد من الإنترنت ومن نشر قواعد Firestore الجديدة.'); return false; }
  openLive(id); return true;
}
function closeModal(id) { const m = $(id); if (m) m.remove(); }
function openLive(id) {
  closeLive();
  live = { id, pid: chPid(), unsub: null, d: null, started: false, reported: false, over: false, starting: false, tick: null };
  live.unsub = window.fb.onSnapshot(chRef(id), s => {
    if (!live || live.id !== id) return;
    if (!s.exists()) { toast('هذا التحدّي لم يعد موجوداً.'); closeLive(); return; }
    live.d = s.data(); onLiveUpdate();
  }, () => toast('انقطع الاتصال بالتحدّي، تحقق من الإنترنت.'));
}
function closeLive() {
  if (live) { if (live.unsub) live.unsub(); if (live.tick) clearInterval(live.tick); }
  live = null; closeModal('live-modal');
}
const accGuests = d => Object.values(d.players).filter(p => p.role === 'guest' && p.st === 'accepted').length;
function onLiveUpdate() {
  const d = live.d, me = d.players[live.pid];
  if (d.status === 'cancelled') {
    const dec = Object.values(d.players).find(p => p.st === 'declined');
    const host = d.players[d.hostId];
    const msg = dec ? `رفض ${dec.name} التحدّي، لذلك أُلغي التحدّي.` : `أُلغي التحدّي من قِبل ${host ? host.name : 'صاحبه'}.`;
    const wasRunning = liveRun; closeLive(); toast(msg); if (!wasRunning && !$('live-modal')) renderHomeExtras(); return;
  }
  if (d.status === 'waiting') {
    if (d.hostId === live.pid && accGuests(d) >= d.need && !Object.values(d.players).some(p => p.st === 'declined')) startRunning();
    renderLobby(); return;
  }
  // running
  if (!live.started && me && me.st === 'accepted' && !me.done && !chDoneHas(live.id)) {
    live.started = true;
    if (Date.now() - (d.startAt || 0) < 20000) { launchLive(); return; }
    showBoardModal('بدأ هذا التحدّي ولم تشارك فيه في وقته، ولا يمكن إعادته. هذه هي النتائج:');
    return;
  }
  if (!live.started) { live.started = true; showBoardModal(me && (me.done || chDoneHas(live.id)) ? 'انتهى اختبارك في هذا التحدّي، ولا يمكن إعادته:' : 'بدأ هذا التحدّي بالفعل ولا يمكن الانضمام إليه الآن:'); return; }
  if ($('live-board') && !$('completion-view').classList.contains('hidden')) renderLiveBoard();
  if ($('board-modal')) renderBoardModal();
  checkLiveOver();
}
async function startRunning() {
  if (live.starting) return; live.starting = true;
  try {
    await window.fb.runTransaction(window.fb.db, async tx => {
      const r = chRef(live.id), s = await tx.get(r), d = s.data();
      if (!d || d.status !== 'waiting' || accGuests(d) < d.need || Object.values(d.players).some(p => p.st === 'declined')) return;
      tx.update(r, { status: 'running', startAt: Date.now() });
    });
  } catch (e) { console.error(e); if (live) live.starting = false; }
}
function renderLobby() {
  const d = live.d, sub = SUBJECTS.find(s => s.id === d.sid) || { name: '', color: 'from-amber-500 to-orange-500' }, isHost = d.hostId === live.pid;
  const ps = Object.entries(d.players), acc = accGuests(d), left = Math.max(0, d.need - acc);
  const row = (name, tag, cls, icon) => `<div class="flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-sm font-bold ${cls}"><span class="truncate">${esc(name)}</span><span class="shrink-0 text-xs flex items-center gap-1"><i class="fa-solid ${icon}"></i>${tag}</span></div>`;
  const rows = ps.map(([pid, p]) => p.st === 'declined' ? row(p.name, 'رفض', 'bg-rose-50 border-rose-200 text-rose-700', 'fa-circle-xmark')
    : row(p.name + (pid === live.pid ? ' (أنت)' : ''), p.role === 'host' ? 'صاحب التحدّي' : 'قَبِل', 'bg-emerald-50 border-emerald-200 text-emerald-700', 'fa-circle-check')).join('')
    + Array.from({ length: left }, (_, i) => row(`بانتظار زميل ${acc + i + 1}`, 'لم يقبل بعد', 'bg-slate-50 border-slate-200 text-slate-500', 'fa-hourglass-half')).join('');
  const el = $('live-modal') || ovl('live-modal');
  el.innerHTML = dlg(`
    <div class="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr ${sub.color} text-white flex items-center justify-center text-2xl shadow-md"><i class="fa-solid fa-bolt"></i></div>
    <h2 class="text-xl font-black text-slate-900 text-center">تحدّي الأصدقاء</h2>
    <p class="text-sm text-slate-600 text-center"><b>${esc(sub.name)}</b> · ${d.n} سؤالاً · ${minLbl(mins(d))}</p>
    <div class="space-y-2">${rows}</div>
    <div class="rounded-2xl border border-amber-200 bg-amber-50 text-amber-800 text-sm font-bold leading-relaxed p-3 text-center"><i class="fa-solid fa-hourglass-half ml-1"></i>${left ? 'سيبدأ التحدّي عند قبول طلب التحدّي من جميع الزملاء' : 'وافق الجميع! يبدأ التحدّي الآن...'}<div class="text-xs font-semibold mt-1 opacity-80">قَبِل ${acc} من ${d.need}</div></div>
    ${isHost ? `<div class="space-y-2"><button type="button" id="lb-share" class="${btnCls.pri}"><i class="fa-brands fa-telegram ml-1"></i> شارك المنصة مع زملائك</button>
      <button type="button" id="lb-copy" class="${btnCls.sec}"><i class="fa-regular fa-copy ml-1"></i> نسخ رابط التحدّي</button></div>` : ''}
    <button type="button" id="lb-cancel" class="${btnCls.bad}">${isHost ? 'إلغاء التحدّي' : 'انسحاب (يُلغي التحدّي)'}</button>`, 'غرفة التحدّي');
  if (isHost) { $('lb-share').onclick = shareLive; $('lb-copy').onclick = async () => { try { await navigator.clipboard.writeText(chLink(live.id)); toast('تم نسخ رابط التحدّي.'); } catch { toast('تعذّر النسخ تلقائياً.'); } }; }
  $('lb-cancel').onclick = async () => {
    if (!confirm('سيُلغى التحدّي لجميع المشاركين. هل تريد المتابعة؟')) return;
    try { await window.fb.updateDoc(chRef(live.id), { status: 'cancelled' }); } catch { toast('تعذّر إلغاء التحدّي.'); }
  };
}
function shareText() {
  const d = live.d, sub = SUBJECTS.find(s => s.id === d.sid), host = d.players[d.hostId];
  return { text: `⚡ ${host ? host.name : 'صديقك'} يتحدّاك في ${sub ? sub.name : ''}: ${d.n} أسئلة خلال ${minLbl(mins(d))} بنفس الأسئلة للجميع. افتح الرابط واقبل التحدّي!`, url: chLink(live.id) };
}
async function shareLive() {
  const t = shareText();
  if (navigator.share) { await shareOut({ text: t.text, title: 'تحدّي صديق', url: t.url }); return; }
  window.open('https://t.me/share/url?url=' + encodeURIComponent(t.url) + '&text=' + encodeURIComponent(t.text), '_blank', 'noopener');
}
async function launchLive() {
  closeModal('live-modal'); closeModal('board-modal');
  const d = live.d, sub = SUBJECTS.find(s => s.id === d.sid);
  let b; try { b = await loadBank(d.sid); } catch { toast('تعذّر تحميل أسئلة التحدّي. تحقق من الاتصال.'); return; }
  const map = new Map(); b.forEach(q => { const h = qh(q.q); if (!map.has(h)) map.set(h, q); });
  const list = d.h.map(h => map.get(h)).filter(Boolean);
  if (!sub || list.length !== d.h.length) { toast('تعذّر العثور على كل أسئلة التحدّي، حدّث الصفحة وأعد فتح الرابط.'); return; }
  subject = sub; bank = b; setCount(sub.id, b.length); course = 'challenge'; chSeed = d.seed; challengeInfo = null;
  questions = list.map((q, i) => buildQSeeded(q, d.seed, i));
  liveRun = true; live.reported = false;
  await runCountdown();
  beginNow(null, d.secs);
}
function reportLive() {
  if (!live || !liveRun || live.reported) return;
  live.reported = true; liveRun = false;
  const correct = questions.filter((q, i) => answers[i] === q.correct).length;
  const sec = Math.max(1, Math.round((Date.now() - startTs) / 1000)), k = `players.${live.pid}`;
  chMarkDone(live.id);
  window.fb.updateDoc(chRef(live.id), { [k + '.done']: true, [k + '.score']: correct, [k + '.answered']: Object.keys(answers).length, [k + '.sec']: sec })
    .catch(() => toast('تعذّر إرسال نتيجتك إلى التحدّي، تحقق من الإنترنت.'));
}
// ===== لوحة النتائج =====
function boardInfo(d) {
  const expired = Date.now() > (d.startAt || 0) + d.secs * 1000 + 25000;
  const ps = Object.entries(d.players).filter(([, p]) => p.st === 'accepted').map(([pid, p]) => ({ pid, ...p, fin: !!p.done, gone: !p.done && expired }));
  const all = ps.every(p => p.fin || p.gone);
  const ranked = ps.filter(p => p.fin).sort((a, b) => (b.score - a.score) || (a.sec - b.sec));
  const best = ranked[0], winners = best ? ranked.filter(p => p.score === best.score && p.sec === best.sec) : [];
  return { ps, all, ranked, winners, rest: ps.filter(p => !p.fin) };
}
function boardHtml(d, myPid) {
  const bi = boardInfo(d), medals = ['text-amber-500', 'text-slate-400', 'text-orange-600'];
  const line = (p, i) => `<div class="flex items-center gap-3 rounded-xl border px-3 py-2.5 ${p.pid === myPid ? 'border-indigo-300 bg-indigo-50' : 'border-slate-200 bg-white'}">
    <span class="w-7 text-center font-black ${p.fin && i < 3 ? medals[i] : 'text-slate-400'}">${p.fin ? (i < 3 ? '<i class="fa-solid fa-medal"></i>' : i + 1) : '<i class="fa-solid fa-hourglass-half"></i>'}</span>
    <span class="flex-1 min-w-0 truncate text-sm font-bold text-slate-900">${esc(p.name)}${p.pid === myPid ? ' (أنت)' : ''}</span>
    <span class="text-xs font-bold text-slate-600 shrink-0">${p.fin ? `${p.score} من ${d.n} · ${fmtDur(p.sec)}` : p.gone ? 'لم يُكمل' : 'يجيب الآن...'}</span></div>`;
  const head = bi.all && bi.winners.length ? `<div class="rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-sm font-black text-center p-3"><i class="fa-solid fa-trophy ml-1"></i>${bi.winners.length > 1 ? 'تعادل بين: ' : 'الفائز: '}${bi.winners.map(w => esc(w.name)).join(' و')}</div>` : '';
  return head + `<div class="space-y-2">${bi.ranked.map(line).join('')}${bi.rest.map(p => line(p, 9)).join('')}</div>` + (bi.all ? '' : '<p class="text-xs text-slate-500 text-center">تتحدّث النتائج تلقائياً عند انتهاء كل زميل.</p>');
}
function checkLiveOver() {
  if (!live || !live.d || live.over) return;
  if (boardInfo(live.d).all) {
    live.over = true; if (live.tick) clearInterval(live.tick); live.tick = null;
    const bi = boardInfo(live.d), me = live.d.players[live.pid];
    if (live.unsub) { live.unsub(); live.unsub = null; }
    if ($('live-board')) renderLiveBoard();
    if (liveRun === false && !$('completion-view').classList.contains('hidden')) {
      const cm = $('final-compare');
      const win = bi.winners.some(w => w.pid === live.pid);
      cm.textContent = bi.winners.length ? (win ? (bi.winners.length > 1 ? 'تعادلت في المركز الأول!' : 'مبروك، فزت في التحدّي!') : `الفائز في التحدّي: ${bi.winners.map(w => w.name).join(' و')}`) : 'انتهى التحدّي.';
      cm.classList.remove('hidden');
      if (win && me && !reduceMotion && settings.effects && window.confetti) confetti({ particleCount: 140, spread: 80, origin: { y: 0.5 } });
    }
  }
}
function renderLiveBoard() {
  if (!live || !live.d) return;
  $('live-board').innerHTML = `<h4 class="text-lg font-black text-slate-900 flex items-center gap-2"><i class="fa-solid fa-ranking-star text-amber-500"></i> نتائج التحدّي</h4>` + boardHtml(live.d, live.pid);
  if (!live.over && !live.tick) live.tick = setInterval(() => { if (live && live.d && !live.over) { renderLiveBoard(); checkLiveOver(); } }, 5000);
}
function showBoardModal(note) {
  const el = $('board-modal') || ovl('board-modal');
  el.dataset.note = note || el.dataset.note || '';
  renderBoardModal();
  if (live && !live.over && !live.tick) live.tick = setInterval(() => { if (live && live.d && !live.over) { if ($('board-modal')) renderBoardModal(); checkLiveOver(); } }, 5000);
}
function renderBoardModal() {
  const el = $('board-modal'); if (!el || !live || !live.d) return;
  el.innerHTML = dlg(`<h2 class="text-lg font-black text-slate-900 text-center"><i class="fa-solid fa-ranking-star text-amber-500 ml-1"></i> نتائج التحدّي</h2>
    ${el.dataset.note ? `<p class="text-xs text-slate-600 text-center leading-relaxed">${esc(el.dataset.note)}</p>` : ''}
    ${boardHtml(live.d, live.pid)}<button type="button" id="bm-x" class="${btnCls.pri}">إغلاق</button>`, 'نتائج التحدّي');
  $('bm-x').onclick = () => { el.remove(); };
}
// ===== دعوة التحدّي (للزميل) =====
async function checkChallenge() {
  if (/^#c=/.test(location.hash)) { history.replaceState(history.state, '', location.href.split('#')[0]); toast('هذا رابط تحدٍّ قديم. اطلب من صديقك رابط تحدٍّ جديداً.'); return; }
  const m = location.hash.match(/^#ch=([a-z0-9]{6,12})$/); if (!m) return;
  if (!$('login-view').classList.contains('hidden')) return;   // ننتظر تسجيل الدخول أولاً
  history.replaceState(history.state, '', location.href.split('#')[0]);
  if (!fbOK()) return;
  const id = m[1]; let d;
  try { const s = await window.fb.getDoc(chRef(id)); if (!s.exists()) { toast('رابط التحدّي غير صالح أو منتهٍ.'); return; } d = s.data(); } catch { toast('تعذّر فتح التحدّي، تحقق من الإنترنت.'); return; }
  const pid = chPid();
  if (d.status === 'cancelled') { toast('هذا التحدّي أُلغي.'); return; }
  if (d.players[pid] || chDoneHas(id)) { openLive(id); return; }
  if (d.status !== 'waiting') { toast('بدأ هذا التحدّي بالفعل ولا يمكن الانضمام إليه الآن.'); return; }
  if (Object.values(d.players).filter(p => p.role === 'guest').length >= d.need) { toast('اكتمل عدد المتحدّين في هذا التحدّي.'); return; }
  showInvite(id, d);
}
function showInvite(id, d) {
  const sub = SUBJECTS.find(s => s.id === d.sid); if (!sub) return;
  const host = d.players[d.hostId], el = ovl('invite-modal');
  el.innerHTML = dlg(`
    <div class="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr ${sub.color} text-white flex items-center justify-center text-3xl shadow-md"><i class="fa-solid fa-bolt"></i></div>
    <h2 class="text-xl font-black text-slate-900 text-center">${esc(host ? host.name : 'صديقك')} يتحدّاك!</h2>
    <p class="text-sm text-slate-600 text-center leading-relaxed"><b>${esc(sub.name)}</b><br>${d.n} سؤالاً خلال ${minLbl(mins(d))}${d.need > 1 ? `<br>التحدّي بين ${d.need + 1} أشخاص` : ''}<br>لن يبدأ التحدّي إلا بعد قبول الجميع.</p>
    <label class="block text-sm font-bold text-slate-700">اسمك<input id="inv-name" maxlength="20" class="${inpCls} mt-1" value="${esc(store.get('ch_name', ''))}" placeholder="اكتب اسمك"></label>
    <p id="inv-err" class="text-xs font-bold text-rose-600 text-center min-h-[1rem]"></p>
    <div class="flex gap-3"><button type="button" id="inv-no" class="flex-1 ${btnCls.sec}">رفض</button><button type="button" id="inv-ok" class="flex-1 ${btnCls.warn}"><i class="fa-solid fa-check ml-1"></i> قبول التحدّي</button></div>`, 'دعوة تحدّي');
  const name = () => $('inv-name').value.trim().slice(0, 20);
  $('inv-ok').onclick = async () => {
    const n = name(); if (!n) { $('inv-err').textContent = 'اكتب اسمك أولاً.'; return; }
    store.set('ch_name', n); $('inv-ok').disabled = true;
    try {
      const pid = chPid();
      await window.fb.runTransaction(window.fb.db, async tx => {
        const r = chRef(id), s = await tx.get(r), x = s.data();
        if (!x || x.status !== 'waiting') throw new Error('closed');
        if (!x.players[pid] && Object.values(x.players).filter(p => p.role === 'guest').length >= x.need) throw new Error('full');
        tx.update(r, { [`players.${pid}`]: { name: n, role: 'guest', st: 'accepted', done: false } });
      });
      el.remove(); openLive(id);
    } catch (e) { $('inv-ok').disabled = false; $('inv-err').textContent = e.message === 'full' ? 'اكتمل عدد المتحدّين.' : e.message === 'closed' ? 'لم يعد التحدّي متاحاً.' : 'تعذّر قبول التحدّي، حاول مرة أخرى.'; }
  };
  $('inv-no').onclick = async () => {
    const n = name() || 'زميل'; $('inv-no').disabled = true;
    try { await window.fb.updateDoc(chRef(id), { [`players.${chPid()}`]: { name: n, role: 'guest', st: 'declined', done: false }, status: 'cancelled' }); } catch {}
    el.remove(); toast('رفضت التحدّي.');
  };
  $('inv-name').focus();
}

// ===== متابعة اختبار غير مكتمل =====
function clearResume() { try { localStorage.removeItem('resume'); localStorage.removeItem('resume_q'); } catch {} }
function saveResume() {
  if (!subject || !questions.length || completionReady || $('quiz-view').classList.contains('hidden')) return;
  if (liveRun) return;
  if (!idx && !Object.keys(answers).length) return;
  const old = store.get('resume', null);
  store.set('resume', { sid: subject.id, course, idx, answers, elapsed: Math.max(0, Math.round((Date.now() - startTs) / 1000)), left: timerId ? timeLeft : (old && old.left != null ? old.left : null), tt: timerId ? timeTotal : (old && old.tt) || null, total: questions.length, ch: challengeInfo, cs: chSeed, d: Date.now() });
}
function getResume() {
  const r = store.get('resume', null), qs = store.get('resume_q', null);
  if (!r || !Array.isArray(qs) || !qs.length || r.total !== qs.length) return null;
  const sub = r.sid === 'weak' ? WEAK_SUBJECT : SUBJECTS.find(x => x.id === r.sid);
  if (!sub || Date.now() - (r.d || 0) > 14 * 864e5) return null;
  return { r, qs, sub };
}
function resumeQuiz() {
  const g = getResume(); if (!g) { clearResume(); initHome(); return; }
  subject = g.sub; course = g.r.course; bank = []; questions = g.qs; challengeInfo = g.r.ch || null; chSeed = g.r.cs || 0;
  begin({ idx: Math.min(g.r.idx || 0, questions.length - 1), answers: g.r.answers || {}, elapsed: g.r.elapsed || 0, left: g.r.left, tt: g.r.tt });
}
function discardResume() { clearResume(); renderHomeExtras(); }
addEventListener('pagehide', saveResume);
document.addEventListener('visibilitychange', () => { if (document.hidden) saveResume(); });

function startWeakAll() {
  const list = weakList(); if (!list.length) return;
  challengeInfo = null;
  subject = WEAK_SUBJECT; bank = []; course = 'weakall';
  const n = store.get('qlen', 20);
  let l = shuffle(list); if (n > 0) l = l.slice(0, n);
  questions = l.map(buildQ); begin();
}

// ===== الصفحة الرئيسية: الهدف اليومي + دفتري + تقدّمي + الأسئلة الضعيفة =====
function renderHomeExtras() {
  const goal = (settings && settings.goal) || 10, d = dailyGet(), sk = streakInfo();
  const g = Math.min(100, Math.round(d.n / goal * 100)), weakN = weakList().length, nbn = nbGet().length;
  const C = 163.36;
  const g0 = getResume(), rn = g0 ? Object.keys(g0.r.answers || {}).length : 0;
  const resumeHtml = g0 ? `<div class="rounded-3xl p-4 md:p-5 shadow-md bg-gradient-to-l from-indigo-600 to-blue-600 text-white flex items-center gap-3">
      <button type="button" onclick="resumeQuiz()" class="flex-1 min-w-0 flex items-center gap-3 md:gap-4 text-right">
        <span class="w-12 h-12 shrink-0 rounded-2xl bg-white/20 flex items-center justify-center text-xl"><i class="fa-solid fa-play"></i></span>
        <span class="flex-1 min-w-0"><span class="block text-base font-black">تابع من حيث توقفت</span>
          <span class="block text-xs mt-0.5 opacity-90 truncate">${esc(g0.sub.name)} · ${esc(courseLabel(g0.sub.id, g0.r.course))} · أجبت عن ${rn} من ${g0.qs.length}</span></span>
        <i class="fa-solid fa-arrow-left"></i></button>
      <button type="button" onclick="discardResume()" aria-label="تجاهل الاختبار غير المكتمل" title="تجاهل" class="shrink-0 w-10 h-10 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center"><i class="fa-solid fa-xmark"></i></button>
    </div>` : '';
  $('notebook-entry').innerHTML = `
  <div class="max-w-3xl mx-auto space-y-4">
    ${resumeHtml}
    <button type="button" onclick="openChallengeSetup()" class="w-full bg-white rounded-3xl p-4 md:p-5 shadow-sm border border-amber-200 hover:shadow-xl hover:-translate-y-0.5 transition duration-300 flex items-center gap-4 text-right">
      <span class="w-12 h-12 shrink-0 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center text-xl shadow-md"><i class="fa-solid fa-bolt"></i></span>
      <span class="flex-1"><span class="block text-base font-bold text-slate-900">تحدّي الأصدقاء</span><span class="block text-xs text-slate-500 mt-0.5">تحدَّ زميلاً أو أكثر بنفس الأسئلة والوقت، ويبدأ بعد قبول الجميع</span></span>
      <i class="fa-solid fa-arrow-left text-amber-600"></i></button>
    <div class="bg-white rounded-3xl p-4 md:p-5 shadow-sm border border-slate-100 flex items-center gap-4">
      <div class="relative w-16 h-16 shrink-0" role="img" aria-label="تقدّم الهدف اليومي ${g}%">
        <svg viewBox="0 0 60 60" class="w-full h-full -rotate-90"><circle cx="30" cy="30" r="26" fill="none" stroke-width="6" class="ring-track"/><circle cx="30" cy="30" r="26" fill="none" stroke-width="6" stroke-linecap="round" stroke="${g >= 100 ? '#10b981' : '#6366f1'}" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - g / 100)}"/></svg>
        <span class="absolute inset-0 flex items-center justify-center text-xs font-black text-slate-900">${g}%</span>
      </div>
      <div class="flex-1 min-w-0">
        <p class="font-black text-slate-900 text-base">هدف اليوم</p>
        <p class="text-xs text-slate-500 mt-0.5">${d.n >= goal ? 'أنجزت هدفك اليوم، أحسنت!' : `أجبت عن ${d.n} من ${goal} سؤالاً`}</p>
      </div>
      <div class="shrink-0 text-center px-3 py-2 rounded-2xl ${sk.n ? 'warn-box border' : 'bg-slate-50 border border-slate-200 text-slate-500'}" title="أيام متتالية حققت فيها هدفك اليومي">
        <div class="text-lg font-black leading-none"><i class="fa-solid fa-fire ml-1"></i>${sk.n}</div>
        <div class="text-[11px] font-bold mt-1">${sk.n === 1 ? 'يوم متتالٍ' : 'أيام متتالية'}</div>
      </div>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <button type="button" onclick="openNotebook()" class="bg-white rounded-3xl p-4 md:p-5 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-0.5 transition duration-300 flex items-center gap-4 text-right">
        <span class="w-12 h-12 shrink-0 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white flex items-center justify-center text-xl shadow-md"><i class="fa-solid fa-bookmark"></i></span>
        <span class="flex-1"><span class="block text-base font-bold text-slate-900">دفتري</span><span class="block text-xs text-slate-500 mt-0.5">${nbn ? nbn + ' سؤال محفوظ مع حلوله' : 'احفظ الأسئلة المهمة وراجعها لاحقاً'}</span></span>
        <i class="fa-solid fa-arrow-left text-indigo-600"></i></button>
      <button type="button" onclick="openStats()" class="bg-white rounded-3xl p-4 md:p-5 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-0.5 transition duration-300 flex items-center gap-4 text-right">
        <span class="w-12 h-12 shrink-0 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center text-xl shadow-md"><i class="fa-solid fa-chart-column"></i></span>
        <span class="flex-1"><span class="block text-base font-bold text-slate-900">تقدّمي</span><span class="block text-xs text-slate-500 mt-0.5">${histGet().length ? histGet().length + ' محاولة مسجّلة' : 'تابع تطوّر نتائجك في كل مادة'}</span></span>
        <i class="fa-solid fa-arrow-left text-indigo-600"></i></button>
    </div>
    ${weakN ? `<button type="button" onclick="startWeakAll()" class="warn-box border w-full rounded-3xl p-4 md:p-5 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition duration-300 flex items-center gap-4 text-right">
      <span class="w-12 h-12 shrink-0 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white flex items-center justify-center text-xl shadow-md"><i class="fa-solid fa-bullseye"></i></span>
      <span class="flex-1"><span class="block text-base font-bold">اختبر نفسي بأسئلتي الضعيفة</span><span class="block text-xs mt-0.5 opacity-80">${weakN} سؤال أخطأت فيه أكثر من مرة، من كل المواد</span></span>
      <i class="fa-solid fa-arrow-left"></i></button>` : ''}
  </div>`;
}

// ===== تثبيت التطبيق =====
let deferredInstall = null;
const isStandalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
function renderInstall() {
  const box = $('install-banner'); if (!box) return;
  const on = !store.get('installHide', false) && !isStandalone() && (deferredInstall || isIOS());
  box.classList.toggle('hidden', !on);
  if (!on) { box.innerHTML = ''; return; }
  box.innerHTML = `<div class="bg-indigo-50 border border-indigo-100 text-indigo-900 rounded-3xl p-4 flex items-center gap-3">
    <span class="w-11 h-11 shrink-0 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-lg"><i class="fa-solid fa-mobile-screen-button"></i></span>
    <span class="flex-1 text-sm font-semibold leading-relaxed">${deferredInstall ? 'ثبّت المنصة على هاتفك لتفتحها كتطبيق مستقل بنقرة واحدة.' : 'لتثبيت المنصة على الآيفون: اضغط زر المشاركة ثم «إضافة إلى الشاشة الرئيسية».'}</span>
    ${deferredInstall ? '<button id="install-btn" type="button" class="shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white px-4 min-h-[40px] rounded-xl text-sm font-bold transition">تثبيت</button>' : ''}
    <button id="install-close" type="button" aria-label="إخفاء" class="shrink-0 w-9 h-9 rounded-xl hover:bg-indigo-100 text-indigo-700"><i class="fa-solid fa-xmark"></i></button></div>`;
  const ib = $('install-btn');
  if (ib) ib.onclick = async () => { try { deferredInstall.prompt(); await deferredInstall.userChoice; } catch {} deferredInstall = null; renderInstall(); };
  $('install-close').onclick = () => { store.set('installHide', true); renderInstall(); };
}
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredInstall = e; renderInstall(); });
window.addEventListener('appinstalled', () => { deferredInstall = null; renderInstall(); });

// ===== صفحة الدروس والرسم البياني داخل المادة =====
function renderTopics() {
  const box = $('topics-wrap'); if (!box) return;
  const counts = {}; bank.forEach(q => { if (q.k) counts[q.k] = (counts[q.k] || 0) + 1; });
  const chips = (TOPICS[subject.id] || []).filter(([id]) => (counts[id] || 0) >= 3);
  box.classList.toggle('hidden', !chips.length);
  if (!chips.length) { box.innerHTML = ''; return; }
  box.innerHTML = `<h3 class="text-lg font-black text-slate-900 flex items-center gap-2"><i class="fa-solid fa-list-check text-indigo-600"></i> التدرّب حسب الدرس</h3>
    <p class="text-xs text-slate-500">اختر موضوعاً لتتدرّب على أسئلته من كل الدورات. التصنيف تلقائي بحسب موضوع السؤال وقد لا يكون دقيقاً دائماً.</p>
    <div class="flex flex-wrap gap-2">${chips.map(([id, name]) => `<button type="button" data-t="${id}" class="px-3 py-2 min-h-[40px] rounded-xl border border-slate-200 bg-white hover:bg-indigo-50/30 hover:border-indigo-500 text-slate-700 text-xs md:text-sm font-bold transition">${esc(name)} <span class="text-slate-500 font-semibold">(${counts[id]})</span></button>`).join('')}</div>`;
  box.querySelectorAll('[data-t]').forEach(b => b.onclick = () => startCourse('t:' + b.dataset.t));
}
function renderSubjectChart() {
  const box = $('subject-chart'); if (!box) return;
  const vals = histOf(subject.id).slice(-12).map(x => x.pct);
  box.classList.toggle('hidden', !vals.length);
  if (!vals.length) { box.innerHTML = ''; return; }
  box.innerHTML = `<div class="bg-white rounded-3xl p-4 md:p-5 shadow-sm border border-slate-100 flex flex-wrap items-center justify-between gap-4">
    <div><p class="font-black text-slate-900 text-base">تطوّرك في هذه المادة</p><p class="text-xs text-slate-500 mt-1">آخر ${vals.length} محاولة · المتوسط ${avg(vals)}%</p></div>
    <div dir="ltr" class="overflow-x-auto">${spark(vals)}</div></div>`;
}

// ===== صفحة تقدّمي =====
function openStats() {
  $('header-nav-btn').classList.remove('hidden');
  renderStats(); show('stats-view'); pushView('stats');
  window.scrollTo({ top: 0 });
}
function weekData() {
  const dl = store.get('dayLog', {}), h = histGet(), out = [];
  for (let i = 6; i >= 0; i--) {
    const dt = new Date(); dt.setDate(dt.getDate() - i); const k = dayStr(dt);
    const hs = h.filter(x => dayStr(new Date(x.d)) === k);
    const hn = hs.reduce((a, x) => a + x.n, 0), hok = hs.reduce((a, x) => a + x.ok, 0), l = dl[k] || { n: 0, ok: 0 };
    out.push(l.n >= hn ? { k, dt, n: l.n, ok: l.ok } : { k, dt, n: hn, ok: hok });
  }
  return out;
}
function renderWeek() {
  const box = $('stats-week'), w = weekData(), goal = (settings && settings.goal) || 10;
  const tot = w.reduce((a, x) => a + x.n, 0), ok = w.reduce((a, x) => a + x.ok, 0), acc = tot ? Math.round(ok / tot * 100) : 0, active = w.filter(x => x.n).length;
  if (!tot) { box.innerHTML = '<div class="bg-white border border-slate-100 rounded-3xl p-5 text-center text-sm font-semibold text-slate-500"><i class="fa-regular fa-calendar ml-1"></i> لا يوجد نشاط خلال آخر 7 أيام. حلّ بضعة أسئلة اليوم وسيظهر هنا رسمك البياني.</div>'; return; }
  const max = Math.max(goal, ...w.map(x => x.n), 5), S = 0.82, today = dayStr();
  const cols = w.map(x => {
    const bh = x.n ? Math.max(x.n / max * S * 100, 5) : 0, okH = x.n ? Math.round(x.ok / x.n * 100) : 0;
    return `<div class="flex-1 min-w-0 h-full flex flex-col justify-end items-center gap-1">
      <span class="text-[11px] font-black ${x.n ? 'text-slate-700' : 'text-slate-400'}">${x.n || ''}</span>
      ${x.n ? `<div class="w-full max-w-[2.25rem] rounded-t-xl overflow-hidden flex flex-col-reverse" style="height:${bh.toFixed(1)}%" title="${x.n} سؤال · ${x.ok} صحيحة"><div class="bg-emerald-500" style="height:${okH}%"></div><div class="bg-rose-400 flex-1"></div></div>` : '<div class="w-full max-w-[2.25rem] h-1 rounded-full bg-slate-200"></div>'}
    </div>`;
  }).join('');
  const days = w.map(x => `<span class="flex-1 min-w-0 text-center text-[11px] font-bold truncate ${x.k === today ? 'text-indigo-600' : 'text-slate-500'}">${x.k === today ? 'اليوم' : x.dt.toLocaleDateString('ar', { weekday: 'long' })}</span>`).join('');
  const subs = SUBJECTS.map(sub => { const l = histOf(sub.id); return { sub, a: avg(l.slice(-10).map(x => x.pct)), n: l.length }; }).filter(x => x.n).sort((a, b) => b.a - a.a);
  const chip = (ic, label, x, cls) => `<span class="inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold ${cls}"><i class="fa-solid ${ic}"></i> ${label}: ${esc(x.sub.name)} (${x.a}%)</span>`;
  const sw = subs.length >= 2 ? `<div class="flex flex-wrap gap-2">${chip('fa-arrow-trend-up', 'الأقوى', subs[0], 'bg-emerald-50 border-emerald-200 text-emerald-700')}${chip('fa-arrow-trend-down', 'الأضعف', subs[subs.length - 1], 'bg-rose-50 border-rose-100 text-rose-700')}</div>` : '';
  box.innerHTML = `<div class="bg-white rounded-3xl p-4 md:p-5 shadow-sm border border-slate-100 space-y-4">
    <div class="flex items-center justify-between gap-3">
      <h3 class="text-lg font-black text-slate-900">نشاطك خلال آخر 7 أيام</h3>
      <button type="button" onclick="shareProgress()" class="shrink-0 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 px-3 min-h-[40px] rounded-xl text-xs md:text-sm font-bold transition flex items-center gap-2"><i class="fa-solid fa-share-nodes"></i> شارك تقدّمي</button>
    </div>
    <div class="grid grid-cols-3 gap-3 text-center">
      <div class="rounded-2xl border border-indigo-100 bg-indigo-50 p-3"><div class="text-xl font-black text-indigo-600">${tot}</div><div class="text-xs text-slate-500 font-semibold mt-1">سؤال أجبت عنه</div></div>
      <div class="rounded-2xl border border-emerald-300 bg-emerald-50 p-3"><div class="text-xl font-black text-emerald-600">${acc}%</div><div class="text-xs text-slate-500 font-semibold mt-1">نسبة الصحة</div></div>
      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-3"><div class="text-xl font-black text-slate-700">${active}/7</div><div class="text-xs text-slate-500 font-semibold mt-1">أيام النشاط</div></div>
    </div>
    <div role="img" aria-label="أسئلة كل يوم خلال الأسبوع: ${w.map(x => x.n).join('، ')}">
      <div class="relative h-36 border-b border-slate-200">
        <div class="absolute inset-x-0 border-t border-dashed border-indigo-400 pointer-events-none" style="bottom:${(goal / max * S * 100 + 5).toFixed(1)}%"><span class="absolute -top-2 right-0 bg-white px-1 text-[10px] font-bold text-indigo-600">الهدف ${goal}</span></div>
        <div class="relative h-full flex gap-2 items-end">${cols}</div>
      </div>
      <div class="flex gap-2 mt-2">${days}</div>
    </div>
    <div class="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500"><span class="flex items-center gap-1.5"><i class="w-3 h-3 rounded bg-emerald-500 inline-block"></i> صحيحة</span><span class="flex items-center gap-1.5"><i class="w-3 h-3 rounded bg-rose-400 inline-block"></i> خاطئة</span></div>
    ${sw}
  </div>`;
}
async function shareProgress() {
  const w = weekData(), tot = w.reduce((a, x) => a + x.n, 0), ok = w.reduce((a, x) => a + x.ok, 0), sk = streakInfo();
  if (!tot) return;
  const text = `أجبت هذا الأسبوع عن ${tot} سؤالاً بنسبة صحة ${Math.round(ok / tot * 100)}%${sk.n > 1 ? ` وأواظب منذ ${sk.n} أيام متتالية` : ''} على منصة الاختبار السريع لشهادة التاسع. انضم إليّ!`;
  await shareOut({ text, title: 'تقدّمي في منصة الاختبار السريع' });
}
function renderStats() {
  const h = histGet(), sk = streakInfo(), d = dailyGet(), goal = (settings && settings.goal) || 10;
  const tile = (v, l, cls) => `<div class="rounded-2xl border p-3 text-center ${cls}"><div class="text-2xl font-black">${v}</div><div class="text-xs font-semibold mt-1 opacity-80">${l}</div></div>`;
  renderWeek();
  $('stats-sum').innerHTML = h.length
    ? tile(h.length, 'عدد المحاولات', 'bg-indigo-50 border-indigo-100 text-indigo-700') + tile(avg(h.map(x => x.pct)) + '%', 'متوسط النتائج', 'bg-emerald-50 border-emerald-300 text-emerald-700') + tile(Math.max(...h.map(x => x.pct)) + '%', 'أعلى نتيجة', 'bg-slate-50 border-slate-200 text-slate-700') + tile(sk.n, 'أيام متتالية', 'warn-box')
    : '';
  if (!h.length) {
    $('stats-subjects').innerHTML = '<div class="bg-white border border-slate-100 rounded-3xl p-8 text-center space-y-3"><div class="text-4xl text-indigo-600"><i class="fa-solid fa-chart-column"></i></div><p class="font-bold text-slate-900">لا توجد محاولات مسجّلة بعد</p><p class="text-sm text-slate-500">أنهِ أي اختبار وستظهر هنا نتائجك وتطوّرها في كل مادة.</p></div>';
    $('stats-recent').innerHTML = ''; return;
  }
  $('stats-subjects').innerHTML = `<p class="text-xs text-slate-500 font-semibold">هدف اليوم: ${d.n} / ${goal} سؤال</p>` + SUBJECTS.map(sub => {
    const l = histOf(sub.id), vals = l.slice(-10).map(x => x.pct);
    return `<div class="bg-white rounded-3xl p-4 md:p-5 shadow-sm border border-slate-100 flex flex-wrap items-center gap-4">
      <div class="w-12 h-12 shrink-0 rounded-2xl bg-gradient-to-tr ${sub.color} text-white flex items-center justify-center text-xl shadow-md"><i class="fa-solid ${sub.icon}"></i></div>
      <div class="flex-1 min-w-[10rem]"><p class="font-bold text-slate-900">${esc(sub.name)}</p>
        <p class="text-xs text-slate-500 mt-1">${l.length ? `${l.length} محاولة · المتوسط ${avg(l.map(x => x.pct))}% · أعلى نتيجة ${Math.max(...l.map(x => x.pct))}%` : 'لم تبدأ بعد'}</p></div>
      ${vals.length ? `<div dir="ltr" class="overflow-x-auto">${spark(vals)}</div>` : ''}</div>`;
  }).join('');
  $('stats-recent').innerHTML = '<h3 class="text-lg font-black text-slate-900 pt-2">آخر المحاولات</h3>' + h.slice(-10).reverse().map(x => {
    const sub = SUBJECTS.find(s => s.id === x.s);
    return `<div class="bg-white rounded-2xl p-3 md:p-4 border border-slate-100 flex items-center gap-3">
      <span class="shrink-0 min-w-[3.25rem] text-center rounded-xl px-2 py-1.5 text-sm font-black text-white" style="background:${pctColor(x.pct)}">${x.pct}%</span>
      <div class="flex-1 min-w-0"><p class="text-sm font-bold text-slate-900 truncate">${esc(sub ? sub.name : 'أسئلتي الضعيفة')} · ${esc(courseLabel(x.s, x.c))}</p>
      <p class="text-xs text-slate-500 mt-0.5">${x.ok} صحيحة من ${x.n} · ${fmtDur(x.sec || 0)} · ${new Date(x.d).toLocaleDateString('ar')}</p></div></div>`;
  }).join('');
}

// ===== النطق (الإنجليزية والفرنسية) =====
function stopSpeech() { try { if ('speechSynthesis' in window) speechSynthesis.cancel(); } catch {} }
function speakParts(parts, lang) {
  if (!('speechSynthesis' in window)) return;
  const syn = window.speechSynthesis;
  if (syn.speaking) { syn.cancel(); return; }
  const v = syn.getVoices();
  if (v.length && !v.some(x => x.lang.toLowerCase().startsWith(lang.slice(0, 2)))) toast('لا يتوفر صوت لهذه اللغة على جهازك.');
  parts.forEach(p => { const u = new SpeechSynthesisUtterance(p); u.lang = lang; u.rate = 0.9; syn.speak(u); });
}
const speakClean = t => plain(t).replace(/^[\s.?!"]+/, '').replace(/\s*[–]\s*/g, ', ').replace(/_{2,}/g, ' , ').replace(/\s+/g, ' ').trim();
function speakQuestion(withAnswer) {
  const q = questions[idx]; if (!q) return;
  const lang = TTS_LANG[q.s || (subject && subject.id)]; if (!lang) return;
  const t = splitLabel(q.text).text;
  if (withAnswer) {
    speakParts([speakClean(plain(t).replace(/_{2,}/, ' ' + plain(q.options[q.correct]) + ' '))], lang);
  } else {
    speakParts([speakClean(t)].concat(q.options.map((o, i) => 'ABCD'[i] + ', ' + speakClean(o))), lang);
  }
}

// ===== الإبلاغ عن خطأ في سؤال (تيليجرام) =====
function reportQuestion() {
  const q = questions[idx]; if (!q) return;
  const sid = q.s || (subject && subject.id), sub = SUBJECTS.find(s => s.id === sid);
  const msg = [
    'أبلغ عن خطأ في سؤال',
    `المادة: ${sub ? sub.name : sid} - ${courseLabel(sid, course)}`,
    `السؤال: ${plain(q.text)}`,
    'الخيارات:', ...q.options.map((o, i) => `${i + 1}) ${plain(o)}${i === q.correct ? '  ✓ (الإجابة المعتمدة)' : ''}`),
    q.exp ? `الشرح: ${plain(q.exp).slice(0, 300)}` : '',
    'ملاحظتي: '
  ].filter(Boolean).join('\n');
  try { navigator.clipboard.writeText(msg).catch(() => {}); } catch {}
  window.open('https://t.me/Yz044?text=' + encodeURIComponent(msg), '_blank', 'noopener');
  toast('نُسخ نص السؤال، إن لم يظهر في المحادثة فألصقه واكتب ملاحظتك.');
}

// ===== ربط الأزرار الجديدة =====
window.addEventListener('DOMContentLoaded', () => {
  if (!settings.goal) settings.goal = 10;
  const gs = $('goal-sel'); gs.value = String(settings.goal);
  gs.onchange = () => { settings.goal = +gs.value; saveSettings(); };
  $('tts-btn').onclick = () => speakQuestion(false);
  $('tts-ans-btn').onclick = () => speakQuestion(true);
  $('rep-btn').onclick = reportQuestion;
  $('reset-progress').onclick = () => {
    if (confirm('سيتم مسح أفضل نتائجك ونسبة إنجازك وسجل محاولاتك وأسئلتك الضعيفة وعدّاد الأيام المتتالية. هل تريد المتابعة؟')) {
      store.set('stats', {}); store.set('hist', []); store.set('miss', {}); store.set('mast', {}); store.set('daily', {}); store.set('dayLog', {}); clearResume(); store.set('streak', { n: 0, last: '' });
      initHome(); toggleMenu(false);
    }
  };
});

/* ICEIC 2027 — الواجهة الأمامية
 * - المحتوى كله يأتي من Sanity (قراءة عامة فقط عبر apicdn) مع نسخة احتياطية محلية assets/data/fallback.json
 * - كل نص قادم من لوحة التحكم يمرّ عبر esc() أو textContent؛ الروابط https فقط؛ الصور من نطاقات مسموحة فقط
 * - لا توجد معالجات أحداث مضمّنة (CSP: script-src 'self')
 */
(() => {
  'use strict';

  const CFG = {projectId: 'k6sogxhu', dataset: 'production', apiVersion: '2025-02-19'};
  const DEFAULT_EMAIL = 'digitalcell.fsecg@gmail.com';

  // ---------- أدوات أمان وتنسيق ----------
  const HTML_ESC = {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '`': '&#96;'};
  const esc = (v) => String(v ?? '').replace(/[&<>"'`]/g, (c) => HTML_ESC[c]);
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const byId = (id) => document.getElementById(id);

  const safeHttps = (u) => {
    try { const x = new URL(String(u)); return x.protocol === 'https:' ? x.href : ''; } catch { return ''; }
  };
  const IMG_HOSTS = new Set(['cdn.sanity.io', 'images.unsplash.com']);
  /** يقبل: مسار محلي assets/ أو https من النطاقات المسموحة فقط */
  const safeImg = (u, w) => {
    if (!u) return '';
    u = String(u);
    if (/^assets\/[\w./-]+$/.test(u) && !u.includes('..')) return u;
    try {
      const x = new URL(u);
      if (x.protocol !== 'https:' || !IMG_HOSTS.has(x.hostname)) return '';
      if (w && x.hostname === 'cdn.sanity.io') { x.searchParams.set('w', String(w)); x.searchParams.set('auto', 'format'); }
      return x.href;
    } catch { return ''; }
  };
  const safeFile = (u) => { const h = safeHttps(u); return h && new URL(h).hostname === 'cdn.sanity.io' ? h : ''; };
  const isEmail = (s) => /^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']+$/.test(s) && s.length <= 120;
  const youtubeId = (u) => {
    const h = safeHttps(u); if (!h) return '';
    const x = new URL(h); let id = '';
    if (/(^|\.)youtube\.com$/.test(x.hostname)) id = x.searchParams.get('v') || (x.pathname.match(/^\/(?:embed|shorts)\/([\w-]{11})/) || [])[1] || '';
    else if (x.hostname === 'youtu.be') id = x.pathname.slice(1, 12);
    return /^[\w-]{11}$/.test(id) ? id : '';
  };

  let lang = 'ar';
  let DATA = null;
  const t = (o, base) => (o && (o[`${base}_${lang}`] || o[`${base}_ar`] || o[`${base}_en`])) || '';
  const L = (ar, en) => (lang === 'ar' ? ar : en);
  const setText = (id, v) => { const el = byId(id); if (el && v) el.textContent = v; };

  const fmtDate = (iso, opts) => {
    if (!iso) return '';
    const d = new Date(iso); if (isNaN(d)) return '';
    const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(iso);
    try {
      return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-DZ-u-nu-latn' : 'en-GB', {timeZone: dateOnly ? 'UTC' : 'Africa/Algiers', ...opts}).format(d);
    } catch { return iso; }
  };
  const ORD_AR = ['الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس', 'السابع', 'الثامن', 'التاسع', 'العاشر'];

  // ---------- خرائط الأصناف (كلها literal ليلتقطها Tailwind) ----------
  const TRACK_ICON = {shield: 'fa-shield-alt', chip: 'fa-microchip', coins: 'fa-hand-holding-usd', ship: 'fa-ship', recycle: 'fa-recycle', rocket: 'fa-rocket', leaf: 'fa-leaf', chart: 'fa-chart-line', globe: 'fa-globe', book: 'fa-book'};
  const TRACK_COLOR = {
    primary: {box: 'bg-primary/10 text-primary', text: 'text-primary'},
    secondary: {box: 'bg-secondary/10 text-secondary', text: 'text-secondary'},
    accent: {box: 'bg-accent/10 text-accent', text: 'text-accent'},
    blue: {box: 'bg-blue-500/10 text-blue-500', text: 'text-blue-500'},
    gray: {box: 'bg-gray-800/10 text-gray-800', text: 'text-gray-800'},
    purple: {box: 'bg-purple-600/10 text-purple-600', text: 'text-purple-600'},
  };
  const SESSION_BG = {accent: 'bg-accent', primary: 'bg-primary', secondary: 'bg-secondary', blue: 'bg-blue-500'};
  const OBJ_STYLE = [
    {b: 'hover:border-accent', c: 'text-accent', h: 'group-hover:bg-accent'},
    {b: 'hover:border-secondary', c: 'text-secondary', h: 'group-hover:bg-secondary'},
    {b: 'hover:border-primary', c: 'text-primary', h: 'group-hover:bg-primary'},
    {b: 'hover:border-blue-500', c: 'text-blue-500', h: 'group-hover:bg-blue-500'},
  ];
  const DATE_ICON = {calendar: 'far fa-calendar-check', mail: 'far fa-envelope-open', file: 'fas fa-file-pdf', award: 'fas fa-award'};
  const DATE_STYLE = [
    {box: 'bg-accent/20 text-accent', text: 'text-accent'},
    {box: 'bg-secondary/20 text-secondary', text: 'text-secondary'},
    {box: 'bg-primary/20 text-primary', text: 'text-primary'},
  ];
  const SPK_GRAD = ['from-primary to-blue-500', 'from-accent to-yellow-400', 'from-secondary to-green-400'];
  const STAT_BG = ['bg-[#f0f2fb] border-blue-50', 'bg-[#f0f2fb] border-blue-50', 'bg-[#f0fbfb] border-cyan-50', 'bg-[#eaf1fb] border-blue-100', 'bg-[#bbedef] border-cyan-100', 'bg-[#f0f2fb] border-blue-50'];
  const COM_COLOR = {
    accent: {bar: 'bg-accent', text: 'text-accent', soft: 'bg-accent/10', ring: 'border-accent/20', star: 'text-accent/5'},
    blue: {bar: 'bg-blue-500', text: 'text-blue-500', soft: 'bg-blue-500/10', ring: 'border-blue-500/20', star: 'text-blue-500/5'},
  };
  const SOCIAL = [
    ['facebookUrl', 'fa-facebook-f', 'hover:bg-blue-600', 'Facebook'],
    ['linkedinUrl', 'fa-linkedin-in', 'hover:bg-blue-500', 'LinkedIn'],
    ['youtubeUrl', 'fa-youtube', 'hover:bg-red-600', 'YouTube'],
    ['instagramUrl', 'fa-instagram', 'hover:bg-pink-600', 'Instagram'],
  ];
  // أيقونات Font Awesome المجانية من لوحة التحكم: صيغة صارمة فقط (لا إدخال حر داخل class)
  const FA_RE = /^(?:(fas|far|fab|fa-solid|fa-regular|fa-brands)\s+)?(fa-[a-z0-9-]{2,40})$/;
  const faIcon = (v, fallback) => { const m = FA_RE.exec(String(v || '').trim()); return m ? `${m[1] || 'fas'} ${m[2]}` : fallback; };

  // ألوان الموقع من لوحة التحكم (HEX فقط) عبر متغيّرات CSS
  const HEX = /^#[0-9a-fA-F]{6}$/;
  const THEME_KEYS = {colorPrimary: 'primary', colorSecondary: 'secondary', colorAccent: 'accent', colorLightBlue: 'lightBlue', colorBackground: 'bgLight'};
  const rgbOf = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const darken = (h, f) => '#' + rgbOf(h).map((c) => Math.round(c * f).toString(16).padStart(2, '0')).join('');
  function applyTheme(s) {
    const root = document.documentElement.style;
    for (const [k, name] of Object.entries(THEME_KEYS)) {
      const v = String(s[k] || '').trim();
      if (HEX.test(v)) root.setProperty(`--c-${name}`, rgbOf(v).join(' ')); else root.removeProperty(`--c-${name}`);
    }
    const p = String(s.colorPrimary || '').trim(), g = String(s.colorSecondary || '').trim();
    if (HEX.test(p)) root.setProperty('--hero-a', darken(p, 0.5)); else root.removeProperty('--hero-a');
    if (HEX.test(g)) root.setProperty('--hero-c', darken(g, 0.6)); else root.removeProperty('--hero-c');
  }

  const AVATAR = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=256&h=256&fit=crop';

  // ---------- جلب البيانات ----------
  const img = (f) => `"${f}": ${f}.asset->url`;
  const QUERY = `{
    "settings": *[_id == "siteSettings"][0]{ ..., ${img('facultyLogoAr')}, ${img('facultyLogoEn')}, ${img('conferenceLogo')}, ${img('conferenceLogoAr')}, ${img('conferenceLogoEn')}, ${img('universityLogoAr')}, ${img('universityLogoEn')}, ${img('heroBackground')}, ${img('shareImage')} },
    "home": *[_id == "homePage"][0]{ ..., ${img('welcomeImage')}, ${img('welcomeImage2')} },
    "about": *[_id == "aboutPage"][0]{ ..., ${img('preambleImage')} },
    "submission": *[_id == "submissionPage"][0]{ ..., "templateUrl": templateFile.asset->url },
    "announcements": *[_type == "announcement" && publishAt <= now() && (!defined(expireAt) || expireAt > now())] | order(pinned desc, publishAt desc)[0...60]{
      _id, kind, title_ar, title_en, body_ar, body_en, linkUrl, linkLabel_ar, linkLabel_en, publishAt, expireAt, pinned, popup, "imageUrl": image.asset->url },
    "tracks": *[_type == "track"] | order(order asc){ _id, order, kicker_ar, kicker_en, title_ar, title_en, description_ar, description_en, icon, color },
    "speakers": *[_type == "speaker"] | order(order asc){ _id, name_ar, name_en, role_ar, role_en, bio_ar, bio_en, order, "imageUrl": image.asset->url },
    "committee": *[_type == "committee"] | order(order asc){ _id, committeeType, name_ar, name_en, role_ar, role_en, institution_ar, institution_en, order, "imageUrl": image.asset->url },
    "program": *[_type == "programDay"] | order(dayNumber asc){ _id, dayNumber, date, label_ar, label_en, sessions },
    "dates": *[_type == "importantDate"] | order(order asc){ _id, title_ar, title_en, date, icon, order },
    "editions": *[_type == "history"] | order(editionYear desc){
      _id, editionYear, dateLabel_ar, dateLabel_en, title_ar, title_en, summary_ar, summary_en, intro_ar, intro_en, stats,
      excellence_ar, excellence_en, topics_ar, topics_en, achievement_ar, achievement_en, recommendations_ar, recommendations_en,
      videoUrl_ar, videoUrl_en, galleryTitle_ar, galleryTitle_en, "logoUrl": logo.asset->url, "programPdfUrl": programPdf.asset->url,
      "gallery": gallery[]{ "url": asset->url, caption_ar, caption_en },
      "legacyImages": [image1.asset->url, image2.asset->url, image3.asset->url, image4.asset->url, image5.asset->url, image6.asset->url] },
    "sponsors": *[_type == "sponsor"] | order(order asc){ _id, name, tier, url, order, "logoUrl": logo.asset->url }
  }`;

  async function fetchJson(url, ms = 9000) {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), ms);
    try {
      const r = await fetch(url, {signal: ctl.signal, credentials: 'omit', cache: 'no-cache', headers: {Accept: 'application/json'}});
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return await r.json();
    } finally { clearTimeout(timer); }
  }

  async function loadData() {
    const url = `https://${CFG.projectId}.apicdn.sanity.io/v${CFG.apiVersion}/data/query/${CFG.dataset}?perspective=published&query=${encodeURIComponent(QUERY)}`;
    try {
      const j = await fetchJson(url);
      if (j && j.result && j.result.settings) return {data: j.result, live: true};
    } catch (e) { console.warn('Sanity unreachable, using bundled fallback:', e.message); }
    try { return {data: await fetchJson('assets/data/fallback.json', 5000), live: false}; }
    catch { return {data: {}, live: false}; }
  }

  const arr = (k) => (DATA && Array.isArray(DATA[k]) ? DATA[k] : []);
  const now = () => Date.now();
  const activeAnnouncements = () => arr('announcements')
    .filter((a) => (!a.publishAt || new Date(a.publishAt) <= now()) && (!a.expireAt || new Date(a.expireAt) > now()))
    .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || new Date(b.publishAt || 0) - new Date(a.publishAt || 0));

  const emptyBox = (msg) => `<div class="col-span-full text-center text-gray-400 font-bold py-10">${esc(msg)}</div>`;
  const EMPTY = () => L('سيتم إضافة المحتوى قريباً.', 'Content will be added soon.');

  // ---------- الإعدادات العامة ----------
  function applySettings() {
    const s = DATA.settings || {};
    applyTheme(s);
    const home = DATA.home || {};
    const isAr = lang === 'ar';
    const facLogo = safeImg(isAr ? s.facultyLogoAr : s.facultyLogoEn, 400) || `assets/img/faculty_logo_${lang}.png`;
    const confLogo = safeImg(isAr ? s.conferenceLogoAr : s.conferenceLogoEn, 300) || safeImg(s.conferenceLogo, 300) || 'assets/img/conference_logo.png';
    const uniLogo = safeImg(isAr ? s.universityLogoAr : s.universityLogoEn, 400) || safeImg(isAr ? s.universityLogoEn : s.universityLogoAr, 400) || 'assets/img/university_logo.png';
    ['univ-logo-img', 'footer-univ-logo-img'].forEach((id) => {
      const el = byId(id); if (el) { el.dataset.fallback = 'assets/img/university_logo.png'; el.src = uniLogo; }
    });
    [['faculty-logo-img', facLogo], ['venue-faculty-logo', facLogo], ['footer-faculty-logo-img', facLogo]].forEach(([id, src]) => {
      const el = byId(id); if (el) { el.dataset.fallback = `assets/img/faculty_logo_${lang}.png`; el.src = src; }
    });
    ['conf-logo-img', 'footer-conf-logo', 'footer-conf-logo2'].forEach((id) => {
      const el = byId(id); if (el) { el.dataset.fallback = 'assets/img/conference_logo.png'; el.src = confLogo; }
    });

    const title = t(s, 'siteTitle');
    setText('hdr-title', title); setText('hdr-theme', t(s, 'theme'));
    setText('hero-edition', t(s, 'editionLabel')); setText('hero-title', t(s, 'heroTitle'));
    const theme = t(s, 'theme'); if (theme) setText('hero-theme', theme.replace(/\.?$/, '.'));
    if (title) document.title = title;
    const desc = t(s, 'seoDescription');
    if (desc) { const m = $('meta[name="description"]'); if (m) m.content = desc; const og = $('meta[property="og:description"]'); if (og) og.content = desc; }
    const ogt = $('meta[property="og:title"]'); if (ogt && title) ogt.content = title;

    const hero = byId('hero-photo'), bg = safeImg(s.heroBackground, 1600);
    if (hero) { hero.classList.toggle('hidden', !bg); if (bg) hero.replaceChildren(Object.assign(document.createElement('img'), {src: bg, alt: '', className: 'w-full h-full object-cover'})); }

    // الرئيسية
    setText('ov-kicker', t(home, 'welcomeKicker')); setText('ov-title', t(home, 'welcomeTitle'));
    setText('ov-heading', t(home, 'welcomeHeading')); setText('ov-text', t(home, 'welcomeText'));
    setText('ov-img2-label', t(home, 'welcomeImage2Label'));
    const i1 = byId('ov-img1'), i2 = byId('ov-img2');
    if (i1) i1.src = safeImg(home.welcomeImage, 700) || ''; if (i1) i1.alt = t(home, 'welcomeHeading');
    if (i2) i2.src = safeImg(home.welcomeImage2, 700) || '';
    (home.stats || []).slice(0, 2).forEach((st, i) => {
      setText(`stat-${i}-value`, st.value); setText(`stat-${i}-label`, t(st, 'label'));
      const icn = byId(`stat-${i}-icon`), cls = faIcon(st.icon, '');
      if (icn && cls) icn.className = `${cls} text-4xl mb-3 ${i === 0 ? 'text-lightBlue' : 'text-secondary'}`;
    });

    const nTracks = arr('tracks').length;
    setText('gw-tracks', nTracks ? L(`${nTracks} مسارات بحثية دقيقة.`, `${nTracks} specific research tracks.`) : L('مسارات بحثية دقيقة.', 'Specific research tracks.'));

    // الاتصال والمكان
    const email = isEmail(s.contactEmail || '') ? s.contactEmail : DEFAULT_EMAIL;
    ['contact-email', 'footer-email'].forEach((id) => { const a = byId(id); if (a) { a.textContent = email; a.href = 'mailto:' + email; } });
    const phone = (s.phone || '').trim();
    const pc = byId('contact-phone-card');
    if (pc) { pc.classList.toggle('hidden', !phone); pc.classList.toggle('flex', !!phone); setText('contact-phone', phone); }
    setText('venue-name', t(s, 'venueName')); setText('venue-desc', t(s, 'venueDescription'));
    setText('footer-address', t(s, 'address')); setText('footer-about', t(s, 'footerAbout')); setText('footer-copy', t(s, 'copyright'));
    const map = byId('venue-map'), mapUrl = safeHttps(s.mapEmbedUrl);
    if (map && mapUrl.startsWith('https://www.google.com/maps/embed') && map.getAttribute('src') !== mapUrl) map.src = mapUrl;
    const ml = byId('venue-link'), mlu = safeHttps(s.mapLinkUrl); if (ml && mlu) ml.href = mlu;

    const sub = safeHttps(s.paperSubmissionUrl);
    $$('[data-submit-link]').forEach((a) => { if (sub) a.href = sub; });
    $$('[data-register]').forEach((b) => b.classList.toggle('hidden', s.registrationOpen === false));

    const soc = byId('social-links');
    if (soc) soc.innerHTML = SOCIAL.map(([k, icon, hover, name]) => {
      const u = safeHttps(s[k]);
      return u ? `<a href="${esc(u)}" target="_blank" rel="noopener noreferrer" aria-label="${name}" class="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center ${hover} transition-colors shadow-sm"><i class="fab ${icon} text-white" aria-hidden="true"></i></a>` : '';
    }).join('');

    startCountdown(s.eventStart);
  }

  // ---------- العدّ التنازلي ----------
  let cdTimer = null;
  function startCountdown(iso) {
    clearInterval(cdTimer);
    const target = new Date(iso || '2027-10-20T07:00:00Z').getTime();
    const p2 = (n) => String(Math.max(0, n)).padStart(2, '0');
    const tick = () => {
      const d = Math.max(0, target - Date.now());
      byId('days').textContent = p2(Math.floor(d / 864e5));
      byId('hours').textContent = p2(Math.floor((d % 864e5) / 36e5));
      byId('minutes').textContent = p2(Math.floor((d % 36e5) / 6e4));
      byId('seconds').textContent = p2(Math.floor((d % 6e4) / 1e3));
    };
    tick(); cdTimer = setInterval(tick, 1000);
  }

  // ---------- الإعلانات ----------
  const annBadge = (a) => a.kind === 'important'
    ? `<span class="inline-flex items-center gap-1 bg-accent/10 text-accent border border-accent/20 px-3 py-1 rounded-full text-xs font-black"><i class="fas fa-star" aria-hidden="true"></i>${L('هام', 'Important')}</span>`
    : `<span class="inline-flex items-center gap-1 bg-secondary/10 text-secondary border border-secondary/20 px-3 py-1 rounded-full text-xs font-black"><i class="fas fa-newspaper" aria-hidden="true"></i>${L('إعلان', 'News')}</span>`;
  const excerpt = (s, n = 160) => { s = String(s || '').replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n).trimEnd() + '…' : s; };

  function annCard(a, delay = 0) {
    const im = safeImg(a.imageUrl, 700);
    return `<article class="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col" data-aos="fade-up" data-aos-delay="${delay}">
      ${im ? `<img src="${esc(im)}" alt="${esc(t(a, 'title'))}" loading="lazy" class="w-full h-48 object-cover">` : `<div class="h-2 bg-gradient-to-r from-primary via-accent to-secondary"></div>`}
      <div class="p-6 flex flex-col gap-3 flex-grow">
        <div class="flex items-center justify-between gap-2">${annBadge(a)}<time class="text-xs text-gray-400 font-bold" datetime="${esc(a.publishAt)}">${esc(fmtDate(a.publishAt, {day: '2-digit', month: 'long', year: 'numeric'}))}</time></div>
        <h3 class="text-lg font-black text-primary leading-snug">${a.pinned ? '<i class="fas fa-thumbtack text-accent text-sm" aria-hidden="true"></i> ' : ''}${esc(t(a, 'title'))}</h3>
        <p class="text-gray-500 text-sm leading-relaxed flex-grow">${esc(excerpt(t(a, 'body')))}</p>
        <button type="button" data-action="open-ann" data-id="${esc(a._id)}" class="self-start text-secondary font-black text-sm hover:underline">${L('اقرأ المزيد', 'Read more')} <i class="fas fa-arrow-left rtl:rotate-0 ltr:rotate-180 text-xs" aria-hidden="true"></i></button>
      </div></article>`;
  }

  function renderAnnouncements() {
    const list = activeAnnouncements();
    // شريط الهامة
    const bar = byId('important-bar'), imp = list.filter((a) => a.kind === 'important');
    if (bar) {
      bar.classList.toggle('hidden', imp.length === 0);
      const items = imp.map((a) => `<button type="button" data-action="open-ann" data-id="${esc(a._id)}" class="px-8 whitespace-nowrap font-bold text-sm hover:underline"><i class="fas fa-bullhorn mx-2" aria-hidden="true"></i>${esc(t(a, 'title'))}</button>`).join('');
      bar.innerHTML = `<div class="container mx-auto px-4 flex items-center gap-3 py-2">
        <span class="shrink-0 bg-white/20 px-3 py-1 rounded-full text-xs font-black">${L('إعلان هام', 'Important')}</span>
        <div class="marquee-wrap overflow-hidden flex-grow"><div class="marquee-track animate-marquee" aria-live="off">${items}${items}</div></div></div>`;
    }
    // الرئيسية
    const sec = byId('home-news-section');
    if (sec) { sec.classList.toggle('hidden', list.length === 0); byId('home-news-list').innerHTML = list.slice(0, 3).map((a, i) => annCard(a, i * 100)).join(''); }
    // صفحة الإعلانات
    const root = byId('news-root');
    if (root) {
      const periodic = list.filter((a) => a.kind !== 'important');
      const intro = `<p class="text-center text-gray-600 text-lg bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-10">${L('تابعوا هنا كل الإعلانات الهامة والدورية الخاصة بالمؤتمر.', 'Follow all important and periodic conference announcements here.')}</p>`;
      const block = (title, items) => items.length ? `<h3 class="text-2xl font-black text-primary mb-6 mt-4 border-b-2 border-accent inline-block pb-2">${title}</h3><div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">${items.map((a) => annCard(a)).join('')}</div>` : '';
      root.innerHTML = list.length ? intro + block(L('إعلانات هامة', 'Important announcements'), imp) + block(L('إعلانات دورية', 'Periodic announcements'), periodic) : emptyBox(L('لا توجد إعلانات حالياً.', 'No announcements at the moment.'));
    }
    maybePopup(imp);
  }

  function openAnn(id) {
    const a = arr('announcements').find((x) => x._id === id); if (!a) return;
    const im = safeImg(a.imageUrl, 1200), link = safeHttps(a.linkUrl);
    byId('ann-body').innerHTML = `${im ? `<img src="${esc(im)}" alt="" class="w-full max-h-72 object-cover">` : '<div class="h-3 bg-gradient-to-r from-primary via-accent to-secondary"></div>'}
      <div class="p-8 space-y-4">
        <div class="flex items-center gap-3 flex-wrap">${annBadge(a)}<time class="text-sm text-gray-400 font-bold">${esc(fmtDate(a.publishAt, {day: '2-digit', month: 'long', year: 'numeric'}))}</time></div>
        <h2 id="ann-title" class="text-2xl md:text-3xl font-black text-primary leading-snug">${esc(t(a, 'title'))}</h2>
        <p class="text-gray-600 leading-loose text-lg pre-line">${esc(t(a, 'body'))}</p>
        ${link ? `<a href="${esc(link)}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 bg-secondary hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl transition">${esc(t(a, 'linkLabel') || L('فتح الرابط', 'Open link'))} <i class="fas fa-external-link-alt text-sm" aria-hidden="true"></i></a>` : ''}
      </div>`;
    openModal('annModal');
  }

  let popupShown = false;
  function maybePopup(imp) {
    if (popupShown) return;
    const a = imp.find((x) => x.popup); if (!a) return;
    const key = `ann-seen:${a._id}:${a.publishAt}`;
    try { if (localStorage.getItem(key)) return; } catch { /* التخزين غير متاح */ }
    popupShown = true;
    setTimeout(() => { openAnn(a._id); try { localStorage.setItem(key, '1'); } catch { /* */ } }, 1200);
  }

  // ---------- صفحة: حول المؤتمر ----------
  function renderAbout() {
    const a = DATA.about || {}, root = byId('about-root'); if (!root) return;
    const pim = safeImg(a.preambleImage, 1000);
    const objs = (a.objectives || []).map((o, i) => {
      const s = OBJ_STYLE[i % OBJ_STYLE.length];
      return `<div class="flex items-start gap-5 p-6 bg-white rounded-2xl shadow-sm border border-gray-100 ${s.b} hover:shadow-md transition-all group">
        <div class="w-14 h-14 bg-bgLight ${s.c} rounded-full flex items-center justify-center text-xl shrink-0 border border-gray-200 ${s.h} group-hover:text-white transition-colors">${i + 1}</div>
        <div><h4 class="text-xl font-bold text-gray-800 mb-2">${esc(t(o, 'title'))}</h4><p class="text-gray-500 text-sm leading-relaxed">${esc(t(o, 'text'))}</p></div></div>`;
    }).join('');
    root.innerHTML = `
      <div class="bg-white rounded-[2.5rem] p-8 md:p-14 shadow-xl border border-gray-100 relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
        <div class="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-bl-[100%] transition-transform duration-700 group-hover:scale-125"></div>
        <div class="absolute bottom-0 left-0 w-40 h-40 bg-primary/5 rounded-tr-[100%] transition-transform duration-700 group-hover:scale-125"></div>
        <div class="flex flex-col lg:flex-row items-center gap-12 relative z-10">
          <div class="${pim ? 'lg:w-7/12' : 'w-full'}">
            <div class="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-primary/5 text-primary font-bold mb-6 border border-primary/10"><i class="fas fa-book-open text-accent" aria-hidden="true"></i><span>${L('ديباجة المؤتمر', 'Conference Preamble')}</span></div>
            <h2 class="text-3xl md:text-5xl font-black text-gray-800 mb-6 leading-tight">${esc(t(a, 'preambleTitle'))}</h2>
            <p class="text-gray-600 leading-loose text-lg text-justify-custom pre-line">${esc(t(a, 'preamble'))}</p>
          </div>
          ${pim ? `<div class="lg:w-5/12 w-full relative"><div class="absolute inset-0 bg-gradient-to-tr from-primary to-accent opacity-20 rounded-[2rem] transform translate-x-3 translate-y-3"></div>
            <div class="relative rounded-[2rem] overflow-hidden shadow-lg border-4 border-white"><img src="${esc(pim)}" alt="" class="w-full h-[350px] object-cover transform group-hover:scale-110 transition-transform duration-700"></div></div>` : ''}
        </div>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div class="bg-gradient-to-br from-primary to-blue-900 text-white p-10 md:p-14 rounded-[2.5rem] shadow-xl relative overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
          <i class="fas fa-star absolute -bottom-10 rtl:-left-10 ltr:-right-10 text-9xl text-white/5 transform -rotate-12" aria-hidden="true"></i>
          <div class="relative z-10">
            <div class="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-3xl text-accent mb-8 backdrop-blur-sm border border-white/20 shadow-inner"><i class="fas fa-gem" aria-hidden="true"></i></div>
            <h3 class="text-3xl font-black mb-6 drop-shadow-md">${L('أهمية المؤتمر', 'Conference Importance')}</h3>
            <p class="text-gray-200 leading-loose text-lg text-justify-custom pre-line">${esc(t(a, 'importance'))}</p>
          </div>
        </div>
        <div class="bg-white p-10 md:p-14 rounded-[2.5rem] shadow-xl border border-gray-100 relative overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
          <div class="absolute top-0 rtl:left-0 ltr:right-0 w-2 h-full bg-secondary"></div>
          <i class="fas fa-question-circle absolute -top-10 rtl:-right-10 ltr:-left-10 text-9xl text-gray-50" aria-hidden="true"></i>
          <div class="relative z-10">
            <div class="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center text-3xl text-secondary mb-8 border border-secondary/20 shadow-sm"><i class="fas fa-lightbulb" aria-hidden="true"></i></div>
            <h3 class="text-3xl font-black text-gray-800 mb-6">${L('إشكالية المؤتمر', 'Problem Statement')}</h3>
            <p class="text-gray-600 leading-relaxed text-lg text-justify-custom mb-6">${esc(t(a, 'problemIntro'))}</p>
            <div class="bg-bgLight p-6 rounded-2xl border border-gray-200 border-r-4 rtl:border-r-secondary ltr:border-l-secondary ltr:border-r-0 shadow-inner"><p class="text-primary font-bold text-xl leading-relaxed text-center">${esc(t(a, 'problemQuestion'))}</p></div>
          </div>
        </div>
      </div>
      ${objs ? `<div class="bg-white rounded-[2.5rem] p-10 md:p-14 shadow-xl border border-gray-100 relative overflow-hidden">
        <div class="relative z-10 text-center mb-14 mt-4">
          <span class="inline-flex items-center gap-2 bg-accent/10 text-accent px-6 py-2 rounded-full font-bold text-sm mb-4 border border-accent/20"><i class="fas fa-bullseye" aria-hidden="true"></i> ${L('غاياتنا ومقاصدنا', 'Our Goals & Purposes')}</span>
          <h3 class="text-3xl md:text-5xl font-black text-primary drop-shadow-sm">${L('الأهداف الرئيسية للمؤتمر', 'Main Conference Objectives')}</h3>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">${objs}</div></div>` : ''}`;
  }

  // ---------- المحاور ----------
  function renderTopics() {
    const root = byId('topics-root'), tr = arr('tracks'); if (!root) return;
    const intro = t(DATA.about || {}, 'tracksIntro');
    root.innerHTML = `${intro ? `<div class="text-center mb-12 max-w-3xl mx-auto"><p class="text-gray-600 text-lg leading-relaxed bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">${esc(intro)}</p></div>` : ''}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">${tr.length ? tr.map((x, i) => {
        const c = TRACK_COLOR[x.color] || TRACK_COLOR.primary, ic = TRACK_ICON[x.icon] ? 'fas ' + TRACK_ICON[x.icon] : faIcon(x.icon, 'fas fa-shield-alt');
        return `<div class="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
          <div class="w-16 h-16 ${c.box} rounded-2xl flex items-center justify-center mb-6 text-3xl"><i class="${ic}" aria-hidden="true"></i></div>
          <h3 class="text-xl font-black text-gray-800 mb-2">${esc(t(x, 'kicker') || L(`المحور ${x.order ?? i + 1}`, `Track ${x.order ?? i + 1}`))}</h3>
          <p class="${c.text} font-bold mb-4 border-b pb-3">${esc(t(x, 'title'))}</p>
          <p class="text-gray-500 text-sm leading-relaxed">${esc(t(x, 'description'))}</p></div>`;
      }).join('') : emptyBox(EMPTY())}</div>`;
  }

  // ---------- تاريخ المؤتمر ----------
  function renderHistoryList() {
    const root = byId('history-root'); if (!root) return;
    const eds = arr('editions');
    root.innerHTML = `<div class="max-w-4xl mx-auto text-center mb-12">
      <h3 class="text-3xl md:text-5xl font-black text-primary mb-4">${L('تاريخ المؤتمر والنسخ السابقة', 'Conference History & Editions')}</h3>
      <div class="w-24 h-1.5 bg-accent mx-auto rounded-full mb-6"></div>
      <p class="text-gray-600 text-lg">${L('نظرة عامة على النسخ السابقة والإنجازات الأكاديمية التي حققها المؤتمر.', 'An overview of past editions and academic achievements of the conference.')}</p></div>
      <div class="space-y-10">${eds.length ? eds.map((e) => {
        const logo = safeImg(e.logoUrl, 600);
        return `<div class="max-w-5xl mx-auto bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden group hover:shadow-2xl transition-all duration-500">
          <div class="flex flex-col md:flex-row items-center">
            <div class="md:w-5/12 bg-gray-50 p-8 h-full flex justify-center items-center border-b md:border-b-0 rtl:md:border-l ltr:md:border-r border-gray-100 relative overflow-hidden">
              <div class="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              ${logo ? `<img src="${esc(logo)}" alt="ICEIC ${esc(e.editionYear)}" class="w-full h-auto object-cover rounded-xl shadow-md border-2 border-white transform group-hover:scale-105 transition-transform duration-500 z-10">` : `<i class="fas fa-landmark text-7xl text-primary/20" aria-hidden="true"></i>`}
            </div>
            <div class="md:w-7/12 p-8 md:p-12 text-center md:text-start rtl:md:text-right ltr:md:text-left relative">
              <span class="inline-block bg-accent/10 text-accent font-bold px-4 py-1 rounded-full text-sm mb-4 border border-accent/20">${esc(t(e, 'dateLabel') || e.editionYear)}</span>
              <h4 class="text-2xl md:text-3xl font-black text-primary mb-4 leading-snug">${esc(t(e, 'title'))}</h4>
              <p class="text-gray-500 leading-relaxed mb-8">${esc(t(e, 'summary'))}</p>
              <a href="#history-${esc(e.editionYear)}" class="inline-flex items-center gap-2 bg-primary hover:bg-blue-900 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-md hover:-translate-y-1"><span>${L('تفاصيل أكثر', 'More Details')}</span> <i class="fas fa-arrow-left rtl:rotate-0 ltr:rotate-180" aria-hidden="true"></i></a>
            </div></div></div>`;
      }).join('') : emptyBox(EMPTY())}</div>`;
  }

  function renderEdition(year) {
    const root = byId('edition-root'); if (!root) return;
    const e = arr('editions').find((x) => String(x.editionYear) === String(year));
    if (!e) { root.innerHTML = emptyBox(L('النسخة غير موجودة.', 'Edition not found.')); return; }
    const logo = safeImg(e.logoUrl, 500), pdf = safeFile(e.programPdfUrl);
    const vid = youtubeId(lang === 'ar' ? e.videoUrl_ar || e.videoUrl_en : e.videoUrl_en || e.videoUrl_ar);
    const photos = [...(e.gallery || []).map((g) => ({url: g.url, cap: t(g, 'caption')})), ...(e.legacyImages || []).filter(Boolean).map((u) => ({url: u, cap: ''}))]
      .map((p) => ({full: safeImg(p.url, 1600), thumb: safeImg(p.url, 800), cap: p.cap})).filter((p) => p.thumb);
    const recs = t(e, 'recommendations');
    const pillars = [['fa-medal', L('التميز العلمي', 'Scientific Excellence'), t(e, 'excellence')], ['fa-search-dollar', L('محاور النقاش', 'Key Topics'), t(e, 'topics')], ['fa-trophy', L('إنجاز وطموح', 'Achievement'), t(e, 'achievement')]].filter((p) => p[2]);
    root.innerHTML = `
      <div class="bg-gradient-to-br from-primary to-blue-900 rounded-[3rem] p-10 md:p-16 shadow-2xl relative overflow-hidden text-white mb-12">
        <div class="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl"></div>
        <div class="relative z-10 flex flex-col md:flex-row items-center gap-10">
          <div class="${logo ? 'md:w-3/4' : 'w-full'} text-center md:text-start rtl:md:text-right ltr:md:text-left">
            <span class="inline-block bg-white/10 backdrop-blur-sm text-accent font-bold px-5 py-2 rounded-full text-sm mb-6 border border-white/20">${esc(t(e, 'dateLabel') || e.editionYear)}</span>
            <h2 class="text-3xl md:text-5xl font-black mb-6 leading-tight drop-shadow-md">${esc(t(e, 'title'))}</h2>
            <p class="text-gray-300 text-lg md:text-xl max-w-3xl leading-relaxed">${esc(t(e, 'intro'))}</p>
            ${pdf ? `<div class="mt-8"><a href="${esc(pdf)}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-3 bg-white hover:bg-gray-100 text-primary font-black py-4 px-8 rounded-xl transition-all shadow-xl hover:-translate-y-1"><i class="fas fa-file-pdf text-2xl text-red-600" aria-hidden="true"></i> <span>${L('تحميل برنامج المؤتمر (PDF)', 'Download Conference Program (PDF)')}</span></a></div>` : ''}
          </div>
          ${logo ? `<div class="md:w-1/4 flex justify-center"><img src="${esc(logo)}" alt="ICEIC ${esc(e.editionYear)}" class="w-48 h-auto object-contain drop-shadow-2xl bg-white p-2 rounded-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500"></div>` : ''}
        </div>
      </div>
      ${(e.stats || []).length ? `<div class="grid grid-cols-2 md:grid-cols-3 gap-6 mb-16">${e.stats.map((s, i) => `<div class="${STAT_BG[i % STAT_BG.length]} p-6 rounded-3xl shadow-sm text-center transform hover:-translate-y-2 transition-all border"><h4 class="text-5xl font-black text-gray-900 mb-2" dir="ltr">${esc(s.value)}</h4><p class="text-gray-600 font-bold text-lg">${esc(t(s, 'label'))}</p></div>`).join('')}</div>` : ''}
      ${pillars.length ? `<div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">${pillars.map(([ic, ttl, txt]) => `<div class="bg-bgLight p-8 rounded-[2rem] border border-gray-200 shadow-sm hover:shadow-md transition"><h4 class="text-xl font-black text-primary mb-4 flex items-center gap-3"><i class="fas ${ic} text-accent text-2xl" aria-hidden="true"></i> <span>${ttl}</span></h4><p class="text-gray-600 text-justify-custom leading-relaxed pre-line">${esc(txt)}</p></div>`).join('')}</div>` : ''}
      <div class="bg-white rounded-[3rem] p-8 md:p-14 shadow-xl border border-gray-100 mb-16 relative overflow-hidden">
        <div class="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-bl-full"></div>
        <div class="flex items-center gap-4 mb-8 relative z-10">
          <div class="w-16 h-16 bg-secondary/10 text-secondary rounded-2xl flex items-center justify-center text-3xl shrink-0"><i class="fas fa-scroll" aria-hidden="true"></i></div>
          <div><h3 class="text-2xl md:text-3xl font-black text-primary">${L('توصيات المؤتمر', 'Conference Recommendations')}</h3><p class="text-gray-500 font-bold">${L(`النسخة ${esc(e.editionYear)}`, `Edition ${esc(e.editionYear)}`)}</p></div>
        </div>
        <div class="bg-bgLight p-8 md:p-10 rounded-3xl border border-gray-200 border-r-4 rtl:border-r-secondary ltr:border-l-secondary ltr:border-r-0 relative z-10">
          ${recs ? `<p class="text-gray-800 font-bold text-lg leading-loose pre-line">${esc(recs)}</p>` : `<p class="text-gray-500 text-lg leading-loose italic">${L('سيتم إدراج نص التوصيات والنتائج التي خلص إليها المؤتمر هنا قريباً...', 'The recommendations and conclusions of the conference will be listed here soon...')}</p>`}
        </div>
      </div>
      <div class="bg-white rounded-[3rem] p-8 md:p-14 shadow-xl border border-gray-100 mb-16">
        <div class="text-center mb-12"><h3 class="text-3xl font-black text-primary mb-2">${esc(t(e, 'galleryTitle') || L('معرض الصور', 'Gallery'))}</h3><div class="w-16 h-1 bg-accent mx-auto rounded-full"></div></div>
        ${vid ? `<div class="mb-10 w-full max-w-4xl mx-auto"><div class="relative w-full aspect-video overflow-hidden rounded-[2rem] shadow-xl border-4 border-white"><iframe class="absolute inset-0 w-full h-full" src="https://www.youtube-nocookie.com/embed/${esc(vid)}" title="Video" loading="lazy" sandbox="allow-scripts allow-same-origin allow-presentation" allow="encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div></div>` : ''}
        ${photos.length ? `<div class="masonry-grid">${photos.map((p) => `<button type="button" data-action="open-img" data-src="${esc(p.full)}" data-alt="${esc(p.cap)}" class="masonry-item block w-full rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300"><img src="${esc(p.thumb)}" alt="${esc(p.cap || t(e, 'title'))}" loading="lazy" class="w-full h-auto hover:scale-105 transition-transform duration-500"></button>`).join('')}</div>` : `<div class="text-center py-10 w-full text-gray-500 font-bold">${L('سيتم إضافة صور المؤتمر قريباً.', 'Conference photos will be added soon.')}</div>`}
      </div>`;
  }

  // ---------- اللجان ----------
  const personName = (m) => t(m, 'name');
  function renderCommittees() {
    const all = arr('committee'), none = emptyBox(L('لا يوجد أعضاء مضافين حالياً.', 'No members added yet.'));
    const hi = all.filter((c) => c.committeeType === 'high'), hc = byId('high-members');
    if (hc) hc.innerHTML = hi.length ? `<div class="flex flex-col gap-6 w-full">${hi.map((m) => {
      const inst = t(m, 'institution'), im = safeImg(m.imageUrl, 300) || AVATAR;
      return `<div class="bg-white p-6 md:p-8 rounded-[2rem] shadow-lg border border-gray-100 flex flex-col md:flex-row items-center gap-6 max-w-4xl mx-auto w-full hover:-translate-y-1 transition transform group">
        <img src="${esc(im)}" alt="${esc(personName(m))}" loading="lazy" class="w-28 h-28 md:w-32 md:h-32 rounded-full object-cover border-4 border-accent shadow-sm group-hover:scale-105 transition-transform">
        <div class="text-center md:text-start rtl:md:text-right ltr:md:text-left flex-grow"><h4 class="text-2xl font-black text-primary mb-2">${esc(personName(m))}</h4>
          <span class="inline-block bg-accent/10 text-accent font-bold px-4 py-1.5 rounded-full text-sm mb-2 border border-accent/20">${esc(t(m, 'role'))}</span>
          ${inst ? `<p class="text-gray-500 text-sm font-bold"><i class="fas fa-university text-gray-400" aria-hidden="true"></i> ${esc(inst)}</p>` : ''}</div></div>`;
    }).join('')}</div>` : `<div class="text-gray-400 font-bold py-5">${L('لا يوجد أعضاء مضافين حالياً.', 'No members added yet.')}</div>`;

    const grid = (type, color, id) => {
      const box = byId(id); if (!box) return;
      const ms = all.filter((c) => c.committeeType === type), c = COM_COLOR[color];
      if (!ms.length) { box.innerHTML = none; return; }
      const pres = ms.find((m) => m.order === 1), others = ms.filter((m) => m !== pres);
      const presHtml = pres ? (() => {
        const inst = t(pres, 'institution'), im = safeImg(pres.imageUrl, 300) || AVATAR;
        return `<div class="col-span-full mb-10"><div class="bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100 shadow-xl max-w-3xl mx-auto flex flex-col md:flex-row items-center gap-6 relative overflow-hidden group hover:shadow-2xl transition transform hover:-translate-y-1">
          <div class="absolute top-0 right-0 w-2 h-full ${c.bar}"></div>
          <img src="${esc(im)}" alt="${esc(personName(pres))}" loading="lazy" class="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md z-10 relative">
          <div class="text-center md:text-start rtl:md:text-right ltr:md:text-left flex-grow z-10 relative"><span class="font-black text-primary text-2xl block mb-2">${esc(personName(pres))}</span>
            <span class="text-sm ${c.text} font-bold inline-block px-4 py-1.5 ${c.soft} rounded-full mb-2 border ${c.ring}">${esc(t(pres, 'role'))}</span>
            ${inst ? `<p class="text-sm text-gray-500 font-bold mt-1"><i class="fas fa-university text-gray-400" aria-hidden="true"></i> ${esc(inst)}</p>` : ''}</div>
          <i class="fas fa-star ${c.star} text-8xl absolute -bottom-4 rtl:-left-4 ltr:-right-4 rotate-12 group-hover:rotate-0 transition-transform duration-500" aria-hidden="true"></i></div></div>`;
      })() : '';
      box.innerHTML = presHtml + others.map((m) => {
        const inst = t(m, 'institution');
        return `<div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition hover:-translate-y-1 relative group">
          <div class="w-1 h-full ${c.bar} absolute top-0 rtl:right-0 ltr:left-0 rounded-r-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <span class="font-black text-primary text-lg block mb-1">${esc(personName(m))}</span><span class="text-sm ${c.text} font-bold block mb-3">${esc(t(m, 'role'))}</span>
          ${inst ? `<span class="text-sm text-gray-500 font-bold"><i class="fas fa-university text-gray-400" aria-hidden="true"></i> ${esc(inst)}</span>` : ''}</div>`;
      }).join('');
    };
    grid('scientific', 'accent', 'scientific-members');
    grid('organizing', 'blue', 'organizing-members');
  }

  // ---------- المتحدثون ----------
  function renderSpeakers() {
    const box = byId('speakers-container'), sp = arr('speakers'); if (!box) return;
    box.innerHTML = sp.length ? sp.map((s, i) => {
      const g = SPK_GRAD[i % SPK_GRAD.length], im = safeImg(s.imageUrl, 400) || AVATAR;
      return `<div class="bg-white rounded-[2rem] p-8 shadow-xl border border-gray-100 text-center relative overflow-hidden group">
        <div class="absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${g}"></div>
        <div class="w-40 h-40 mx-auto rounded-full bg-gradient-to-tr ${g} p-1 mb-6 mt-4 shadow-lg group-hover:scale-105 transition-transform duration-500"><img src="${esc(im)}" alt="${esc(t(s, 'name'))}" loading="lazy" class="w-full h-full object-cover rounded-full border-4 border-white bg-white"></div>
        <h3 class="text-2xl font-black text-primary mb-1">${esc(t(s, 'name'))}</h3>
        <p class="text-accent font-bold mb-4 text-sm uppercase tracking-wide">${esc(t(s, 'role'))}</p>
        <p class="text-gray-500 text-sm leading-relaxed mb-6">${esc(t(s, 'bio'))}</p></div>`;
    }).join('') : `<div class="col-span-full text-center py-20 text-gray-400"><i class="fas fa-user-tie text-5xl mb-4" aria-hidden="true"></i><p class="font-bold text-lg">${L('سيتم الإعلان عن المتحدثين قريباً.', 'Speakers will be announced soon.')}</p></div>`;
  }

  // ---------- البرنامج ----------
  let progTab = 0;
  function renderProgram() {
    const root = byId('program-root'), days = arr('program'); if (!root) return;
    if (!days.length) { root.innerHTML = `<div class="p-12 text-center text-gray-400 font-bold">${L('سيتم نشر البرنامج قريباً.', 'The program will be published soon.')}</div>`; return; }
    if (progTab >= days.length) progTab = 0;
    const label = (d, i) => t(d, 'label') || (lang === 'ar'
      ? `اليوم ${ORD_AR[(d.dayNumber || i + 1) - 1] || d.dayNumber} (${fmtDate(d.date, {day: 'numeric', month: 'long'})})`
      : `Day ${d.dayNumber || i + 1} (${fmtDate(d.date, {day: 'numeric', month: 'short'})})`);
    root.innerHTML = `<div class="flex flex-col sm:flex-row border-b border-gray-200" role="tablist">${days.map((d, i) =>
      `<button type="button" role="tab" data-action="prog-tab" data-tab="${i}" aria-selected="${i === progTab}" class="program-tab flex-1 py-6 font-bold text-xl transition-colors ${i === progTab ? 'bg-primary text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}">${esc(label(d, i))}</button>`).join('')}</div>
      ${days.map((d, i) => `<div data-prog-panel="${i}" class="${i === progTab ? '' : 'hidden'} p-8 md:p-12 space-y-4">${(d.sessions || []).map((s) =>
        `<div class="flex flex-col md:flex-row gap-6 items-center hover:bg-bgLight p-6 rounded-2xl transition border border-transparent hover:border-gray-100">
          <div class="${SESSION_BG[s.color] || 'bg-primary'} text-white font-bold py-3 px-6 rounded-xl whitespace-nowrap min-w-[160px] text-center shadow-md" dir="ltr">${esc(s.timeFrom)}${s.timeTo ? ' - ' + esc(s.timeTo) : ''}</div>
          <div class="flex-grow text-center md:text-start rtl:md:text-right ltr:md:text-left"><h4 class="text-xl font-bold text-primary mb-1">${esc(t(s, 'title'))}</h4><p class="text-sm text-gray-500">${esc(t(s, 'place'))}</p></div></div>`).join('') || `<p class="text-center text-gray-400 font-bold">${EMPTY()}</p>`}</div>`).join('')}`;
  }

  // ---------- المشاركة والنشر ----------
  function renderSubmission() {
    const root = byId('submission-root'); if (!root) return;
    const sub = DATA.submission || {}, s = DATA.settings || {}, dates = arr('dates');
    const url = safeHttps(s.paperSubmissionUrl), tpl = safeFile(sub.templateUrl);
    root.innerHTML = `
      <div id="sub-dates" class="bg-white p-10 rounded-[2rem] shadow-xl border border-gray-100 scroll-mt-24">
        <h3 class="text-2xl font-black mb-8 text-primary border-b-2 pb-4 inline-block">${L('تواريخ مهمة', 'Important Dates')}</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">${dates.length ? dates.map((d, i) => {
          const st = DATE_STYLE[i % DATE_STYLE.length];
          return `<div class="bg-bgLight p-8 rounded-2xl border border-gray-200 shadow-sm text-center transform transition hover:-translate-y-2 hover:shadow-md">
            <div class="w-14 h-14 ${st.box} rounded-full flex items-center justify-center text-2xl mx-auto mb-4"><i class="${DATE_ICON[d.icon] || faIcon(d.icon, DATE_ICON.calendar)}" aria-hidden="true"></i></div>
            <h4 class="font-bold text-gray-800 mb-2">${esc(t(d, 'title'))}</h4><p class="${st.text} font-black text-xl">${esc(fmtDate(d.date, {day: '2-digit', month: lang === 'ar' ? 'long' : 'short', year: 'numeric'}))}</p></div>`;
        }).join('') : emptyBox(EMPTY())}</div></div>
      <div id="sub-guidelines" class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch scroll-mt-24">
        <div class="bg-primary text-white p-10 rounded-[2rem] shadow-xl relative overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-br from-transparent to-blue-900 opacity-50"></div>
          <i class="fas fa-file-signature absolute -bottom-10 rtl:-left-10 ltr:-right-10 text-9xl text-white/5 transform -rotate-12" aria-hidden="true"></i>
          <h3 class="text-2xl font-black mb-6 text-accent border-b border-white/20 pb-4 relative z-10">${L('إرشادات المؤلف وقواعد النشر', 'Author & Submission Guidelines')}</h3>
          <ul class="space-y-4 relative z-10">${(sub.guidelines || []).map((g) => `<li class="flex items-start gap-4 bg-white/5 p-4 rounded-xl"><div class="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-accent shrink-0 mt-1"><i class="fas fa-check text-xs" aria-hidden="true"></i></div><span class="text-base leading-relaxed">${esc(t(g, 'text'))}</span></li>`).join('')}</ul>
          ${tpl ? `<div class="mt-8 relative z-10"><a href="${esc(tpl)}" target="_blank" rel="noopener noreferrer" download class="w-full bg-white text-primary hover:bg-accent hover:text-white font-bold py-4 rounded-xl transition shadow-lg flex items-center justify-center gap-3 text-lg"><i class="fas fa-download" aria-hidden="true"></i> ${L('تحميل قالب البحث (Template)', 'Download Paper Template')}</a></div>` : ''}
        </div>
        <div class="bg-white p-10 rounded-[2rem] shadow-xl border border-gray-100 flex flex-col justify-center items-center text-center">
          <div class="w-28 h-28 bg-secondary/10 text-secondary rounded-full flex items-center justify-center text-5xl mb-6"><i class="fas fa-external-link-alt" aria-hidden="true"></i></div>
          <h3 class="text-3xl font-black text-primary mb-4">${L('إرسال الورقة البحثية', 'Paper Submission')}</h3>
          <p class="text-gray-500 mb-8 text-lg">${esc(t(sub, 'platformNote'))}</p>
          ${url ? `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer" class="bg-secondary hover:bg-green-700 text-white font-bold py-4 px-10 rounded-2xl transition-all shadow-xl transform hover:-translate-y-1 text-xl w-full text-center flex justify-center items-center gap-3"><i class="fas fa-paper-plane" aria-hidden="true"></i> <span>${L('تقديم الورقة عبر المنصة', 'Submit via Platform')}</span></a>` : ''}
        </div>
      </div>`;
  }

  // ---------- الرعاة ----------
  function renderSponsors() {
    const root = byId('sponsors-root'); if (!root) return;
    const all = arr('sponsors');
    if (!all.length) { root.innerHTML = `<div class="text-center py-20 text-gray-400"><i class="fas fa-handshake text-5xl mb-4" aria-hidden="true"></i><p class="font-bold text-lg">${L('سيتم الإعلان عن الرعاة والشركاء قريباً.', 'Sponsors and partners will be announced soon.')}</p></div>`; return; }
    const logo = (s, cls) => {
      const im = safeImg(s.logoUrl, 500), u = safeHttps(s.url);
      const inner = im ? `<img src="${esc(im)}" alt="${esc(s.name)}" loading="lazy" class="max-h-full max-w-full object-contain">` : `<span class="text-gray-500 text-xl font-bold">${esc(s.name)}</span>`;
      const tag = u ? `a href="${esc(u)}" target="_blank" rel="noopener noreferrer"` : 'div';
      return `<${tag} class="${cls}">${inner}</${u ? 'a' : 'div'}>`;
    };
    const tiers = [
      ['platinum', L('الراعي الماسي', 'Platinum Sponsor'), 'text-3xl font-black text-gray-400 mb-10 uppercase tracking-widest border-b-2 border-gray-200 inline-block pb-4', 'bg-white border border-gray-200 p-8 rounded-[3rem] shadow-lg w-[22rem] h-48 flex items-center justify-center hover:shadow-2xl transition-all transform hover:-translate-y-2'],
      ['gold', L('الرعاة الذهبيون', 'Gold Sponsors'), 'text-2xl font-black text-accent mb-10 uppercase tracking-widest border-b-2 border-accent inline-block pb-4', 'bg-white border border-yellow-100 p-6 rounded-3xl shadow-md w-72 h-36 flex items-center justify-center hover:shadow-xl transition-all transform hover:-translate-y-1'],
      ['silver', L('الرعاة الفضيون', 'Silver Sponsors'), 'text-xl font-black text-gray-500 mb-8 uppercase tracking-widest border-b-2 border-gray-300 inline-block pb-3', 'bg-white border border-gray-200 p-5 rounded-3xl shadow-sm w-60 h-32 flex items-center justify-center hover:shadow-lg transition-all transform hover:-translate-y-1'],
      ['partner', L('الشركاء', 'Partners'), 'text-xl font-black text-primary mb-8 uppercase tracking-widest border-b-2 border-primary/30 inline-block pb-3', 'bg-white border border-gray-100 p-5 rounded-3xl shadow-sm w-52 h-28 flex items-center justify-center hover:shadow-lg transition-all transform hover:-translate-y-1'],
    ];
    root.innerHTML = tiers.map(([k, title, hcls, ccls]) => {
      const items = all.filter((s) => s.tier === k); if (!items.length) return '';
      return `<div class="mb-20 text-center"><h3 class="${hcls}">${title}</h3><div class="flex flex-wrap justify-center gap-10 mt-4">${items.map((s) => logo(s, ccls)).join('')}</div></div>`;
    }).join('');
  }

  // ---------- التسجيل والرسائل (mailto — لا خادم، لا تخزين لبيانات الزوار) ----------
  function setStatus(el, ok, msg) {
    el.textContent = msg; el.classList.remove('hidden', 'bg-green-50', 'text-green-700', 'bg-red-50', 'text-red-700');
    el.classList.add(...(ok ? ['bg-green-50', 'text-green-700'] : ['bg-red-50', 'text-red-700']));
  }
  const clean = (s, n) => String(s || '').replace(/[\u0000-\u001f\u007f]+/g, ' ').trim().slice(0, n);
  function sendMail(subject, body) {
    const s = DATA.settings || {}, to = isEmail(s.contactEmail || '') ? s.contactEmail : DEFAULT_EMAIL;
    window.location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }
  function bindForms() {
    byId('contact-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const name = clean(byId('cf-name').value, 100), email = clean(byId('cf-email').value, 120), msg = String(byId('cf-msg').value || '').replace(/\u0000/g, '').trim().slice(0, 1500), st = byId('cf-status');
      if (!name || !msg) return setStatus(st, false, L('يرجى ملء جميع الحقول.', 'Please fill in all fields.'));
      if (!isEmail(email)) return setStatus(st, false, L('البريد الإلكتروني غير صالح.', 'Invalid email address.'));
      sendMail(`[ICEIC 2027] ${name}`, `${msg}\n\n— ${name} <${email}>`);
      setStatus(st, true, L('تم تجهيز رسالتك في برنامج البريد لديك. اضغط "إرسال" هناك لإتمامها.', 'Your message is ready in your mail app. Press "Send" there to finish.'));
    });
    byId('register-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const name = clean(byId('rf-name').value, 100), email = clean(byId('rf-email').value, 120), st = byId('rf-status');
      if (!name) return setStatus(st, false, L('يرجى إدخال الاسم الكامل.', 'Please enter your full name.'));
      if (!isEmail(email)) return setStatus(st, false, L('البريد الإلكتروني غير صالح.', 'Invalid email address.'));
      sendMail(`[ICEIC 2027] ${L('طلب تسجيل', 'Registration request')} — ${name}`, `${L('الاسم الكامل', 'Full name')}: ${name}\n${L('البريد الإلكتروني', 'Email')}: ${email}`);
      setStatus(st, true, L('تم تجهيز طلب التسجيل في برنامج البريد لديك. اضغط "إرسال" لإتمامه.', 'Your registration request is ready in your mail app. Press "Send" to finish.'));
    });
  }

  // ---------- اللغة ----------
  function applyStaticI18n() {
    $$('[data-ar]').forEach((el) => { const v = el.getAttribute(`data-${lang}`); if (v != null) el.innerHTML = v; }); // نصوص ثابتة من index.html فقط
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    byId('lang-text').textContent = lang === 'ar' ? 'English' : 'العربية';
    document.body.classList.toggle('font-poppins', lang === 'en');
    document.body.classList.toggle('font-cairo', lang === 'ar');
    byId('mobile-menu-btn').setAttribute('aria-label', L('القائمة', 'Menu'));
  }
  function renderAll(silent) {
    applyStaticI18n(); applySettings(); renderAnnouncements(); renderAbout(); renderTopics(); renderHistoryList();
    renderCommittees(); renderSpeakers(); renderProgram(); renderSubmission(); renderSponsors();
    const m = location.hash.slice(1).split('?')[0].match(/^history-(\d{4})$/); if (m) renderEdition(m[1]);
    if (!silent) route(true);
  }
  function toggleLang() {
    lang = lang === 'ar' ? 'en' : 'ar';
    try { localStorage.setItem('lang', lang); } catch { /* */ }
    renderAll();
  }

  // ---------- التوجيه (SPA) ----------
  const ROUTES = ['home', 'news', 'about', 'history', 'topics', 'speakers', 'program', 'committees', 'submission', 'contact', 'venue', 'sponsors'];
  const ICONS = {news: 'fa-bullhorn', about: 'fa-info-circle', history: 'fa-landmark', edition: 'fa-calendar-check', topics: 'fa-project-diagram', speakers: 'fa-users', program: 'fa-calendar-alt', committees: 'fa-sitemap', submission: 'fa-upload', contact: 'fa-envelope', venue: 'fa-map-marker-alt', sponsors: 'fa-handshake'};
  const TITLES = () => ({
    news: L('الإعلانات', 'Announcements'), about: L('حول المؤتمر', 'About Conference'), history: L('تاريخ المؤتمر', 'Conference History'),
    topics: L('محاور المؤتمر', 'Conference Tracks'), speakers: L('المتحدثون الرئيسيون', 'Keynote Speakers'), program: L('برنامج المؤتمر', 'Conference Program'),
    committees: L('لجان المؤتمر', 'Committees'), submission: L('المشاركة والنشر', 'Submission & Publication'), contact: L('اتصل بنا', 'Contact Us'),
    venue: L('مكان الانعقاد', 'Venue'), sponsors: L('الرعاة والشركاء', 'Sponsors & Partners'),
  });

  function route(keepScroll) {
    const full = location.hash.slice(1);
    const [rawBase, query] = full.split('?');
    let base = rawBase, edition = null;
    const em = /^history-(\d{4})$/.exec(rawBase || '');
    if (em) { edition = em[1]; base = 'edition'; }
    else if (!ROUTES.includes(rawBase)) { base = 'home'; history.replaceState(null, '', '#home'); }

    $$('.spa-view').forEach((v) => v.classList.remove('active'));
    const isHome = base === 'home';
    const view = byId(isHome ? 'view-home' : 'view-details'); view.classList.add('active');
    byId('subpage-header').classList.toggle('hidden', isHome);

    if (!isHome) {
      $$('.detail-section').forEach((s) => s.classList.remove('active'));
      byId('detail-' + base).classList.add('active');
      let title = TITLES()[base];
      if (edition) { renderEdition(edition); title = L(`تفاصيل نسخة ${edition}`, `${edition} Edition Details`); }
      byId('subpage-title').textContent = title || '';
      byId('detail-breadcrumb').textContent = title || '';
      byId('subpage-icon').className = `fas ${ICONS[base] || 'fa-layer-group'}`;
    }

    $$('.nav-link, .mobile-link').forEach((a) => {
      a.classList.remove('active');
      const h = a.getAttribute('href');
      if (h && (h === `#${rawBase}` || h === `#${full}` || (edition && h === '#history'))) a.classList.add('active');
    });

    if (query) {
      const p = new URLSearchParams(query);
      const tab = p.get('tab');
      if (base === 'committees' && ['high', 'scientific', 'organizing'].includes(tab)) switchComTab(tab);
      const sec = p.get('section');
      if (sec && /^[\w-]+$/.test(sec)) { const el = byId(sec); if (el) setTimeout(() => el.scrollIntoView({behavior: 'smooth', block: 'start'}), 300); }
      else window.scrollTo({top: 0, behavior: keepScroll ? 'auto' : 'smooth'});
    } else window.scrollTo({top: 0, behavior: keepScroll ? 'auto' : 'smooth'});

    setTimeout(() => { $$('.aos-init').forEach((el) => el.classList.remove('aos-animate')); window.AOS && AOS.refresh(); }, 100);
  }

  function switchComTab(name) {
    $$('.com-content').forEach((el) => el.classList.add('hidden'));
    $$('.com-tab').forEach((b) => { b.classList.remove('bg-primary', 'text-white', 'shadow-md'); b.classList.add('text-gray-500', 'bg-white', 'shadow-sm'); b.setAttribute('aria-selected', 'false'); });
    const c = byId('com-' + name); if (c) c.classList.remove('hidden');
    const b = byId('btn-com-' + name); if (b) { b.classList.remove('text-gray-500', 'bg-white', 'shadow-sm'); b.classList.add('bg-primary', 'text-white', 'shadow-md'); b.setAttribute('aria-selected', 'true'); }
  }
  function switchProgramTab(i) {
    progTab = Number(i) || 0;
    $$('[data-prog-panel]').forEach((p) => p.classList.toggle('hidden', Number(p.dataset.progPanel) !== progTab));
    $$('.program-tab').forEach((b, idx) => {
      const on = idx === progTab; b.setAttribute('aria-selected', String(on));
      b.classList.toggle('bg-primary', on); b.classList.toggle('text-white', on); b.classList.toggle('bg-gray-50', !on); b.classList.toggle('text-gray-500', !on);
    });
  }

  // ---------- النوافذ ----------
  let lastFocus = null;
  function openModal(id) {
    const m = byId(id); if (!m) return;
    lastFocus = document.activeElement; m.classList.remove('hidden'); m.classList.add('flex'); document.body.style.overflow = 'hidden';
    const f = m.querySelector('button, a, input'); if (f) f.focus();
  }
  function closeModal(id) {
    const m = byId(id); if (!m) return;
    m.classList.add('hidden'); m.classList.remove('flex');
    if (!$$('.modal.flex').length) document.body.style.overflow = 'auto';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  // ---------- الأحداث ----------
  function bindEvents() {
    document.addEventListener('click', (ev) => {
      const el = ev.target.closest('[data-action]'); if (!el) return;
      const a = el.dataset.action;
      if (a === 'toggle-lang') toggleLang();
      else if (a === 'open-modal') openModal(el.dataset.target);
      else if (a === 'close-modal') closeModal(el.dataset.target);
      else if (a === 'com-tab') switchComTab(el.dataset.tab);
      else if (a === 'prog-tab') switchProgramTab(el.dataset.tab);
      else if (a === 'open-ann') openAnn(el.dataset.id);
      else if (a === 'open-img') {
        const src = safeImg(el.dataset.src); if (!src) return;
        const im = byId('lightbox-img'); im.src = src; im.alt = el.dataset.alt || ''; openModal('lightbox');
      }
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') $$('.modal.flex').forEach((m) => closeModal(m.id)); });
    // احتياط الصور المعطوبة (بديل onerror المضمّن)
    document.addEventListener('error', (e) => {
      const el = e.target;
      if (el && el.tagName === 'IMG' && el.dataset.fallback && !el.src.endsWith(el.dataset.fallback)) el.src = el.dataset.fallback;
    }, true);

    window.addEventListener('hashchange', () => route(false));
    const nav = byId('navbar'), cont = byId('nav-container');
    window.addEventListener('scroll', () => {
      const s = window.scrollY > 50;
      nav.classList.toggle('bg-primary/95', s); nav.classList.toggle('backdrop-blur-md', s);
      cont.classList.toggle('py-2', s); cont.classList.toggle('py-4', !s);
    }, {passive: true});
    const btn = byId('mobile-menu-btn'), menu = byId('mobile-menu');
    btn.addEventListener('click', () => { const open = menu.classList.toggle('hidden') === false; btn.setAttribute('aria-expanded', String(open)); });
    $$('.mobile-link').forEach((l) => l.addEventListener('click', () => { menu.classList.add('hidden'); btn.setAttribute('aria-expanded', 'false'); }));
    bindForms();
  }

  // ---------- الإقلاع ----------
  async function init() {
    try { const q = new URLSearchParams(location.search).get('lang'); const saved = q || localStorage.getItem('lang'); if (saved === 'en' || saved === 'ar') lang = saved; } catch { /* */ }
    window.AOS && AOS.init({once: true, offset: 50, duration: 800, disable: () => window.matchMedia('(prefers-reduced-motion: reduce)').matches});
    bindEvents();
    const {data, live} = await loadData();
    DATA = data || {};
    document.documentElement.dataset.source = live ? 'sanity' : 'fallback';
    renderAll();

    // تحديث تلقائي: كل دقيقة وعند العودة إلى التبويب — بلا إعادة تحميل ولا قفز في الصفحة
    let lastSig = JSON.stringify(DATA);
    const refresh = async () => {
      if (document.hidden) return;
      const r = await loadData();
      if (!r.live) return;
      const sig = JSON.stringify(r.data);
      if (sig !== lastSig) { lastSig = sig; DATA = r.data; renderAll(true); }
    };
    setInterval(refresh, 60000);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });
  }
  init();
})();

/* ICEIC 2027 — الواجهة الأمامية
 * - المحتوى كله يأتي من Sanity (قراءة عامة فقط عبر apicdn) مع نسخة احتياطية محلية assets/data/fallback.json
 * - كل نص قادم من لوحة التحكم يمرّ عبر esc() أو textContent؛ الروابط https فقط؛ الصور من نطاقات مسموحة فقط
 * - لا توجد معالجات أحداث مضمّنة (CSP: script-src 'self')
 */
(() => {
  'use strict';
  // دفاع إضافي ضد التطريز داخل إطار (clickjacking) حين لا يتوفر X-Frame-Options (مثل GitHub Pages)
  if (window.top !== window.self) { document.documentElement.hidden = true; try { window.top.location = window.self.location.href; } catch { /* محجوب */ } }

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
  const IMG_HOSTS = new Set(['cdn.sanity.io']);
  /** يقبل: مسار محلي assets/ أو https من النطاقات المسموحة فقط */
  const safeImg = (u, w) => {
    if (!u) return '';
    u = String(u);
    if (/^(assets|uploads)\/[\w./-]+$/.test(u) && !u.includes('..')) return u;
    try {
      const x = new URL(u);
      if (x.protocol !== 'https:' || !IMG_HOSTS.has(x.hostname)) return '';
      if (w && x.hostname === 'cdn.sanity.io') { x.searchParams.set('w', String(w)); x.searchParams.set('auto', 'format'); }
      return x.href;
    } catch { return ''; }
  };
  const safeFile = (u) => {
    if (/^(uploads|assets\/docs)\/[\w.-]+$/.test(String(u || ''))) return String(u);
    const h = safeHttps(u); return h && new URL(h).hostname === 'cdn.sanity.io' ? h : '';
  };
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

  // صورة رمزية محلية (SVG مضمّنة) بدل أي خدمة خارجية، حتى لا يُرسَل أي طلب إلى طرف ثالث
  const AVATAR = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#e5e7eb"/><circle cx="32" cy="24" r="11" fill="#9ca3af"/><path d="M10 60c2-14 12-20 22-20s20 6 22 20z" fill="#9ca3af"/></svg>');

  // ---------- جلب البيانات ----------
  const img = (f) => `"${f}": ${f}.asset->url`;
  const QUERY = `{
    "settings": *[_id == "siteSettings"][0]{ ..., ${img('facultyLogoAr')}, ${img('facultyLogoEn')}, ${img('conferenceLogo')}, ${img('conferenceLogoAr')}, ${img('conferenceLogoEn')}, ${img('universityLogoAr')}, ${img('universityLogoEn')}, ${img('footerUnivLogoAr')}, ${img('footerUnivLogoEn')}, ${img('footerFacultyLogoAr')}, ${img('footerFacultyLogoEn')}, ${img('footerConfLogoAr')}, ${img('footerConfLogoEn')}, ${img('heroBackground')}, ${img('shareImage')}, "callPdfArUrl": callPdfAr.asset->url, "callPdfEnUrl": callPdfEn.asset->url, "programPdfArUrl": programPdfAr.asset->url, "programPdfEnUrl": programPdfEn.asset->url },
    "home": *[_id == "homePage"][0]{ ..., ${img('welcomeImage')}, ${img('welcomeImage2')} },
    "about": *[_id == "aboutPage"][0]{ ..., ${img('preambleImage')} },
    "submission": *[_id == "submissionPage"][0]{ ..., "templateUrl": templateFile.asset->url, "templateArUrl": templateFileAr.asset->url, "templateEnUrl": templateFileEn.asset->url, "platformGuideUrl": platformGuideFile.asset->url },
    "announcements": *[_type == "announcement" && publishAt <= now() && (!defined(expireAt) || expireAt > now())] | order(pinned desc, publishAt desc)[0...60]{
      _id, kind, title_ar, title_en, body_ar, body_en, linkUrl, linkLabel_ar, linkLabel_en, publishAt, expireAt, pinned, popup, displaySeconds, "imageUrl": image.asset->url },
    "tracks": *[_type == "track"] | order(order asc){ _id, order, kicker_ar, kicker_en, title_ar, title_en, description_ar, description_en, topics, icon, color },
    "speakers": *[_type == "speaker"] | order(order asc){ _id, name_ar, name_en, role_ar, role_en, institution_ar, institution_en, bio_ar, bio_en, linkedinUrl, websiteUrl, order, "imageUrl": image.asset->url },
    "committee": *[_type == "committee"] | order(order asc){ _id, committeeType, name_ar, name_en, role_ar, role_en, institution_ar, institution_en, order, "imageUrl": image.asset->url },
    "program": *[_type == "programDay"] | order(dayNumber asc){ _id, dayNumber, date, label_ar, label_en, sessions },
    "dates": *[_type == "importantDate"] | order(order asc){ _id, title_ar, title_en, dateLabel_ar, dateLabel_en, date, icon, order },
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
    // 1) لوحة PHP على الخادم (api.php) إن وُجدت
    try {
      const j = await fetchJson('api.php', 6000);
      if (j && j.settings) return {data: j, live: true};
    } catch { /* غير متاح (استضافة ثابتة): ننتقل للمصدر التالي */ }
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
    const pick = (a, b, w) => safeImg(isAr ? a : b, w) || safeImg(isAr ? b : a, w);
    const fUni = pick(s.footerUnivLogoAr, s.footerUnivLogoEn, 400) || uniLogo;
    [['univ-logo-img', uniLogo], ['footer-univ-logo-img', fUni]].forEach(([id, src]) => {
      const el = byId(id); if (el) { el.dataset.fallback = 'assets/img/university_logo.png'; el.src = src; }
    });
    const fFac = safeImg(isAr ? s.footerFacultyLogoAr : s.footerFacultyLogoEn, 400) || facLogo;
    [['faculty-logo-img', facLogo], ['venue-faculty-logo', facLogo], ['footer-faculty-logo-img', fFac]].forEach(([id, src]) => {
      const el = byId(id); if (el) { el.dataset.fallback = `assets/img/faculty_logo_${lang}.png`; el.src = src; }
    });
    const fConf = safeImg(isAr ? s.footerConfLogoAr : s.footerConfLogoEn, 300) || confLogo;
    [['conf-logo-img', confLogo], ['footer-conf-logo', confLogo], ['footer-conf-logo2', fConf]].forEach(([id, src]) => {
      const el = byId(id); if (el) { el.dataset.fallback = 'assets/img/conference_logo.png'; el.src = src; }
    });

    const title = t(s, 'siteTitle');
    setText('hdr-title', title); setText('hdr-theme', t(s, 'theme'));
    const dateTxt = t(s, 'eventDateText') || L('20-21 أفريل 2027', '20-21 April 2027');
    setText('hdr-date', dateTxt); setText('hero-date', dateTxt);
    setText('hero-edition', t(s, 'editionLabel')); setText('hero-title', t(s, 'heroTitle'));
    const theme = t(s, 'theme'); if (theme) setText('hero-theme', theme.replace(/\.?$/, '.'));
    if (title) document.title = title;
    const desc = t(s, 'seoDescription');
    if (desc) { const m = $('meta[name="description"]'); if (m) m.content = desc; const og = $('meta[property="og:description"]'); if (og) og.content = desc; }
    const ogt = $('meta[property="og:title"]'); if (ogt && title) ogt.content = title;

    const hero = byId('hero-photo'), bg = safeImg(s.heroBackground, 1600);
    if (hero) { hero.classList.toggle('hidden', !bg); if (bg) hero.replaceChildren(Object.assign(document.createElement('img'), {src: bg, alt: '', className: 'w-full h-full object-cover'})); }

    // الرئيسية
    setText('ov-kicker', (k => (k === 'مرحباً بكم' || k === 'Welcome') ? L('تعرّف على المؤتمر', 'Discover the Conference') : k)(t(home, 'welcomeKicker'))); setText('ov-title', t(home, 'welcomeTitle'));
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
    document.documentElement.dataset.icons = ['none', 'plain', 'tile'].includes(s.iconStyle) ? s.iconStyle : 'none';
    renderGateway(home, nTracks);

    // الاتصال والمكان
    const email = isEmail(s.contactEmail || '') ? s.contactEmail : DEFAULT_EMAIL;
    ['contact-email', 'footer-email'].forEach((id) => { const a = byId(id); if (a) { a.textContent = email; a.href = 'mailto:' + email; } });
    const phone = (s.phone || '').trim();
    const pc = byId('contact-phone-card');
    if (pc) { pc.classList.toggle('hidden', !phone); pc.classList.toggle('flex', !!phone); setText('contact-phone', phone); }
    const em2 = (s.contactEmail2 || '').trim(), e2 = byId('contact-email2');
    if (e2) { const ok = isEmail(em2); e2.classList.toggle('hidden', !ok); if (ok) { e2.textContent = em2; e2.href = 'mailto:' + em2; } }
    const addr = t(s, 'address'), ac = byId('contact-address-card');
    if (ac) { ac.classList.toggle('hidden', !addr); ac.classList.toggle('flex', !!addr); setText('contact-address', addr); }
    setText('venue-name', t(s, 'venueName')); setText('venue-desc', t(s, 'venueDescription'));
    const vr = byId('venue-address-row'); if (vr) { vr.classList.toggle('hidden', !addr); setText('venue-address', addr); }
    const vp = byId('venue-phone-row'); if (vp) { vp.classList.toggle('hidden', !phone); setText('venue-phone', phone); }
    setText('footer-address', t(s, 'address')); setText('footer-about', t(s, 'footerAbout')); setText('footer-copy', t(s, 'copyright'));
    setText('footer-line', t(s, 'footerLine') || (isAr ? 'كلية العلوم الاقتصادية والتجارية وعلوم التسيير | جامعة سطيف 1 - فرحات عباس، الجزائر' : 'Faculty of Economics, Business and Management Sciences | Setif 1 University - Ferhat ABBAS, Algeria'));
    const map = byId('venue-map'), mapUrl = safeHttps(s.mapEmbedUrl);
    if (map && mapUrl.startsWith('https://www.google.com/maps/embed') && map.getAttribute('src') !== mapUrl) map.src = mapUrl;
    const ml = byId('venue-link'), mlu = safeHttps(s.mapLinkUrl); if (ml && mlu) ml.href = mlu;

    const sub = safeHttps(s.paperSubmissionUrl);
    $$('[data-submit-link]').forEach((a) => { if (sub) a.href = sub; });
    $$('[data-register]').forEach((b) => b.classList.toggle('hidden', s.registrationOpen === false));

    const soc = byId('social-links');
    if (soc) {
      const fixed = SOCIAL.map(([k, icon, hover, name]) => ({u: safeHttps(s[k]), cls: `fab ${icon}`, name, hover}));
      const custom = (Array.isArray(s.socialLinks) ? s.socialLinks : []).map((x) => {
        const m = FA_RE.exec(String((x && x.icon) || '').trim());
        return {u: safeHttps(x && x.url), cls: m ? `${m[1] || 'fab'} ${m[2]}` : 'fas fa-link', name: String((x && x.label) || '').slice(0, 40), hover: 'hover:bg-accent'};
      });
      const all = [...custom, ...fixed].filter((x) => x.u);
      soc.innerHTML = all.map((x) => `<a href="${esc(x.u)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(x.name)}" title="${esc(x.name)}" class="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center ${x.hover} transition-colors shadow-sm"><i class="${esc(x.cls)} text-white" aria-hidden="true"></i></a>`).join('');
      const wrap = byId('social-wrap'); if (wrap) { wrap.classList.toggle('hidden', !all.length); wrap.classList.toggle('flex', !!all.length); }
    }

    startCountdown(s.eventStart);
  }

  // ---------- بطاقات الاستكشاف (قابلة للتعديل من لوحة التحكم) ----------
  const GATE_TARGETS = ['topics', 'speakers', 'program', 'submission', 'news', 'about', 'history', 'committees', 'sponsors', 'venue', 'contact'];
  function renderGateway(home, nTracks) {
    const root = byId('gateway-grid'); if (!root) return;
    const gt = t(home, 'gatewayTitle'); if (gt) setText('gw-title', gt);
    const custom = (Array.isArray(home.gatewayCards) ? home.gatewayCards : []).filter((c) => c && GATE_TARGETS.includes(c.target));
    const cards = custom.length ? custom.map((c) => ({target: c.target, title: t(c, 'title'), text: t(c, 'text')})) : [
      {target: 'topics', title: L('المحاور العلمية', 'Scientific Tracks'), text: nTracks ? L(`${nTracks} مسارات بحثية دقيقة.`, `${nTracks} specific research tracks.`) : L('مسارات بحثية دقيقة.', 'Specific research tracks.')},
      {target: 'speakers', title: L('المتحدثون الرئيسيون', 'Keynote Speakers'), text: L('خبراء وصناع قرار دوليون.', 'International experts & leaders.')},
      {target: 'program', title: L('البرنامج', 'Program'), text: L('الجدول الزمني للفعاليات.', 'Event schedule and timeline.')},
      {target: 'submission', title: L('تقديم الأوراق', 'Submission'), text: L('الشروط، التواريخ، والتقديم.', 'Rules, dates, and submission.')},
    ];
    const colors = ['hover:border-primary', 'hover:border-secondary', 'hover:border-accent', 'hover:border-primary'];
    root.innerHTML = cards.slice(0, 8).map((c, i) => `
      <a href="#${esc(c.target)}" class="group lively rise relative block bg-white p-8 pt-7 rounded-2xl border border-gray-200 border-t-4 border-t-gray-200 ${colors[i % 4]} hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 text-start">
        <span class="block h-1 w-10 bg-accent rounded-full mb-6 transition-all duration-500 group-hover:w-full" aria-hidden="true"></span>
        <h3 class="text-xl font-black text-primary mb-2">${esc(c.title)}</h3>
        <p class="text-gray-500 text-sm leading-relaxed">${esc(c.text)}</p>
        <span class="mt-6 inline-flex items-center gap-2 text-sm font-bold text-secondary">${L('اقرأ المزيد', 'Read more')} <span aria-hidden="true" class="transition-transform group-hover:-translate-x-1 rtl:group-hover:-translate-x-1 ltr:group-hover:translate-x-1">${lang === 'ar' ? '←' : '→'}</span></span>
      </a>`).join('');
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
    // الرئيسية: شريط متبدّل
    renderAnnCarousel(list);
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


  // ---------- شريط الإعلانات المتبدّل في الرئيسية ----------
  let annIdx = 0, annTimer = null, annPaused = false, annHover = false, annN = 0, annItems = [];
  const annDefault = () => { const v = Number((DATA.settings || {}).announcementInterval); return Math.min(120, Math.max(5, Number.isFinite(v) && v > 0 ? Math.round(v) : 20)); };
  const annSecs = (i) => { const v = Number((annItems[i] || {}).displaySeconds); return Number.isFinite(v) && v >= 5 ? Math.min(120, Math.round(v)) : annDefault(); };
  const reduceMotion = () => !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  function annSlide(a, i, n) {
    const im = safeImg(a.imageUrl, 900), link = safeHttps(a.linkUrl), d = new Date(a.publishAt), okD = !isNaN(d);
    const media = im
      ? `<img src="${esc(im)}" alt="" loading="lazy" class="absolute inset-0 w-full h-full object-cover"><div class="absolute inset-0 bg-gradient-to-t from-primary/70 via-transparent to-transparent md:bg-gradient-to-l md:from-transparent md:via-transparent md:to-primary/60"></div>`
      : `<div class="absolute inset-0 bg-white/5 flex items-center justify-center overflow-hidden"><i class="fas fa-bullhorn text-white/10 text-[11rem] -rotate-12" aria-hidden="true"></i><i class="fas fa-bullhorn absolute text-accent text-5xl" aria-hidden="true"></i></div>`;
    const badge = a.kind === 'important'
      ? `<span class="inline-flex items-center gap-1.5 bg-accent text-white px-3.5 py-1 rounded-full text-xs font-black"><i class="fas fa-star" aria-hidden="true"></i>${L('هام', 'Important')}</span>`
      : `<span class="inline-flex items-center gap-1.5 bg-white/15 text-white px-3.5 py-1 rounded-full text-xs font-black"><i class="fas fa-newspaper" aria-hidden="true"></i>${L('إعلان', 'News')}</span>`;
    const dateBox = okD ? `<div class="absolute top-5 rtl:right-5 ltr:left-5 bg-white text-primary rounded-2xl px-4 py-2 text-center shadow-lg leading-tight"><span class="block text-3xl font-black">${esc(fmtDate(a.publishAt, {day: '2-digit'}))}</span><span class="block text-xs font-bold">${esc(fmtDate(a.publishAt, {month: 'long', year: 'numeric'}))}</span></div>` : '';
    return `<article class="ann-slide" data-ann-slide="${i}" role="group" aria-roledescription="slide" aria-label="${i + 1} / ${n}" aria-hidden="${i ? 'true' : 'false'}">
      <div class="relative overflow-hidden rounded-3xl bg-primary text-white shadow-2xl grid grid-cols-1 md:grid-cols-5 min-h-[21rem]">
        <div class="absolute inset-0 opacity-10 dots-pattern pointer-events-none" aria-hidden="true"></div>
        <div class="md:col-span-2 relative min-h-[13rem]">${media}${dateBox}</div>
        <div class="md:col-span-3 relative p-7 md:p-12 flex flex-col justify-center gap-4">
          <div class="flex items-center justify-between gap-3">${badge}<span class="text-white/50 text-sm font-black tracking-widest" dir="ltr">${String(i + 1).padStart(2, '0')} / ${String(n).padStart(2, '0')}</span></div>
          <h3 class="text-2xl md:text-4xl font-black leading-snug">${a.pinned ? '<i class="fas fa-thumbtack text-accent text-lg" aria-hidden="true"></i> ' : ''}${esc(t(a, 'title'))}</h3>
          <p class="text-white/80 text-base md:text-lg leading-relaxed">${esc(excerpt(t(a, 'body'), 210))}</p>
          <div class="flex flex-wrap gap-3 mt-2">
            <button type="button" data-action="open-ann" data-id="${esc(a._id)}" class="inline-flex items-center gap-2 bg-accent hover:bg-white hover:text-primary text-white font-black text-sm py-3 px-7 rounded-xl transition shadow-lg">${L('اقرأ المزيد', 'Read more')} <i class="fas fa-arrow-left rtl:rotate-0 ltr:rotate-180 text-xs" aria-hidden="true"></i></button>
            ${link ? `<a href="${esc(link)}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 border-2 border-white/30 hover:bg-white hover:text-primary text-white font-bold text-sm py-3 px-6 rounded-xl transition">${esc(t(a, 'linkLabel') || L('فتح الرابط', 'Open link'))} <i class="fas fa-external-link-alt text-xs" aria-hidden="true"></i></a>` : ''}
          </div>
        </div>
      </div></article>`;
  }

  function renderAnnCarousel(list) {
    const sec = byId('home-news-section'), root = byId('ann-carousel'); if (!sec || !root) return;
    annItems = list.slice(0, 8); annN = annItems.length;
    sec.classList.toggle('hidden', !annN);
    clearTimeout(annTimer); annTimer = null;
    if (!annN) { root.innerHTML = ''; return; }
    if (annIdx >= annN) annIdx = 0;
    const btn = 'w-10 h-10 shrink-0 rounded-full bg-white border border-gray-200 text-primary hover:bg-primary hover:text-white transition shadow-sm';
    root.innerHTML = `<div class="ann-slides">${annItems.map((a, i) => annSlide(a, i, annN)).join('')}</div>` + (annN > 1 ? `
      <div class="flex items-center gap-3 mt-5" role="group" aria-label="${L('التنقل بين الإعلانات', 'Announcement navigation')}">
        <button type="button" data-action="ann-prev" aria-label="${L('السابق', 'Previous')}" class="${btn}"><i class="fas fa-chevron-right rtl:rotate-0 ltr:rotate-180" aria-hidden="true"></i></button>
        <div class="flex flex-grow items-center justify-center gap-2.5">${annItems.map((_, i) => `<button type="button" data-action="ann-go" data-i="${i}" aria-label="${i + 1}" class="ann-dot"></button>`).join('')}</div>
        <button type="button" data-action="ann-next" aria-label="${L('التالي', 'Next')}" class="${btn}"><i class="fas fa-chevron-left rtl:rotate-0 ltr:rotate-180" aria-hidden="true"></i></button>
        <button type="button" data-action="ann-toggle" id="ann-toggle" class="${btn}"><i id="ann-toggle-ico" class="fas fa-pause text-xs" aria-hidden="true"></i></button>
      </div>` : '');
    annShow(annIdx);
  }

  function annShow(i) {
    const slides = $$('[data-ann-slide]'); if (!slides.length) return;
    annIdx = ((i % slides.length) + slides.length) % slides.length;
    slides.forEach((s, k) => { const on = k === annIdx; s.classList.toggle('on', on); s.setAttribute('aria-hidden', String(!on)); });
    annSchedule();
  }

  function annSchedule() {
    clearTimeout(annTimer); annTimer = null;
    const root = byId('ann-carousel');
    const running = annN > 1 && !annPaused && !annHover && !reduceMotion() && !document.hidden;
    if (root) root.classList.toggle('ann-paused', !running);
    $$('.ann-dot').forEach((b, k) => { b.classList.toggle('on', k === annIdx); b.setAttribute('aria-current', String(k === annIdx)); });
    const ico = byId('ann-toggle-ico'), tg = byId('ann-toggle');
    if (ico) ico.className = `fas ${annPaused ? 'fa-play' : 'fa-pause'} text-xs`;
    if (tg) tg.setAttribute('aria-label', annPaused ? L('تشغيل التبديل التلقائي', 'Resume autoplay') : L('إيقاف التبديل التلقائي', 'Pause autoplay'));
    if (running) annTimer = setTimeout(() => annShow(annIdx + 1), annSecs(annIdx) * 1000);
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
  const paras = (txt, cls) => String(txt || '').split(/\n+/).map((p) => p.trim()).filter(Boolean).map((p) => `<p class="${cls}">${esc(p)}</p>`).join('');
  const secHead = (kicker, title) => `<div class="mb-8"><span class="text-accent font-bold text-sm">${esc(kicker)}</span><h3 class="text-3xl md:text-4xl font-black text-primary mt-1 leading-tight">${esc(title)}</h3><div class="w-16 h-1 bg-accent mt-4 rounded-full"></div></div>`;
  const CARD = 'rise bg-white rounded-3xl p-8 md:p-12 border border-gray-100 shadow-sm';

  function renderAbout() {
    const a = DATA.about || {}, root = byId('about-root'); if (!root) return;
    const pim = safeImg(a.preambleImage, 1000);
    const eds = a.editionsTable || [], objs = a.objectives || [], aud = a.audience || [];
    const as = DATA.settings || {}, callPdf = safeFile(lang === 'ar' ? as.callPdfArUrl || as.callPdfEnUrl : as.callPdfEnUrl || as.callPdfArUrl);
    const intro = t(a, 'aboutIntro'), pre = t(a, 'preamble'), q = t(a, 'problemQuestion'), pi = t(a, 'problemIntro');
    const out = [];
    if (intro || eds.length) out.push(`<section class="${CARD}">${secHead(L('تعرّف علينا', 'Get to know us'), L('نبذة عن المؤتمر', 'About the Conference'))}
      <div class="grid grid-cols-1 ${eds.length ? 'lg:grid-cols-5' : ''} gap-10">
        <div class="${eds.length ? 'lg:col-span-3' : ''} space-y-5">${paras(intro, 'text-gray-600 leading-loose text-lg text-justify-custom')}${callPdf ? `<a href="${esc(callPdf)}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 mt-2 bg-primary hover:bg-secondary text-white font-bold py-3 px-7 rounded-xl transition-colors"><i class="fas fa-file-pdf" aria-hidden="true"></i> ${L('تحميل إعلان المؤتمر (PDF)', 'Download the Call for Papers (PDF)')}</a>` : ''}</div>
        ${eds.length ? `<div class="lg:col-span-2"><div class="rounded-2xl border border-gray-200 overflow-hidden">
          <div class="bg-primary text-white px-5 py-3 font-bold text-sm grid grid-cols-6 gap-3"><span class="col-span-2">${L('الطبعة', 'Edition')}</span><span class="col-span-4">${L('الموضوع', 'Theme')}</span></div>
          ${eds.map((r) => `<div class="px-5 py-4 grid grid-cols-6 gap-3 items-start border-t border-gray-100"><span class="col-span-2 font-black text-primary text-sm">${esc(t(r, 'label'))}<span class="block text-accent font-bold" dir="ltr">${esc(r.year)}</span></span><span class="col-span-4 text-gray-600 text-sm leading-relaxed">${esc(t(r, 'topic'))}</span></div>`).join('')}
        </div></div>` : ''}</div></section>`);
    if (pre) out.push(`<section class="${CARD}">${secHead(L('السياق والرؤية', 'Context & vision'), t(a, 'preambleTitle') || L('ديباجة المؤتمر', 'Conference Preamble'))}
      <div class="flex flex-col lg:flex-row gap-10 items-start"><div class="${pim ? 'lg:w-7/12' : 'w-full'} space-y-5">${paras(pre, 'text-gray-600 leading-loose text-lg text-justify-custom')}</div>
      ${pim ? `<div class="lg:w-5/12 w-full"><img src="${esc(pim)}" alt="" class="w-full h-[360px] object-cover rounded-2xl border border-gray-100"></div>` : ''}</div></section>`);
    if (q) out.push(`<section class="bg-primary text-white rounded-3xl p-8 md:p-14 relative overflow-hidden"><div class="absolute top-0 inset-x-0 h-1.5 bg-accent"></div>
      <div class="max-w-4xl mx-auto text-center"><span class="text-accent font-bold text-sm">${L('السؤال المحوري', 'The central question')}</span><h3 class="text-3xl md:text-4xl font-black mt-1 mb-6">${L('إشكالية المؤتمر', 'Conference Problem Statement')}</h3>
      ${pi ? `<p class="text-gray-300 leading-relaxed text-lg mb-6">${esc(pi)}</p>` : ''}<p class="text-2xl md:text-3xl font-black leading-relaxed">${esc(q)}</p></div></section>`);
    if (objs.length) out.push(`<section class="${CARD}">${secHead(L('ما نسعى إليه', 'What we aim for'), L('أهداف المؤتمر', 'Conference Objectives'))}
      <ol class="grid grid-cols-1 md:grid-cols-2 md:gap-x-14">${objs.map((o, i) => `<li class="flex gap-4 py-5 border-b border-gray-100"><span class="text-accent font-black text-3xl leading-none w-9 shrink-0" dir="ltr">${i + 1}</span><div>${t(o, 'title') ? `<h4 class="font-black text-primary mb-1">${esc(t(o, 'title'))}</h4>` : ''}<p class="text-gray-600 leading-relaxed">${esc(t(o, 'text'))}</p></div></li>`).join('')}</ol></section>`);
    if (aud.length) out.push(`<section class="${CARD}">${secHead(L('من نخاطب', 'Who we address'), L('الفئات المعنية بالمؤتمر', 'Who Should Participate'))}
      <ul class="grid grid-cols-1 md:grid-cols-2 gap-4">${aud.map((x) => `<li class="p-5 rounded-2xl bg-bgLight border border-gray-100 border-0 rtl:border-r-4 ltr:border-l-4 border-accent text-gray-700 leading-relaxed font-semibold">${esc(t(x, 'text'))}</li>`).join('')}</ul></section>`);
    root.innerHTML = out.length ? out.join('') : emptyBox(EMPTY());
  }

  // ---------- المحاور ----------
  function renderTopics() {
    const root = byId('topics-root'), tr = arr('tracks'); if (!root) return;
    const a = DATA.about || {}, intro = t(a, 'tracksIntro'), note = t(a, 'tracksNote');
    const BAR = {primary: 'bg-primary', secondary: 'bg-secondary', accent: 'bg-accent', blue: 'bg-blue-500', gray: 'bg-gray-700', purple: 'bg-purple-600'};
    root.innerHTML = `<div class="max-w-6xl mx-auto">
      ${intro ? `<p class="text-gray-600 text-lg leading-loose text-center max-w-3xl mx-auto mb-10">${esc(intro)}</p>` : ''}
      ${tr.length ? `<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-start">${tr.map((x, i) => {
        const c = TRACK_COLOR[x.color] || TRACK_COLOR.primary, pts = x.topics || [], desc = t(x, 'description');
        return `<article class="rise group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
          <div class="h-1.5 ${BAR[x.color] || 'bg-primary'} group-hover:h-2.5 transition-all"></div>
          <div class="p-6">
            <span class="inline-block ${c.box} font-black text-xs px-3 py-1 rounded-full mb-3">${esc(t(x, 'kicker') || L(`المحور ${x.order ?? i + 1}`, `Track ${x.order ?? i + 1}`))}</span>
            <h3 class="text-lg font-black text-primary leading-snug">${esc(t(x, 'title'))}</h3>
            ${desc ? `<p class="text-gray-500 text-sm leading-relaxed mt-2">${esc(desc)}</p>` : ''}
            ${pts.length ? `<button type="button" data-action="track-toggle" aria-expanded="false" class="mt-5 w-full flex items-center justify-between gap-3 text-sm font-bold ${c.text} hover:opacity-80 transition-opacity"><span>${L(`المحاور الفرعية (${pts.length})`, `Sub-topics (${pts.length})`)}</span><span class="track-chev inline-block transition-transform duration-300" aria-hidden="true">▾</span></button>
            <ul class="track-pts hidden mt-4 space-y-3 border-t border-gray-100 pt-4">${pts.map((p) => `<li class="flex gap-3 text-gray-600 text-sm leading-relaxed"><span class="mt-2 w-1.5 h-1.5 rounded-full ${BAR[x.color] || 'bg-primary'} shrink-0" aria-hidden="true"></span><span>${esc(t(p, 'text'))}</span></li>`).join('')}</ul>` : ''}
          </div></article>`;
      }).join('')}</div>` : emptyBox(EMPTY())}
      ${note ? `<aside class="relative mt-10 rounded-3xl bg-primary text-white p-8 md:p-10 overflow-hidden"><div class="absolute inset-y-0 rtl:right-0 ltr:left-0 w-1.5 bg-accent"></div><p class="text-lg md:text-xl font-bold leading-loose text-center max-w-4xl mx-auto">${esc(note)}</p></aside>` : ''}</div>`;
  }

  // ---------- تاريخ المؤتمر ----------
  function renderHistoryList() {
    const root = byId('history-root'); if (!root) return;
    const eds = arr('editions');
    root.innerHTML = `<div class="max-w-5xl mx-auto">
      <div class="mb-10"><span class="text-accent font-bold text-sm">${L('الأرشيف', 'Archive')}</span>
        <h3 class="text-3xl md:text-5xl font-black text-primary mt-1">${L('الطبعات السابقة للمؤتمر', 'Previous Editions')}</h3>
        <div class="w-16 h-1 bg-accent mt-4 rounded-full"></div>
        <p class="text-gray-600 text-lg mt-5 max-w-3xl leading-relaxed">${L('محطات المؤتمر السابقة وما حققته من إسهامات علمية وتوصيات.', 'Milestones of past editions, with their scientific contributions and recommendations.')}</p></div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">${eds.length ? eds.map((e, i) => {
        const logo = safeImg(e.logoUrl, 400), st = (e.stats || []).slice(0, 3), g = ['from-primary via-primary to-secondary', 'from-secondary via-secondary to-primary', 'from-primary via-secondary to-accent'][i % 3];
        return `<a href="#history-${esc(e.editionYear)}" class="rise group relative flex flex-col bg-white rounded-3xl border border-gray-100 shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden">
          <div class="relative bg-gradient-to-br ${g} text-white p-8 overflow-hidden min-h-[11rem] flex items-end justify-between gap-4">
            <span class="absolute -top-4 rtl:-left-3 ltr:-right-3 text-[9rem] font-black leading-none text-white/10 group-hover:text-white/20 group-hover:scale-110 transition-all duration-500 select-none" dir="ltr" aria-hidden="true">${esc(e.editionYear)}</span>
            <div class="relative"><span class="inline-block bg-white/15 backdrop-blur px-3 py-1 rounded-full text-sm font-bold mb-3">${esc(t(e, 'dateLabel') || e.editionYear)}</span>
              <span class="block text-5xl font-black leading-none text-accent" dir="ltr">${esc(e.editionYear)}</span></div>
            ${logo ? `<img src="${esc(logo)}" alt="${esc(t(e, 'title'))}" loading="lazy" class="relative w-24 h-24 object-contain bg-white/95 rounded-2xl p-2 shadow-lg group-hover:rotate-3 transition-transform duration-300">` : ''}</div>
          <div class="p-8 flex flex-col flex-grow"><h4 class="text-xl md:text-2xl font-black text-primary leading-snug mb-3 group-hover:text-secondary transition-colors">${esc(t(e, 'title'))}</h4>
            <p class="text-gray-500 leading-relaxed mb-5 flex-grow">${esc(t(e, 'summary'))}</p>
            ${st.length ? `<div class="flex flex-wrap gap-2 mb-6">${st.map((x) => `<span class="bg-bgLight border border-gray-100 rounded-full px-4 py-1.5 text-sm text-gray-600"><b class="text-primary font-black" dir="ltr">${esc(x.value)}</b> ${esc(t(x, 'label'))}</span>`).join('')}</div>` : ''}
            <span class="inline-flex items-center gap-2 self-start bg-primary group-hover:bg-accent text-white font-black py-2.5 px-6 rounded-xl transition-colors">${L('اقرأ المزيد', 'Read more')} <span aria-hidden="true" class="transition-transform group-hover:-translate-x-1 rtl:group-hover:-translate-x-1 ltr:group-hover:translate-x-1">${lang === 'ar' ? '←' : '→'}</span></span></div></a>`;
      }).join('') : emptyBox(EMPTY())}</div></div>`;
  }

  const STAT_COLS = {1: 'md:grid-cols-1', 2: 'md:grid-cols-2', 3: 'md:grid-cols-3', 4: 'md:grid-cols-4', 5: 'md:grid-cols-5', 6: 'md:grid-cols-6'};
  function renderEdition(year) {
    const root = byId('edition-root'); if (!root) return;
    const e = arr('editions').find((x) => String(x.editionYear) === String(year));
    if (!e) { root.innerHTML = emptyBox(L('الطبعة غير موجودة.', 'Edition not found.')); return; }
    const logo = safeImg(e.logoUrl, 500), pdf = safeFile(e.programPdfUrl);
    const vid = youtubeId(lang === 'ar' ? e.videoUrl_ar || e.videoUrl_en : e.videoUrl_en || e.videoUrl_ar);
    const photos = [...(e.gallery || []).map((g) => ({url: g.url, cap: t(g, 'caption')})), ...(e.legacyImages || []).filter(Boolean).map((u) => ({url: u, cap: ''}))]
      .map((p) => ({full: safeImg(p.url, 1600), thumb: safeImg(p.url, 800), cap: p.cap})).filter((p) => p.thumb);
    const recs = t(e, 'recommendations'), stats = (e.stats || []).slice(0, 6);
    const pillars = [[L('التميز العلمي', 'Scientific Excellence'), t(e, 'excellence')], [L('محاور النقاش', 'Key Topics'), t(e, 'topics')], [L('إنجاز وطموح', 'Achievement'), t(e, 'achievement')]].filter((p) => p[1]);
    root.innerHTML = `<div class="max-w-6xl mx-auto space-y-10">
      <a href="#history" class="inline-flex items-center gap-2 text-gray-500 hover:text-primary font-bold transition-colors"><span aria-hidden="true">${lang === 'ar' ? '→' : '←'}</span> ${L('كل الطبعات السابقة', 'All editions')}</a>
      <header class="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 md:p-14 relative overflow-hidden">
        <span class="absolute -top-6 rtl:-left-2 ltr:-right-2 text-[9rem] md:text-[13rem] font-black text-primary/5 leading-none select-none" dir="ltr" aria-hidden="true">${esc(e.editionYear)}</span>
        <div class="relative flex flex-col md:flex-row gap-10 items-center">
          <div class="${logo ? 'md:w-8/12' : 'w-full'}"><span class="text-accent font-black">${esc(t(e, 'dateLabel') || e.editionYear)}</span>
            <h2 class="text-3xl md:text-5xl font-black text-primary leading-tight mt-2 mb-5">${esc(t(e, 'title'))}</h2>
            <p class="text-gray-600 text-lg leading-loose max-w-3xl">${esc(t(e, 'intro'))}</p>
            ${pdf ? `<a href="${esc(pdf)}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 mt-8 bg-primary hover:bg-secondary text-white font-black py-3.5 px-7 rounded-xl transition-colors">${L('تحميل برنامج المؤتمر (PDF)', 'Download Conference Program (PDF)')}</a>` : ''}</div>
          ${logo ? `<div class="md:w-4/12 flex justify-center"><img src="${esc(logo)}" alt="${esc(t(e, 'title'))}" class="w-48 h-48 md:w-56 md:h-56 object-contain"></div>` : ''}</div></header>
      ${stats.length ? `<div class="grid grid-cols-2 ${STAT_COLS[Math.min(stats.length, 6)]} gap-px bg-gray-200 rounded-2xl overflow-hidden border border-gray-200">${stats.map((s) => `<div class="rise bg-white p-6 text-center hover:bg-bgLight transition-colors"><b class="block text-4xl font-black text-primary mb-1" dir="ltr">${esc(s.value)}</b><span class="text-gray-500 font-bold text-sm">${esc(t(s, 'label'))}</span></div>`).join('')}</div>` : ''}
      ${pillars.length ? `<div class="grid grid-cols-1 md:grid-cols-3 gap-8">${pillars.map(([ttl, txt]) => `<div class="rise bg-white rounded-2xl border border-gray-100 border-t-4 border-t-accent p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"><h4 class="text-xl font-black text-primary mb-4">${esc(ttl)}</h4><p class="text-gray-600 leading-loose text-justify-custom pre-line">${esc(txt)}</p></div>`).join('')}</div>` : ''}
      <section class="bg-primary text-white rounded-3xl p-8 md:p-14 relative overflow-hidden"><div class="absolute top-0 inset-x-0 h-1.5 bg-accent"></div>
        <span class="text-accent font-bold text-sm">${L(`الطبعة ${esc(e.editionYear)}`, `Edition ${esc(e.editionYear)}`)}</span>
        <h3 class="text-3xl font-black mt-1 mb-6">${L('توصيات المؤتمر', 'Conference Recommendations')}</h3>
        ${recs ? `<p class="text-gray-100 text-lg leading-loose pre-line">${esc(recs)}</p>` : `<p class="text-gray-300 text-lg leading-loose">${L('ستُنشر التوصيات والنتائج التي خلص إليها المؤتمر هنا قريباً.', 'The conference recommendations will be published here soon.')}</p>`}</section>
      <section class="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 md:p-12">
        <div class="mb-8"><h3 class="text-3xl font-black text-primary">${esc(t(e, 'galleryTitle') || L('معرض الصور', 'Gallery'))}</h3><div class="w-16 h-1 bg-accent mt-4 rounded-full"></div></div>
        ${vid ? `<div class="mb-10 w-full max-w-4xl"><div class="relative w-full aspect-video overflow-hidden rounded-2xl border border-gray-200"><iframe class="absolute inset-0 w-full h-full" src="https://www.youtube-nocookie.com/embed/${esc(vid)}" title="Video" loading="lazy" sandbox="allow-scripts allow-same-origin allow-presentation" allow="encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div></div>` : ''}
        ${photos.length ? `<div class="masonry-grid">${photos.map((p) => `<button type="button" data-action="open-img" data-src="${esc(p.full)}" data-alt="${esc(p.cap)}" class="masonry-item block w-full rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300"><img src="${esc(p.thumb)}" alt="${esc(p.cap || t(e, 'title'))}" loading="lazy" class="w-full h-auto hover:scale-105 transition-transform duration-500"></button>`).join('')}</div>` : `<p class="text-gray-500 font-bold">${L('ستُضاف صور المؤتمر قريباً.', 'Conference photos will be added soon.')}</p>`}</section></div>`;
  }

  // ---------- اللجان ----------
  const personName = (m) => t(m, 'name');
  function renderCommittees() {
    const all = arr('committee'), none = emptyBox(L('لا يوجد أعضاء مضافين حالياً.', 'No members added yet.'));
    const cnt = () => {};

    // اللجنة العليا: بطاقات كبيرة بارزة
    const hi = all.filter((c) => c.committeeType === 'high'), hc = byId('high-members');
    cnt('high', hi.length);
    if (hc) hc.innerHTML = hi.length ? `<div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">${hi.map((m) => {
      const inst = t(m, 'institution'), role = t(m, 'role');
      return `<div class="rise group relative bg-gradient-to-b from-accent/10 to-white rounded-3xl border border-accent/30 shadow-xl p-8 pt-10 text-center overflow-hidden hover:-translate-y-1 hover:shadow-2xl transition-all duration-300">
        <div class="absolute top-0 inset-x-0 h-1.5 bg-accent"></div>
        <i class="ico-decor fas fa-star absolute -bottom-6 rtl:-left-6 ltr:-right-6 text-accent/5 text-[9rem] rotate-12" aria-hidden="true"></i>
        ${avatarHalo(m, 'w-36 h-36', 'border-4 border-white shadow-lg', '-inset-2 rounded-full bg-accent/15 group-hover:bg-accent/25 transition', 'mb-5')}
        ${role ? `<div><span class="inline-block bg-accent text-white font-black px-4 py-1.5 rounded-full text-sm">${esc(role)}</span></div>` : ''}
        <h4 class="text-xl md:text-2xl font-black text-primary mt-3 mb-2 leading-snug relative">${esc(personName(m))}</h4>
        ${inst ? `<p class="text-gray-500 text-sm font-bold relative"><i class="fas fa-university text-gray-300" aria-hidden="true"></i> ${esc(inst)}</p>` : ''}</div>`;
    }).join('')}</div>` : `<div class="text-gray-400 font-bold py-5">${L('لا يوجد أعضاء مضافين حالياً.', 'No members added yet.')}</div>`;

    const grid = (type, color, id) => {
      const box = byId(id); if (!box) return;
      const ms = all.filter((c) => c.committeeType === type), c = COM_COLOR[color];
      cnt(type, ms.length);
      const defRole = type === 'scientific' ? L('عضو اللجنة العلمية', 'Scientific Committee Member') : L('عضو اللجنة التنظيمية', 'Organizing Committee Member');
      if (!ms.length) { box.innerHTML = none; return; }
      const pres = ms.find((m) => m.order === 1), others = ms.filter((m) => m !== pres), tint = `${c.soft} ${c.text}`;
      const search = '';
      // بطاقة الرئيس: أكبر وأبرز من باقي الأعضاء
      const presHtml = pres ? (() => {
        const inst = t(pres, 'institution'), role = t(pres, 'role');
        return `<div class="col-span-full mb-6"><div class="rise group relative max-w-2xl mx-auto rounded-3xl border-2 border-accent/50 bg-gradient-to-b from-accent/20 via-accent/5 to-white p-8 md:p-10 text-center shadow-2xl overflow-hidden hover:shadow-2xl transition-all duration-300">
          <div class="absolute top-0 inset-x-0 h-2 ${c.bar}"></div>
          <i class="ico-decor fas fa-star ${c.star} absolute -bottom-8 rtl:-left-8 ltr:-right-8 text-[11rem] rotate-12" aria-hidden="true"></i>
          ${avatarHalo(pres, 'w-36 h-36', 'border-4 border-white shadow-xl', '-inset-3 rounded-full ' + c.soft + ' group-hover:scale-105 transition-transform duration-500', 'mb-5')}
          <div class="relative">${role ? `<span class="inline-block ${c.bar} text-white text-sm font-black px-5 py-1.5 rounded-full mb-3">${esc(role)}</span>` : ''}
            <h4 class="text-2xl md:text-3xl font-black text-primary leading-snug">${esc(personName(pres))}</h4>
            ${inst ? `<p class="text-gray-500 font-bold mt-2"><i class="fas fa-university text-gray-300" aria-hidden="true"></i> ${esc(inst)}</p>` : ''}</div></div></div>`;
      })() : '';
      box.innerHTML = search + presHtml + others.map((m) => {
        const inst = t(m, 'institution'), role = t(m, 'role') || defRole;
        const q = `${personName(m)} ${inst} ${role}`.toLowerCase();
        return `<div class="com-card rise group relative bg-white p-4 rtl:pr-6 rtl:pl-5 ltr:pl-6 ltr:pr-5 rounded-2xl border border-gray-200 shadow-md hover:shadow-xl hover:-translate-y-1 transition flex items-center gap-4 overflow-hidden" data-q="${esc(q)}">
          <span class="absolute top-0 rtl:right-0 ltr:left-0 h-full w-1.5 ${c.bar}" aria-hidden="true"></span>
          ${avatar(m, 'w-16 h-16', '', 'border-2 border-white shadow ring-1 ring-gray-200')}
          <div class="min-w-0"><span class="font-black text-primary text-lg block leading-snug">${esc(personName(m))}</span><span class="inline-block text-xs ${c.text} ${c.soft} font-black rounded-full px-2.5 py-0.5 mt-1.5">${esc(role)}</span>
            ${inst ? `<span class="text-xs text-gray-500 font-bold block mt-1">${esc(inst)}</span>` : ''}</div></div>`;
      }).join('') + `<div data-com-empty class="hidden col-span-full text-center text-gray-400 font-bold py-8">${L('لا توجد نتائج مطابقة.', 'No matching members.')}</div>`;
    };
    grid('scientific', 'accent', 'scientific-members');
    grid('organizing', 'blue', 'organizing-members');
  }

  // ---------- المتحدثون ----------
  const TITLE_RE = /^(?:الأستاذ(?:ة)?\s+الدكتور(?:ة)?|الأستاذ(?:ة)?|الدكتور(?:ة)?|أ\.?\s?د\.?|د\.|Prof\.?|Dr\.?|Pr\.?|Mr\.?|Mrs\.?|Ms\.?)\s+/i;
  function initials(n) {
    let s = String(n || '').trim();
    for (let i = 0; i < 3; i++) s = s.replace(TITLE_RE, '');
    const w = s.split(/\s+/).filter(Boolean);
    return ((Array.from(w[0] || '')[0] || '') + (w.length > 1 ? Array.from(w[1])[0] : '')).toUpperCase();
  }
  // الصورة تظهر فقط إن وُجدت؛ بدونها لا دائرة ولا حروف
  function avatar(m, size, tint, ring) {
    const im = safeImg(m.imageUrl, 400);
    return im ? `<img src="${esc(im)}" alt="${esc(personName(m))}" loading="lazy" class="${size} rounded-full object-cover shrink-0 ${ring}">` : '';
  }
  function avatarHalo(m, size, ring, halo, wrap) {
    const a = avatar(m, 'relative ' + size, '', ring);
    return a ? `<div class="relative inline-block ${wrap}"><span class="absolute ${halo}" aria-hidden="true"></span>${a}</div>` : '';
  }

  function spkCard(s) {
    const im = safeImg(s.imageUrl, 700), nm = t(s, 'name'), bio = t(s, 'bio'), inst = t(s, 'institution'), role = t(s, 'role');
    const li = safeHttps(s.linkedinUrl), web = safeHttps(s.websiteUrl);
    const photo = im
      ? `<img src="${esc(im)}" alt="${esc(nm)}" loading="lazy" class="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700">`
      : `<div class="absolute inset-0 bg-primary/5 flex items-center justify-center" aria-hidden="true"><i class="fas fa-user-tie text-primary/20 text-8xl"></i></div>`;
    const ico = (u, ic, lb) => u ? `<a href="${esc(u)}" target="_blank" rel="noopener noreferrer" aria-label="${lb}" class="w-9 h-9 rounded-full bg-gray-100 text-primary hover:bg-primary hover:text-white flex items-center justify-center transition"><i class="${ic}" aria-hidden="true"></i></a>` : '';
    return `<article class="rise group bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden flex flex-col sm:flex-row hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
      <div class="sm:w-2/5 relative min-h-[16rem] sm:min-h-[20rem] overflow-hidden shrink-0 bg-bgLight">${photo}</div>
      <div class="p-6 md:p-7 flex flex-col gap-2 flex-grow min-w-0">
        <h3 class="text-xl font-black text-primary leading-snug">${esc(nm)}</h3>
        ${role ? `<p class="text-secondary font-bold text-sm">${esc(role)}</p>` : ''}
        ${inst ? `<p class="text-gray-500 text-sm font-bold">${esc(inst)}</p>` : ''}
        ${bio ? `<p class="clamp4 text-gray-500 text-sm leading-relaxed mt-2">${esc(bio)}</p>` : ''}
        <div class="flex items-center justify-between gap-3 mt-auto pt-4 border-t border-gray-100">
          <div class="flex gap-2">${ico(li, 'fab fa-linkedin-in', 'LinkedIn')}${ico(web, 'fas fa-globe', L('الموقع', 'Website'))}</div>
          <button type="button" data-action="open-spk" data-id="${esc(s._id)}" class="inline-flex items-center gap-2 bg-primary hover:bg-secondary text-white font-black text-sm py-2.5 px-5 rounded-xl transition">${L('التفاصيل', 'Details')} <i class="fas fa-arrow-left rtl:rotate-0 ltr:rotate-180 text-xs" aria-hidden="true"></i></button>
        </div>
      </div></article>`;
  }

  function renderSpeakers() {
    const box = byId('speakers-container'), sp = arr('speakers');
    if (box) box.innerHTML = sp.length ? sp.map(spkCard).join('') : `<div class="col-span-full text-center py-20 text-gray-400"><i class="fas fa-user-tie text-5xl mb-4" aria-hidden="true"></i><p class="font-bold text-lg">${L('سيتم الإعلان عن المتحدثين قريباً.', 'Speakers will be announced soon.')}</p></div>`;
    const hs = byId('home-speakers'), hr = byId('home-speakers-root');
    if (hs && hr) { hs.classList.toggle('hidden', !sp.length); hr.innerHTML = sp.slice(0, 4).map(spkCard).join(''); }
  }

  function openSpk(id) {
    const s = arr('speakers').find((x) => x._id === id); if (!s) return;
    const im = safeImg(s.imageUrl, 900), nm = t(s, 'name'), bio = t(s, 'bio'), inst = t(s, 'institution'), role = t(s, 'role');
    const li = safeHttps(s.linkedinUrl), web = safeHttps(s.websiteUrl);
    const btn = (u, ic, lb) => u ? `<a href="${esc(u)}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 bg-gray-100 hover:bg-primary hover:text-white text-primary font-bold text-sm py-2.5 px-5 rounded-xl transition"><i class="${ic}" aria-hidden="true"></i>${lb}</a>` : '';
    byId('spk-body').innerHTML = `<div class="flex flex-col md:flex-row">
      ${im ? `<div class="md:w-2/5 shrink-0"><img src="${esc(im)}" alt="${esc(nm)}" class="w-full h-72 md:h-full object-cover object-top"></div>` : ''}
      <div class="p-7 md:p-9 space-y-3 flex-grow min-w-0">
        <span class="block h-1 w-12 bg-accent rounded-full"></span>
        <h2 id="spk-title" class="text-2xl md:text-3xl font-black text-primary leading-snug">${esc(nm)}</h2>
        ${role ? `<p class="text-secondary font-black">${esc(role)}</p>` : ''}
        ${inst ? `<p class="text-gray-500 font-bold text-sm"><i class="fas fa-university text-gray-300" aria-hidden="true"></i> ${esc(inst)}</p>` : ''}
        ${bio ? `<p class="text-gray-600 leading-loose pre-line pt-2">${esc(bio)}</p>` : ''}
        <div class="flex flex-wrap gap-3 pt-3">${btn(li, 'fab fa-linkedin-in', 'LinkedIn')}${btn(web, 'fas fa-globe', L('الموقع الشخصي', 'Website'))}</div>
      </div></div>`;
    openModal('spkModal');
  }

  // ---------- البرنامج ----------
  let progTab = 0;
  function renderProgram() {
    const root = byId('program-root'), days = arr('program'); if (!root) return;
    const ps = DATA.settings || {}, ppdf = safeFile(lang === 'ar' ? ps.programPdfArUrl || ps.programPdfEnUrl : ps.programPdfEnUrl || ps.programPdfArUrl);
    const pbtn = ppdf ? `<div class="p-6 md:p-8 bg-accent/10 border-b border-accent/20 flex flex-col sm:flex-row items-center justify-between gap-4"><span class="text-primary font-black text-lg">${L('البرنامج الكامل للمؤتمر', 'The full conference program')}</span><a href="${esc(ppdf)}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 bg-primary hover:bg-secondary text-white font-black py-2.5 px-6 rounded-xl transition-colors"><i class="fas fa-file-pdf" aria-hidden="true"></i> ${L('تحميل البرنامج (PDF)', 'Download program (PDF)')}</a></div>` : '';
    if (!days.length) { root.innerHTML = pbtn + `<div class="p-12 text-center text-gray-400 font-bold">${L('سيتم نشر البرنامج قريباً.', 'The program will be published soon.')}</div>`; return; }
    if (progTab >= days.length) progTab = 0;
    const label = (d, i) => t(d, 'label') || (lang === 'ar'
      ? `اليوم ${ORD_AR[(d.dayNumber || i + 1) - 1] || d.dayNumber} (${fmtDate(d.date, {day: 'numeric', month: 'long'})})`
      : `Day ${d.dayNumber || i + 1} (${fmtDate(d.date, {day: 'numeric', month: 'short'})})`);
    root.innerHTML = pbtn + `<div class="flex flex-col sm:flex-row border-b border-gray-200" role="tablist">${days.map((d, i) =>
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
    const url = safeHttps(s.paperSubmissionUrl), tplAr = safeFile(sub.templateArUrl), tplEn = safeFile(sub.templateEnUrl), tplOld = safeFile(sub.templateUrl);
    const tpls = [[tplAr, L('قالب البحث (عربي)', 'Paper Template (Arabic)')], [tplEn, L('قالب البحث (إنجليزي)', 'Paper Template (English)')]].filter((x) => x[0]);
    if (!tpls.length && tplOld) tpls.push([tplOld, L('تحميل قالب البحث (Template)', 'Download Paper Template')]);
    const guide = safeFile(sub.platformGuideUrl) || 'assets/docs/submission-guide.pdf';
    const pdf = safeFile(lang === 'ar' ? s.callPdfArUrl || s.callPdfEnUrl : s.callPdfEnUrl || s.callPdfArUrl);
    const dnote = t(sub, 'datesNote'), pintro = t(sub, 'participationIntro'), ben = sub.benefits || [], pub = sub.publishing || [];
    const dot = '<span class="mt-2.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0" aria-hidden="true"></span>';
    const list = (items) => `<ul class="space-y-3">${items.map((g) => `<li class="flex gap-3 text-gray-600 leading-relaxed">${dot}<span>${esc(t(g, 'text'))}</span></li>`).join('')}</ul>`;
    const last = dates.length - 1;
    root.innerHTML = `
      <section id="sub-dates" class="${CARD} scroll-mt-24">${secHead(L('سجّلها في أجندتك', 'Mark your calendar'), L('تواريخ مهمة', 'Important Dates'))}
        ${dates.length ? `<ol class="rounded-2xl border border-gray-200 overflow-hidden">${dates.map((d, i) => `<li class="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 px-6 py-4 items-center ${i ? 'border-t border-gray-100' : ''} ${i === last ? 'bg-primary text-white' : i % 2 ? 'bg-bgLight' : 'bg-white'}"><span class="sm:col-span-7 font-bold">${esc(t(d, 'title'))}</span><span class="sm:col-span-5 font-black ${i === last ? 'text-accent' : 'text-primary'}" dir="auto">${esc(t(d, 'dateLabel') || fmtDate(d.date, {day: '2-digit', month: lang === 'ar' ? 'long' : 'short', year: 'numeric'}))}</span></li>`).join('')}</ol>` : emptyBox(EMPTY())}
        ${dnote ? `<p class="mt-5 text-sm font-bold text-red-700 bg-red-50 border border-red-100 rounded-xl px-5 py-3">${esc(dnote)}</p>` : ''}</section>
      <section id="sub-guidelines" class="${CARD} scroll-mt-24">${secHead(L('قبل أن تكتب', 'Before you write'), L('شروط المشاركة في المؤتمر', 'Participation Requirements'))}
        ${list(sub.guidelines || [])}
        ${tpls.length ? `<div class="flex flex-wrap gap-4 mt-8">${tpls.map(([u, lb]) => `<a href="${esc(u)}" target="_blank" rel="noopener noreferrer" download class="inline-flex items-center gap-2 bg-primary hover:bg-secondary text-white font-black py-3.5 px-7 rounded-xl transition-colors"><i class="fas fa-file-word" aria-hidden="true"></i> ${lb}</a>`).join('')}</div>` : ''}</section>
      ${(pintro || ben.length || pub.length) ? `<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        ${(pintro || ben.length) ? `<section class="${CARD}">${secHead(L('نرحّب بكم', 'You are welcome'), L('المشاركة في المؤتمر', 'Attending the Conference'))}${pintro ? `<p class="text-gray-700 font-bold leading-relaxed mb-5">${esc(pintro)}</p>` : ''}${list(ben)}</section>` : ''}
        ${pub.length ? `<section class="${CARD}">${secHead(L('ما بعد المؤتمر', 'Beyond the event'), L('فرص النشر', 'Publication Opportunities'))}${list(pub)}</section>` : ''}</div>` : ''}
      <section class="bg-primary text-white rounded-3xl p-8 md:p-12 text-center relative overflow-hidden"><div class="absolute top-0 inset-x-0 h-1.5 bg-accent"></div>
        <h3 class="text-3xl font-black mb-4">${L('إرسال الورقة البحثية', 'Paper Submission')}</h3>
        <p class="text-gray-300 text-lg max-w-2xl mx-auto mb-8 leading-relaxed">${esc(t(sub, 'platformNote'))}</p>
        <div class="flex flex-wrap justify-center gap-4">${url ? `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 bg-secondary hover:bg-accent text-white font-black py-4 px-10 rounded-xl transition-colors text-lg">${L('تقديم الورقة عبر المنصة', 'Submit via the Platform')}</a>` : ''}<a href="${esc(guide)}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 border-2 border-white/30 hover:bg-white hover:text-primary text-white font-black py-4 px-8 rounded-xl transition-colors text-lg"><i class="fas fa-file-pdf" aria-hidden="true"></i>${L('دليل استخدام المنصة (PDF)', 'Event Submission Guidelines (PDF)')}</a></div></section>`;
  }

  // ---------- الرعاة ----------
  function renderHomeSponsors() {
    const sec = byId('home-sponsors'), root = byId('home-sponsors-root'); if (!sec || !root) return;
    const all = arr('sponsors'); sec.classList.toggle('hidden', !all.length);
    if (!all.length) { root.innerHTML = ''; return; }
    const card = (s, cls) => {
      const im = safeImg(s.logoUrl, 400), u = safeHttps(s.url);
      const inner = im ? `<img src="${esc(im)}" alt="${esc(s.name)}" loading="lazy" class="max-h-full max-w-full object-contain">` : `<span class="text-gray-500 font-black text-center text-sm">${esc(s.name)}</span>`;
      const base = `rise bg-white border border-gray-100 shadow-sm rounded-2xl p-4 flex items-center justify-center hover:shadow-lg hover:-translate-y-1 transition ${cls}`;
      return u ? `<a href="${esc(u)}" target="_blank" rel="noopener noreferrer" title="${esc(s.name)}" class="${base}">${inner}</a>` : `<div title="${esc(s.name)}" class="${base}">${inner}</div>`;
    };
    const tiers = [
      ['platinum', L('الراعي الماسي', 'Platinum Sponsor'), 'w-60 h-32'],
      ['gold', L('الرعاة الذهبيون', 'Gold Sponsors'), 'w-52 h-28'],
      ['silver', L('الرعاة الفضيون', 'Silver Sponsors'), 'w-44 h-24'],
      ['partner', L('الشركاء', 'Partners'), 'w-40 h-24'],
    ];
    root.innerHTML = tiers.map(([k, title, cls]) => {
      const items = all.filter((s) => s.tier === k); if (!items.length) return '';
      return `<div class="mb-10 text-center"><h3 class="text-sm font-black text-gray-400 uppercase tracking-widest mb-5">${title}</h3><div class="flex flex-wrap justify-center gap-5">${items.map((s) => card(s, cls)).join('')}</div></div>`;
    }).join('');
  }

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
      const fn = clean(byId('cf-fname').value, 60), ln = clean(byId('cf-lname').value, 60), name = `${fn} ${ln}`.trim(), email = clean(byId('cf-email').value, 120), msg = String(byId('cf-msg').value || '').replace(/\u0000/g, '').trim().slice(0, 1500), st = byId('cf-status');
      if (!fn || !ln || !msg) return setStatus(st, false, L('يرجى ملء جميع الحقول.', 'Please fill in all fields.'));
      if (!isEmail(email)) return setStatus(st, false, L('البريد الإلكتروني غير صالح.', 'Invalid email address.'));
      sendMail(`[ICEIC 2027] ${name}`, `${msg}\n\n— ${name} <${email}>`);
      setStatus(st, true, L('تم تجهيز رسالتك في برنامج البريد لديك. اضغط "إرسال" هناك لإتمامها.', 'Your message is ready in your mail app. Press "Send" there to finish.'));
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
    renderCommittees(); renderSpeakers(); renderProgram(); renderSubmission(); renderSponsors(); renderHomeSponsors();
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
    news: L('الإعلانات', 'Announcements'), about: L('حول المؤتمر', 'About Conference'), history: L('الطبعات السابقة للمؤتمر', 'Previous Editions'),
    topics: L('محاور المؤتمر', 'Conference Tracks'), speakers: L('المتحدثون الرئيسيون', 'Keynote Speakers'), program: L('برنامج المؤتمر', 'Conference Program'),
    committees: L('لجان المؤتمر', 'Committees'), submission: L('تقديم الأوراق', 'Submission'), contact: L('اتصل بنا', 'Contact Us'),
    venue: L('مكان الانعقاد', 'Venue'), sponsors: L('الرعاة والشركاء', 'Sponsors & Partners'),
  });

  function route(keepScroll) {
    const full = location.hash.slice(1);
    const [rawBase, query] = full.split('?');
    let base = rawBase, edition = null;
    if (rawBase === 'venue') { location.replace('#home?section=home-venue'); return; }
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
      if (edition) { renderEdition(edition); title = L(`تفاصيل طبعة ${edition}`, `${edition} Edition Details`); }
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
      else if (a === 'track-toggle') {
        const ul = el.parentElement.querySelector('.track-pts'), open = el.getAttribute('aria-expanded') !== 'true';
        el.setAttribute('aria-expanded', String(open)); if (ul) ul.classList.toggle('hidden', !open);
        const ch = el.querySelector('.track-chev'); if (ch) ch.style.transform = open ? 'rotate(180deg)' : '';
      }
      else if (a === 'prog-tab') switchProgramTab(el.dataset.tab);
      else if (a === 'open-ann') openAnn(el.dataset.id);
      else if (a === 'open-spk') openSpk(el.dataset.id);
      else if (a === 'ann-prev') annShow(annIdx - 1);
      else if (a === 'ann-next') annShow(annIdx + 1);
      else if (a === 'ann-go') annShow(Number(el.dataset.i) || 0);
      else if (a === 'ann-toggle') { annPaused = !annPaused; annSchedule(); }
      else if (a === 'spk-toggle') {
        const p = el.previousElementSibling, open = el.getAttribute('aria-expanded') !== 'true';
        el.setAttribute('aria-expanded', String(open)); if (p) p.classList.toggle('clamp4', !open);
        el.innerHTML = `${open ? L('عرض أقل', 'Show less') : L('اقرأ المزيد', 'Read more')} <i class="fas fa-chevron-${open ? 'up' : 'down'} text-[10px]" aria-hidden="true"></i>`;
      }
      else if (a === 'open-img') {
        const src = safeImg(el.dataset.src); if (!src) return;
        const im = byId('lightbox-img'); im.src = src; im.alt = el.dataset.alt || ''; openModal('lightbox');
      }
    });
    document.addEventListener('input', (ev) => {
      const el = ev.target; if (!(el instanceof Element) || !el.matches('[data-com-filter]')) return;
      const q = el.value.trim().toLowerCase(), wrap = el.closest('.com-content'); if (!wrap) return;
      let shown = 0;
      wrap.querySelectorAll('.com-card').forEach((c) => { const ok = !q || (c.dataset.q || '').includes(q); c.classList.toggle('hidden', !ok); if (ok) shown++; });
      const em = wrap.querySelector('[data-com-empty]'); if (em) em.classList.toggle('hidden', shown > 0);
    });
    const ns = byId('home-news-section');
    if (ns) {
      const hov = (v) => () => { annHover = v; if (v) { clearTimeout(annTimer); annTimer = null; const r = byId('ann-carousel'); if (r) r.classList.add('ann-paused'); } else annSchedule(); };
      ns.addEventListener('mouseenter', hov(true)); ns.addEventListener('mouseleave', hov(false));
      ns.addEventListener('focusin', hov(true)); ns.addEventListener('focusout', hov(false));
    }
    document.addEventListener('visibilitychange', () => { if (annN > 1) annSchedule(); });
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
    const topBtn = byId('to-top');
    if (topBtn) {
      const onScroll = () => { const show = window.scrollY > 400; topBtn.classList.toggle('hidden', !show); topBtn.classList.toggle('flex', show); };
      window.addEventListener('scroll', onScroll, {passive: true}); onScroll();
      topBtn.addEventListener('click', () => window.scrollTo({top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'}));
    }
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

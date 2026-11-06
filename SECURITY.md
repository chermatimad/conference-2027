# SECURITY — دليل الأمن والتسليم لمسؤول الخادم

موقع المؤتمر الدولي الثاني للقضايا الاقتصادية المعاصرة (ICCEI 2027) موقع **ثابت** (HTML/CSS/JS) يقرأ محتواه من Sanity. لا توجد قاعدة بيانات ولا خادم تطبيقات ولا حسابات مستخدمين ولا تخزين لبيانات الزوار، وهذا يقلّص سطح الهجوم كثيراً.

## 1) ما هو مطبَّق في الكود
| الحماية | التفاصيل |
|---|---|
| **CSP صارمة** | `default-src 'none'`، السكربتات من نفس النطاق فقط، لا CDN ولا سكربتات مضمّنة، `object-src 'none'`، `base-uri 'none'`، `form-action 'none'`، `upgrade-insecure-requests`. |
| **منع XSS** | كل نص قادم من Sanity يمرّ عبر `esc()` أو `textContent`. لا `eval` ولا معالجات أحداث مضمّنة ولا `javascript:`. |
| **تحقق من الروابط** | الروابط https فقط؛ الصور والملفات من `cdn.sanity.io` فقط؛ الأيقونات بقائمة بيضاء (regex)؛ الألوان HEX فقط. |
| **الروابط الخارجية** | كلها `target="_blank"` مع `rel="noopener noreferrer"`. |
| **الإطارات** | خريطة Google وYouTube (نطاق `youtube-nocookie`) داخل `iframe` بخاصية `sandbox` و`referrerpolicy`. |
| **النماذج** | لا ترسل شيئاً لأي خادم؛ تفتح برنامج البريد (`mailto:`) بعد تنقية الحقول والتحقق من البريد. |
| **التوجيه** | المسارات من قائمة بيضاء؛ الطبعات بـ regex رقمي من 4 خانات. |
| **بدون أطراف ثالثة** | الخطوط والأيقونات محلية؛ لا Google Fonts ولا تحليلات ولا صور خارجية (الصورة الرمزية محلية). |
| **اعتماديات الواجهة** | `npm audit --omit=dev` → 0 ثغرات (الواجهة لا تشحن أي مكتبة runtime سوى AOS وFontAwesome محلياً). |
| **لا أسرار في المستودع** | فُحص الكود والتاريخ: لا مفاتيح ولا رموز (tokens). ملفات `.env` مستثناة في `.gitignore`. |

## 2) ترويسات HTTP (على الخادم)
لا يمكن لوسم `<meta>` فرض `frame-ancestors` ولا HSTS ولا `X-Content-Type-Options`، ولذلك يجب إضافتها على الخادم. الملف `_headers` يغطي Netlify وCloudflare Pages. لـ **Nginx**:

```nginx
server {
    listen 443 ssl http2;
    server_name example.univ-setif.dz;           # عدّل النطاق
    root /var/www/conference-2027;               # مجلد الموقع (بدون studio/ ولا node_modules/)
    index index.html;

    add_header Content-Security-Policy "default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data: https://cdn.sanity.io; font-src 'self'; connect-src 'self' https://k6sogxhu.apicdn.sanity.io https://k6sogxhu.api.sanity.io; frame-src https://www.google.com/maps/ https://www.youtube-nocookie.com; manifest-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'; upgrade-insecure-requests" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=(), usb=()" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header Cross-Origin-Opener-Policy "same-origin" always;

    server_tokens off;
    location ~ /\.(?!well-known) { deny all; }   # منع الملفات المخفية (.git, .env ...)
    location ~* ^/(studio|node_modules|tools|package(-lock)?\.json|tailwind\.config\.cjs|README\.md|SECURITY\.md)(/|$) { return 404; }
    location / { try_files $uri $uri/ /index.html; }
}
server { listen 80; server_name example.univ-setif.dz; return 301 https://$host$request_uri; }
```

لـ **Apache** (`mod_headers`):

```apache
Header always set Content-Security-Policy "default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data: https://cdn.sanity.io; font-src 'self'; connect-src 'self' https://k6sogxhu.apicdn.sanity.io https://k6sogxhu.api.sanity.io; frame-src https://www.google.com/maps/ https://www.youtube-nocookie.com; manifest-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'; upgrade-insecure-requests"
Header always set X-Content-Type-Options "nosniff"
Header always set X-Frame-Options "DENY"
Header always set Referrer-Policy "strict-origin-when-cross-origin"
Header always set Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=(), usb=()"
Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
Header always set Cross-Origin-Opener-Policy "same-origin"
ServerTokens Prod
Options -Indexes
<FilesMatch "^\.">
  Require all denied
</FilesMatch>
```

**ما يُنشر على الخادم:** `index.html` و`assets/` فقط (+ `_headers` اختيارياً). لا تنشر `studio/` ولا `node_modules/` ولا `.git/` ولا `tools/`.

**عند نقل الموقع إلى نطاق الجامعة** يجب: (أ) إضافة النطاق الجديد في **CORS Origins** في Sanity (القسم 3)، (ب) فحص الموقع بعد النقل في https://securityheaders.com وhttps://observatory.mozilla.org (المطلوب تقدير A أو أعلى).

## 3) إعدادات Sanity (من https://www.sanity.io/manage ← المشروع k6sogxhu)
- **API ← CORS origins:** اترك فقط نطاقات الموقع الفعلية (`https://chermatimad.github.io` والنطاق الجديد للجامعة). احذف أي `localhost` أو `127.0.0.1` أو `*`. **لا تفعّل** "Allow credentials" للنطاقات العامة.
- **API ← Tokens:** احذف أي رمز غير مستخدم. لا يحتاج الموقع إلى رمز أصلاً (قراءة عامة).
- **Members:** كل محرر بدور **Editor** أو أقل؛ **Administrator** لشخصين على الأكثر. أزل من لم يعد يعمل في المشروع.
- **حسابات المحررين:** فعّل المصادقة الثنائية (2FA) في حساب Sanity/Google/GitHub المستعمل للدخول.
- **Dataset `production`:** عام للقراءة (المحتوى منشور أصلاً للعامة). المسودات غير مرئية للعامة. لا تضع في Sanity أي بيانات شخصية أو سرية (هواتف خاصة، وثائق داخلية...).
- بعد التسليم: انقل ملكية المشروع إلى حساب مؤسسي للجامعة.

## 4) GitHub (إن بقي المستودع مستعملاً)
- فعّل 2FA على الحساب. فعّل **Secret scanning** و**Dependabot alerts**.
- Pages ← **Enforce HTTPS** مفعّل.
- المستودع لا يحتوي أسراراً، لكن عند التسليم انقله إلى منظمة الجامعة وأزل صلاحيات الحسابات الشخصية.

## 5) الصيانة الدورية
- كل 3 أشهر: `npm audit` في مجلد المشروع، وفي `studio/` (أدوات Sanity للتحرير فقط ولا تُنشر مع الموقع؛ تظهر فيها تنبيهات من تبعيات التطوير، وتُحدَّث بتحديث `sanity` عند التهدئة).
- بعد أي تعديل برمجي: أعد `npm run build:css` ثم ارفع التعديل، وغيّر رقم `?v=` في `index.html` ليتحدث الموقع عند الزوار.
- لا تضف سكربتات أو خطوطاً أو صوراً من نطاقات خارجية دون تعديل CSP عن قصد.
- أي حقل جديد في Sanity يُعرَض يجب أن يمرّ عبر `esc()` (لا تستعمل `innerHTML` بنص خام أبداً).

## 6) الإبلاغ عن ثغرة
راسل مسؤول الموقع على بريد المؤتمر الظاهر في صفحة «اتصل بنا».

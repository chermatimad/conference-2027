import {defineField, defineType} from 'sanity'
import {bilingual, iconField, imageField, safeUrl} from './helpers'

const colorField = (name: string, title: string, def: string) =>
  defineField({
    name,
    title,
    type: 'string',
    group: 'theme',
    description: `لون بصيغة HEX مثل ${def} — اتركه فارغاً لاستعمال اللون الأصلي للتصميم`,
    validation: (Rule) => Rule.regex(/^#[0-9a-fA-F]{6}$/, {name: 'hex'}).error('الصيغة الصحيحة: #RRGGBB'),
  })

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'إعدادات الموقع العامة',
  type: 'document',
  groups: [
    {name: 'identity', title: 'الهوية والعنوان', default: true},
    {name: 'event', title: 'موعد المؤتمر'},
    {name: 'contact', title: 'الاتصال والمكان'},
    {name: 'social', title: 'التواصل الاجتماعي'},
    {name: 'footer', title: 'التذييل والسيو'},
    {name: 'logos', title: 'الشعارات (3 في الأعلى والأسفل)'},
    {name: 'theme', title: 'الألوان والمظهر'},
  ],
  fields: [
    ...bilingual('siteTitle', 'عنوان المؤتمر', {required: true}).map((f) => ({...f, group: 'identity'})),
    ...bilingual('heroTitle', 'العنوان الرئيسي في الواجهة', {required: true}).map((f) => ({...f, group: 'identity'})),
    ...bilingual('theme', 'محور/شعار المؤتمر', {type: 'text', rows: 3, required: true}).map((f) => ({...f, group: 'identity'})),
    ...bilingual('eventDateText', 'تاريخ المؤتمر المعروض تحت العنوان (مثال: 20-21 أفريل 2027)', {max: 60}).map((f) => ({...f, group: 'identity'})),
    ...bilingual('editionLabel', 'شارة الطبعة (مثال: الطبعة الثانية - 2027)').map((f) => ({...f, group: 'identity'})),
    {...imageField('universityLogoAr', 'شعار الجامعة (النسخة العربية)'), group: 'logos'},
    {...imageField('universityLogoEn', 'شعار الجامعة (النسخة الإنجليزية)'), group: 'logos'},
    {...imageField('facultyLogoAr', 'شعار الكلية (النسخة العربية)'), group: 'logos'},
    {...imageField('facultyLogoEn', 'شعار الكلية (النسخة الإنجليزية)'), group: 'logos'},
    {...imageField('conferenceLogoAr', 'شعار المؤتمر (النسخة العربية)'), group: 'logos'},
    {...imageField('conferenceLogoEn', 'شعار المؤتمر (النسخة الإنجليزية)'), group: 'logos'},
    {...imageField('footerUnivLogoAr', 'شعار الجامعة في التذييل (عربي)'), group: 'logos'},
    {...imageField('footerUnivLogoEn', 'شعار الجامعة في التذييل (إنجليزي)'), group: 'logos'},
    {...imageField('footerFacultyLogoAr', 'شعار الكلية في التذييل (عربي)'), group: 'logos'},
    {...imageField('footerFacultyLogoEn', 'شعار الكلية في التذييل (إنجليزي)'), group: 'logos'},
    {...imageField('footerConfLogoAr', 'شعار المؤتمر في التذييل (عربي)'), group: 'logos'},
    {...imageField('footerConfLogoEn', 'شعار المؤتمر في التذييل (إنجليزي)'), group: 'logos'},
    {...imageField('conferenceLogo', 'شعار المؤتمر (قديم - احتياطي، يمكن تركه فارغاً)'), group: 'logos'},
    {...imageField('heroBackground', 'صورة خلفية الواجهة (اختياري)', 'تظهر بشفافية فوق التدرج اللوني'), group: 'identity'},

    defineField({
      name: 'eventStart', title: 'تاريخ ووقت بداية المؤتمر (للعدّ التنازلي)', type: 'datetime', group: 'event',
      validation: (R) => R.required(),
    }),
    defineField({name: 'eventEnd', title: 'تاريخ نهاية المؤتمر', type: 'datetime', group: 'event'}),
    defineField({
      name: 'announcementInterval', title: 'مدة بقاء كل إعلان في الصفحة الرئيسية (بالثواني)', type: 'number', group: 'event',
      initialValue: 20, description: 'الإعلانات تتبدّل تلقائياً. القيمة بين 5 و120 ثانية، والافتراضي 20.',
      validation: (R) => R.min(5).max(120).integer(),
    }),
    defineField({
      name: 'registrationOpen', title: 'استقبال الأوراق مفتوح؟ (يُظهر زر «إرسال الورقة البحثية»)', type: 'boolean', initialValue: true, group: 'event',
    }),
    defineField({
      name: 'paperSubmissionUrl', title: 'رابط منصة إرسال الأوراق', type: 'url', group: 'event',
      validation: safeUrl(),
    }),

    defineField({
      name: 'contactEmail', title: 'البريد الرسمي', type: 'string', group: 'contact',
      initialValue: 'digitalcell.fsecg@gmail.com',
      validation: (R) => R.required().regex(/^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/, {name: 'email'}).max(120),
    }),
    defineField({
      name: 'contactEmail2', title: 'بريد إضافي (اختياري، يظهر في صفحة اتصل بنا)', type: 'string', group: 'contact',
      validation: (R) => R.regex(/^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/, {name: 'email'}).max(120),
    }),
    defineField({name: 'phone', title: 'الهاتف', type: 'string', group: 'contact', validation: (R) => R.max(40)}),
    ...bilingual('venueName', 'اسم المؤسسة / المكان').map((f) => ({...f, group: 'contact'})),
    ...bilingual('venueDescription', 'وصف المكان', {type: 'text', rows: 3}).map((f) => ({...f, group: 'contact'})),
    ...bilingual('address', 'العنوان').map((f) => ({...f, group: 'contact'})),
    defineField({
      name: 'mapEmbedUrl', title: 'رابط تضمين خريطة Google (embed)', type: 'url', group: 'contact',
      description: 'يجب أن يبدأ بـ https://www.google.com/maps/embed',
      validation: (R) => R.uri({scheme: ['https']}).custom((v?: string) =>
        !v || v.startsWith('https://www.google.com/maps/embed') ? true : 'يجب أن يكون رابط embed من خرائط Google'),
    }),
    defineField({name: 'mapLinkUrl', title: 'رابط فتح الخريطة', type: 'url', group: 'contact', validation: safeUrl()}),

    defineField({
      name: 'socialLinks',
      title: 'منصات إضافية (تظهر بعد «تابعنا على»)',
      description: 'أضف أي منصة: الاسم + الأيقونة + الرابط. الأيقونة مثل: fab fa-telegram أو fab fa-x-twitter أو fab fa-tiktok أو fab fa-whatsapp',
      type: 'array',
      group: 'social',
      of: [{
        type: 'object',
        name: 'socialLink',
        fields: [
          defineField({name: 'label', title: 'اسم المنصة', type: 'string', validation: (R) => R.required().max(40)}),
          iconField('الأيقونة (Font Awesome Brands)', 'fab fa-telegram'),
          defineField({name: 'url', title: 'الرابط', type: 'url', validation: safeUrl()}),
        ],
        preview: {select: {title: 'label', subtitle: 'url'}},
      }],
      validation: (R) => R.max(10),
    }),
    defineField({name: 'facebookUrl', title: 'فيسبوك', type: 'url', group: 'social', validation: safeUrl()}),
    defineField({name: 'linkedinUrl', title: 'لينكد إن', type: 'url', group: 'social', validation: safeUrl()}),
    defineField({name: 'youtubeUrl', title: 'يوتيوب', type: 'url', group: 'social', validation: safeUrl()}),
    defineField({name: 'instagramUrl', title: 'انستغرام', type: 'url', group: 'social', validation: safeUrl()}),

    ...bilingual('footerAbout', 'نبذة التذييل', {type: 'text', rows: 3}).map((f) => ({...f, group: 'footer'})),
    ...bilingual('footerLine', 'سطر العنوان في التذييل (مثال: كلية ... | جامعة سطيف 1 - فرحات عباس، الجزائر)').map((f) => ({...f, group: 'footer'})),
    ...bilingual('copyright', 'نص حقوق النشر').map((f) => ({...f, group: 'footer'})),
    ...bilingual('seoDescription', 'وصف محركات البحث (SEO)', {type: 'text', rows: 2, max: 300}).map((f) => ({...f, group: 'footer'})),
    {...imageField('shareImage', 'صورة المشاركة (Open Graph)'), group: 'footer'},
    defineField({name: 'callPdfAr', title: 'ملف إعلان المؤتمر PDF (النسخة العربية) — يُحمَّل من الموقع', type: 'file', group: 'event', options: {accept: '.pdf'}}),
    defineField({name: 'callPdfEn', title: 'ملف إعلان المؤتمر PDF (النسخة الإنجليزية)', type: 'file', group: 'event', options: {accept: '.pdf'}}),
    defineField({name: 'programPdfAr', title: 'ملف برنامج المؤتمر PDF (النسخة العربية) — يظهر في صفحة البرنامج', type: 'file', group: 'event', options: {accept: '.pdf'}}),
    defineField({name: 'programPdfEn', title: 'ملف برنامج المؤتمر PDF (النسخة الإنجليزية)', type: 'file', group: 'event', options: {accept: '.pdf'}}),
    defineField({
      name: 'iconStyle',
      title: 'مربعات الأيقونات الزخرفية في الموقع',
      type: 'string',
      group: 'theme',
      initialValue: 'none',
      options: {
        layout: 'radio',
        list: [
          {title: 'إخفاؤها كلياً (تصميم نظيف)', value: 'none'},
          {title: 'أيقونة بسيطة بلا مربع', value: 'plain'},
          {title: 'مربعات الأيقونات (التصميم القديم)', value: 'tile'},
        ],
      },
    }),
    colorField('colorPrimary', 'اللون الأساسي (الأزرق الداكن)', '#15254A'),
    colorField('colorSecondary', 'اللون الثانوي (الأخضر)', '#1A8140'),
    colorField('colorAccent', 'لون التمييز (الذهبي)', '#BE9238'),
    colorField('colorLightBlue', 'الأزرق الفاتح', '#84C3E4'),
    colorField('colorBackground', 'لون خلفية الصفحات', '#F4F7FA'),
    // نص الاعتماد ثابت في الواجهة ولا يُدار من هنا عمداً: "تطوير خلية الرقمنة ..."
  ],
  preview: {prepare: () => ({title: 'إعدادات الموقع العامة'})},
})

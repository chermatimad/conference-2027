import {defineField, defineType} from 'sanity'
import {bilingual, imageField, safeUrl} from './helpers'

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
  ],
  fields: [
    ...bilingual('siteTitle', 'عنوان المؤتمر', {required: true}).map((f) => ({...f, group: 'identity'})),
    ...bilingual('heroTitle', 'العنوان الرئيسي في الواجهة', {required: true}).map((f) => ({...f, group: 'identity'})),
    ...bilingual('theme', 'محور/شعار المؤتمر', {type: 'text', rows: 3, required: true}).map((f) => ({...f, group: 'identity'})),
    ...bilingual('editionLabel', 'شارة النسخة (مثال: النسخة الثانية - 2027)').map((f) => ({...f, group: 'identity'})),
    {...imageField('facultyLogoAr', 'شعار الكلية (عربي)'), group: 'identity'},
    {...imageField('facultyLogoEn', 'شعار الكلية (إنجليزي)'), group: 'identity'},
    {...imageField('conferenceLogo', 'شعار المؤتمر'), group: 'identity'},
    {...imageField('heroBackground', 'صورة خلفية الواجهة (اختياري)', 'تظهر بشفافية فوق التدرج اللوني'), group: 'identity'},

    defineField({
      name: 'eventStart', title: 'تاريخ ووقت بداية المؤتمر (للعدّ التنازلي)', type: 'datetime', group: 'event',
      validation: (R) => R.required(),
    }),
    defineField({name: 'eventEnd', title: 'تاريخ نهاية المؤتمر', type: 'datetime', group: 'event'}),
    defineField({
      name: 'registrationOpen', title: 'التسجيل مفتوح؟', type: 'boolean', initialValue: true, group: 'event',
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

    defineField({name: 'facebookUrl', title: 'فيسبوك', type: 'url', group: 'social', validation: safeUrl()}),
    defineField({name: 'linkedinUrl', title: 'لينكد إن', type: 'url', group: 'social', validation: safeUrl()}),
    defineField({name: 'youtubeUrl', title: 'يوتيوب', type: 'url', group: 'social', validation: safeUrl()}),
    defineField({name: 'instagramUrl', title: 'انستغرام', type: 'url', group: 'social', validation: safeUrl()}),

    ...bilingual('footerAbout', 'نبذة التذييل', {type: 'text', rows: 3}).map((f) => ({...f, group: 'footer'})),
    ...bilingual('copyright', 'نص حقوق النشر').map((f) => ({...f, group: 'footer'})),
    ...bilingual('seoDescription', 'وصف محركات البحث (SEO)', {type: 'text', rows: 2, max: 300}).map((f) => ({...f, group: 'footer'})),
    {...imageField('shareImage', 'صورة المشاركة (Open Graph)'), group: 'footer'},
    // نص الاعتماد ثابت في الواجهة ولا يُدار من هنا عمداً: "تطوير خلية الرقمنة ..."
  ],
  preview: {prepare: () => ({title: 'إعدادات الموقع العامة'})},
})

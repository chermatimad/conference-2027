import {defineArrayMember, defineField, defineType} from 'sanity'
import {bilingual, iconField, imageField, safeUrl} from './helpers'


export const homePage = defineType({
  name: 'homePage',
  title: 'الصفحة الرئيسية',
  type: 'document',
  fields: [
    ...bilingual('gatewayTitle', 'عنوان قسم البطاقات (استكشف تفاصيل المؤتمر)'),
    defineField({
      name: 'gatewayCards',
      title: 'بطاقات الاستكشاف في الصفحة الرئيسية',
      description: 'اتركها فارغة لاستعمال البطاقات الافتراضية الأربع. الترقيم يتبع الترتيب. حتى 8 بطاقات.',
      type: 'array',
      of: [defineArrayMember({
        type: 'object',
        fields: [
          ...bilingual('title', 'العنوان', {required: true}),
          ...bilingual('text', 'الوصف القصير', {max: 120}),
          defineField({
            name: 'target', title: 'الصفحة التي تفتحها', type: 'string', validation: (R) => R.required(),
            options: {list: [
              {title: 'المحاور', value: 'topics'}, {title: 'المتحدثون', value: 'speakers'}, {title: 'البرنامج', value: 'program'},
              {title: 'المشاركة والنشر', value: 'submission'}, {title: 'الإعلانات', value: 'news'}, {title: 'حول المؤتمر', value: 'about'},
              {title: 'تاريخ المؤتمر', value: 'history'}, {title: 'اللجان', value: 'committees'}, {title: 'الرعاة', value: 'sponsors'},
              {title: 'المكان', value: 'venue'}, {title: 'اتصل بنا', value: 'contact'},
            ]},
          }),
        ],
        preview: {select: {title: 'title_ar', subtitle: 'target'}},
      })],
      validation: (R) => R.max(8),
    }),
    ...bilingual('welcomeKicker', 'عنوان صغير (مرحباً بكم)'),
    ...bilingual('welcomeTitle', 'عنوان القسم (نظرة عامة)'),
    ...bilingual('welcomeHeading', 'عنوان البطاقة الكبيرة'),
    ...bilingual('welcomeText', 'نص الترحيب', {type: 'text', rows: 6, max: 1500}),
    imageField('welcomeImage', 'صورة البطاقة (الاقتصاد)'),
    imageField('welcomeImage2', 'صورة البطاقة (زراعة مستدامة)'),
    ...bilingual('welcomeImage2Label', 'عنوان الصورة الثانية'),
    defineField({
      name: 'stats', title: 'الإحصائيات الرئيسية', type: 'array',
      of: [defineArrayMember({
        type: 'object',
        fields: [
          defineField({name: 'value', title: 'القيمة (مثال: +15)', type: 'string', validation: (R) => R.required().max(12)}),
          iconField('أيقونة البطاقة (اختياري)'),
          ...bilingual('label', 'التسمية', {required: true}),
        ],
        preview: {select: {title: 'value', subtitle: 'label_ar'}},
      })],
      validation: (R) => R.max(4),
    }),
  ],
  preview: {prepare: () => ({title: 'الصفحة الرئيسية'})},
})

export const aboutPage = defineType({
  name: 'aboutPage',
  title: 'صفحة: حول المؤتمر',
  type: 'document',
  fields: [
    ...bilingual('preambleTitle', 'عنوان الديباجة'),
    ...bilingual('preamble', 'نص الديباجة', {type: 'text', rows: 8, max: 3000}),
    imageField('preambleImage', 'صورة الديباجة'),
    ...bilingual('importance', 'أهمية المؤتمر', {type: 'text', rows: 8, max: 3000}),
    ...bilingual('problemIntro', 'تمهيد الإشكالية', {type: 'text', rows: 3}),
    ...bilingual('problemQuestion', 'الإشكالية (السؤال الرئيسي)', {type: 'text', rows: 4}),
    defineField({
      name: 'objectives', title: 'الأهداف', type: 'array',
      of: [defineArrayMember({
        type: 'object',
        fields: [...bilingual('title', 'العنوان', {required: true}), ...bilingual('text', 'الوصف', {type: 'text', rows: 3, max: 600})],
        preview: {select: {title: 'title_ar', subtitle: 'title_en'}},
      })],
      validation: (R) => R.max(12),
    }),
    ...bilingual('tracksIntro', 'تمهيد صفحة المحاور', {type: 'text', rows: 3}),
  ],
  preview: {prepare: () => ({title: 'صفحة: حول المؤتمر'})},
})

export const submissionPage = defineType({
  name: 'submissionPage',
  title: 'صفحة: المشاركة والنشر',
  type: 'document',
  fields: [
    defineField({
      name: 'guidelines', title: 'إرشادات المؤلف', type: 'array',
      of: [defineArrayMember({
        type: 'object',
        fields: bilingual('text', 'الإرشاد', {type: 'text', rows: 2, max: 400, required: true}),
        preview: {select: {title: 'text_ar'}},
      })],
      validation: (R) => R.max(20),
    }),
    defineField({
      name: 'templateFile', title: 'قالب البحث (ملف)', type: 'file',
      options: {accept: '.doc,.docx,.pdf,.odt'},
    }),
    ...bilingual('platformNote', 'نص التقديم عبر المنصة', {type: 'text', rows: 2}),
  ],
  preview: {prepare: () => ({title: 'صفحة: المشاركة والنشر'})},
})

export const importantDate = defineType({
  name: 'importantDate',
  title: 'تواريخ مهمة',
  type: 'document',
  fields: [
    ...bilingual('title', 'العنوان', {required: true}),
    defineField({name: 'date', title: 'التاريخ', type: 'date', validation: (R) => R.required()}),
    iconField('الأيقونة (Font Awesome)', 'fa-calendar-check'),
    defineField({name: 'order', title: 'الترتيب', type: 'number', initialValue: 10}),
  ],
  orderings: [{title: 'الترتيب', name: 'o', by: [{field: 'order', direction: 'asc'}]}],
  preview: {select: {title: 'title_ar', subtitle: 'date'}},
})

export const track = defineType({
  name: 'track',
  title: 'محاور المؤتمر',
  type: 'document',
  fields: [
    defineField({name: 'order', title: 'رقم المحور', type: 'number', validation: (R) => R.required().integer().min(1).max(30)}),
    ...bilingual('kicker', 'ترقيم المحور (المحور الأول...)'),
    ...bilingual('title', 'اسم المحور', {required: true}),
    ...bilingual('description', 'الوصف', {type: 'text', rows: 3, max: 600}),
    iconField('الأيقونة (Font Awesome)', 'fa-shield-alt'),
    defineField({
      name: 'color', title: 'اللون', type: 'string', initialValue: 'primary',
      options: {list: [{title: 'أزرق داكن', value: 'primary'}, {title: 'أخضر', value: 'secondary'}, {title: 'ذهبي', value: 'accent'}, {title: 'أزرق فاتح', value: 'blue'}, {title: 'رمادي', value: 'gray'}, {title: 'بنفسجي', value: 'purple'}]},
    }),
  ],
  orderings: [{title: 'الترتيب', name: 'o', by: [{field: 'order', direction: 'asc'}]}],
  preview: {select: {title: 'title_ar', subtitle: 'title_en'}},
})

export const sponsor = defineType({
  name: 'sponsor',
  title: 'الرعاة والشركاء',
  type: 'document',
  fields: [
    defineField({name: 'name', title: 'الاسم', type: 'string', validation: (R) => R.required().max(120)}),
    defineField({
      name: 'tier', title: 'الفئة', type: 'string', initialValue: 'gold',
      options: {list: [{title: 'ماسي', value: 'platinum'}, {title: 'ذهبي', value: 'gold'}, {title: 'فضي', value: 'silver'}, {title: 'شريك', value: 'partner'}]},
      validation: (R) => R.required(),
    }),
    imageField('logo', 'الشعار'),
    defineField({name: 'url', title: 'الموقع الإلكتروني', type: 'url', validation: safeUrl()}),
    defineField({name: 'order', title: 'الترتيب', type: 'number', initialValue: 10}),
  ],
  preview: {select: {title: 'name', subtitle: 'tier', media: 'logo'}},
})

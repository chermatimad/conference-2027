import {defineArrayMember, defineField, defineType} from 'sanity'
import {bilingual, imageField, pairRule, safeUrl} from './helpers'

/** إعلانات هامة (شريط/نافذة منبثقة) وإعلانات دورية (أخبار) */
export const announcement = defineType({
  name: 'announcement',
  title: 'الإعلانات',
  type: 'document',
  fields: [
    defineField({
      name: 'kind', title: 'نوع الإعلان', type: 'string', initialValue: 'periodic',
      options: {
        layout: 'radio',
        list: [
          {title: 'إعلان هام (شريط علوي + نافذة اختيارية)', value: 'important'},
          {title: 'إعلان دوري / خبر', value: 'periodic'},
        ],
      },
      validation: (R) => R.required(),
    }),
    ...bilingual('title', 'العنوان', {required: true}),
    ...bilingual('body', 'النص', {type: 'text', rows: 6, max: 3000}),
    imageField('image', 'صورة الإعلان'),
    defineField({name: 'linkUrl', title: 'رابط (اختياري)', type: 'url', validation: safeUrl()}),
    ...bilingual('linkLabel', 'نص الرابط'),
    defineField({
      name: 'publishAt', title: 'يبدأ العرض في', type: 'datetime',
      initialValue: () => new Date().toISOString(), validation: (R) => R.required(),
    }),
    defineField({name: 'expireAt', title: 'ينتهي العرض في (اختياري)', type: 'datetime'}),
    defineField({
      name: 'displaySeconds', title: 'مدة ظهور هذا الإعلان في الشريط الرئيسي (بالثواني، اختياري)', type: 'number',
      description: 'اتركه فارغاً لاستعمال المدة العامة من «إعلانات الموقع ← مدة بقاء كل إعلان». القيمة بين 5 و120.',
      validation: (R) => R.min(5).max(120).integer(),
    }),
    defineField({name: 'pinned', title: 'تثبيت في الأعلى', type: 'boolean', initialValue: false}),
    defineField({
      name: 'popup', title: 'عرضه كنافذة منبثقة عند الدخول (للإعلانات الهامة)', type: 'boolean', initialValue: false,
      hidden: ({document}) => document?.kind !== 'important',
    }),
  ],
  orderings: [{title: 'الأحدث', name: 'newest', by: [{field: 'publishAt', direction: 'desc'}]}],
  preview: {
    select: {title: 'title_ar', kind: 'kind', date: 'publishAt', media: 'image'},
    prepare: ({title, kind, date, media}) => ({
      title,
      subtitle: `${kind === 'important' ? '⭐ هام' : '📰 دوري'} — ${date ? new Date(date).toLocaleDateString('ar-DZ') : ''}`,
      media,
    }),
  },
})

export const speaker = defineType({
  name: 'speaker',
  title: 'المتحدثون الرئيسيون (Keynote)',
  type: 'document',
  fields: [
    ...bilingual('name', 'الاسم', {required: true}),
    ...bilingual('role', 'المنصب (مثال: رئيس جامعة، مدير عام)'),
    ...bilingual('institution', 'المؤسسة والبلد (مثال: جامعة إسطنبول، تركيا)'),
    ...bilingual('bio', 'نبذة (تظهر مقتطعة مع «اقرأ المزيد»)', {type: 'text', rows: 6, max: 2500}),
    imageField('image', 'الصورة (يُفضّل صورة عمودية أو مربعة لوجه واضح)'),
    defineField({name: 'linkedinUrl', title: 'رابط لينكد إن (اختياري)', type: 'url', validation: safeUrl()}),
    defineField({name: 'websiteUrl', title: 'رابط الموقع أو الملف الشخصي (اختياري)', type: 'url', validation: safeUrl()}),
    defineField({name: 'order', title: 'الترتيب', type: 'number', initialValue: 10}),
  ],
  orderings: [{title: 'الترتيب', name: 'o', by: [{field: 'order', direction: 'asc'}]}],
  preview: {select: {title: 'name_ar', subtitle: 'role_ar', media: 'image'}},
})

/** اسم النوع "committee" محفوظ للتوافق مع البيانات الحالية في المشروع */
export const committee = defineType({
  name: 'committee',
  title: 'أعضاء اللجان',
  type: 'document',
  fields: [
    defineField({
      name: 'committeeType', title: 'اللجنة', type: 'string',
      options: {layout: 'radio', list: [{title: 'اللجنة العليا للمؤتمر', value: 'high'}, {title: 'اللجنة العلمية', value: 'scientific'}, {title: 'اللجنة التنظيمية', value: 'organizing'}]},
      validation: (R) => R.required(),
    }),
    ...bilingual('name', 'الاسم', {required: true}),
    ...bilingual('role', 'الصفة (رئيس، عضو...)'),
    ...bilingual('institution', 'المؤسسة'),
    imageField('image', 'الصورة (اختيارية — تظهر فقط إذا أضفتها)'),
    defineField({
      name: 'order', title: 'الترتيب (1 = الرئيس)', type: 'number', initialValue: 10,
      validation: (R) => R.required().integer().min(1),
    }),
  ],
  orderings: [
    {title: 'اللجنة ثم الترتيب', name: 'o', by: [{field: 'committeeType', direction: 'asc'}, {field: 'order', direction: 'asc'}]},
  ],
  preview: {
    select: {title: 'name_ar', type: 'committeeType', role: 'role_ar', media: 'image'},
    prepare: ({title, type, role, media}) => ({
      title,
      subtitle: `${{high: 'العليا', scientific: 'العلمية', organizing: 'التنظيمية'}[type as string] ?? ''} — ${role ?? ''}`,
      media,
    }),
  },
})

export const programDay = defineType({
  name: 'programDay',
  title: 'برنامج المؤتمر (الأيام)',
  type: 'document',
  fields: [
    defineField({name: 'dayNumber', title: 'رقم اليوم', type: 'number', validation: (R) => R.required().integer().min(1).max(10)}),
    defineField({name: 'date', title: 'التاريخ', type: 'date', validation: (R) => R.required()}),
    ...bilingual('label', 'عنوان التبويب (اختياري)'),
    defineField({
      name: 'sessions', title: 'الفقرات', type: 'array',
      of: [defineArrayMember({
        type: 'object',
        fields: [
          defineField({name: 'timeFrom', title: 'من (HH:MM)', type: 'string', validation: (R) => R.required().regex(/^([01]\d|2[0-3]):[0-5]\d$/, {name: 'time'})}),
          defineField({name: 'timeTo', title: 'إلى (HH:MM)', type: 'string', validation: (R) => R.regex(/^([01]\d|2[0-3]):[0-5]\d$/, {name: 'time'})}),
          ...bilingual('title', 'عنوان الفقرة', {required: true}),
          ...bilingual('place', 'التفاصيل / المكان'),
          defineField({
            name: 'color', title: 'اللون', type: 'string', initialValue: 'primary',
            options: {list: [{title: 'ذهبي', value: 'accent'}, {title: 'أزرق داكن', value: 'primary'}, {title: 'أخضر', value: 'secondary'}, {title: 'أزرق', value: 'blue'}]},
          }),
        ],
        preview: {select: {title: 'title_ar', from: 'timeFrom', to: 'timeTo'}, prepare: ({title, from, to}) => ({title, subtitle: `${from ?? ''} - ${to ?? ''}`})},
      })],
    }),
  ],
  orderings: [{title: 'اليوم', name: 'o', by: [{field: 'dayNumber', direction: 'asc'}]}],
  preview: {select: {n: 'dayNumber', date: 'date'}, prepare: ({n, date}) => ({title: `اليوم ${n}`, subtitle: date})},
})

/** نسخ المؤتمر السابقة (الاسم history محفوظ للتوافق) */
export const history = defineType({
  name: 'history',
  title: 'الطبعات السابقة (التاريخ)',
  type: 'document',
  fieldsets: [{name: 'legacy', title: 'حقول قديمة (للتوافق)', options: {collapsible: true, collapsed: true}}],
  fields: [
    defineField({name: 'editionYear', title: 'سنة الطبعة (مثال: 2025)', type: 'string', validation: (R) => R.required().regex(/^\d{4}$/, {name: 'year'})}),
    defineField({name: 'dateLabel_ar', title: 'التاريخ (نص عربي)', type: 'string', validation: (R) => pairRule(R, 'dateLabel', 'ar')}),
    defineField({name: 'dateLabel_en', title: 'Date (English text)', type: 'string', validation: (R) => pairRule(R, 'dateLabel', 'en')}),
    ...bilingual('title', 'عنوان الطبعة', {required: true}),
    ...bilingual('summary', 'ملخص قصير', {type: 'text', rows: 3, max: 600}),
    ...bilingual('intro', 'مقدمة الصفحة التفصيلية', {type: 'text', rows: 3, max: 800}),
    imageField('logo', 'شعار/ملصق الطبعة'),
    defineField({
      name: 'stats', title: 'الإحصائيات', type: 'array',
      of: [defineArrayMember({
        type: 'object',
        fields: [defineField({name: 'value', title: 'القيمة', type: 'string', validation: (R) => R.required().max(12)}), ...bilingual('label', 'التسمية', {required: true})],
        preview: {select: {title: 'value', subtitle: 'label_ar'}},
      })],
      validation: (R) => R.max(12),
    }),
    ...bilingual('excellence', 'التميز العلمي', {type: 'text', rows: 4, max: 1200}),
    ...bilingual('topics', 'محاور النقاش', {type: 'text', rows: 4, max: 1200}),
    ...bilingual('achievement', 'إنجاز وطموح', {type: 'text', rows: 4, max: 1200}),
    ...bilingual('recommendations', 'توصيات المؤتمر', {type: 'text', rows: 10, max: 8000}),
    defineField({name: 'programPdf', title: 'برنامج المؤتمر (PDF)', type: 'file', options: {accept: '.pdf'}}),
    defineField({name: 'videoUrl_ar', title: 'فيديو يوتيوب (عربي)', type: 'url', validation: safeUrl()}),
    defineField({name: 'videoUrl_en', title: 'YouTube video (English)', type: 'url', validation: safeUrl()}),
    ...bilingual('galleryTitle', 'عنوان معرض الصور'),
    defineField({
      name: 'gallery', title: 'معرض الصور', type: 'array',
      of: [defineArrayMember({type: 'image', options: {hotspot: true, accept: 'image/png,image/jpeg,image/webp'}, fields: [
        defineField({name: 'caption_ar', title: 'تعليق (عربي)', type: 'string', validation: (R) => [R.max(160), pairRule(R, 'caption', 'ar')]}),
        defineField({name: 'caption_en', title: 'Caption (English)', type: 'string', validation: (R) => [R.max(160), pairRule(R, 'caption', 'en')]}),
      ]})],
      options: {layout: 'grid'},
      validation: (R) => R.max(80),
    }),
    ...[1, 2, 3, 4, 5, 6].map((n) => defineField({name: `image${n}`, title: `صورة قديمة ${n}`, type: 'image', fieldset: 'legacy'})),
  ],
  orderings: [{title: 'الأحدث', name: 'y', by: [{field: 'editionYear', direction: 'desc'}]}],
  preview: {select: {title: 'title_ar', subtitle: 'editionYear', media: 'logo'}},
})

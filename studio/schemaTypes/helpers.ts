import {defineField} from 'sanity'

/** يمنع ترك إحدى اللغتين فارغة إذا كُتبت الأخرى: الموقع كله ثنائي اللغة */
export const pairRule = (Rule: any, name: string, lang: 'ar' | 'en', prefix = name) =>
  Rule.custom((value: unknown, ctx: any) => {
    const other = ctx?.parent?.[`${prefix}_${lang === 'ar' ? 'en' : 'ar'}`]
    const has = (v: unknown) => typeof v === 'string' && v.trim() !== ''
    if (!has(value) && has(other)) {
      return lang === 'ar' ? 'اكتب النسخة العربية أيضاً — يجب أن يكون المحتوى باللغتين معاً' : 'Please fill the English version too — content must be bilingual'
    }
    return true
  }).error()

/** حقل ثنائي اللغة: يُنتج <name>_ar و <name>_en */
export function bilingual(
  name: string,
  title: string,
  opts: {type?: 'string' | 'text'; required?: boolean; max?: number; rows?: number} = {},
) {
  const {type = 'string', required = false, max, rows = 4} = opts
  const limit = max ?? (type === 'string' ? 200 : 5000)
  const make = (lang: 'ar' | 'en', label: string) =>
    defineField({
      name: `${name}_${lang}`,
      title: `${title} (${label})`,
      type,
      ...(type === 'text' ? {rows} : {}),
      validation: (Rule) => [
        required ? Rule.required().max(limit) : Rule.max(limit).warning(`الحد الأقصى ${limit} حرفاً`),
        pairRule(Rule, name, lang),
      ],
    })
  return [make('ar', 'العربية'), make('en', 'English')]
}

/** رابط آمن: https فقط (أو mailto/tel عند الحاجة) */
export const safeUrl = (allow: string[] = ['https']) => (Rule: any) =>
  Rule.uri({scheme: allow, allowRelative: false})

export const imageField = (name: string, title: string, description?: string) =>
  defineField({
    name,
    title,
    type: 'image',
    description,
    options: {hotspot: true, accept: 'image/png,image/jpeg,image/webp'},
    fields: [
      defineField({name: 'alt_ar', title: 'النص البديل (العربية)', type: 'string', validation: (R) => [R.max(160), pairRule(R, 'alt', 'ar')]}),
      defineField({name: 'alt_en', title: 'Alt text (English)', type: 'string', validation: (R) => [R.max(160), pairRule(R, 'alt', 'en')]}),
    ],
  })

/** أيقونة Font Awesome مجانية: fa-leaf أو fa-solid fa-leaf أو fab fa-facebook ... */
export const iconField = (title = 'الأيقونة (Font Awesome)', initial?: string) =>
  defineField({
    name: 'icon',
    title,
    type: 'string',
    initialValue: initial,
    description:
      'اكتب اسم أيقونة مجانية من https://fontawesome.com/search?o=r&m=free — مثال: fa-leaf أو fa-solid fa-leaf. اتركه فارغاً للأيقونة الافتراضية.',
    validation: (Rule) =>
      Rule.custom((v?: string) =>
        !v ||
        /^(?:(?:fas|far|fab|fa-solid|fa-regular|fa-brands)\s+)?fa-[a-z0-9-]{2,40}$/.test(v.trim()) ||
        /^(shield|chip|coins|ship|recycle|rocket|leaf|chart|globe|book|calendar|mail|file|award)$/.test(v.trim()) ||
        'صيغة غير صحيحة. مثال: fa-leaf'),
  })

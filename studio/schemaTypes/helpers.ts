import {defineField} from 'sanity'

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
      validation: (Rule) => {
        let r = Rule.max(limit).warning(`الحد الأقصى ${limit} حرفاً`)
        return required && lang === 'ar' ? Rule.required().max(limit) : r
      },
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
      defineField({name: 'alt_ar', title: 'النص البديل (العربية)', type: 'string', validation: (R) => R.max(160)}),
      defineField({name: 'alt_en', title: 'Alt text (English)', type: 'string', validation: (R) => R.max(160)}),
    ],
  })

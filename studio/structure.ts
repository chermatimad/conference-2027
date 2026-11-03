import type {StructureResolver} from 'sanity/structure'

export const SINGLETONS = ['siteSettings', 'homePage', 'aboutPage', 'submissionPage']

const single = (S: any, id: string, title: string) =>
  S.listItem().title(title).id(id).child(S.document().schemaType(id).documentId(id).title(title))

export const structure: StructureResolver = (S) =>
  S.list()
    .title('لوحة تحكم المؤتمر')
    .items([
      single(S, 'siteSettings', '⚙️ إعدادات الموقع العامة'),
      S.divider(),
      S.documentTypeListItem('announcement').title('📢 الإعلانات (هامة ودورية)'),
      S.divider(),
      single(S, 'homePage', '🏠 الصفحة الرئيسية'),
      single(S, 'aboutPage', 'ℹ️ حول المؤتمر'),
      S.documentTypeListItem('track').title('🧭 المحاور'),
      S.documentTypeListItem('history').title('🏛️ النسخ السابقة + معرض الصور'),
      S.divider(),
      S.documentTypeListItem('committee').title('👥 أعضاء اللجان'),
      S.documentTypeListItem('speaker').title('🎤 المتحدثون'),
      S.documentTypeListItem('programDay').title('🗓️ البرنامج'),
      S.divider(),
      single(S, 'submissionPage', '📝 المشاركة والنشر'),
      S.documentTypeListItem('importantDate').title('⏰ التواريخ المهمة'),
      S.documentTypeListItem('sponsor').title('🤝 الرعاة'),
    ])

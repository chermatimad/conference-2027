// تحديث أسماء أعضاء اللجنة الأجانب (عربي/إنجليزي) فقط دون المساس بأي تعديل آخر
// التشغيل:  npm run patch-names
import {getCliClient} from 'sanity/cli'
import {committeeDocs} from './docx-content.mjs'

const client = getCliClient({apiVersion: '2024-01-01'})
let n = 0
for (const d of committeeDocs.filter((x) => x.name_en)) {
  await client.patch(d._id).set({name_ar: d.name_ar, name_en: d.name_en}).commit().then(() => n++).catch((e) => console.log('تخطي', d._id, e.message))
}
console.log(`OK: تم تحديث ${n} اسماً`)

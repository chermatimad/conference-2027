// تحديث الاسم الإنجليزي (والعربي للأجانب) لأعضاء اللجان — يبحث عن العضو بالاسم العربي أو المعرّف
// التشغيل:  npm run patch-names
import {getCliClient} from 'sanity/cli'
import {committeeDocs} from './docx-content.mjs'

const client = getCliClient({apiVersion: '2024-01-01'})
const existing = await client.fetch('*[_type == "committee" && !(_id in path("drafts.**"))]{_id, name_ar, name_en}')
let n = 0
const missing = []
for (const d of committeeDocs.filter((x) => x.name_en)) {
  const hit = existing.find((e) => e._id === d._id || e.name_ar === d.name_ar || e.name_ar === d.name_en)
  if (!hit) { missing.push(d.name_ar); continue }
  await client.patch(hit._id).set({name_ar: d.name_ar, name_en: d.name_en}).commit(); n++
}
console.log(`OK: تم تحديث ${n} اسماً`)
if (missing.length) console.log('غير موجودين في Studio (ربما حُذفوا أو عُدّلت أسماؤهم):\n- ' + missing.join('\n- '))

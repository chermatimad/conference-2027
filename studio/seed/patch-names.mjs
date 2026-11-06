// تحديث الاسم الإنجليزي لأعضاء اللجان، وإنشاء من لا وجود لهم في Studio
// التشغيل:  npm run patch-names
import {getCliClient} from 'sanity/cli'
import {committeeDocs} from './docx-content.mjs'

const client = getCliClient({apiVersion: '2024-01-01'})
const all = await client.fetch('*[_type == "committee"]{_id, name_ar, name_en}')
const pub = all.filter((e) => !e._id.startsWith('drafts.'))
const drafts = all.filter((e) => e._id.startsWith('drafts.'))
let updated = 0, created = 0
const notes = []
for (const d of committeeDocs) {
  const hit = pub.find((e) => e._id === d._id || e.name_ar === d.name_ar)
  if (hit) {
    if (d.name_en) { await client.patch(hit._id).set({name_ar: d.name_ar, name_en: d.name_en}).commit(); updated++ }
    continue
  }
  if (drafts.find((e) => e._id === 'drafts.' + d._id || e.name_ar === d.name_ar)) { notes.push(`مسودة غير منشورة (انشرها من Studio): ${d.name_ar}`); continue }
  await client.createIfNotExists(d); created++; notes.push(`أُنشئ من جديد: ${d.name_ar}`)
}
console.log(`OK: تحديث ${updated} — إنشاء ${created}`)
if (notes.length) console.log(notes.join('\n'))

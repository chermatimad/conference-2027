// مزامنة أعضاء اللجان مع إعلان المؤتمر: يحتفظ بصور من سبق إدراجهم، ويحذف كل ما سواهم
//   معاينة فقط:   npm run sync-committee
//   تنفيذ فعلي:   npm run sync-committee-apply
import {getCliClient} from 'sanity/cli'
import {committeeDocs} from './docx-content.mjs'

const apply = process.argv.includes('--apply')
const client = getCliClient({apiVersion: '2024-01-01'})

const TITLES = /(^|\s)(أ\.د\.|ا\.د\.|د\.|الأستاذ|الاستاذ|الدكتور|أستاذ|استاذ|Prof\.|Dr\.)(?=\s|$)/g
const norm = (s) => String(s || '').replace(TITLES, ' ').replace(/[إأآ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').replace(/[^\p{L}\s]/gu, ' ').trim().split(/\s+/).filter(Boolean)
const same = (a, b) => {
  const A = new Set(norm(a)), B = new Set(norm(b))
  if (A.size < 2 || B.size < 2) return false
  const sub = (x, y) => [...x].every((t) => y.has(t))
  return sub(A, B) || sub(B, A)
}

const all = await client.fetch('*[_type == "committee"]')
const base = (id) => id.replace(/^drafts\./, '')
const used = new Set()
const plan = []
for (const d of committeeDocs) {
  const cands = all.filter((e) => !used.has(e._id) && (base(e._id) === d._id || same(e.name_ar, d.name_ar)))
  // الأفضل: من له صورة، ثم المنشور
  cands.sort((x, y) => (!!y.image - !!x.image) || (x._id.startsWith('drafts.') - y._id.startsWith('drafts.')))
  const withImg = cands.find((c) => c.image)
  cands.forEach((c) => used.add(c._id))
  plan.push({d, keep: withImg ? withImg.image : undefined, from: cands.map((c) => c._id)})
}
const toDelete = all.filter((e) => !used.has(e._id) || e._id.startsWith('drafts.')).map((e) => e._id)
const dupDeletes = all.filter((e) => used.has(e._id)).map((e) => e._id) // سيُستبدل كله بالنسخة النظيفة

console.log(`المطلوب حسب الإعلان: ${plan.length} عضواً`)
console.log(`موجود حالياً في Studio: ${all.length} مستنداً`)
console.log(`سيحتفظ بصورة: ${plan.filter((p) => p.keep).length} عضواً`)
console.log(`سيُحذف (غير موجود في الإعلان أو مكرر أو مسودة): ${new Set([...toDelete]).size}`)
all.filter((e) => !used.has(e._id)).forEach((e) => console.log('  حذف:', e.name_ar))
if (!apply) { console.log('\nهذه معاينة فقط. للتنفيذ: npm run sync-committee-apply'); process.exit(0) }

const tx = client.transaction()
const ids = new Set([...toDelete, ...dupDeletes])
for (const id of ids) tx.delete(id)
for (const {d, keep} of plan) tx.createOrReplace({...d, ...(keep ? {image: keep} : {})})
await tx.commit()
console.log(`\nOK: تم. الأعضاء الآن ${plan.length} حسب الإعلان.`)

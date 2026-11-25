// تحديث محتوى Sanity الحي وفق ملفي Call for Papers المعتمدين.
// التشغيل (من مجلد studio):  npx sanity exec scripts/apply-call-for-papers.mjs --with-user-token
// لا يحذف اللجان ولا يمس الصور؛ يطابق الأعضاء بالاسم ويضيف الجدد، ويعرض ما لم يُطابَق.
import {getCliClient} from 'sanity/cli'
import {buildDocs, trackDocs, dateDocs, committeeList} from './content-2027.mjs'

const c = getCliClient({apiVersion: '2024-01-01'})
const norm = (s = '') => s.replace(/[ً-ٰٟ]/g, '').replace(/الأستاذ الدكتور|أ\.د\.|أ\. ?د|د\.|أ\.|الدكتور|الأستاذ|الدكتورة/g, '').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/\s+/g, ' ').trim()

async function upsert(doc) {
  const {_id, _type, patch, ...rest} = doc
  const fields = patch || rest
  await c.createIfNotExists({_id, _type})
  await c.patch(_id).set(fields).commit()
  console.log('✔', _type, _id)
}

for (const d of buildDocs()) await upsert(d)

// المحاور والتواريخ: استبدال كامل
for (const [type, docs] of [['track', trackDocs()], ['importantDate', dateDocs()]]) {
  const old = await c.fetch('*[_type==$t]{_id}', {t: type})
  const keep = new Set(docs.map((d) => d._id))
  for (const o of old) if (!keep.has(o._id.replace('drafts.', ''))) { await c.delete(o._id); console.log('🗑', type, o._id) }
  for (const d of docs) await upsert(d)
}

// اللجان
const existing = await c.fetch('*[_type=="committee"]{_id,name_ar,committeeType}')
const used = new Set()
for (const m of committeeList()) {
  const hit = existing.find((e) => !used.has(e._id) && norm(e.name_ar) === norm(m.name_ar))
  if (hit) { used.add(hit._id); await c.patch(hit._id).set(m).commit(); console.log('≈ updated', m.name_ar) }
  else { await c.create({_type: 'committee', ...m}); console.log('+ created', m.name_ar) }
}
const extras = existing.filter((e) => !used.has(e._id))
if (extras.length) { console.log('\n⚠ أعضاء في Sanity غير واردين في الملفات المعتمدة (لم يُحذفوا، احذفهم من Studio إن لزم):'); extras.forEach((e) => console.log('  -', e._id, e.committeeType, e.name_ar)) }
console.log('\nتم.')

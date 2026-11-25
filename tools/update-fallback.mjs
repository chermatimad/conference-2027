// يحدّث assets/data/fallback.json من studio/scripts/content-2027.mjs
import fs from 'node:fs'
import {buildDocs, trackDocs, dateDocs, committeeList} from '../studio/scripts/content-2027.mjs'
const p = new URL('../assets/data/fallback.json', import.meta.url)
const d = JSON.parse(fs.readFileSync(p, 'utf8'))
for (const x of buildDocs()) { const k = {aboutPage: 'about', submissionPage: 'submission', siteSettings: 'settings'}[x._type]; Object.assign(d[k], x.patch) }
const oldT = d.tracks || []
d.tracks = trackDocs().map((t, i) => ({...t, icon: oldT[i]?.icon || 'chart', color: oldT[i]?.color || 'primary'}))
d.dates = dateDocs().map((x, i) => ({...x, icon: ['calendar', 'mail', 'check', 'file', 'check', 'calendar', 'star'][i]}))
const cnt = {}
d.committee = committeeList().map((m) => { cnt[m.committeeType] = (cnt[m.committeeType] || 0) + 1; return {_type: 'committee', _id: `committee-${m.committeeType}-${String(cnt[m.committeeType]).padStart(2, '0')}`, ...m} })
fs.writeFileSync(p, JSON.stringify(d, null, 2) + '\n')
console.log('fallback updated:', d.tracks.length, 'tracks,', d.dates.length, 'dates,', d.committee.length, 'committee')

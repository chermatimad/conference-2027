// node seed/build-seed.mjs  →  seed/seed.ndjson  +  ../assets/data/fallback.json
import {writeFileSync, mkdirSync} from 'node:fs'
import {dirname, resolve} from 'node:path'
import {fileURLToPath, pathToFileURL} from 'node:url'
import {documents} from './content.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '../..')
const isMarker = (v) => v && typeof v === 'object' && '__img' in v

// 1) NDJSON لاستيراده في Sanity (الصور تُرفع تلقائياً)
const toSanity = (v) => {
  if (isMarker(v)) return undefined; if (false) {
    const src = /^https?:/.test(v.__img) ? v.__img : pathToFileURL(resolve(root, v.__img)).href
    return {_type: 'image', _sanityAsset: `image@${src}`}
  }
  if (Array.isArray(v)) return v.map(toSanity)
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, toSanity(x)]))
  return v
}
writeFileSync(resolve(here, 'seed.ndjson'), documents.map((d) => JSON.stringify(toSanity(d))).join('\n') + '\n')

// 2) JSON احتياطي بنفس شكل نتيجة استعلام GROQ في الواجهة
const toUrl = (v) => (isMarker(v) ? v.__img : Array.isArray(v) ? v.map(toUrl) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, toUrl(x)])) : v)
const by = (t) => documents.filter((d) => d._type === t).map(toUrl)
const one = (t) => by(t)[0] ?? null
const history = by('history').map(({logo, ...r}) => ({...r, logoUrl: logo, gallery: [], legacyImages: []}))
const fallback = {
  settings: one('siteSettings'), home: one('homePage'), about: one('aboutPage'), submission: one('submissionPage'),
  announcements: by('announcement'), tracks: by('track'), speakers: [], committee: [],
  program: by('programDay'), dates: by('importantDate'), editions: history, sponsors: [],
}
mkdirSync(resolve(root, 'assets/data'), {recursive: true})
writeFileSync(resolve(root, 'assets/data/fallback.json'), JSON.stringify(fallback, null, 1))
console.log(`OK: ${documents.length} documents → seed.ndjson + assets/data/fallback.json`)

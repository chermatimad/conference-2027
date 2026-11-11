// يفحص محتوى Sanity الحي ويعرض كل حقل مكتوب بلغة واحدة فقط (عربي بلا إنجليزي أو العكس).
// الاستعمال (من مجلد المشروع):  node tools/check-bilingual.mjs
import fs from 'node:fs';

const src = fs.readFileSync(new URL('../assets/js/app.js', import.meta.url), 'utf8');
const m = /const QUERY = `([\s\S]*?)`;/.exec(src);
const query = m[1].replace(/\$\{img\('(\w+)'\)\}/g, '"$1": $1.asset->url');
const [, projectId, dataset, apiVersion] = /CFG = \{projectId: '(\w+)', dataset: '(\w+)', apiVersion: '([\d-]+)'\}/.exec(src);
const url = `https://${projectId}.api.sanity.io/v${apiVersion}/data/query/${dataset}?perspective=published&query=${encodeURIComponent(query)}`;
const data = (await (await fetch(url)).json()).result;

let n = 0;
const has = (v) => typeof v === 'string' && v.trim() !== '';
function walk(o, where) {
  if (Array.isArray(o)) return o.forEach((v, i) => walk(v, `${where}[${i + 1}]`));
  if (!o || typeof o !== 'object') return;
  for (const k of Object.keys(o)) {
    if (k.endsWith('_ar')) {
      const base = k.slice(0, -3), ar = o[k], en = o[base + '_en'];
      if (has(ar) !== has(en) && (has(ar) || has(en))) {
        n++;
        const who = o.name_ar || o.title_ar || o.label_ar || o.name || o._id || '';
        console.log(`${has(ar) ? 'ينقص الإنجليزي' : 'ينقص العربي'}  |  ${where}${who ? ' (' + String(who).slice(0, 40) + ')' : ''}  |  ${base}`);
      }
    }
    walk(o[k], `${where}.${k}`);
  }
}
for (const [k, v] of Object.entries(data)) walk(v, k);
console.log(n ? `\nالمجموع: ${n} حقلاً ناقصاً. أكملها من Studio ثم انشر.` : 'ممتاز: كل الحقول مكتوبة باللغتين.');

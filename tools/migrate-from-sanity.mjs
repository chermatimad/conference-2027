// ينقل المحتوى الحي من Sanity إلى النسخة PHP: يحمّل الصور والملفات إلى uploads/ ويكتب data/content.php
// الاستعمال (من مجلد المشروع):  node tools/migrate-from-sanity.mjs [مجلد-الموقع-الهدف]
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const target = path.resolve(process.argv[2] || '.');
const src = fs.readFileSync(new URL('../assets/js/app.js', import.meta.url), 'utf8');
const m = /const QUERY = `([\s\S]*?)`;/.exec(src);
if (!m) throw new Error('QUERY not found in app.js');
const query = m[1].replace(/\$\{img\('(\w+)'\)\}/g, '"$1": $1.asset->url');
const cfg = /CFG = \{projectId: '(\w+)', dataset: '(\w+)', apiVersion: '([\d-]+)'\}/.exec(src);
const [, projectId, dataset, apiVersion] = cfg;
const url = `https://${projectId}.apicdn.sanity.io/v${apiVersion}/data/query/${dataset}?perspective=published&query=${encodeURIComponent(query)}`;

async function get(u, tries = 4) {
  let last;
  for (let i = 1; i <= tries; i++) {
    try { const r = await fetch(u, {signal: AbortSignal.timeout(60000)}); if (r.ok) return r; last = new Error('HTTP ' + r.status); }
    catch (e) { last = e; }
    await new Promise((ok) => setTimeout(ok, 1500 * i));
  }
  throw last;
}
const res = await get(url);
if (!res.ok) throw new Error('Sanity HTTP ' + res.status);
const data = (await res.json()).result;
if (!data || !data.settings) throw new Error('Empty result');

const up = path.join(target, 'uploads');
fs.mkdirSync(up, {recursive: true});
fs.mkdirSync(path.join(target, 'data'), {recursive: true});
const cache = new Map();
const ALLOWED = new Set(['.png', '.jpg', '.jpeg', '.webp', '.pdf', '.docx']);
let n = 0, failed = 0;

async function localize(u) {
  if (cache.has(u)) return cache.get(u);
  const x = new URL(u);
  let ext = path.extname(x.pathname).toLowerCase();
  if (!ALLOWED.has(ext)) { console.warn('تجاهل (امتداد غير مسموح):', u); cache.set(u, ''); return ''; }
  if (ext === '.jpeg') ext = '.jpg';
  const name = crypto.createHash('sha1').update(u).digest('hex').slice(0, 16) + ext;
  let r;
  try { r = await get(u); } catch (e) { console.warn('فشل التحميل (يبقى الرابط الأصلي):', u); failed++; cache.set(u, u); return u; }
  fs.writeFileSync(path.join(up, name), Buffer.from(await r.arrayBuffer()));
  process.stdout.write('.');
  n++;
  const rel = 'uploads/' + name;
  cache.set(u, rel);
  return rel;
}
async function walk(v) {
  if (Array.isArray(v)) { const out = []; for (const x of v) { const y = await walk(x); if (y !== null && y !== '') out.push(y); } return out; }
  if (v && typeof v === 'object') { for (const k of Object.keys(v)) v[k] = await walk(v[k]); return v; }
  if (typeof v === 'string' && /^https:\/\/cdn\.sanity\.io\//.test(v)) return await localize(v);
  return v;
}
await walk(data);
const guard = '<?php http_response_code(404); exit; ?>\n';
fs.writeFileSync(path.join(target, 'data', 'content.php'), guard + JSON.stringify(data, null, 1));
console.log(`\nتم: نُقل المحتوى و${n} ملفاً إلى ${target}` + (failed ? ` — تعذّر ${failed} ملف (أعد تشغيل الأمر لإكمالها)` : ''));

// خادم ثابت بسيط للمعاينة المحلية:  npm run serve  → http://localhost:8080
import http from 'node:http'
import {readFile} from 'node:fs/promises'
import {extname, resolve, normalize, dirname} from 'node:path'
import {fileURLToPath} from 'node:url'
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const types = {'.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.woff2': 'font/woff2', '.svg': 'image/svg+xml'}
http.createServer(async (req, res) => {
  try {
    let p = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^(\.\.[/\\])+/, '')
    if (p.endsWith('/')) p += 'index.html'
    const file = resolve(root, '.' + p)
    if (!file.startsWith(root) || file.includes('node_modules') || file.includes('/studio/')) throw new Error('403')
    res.writeHead(200, {'Content-Type': types[extname(file)] || 'application/octet-stream'})
    res.end(await readFile(file))
  } catch { res.writeHead(404); res.end('Not found') }
}).listen(process.env.PORT || 8080, () => console.log('http://localhost:' + (process.env.PORT || 8080)))

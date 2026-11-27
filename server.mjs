import { createReadStream, existsSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const distDir = resolve(fileURLToPath(new URL('./dist', import.meta.url)))
const port = Number(process.env.PORT || 8080)
const host = process.env.HOST || '0.0.0.0'

const MIME = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
}

function trimSlash(value) {
  return String(value || '').trim().replace(/\/+$/, '')
}

function appConfigScript() {
  const apiBaseUrl = trimSlash(process.env.API_BASE_URL || process.env.VITE_API_BASE_URL || '')
  const companyId = trimSlash(process.env.COMPANY_ID || process.env.VITE_COMPANY_ID || 'yada') || 'yada'
  return `window.__APP_CONFIG__=${JSON.stringify({ apiBaseUrl, companyId })};`
}

function fileInsideDist(urlPath) {
  const decoded = decodeURIComponent((urlPath.split('?')[0] || '/')).replace(/^\/+/, '')
  const candidate = resolve(distDir, decoded)
  const rel = relative(distDir, candidate)
  if (rel.startsWith('..') || rel.includes(`..${sep}`) || rel.startsWith(sep)) return null
  return candidate
}

function send(res, status, headers, body) {
  res.writeHead(status, headers)
  res.end(body)
}

function sendFile(res, file) {
  const ext = extname(file).toLowerCase()
  const hashedAsset = relative(distDir, file).split(sep)[0] === 'assets'
  const type = MIME[ext] || 'application/octet-stream'
  const cache = hashedAsset ? 'public, max-age=31536000, immutable' : 'no-cache'
  res.writeHead(200, { 'Content-Type': type, 'Cache-Control': cache })
  createReadStream(file).pipe(res)
}

function existsFile(file) {
  try {
    return existsSync(file) && statSync(file).isFile()
  } catch {
    return false
  }
}

const server = createServer((req, res) => {
  const urlPath = req.url || '/'

  if (urlPath.split('?')[0] === '/config.js') {
    send(res, 200, { 'Content-Type': 'text/javascript; charset=utf-8', 'Cache-Control': 'no-store' }, appConfigScript())
    return
  }

  const file = fileInsideDist(urlPath)
  if (file && existsFile(file)) {
    sendFile(res, file)
    return
  }

  const index = join(distDir, 'index.html')
  if (existsFile(index) && !extname(urlPath.split('?')[0] || '')) {
    sendFile(res, index)
    return
  }

  send(res, 404, { 'Content-Type': 'text/plain; charset=utf-8' }, 'Not found')
})

server.listen(port, host, () => {
  if (!existsFile(join(distDir, 'index.html'))) {
    console.error(`Missing ${join(distDir, 'index.html')}. Run npm run build before npm start.`)
  }
  console.log(`Floristería Yada SPA listening on http://${host}:${port}`)
})

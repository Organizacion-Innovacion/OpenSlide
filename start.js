#!/usr/bin/env node
/**
 * OpenSlide — Production Start
 * Builds el cliente si es necesario y arranca Express sirviendo todo en un solo puerto.
 */
import { execSync, spawn } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { networkInterfaces } from 'os'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CONFIG_PATH = path.join(__dirname, 'config', 'settings.json')
const DIST_PATH   = path.join(__dirname, 'client', 'dist')

const c = {
  reset: '\x1b[0m', bold: '\x1b[1m', green: '\x1b[32m',
  cyan: '\x1b[36m', yellow: '\x1b[33m', gray: '\x1b[90m', white: '\x1b[97m',
}

function getLocalIP() {
  const nets = networkInterfaces()
  for (const name of Object.keys(nets))
    for (const net of nets[name])
      if (net.family === 'IPv4' && !net.internal) return net.address
  return '127.0.0.1'
}

function loadConfig() {
  if (!fs.existsSync(CONFIG_PATH)) return { port: 3001, host: 'localhost' }
  try { return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8')) } catch { return { port: 3001 } }
}

console.log(`\n${c.bold}${c.white}  ▶  OpenSlide${c.reset}\n`)

const config = loadConfig()
const port = process.env.PORT || config.port || 3001
const host = process.env.HOST || config.host || 'localhost'

// ── Build del cliente si no existe o si se pide ────────────────────────────
const forceBuild = process.argv.includes('--build')
if (!fs.existsSync(DIST_PATH) || forceBuild) {
  console.log(`${c.yellow}  Building cliente...${c.reset}`)
  try {
    execSync('npm run build', {
      cwd: path.join(__dirname, 'client'),
      stdio: 'inherit'
    })
    console.log(`${c.green}  ✓ Build completado${c.reset}\n`)
  } catch {
    console.error(`  ✗ Error en el build. Ejecuta: cd client && npm run build`)
    process.exit(1)
  }
} else {
  console.log(`${c.gray}  Cliente ya compilado (usa --build para recompilar)${c.reset}\n`)
}

// ── Arrancar el servidor ────────────────────────────────────────────────────
const serverEnv = {
  ...process.env,
  PORT: String(port),
  HOST: host,
  NODE_ENV: 'production',
  SERVE_CLIENT: 'true',  // le indica al servidor que sirva el cliente
}

const server = spawn('node', ['index.js'], {
  cwd: path.join(__dirname, 'server'),
  env: serverEnv,
  stdio: 'inherit',
})

// ── Mostrar URLs ────────────────────────────────────────────────────────────
setTimeout(() => {
  const localIP = getLocalIP()
  console.log(`\n  ${c.bold}OpenSlide corriendo en:${c.reset}`)
  console.log(`  ${c.cyan}http://localhost:${port}${c.reset}      ${c.gray}← este equipo${c.reset}`)
  if (host === '0.0.0.0') {
    console.log(`  ${c.cyan}http://${localIP}:${port}${c.reset}  ${c.gray}← red local${c.reset}`)
  }
  console.log()
}, 1000)

server.on('exit', code => process.exit(code ?? 0))
process.on('SIGINT', () => { server.kill('SIGINT'); process.exit(0) })
process.on('SIGTERM', () => { server.kill('SIGTERM'); process.exit(0) })

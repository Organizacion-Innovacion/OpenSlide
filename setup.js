#!/usr/bin/env node
/**
 * OpenSlide — Setup Wizard
 * Configura API keys, puerto y opciones de red de forma interactiva.
 */
import readline from 'readline'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { networkInterfaces } from 'os'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CONFIG_PATH = path.join(__dirname, 'config', 'settings.json')

// ─── Colores ANSI ─────────────────────────────────────────────────────────────
const c = {
  reset:  '\x1b[0m',
  bold:   '\x1b[1m',
  dim:    '\x1b[2m',
  green:  '\x1b[32m',
  cyan:   '\x1b[36m',
  yellow: '\x1b[33m',
  red:    '\x1b[31m',
  white:  '\x1b[97m',
  gray:   '\x1b[90m',
}

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

function ask(question, defaultVal = '') {
  return new Promise(resolve => {
    const hint = defaultVal ? ` ${c.gray}[${defaultVal}]${c.reset}` : ''
    rl.question(`${question}${hint}: `, answer => {
      resolve(answer.trim() || defaultVal)
    })
  })
}

function askSecret(question) {
  return new Promise(resolve => {
    process.stdout.write(`${question}: `)
    process.stdin.setRawMode?.(true)
    let input = ''
    const handler = (char) => {
      char = char.toString()
      if (char === '\n' || char === '\r' || char === '\u0004') {
        process.stdin.setRawMode?.(false)
        process.stdin.removeListener('data', handler)
        process.stdout.write('\n')
        resolve(input)
      } else if (char === '\u0003') {
        process.exit()
      } else if (char === '\u007f') {
        if (input.length > 0) { input = input.slice(0, -1); process.stdout.write('\b \b') }
      } else {
        input += char
        process.stdout.write('*')
      }
    }
    process.stdin.on('data', handler)
  })
}

function getLocalIP() {
  const nets = networkInterfaces()
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) return net.address
    }
  }
  return '127.0.0.1'
}

function loadConfig() {
  if (!fs.existsSync(CONFIG_PATH)) return { keys: {}, port: 3001, host: 'localhost' }
  try { return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8')) } catch { return { keys: {} } }
}

function saveConfig(config) {
  fs.mkdirSync(path.dirname(CONFIG_PATH), { recursive: true })
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2))
}

function obfuscate(key) {
  if (!key) return `${c.gray}No configurada${c.reset}`
  return `${c.green}✓ Configurada${c.reset} ${c.gray}(****${key.slice(-4)})${c.reset}`
}

function header() {
  console.clear()
  console.log(`
${c.bold}${c.white}  ▶  OpenSlide${c.reset} ${c.gray}— Setup Wizard${c.reset}
${c.gray}  ─────────────────────────────────────────${c.reset}
`)
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  header()

  const config = loadConfig()
  config.keys = config.keys || {}

  console.log(`${c.cyan}Este asistente te ayuda a configurar OpenSlide.${c.reset}`)
  console.log(`${c.gray}Presiona Enter para mantener el valor actual.\n${c.reset}`)

  // ── API Keys ────────────────────────────────────────────────────────────────
  console.log(`${c.bold}  1. API Keys${c.reset}`)
  console.log(`${c.gray}  Necesitas al menos una para generar presentaciones.\n${c.reset}`)

  const providers = [
    { id: 'openai',    label: 'OpenAI (GPT-4o)',      hint: 'sk-proj-...',  url: 'https://platform.openai.com/api-keys' },
    { id: 'anthropic', label: 'Anthropic (Claude)',   hint: 'sk-ant-...',   url: 'https://console.anthropic.com/' },
    { id: 'gemini',    label: 'Google (Gemini)',      hint: 'AIzaSy...',    url: 'https://aistudio.google.com/apikey' },
  ]

  for (const p of providers) {
    const current = config.keys[p.id]
    console.log(`  ${c.bold}${p.label}${c.reset}`)
    console.log(`  Estado actual: ${obfuscate(current)}`)
    console.log(`  ${c.gray}Obtener key: ${p.url}${c.reset}`)
    const action = await ask(`  ¿Configurar / actualizar? (s/N)`, 'n')
    if (action.toLowerCase() === 's') {
      const key = await ask(`  API Key ${c.gray}(${p.hint})${c.reset}`)
      if (key) {
        config.keys[p.id] = key
        console.log(`  ${c.green}✓ Guardada${c.reset}\n`)
      }
    } else {
      console.log()
    }
  }

  // ── Puerto ──────────────────────────────────────────────────────────────────
  console.log(`${c.bold}  2. Puerto del servidor${c.reset}`)
  const currentPort = config.port || 3001
  const port = await ask(`  Puerto`, String(currentPort))
  config.port = parseInt(port) || 3001

  // ── Modo de red ─────────────────────────────────────────────────────────────
  console.log(`\n${c.bold}  3. Acceso desde la red${c.reset}`)
  const localIP = getLocalIP()
  console.log(`  ${c.gray}Tu IP local: ${localIP}${c.reset}`)
  console.log(`  ${c.gray}• Local: solo accesible desde este equipo (localhost)${c.reset}`)
  console.log(`  ${c.gray}• Red: otros dispositivos en tu red pueden conectarse${c.reset}`)

  const networkMode = await ask(`  ¿Modo? (local/red)`, config.networkMode || 'local')
  config.networkMode = networkMode.toLowerCase() === 'red' ? 'network' : 'local'
  config.host = config.networkMode === 'network' ? '0.0.0.0' : 'localhost'

  // ── Guardar ─────────────────────────────────────────────────────────────────
  saveConfig(config)

  // ── Resumen ─────────────────────────────────────────────────────────────────
  header()
  console.log(`${c.green}${c.bold}  ✓ Configuración guardada${c.reset}\n`)

  const configuredKeys = providers.filter(p => config.keys[p.id])
  if (configuredKeys.length > 0) {
    console.log(`  ${c.bold}API Keys:${c.reset}`)
    for (const p of providers) {
      const status = config.keys[p.id] ? `${c.green}✓${c.reset}` : `${c.gray}—${c.reset}`
      console.log(`    ${status} ${p.label}`)
    }
  } else {
    console.log(`  ${c.yellow}⚠  No hay API keys configuradas.${c.reset}`)
    console.log(`  ${c.gray}   Puedes agregarlas luego desde la pantalla de Ajustes.${c.reset}`)
  }

  const baseURL = config.networkMode === 'network'
    ? `http://${localIP}:${config.port}`
    : `http://localhost:${config.port}`

  console.log(`\n  ${c.bold}Servidor:${c.reset}  puerto ${config.port} · modo ${config.networkMode === 'network' ? 'red' : 'local'}`)
  console.log(`  ${c.bold}URL:${c.reset}       ${c.cyan}${baseURL}${c.reset}`)

  if (config.networkMode === 'network') {
    console.log(`\n  ${c.green}Otros dispositivos en tu red podrán acceder en:${c.reset}`)
    console.log(`  ${c.bold}${c.cyan}http://${localIP}:${config.port}${c.reset}`)
  }

  console.log(`\n  Para iniciar OpenSlide:\n`)
  console.log(`  ${c.bold}  npm run dev${c.reset}    ${c.gray}# desarrollo (hot-reload)${c.reset}`)
  console.log(`  ${c.bold}  npm start${c.reset}      ${c.gray}# producción (un solo puerto)${c.reset}`)
  console.log()

  rl.close()
}

main().catch(err => {
  console.error(`\n${c.red}Error:${c.reset}`, err.message)
  rl.close()
  process.exit(1)
})

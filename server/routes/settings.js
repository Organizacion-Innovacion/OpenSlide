import { Router } from 'express'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CONFIG_PATH = path.resolve(__dirname, '../../config/settings.json')
const router = Router()

function readSettings() {
  if (!fs.existsSync(CONFIG_PATH)) return { keys: {} }
  return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'))
}

function obfuscate(key) {
  if (!key) return null
  return '****' + key.slice(-4)
}

router.get('/', (_req, res) => {
  const s = readSettings()
  res.json({
    keys: {
      openai: obfuscate(s.keys?.openai),
      anthropic: obfuscate(s.keys?.anthropic),
      gemini: obfuscate(s.keys?.gemini),
    }
  })
})

router.post('/', (req, res) => {
  const current = readSettings()
  const keys = { ...current.keys, ...req.body.keys }
  const updated = { ...current, keys }
  fs.mkdirSync(path.dirname(CONFIG_PATH), { recursive: true })
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(updated, null, 2))
  res.json({ ok: true })
})

export default router

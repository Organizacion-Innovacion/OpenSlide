import express from 'express'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { networkInterfaces } from 'os'
import projectsRouter from './routes/projects.js'
import aiRouter from './routes/ai.js'
import settingsRouter from './routes/settings.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
app.set('trust proxy', 1)

// ── Configuración desde entorno o config/settings.json ────────────────────────
const CONFIG_PATH = path.resolve(__dirname, '../config/settings.json')
function loadConfig() {
  if (!fs.existsSync(CONFIG_PATH)) return {}
  try { return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8')) } catch { return {} }
}
const config = loadConfig()

const PORT       = parseInt(process.env.PORT)  || config.port  || 3001
const HOST       = process.env.HOST             || config.host  || 'localhost'
const SLIDES_DIR = path.resolve(__dirname, '../slides')
const CLIENT_DIST = path.resolve(__dirname, '../client/dist')
const SERVE_CLIENT = process.env.SERVE_CLIENT === 'true' && fs.existsSync(CLIENT_DIST)

// ── CORS ──────────────────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost,http://localhost:3001')
  .split(',').map(o => o.trim())

app.use(cors({
  origin: (origin, cb) => {
    // En modo red permitir cualquier origen local
    if (!origin || ALLOWED_ORIGINS.some(o => origin.startsWith(o))) return cb(null, true)
    if (HOST === '0.0.0.0') return cb(null, true)  // red local: permitir todo
    cb(new Error(`CORS bloqueado para origen: ${origin}`))
  }
}))

// ── Rate limiting ─────────────────────────────────────────────────────────────
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { error: 'Demasiadas solicitudes. Espera un momento.' },
  standardHeaders: true,
  legacyHeaders: false,
})

// ── Middlewares ───────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// ── Rutas estáticas ───────────────────────────────────────────────────────────
app.use('/slides', express.static(SLIDES_DIR))

// En modo producción, servir el cliente React compilado
if (SERVE_CLIENT) {
  app.use(express.static(CLIENT_DIST))
}

// ── API ───────────────────────────────────────────────────────────────────────
app.use('/api/projects', projectsRouter)
app.use('/api/ai', aiLimiter, aiRouter)
app.use('/api/settings', settingsRouter)

// En modo producción, SPA fallback (React Router)
if (SERVE_CLIENT) {
  app.get('*', (_req, res) => {
    res.sendFile(path.join(CLIENT_DIST, 'index.html'))
  })
}

// ── Error handler ─────────────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(500).json({ error: err.message })
})

// ── Inicio ────────────────────────────────────────────────────────────────────
function getLocalIP() {
  const nets = networkInterfaces()
  for (const name of Object.keys(nets))
    for (const net of nets[name])
      if (net.family === 'IPv4' && !net.internal) return net.address
  return null
}

app.listen(PORT, HOST, () => {
  const localIP = getLocalIP()
  console.log(`\n  ▶  OpenSlide API corriendo`)
  console.log(`     http://localhost:${PORT}`)
  if (HOST === '0.0.0.0' && localIP) {
    console.log(`     http://${localIP}:${PORT}  ← red local`)
  }
  if (SERVE_CLIENT) {
    console.log(`     Sirviendo cliente desde: client/dist`)
  }
  console.log()
})

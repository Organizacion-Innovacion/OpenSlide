import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import projectsRouter from './routes/projects.js'
import aiRouter from './routes/ai.js'
import settingsRouter from './routes/settings.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3001
const SLIDES_DIR = path.resolve(__dirname, '../slides')

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())
app.use('/slides', express.static(SLIDES_DIR))
app.use('/api/projects', projectsRouter)
app.use('/api/ai', aiRouter)
app.use('/api/settings', settingsRouter)

app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(500).json({ error: err.message })
})

app.listen(PORT, () => console.log(`OpenSlide server running on http://localhost:${PORT}`))

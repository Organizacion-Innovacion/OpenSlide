import { Router } from 'express'
const router = Router()

router.post('/chat', (_req, res) => {
  res.json({ message: 'IA será integrada en Fase 3', role: 'assistant' })
})

router.post('/generate-slide', (_req, res) => {
  res.json({ html: null, message: 'Generación de slides será integrada en Fase 3' })
})

export default router

import { Router } from 'express'
import { getProjects, getProject, createProject, deleteProject } from '../services/projectManager.js'

const router = Router()

router.get('/', (_req, res) => res.json(getProjects()))

router.get('/:slug', (req, res) => {
  const p = getProject(req.params.slug)
  if (!p) return res.status(404).json({ error: 'Not found' })
  res.json(p)
})

router.post('/', (req, res) => {
  try {
    res.json(createProject(req.body))
  } catch (e) {
    res.status(400).json({ error: e.message })
  }
})

router.delete('/:slug', (req, res) => {
  try {
    deleteProject(req.params.slug)
    res.json({ ok: true })
  } catch (e) {
    res.status(404).json({ error: e.message })
  }
})

export default router

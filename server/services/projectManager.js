import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SLIDES_DIR = path.resolve(__dirname, '../../slides')

function sanitizeSlug(slug) {
  if (!slug || typeof slug !== 'string') throw new Error('Slug inválido')
  const clean = slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '').slice(0, 80)
  if (!clean) throw new Error('Slug inválido: debe contener letras, números o guiones')
  // Verificar que la ruta resultante esté dentro de SLIDES_DIR
  const resolved = path.resolve(SLIDES_DIR, clean)
  if (!resolved.startsWith(SLIDES_DIR)) throw new Error('Slug inválido: ruta no permitida')
  return clean
}

export function getProjects() {
  if (!fs.existsSync(SLIDES_DIR)) return []
  return fs.readdirSync(SLIDES_DIR, { withFileTypes: true })
    .filter(e => e.isDirectory())
    .map(dir => {
      const metaPath = path.join(SLIDES_DIR, dir.name, 'meta.json')
      if (!fs.existsSync(metaPath)) return null
      return JSON.parse(fs.readFileSync(metaPath, 'utf-8'))
    })
    .filter(Boolean)
}

export function getProject(slug) {
  slug = sanitizeSlug(slug)
  const metaPath = path.join(SLIDES_DIR, slug, 'meta.json')
  if (!fs.existsSync(metaPath)) return null
  return JSON.parse(fs.readFileSync(metaPath, 'utf-8'))
}

export function createProject({ slug, name, model }) {
  slug = sanitizeSlug(slug)
  const dir = path.join(SLIDES_DIR, slug)
  if (fs.existsSync(dir)) throw new Error('Project already exists')
  fs.mkdirSync(dir, { recursive: true })
  const meta = {
    name, slug,
    createdAt: new Date().toISOString(),
    model: model || null,
    slideCount: 0,
    slides: [],
    chatHistory: []
  }
  fs.writeFileSync(path.join(dir, 'meta.json'), JSON.stringify(meta, null, 2))
  return meta
}

export function deleteProject(slug) {
  slug = sanitizeSlug(slug)
  const dir = path.join(SLIDES_DIR, slug)
  if (!fs.existsSync(dir)) throw new Error('Project not found')
  fs.rmSync(dir, { recursive: true })
}

export function addSlide(slug, index, htmlContent) {
  slug = sanitizeSlug(slug)
  const dir = path.join(SLIDES_DIR, slug)
  const filename = `slide-${index}.html`
  fs.writeFileSync(path.join(dir, filename), htmlContent)
  const meta = getProject(slug)
  if (!meta.slides.includes(filename)) meta.slides.push(filename)
  meta.slideCount = meta.slides.length
  fs.writeFileSync(path.join(dir, 'meta.json'), JSON.stringify(meta, null, 2))
  return filename
}

export function updateMeta(slug, updates) {
  slug = sanitizeSlug(slug)
  const dir = path.join(SLIDES_DIR, slug)
  const meta = getProject(slug)
  const updated = { ...meta, ...updates }
  fs.writeFileSync(path.join(dir, 'meta.json'), JSON.stringify(updated, null, 2))
  return updated
}

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function slideProjectsPlugin() {
  const getProjects = () => {
    const slidesDir = path.resolve(__dirname, 'public/slides')
    if (!fs.existsSync(slidesDir)) return []

    return fs.readdirSync(slidesDir, { withFileTypes: true })
      .filter(e => e.isDirectory())
      .map(dir => {
        const slides = fs.readdirSync(path.join(slidesDir, dir.name))
          .filter(f => f.endsWith('.html'))
          .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))
        return { name: dir.name, slug: dir.name, count: slides.length, slides }
      })
      .filter(p => p.count > 0)
  }

  return {
    name: 'slide-projects',
    buildStart() {
      const projects = getProjects()
      const manifestPath = path.resolve(__dirname, 'public/slides/manifest.json')
      fs.writeFileSync(manifestPath, JSON.stringify(projects, null, 2))
      console.log(`[slide-projects] ${projects.length} proyecto(s) encontrado(s)`)
    },
    configureServer(server) {
      server.middlewares.use('/slides/manifest.json', (_req, res) => {
        const projects = getProjects()
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify(projects))
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), slideProjectsPlugin()],
})

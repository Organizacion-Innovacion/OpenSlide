import puppeteerCore from 'puppeteer-core'
import pptxgen from 'pptxgenjs'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import { execFileSync } from 'child_process'
import { getProject } from './projectManager.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * Detecta Chrome/Chromium en el sistema, resolviendo symlinks.
 * Retorna el path real del ejecutable o null si no lo encuentra.
 */
function getSystemChromePath() {
  if (process.env.CHROME_PATH && fs.existsSync(process.env.CHROME_PATH)) {
    return process.env.CHROME_PATH
  }

  // Resolver symlinks (ej. /usr/bin/google-chrome → /opt/google/chrome/google-chrome)
  const symlinks = ['/usr/bin/google-chrome', '/usr/bin/chromium-browser', '/usr/bin/chromium']
  for (const link of symlinks) {
    try {
      const real = execFileSync('readlink', ['-f', link], { encoding: 'utf-8' }).trim()
      if (real && fs.existsSync(real)) return real
    } catch {}
  }

  // Paths directos conocidos
  const candidates = [
    '/opt/google/chrome/google-chrome',
    '/opt/google/chrome-stable/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
    '/snap/bin/chromium',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ]
  for (const c of candidates) {
    if (fs.existsSync(c)) return c
  }

  return null
}

/**
 * Lanza puppeteer con la mejor opción disponible:
 * 1. Chrome/Chromium del sistema (más rápido, sin descarga)
 * 2. Chromium bundled de puppeteer (siempre disponible)
 */
async function launchBrowser() {
  const systemChrome = getSystemChromePath()

  if (systemChrome) {
    console.log(`[Exporter] Usando Chrome del sistema: ${systemChrome}`)
    return puppeteerCore.launch({
      executablePath: systemChrome,
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    })
  }

  // Fallback: Chromium bundled con puppeteer
  console.log('[Exporter] Chrome no encontrado en el sistema. Usando Chromium bundled de puppeteer...')
  try {
    const { default: puppeteer } = await import('puppeteer')
    return puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    })
  } catch (err) {
    throw new Error(
      'No se encontró Chrome ni Chromium. Opciones:\n' +
      '1. Instalar Chrome: https://www.google.com/chrome\n' +
      '2. Ejecutar: cd server && npm install puppeteer\n' +
      `Error original: ${err.message}`
    )
  }
}

/**
 * Toma screenshot de un slide HTML usando puppeteer-core
 */
async function screenshotSlide(browser, slideUrl) {
  const page = await browser.newPage()
  await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 })
  await page.goto(slideUrl, { waitUntil: 'networkidle0', timeout: 30000 })
  const screenshot = await page.screenshot({ type: 'png', encoding: 'base64' })
  await page.close()
  return screenshot
}

/**
 * Exporta el proyecto como PDF
 */
export async function exportToPDF(slug, baseUrl = 'http://localhost:3001') {
  const project = getProject(slug)
  if (!project) throw new Error('Proyecto no encontrado')

  const browser = await launchBrowser()

  try {
    const pdfBuffers = []

    for (const slide of project.slides) {
      const page = await browser.newPage()
      await page.setViewport({ width: 1280, height: 720 })
      await page.goto(`${baseUrl}/slides/${slug}/${slide}`, { waitUntil: 'networkidle0', timeout: 30000 })

      const pdf = await page.pdf({
        width: '1280px',
        height: '720px',
        printBackground: true,
        margin: { top: 0, right: 0, bottom: 0, left: 0 }
      })

      pdfBuffers.push(pdf)
      await page.close()
    }

    // Si solo hay un slide, retornar directamente
    if (pdfBuffers.length === 1) return pdfBuffers[0]

    // Combinar PDFs usando pdf-lib
    const { PDFDocument } = await import('pdf-lib')
    const mergedPdf = await PDFDocument.create()

    for (const pdfBytes of pdfBuffers) {
      const doc = await PDFDocument.load(pdfBytes)
      const pages = await mergedPdf.copyPages(doc, doc.getPageIndices())
      pages.forEach(p => mergedPdf.addPage(p))
    }

    return Buffer.from(await mergedPdf.save())
  } finally {
    await browser.close()
  }
}

/**
 * Exporta el proyecto como PPTX
 */
export async function exportToPPTX(slug, baseUrl = 'http://localhost:3001') {
  const project = getProject(slug)
  if (!project) throw new Error('Proyecto no encontrado')

  const browser = await launchBrowser()

  try {
    const prs = new pptxgen()
    prs.layout = 'LAYOUT_WIDE' // 16:9

    for (const slide of project.slides) {
      const screenshot = await screenshotSlide(browser, `${baseUrl}/slides/${slug}/${slide}`)
      const pptxSlide = prs.addSlide()
      pptxSlide.addImage({
        data: `image/png;base64,${screenshot}`,
        x: 0, y: 0, w: '100%', h: '100%'
      })
    }

    // Generar como buffer
    const pptxData = await prs.write({ outputType: 'arraybuffer' })
    return Buffer.from(pptxData)
  } finally {
    await browser.close()
  }
}

import { createProvider } from './ai/provider.js'
import { addSlide, updateMeta, getProject } from './projectManager.js'

/**
 * Genera todos los slides de un proyecto usando el LLM
 * @param {object} params
 * @param {string} params.slug - slug del proyecto
 * @param {string} params.model - 'openai' | 'claude' | 'gemini'
 * @param {string} params.apiKey - API key del proveedor
 * @param {string} params.projectName - nombre del proyecto
 * @param {string} params.brief - descripción del proyecto
 * @param {number} params.slideCount - cantidad de slides
 * @param {string} params.theme - tema visual
 * @param {string} params.extraInstructions - instrucciones adicionales del usuario
 * @returns {Promise<{slides: string[], errors: string[]}>}
 */
export async function generatePresentation(params) {
  const { slug, model, apiKey, projectName, brief, slideCount, theme, extraInstructions } = params
  const provider = createProvider(model, apiKey)

  // Primero pedimos al LLM que planifique el contenido de cada slide
  const plan = await planPresentation({ provider, projectName, brief, slideCount, extraInstructions })

  const slides = []
  const errors = []

  for (let i = 0; i < plan.length; i++) {
    try {
      const html = await provider.generateSlide({
        slideNumber: i + 1,
        totalSlides: plan.length,
        content: plan[i],
        theme,
        projectName
      })

      const filename = addSlide(slug, i + 1, html)
      slides.push(filename)
      console.log(`[SlideGenerator] Slide ${i + 1}/${plan.length} generado: ${filename}`)
    } catch (err) {
      console.error(`[SlideGenerator] Error en slide ${i + 1}:`, err.message)
      errors.push(`Slide ${i + 1}: ${err.message}`)
    }
  }

  // Actualizar meta con modelo usado
  updateMeta(slug, { model, theme, generatedAt: new Date().toISOString() })

  return { slides, errors }
}

/**
 * Genera presentación con Server-Sent Events para progreso en tiempo real
 * @param {object} params - mismos que generatePresentation
 * @param {object} res - Express response object
 */
export async function generatePresentationStream(params, res) {
  const { slug, model, apiKey, projectName, brief, slideCount, theme, extraInstructions } = params

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders()

  const send = (event, data) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
  }

  try {
    const provider = createProvider(model, apiKey)

    send('status', { message: 'Planificando estructura de la presentación...', phase: 'planning' })

    const plan = await planPresentation({ provider, projectName, brief, slideCount, extraInstructions })

    send('plan', { slides: plan, total: plan.length })

    const slides = []
    const errors = []

    for (let i = 0; i < plan.length; i++) {
      send('progress', { slideIndex: i + 1, total: plan.length, status: 'generating', content: plan[i] })

      try {
        const html = await provider.generateSlide({
          slideNumber: i + 1,
          totalSlides: plan.length,
          content: plan[i],
          theme,
          projectName
        })

        const filename = addSlide(slug, i + 1, html)
        slides.push(filename)

        send('slide', { slideIndex: i + 1, filename, total: plan.length })
      } catch (err) {
        errors.push(`Slide ${i + 1}: ${err.message}`)
        send('error', { slideIndex: i + 1, message: err.message })
      }
    }

    updateMeta(slug, { model, theme, generatedAt: new Date().toISOString() })
    send('complete', { slides, errors, slug })

  } catch (err) {
    send('fatal', { message: err.message })
  } finally {
    res.end()
  }
}

/**
 * Pide al LLM que planifique el contenido de cada slide
 * Retorna un array de strings, uno por slide
 */
export async function planPresentation({ provider, projectName, brief, slideCount, extraInstructions }) {
  const messages = [
    {
      role: 'system',
      content: `Eres un experto en comunicación y diseño de presentaciones. 
Tu tarea es planificar el contenido de una presentación de ${slideCount} diapositivas.
Debes retornar ÚNICAMENTE un array JSON con ${slideCount} elementos.
Cada elemento es un string describiendo el contenido de ese slide.
Sin explicaciones adicionales. Solo el JSON.

Ejemplo de formato esperado:
["Slide de portada: Título 'X', subtítulo 'Y', autor 'Z'", "Slide 2: Introducción al tema. Puntos: A, B, C", ...]`
    },
    {
      role: 'user',
      content: `Proyecto: "${projectName}"
Descripción: ${brief}
Cantidad de slides: ${slideCount}
${extraInstructions ? `Instrucciones adicionales: ${extraInstructions}` : ''}

Planifica el contenido de cada slide. Recuerda: solo el JSON array.`
    }
  ]

  const response = await provider.chat(messages, { temperature: 0.5 })

  // Parsear el JSON
  try {
    const match = response.match(/\[[\s\S]*\]/)
    if (!match) throw new Error('No se encontró array JSON en la respuesta')
    const plan = JSON.parse(match[0])
    if (!Array.isArray(plan)) throw new Error('La respuesta no es un array')
    return plan
  } catch (err) {
    console.error('[SlideGenerator] Error parseando plan:', response)
    throw new Error(`Error al planificar presentación: ${err.message}`)
  }
}

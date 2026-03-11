/**
 * Base class for AI providers
 */
export class AIProvider {
  constructor(apiKey) {
    if (!apiKey) throw new Error('API key requerida')
    this.apiKey = apiKey
  }

  /**
   * Envía mensajes al LLM y retorna respuesta completa como string
   * @param {Array<{role: 'system'|'user'|'assistant', content: string}>} messages
   * @param {object} options
   * @returns {Promise<string>}
   */
  async chat(messages, options = {}) {
    throw new Error('Not implemented')
  }

  /**
   * Genera el HTML completo de un slide
   * @param {object} context - { slideNumber, totalSlides, content, theme, projectName }
   * @returns {Promise<string>} HTML string
   */
  async generateSlide(context) {
    throw new Error('Not implemented')
  }

  /**
   * Verifica que la API key sea válida haciendo una llamada mínima
   * @returns {Promise<boolean>}
   */
  async validateKey() {
    throw new Error('Not implemented')
  }
}

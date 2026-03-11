import { AIProvider } from './baseProvider.js'
import { OpenAIProvider } from './openai.js'
import { AnthropicProvider } from './anthropic.js'
import { GeminiProvider } from './gemini.js'

export { AIProvider }

/**
 * Factory — retorna el provider correcto según el modelo
 * @param {'openai'|'claude'|'gemini'} model
 * @param {string} apiKey
 * @returns {AIProvider}
 */
export function createProvider(model, apiKey) {
  const map = { openai: OpenAIProvider, claude: AnthropicProvider, gemini: GeminiProvider }
  const Provider = map[model]
  if (!Provider) throw new Error(`Modelo no soportado: ${model}`)
  return new Provider(apiKey)
}

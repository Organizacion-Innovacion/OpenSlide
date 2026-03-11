import { AIProvider } from './provider.js'

export class GeminiProvider extends AIProvider {
  constructor(apiKey) {
    super(apiKey)
    // TODO: import Google Generative AI SDK (npm install @google/generative-ai)
  }

  async chat(messages) {
    // TODO: implement using GoogleGenerativeAI
    // const genAI = new GoogleGenerativeAI(this.apiKey)
    // const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
    // const chat = model.startChat({ history: messages.slice(0, -1) })
    // const result = await chat.sendMessage(messages.at(-1).content)
    // return { role: 'assistant', content: result.response.text() }
    throw new Error('Gemini provider not yet implemented')
  }

  async generateSlide(context) {
    // TODO: implement slide generation prompt + HTML response parsing
    throw new Error('Gemini generateSlide not yet implemented')
  }

  async validateKey() {
    // TODO: make a lightweight API call to check validity
    throw new Error('Gemini validateKey not yet implemented')
  }
}

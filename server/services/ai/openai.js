import { AIProvider } from './provider.js'

export class OpenAIProvider extends AIProvider {
  constructor(apiKey) {
    super(apiKey)
    // TODO: import OpenAI SDK (npm install openai)
  }

  async chat(messages) {
    // TODO: implement using openai.chat.completions.create
    // const client = new OpenAI({ apiKey: this.apiKey })
    // const res = await client.chat.completions.create({ model: 'gpt-4o', messages })
    // return res.choices[0].message
    throw new Error('OpenAI provider not yet implemented')
  }

  async generateSlide(context) {
    // TODO: implement slide generation prompt + HTML response parsing
    throw new Error('OpenAI generateSlide not yet implemented')
  }

  async validateKey() {
    // TODO: make a lightweight API call to check validity
    throw new Error('OpenAI validateKey not yet implemented')
  }
}

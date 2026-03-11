import { AIProvider } from './provider.js'

export class AnthropicProvider extends AIProvider {
  constructor(apiKey) {
    super(apiKey)
    // TODO: import Anthropic SDK (npm install @anthropic-ai/sdk)
  }

  async chat(messages) {
    // TODO: implement using Anthropic messages.create
    // const client = new Anthropic({ apiKey: this.apiKey })
    // const res = await client.messages.create({ model: 'claude-sonnet-4-5', max_tokens: 4096, messages })
    // return { role: 'assistant', content: res.content[0].text }
    throw new Error('Anthropic provider not yet implemented')
  }

  async generateSlide(context) {
    // TODO: implement slide generation prompt + HTML response parsing
    throw new Error('Anthropic generateSlide not yet implemented')
  }

  async validateKey() {
    // TODO: make a lightweight API call to check validity
    throw new Error('Anthropic validateKey not yet implemented')
  }
}

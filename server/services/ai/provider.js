export class AIProvider {
  constructor(apiKey) {
    this.apiKey = apiKey
  }

  /** @param {{ role: string, content: string }[]} messages */
  async chat(messages) {
    throw new Error('Not implemented')
  }

  /** @param {object} context */
  async generateSlide(context) {
    throw new Error('Not implemented')
  }

  async validateKey() {
    throw new Error('Not implemented')
  }
}

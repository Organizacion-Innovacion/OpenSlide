import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useSettingsStore = create(
  persist(
    (set, get) => ({
      model: null,
      keys: { openai: null, anthropic: null, gemini: null },
      setModel: (model) => set({ model }),
      setKey: (provider, key) => set((s) => ({ keys: { ...s.keys, [provider]: key } })),
      getActiveKey: () => {
        const { model, keys } = get()
        if (!model) return null
        const map = { openai: keys.openai, claude: keys.anthropic, gemini: keys.gemini }
        return map[model] || null
      },
      hasKey: (provider) => {
        const map = { openai: 'openai', claude: 'anthropic', gemini: 'gemini' }
        return !!get().keys[map[provider]]
      }
    }),
    { name: 'openslide-settings' }
  )
)

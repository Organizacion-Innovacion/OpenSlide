import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useSettingsStore = create(
  persist(
    (set, get) => ({
      model: null,
      theme: 'light',
      setModel: (model) => set({ model }),
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((s) => ({ theme: s.theme === 'light' ? 'dark' : 'light' })),
    }),
    { name: 'openslide-settings' }
  )
)

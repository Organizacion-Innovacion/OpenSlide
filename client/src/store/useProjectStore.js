import { create } from 'zustand'

export const useProjectStore = create((set) => ({
  projects: [],
  activeProject: null,
  loading: false,
  setProjects: (projects) => set({ projects }),
  setActiveProject: (project) => set({ activeProject: project }),
  setLoading: (loading) => set({ loading }),
}))

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { nanoid } from './nanoid'

const useProjectStore = create(
  persist(
    (set) => ({
      projects: [],
      sha: null,

      addProject: ({ title, tags = [], status = 'backlog' }) => {
        const project = {
          id: nanoid(),
          title,
          status,
          tags,
          milestones: [],
          createdAt: new Date().toISOString().slice(0, 10),
        }
        set((s) => ({ projects: [...s.projects, project] }))
      },

      updateProject: (id, changes) => {
        set((s) => ({
          projects: s.projects.map((p) => (p.id === id ? { ...p, ...changes } : p)),
        }))
      },

      moveProject: (id, status) => {
        set((s) => ({
          projects: s.projects.map((p) => (p.id === id ? { ...p, status } : p)),
        }))
      },

      deleteProject: (id) => {
        set((s) => ({ projects: s.projects.filter((p) => p.id !== id) }))
      },

      addMilestone: (projectId, text) => {
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === projectId
              ? { ...p, milestones: [...p.milestones, { id: nanoid(), text, done: false }] }
              : p
          ),
        }))
      },

      toggleMilestone: (projectId, milestoneId) => {
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  milestones: p.milestones.map((m) =>
                    m.id === milestoneId ? { ...m, done: !m.done } : m
                  ),
                }
              : p
          ),
        }))
      },

      setSha: (sha) => set({ sha }),
    }),
    { name: 'bd-projects' }
  )
)

export default useProjectStore

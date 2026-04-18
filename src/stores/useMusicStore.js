import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { nanoid } from './nanoid'

const useMusicStore = create(
  persist(
    (set) => ({
      tracks: [],
      sessions: [],
      sha: null,

      addTrack: ({ title, key = '', bpm = 120, timeSignature = '4/4', daw = '', collaborator = '' }) => {
        const track = {
          id: nanoid(),
          title,
          key,
          bpm,
          timeSignature,
          daw,
          collaborator,
          status: 'idea',
          progress: 0,
        }
        set((s) => ({ tracks: [...s.tracks, track] }))
      },

      updateTrack: (id, changes) => {
        set((s) => ({
          tracks: s.tracks.map((t) => (t.id === id ? { ...t, ...changes } : t)),
        }))
      },

      deleteTrack: (id) => {
        set((s) => ({ tracks: s.tracks.filter((t) => t.id !== id) }))
      },

      addSession: ({ trackId, duration, notes }) => {
        const session = {
          id: nanoid(),
          date: new Date().toISOString().slice(0, 10),
          trackId,
          duration,
          notes,
        }
        set((s) => ({ sessions: [session, ...s.sessions] }))
      },

      setSha: (sha) => set({ sha }),
    }),
    { name: 'bd-music' }
  )
)

export default useMusicStore

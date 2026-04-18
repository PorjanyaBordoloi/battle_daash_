import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { nanoid } from './nanoid'

const useMusicStore = create(
  persist(
    (set, get) => ({
      tracks: [],
      sessions: [],       // production sessions (existing)
      references: [],     // reference tracks
      guitarLogs: [],     // guitar practice sessions
      sha: null,

      // ── Tracks ──────────────────────────────────────────────────────────
      addTrack: ({ title, key = '', bpm = 120, timeSignature = '4/4', daw = '', collaborator = '', genre = '' }) => {
        const track = {
          id: nanoid(),
          title, key, bpm, timeSignature, daw, collaborator, genre,
          status: 'idea',   // idea | production | mixing | mastering | released
          progress: 0,
          createdAt: new Date().toISOString().slice(0, 10),
          updatedAt: new Date().toISOString().slice(0, 10),
        }
        set((s) => ({ tracks: [...s.tracks, track] }))
      },

      updateTrack: (id, changes) => {
        set((s) => ({
          tracks: s.tracks.map((t) =>
            t.id === id ? { ...t, ...changes, updatedAt: new Date().toISOString().slice(0, 10) } : t
          ),
        }))
      },

      deleteTrack: (id) => set((s) => ({ tracks: s.tracks.filter((t) => t.id !== id) })),

      // ── Sessions ─────────────────────────────────────────────────────────
      addSession: ({ trackId, trackName = '', daw = '', sessionType = 'production', bpm = '', key = '', duration, notes }) => {
        const session = {
          id: nanoid(),
          date: new Date().toISOString().slice(0, 10),
          trackId, trackName, daw, sessionType, bpm, key,
          duration: Number(duration),
          notes,
        }
        set((s) => ({ sessions: [session, ...s.sessions] }))
      },

      deleteSession: (id) => set((s) => ({ sessions: s.sessions.filter((s2) => s2.id !== id) })),

      // ── Reference Tracks ─────────────────────────────────────────────────
      addReference: ({ title, artist, notes = '', vibe = '', referencePoints = '' }) => {
        const ref = {
          id: nanoid(),
          title, artist, notes, vibe, referencePoints,
          addedAt: new Date().toISOString().slice(0, 10),
        }
        set((s) => ({ references: [...s.references, ref] }))
      },

      deleteReference: (id) => set((s) => ({ references: s.references.filter((r) => r.id !== id) })),

      // ── Guitar Practice ──────────────────────────────────────────────────
      addGuitarLog: ({ technique, duration, difficulty, notes }) => {
        const log = {
          id: nanoid(),
          date: new Date().toISOString().slice(0, 10),
          technique,
          duration: Number(duration),
          difficulty: Number(difficulty),
          notes,
        }
        set((s) => ({ guitarLogs: [log, ...s.guitarLogs] }))
      },

      deleteGuitarLog: (id) => set((s) => ({ guitarLogs: s.guitarLogs.filter((l) => l.id !== id) })),

      setSha: (sha) => set({ sha }),
    }),
    { name: 'bd-music' }
  )
)

export default useMusicStore

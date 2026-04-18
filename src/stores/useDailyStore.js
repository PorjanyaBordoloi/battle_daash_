import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { nanoid } from './nanoid'

const useDailyStore = create(
  persist(
    (set, get) => ({
      entries: {},   // { 'YYYY-MM-DD': [entry, ...] }
      timeboxes: {}, // { 'YYYY-MM-DD': { hour: timebox } }
      reviews: {},   // { 'YYYY-MM-DD': { needle, migrate } }
      shas: {},

      addEntry: (date, { sigil, text, indent = 0 }) => {
        const entry = { id: nanoid(), date, sigil, text, indent, done: false, migratedTo: null }
        set((s) => ({
          entries: {
            ...s.entries,
            [date]: [...(s.entries[date] || []), entry],
          },
        }))
      },

      toggleDone: (date, id) => {
        set((s) => ({
          entries: {
            ...s.entries,
            [date]: (s.entries[date] || []).map((e) =>
              e.id === id ? { ...e, done: !e.done, sigil: !e.done ? '×' : '·' } : e
            ),
          },
        }))
      },

      updateEntry: (date, id, changes) => {
        set((s) => ({
          entries: {
            ...s.entries,
            [date]: (s.entries[date] || []).map((e) => (e.id === id ? { ...e, ...changes } : e)),
          },
        }))
      },

      deleteEntry: (date, id) => {
        set((s) => ({
          entries: {
            ...s.entries,
            [date]: (s.entries[date] || []).filter((e) => e.id !== id),
          },
        }))
      },

      migrateEntry: (fromDate, id, toDate) => {
        const { entries } = get()
        const entry = (entries[fromDate] || []).find((e) => e.id === id)
        if (!entry) return
        set((s) => ({
          entries: {
            ...s.entries,
            [fromDate]: (s.entries[fromDate] || []).map((e) =>
              e.id === id ? { ...e, migratedTo: toDate, sigil: '>' } : e
            ),
            [toDate]: [
              ...(s.entries[toDate] || []),
              { ...entry, id: nanoid(), date: toDate, migratedTo: null, sigil: '<' },
            ],
          },
        }))
      },

      addTimebox: (date, hour, label) => {
        const id = nanoid()
        set((s) => ({
          timeboxes: {
            ...s.timeboxes,
            [date]: { ...(s.timeboxes[date] || {}), [hour]: { id, date, hour, label } },
          },
        }))
      },

      updateTimebox: (date, hour, label) => {
        set((s) => ({
          timeboxes: {
            ...s.timeboxes,
            [date]: {
              ...(s.timeboxes[date] || {}),
              [hour]: { ...(s.timeboxes[date]?.[hour] || { id: nanoid(), date, hour }), label },
            },
          },
        }))
      },

      deleteTimebox: (date, hour) => {
        set((s) => {
          const day = { ...(s.timeboxes[date] || {}) }
          delete day[hour]
          return { timeboxes: { ...s.timeboxes, [date]: day } }
        })
      },

      setReview: (date, field, value) => {
        set((s) => ({
          reviews: {
            ...s.reviews,
            [date]: { ...(s.reviews[date] || {}), [field]: value },
          },
        }))
      },

      setDaySha: (date, sha) => {
        set((s) => ({ shas: { ...s.shas, [date]: sha } }))
      },
    }),
    { name: 'bd-daily' }
  )
)

export default useDailyStore

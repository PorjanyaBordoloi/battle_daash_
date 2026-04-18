import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { nanoid } from './nanoid'

const useHabitStore = create(
  persist(
    (set) => ({
      habits: [],
      checkins: {}, // { 'YYYY-MM-DD': ['habitId', ...] }
      sha: null,

      addHabit: (name) => {
        const habit = { id: nanoid(), name, createdAt: new Date().toISOString().slice(0, 10) }
        set((s) => ({ habits: [...s.habits, habit] }))
      },

      removeHabit: (id) => {
        set((s) => ({ habits: s.habits.filter((h) => h.id !== id) }))
      },

      toggleCheckin: (date, habitId) => {
        set((s) => {
          const existing = s.checkins[date] || []
          const has = existing.includes(habitId)
          return {
            checkins: {
              ...s.checkins,
              [date]: has ? existing.filter((id) => id !== habitId) : [...existing, habitId],
            },
          }
        })
      },

      setSha: (sha) => set({ sha }),
    }),
    { name: 'bd-habits' }
  )
)

export default useHabitStore

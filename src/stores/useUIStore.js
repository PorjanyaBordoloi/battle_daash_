import { create } from 'zustand'
import { todayKey } from '../lib/dates'

const POMODORO_WORK = 25 * 60
const POMODORO_BREAK = 5 * 60

const useUIStore = create((set, get) => ({
  commandPaletteOpen: false,
  syncStatus: 'synced', // 'synced' | 'syncing' | 'offline'
  activeDate: todayKey(),
  pomodoroTime: POMODORO_WORK,
  pomodoroRunning: false,
  pomodoroSession: 0, // 0-3 for the 4-session cycle
  pomodoroMode: 'work', // 'work' | 'break'
  contextMenu: null, // { x, y, items: [{label, action}] }

  openCommandPalette: () => set({ commandPaletteOpen: true }),
  closeCommandPalette: () => set({ commandPaletteOpen: false }),

  setSyncStatus: (syncStatus) => set({ syncStatus }),
  setActiveDate: (activeDate) => set({ activeDate }),

  tickPomodoro: () => {
    const { pomodoroTime, pomodoroMode, pomodoroSession, pomodoroRunning } = get()
    if (!pomodoroRunning) return
    if (pomodoroTime <= 0) {
      // auto-advance
      if (pomodoroMode === 'work') {
        const next = (pomodoroSession + 1) % 4
        set({
          pomodoroMode: 'break',
          pomodoroTime: POMODORO_BREAK,
          pomodoroSession: next,
        })
      } else {
        set({ pomodoroMode: 'work', pomodoroTime: POMODORO_WORK })
      }
    } else {
      set({ pomodoroTime: pomodoroTime - 1 })
    }
  },

  togglePomodoro: () => set((s) => ({ pomodoroRunning: !s.pomodoroRunning })),

  resetPomodoro: () =>
    set({ pomodoroTime: POMODORO_WORK, pomodoroRunning: false, pomodoroMode: 'work' }),

  skipPomodoro: () => {
    const { pomodoroMode, pomodoroSession } = get()
    if (pomodoroMode === 'work') {
      set({ pomodoroMode: 'break', pomodoroTime: POMODORO_BREAK, pomodoroSession: (pomodoroSession + 1) % 4 })
    } else {
      set({ pomodoroMode: 'work', pomodoroTime: POMODORO_WORK })
    }
  },

  setContextMenu: (menu) => set({ contextMenu: menu }),
}))

export default useUIStore

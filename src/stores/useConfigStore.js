import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useConfigStore = create(
  persist(
    (set) => ({
      pat: '',
      owner: '',
      repo: '',
      geminiKey: '',
      name: 'The Flame',
      isSetup: false,

      setConfig: (cfg) => set((s) => ({ ...s, ...cfg })),
      clearConfig: () => set({ pat: '', owner: '', repo: '', geminiKey: '', name: 'The Flame', isSetup: false }),
    }),
    { name: 'bd-config' }
  )
)

export default useConfigStore

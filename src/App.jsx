import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Shell from './components/layout/Shell'
import TodayView from './components/today/TodayView'
import WeekView from './components/week/WeekView'
import ProjectsView from './components/projects/ProjectsView'
import HabitsView from './components/habits/HabitsView'
import MusicView from './components/music/MusicView'
import CommandPalette from './components/shared/CommandPalette'
import { ContextMenu } from './components/today/BulletEntry'
import useUIStore from './stores/useUIStore'
import './styles/global.css'

function GlobalShortcuts() {
  const openCommandPalette = useUIStore((s) => s.openCommandPalette)
  const commandPaletteOpen = useUIStore((s) => s.commandPaletteOpen)

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (!commandPaletteOpen) openCommandPalette()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [commandPaletteOpen])

  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <GlobalShortcuts />
      <Routes>
        <Route path="/" element={<Shell />}>
          <Route index element={<Navigate to="/today" replace />} />
          <Route path="today" element={<TodayView />} />
          <Route path="week" element={<WeekView />} />
          <Route path="projects" element={<ProjectsView />} />
          <Route path="habits" element={<HabitsView />} />
          <Route path="music" element={<MusicView />} />
        </Route>
      </Routes>
      <CommandPalette />
      <ContextMenu />
    </BrowserRouter>
  )
}

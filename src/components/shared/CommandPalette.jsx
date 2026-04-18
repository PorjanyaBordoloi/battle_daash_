import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useUIStore from '../../stores/useUIStore'
import useDailyStore from '../../stores/useDailyStore'
import useProjectStore from '../../stores/useProjectStore'
import useHabitStore from '../../stores/useHabitStore'
import useMusicStore from '../../stores/useMusicStore'
import { fuzzySearch } from '../../lib/fuzzy'

function buildIndex(entries, projects, habits, tracks, activeDate) {
  const items = []

  // Nav
  const pages = ['today', 'week', 'projects', 'habits', 'music']
  pages.forEach((p) => items.push({ type: 'nav', label: `Go to ${p}`, to: `/${p}` }))

  // Today entries
  const dayEntries = entries[activeDate] || []
  dayEntries.forEach((e) => items.push({ type: 'entry', label: e.text, sub: 'today log', to: '/today' }))

  // Projects
  projects.forEach((p) => items.push({ type: 'project', label: p.title, sub: p.status, to: '/projects' }))

  // Habits
  habits.forEach((h) => items.push({ type: 'habit', label: h.name, sub: 'habit', to: '/habits' }))

  // Tracks
  tracks.forEach((t) => items.push({ type: 'track', label: t.title, sub: t.status, to: '/music' }))

  return items
}

const typeColors = {
  nav: 'var(--text-tertiary)',
  entry: 'var(--text-secondary)',
  project: 'var(--text-secondary)',
  habit: 'var(--text-secondary)',
  track: 'var(--text-secondary)',
}

export default function CommandPalette() {
  const open = useUIStore((s) => s.commandPaletteOpen)
  const close = useUIStore((s) => s.closeCommandPalette)
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const inputRef = useRef(null)

  const entries = useDailyStore((s) => s.entries)
  const activeDate = useUIStore((s) => s.activeDate)
  const projects = useProjectStore((s) => s.projects)
  const habits = useHabitStore((s) => s.habits)
  const tracks = useMusicStore((s) => s.tracks)

  const allItems = buildIndex(entries, projects, habits, tracks, activeDate)
  const results = fuzzySearch(allItems, query, (i) => i.label).slice(0, 12)

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        open ? close() : useUIStore.getState().openCommandPalette()
      }
      if (e.key === 'Escape' && open) close()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open])

  useEffect(() => {
    if (open) {
      setQuery('')
      setSelected(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  const handleKey = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelected((s) => Math.min(s + 1, results.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSelected((s) => Math.max(s - 1, 0)) }
    if (e.key === 'Enter' && results[selected]) {
      navigate(results[selected].to)
      close()
    }
  }

  if (!open) return null

  return (
    <div
      onClick={close}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(8,8,9,0.85)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        paddingTop: 80, zIndex: 1000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 480, background: 'var(--bg-s2)',
          border: '1px solid var(--border-mid)', borderRadius: 4,
          overflow: 'hidden',
        }}
      >
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setSelected(0) }}
          onKeyDown={handleKey}
          placeholder="Search pages, entries, projects..."
          style={{
            width: '100%', padding: '10px 14px', fontSize: 12,
            background: 'var(--bg-s2)', border: 'none',
            borderBottom: '1px solid var(--border-dim)',
            color: 'var(--text-primary)',
          }}
        />
        {results.length > 0 && (
          <div style={{ maxHeight: 320, overflowY: 'auto' }}>
            {results.map((item, i) => (
              <div
                key={i}
                onClick={() => { navigate(item.to); close() }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '7px 14px', cursor: 'pointer',
                  background: i === selected ? 'var(--bg-s3)' : 'transparent',
                  borderLeft: i === selected ? '2px solid var(--text-primary)' : '2px solid transparent',
                }}
                onMouseEnter={() => setSelected(i)}
              >
                <span style={{ fontSize: 11, color: 'var(--text-primary)' }}>{item.label}</span>
                <span style={{ fontSize: 9, color: typeColors[item.type], letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  {item.sub || item.type}
                </span>
              </div>
            ))}
          </div>
        )}
        {results.length === 0 && query && (
          <div style={{ padding: '12px 14px', fontSize: 10, color: 'var(--text-tertiary)' }}>
            No results for "{query}"
          </div>
        )}
        <div style={{ padding: '5px 14px', borderTop: '1px solid var(--border-dim)', display: 'flex', gap: 12 }}>
          <span style={{ fontSize: 8, color: 'var(--text-ghost)', letterSpacing: '0.08em' }}>↑↓ NAVIGATE</span>
          <span style={{ fontSize: 8, color: 'var(--text-ghost)', letterSpacing: '0.08em' }}>↵ SELECT</span>
          <span style={{ fontSize: 8, color: 'var(--text-ghost)', letterSpacing: '0.08em' }}>ESC CLOSE</span>
        </div>
      </div>
    </div>
  )
}

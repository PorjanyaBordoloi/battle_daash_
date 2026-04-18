import { useLocation, useNavigate } from 'react-router-dom'
import useUIStore from '../../stores/useUIStore'
import useConfigStore from '../../stores/useConfigStore'
import SyncIndicator from '../shared/SyncIndicator'
import { formatDateLong } from '../../lib/dates'

const tabLabels = {
  today: 'TODAY',
  week: 'WEEK',
  projects: 'PROJECTS',
  habits: 'HABITS',
  music: 'MUSIC',
}

function formatTime(secs) {
  const m = String(Math.floor(secs / 60)).padStart(2, '0')
  const s = String(secs % 60).padStart(2, '0')
  return `${m}:${s}`
}

export default function Topbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const tab = location.pathname.slice(1) || 'today'
  const { pomodoroTime, pomodoroRunning, pomodoroSession, pomodoroMode, togglePomodoro } = useUIStore()
  const activeDate = useUIStore((s) => s.activeDate)
  const name = useConfigStore((s) => s.name)

  const sessionDots = Array.from({ length: 4 }, (_, i) => i < pomodoroSession)

  return (
    <div style={{
      height: 'var(--topbar-h)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 12px',
      borderBottom: '1px solid var(--border-dim)',
      flexShrink: 0,
      background: 'var(--bg-s1)',
    }}>
      {/* Left */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.15em', color: 'var(--text-primary)' }}>
          BD
        </span>
        <span style={{ color: 'var(--border-dim)' }}>·</span>
        <span style={{ fontSize: 9, letterSpacing: '0.1em', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
          {tabLabels[tab] || tab.toUpperCase()}
        </span>
        <span style={{ color: 'var(--border-dim)' }}>·</span>
        <span style={{ fontSize: 9, color: 'var(--text-ghost)', letterSpacing: '0.08em' }}>
          {formatDateLong(activeDate)}
        </span>
      </div>

      {/* Center */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {sessionDots.map((done, i) => (
            <span key={i} style={{
              width: 4, height: 4, borderRadius: '50%',
              background: done ? 'var(--text-primary)' : 'var(--border-dim)',
              display: 'inline-block',
            }} />
          ))}
        </div>
        {pomodoroRunning && (
          <span style={{ fontSize: 9, color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>
            {pomodoroMode === 'work' ? '▶' : '☕'} {formatTime(pomodoroTime)}
          </span>
        )}
        <button
          onClick={() => navigate('/today')}
          style={{
            fontSize: 9,
            letterSpacing: '0.1em',
            color: 'var(--text-tertiary)',
            border: '1px solid var(--border-dim)',
            padding: '2px 7px',
            borderRadius: 2,
            transition: 'all var(--transition)',
          }}
          onMouseEnter={(e) => { e.target.style.color = 'var(--text-primary)'; e.target.style.borderColor = 'var(--border-bright)' }}
          onMouseLeave={(e) => { e.target.style.color = 'var(--text-tertiary)'; e.target.style.borderColor = 'var(--border-dim)' }}
        >
          ✦ PLAN
        </button>
      </div>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 9, color: 'var(--text-ghost)' }}>{name}</span>
        <SyncIndicator />
      </div>
    </div>
  )
}

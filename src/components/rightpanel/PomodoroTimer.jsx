import { useEffect } from 'react'
import useUIStore from '../../stores/useUIStore'
import SectionHeader from '../shared/SectionHeader'

function formatTime(secs) {
  const m = String(Math.floor(secs / 60)).padStart(2, '0')
  const s = String(secs % 60).padStart(2, '0')
  return `${m}:${s}`
}

export default function PomodoroTimer() {
  const { pomodoroTime, pomodoroRunning, pomodoroSession, pomodoroMode,
          tickPomodoro, togglePomodoro, resetPomodoro, skipPomodoro } = useUIStore()

  useEffect(() => {
    if (!pomodoroRunning) return
    const id = setInterval(tickPomodoro, 1000)
    return () => clearInterval(id)
  }, [pomodoroRunning, tickPomodoro])

  const dots = Array.from({ length: 4 }, (_, i) => i < pomodoroSession)

  return (
    <div style={{ padding: '10px 12px' }}>
      <SectionHeader label={`POMODORO · ${pomodoroMode === 'work' ? 'FOCUS' : 'BREAK'}`} />

      <div style={{ textAlign: 'center', padding: '8px 0' }}>
        <div style={{
          fontSize: 28, fontWeight: 300, letterSpacing: '0.05em',
          color: pomodoroRunning ? 'var(--text-primary)' : 'var(--text-secondary)',
          fontFamily: 'var(--font)',
          lineHeight: 1,
        }}>
          {formatTime(pomodoroTime)}
        </div>
        <div style={{ fontSize: 8, color: 'var(--text-ghost)', marginTop: 4, letterSpacing: '0.1em' }}>
          {pomodoroMode === 'work' ? 'DEEP WORK' : 'REST'}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 8 }}>
        {dots.map((done, i) => (
          <span key={i} style={{
            width: 5, height: 5, borderRadius: '50%',
            background: done ? 'var(--text-primary)' : 'var(--border-dim)',
            display: 'inline-block',
          }} />
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
        <button
          onClick={resetPomodoro}
          className="btn-text"
          style={{ fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-ghost)' }}
        >
          RST
        </button>
        <button
          onClick={togglePomodoro}
          style={{
            fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase',
            color: 'var(--text-primary)', border: '1px solid var(--border-mid)',
            padding: '2px 10px', borderRadius: 2,
          }}
        >
          {pomodoroRunning ? 'PAUSE' : 'START'}
        </button>
        <button
          onClick={skipPomodoro}
          className="btn-text"
          style={{ fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-ghost)' }}
        >
          SKIP
        </button>
      </div>
    </div>
  )
}

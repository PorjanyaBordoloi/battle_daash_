import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useUIStore from '../../stores/useUIStore'
import useDailyStore from '../../stores/useDailyStore'
import { todayKey, getMonthDays } from '../../lib/dates'

const DOW = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

export default function MiniCalendar() {
  const today = todayKey()
  const activeDate = useUIStore((s) => s.activeDate)
  const setActiveDate = useUIStore((s) => s.setActiveDate)
  const entries = useDailyStore((s) => s.entries)
  const navigate = useNavigate()

  const now = new Date(activeDate + 'T00:00:00')
  const [viewYear, setViewYear] = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth())

  const days = getMonthDays(viewYear, viewMonth)
  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase()

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  const handleDayClick = (dateStr) => {
    setActiveDate(dateStr)
    navigate('/today')
  }

  return (
    <div style={{ padding: '10px 12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <button onClick={prevMonth} style={{ fontSize: 10, color: 'var(--text-ghost)', padding: '0 2px' }}>‹</button>
        <span style={{ fontSize: 9, letterSpacing: '0.1em', color: 'var(--text-tertiary)' }}>{monthLabel}</span>
        <button onClick={nextMonth} style={{ fontSize: 10, color: 'var(--text-ghost)', padding: '0 2px' }}>›</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, marginBottom: 3 }}>
        {DOW.map((d, i) => (
          <div key={i} style={{ textAlign: 'center', fontSize: 8, color: 'var(--text-ghost)', letterSpacing: '0.05em' }}>{d}</div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
        {days.map((dateStr, i) => {
          if (!dateStr) return <div key={i} />
          const isToday = dateStr === today
          const isActive = dateStr === activeDate
          const hasEntries = (entries[dateStr] || []).length > 0

          return (
            <button
              key={dateStr}
              onClick={() => handleDayClick(dateStr)}
              style={{
                width: '100%',
                aspectRatio: '1',
                fontSize: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 2,
                background: isToday ? 'var(--bg-s4)' : hasEntries ? 'var(--bg-s3)' : 'transparent',
                border: isActive ? '1px solid var(--border-bright)' : '1px solid transparent',
                color: isToday ? 'var(--text-primary)' : hasEntries ? 'var(--text-secondary)' : 'var(--text-ghost)',
                cursor: 'pointer',
                transition: 'all var(--transition)',
              }}
            >
              {new Date(dateStr + 'T00:00:00').getDate()}
            </button>
          )
        })}
      </div>
    </div>
  )
}

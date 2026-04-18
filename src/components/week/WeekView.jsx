import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useDailyStore from '../../stores/useDailyStore'
import useUIStore from '../../stores/useUIStore'
import { getWeekDays, todayKey, getDayLabel, formatDateLong } from '../../lib/dates'

const HOURS = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]

export default function WeekView() {
  const [weekOffset, setWeekOffset] = useState(0)
  const navigate = useNavigate()
  const setActiveDate = useUIStore((s) => s.setActiveDate)
  const entries = useDailyStore((s) => s.entries)
  const timeboxes = useDailyStore((s) => s.timeboxes)
  const today = todayKey()
  const days = getWeekDays(weekOffset)

  const goToDay = (date) => {
    setActiveDate(date)
    navigate('/today')
  }

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 16px', borderBottom: '1px solid var(--border-dim)',
        flexShrink: 0,
      }}>
        <button
          onClick={() => setWeekOffset(w => w - 1)}
          style={{ fontSize: 10, color: 'var(--text-tertiary)' }}
        >‹ PREV</button>
        <span style={{ fontSize: 9, letterSpacing: '0.1em', color: 'var(--text-tertiary)' }}>
          WEEK {weekOffset === 0 ? '(CURRENT)' : weekOffset > 0 ? `+${weekOffset}` : weekOffset}
        </span>
        <button
          onClick={() => setWeekOffset(w => w + 1)}
          style={{ fontSize: 10, color: 'var(--text-tertiary)' }}
        >NEXT ›</button>
      </div>

      {/* Grid */}
      <div style={{ flex: 1, overflow: 'auto', scrollbarWidth: 'thin', scrollbarColor: 'var(--border-dim) transparent' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0, minWidth: 700 }}>
          {days.map((date) => {
            const isToday = date === today
            const dayEntries = (entries[date] || []).slice(0, 5)
            const dayTimeboxes = timeboxes[date] || {}

            return (
              <div
                key={date}
                style={{
                  borderRight: '1px solid var(--border-dim)',
                  background: isToday ? 'var(--bg-s2)' : 'transparent',
                  minHeight: '100%',
                }}
              >
                {/* Day header */}
                <button
                  onClick={() => goToDay(date)}
                  style={{
                    width: '100%', padding: '8px 8px 5px',
                    borderBottom: '1px solid var(--border-dim)',
                    textAlign: 'left',
                    display: 'flex', flexDirection: 'column', gap: 1,
                  }}
                >
                  <span style={{ fontSize: 8, letterSpacing: '0.1em', color: 'var(--text-ghost)' }}>
                    {getDayLabel(date)}
                  </span>
                  <span style={{
                    fontSize: 14, fontWeight: isToday ? 500 : 300,
                    color: isToday ? 'var(--text-primary)' : 'var(--text-tertiary)',
                  }}>
                    {new Date(date + 'T00:00:00').getDate()}
                  </span>
                </button>

                {/* Entries */}
                <div style={{ padding: '5px 6px' }}>
                  {dayEntries.map((e) => (
                    <div key={e.id} style={{
                      fontSize: 9, padding: '1px 0',
                      color: e.done ? 'var(--text-dead)' : 'var(--text-secondary)',
                      textDecoration: e.done ? 'line-through' : 'none',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      <span style={{ color: 'var(--text-ghost)', marginRight: 3 }}>{e.sigil}</span>
                      {e.text}
                    </div>
                  ))}
                  {(entries[date] || []).length > 5 && (
                    <div style={{ fontSize: 8, color: 'var(--text-ghost)', marginTop: 2 }}>
                      +{(entries[date] || []).length - 5} more
                    </div>
                  )}
                </div>

                {/* Timebox samples */}
                <div style={{ padding: '0 6px 6px' }}>
                  {HOURS.filter(h => dayTimeboxes[h]).slice(0, 4).map(h => (
                    <div key={h} style={{ display: 'flex', gap: 4, marginBottom: 1 }}>
                      <span style={{ fontSize: 8, color: 'var(--text-ghost)', flexShrink: 0 }}>
                        {String(h).padStart(2, '0')}
                      </span>
                      <span style={{
                        fontSize: 8, color: 'var(--text-tertiary)',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {dayTimeboxes[h].label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

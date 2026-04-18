import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import useDailyStore from '../../stores/useDailyStore'
import useUIStore from '../../stores/useUIStore'
import { getWeekDays, todayKey, getDayLabel } from '../../lib/dates'

const HOURS = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23]
const ROW_H = 52 // px per hour row
const TIME_COL_W = 44 // px for time label column

// Color palette per sigil type — subtle tints on the dark base
const ENTRY_COLORS = {
  '·': { bg: '#131820', border: '#1e3050', text: '#7aaee8' },
  '×': { bg: '#111411', border: '#1c2a1c', text: '#3d3d45' },
  '>': { bg: '#111411', border: '#252525', text: '#555560' },
  '<': { bg: '#131820', border: '#1e3050', text: '#5588c0' },
  '○': { bg: '#1a1520', border: '#3a2550', text: '#9a70c8' },
  '—': { bg: '#111114', border: '#2a2a2e', text: '#6b6b75' },
  '!': { bg: '#201410', border: '#503020', text: '#d08050' },
  '*': { bg: '#151510', border: '#353020', text: '#b0a050' },
}
const TIMEBOX_COLOR = { bg: '#0f1a14', border: '#1e4030', text: '#50b080' }

function dragData(type, payload) {
  return JSON.stringify({ type, ...payload })
}
function parseDrag(e) {
  try { return JSON.parse(e.dataTransfer.getData('text/plain')) } catch { return null }
}

export default function WeekView() {
  const [weekOffset, setWeekOffset] = useState(0)
  const [dragOver, setDragOver] = useState(null) // { date, hour } or { date } for all-day
  const navigate = useNavigate()
  const setActiveDate = useUIStore((s) => s.setActiveDate)
  const entries = useDailyStore((s) => s.entries)
  const timeboxes = useDailyStore((s) => s.timeboxes)
  const { moveEntry, moveTimebox, addTimebox, addEntry } = useDailyStore()
  const today = todayKey()
  const days = getWeekDays(weekOffset)

  const goToDay = (date) => {
    setActiveDate(date)
    navigate('/today')
  }

  // --- Drop handlers ---
  const handleDrop = (e, toDate, toHour) => {
    e.preventDefault()
    setDragOver(null)
    const data = parseDrag(e)
    if (!data) return

    if (data.type === 'entry') {
      if (toHour != null) {
        // Move entry to new day, create a timebox block at that hour
        moveEntry(data.fromDate, data.id, toDate)
        addTimebox(toDate, toHour, data.text)
      } else {
        moveEntry(data.fromDate, data.id, toDate)
      }
    } else if (data.type === 'timebox') {
      moveTimebox(data.fromDate, data.fromHour, toDate, toHour ?? data.fromHour)
    }
  }

  const handleDragOver = (e, date, hour) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOver(hour != null ? `${date}-${hour}` : `${date}-allday`)
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', fontFamily: 'var(--font)' }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 16px', borderBottom: '1px solid var(--border-dim)', flexShrink: 0,
      }}>
        <button onClick={() => setWeekOffset(w => w - 1)} style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>‹ PREV</button>
        <span style={{ fontSize: 9, letterSpacing: '0.1em', color: 'var(--text-tertiary)' }}>
          WEEK {weekOffset === 0 ? '(CURRENT)' : weekOffset > 0 ? `+${weekOffset}` : weekOffset}
        </span>
        <button onClick={() => setWeekOffset(w => w + 1)} style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>NEXT ›</button>
      </div>

      <div style={{ flex: 1, overflow: 'auto', scrollbarWidth: 'thin', scrollbarColor: 'var(--border-dim) transparent' }}>
        {/* Sticky day headers */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: `${TIME_COL_W}px repeat(7, 1fr)`,
          position: 'sticky', top: 0, zIndex: 10,
          background: 'var(--bg-s1)', borderBottom: '1px solid var(--border-dim)',
        }}>
          <div /> {/* time col spacer */}
          {days.map((date) => {
            const isToday = date === today
            return (
              <div
                key={date}
                onClick={() => goToDay(date)}
                style={{
                  padding: '6px 8px', borderLeft: '1px solid var(--border-dim)',
                  cursor: 'pointer', textAlign: 'center',
                  background: isToday ? 'var(--bg-s3)' : 'transparent',
                }}
              >
                <div style={{ fontSize: 8, letterSpacing: '0.1em', color: 'var(--text-ghost)' }}>
                  {getDayLabel(date)}
                </div>
                <div style={{
                  fontSize: 15, fontWeight: isToday ? 500 : 300, marginTop: 1,
                  color: isToday ? 'var(--text-primary)' : 'var(--text-tertiary)',
                  lineHeight: 1,
                }}>
                  {new Date(date + 'T00:00:00').getDate()}
                </div>
              </div>
            )
          })}
        </div>

        {/* All-day row — unscheduled entries */}
        <div style={{
          display: 'grid', gridTemplateColumns: `${TIME_COL_W}px repeat(7, 1fr)`,
          borderBottom: '2px solid var(--border-dim)', minHeight: 36,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 8 }}>
            <span style={{ fontSize: 7, color: 'var(--text-ghost)', letterSpacing: '0.1em' }}>ALL DAY</span>
          </div>
          {days.map((date) => {
            const isToday = date === today
            const unscheduled = (entries[date] || []).filter(e => e.sigil !== '×' && e.sigil !== '>')
            const dropKey = `${date}-allday`
            const isOver = dragOver === dropKey
            return (
              <div
                key={date}
                onDragOver={(e) => handleDragOver(e, date, null)}
                onDragLeave={() => setDragOver(null)}
                onDrop={(e) => handleDrop(e, date, null)}
                style={{
                  borderLeft: '1px solid var(--border-dim)',
                  background: isOver ? 'var(--bg-s3)' : isToday ? 'var(--bg-s2)' : 'transparent',
                  padding: '3px 4px', minHeight: 36, transition: 'background 80ms',
                }}
              >
                {unscheduled.map(entry => (
                  <EntryChip key={entry.id} entry={entry} date={date} />
                ))}
              </div>
            )
          })}
        </div>

        {/* Hourly time grid */}
        <div style={{ position: 'relative' }}>
          {HOURS.map((hour) => {
            const label = `${String(hour).padStart(2, '0')}:00`
            return (
              <div
                key={hour}
                style={{
                  display: 'grid',
                  gridTemplateColumns: `${TIME_COL_W}px repeat(7, 1fr)`,
                  height: ROW_H,
                  borderBottom: '1px solid var(--border-dim)',
                }}
              >
                {/* Time label */}
                <div style={{
                  display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end',
                  paddingRight: 8, paddingTop: 3,
                  fontSize: 8, color: 'var(--text-ghost)', letterSpacing: '0.05em',
                  flexShrink: 0,
                }}>
                  {label}
                </div>

                {days.map((date) => {
                  const isToday = date === today
                  const block = timeboxes[date]?.[hour]
                  const dropKey = `${date}-${hour}`
                  const isOver = dragOver === dropKey

                  return (
                    <div
                      key={date}
                      onDragOver={(e) => handleDragOver(e, date, hour)}
                      onDragLeave={() => setDragOver(null)}
                      onDrop={(e) => handleDrop(e, date, hour)}
                      style={{
                        borderLeft: '1px solid var(--border-dim)',
                        background: isOver
                          ? '#0f1a20'
                          : isToday ? 'var(--bg-s2)' : 'transparent',
                        position: 'relative',
                        transition: 'background 80ms',
                        outline: isOver ? '1px solid #1e4060' : 'none',
                      }}
                    >
                      {block && <TimeboxChip block={block} date={date} hour={hour} />}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function EntryChip({ entry, date }) {
  const colors = ENTRY_COLORS[entry.sigil] || ENTRY_COLORS['—']
  const isDone = entry.done || entry.sigil === '×'

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', dragData('entry', {
          id: entry.id, fromDate: date, text: entry.text, sigil: entry.sigil,
        }))
        e.dataTransfer.effectAllowed = 'move'
      }}
      title={entry.text}
      style={{
        fontSize: 9, padding: '1px 5px', marginBottom: 2, borderRadius: 2,
        background: isDone ? 'transparent' : colors.bg,
        border: `1px solid ${isDone ? 'var(--border-dim)' : colors.border}`,
        color: isDone ? 'var(--text-dead)' : colors.text,
        textDecoration: isDone ? 'line-through' : 'none',
        cursor: 'grab', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        maxWidth: '100%', userSelect: 'none',
        transition: 'opacity 80ms',
      }}
      onDragEnd={(e) => { e.currentTarget.style.opacity = '1' }}
    >
      <span style={{ opacity: 0.6, marginRight: 3 }}>{entry.sigil}</span>
      {entry.text}
    </div>
  )
}

function TimeboxChip({ block, date, hour }) {
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', dragData('timebox', {
          fromDate: date, fromHour: hour, label: block.label,
        }))
        e.dataTransfer.effectAllowed = 'move'
      }}
      title={block.label}
      style={{
        position: 'absolute', inset: '2px 3px',
        background: TIMEBOX_COLOR.bg,
        border: `1px solid ${TIMEBOX_COLOR.border}`,
        borderLeft: `2px solid ${TIMEBOX_COLOR.border}`,
        borderRadius: 2,
        padding: '2px 5px',
        fontSize: 9, color: TIMEBOX_COLOR.text,
        cursor: 'grab', overflow: 'hidden',
        textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        userSelect: 'none',
      }}
    >
      {block.label}
    </div>
  )
}

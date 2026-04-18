import { useState } from 'react'
import useHabitStore from '../../stores/useHabitStore'
import { getPast90Days, todayKey, getWeekDays } from '../../lib/dates'
import SectionHeader from '../shared/SectionHeader'

const BARS = '▁▂▃▄▅▆▇█'

function intensityColor(count) {
  if (count === 0) return 'var(--bg-s3)'
  const levels = ['#1a1a1d', '#232327', '#2e2e33', '#3c3c43', '#4e4e57', '#64646f', '#7e7e8a', '#9e9ea8']
  return levels[Math.min(count, 7)]
}

function getStreak(checkins, habitId, today) {
  let streak = 0
  const d = new Date(today + 'T00:00:00')
  while (true) {
    const key = d.toISOString().slice(0, 10)
    if ((checkins[key] || []).includes(habitId)) { streak++; d.setDate(d.getDate() - 1) }
    else break
  }
  return streak
}

function getBest(checkins, habitId, days90) {
  let best = 0, current = 0
  days90.forEach((d) => {
    if ((checkins[d] || []).includes(habitId)) { current++; best = Math.max(best, current) }
    else current = 0
  })
  return best
}

function getRate(checkins, habitId, days90) {
  const done = days90.filter((d) => (checkins[d] || []).includes(habitId)).length
  return Math.round((done / 90) * 100)
}

function getWeeklyBars(checkins, habitId) {
  const today = todayKey()
  const d = new Date(today + 'T00:00:00')
  d.setDate(d.getDate() - (7 * 8 - 1))

  const weeks = []
  for (let w = 0; w < 8; w++) {
    let count = 0
    for (let day = 0; day < 7; day++) {
      const key = d.toISOString().slice(0, 10)
      if ((checkins[key] || []).includes(habitId)) count++
      d.setDate(d.getDate() + 1)
    }
    weeks.push(count)
  }
  return weeks
}

export default function HabitsView() {
  const habits = useHabitStore((s) => s.habits)
  const checkins = useHabitStore((s) => s.checkins)
  const addHabit = useHabitStore((s) => s.addHabit)
  const removeHabit = useHabitStore((s) => s.removeHabit)
  const toggleCheckin = useHabitStore((s) => s.toggleCheckin)

  const [newHabit, setNewHabit] = useState('')
  const today = todayKey()
  const days90 = getPast90Days()

  const handleAdd = (e) => {
    e.preventDefault()
    if (!newHabit.trim()) return
    addHabit(newHabit.trim())
    setNewHabit('')
  }

  return (
    <div style={{
      flex: 1, overflowY: 'auto', padding: '16px',
      scrollbarWidth: 'thin', scrollbarColor: 'var(--border-dim) transparent',
    }}>
      {/* Add form */}
      <form onSubmit={handleAdd} style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <input
          value={newHabit}
          onChange={(e) => setNewHabit(e.target.value)}
          placeholder="new habit name..."
          style={{
            flex: 1, padding: '5px 9px', fontSize: 11,
            background: 'var(--bg-s2)', border: '1px solid var(--border-dim)',
            borderRadius: 2, color: 'var(--text-primary)',
          }}
          onFocus={(e) => (e.target.style.borderColor = 'var(--border-bright)')}
          onBlur={(e) => (e.target.style.borderColor = 'var(--border-dim)')}
        />
        <button
          type="submit"
          style={{
            padding: '5px 12px', fontSize: 9, letterSpacing: '0.08em',
            border: '1px solid var(--border-mid)', borderRadius: 2,
            color: 'var(--text-secondary)',
          }}
        >
          ADD
        </button>
      </form>

      {habits.length === 0 && (
        <div style={{ fontSize: 10, color: 'var(--text-ghost)', textAlign: 'center', padding: 32 }}>
          no habits yet — add one above
        </div>
      )}

      {habits.map((habit) => {
        const streak = getStreak(checkins, habit.id, today)
        const best = getBest(checkins, habit.id, days90)
        const rate = getRate(checkins, habit.id, days90)
        const weekBars = getWeeklyBars(checkins, habit.id)

        return (
          <div key={habit.id} style={{
            marginBottom: 24, padding: '12px', background: 'var(--bg-s1)',
            border: '1px solid var(--border-dim)', borderRadius: 4,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 11, color: 'var(--text-primary)', fontWeight: 400 }}>
                {habit.name}
              </span>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <span style={{ fontSize: 8, color: 'var(--text-ghost)' }}>streak <span style={{ color: 'var(--text-tertiary)' }}>{streak}d</span></span>
                <span style={{ fontSize: 8, color: 'var(--text-ghost)' }}>best <span style={{ color: 'var(--text-tertiary)' }}>{best}d</span></span>
                <span style={{ fontSize: 8, color: 'var(--text-ghost)' }}>rate <span style={{ color: 'var(--text-tertiary)' }}>{rate}%</span></span>
                <button
                  onClick={() => removeHabit(habit.id)}
                  style={{ fontSize: 8, color: 'var(--text-dead)' }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* 90-day heatmap */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2, marginBottom: 8 }}>
              {days90.map((d) => {
                const done = (checkins[d] || []).includes(habit.id)
                const isToday = d === today
                return (
                  <button
                    key={d}
                    onClick={() => toggleCheckin(d, habit.id)}
                    title={d}
                    style={{
                      width: 9, height: 9, borderRadius: 1,
                      background: done ? 'var(--text-secondary)' : intensityColor(0),
                      border: isToday ? '1px solid var(--border-bright)' : '1px solid transparent',
                      cursor: 'pointer', padding: 0,
                      transition: 'background var(--transition)',
                    }}
                  />
                )
              })}
            </div>

            {/* ASCII bar chart */}
            <div style={{ fontFamily: 'var(--font)', fontSize: 10, color: 'var(--text-tertiary)', letterSpacing: 2 }}>
              {weekBars.map((v, i) => {
                const barIdx = Math.floor((v / 7) * 7)
                return <span key={i}>{BARS[barIdx] || BARS[0]}</span>
              })}
              <span style={{ fontSize: 8, color: 'var(--text-ghost)', marginLeft: 6, letterSpacing: '0.05em' }}>
                8w
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

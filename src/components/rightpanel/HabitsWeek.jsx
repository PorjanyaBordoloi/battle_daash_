import useHabitStore from '../../stores/useHabitStore'
import { getWeekDays, todayKey, getDayLabel } from '../../lib/dates'
import SectionHeader from '../shared/SectionHeader'

export default function HabitsWeek() {
  const habits = useHabitStore((s) => s.habits)
  const checkins = useHabitStore((s) => s.checkins)
  const toggleCheckin = useHabitStore((s) => s.toggleCheckin)
  const today = todayKey()
  const weekDays = getWeekDays(0)

  const totalPossible = habits.length * 7
  const totalDone = weekDays.reduce((acc, d) => {
    return acc + habits.filter((h) => (checkins[d] || []).includes(h.id)).length
  }, 0)
  const pct = totalPossible > 0 ? Math.round((totalDone / totalPossible) * 100) : 0

  const getStreak = (habitId) => {
    let streak = 0
    const d = new Date(today + 'T00:00:00')
    while (true) {
      const key = d.toISOString().slice(0, 10)
      if ((checkins[key] || []).includes(habitId)) { streak++; d.setDate(d.getDate() - 1) }
      else break
    }
    return streak
  }

  return (
    <div style={{ padding: '10px 12px' }}>
      <SectionHeader label={`HABITS · ${pct}% THIS WEEK`} />
      {habits.length === 0 && (
        <div style={{ fontSize: 9, color: 'var(--text-ghost)' }}>no habits — add in habits tab</div>
      )}
      {habits.map((habit) => {
        const streak = getStreak(habit.id)
        return (
          <div key={habit.id} style={{ marginBottom: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
              <span style={{
                fontSize: 9, color: 'var(--text-secondary)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 100,
              }}>
                {habit.name}
              </span>
              <span style={{ fontSize: 8, color: 'var(--text-ghost)', letterSpacing: '0.05em' }}>
                {streak > 0 ? `${streak}d` : '—'}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 2 }}>
              {weekDays.map((d) => {
                const done = (checkins[d] || []).includes(habit.id)
                const isToday = d === today
                return (
                  <button
                    key={d}
                    onClick={() => toggleCheckin(d, habit.id)}
                    title={`${getDayLabel(d)} — ${done ? 'done' : 'not done'}`}
                    style={{
                      width: 20, height: 20, borderRadius: 2,
                      border: isToday && !done
                        ? '1px solid var(--border-bright)'
                        : '1px solid var(--border-dim)',
                      background: done ? 'var(--text-primary)' : 'transparent',
                      cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 7, color: done ? 'var(--bg-base)' : 'var(--text-ghost)',
                      transition: 'all var(--transition)',
                    }}
                  >
                    {getDayLabel(d).slice(0, 1)}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

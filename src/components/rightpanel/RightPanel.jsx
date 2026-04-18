import MiniCalendar from './MiniCalendar'
import HabitsWeek from './HabitsWeek'
import PomodoroTimer from './PomodoroTimer'
import DailyReview from './DailyReview'

export default function RightPanel() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflowY: 'auto',
      scrollbarWidth: 'thin',
      scrollbarColor: 'var(--border-dim) transparent',
      background: 'var(--bg-s1)',
    }}>
      <MiniCalendar />
      <div style={{ height: 1, background: 'var(--border-dim)' }} />
      <HabitsWeek />
      <div style={{ height: 1, background: 'var(--border-dim)' }} />
      <PomodoroTimer />
      <div style={{ height: 1, background: 'var(--border-dim)' }} />
      <DailyReview />
    </div>
  )
}

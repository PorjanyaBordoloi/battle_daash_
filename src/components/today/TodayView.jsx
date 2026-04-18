import { useEffect } from 'react'
import BulletLog from './BulletLog'
import TimeboxGrid from './TimeboxGrid'
import useUIStore from '../../stores/useUIStore'
import { todayKey } from '../../lib/dates'

export default function TodayView() {
  const setActiveDate = useUIStore((s) => s.setActiveDate)

  useEffect(() => {
    setActiveDate(todayKey())
  }, [])

  return (
    <div style={{
      flex: 1,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{
        flex: 1,
        overflowY: 'auto',
        scrollbarWidth: 'thin',
        scrollbarColor: 'var(--border-dim) transparent',
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
      }}>
        <BulletLog />
        <TimeboxGrid />
      </div>
    </div>
  )
}

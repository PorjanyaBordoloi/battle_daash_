import TimeboxBlock from './TimeboxBlock'
import SectionHeader from '../shared/SectionHeader'
import useUIStore from '../../stores/useUIStore'

const HOURS = Array.from({ length: 18 }, (_, i) => i + 6) // 6 to 23

export default function TimeboxGrid({ date: propDate }) {
  const activeDate = useUIStore((s) => s.activeDate)
  const date = propDate || activeDate

  return (
    <div style={{ padding: '12px 16px' }}>
      <SectionHeader label="TIMEBOX · TODAY" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {HOURS.map((hour) => (
          <div key={hour} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              width: 32,
              fontSize: 9,
              color: 'var(--text-tertiary)',
              textAlign: 'right',
              flexShrink: 0,
              letterSpacing: '0.05em',
            }}>
              {String(hour).padStart(2, '0')}:00
            </span>
            <TimeboxBlock hour={hour} date={date} />
          </div>
        ))}
      </div>
    </div>
  )
}

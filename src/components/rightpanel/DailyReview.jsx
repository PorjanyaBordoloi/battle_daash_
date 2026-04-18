import { useState, useEffect } from 'react'
import useDailyStore from '../../stores/useDailyStore'
import useUIStore from '../../stores/useUIStore'
import SectionHeader from '../shared/SectionHeader'

export default function DailyReview() {
  const activeDate = useUIStore((s) => s.activeDate)
  const reviews = useDailyStore((s) => s.reviews)
  const setReview = useDailyStore((s) => s.setReview)

  const review = reviews[activeDate] || {}
  const [needle, setNeedle] = useState(review.needle || '')
  const [migrate, setMigrate] = useState(review.migrate || '')

  useEffect(() => {
    const r = reviews[activeDate] || {}
    setNeedle(r.needle || '')
    setMigrate(r.migrate || '')
  }, [activeDate])

  return (
    <div style={{ padding: '10px 12px' }}>
      <SectionHeader label="DAILY REVIEW" />

      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 8, color: 'var(--text-ghost)', letterSpacing: '0.08em', marginBottom: 3 }}>
          WHAT MOVED THE NEEDLE TODAY?
        </div>
        <textarea
          value={needle}
          onChange={(e) => setNeedle(e.target.value)}
          onBlur={() => setReview(activeDate, 'needle', needle)}
          rows={3}
          style={{
            width: '100%', fontSize: 10, padding: '5px 7px',
            background: 'var(--bg-s2)', border: '1px solid var(--border-dim)',
            borderRadius: 2, color: 'var(--text-primary)',
            resize: 'none', lineHeight: 1.5,
          }}
          onFocus={(e) => (e.target.style.borderColor = 'var(--border-bright)')}
        />
      </div>

      <div>
        <div style={{ fontSize: 8, color: 'var(--text-ghost)', letterSpacing: '0.08em', marginBottom: 3 }}>
          WHAT GETS MIGRATED TO TOMORROW?
        </div>
        <textarea
          value={migrate}
          onChange={(e) => setMigrate(e.target.value)}
          onBlur={() => setReview(activeDate, 'migrate', migrate)}
          rows={3}
          style={{
            width: '100%', fontSize: 10, padding: '5px 7px',
            background: 'var(--bg-s2)', border: '1px solid var(--border-dim)',
            borderRadius: 2, color: 'var(--text-primary)',
            resize: 'none', lineHeight: 1.5,
          }}
          onFocus={(e) => (e.target.style.borderColor = 'var(--border-bright)')}
        />
      </div>
    </div>
  )
}

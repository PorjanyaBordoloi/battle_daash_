import { useEffect, useRef, useState } from 'react'
import useDailyStore from '../../stores/useDailyStore'
import useUIStore from '../../stores/useUIStore'
import BulletEntry from './BulletEntry'
import SectionHeader from '../shared/SectionHeader'
import { formatDateLong } from '../../lib/dates'

const SIGILS = ['·', '×', '>', '<', '○', '—', '!', '*']

function parseSigilAndText(raw) {
  const parts = raw.trim().split(' ')
  if (parts.length > 1 && SIGILS.includes(parts[0])) {
    return { sigil: parts[0], text: parts.slice(1).join(' ') }
  }
  return { sigil: '·', text: raw.trim() }
}

export default function BulletLog({ date: propDate }) {
  const activeDate = useUIStore((s) => s.activeDate)
  const date = propDate || activeDate
  const entries = useDailyStore((s) => s.entries[date] || [])
  const addEntry = useDailyStore((s) => s.addEntry)
  const [input, setInput] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'n' && e.target.tagName === 'BODY') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!input.trim()) return
    const { sigil, text } = parseSigilAndText(input)
    addEntry(date, { sigil, text })
    setInput('')
  }

  return (
    <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-dim)' }}>
      <div style={{ marginBottom: 10 }}>
        <SectionHeader label={`${formatDateLong(date)} · DAILY LOG`} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {entries.length === 0 && (
          <div style={{ fontSize: 10, color: 'var(--text-ghost)', padding: '4px 0', fontStyle: 'italic' }}>
            no entries yet — type below to add
          </div>
        )}
        {entries.map((entry) => (
          <BulletEntry key={entry.id} entry={entry} date={date} />
        ))}
      </div>

      <form onSubmit={handleSubmit} style={{ marginTop: 8 }}>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="· task  × done  > migrate  ○ event  — note  ! urgent  * idea"
          style={{
            width: '100%',
            padding: '5px 8px',
            fontSize: 11,
            background: 'var(--bg-s2)',
            border: '1px solid var(--border-dim)',
            borderRadius: 2,
            color: 'var(--text-primary)',
          }}
          onFocus={(e) => (e.target.style.borderColor = 'var(--border-bright)')}
          onBlur={(e) => (e.target.style.borderColor = 'var(--border-dim)')}
        />
      </form>
    </div>
  )
}

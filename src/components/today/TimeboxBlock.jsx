import { useState, useRef } from 'react'
import useDailyStore from '../../stores/useDailyStore'

export default function TimeboxBlock({ hour, date }) {
  const timeboxes = useDailyStore((s) => s.timeboxes[date] || {})
  const updateTimebox = useDailyStore((s) => s.updateTimebox)
  const deleteTimebox = useDailyStore((s) => s.deleteTimebox)
  const block = timeboxes[hour] || null

  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState('')
  const inputRef = useRef(null)

  const startEdit = () => {
    setValue(block?.label || '')
    setEditing(true)
    setTimeout(() => inputRef.current?.focus(), 30)
  }

  const save = () => {
    if (value.trim()) {
      updateTimebox(date, hour, value.trim())
    } else if (block) {
      deleteTimebox(date, hour)
    }
    setEditing(false)
  }

  const handleKey = (e) => {
    if (e.key === 'Enter') save()
    if (e.key === 'Escape') setEditing(false)
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKey}
        onBlur={save}
        style={{
          flex: 1, padding: '3px 8px', fontSize: 11,
          background: 'var(--bg-s2)',
          border: '1px solid var(--text-primary)',
          borderLeft: '2px solid var(--text-primary)',
          borderRadius: 2,
          color: 'var(--text-primary)',
        }}
      />
    )
  }

  if (block) {
    return (
      <div
        onClick={startEdit}
        style={{
          flex: 1, padding: '3px 8px', fontSize: 11,
          background: 'var(--bg-s3)',
          border: '1px solid var(--border-dim)',
          borderRadius: 2,
          color: 'var(--text-secondary)',
          cursor: 'text',
          minHeight: 22,
          transition: 'border-color var(--transition)',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--border-mid)')}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-dim)')}
      >
        {block.label}
      </div>
    )
  }

  return (
    <div
      onClick={startEdit}
      style={{
        flex: 1, padding: '3px 8px', fontSize: 9,
        border: '1px dashed var(--border-dim)',
        borderRadius: 2,
        color: 'var(--text-ghost)',
        cursor: 'text',
        minHeight: 22,
        display: 'flex',
        alignItems: 'center',
        letterSpacing: '0.08em',
        transition: 'border-color var(--transition)',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--border-mid)')}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-dim)')}
    >
      — open —
    </div>
  )
}

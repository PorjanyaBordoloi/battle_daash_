import { useRef } from 'react'
import useDailyStore from '../../stores/useDailyStore'
import useUIStore from '../../stores/useUIStore'
import useConfigStore from '../../stores/useConfigStore'
import { addDays } from '../../lib/dates'
import { breakDownTask } from '../../lib/gemini'

const sigilColors = {
  '·': 'var(--text-tertiary)',
  '×': 'var(--text-ghost)',
  '>': 'var(--text-secondary)',
  '<': 'var(--text-tertiary)',
  '○': 'var(--text-secondary)',
  '—': 'var(--text-ghost)',
  '!': 'var(--text-primary)',
  '*': 'var(--text-secondary)',
}

export default function BulletEntry({ entry, date }) {
  const { toggleDone, migrateEntry, addEntry } = useDailyStore()
  const { setContextMenu, contextMenu } = useUIStore()
  const geminiKey = useConfigStore((s) => s.geminiKey)

  const handleSigilClick = () => {
    if (entry.sigil === '·' || entry.sigil === '×') {
      toggleDone(date, entry.id)
    }
  }

  const handleContextMenu = (e) => {
    e.preventDefault()
    const items = [
      {
        label: 'migrate to tomorrow',
        action: () => {
          migrateEntry(date, entry.id, addDays(date, 1))
          setContextMenu(null)
        },
      },
      geminiKey
        ? {
            label: 'break down (AI)',
            action: async () => {
              setContextMenu(null)
              const subtasks = await breakDownTask(geminiKey, entry.text)
              subtasks.forEach((text) => addEntry(date, { sigil: '·', text, indent: (entry.indent || 0) + 1 }))
            },
          }
        : null,
      {
        label: 'delete',
        action: () => {
          useDailyStore.getState().deleteEntry(date, entry.id)
          setContextMenu(null)
        },
      },
    ].filter(Boolean)

    setContextMenu({ x: e.clientX, y: e.clientY, items })
  }

  const isDone = entry.done || entry.sigil === '×'

  return (
    <div
      onContextMenu={handleContextMenu}
      style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: 6,
        padding: '2px 0',
        paddingLeft: (entry.indent || 0) * 16,
        userSelect: 'none',
      }}
    >
      <span
        onClick={handleSigilClick}
        style={{
          fontSize: 11,
          width: 12,
          flexShrink: 0,
          color: isDone ? 'var(--text-dead)' : (sigilColors[entry.sigil] || 'var(--text-tertiary)'),
          cursor: entry.sigil === '·' || entry.sigil === '×' ? 'pointer' : 'default',
          fontWeight: 300,
          lineHeight: 1.4,
        }}
      >
        {isDone ? '×' : entry.sigil}
      </span>
      <span
        style={{
          fontSize: 11,
          color: isDone ? 'var(--text-dead)' : 'var(--text-primary)',
          textDecoration: isDone ? 'line-through' : 'none',
          flex: 1,
          lineHeight: 1.5,
        }}
      >
        {entry.text}
      </span>
      {entry.migratedTo && (
        <span className="pill" style={{ fontSize: 8 }}>→ {entry.migratedTo}</span>
      )}
    </div>
  )
}

// Context menu portal
export function ContextMenu() {
  const { contextMenu, setContextMenu } = useUIStore()

  if (!contextMenu) return null

  return (
    <>
      <div
        onClick={() => setContextMenu(null)}
        style={{ position: 'fixed', inset: 0, zIndex: 500 }}
      />
      <div
        style={{
          position: 'fixed',
          left: contextMenu.x,
          top: contextMenu.y,
          background: 'var(--bg-s3)',
          border: '1px solid var(--border-mid)',
          borderRadius: 3,
          zIndex: 501,
          minWidth: 160,
          overflow: 'hidden',
        }}
      >
        {contextMenu.items.map((item, i) => (
          <button
            key={i}
            onClick={item.action}
            style={{
              display: 'block',
              width: '100%',
              textAlign: 'left',
              padding: '6px 12px',
              fontSize: 10,
              color: 'var(--text-secondary)',
              letterSpacing: '0.05em',
              borderBottom: i < contextMenu.items.length - 1 ? '1px solid var(--border-dim)' : 'none',
            }}
            onMouseEnter={(e) => { e.target.style.background = 'var(--bg-s4)'; e.target.style.color = 'var(--text-primary)' }}
            onMouseLeave={(e) => { e.target.style.background = 'transparent'; e.target.style.color = 'var(--text-secondary)' }}
          >
            {item.label}
          </button>
        ))}
      </div>
    </>
  )
}

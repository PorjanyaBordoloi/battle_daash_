import { useState } from 'react'
import useProjectStore from '../../stores/useProjectStore'
import ProjectCard from './ProjectCard'
import SectionHeader from '../shared/SectionHeader'

export default function KanbanColumn({ status, title, isDragOver }) {
  const projects = useProjectStore((s) => s.projects.filter((p) => p.status === status))
  const addProject = useProjectStore((s) => s.addProject)
  const [adding, setAdding] = useState(false)
  const [newTitle, setNewTitle] = useState('')

  const handleAdd = (e) => {
    e.preventDefault()
    if (!newTitle.trim()) return
    addProject({ title: newTitle.trim(), status })
    setNewTitle('')
    setAdding(false)
  }

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: isDragOver ? 'var(--bg-s2)' : 'transparent',
      transition: 'background var(--transition)',
    }}>
      <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border-dim)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 9, letterSpacing: '0.1em', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
            {title}
          </span>
          <span className="pill">{projects.length}</span>
        </div>
      </div>

      <div style={{
        flex: 1, overflowY: 'auto', padding: '8px',
        scrollbarWidth: 'thin', scrollbarColor: 'var(--border-dim) transparent',
        display: 'flex', flexDirection: 'column', gap: 6,
      }}>
        {projects.map((p) => (
          <ProjectCard key={p.id} project={p} />
        ))}

        {adding ? (
          <form onSubmit={handleAdd}>
            <input
              autoFocus
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onBlur={() => { if (!newTitle.trim()) setAdding(false) }}
              onKeyDown={(e) => e.key === 'Escape' && setAdding(false)}
              placeholder="project title..."
              style={{
                width: '100%', padding: '5px 8px', fontSize: 11,
                background: 'var(--bg-s2)', border: '1px solid var(--border-bright)',
                borderRadius: 3, color: 'var(--text-primary)',
              }}
            />
          </form>
        ) : (
          <button
            onClick={() => setAdding(true)}
            style={{
              width: '100%', padding: '5px 8px', fontSize: 9,
              border: '1px dashed var(--border-dim)', borderRadius: 3,
              color: 'var(--text-ghost)', letterSpacing: '0.08em',
              textAlign: 'left', transition: 'all var(--transition)',
            }}
            onMouseEnter={(e) => { e.target.style.borderColor = 'var(--border-mid)'; e.target.style.color = 'var(--text-tertiary)' }}
            onMouseLeave={(e) => { e.target.style.borderColor = 'var(--border-dim)'; e.target.style.color = 'var(--text-ghost)' }}
          >
            + new project
          </button>
        )}
      </div>
    </div>
  )
}

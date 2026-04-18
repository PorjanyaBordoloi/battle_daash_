import { useState } from 'react'
import useProjectStore from '../../stores/useProjectStore'

export default function ProjectCard({ project }) {
  const { updateProject, deleteProject, addMilestone, toggleMilestone } = useProjectStore()
  const [expanded, setExpanded] = useState(false)
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleVal, setTitleVal] = useState(project.title)
  const [newTag, setNewTag] = useState('')
  const [newMilestone, setNewMilestone] = useState('')

  const isActive = project.status === 'in-progress'

  const saveTitle = () => {
    if (titleVal.trim()) updateProject(project.id, { title: titleVal.trim() })
    else setTitleVal(project.title)
    setEditingTitle(false)
  }

  const handleDragStart = (e) => {
    e.dataTransfer.setData('projectId', project.id)
    e.dataTransfer.effectAllowed = 'move'
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      style={{
        padding: '8px 10px',
        background: 'var(--bg-s2)',
        border: '1px solid var(--border-dim)',
        borderLeft: isActive ? '2px solid var(--text-primary)' : '1px solid var(--border-dim)',
        borderRadius: 4,
        cursor: 'grab',
        transition: 'border-color var(--transition)',
      }}
      onMouseEnter={(e) => !isActive && (e.currentTarget.style.borderColor = 'var(--border-mid)')}
      onMouseLeave={(e) => !isActive && (e.currentTarget.style.borderColor = 'var(--border-dim)')}
    >
      {/* Title */}
      {editingTitle ? (
        <input
          autoFocus
          value={titleVal}
          onChange={(e) => setTitleVal(e.target.value)}
          onBlur={saveTitle}
          onKeyDown={(e) => { if (e.key === 'Enter') saveTitle(); if (e.key === 'Escape') { setTitleVal(project.title); setEditingTitle(false) } }}
          style={{
            width: '100%', fontSize: 11, padding: '1px 3px',
            background: 'transparent', border: 'none',
            borderBottom: '1px solid var(--border-bright)',
            color: 'var(--text-primary)',
          }}
        />
      ) : (
        <div
          onDoubleClick={() => setEditingTitle(true)}
          style={{ fontSize: 11, color: 'var(--text-primary)', marginBottom: 4, lineHeight: 1.4, cursor: 'text' }}
        >
          {project.title}
        </div>
      )}

      {/* Tags */}
      {project.tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginBottom: 4 }}>
          {project.tags.map((tag) => (
            <span key={tag} className="pill">{tag}</span>
          ))}
        </div>
      )}

      {/* Meta */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 8, color: 'var(--text-ghost)', letterSpacing: '0.05em' }}>
          {project.createdAt}
        </span>
        <button
          onClick={() => setExpanded(!expanded)}
          style={{ fontSize: 8, color: 'var(--text-ghost)', letterSpacing: '0.05em' }}
        >
          {expanded ? '▲' : '▼'}
        </button>
      </div>

      {/* Expanded: milestones */}
      {expanded && (
        <div style={{ marginTop: 8, borderTop: '1px solid var(--border-dim)', paddingTop: 8 }}>
          {project.milestones.map((m) => (
            <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
              <button
                onClick={() => toggleMilestone(project.id, m.id)}
                style={{
                  width: 10, height: 10, borderRadius: 1,
                  border: '1px solid var(--border-mid)',
                  background: m.done ? 'var(--text-primary)' : 'transparent',
                  flexShrink: 0,
                }}
              />
              <span style={{
                fontSize: 9, color: m.done ? 'var(--text-ghost)' : 'var(--text-secondary)',
                textDecoration: m.done ? 'line-through' : 'none',
              }}>
                {m.text}
              </span>
            </div>
          ))}
          <form onSubmit={(e) => {
            e.preventDefault()
            if (newMilestone.trim()) { addMilestone(project.id, newMilestone.trim()); setNewMilestone('') }
          }}>
            <input
              value={newMilestone}
              onChange={(e) => setNewMilestone(e.target.value)}
              placeholder="+ milestone..."
              style={{
                width: '100%', fontSize: 9, padding: '3px 5px', marginTop: 4,
                background: 'var(--bg-s3)', border: '1px solid var(--border-dim)',
                borderRadius: 2, color: 'var(--text-primary)',
              }}
            />
          </form>
          <button
            onClick={() => deleteProject(project.id)}
            style={{ marginTop: 6, fontSize: 8, color: 'var(--text-ghost)', letterSpacing: '0.05em' }}
          >
            delete project
          </button>
        </div>
      )}
    </div>
  )
}

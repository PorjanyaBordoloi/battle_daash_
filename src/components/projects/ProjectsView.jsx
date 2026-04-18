import { useState } from 'react'
import KanbanColumn from './KanbanColumn'
import useProjectStore from '../../stores/useProjectStore'

const COLUMNS = [
  { status: 'backlog', title: 'BACKLOG' },
  { status: 'in-progress', title: 'IN PROGRESS' },
  { status: 'done', title: 'DONE' },
]

export default function ProjectsView() {
  const [dragOver, setDragOver] = useState(null)
  const moveProject = useProjectStore((s) => s.moveProject)

  const handleDrop = (e, status) => {
    e.preventDefault()
    const id = e.dataTransfer.getData('projectId')
    if (id) moveProject(id, status)
    setDragOver(null)
  }

  return (
    <div style={{
      flex: 1, display: 'flex', overflow: 'hidden',
    }}>
      {COLUMNS.map((col) => (
        <div
          key={col.status}
          style={{ flex: 1, borderRight: '1px solid var(--border-dim)' }}
          onDragOver={(e) => { e.preventDefault(); setDragOver(col.status) }}
          onDragLeave={() => setDragOver(null)}
          onDrop={(e) => handleDrop(e, col.status)}
        >
          <KanbanColumn
            status={col.status}
            title={col.title}
            isDragOver={dragOver === col.status}
          />
        </div>
      ))}
    </div>
  )
}

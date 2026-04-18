import { useState } from 'react'
import useMusicStore from '../../stores/useMusicStore'
import SectionHeader from '../shared/SectionHeader'

const STATUS_COLORS = {
  idea: 'var(--text-ghost)',
  wip: 'var(--text-tertiary)',
  mixing: 'var(--text-secondary)',
  done: 'var(--text-primary)',
}

const STATUS_ORDER = ['idea', 'wip', 'mixing', 'done']

function ProgressBar({ value }) {
  return (
    <div style={{
      height: 2, background: 'var(--bg-s4)', borderRadius: 1, marginTop: 5,
    }}>
      <div style={{
        height: '100%', width: `${value}%`,
        background: value === 100 ? 'var(--text-primary)' : 'var(--text-tertiary)',
        borderRadius: 1, transition: 'width 0.3s',
      }} />
    </div>
  )
}

function TrackCard({ track }) {
  const { updateTrack, deleteTrack } = useMusicStore()
  const [expanded, setExpanded] = useState(false)

  const cycleStatus = () => {
    const idx = STATUS_ORDER.indexOf(track.status)
    updateTrack(track.id, { status: STATUS_ORDER[(idx + 1) % STATUS_ORDER.length] })
  }

  return (
    <div style={{
      padding: '10px 12px', marginBottom: 6,
      background: 'var(--bg-s2)', border: '1px solid var(--border-dim)', borderRadius: 4,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: 'var(--text-primary)', marginBottom: 3 }}>{track.title}</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            {track.key && <span style={{ fontSize: 8, color: 'var(--text-ghost)' }}>{track.key}</span>}
            {track.bpm && <span style={{ fontSize: 8, color: 'var(--text-ghost)' }}>{track.bpm} BPM</span>}
            {track.timeSignature && <span style={{ fontSize: 8, color: 'var(--text-ghost)' }}>{track.timeSignature}</span>}
            {track.daw && <span style={{ fontSize: 8, color: 'var(--text-ghost)' }}>{track.daw}</span>}
          </div>
          <ProgressBar value={track.progress} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
          <button
            onClick={cycleStatus}
            className="pill"
            style={{ color: STATUS_COLORS[track.status], borderColor: STATUS_COLORS[track.status], cursor: 'pointer' }}
          >
            {track.status}
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            style={{ fontSize: 8, color: 'var(--text-ghost)' }}
          >
            {expanded ? '▲' : '▼'}
          </button>
        </div>
      </div>

      {expanded && (
        <div style={{ marginTop: 8, borderTop: '1px solid var(--border-dim)', paddingTop: 8 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
            <label style={{ fontSize: 9, color: 'var(--text-ghost)' }}>
              progress
              <input
                type="range" min={0} max={100} value={track.progress}
                onChange={(e) => updateTrack(track.id, { progress: Number(e.target.value) })}
                style={{ marginLeft: 6, width: 80 }}
              />
              <span style={{ marginLeft: 4, color: 'var(--text-tertiary)' }}>{track.progress}%</span>
            </label>
          </div>
          <button
            onClick={() => deleteTrack(track.id)}
            style={{ fontSize: 8, color: 'var(--text-ghost)', letterSpacing: '0.05em' }}
          >
            delete track
          </button>
        </div>
      )}
    </div>
  )
}

export default function MusicView() {
  const { tracks, sessions, addTrack } = useMusicStore()
  const [showAddTrack, setShowAddTrack] = useState(false)
  const [form, setForm] = useState({ title: '', key: '', bpm: '', timeSignature: '4/4', daw: '' })

  const handleAdd = (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    addTrack({ ...form, bpm: Number(form.bpm) || 120 })
    setForm({ title: '', key: '', bpm: '', timeSignature: '4/4', daw: '' })
    setShowAddTrack(false)
  }

  return (
    <div style={{
      flex: 1, overflowY: 'auto', padding: '16px',
      scrollbarWidth: 'thin', scrollbarColor: 'var(--border-dim) transparent',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <SectionHeader label="TRACKS" />
        <button
          onClick={() => setShowAddTrack(!showAddTrack)}
          style={{ fontSize: 9, color: 'var(--text-tertiary)', border: '1px solid var(--border-dim)', padding: '2px 8px', borderRadius: 2, letterSpacing: '0.08em' }}
        >
          + ADD
        </button>
      </div>

      {showAddTrack && (
        <form onSubmit={handleAdd} style={{
          padding: '10px 12px', background: 'var(--bg-s2)',
          border: '1px solid var(--border-mid)', borderRadius: 4, marginBottom: 12,
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 8 }}>
            {[
              { key: 'title', placeholder: 'title *' },
              { key: 'key', placeholder: 'key (e.g. Am)' },
              { key: 'bpm', placeholder: 'bpm' },
              { key: 'timeSignature', placeholder: 'time sig' },
              { key: 'daw', placeholder: 'daw' },
            ].map((f) => (
              <input
                key={f.key}
                value={form[f.key]}
                onChange={(e) => setForm(s => ({ ...s, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                style={{ padding: '4px 7px', fontSize: 10, borderRadius: 2 }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--border-bright)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border-dim)')}
              />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button type="submit" style={{ fontSize: 9, border: '1px solid var(--border-mid)', padding: '3px 10px', borderRadius: 2, color: 'var(--text-secondary)', letterSpacing: '0.08em' }}>
              CREATE
            </button>
            <button type="button" onClick={() => setShowAddTrack(false)} style={{ fontSize: 9, color: 'var(--text-ghost)', letterSpacing: '0.08em' }}>
              CANCEL
            </button>
          </div>
        </form>
      )}

      {tracks.length === 0 && !showAddTrack && (
        <div style={{ fontSize: 10, color: 'var(--text-ghost)', textAlign: 'center', padding: 24 }}>
          no tracks yet — click + ADD
        </div>
      )}

      {tracks.map((t) => <TrackCard key={t.id} track={t} />)}

      <div style={{ marginTop: 20 }}>
        <SectionHeader label="SESSION LOG" />
        {sessions.length === 0 && (
          <div style={{ fontSize: 9, color: 'var(--text-ghost)' }}>no sessions yet</div>
        )}
        {sessions.map((s) => {
          const track = tracks.find((t) => t.id === s.trackId)
          return (
            <div key={s.id} style={{ display: 'flex', gap: 8, marginBottom: 4, alignItems: 'baseline' }}>
              <span style={{ fontSize: 9, color: 'var(--text-ghost)', flexShrink: 0 }}>{s.date}</span>
              {track && <span style={{ fontSize: 9, color: 'var(--text-tertiary)' }}>{track.title}</span>}
              <span style={{ fontSize: 9, color: 'var(--text-secondary)' }}>{s.duration}m</span>
              {s.notes && <span style={{ fontSize: 9, color: 'var(--text-ghost)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.notes}</span>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

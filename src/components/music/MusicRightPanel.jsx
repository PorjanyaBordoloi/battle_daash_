import { useState } from 'react'
import useMusicStore from '../../stores/useMusicStore'
import SectionHeader from '../shared/SectionHeader'

function asciiBar(value, max = 100, width = 10) {
  const filled = Math.round((value / max) * width)
  return '█'.repeat(filled) + '░'.repeat(width - filled)
}

export default function MusicRightPanel() {
  const { tracks, addSession } = useMusicStore()
  const [form, setForm] = useState({ trackId: '', duration: '', notes: '' })

  const handleLog = (e) => {
    e.preventDefault()
    if (!form.trackId || !form.duration) return
    addSession({ trackId: form.trackId, duration: Number(form.duration), notes: form.notes })
    setForm((s) => ({ ...s, duration: '', notes: '' }))
  }

  const epTracks = tracks.slice(0, 5)

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      overflowY: 'auto', scrollbarWidth: 'thin', scrollbarColor: 'var(--border-dim) transparent',
      background: 'var(--bg-s1)',
    }}>
      {/* EP Tracker */}
      <div style={{ padding: '10px 12px' }}>
        <SectionHeader label="EP TRACKER" />
        {epTracks.length === 0 && (
          <div style={{ fontSize: 9, color: 'var(--text-ghost)' }}>no tracks yet</div>
        )}
        {epTracks.map((t) => (
          <div key={t.id} style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 9, color: 'var(--text-secondary)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {t.title}
            </div>
            <div style={{ fontFamily: 'var(--font)', fontSize: 9, letterSpacing: 1, color: 'var(--text-tertiary)' }}>
              {asciiBar(t.progress)}
            </div>
            <div style={{ fontSize: 8, color: 'var(--text-ghost)', marginTop: 1 }}>{t.progress}%</div>
          </div>
        ))}
      </div>

      <div style={{ height: 1, background: 'var(--border-dim)' }} />

      {/* Quick Session Form */}
      <div style={{ padding: '10px 12px' }}>
        <SectionHeader label="LOG SESSION" />
        <form onSubmit={handleLog}>
          <div style={{ marginBottom: 6 }}>
            <select
              value={form.trackId}
              onChange={(e) => setForm((s) => ({ ...s, trackId: e.target.value }))}
              style={{
                width: '100%', padding: '4px 6px', fontSize: 10,
                background: 'var(--bg-s2)', border: '1px solid var(--border-dim)',
                borderRadius: 2, color: form.trackId ? 'var(--text-primary)' : 'var(--text-ghost)',
              }}
            >
              <option value="">select track...</option>
              {tracks.map((t) => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: 6 }}>
            <input
              type="number"
              value={form.duration}
              onChange={(e) => setForm((s) => ({ ...s, duration: e.target.value }))}
              placeholder="duration (min)"
              style={{
                width: '100%', padding: '4px 6px', fontSize: 10,
                borderRadius: 2,
              }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--border-bright)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--border-dim)')}
            />
          </div>
          <div style={{ marginBottom: 8 }}>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((s) => ({ ...s, notes: e.target.value }))}
              placeholder="notes..."
              rows={2}
              style={{
                width: '100%', padding: '4px 6px', fontSize: 10,
                borderRadius: 2, resize: 'none', lineHeight: 1.5,
              }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--border-bright)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--border-dim)')}
            />
          </div>
          <button
            type="submit"
            style={{
              width: '100%', padding: '5px 0', fontSize: 9,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              border: '1px solid var(--border-mid)', borderRadius: 2,
              color: 'var(--text-secondary)',
              transition: 'all var(--transition)',
            }}
            onMouseEnter={(e) => { e.target.style.borderColor = 'var(--border-bright)'; e.target.style.color = 'var(--text-primary)' }}
            onMouseLeave={(e) => { e.target.style.borderColor = 'var(--border-mid)'; e.target.style.color = 'var(--text-secondary)' }}
          >
            LOG
          </button>
        </form>
      </div>
    </div>
  )
}

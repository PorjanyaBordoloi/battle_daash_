import { useState, useRef } from 'react'
import useMusicStore from '../../stores/useMusicStore'
import useConfigStore from '../../stores/useConfigStore'
import SectionHeader from '../shared/SectionHeader'
import { streamGroq } from '../../lib/groq'

// ─── Design tokens shorthand ────────────────────────────────────────────────
const S = {
  label: { fontSize: 8, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-ghost)', display: 'block', marginBottom: 3 },
  input: {
    width: '100%', padding: '5px 8px', fontSize: 10,
    background: 'var(--bg-s2)', border: '1px solid var(--border-dim)',
    borderRadius: 2, color: 'var(--text-primary)', fontFamily: 'var(--font)',
    outline: 'none', marginBottom: 6,
  },
  btn: {
    fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase',
    border: '1px solid var(--border-mid)', borderRadius: 2, padding: '4px 12px',
    color: 'var(--text-secondary)', fontFamily: 'var(--font)', cursor: 'pointer',
    background: 'none', transition: 'all 100ms',
  },
  pill: (color = 'var(--text-ghost)') => ({
    fontSize: 8, padding: '1px 6px', border: `1px solid ${color}`,
    borderRadius: 2, color, letterSpacing: '0.05em', display: 'inline-block',
  }),
  card: {
    padding: '10px 12px', marginBottom: 6,
    background: 'var(--bg-s2)', border: '1px solid var(--border-dim)',
    borderRadius: 4,
  },
}

const FOCUS_HOVER = (e) => { e.target.style.borderColor = 'var(--border-bright)' }
const BLUR_RESET  = (e) => { e.target.style.borderColor = 'var(--border-dim)' }
const BTN_OVER    = (e) => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = 'var(--border-bright)' }
const BTN_OUT     = (e) => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border-mid)' }

// ─── Tab system ─────────────────────────────────────────────────────────────
const TABS = ['tracks', 'pipeline', 'sessions', 'references', 'guitar', 'ai brain']

// ─── Pipeline stages ─────────────────────────────────────────────────────────
const PIPELINE_STAGES = ['idea', 'production', 'mixing', 'mastering', 'released']
const STAGE_COLORS = {
  idea:       { bg: '#141014', border: '#2a1a40', text: '#7755aa' },
  production: { bg: '#0f1820', border: '#1a3555', text: '#4488cc' },
  mixing:     { bg: '#101814', border: '#1a3525', text: '#44aa66' },
  mastering:  { bg: '#181410', border: '#402a10', text: '#cc8844' },
  released:   { bg: '#101014', border: '#303040', text: '#8888aa' },
}

const SESSION_TYPE_COLORS = {
  production: '#4488cc',
  mixing:     '#44aa66',
  mastering:  '#cc8844',
}

const VIBE_COLORS = {
  dark: '#7755aa', chill: '#4488cc', hype: '#cc4444',
  melancholic: '#5566aa', euphoric: '#aacc44', raw: '#cc8844',
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function ProgressBar({ value }) {
  return (
    <div style={{ height: 2, background: 'var(--bg-s4)', borderRadius: 1, marginTop: 5 }}>
      <div style={{
        height: '100%', width: `${value}%`,
        background: value === 100 ? 'var(--text-primary)' : 'var(--text-tertiary)',
        borderRadius: 1, transition: 'width 0.3s',
      }} />
    </div>
  )
}

function FormField({ label, children }) {
  return (
    <div style={{ marginBottom: 6 }}>
      <span style={S.label}>{label}</span>
      {children}
    </div>
  )
}

// ─── TRACKS TAB ─────────────────────────────────────────────────────────────

const STATUS_COLORS = {
  idea: 'var(--text-ghost)', production: '#4488cc',
  mixing: '#44aa66', mastering: '#cc8844', released: 'var(--text-primary)',
}
const STATUS_ORDER = ['idea', 'production', 'mixing', 'mastering', 'released']

function TrackCard({ track }) {
  const { updateTrack, deleteTrack } = useMusicStore()
  const [expanded, setExpanded] = useState(false)

  const cycleStatus = () => {
    const idx = STATUS_ORDER.indexOf(track.status)
    updateTrack(track.id, { status: STATUS_ORDER[(idx + 1) % STATUS_ORDER.length] })
  }

  const sc = STAGE_COLORS[track.status] || STAGE_COLORS.idea

  return (
    <div style={{
      ...S.card,
      borderLeft: `2px solid ${sc.border}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: 'var(--text-primary)', marginBottom: 4 }}>{track.title}</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            {track.key && <span style={S.pill()}>{track.key}</span>}
            {track.bpm && <span style={S.pill()}>{track.bpm} BPM</span>}
            {track.daw && <span style={S.pill()}>{track.daw}</span>}
            {track.genre && <span style={S.pill(sc.text)}>{track.genre}</span>}
          </div>
          <ProgressBar value={track.progress} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
          <button onClick={cycleStatus} style={{ ...S.pill(sc.text), cursor: 'pointer', background: sc.bg }}>
            {track.status}
          </button>
          <button onClick={() => setExpanded(!expanded)} style={{ fontSize: 8, color: 'var(--text-ghost)' }}>
            {expanded ? '▲' : '▼'}
          </button>
        </div>
      </div>

      {expanded && (
        <div style={{ marginTop: 8, borderTop: '1px solid var(--border-dim)', paddingTop: 8 }}>
          <label style={{ fontSize: 9, color: 'var(--text-ghost)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            progress
            <input
              type="range" min={0} max={100} value={track.progress}
              onChange={(e) => updateTrack(track.id, { progress: Number(e.target.value) })}
              style={{ width: 80, accentColor: 'var(--text-primary)' }}
            />
            <span style={{ color: 'var(--text-tertiary)' }}>{track.progress}%</span>
          </label>
          <div style={{ fontSize: 8, color: 'var(--text-ghost)', marginBottom: 6 }}>
            updated {track.updatedAt}
          </div>
          <button onClick={() => deleteTrack(track.id)} style={{ fontSize: 8, color: 'var(--text-ghost)', letterSpacing: '0.05em' }}>
            delete track
          </button>
        </div>
      )}
    </div>
  )
}

function TracksTab() {
  const { tracks, addTrack } = useMusicStore()
  const [show, setShow] = useState(false)
  const [form, setForm] = useState({ title: '', key: '', bpm: '', timeSignature: '4/4', daw: '', genre: '' })

  const handleAdd = (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    addTrack({ ...form, bpm: Number(form.bpm) || 120 })
    setForm({ title: '', key: '', bpm: '', timeSignature: '4/4', daw: '', genre: '' })
    setShow(false)
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <SectionHeader label="TRACKS" />
        <button style={S.btn} onClick={() => setShow(!show)} onMouseEnter={BTN_OVER} onMouseLeave={BTN_OUT}>+ ADD</button>
      </div>

      {show && (
        <form onSubmit={handleAdd} style={{ ...S.card, border: '1px solid var(--border-mid)', marginBottom: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            {[
              { k: 'title', p: 'title *' }, { k: 'genre', p: 'genre' },
              { k: 'key', p: 'key (e.g. Am)' }, { k: 'bpm', p: 'bpm' },
              { k: 'daw', p: 'daw' }, { k: 'timeSignature', p: 'time sig' },
            ].map(({ k, p }) => (
              <input key={k} value={form[k]} onChange={(e) => setForm(s => ({ ...s, [k]: e.target.value }))}
                placeholder={p} style={S.input} onFocus={FOCUS_HOVER} onBlur={BLUR_RESET} />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button type="submit" style={S.btn} onMouseEnter={BTN_OVER} onMouseLeave={BTN_OUT}>CREATE</button>
            <button type="button" onClick={() => setShow(false)} style={{ ...S.btn, borderColor: 'transparent', color: 'var(--text-ghost)' }}>CANCEL</button>
          </div>
        </form>
      )}

      {tracks.length === 0 && !show && (
        <div style={{ fontSize: 10, color: 'var(--text-ghost)', padding: '24px 0', textAlign: 'center' }}>
          no tracks yet — click + ADD
        </div>
      )}
      {tracks.map((t) => <TrackCard key={t.id} track={t} />)}
    </div>
  )
}

// ─── PIPELINE TAB (Kanban) ───────────────────────────────────────────────────

function PipelineTab() {
  const { tracks, updateTrack } = useMusicStore()
  const [dragId, setDragId] = useState(null)
  const [dragOver, setDragOver] = useState(null)

  const byStage = (stage) => tracks.filter((t) => (t.status === stage) || (stage === 'production' && t.status === 'wip'))

  const handleDrop = (stage) => {
    if (!dragId) return
    updateTrack(dragId, { status: stage })
    setDragId(null)
    setDragOver(null)
  }

  return (
    <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8 }}>
      {PIPELINE_STAGES.map((stage) => {
        const col = STAGE_COLORS[stage]
        const cards = byStage(stage)
        const isOver = dragOver === stage
        return (
          <div
            key={stage}
            onDragOver={(e) => { e.preventDefault(); setDragOver(stage) }}
            onDragLeave={() => setDragOver(null)}
            onDrop={() => handleDrop(stage)}
            style={{
              minWidth: 180, flex: '0 0 180px',
              background: isOver ? col.bg : 'var(--bg-s1)',
              border: `1px solid ${isOver ? col.border : 'var(--border-dim)'}`,
              borderRadius: 4, padding: '10px 10px 6px',
              transition: 'background 80ms, border-color 80ms',
            }}
          >
            {/* Column header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 8, letterSpacing: '0.12em', color: col.text, textTransform: 'uppercase' }}>
                {stage}
              </span>
              <span style={{ fontSize: 8, color: 'var(--text-ghost)' }}>{cards.length}</span>
            </div>
            <div style={{ height: 1, background: col.border, marginBottom: 8 }} />

            {/* Cards */}
            {cards.map((track) => (
              <div
                key={track.id}
                draggable
                onDragStart={() => setDragId(track.id)}
                onDragEnd={() => { setDragId(null); setDragOver(null) }}
                style={{
                  padding: '8px 10px', marginBottom: 5,
                  background: dragId === track.id ? 'var(--bg-s3)' : col.bg,
                  border: `1px solid ${col.border}`,
                  borderLeft: `2px solid ${col.text}`,
                  borderRadius: 3, cursor: 'grab',
                  opacity: dragId === track.id ? 0.5 : 1,
                  transition: 'opacity 80ms',
                }}
              >
                <div style={{ fontSize: 10, color: 'var(--text-primary)', marginBottom: 4, lineHeight: 1.3 }}>
                  {track.title}
                </div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {track.daw && <span style={S.pill(col.text)}>{track.daw}</span>}
                  {track.genre && <span style={S.pill()}>{track.genre}</span>}
                </div>
                <div style={{ fontSize: 8, color: 'var(--text-ghost)', marginTop: 4 }}>
                  {track.updatedAt}
                </div>
              </div>
            ))}

            {cards.length === 0 && (
              <div style={{ fontSize: 8, color: 'var(--text-ghost)', textAlign: 'center', padding: '12px 0', letterSpacing: '0.05em' }}>
                — empty —
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── SESSIONS TAB ────────────────────────────────────────────────────────────

function SessionsTab() {
  const { tracks, sessions, addSession, deleteSession } = useMusicStore()
  const [show, setShow] = useState(false)
  const empty = { trackId: '', trackName: '', daw: 'FL Studio', sessionType: 'production', bpm: '', key: '', duration: '', notes: '' }
  const [form, setForm] = useState(empty)

  const handleAdd = (e) => {
    e.preventDefault()
    if (!form.duration) return
    const track = tracks.find(t => t.id === form.trackId)
    addSession({ ...form, trackName: track?.title || form.trackName })
    setForm(empty)
    setShow(false)
  }

  const f = (k) => (e) => setForm(s => ({ ...s, [k]: e.target.value }))

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <SectionHeader label="SESSION LOG" />
        <button style={S.btn} onClick={() => setShow(!show)} onMouseEnter={BTN_OVER} onMouseLeave={BTN_OUT}>+ LOG</button>
      </div>

      {show && (
        <form onSubmit={handleAdd} style={{ ...S.card, border: '1px solid var(--border-mid)', marginBottom: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            <div style={{ gridColumn: '1/-1' }}>
              <span style={S.label}>track</span>
              <select value={form.trackId} onChange={f('trackId')} style={{ ...S.input }}>
                <option value="">— select or type below —</option>
                {tracks.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
              </select>
              {!form.trackId && (
                <input value={form.trackName} onChange={f('trackName')} placeholder="or type track name"
                  style={S.input} onFocus={FOCUS_HOVER} onBlur={BLUR_RESET} />
              )}
            </div>
            <div>
              <span style={S.label}>DAW</span>
              <select value={form.daw} onChange={f('daw')} style={{ ...S.input }}>
                <option>FL Studio</option>
                <option>Logic Pro</option>
                <option>Ableton</option>
                <option>Pro Tools</option>
                <option>other</option>
              </select>
            </div>
            <div>
              <span style={S.label}>type</span>
              <select value={form.sessionType} onChange={f('sessionType')} style={{ ...S.input }}>
                <option value="production">production</option>
                <option value="mixing">mixing</option>
                <option value="mastering">mastering</option>
              </select>
            </div>
            <div>
              <span style={S.label}>BPM</span>
              <input value={form.bpm} onChange={f('bpm')} placeholder="120" style={S.input} onFocus={FOCUS_HOVER} onBlur={BLUR_RESET} />
            </div>
            <div>
              <span style={S.label}>key</span>
              <input value={form.key} onChange={f('key')} placeholder="Am" style={S.input} onFocus={FOCUS_HOVER} onBlur={BLUR_RESET} />
            </div>
            <div>
              <span style={S.label}>duration (min) *</span>
              <input type="number" value={form.duration} onChange={f('duration')} placeholder="90"
                style={S.input} onFocus={FOCUS_HOVER} onBlur={BLUR_RESET} />
            </div>
          </div>
          <span style={S.label}>notes</span>
          <textarea value={form.notes} onChange={f('notes')} placeholder="what did you work on?"
            rows={2} style={{ ...S.input, resize: 'none', lineHeight: 1.5 }} onFocus={FOCUS_HOVER} onBlur={BLUR_RESET} />
          <div style={{ display: 'flex', gap: 6 }}>
            <button type="submit" style={S.btn} onMouseEnter={BTN_OVER} onMouseLeave={BTN_OUT}>LOG SESSION</button>
            <button type="button" onClick={() => setShow(false)} style={{ ...S.btn, borderColor: 'transparent', color: 'var(--text-ghost)' }}>CANCEL</button>
          </div>
        </form>
      )}

      {sessions.length === 0 && !show && (
        <div style={{ fontSize: 10, color: 'var(--text-ghost)', padding: '24px 0', textAlign: 'center' }}>no sessions logged yet</div>
      )}

      {sessions.map((s) => {
        const stc = SESSION_TYPE_COLORS[s.sessionType] || 'var(--text-tertiary)'
        return (
          <div key={s.id} style={{
            ...S.card,
            borderLeft: `2px solid ${stc}22`,
            display: 'flex', gap: 10, alignItems: 'flex-start',
          }}>
            <div style={{ flexShrink: 0, textAlign: 'right' }}>
              <div style={{ fontSize: 8, color: 'var(--text-ghost)' }}>{s.date}</div>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>{s.duration}m</div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', gap: 5, alignItems: 'center', marginBottom: 3, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 10, color: 'var(--text-primary)' }}>{s.trackName || '—'}</span>
                <span style={{ ...S.pill(stc) }}>{s.sessionType}</span>
                {s.daw && <span style={S.pill()}>{s.daw}</span>}
                {s.bpm && <span style={S.pill()}>{s.bpm} BPM</span>}
                {s.key && <span style={S.pill()}>{s.key}</span>}
              </div>
              {s.notes && <div style={{ fontSize: 9, color: 'var(--text-ghost)', lineHeight: 1.5 }}>{s.notes}</div>}
            </div>
            <button onClick={() => deleteSession(s.id)} style={{ fontSize: 8, color: 'var(--text-ghost)', flexShrink: 0 }}>×</button>
          </div>
        )
      })}
    </div>
  )
}

// ─── REFERENCES TAB ──────────────────────────────────────────────────────────

const VIBE_TAGS = ['dark', 'chill', 'hype', 'melancholic', 'euphoric', 'raw']

function ReferencesTab() {
  const { references, addReference, deleteReference } = useMusicStore()
  const [show, setShow] = useState(false)
  const empty = { title: '', artist: '', vibe: 'dark', referencePoints: '', notes: '' }
  const [form, setForm] = useState(empty)

  const handleAdd = (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.artist.trim()) return
    addReference(form)
    setForm(empty)
    setShow(false)
  }

  const f = (k) => (e) => setForm(s => ({ ...s, [k]: e.target.value }))

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <SectionHeader label="REFERENCE TRACKS" />
        <button style={S.btn} onClick={() => setShow(!show)} onMouseEnter={BTN_OVER} onMouseLeave={BTN_OUT}>+ ADD</button>
      </div>

      {show && (
        <form onSubmit={handleAdd} style={{ ...S.card, border: '1px solid var(--border-mid)', marginBottom: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            <div>
              <span style={S.label}>title *</span>
              <input value={form.title} onChange={f('title')} placeholder="God's Plan" style={S.input} onFocus={FOCUS_HOVER} onBlur={BLUR_RESET} />
            </div>
            <div>
              <span style={S.label}>artist *</span>
              <input value={form.artist} onChange={f('artist')} placeholder="Drake" style={S.input} onFocus={FOCUS_HOVER} onBlur={BLUR_RESET} />
            </div>
          </div>
          <span style={S.label}>vibe tag</span>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 8 }}>
            {VIBE_TAGS.map(v => (
              <button key={v} type="button" onClick={() => setForm(s => ({ ...s, vibe: v }))}
                style={{
                  ...S.pill(form.vibe === v ? VIBE_COLORS[v] : 'var(--text-ghost)'),
                  cursor: 'pointer',
                  background: form.vibe === v ? `${VIBE_COLORS[v]}18` : 'transparent',
                }}>
                {v}
              </button>
            ))}
          </div>
          <span style={S.label}>reference points (low end, stereo width, etc.)</span>
          <input value={form.referencePoints} onChange={f('referencePoints')}
            placeholder="kick punch, wide pads, 808 sub blend"
            style={S.input} onFocus={FOCUS_HOVER} onBlur={BLUR_RESET} />
          <span style={S.label}>notes</span>
          <textarea value={form.notes} onChange={f('notes')} placeholder="what inspires you about this track?"
            rows={2} style={{ ...S.input, resize: 'none', lineHeight: 1.5 }} onFocus={FOCUS_HOVER} onBlur={BLUR_RESET} />
          <div style={{ display: 'flex', gap: 6 }}>
            <button type="submit" style={S.btn} onMouseEnter={BTN_OVER} onMouseLeave={BTN_OUT}>ADD REFERENCE</button>
            <button type="button" onClick={() => setShow(false)} style={{ ...S.btn, borderColor: 'transparent', color: 'var(--text-ghost)' }}>CANCEL</button>
          </div>
        </form>
      )}

      {references.length === 0 && !show && (
        <div style={{ fontSize: 10, color: 'var(--text-ghost)', padding: '24px 0', textAlign: 'center' }}>
          no reference tracks yet
        </div>
      )}

      {references.map((ref) => {
        const vc = VIBE_COLORS[ref.vibe] || 'var(--text-tertiary)'
        return (
          <div key={ref.id} style={{ ...S.card, borderLeft: `2px solid ${vc}44` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-primary)' }}>{ref.title}</span>
                  <span style={{ fontSize: 9, color: 'var(--text-ghost)' }}>—</span>
                  <span style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{ref.artist}</span>
                  <span style={{ ...S.pill(vc), background: `${vc}15` }}>{ref.vibe}</span>
                </div>
                {ref.referencePoints && (
                  <div style={{ fontSize: 9, color: 'var(--text-tertiary)', marginBottom: 3 }}>
                    <span style={{ color: 'var(--text-ghost)', marginRight: 4 }}>ref:</span>
                    {ref.referencePoints}
                  </div>
                )}
                {ref.notes && <div style={{ fontSize: 9, color: 'var(--text-ghost)', lineHeight: 1.5 }}>{ref.notes}</div>}
              </div>
              <button onClick={() => deleteReference(ref.id)} style={{ fontSize: 8, color: 'var(--text-ghost)', marginLeft: 8 }}>×</button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── GUITAR TRACKER TAB ──────────────────────────────────────────────────────

const DIFF_LABELS = ['', '░', '▒', '▓', '█', '█']

function GuitarTab() {
  const { guitarLogs, addGuitarLog, deleteGuitarLog } = useMusicStore()
  const [show, setShow] = useState(false)
  const empty = { technique: '', duration: '', difficulty: '3', notes: '' }
  const [form, setForm] = useState(empty)

  const handleAdd = (e) => {
    e.preventDefault()
    if (!form.technique.trim() || !form.duration) return
    addGuitarLog(form)
    setForm(empty)
    setShow(false)
  }

  const f = (k) => (e) => setForm(s => ({ ...s, [k]: e.target.value }))

  // Weekly streak — count distinct days practiced in past 7 days
  const today = new Date()
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - 6 + i)
    return d.toISOString().slice(0, 10)
  })
  const practicedDays = new Set(guitarLogs.map(l => l.date))
  const weekDots = last7.map(d => ({ date: d, done: practicedDays.has(d), isToday: d === today.toISOString().slice(0, 10) }))
  const streak = (() => {
    let s = 0
    const sorted = [...guitarLogs].sort((a, b) => b.date.localeCompare(a.date))
    const seen = new Set()
    for (const log of sorted) {
      if (!seen.has(log.date)) { seen.add(log.date); s++ }
      else break
    }
    // proper streak: consecutive days
    let streak = 0
    const d = new Date()
    while (true) {
      const key = d.toISOString().slice(0, 10)
      if (practicedDays.has(key)) { streak++; d.setDate(d.getDate() - 1) }
      else break
    }
    return streak
  })()

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <SectionHeader label="GUITAR PRACTICE" />
        <button style={S.btn} onClick={() => setShow(!show)} onMouseEnter={BTN_OVER} onMouseLeave={BTN_OUT}>+ LOG</button>
      </div>

      {/* Weekly streak bar */}
      <div style={{ ...S.card, marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 8, color: 'var(--text-ghost)', letterSpacing: '0.1em', marginBottom: 6 }}>THIS WEEK</div>
          <div style={{ display: 'flex', gap: 5 }}>
            {weekDots.map(({ date, done, isToday }) => (
              <div key={date} style={{
                width: 20, height: 20, borderRadius: 2,
                background: done ? '#1a3520' : 'var(--bg-s3)',
                border: `1px solid ${isToday ? 'var(--border-bright)' : done ? '#1e4a28' : 'var(--border-dim)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 9, color: done ? '#44aa66' : 'var(--text-ghost)',
              }}>
                {done ? '✓' : isToday ? '·' : ''}
              </div>
            ))}
          </div>
          <div style={{ fontSize: 7, color: 'var(--text-ghost)', marginTop: 4, letterSpacing: '0.08em' }}>
            {last7.map(d => d.slice(5)).join('  ')}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 20, fontWeight: 300, color: streak > 0 ? '#44aa66' : 'var(--text-ghost)' }}>
            {streak}
          </div>
          <div style={{ fontSize: 8, color: 'var(--text-ghost)', letterSpacing: '0.08em' }}>day streak</div>
        </div>
      </div>

      {show && (
        <form onSubmit={handleAdd} style={{ ...S.card, border: '1px solid var(--border-mid)', marginBottom: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            <div style={{ gridColumn: '1/-1' }}>
              <span style={S.label}>technique focus *</span>
              <input value={form.technique} onChange={f('technique')}
                placeholder="alternate picking, bends, economy picking..."
                style={S.input} onFocus={FOCUS_HOVER} onBlur={BLUR_RESET} />
            </div>
            <div>
              <span style={S.label}>duration (min) *</span>
              <input type="number" value={form.duration} onChange={f('duration')} placeholder="30"
                style={S.input} onFocus={FOCUS_HOVER} onBlur={BLUR_RESET} />
            </div>
            <div>
              <span style={S.label}>difficulty (1–5)</span>
              <div style={{ display: 'flex', gap: 4, paddingTop: 4 }}>
                {[1,2,3,4,5].map(n => (
                  <button key={n} type="button" onClick={() => setForm(s => ({ ...s, difficulty: String(n) }))}
                    style={{
                      width: 28, height: 28, borderRadius: 2, fontSize: 10,
                      border: `1px solid ${Number(form.difficulty) >= n ? '#44aa66' : 'var(--border-dim)'}`,
                      background: Number(form.difficulty) >= n ? '#0f2018' : 'transparent',
                      color: Number(form.difficulty) >= n ? '#44aa66' : 'var(--text-ghost)',
                      cursor: 'pointer',
                    }}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <span style={{ ...S.label, marginTop: 4 }}>notes</span>
          <textarea value={form.notes} onChange={f('notes')} placeholder="what clicked? what needs work?"
            rows={2} style={{ ...S.input, resize: 'none', lineHeight: 1.5 }} onFocus={FOCUS_HOVER} onBlur={BLUR_RESET} />
          <div style={{ display: 'flex', gap: 6 }}>
            <button type="submit" style={S.btn} onMouseEnter={BTN_OVER} onMouseLeave={BTN_OUT}>LOG SESSION</button>
            <button type="button" onClick={() => setShow(false)} style={{ ...S.btn, borderColor: 'transparent', color: 'var(--text-ghost)' }}>CANCEL</button>
          </div>
        </form>
      )}

      {guitarLogs.length === 0 && !show && (
        <div style={{ fontSize: 10, color: 'var(--text-ghost)', padding: '24px 0', textAlign: 'center' }}>
          no practice sessions logged yet
        </div>
      )}

      {guitarLogs.map((log) => (
        <div key={log.id} style={{ ...S.card, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <div style={{ flexShrink: 0, textAlign: 'right' }}>
            <div style={{ fontSize: 8, color: 'var(--text-ghost)' }}>{log.date}</div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>{log.duration}m</div>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', gap: 5, alignItems: 'center', marginBottom: 3 }}>
              <span style={{ fontSize: 10, color: 'var(--text-primary)' }}>{log.technique}</span>
              <span style={{ fontSize: 9, color: '#44aa66', letterSpacing: 1 }}>
                {'█'.repeat(log.difficulty)}{'░'.repeat(5 - log.difficulty)}
              </span>
            </div>
            {log.notes && <div style={{ fontSize: 9, color: 'var(--text-ghost)', lineHeight: 1.5 }}>{log.notes}</div>}
          </div>
          <button onClick={() => deleteGuitarLog(log.id)} style={{ fontSize: 8, color: 'var(--text-ghost)', flexShrink: 0 }}>×</button>
        </div>
      ))}
    </div>
  )
}

// ─── AI BRAIN TAB ────────────────────────────────────────────────────────────

function AIBrainTab() {
  const { tracks, sessions, guitarLogs } = useMusicStore()
  const groqKey = useConfigStore((s) => s.groqKey)
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const outputRef = useRef(null)

  const stream = async (prompt, appendTo = false) => {
    if (!groqKey) { setOutput('no groq api key — add one in setup'); return }
    setLoading(true)
    if (!appendTo) setOutput('')
    try {
      for await (const chunk of streamGroq(groqKey, prompt)) {
        setOutput(prev => prev + chunk)
        if (outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight
      }
    } catch (err) {
      setOutput(prev => prev + `\n\n[error: ${err.message}]`)
    }
    setLoading(false)
  }

  const planWeek = () => {
    const activeProjects = tracks.filter(t => t.status !== 'released')
    const recentSessions = sessions.slice(0, 5)
    const prompt = `You are a music production coach. Based on the following active projects and recent sessions, generate a focused weekly music production plan. Be specific, practical, and direct.

Active Projects:
${activeProjects.map(t => `- "${t.title}" | stage: ${t.status} | progress: ${t.progress}% | daw: ${t.daw || '?'} | genre: ${t.genre || '?'}`).join('\n') || 'none'}

Recent Sessions:
${recentSessions.map(s => `- ${s.date}: ${s.trackName} (${s.sessionType}, ${s.duration}min) — ${s.notes || ''}`).join('\n') || 'none'}

Generate a day-by-day plan for Mon–Fri with specific tasks, time estimates, and one focus goal per day. Keep it tight and actionable.`
    stream(prompt)
  }

  const getLearningSuggestions = () => {
    const stageCounts = {}
    PIPELINE_STAGES.forEach(s => { stageCounts[s] = tracks.filter(t => t.status === s).length })
    const dominant = PIPELINE_STAGES.reduce((a, b) => stageCounts[a] >= stageCounts[b] ? a : b)
    const guitarStreak = guitarLogs.length > 0 ? `${guitarLogs.length} guitar sessions logged` : 'no guitar sessions yet'

    const prompt = `You are a music production and guitar mentor. Based on the current pipeline state below, suggest 5 highly specific learning resources, techniques, or concepts the producer should study this week. Include YouTube channels, books, specific techniques, and plugin tips where relevant.

Pipeline state: ${PIPELINE_STAGES.map(s => `${s}: ${stageCounts[s]} tracks`).join(', ')}
Dominant stage: ${dominant}
Guitar: ${guitarStreak}

Format as a numbered list. Be specific — no generic advice.`
    stream(prompt)
  }

  const sendChat = async (e) => {
    e.preventDefault()
    if (!chatInput.trim() || loading) return
    const q = chatInput.trim()
    setChatInput('')
    setOutput(prev => prev ? prev + `\n\n— ${q}\n\n` : `— ${q}\n\n`)
    const prompt = `You are a music production and guitar expert assistant. Answer this question with depth and specificity. Lean toward practical, actionable advice.\n\nQuestion: ${q}`
    await stream(prompt, true)
  }

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <SectionHeader label="AI MUSIC BRAIN" />
        <div style={{ fontSize: 9, color: 'var(--text-ghost)', marginBottom: 12, lineHeight: 1.6 }}>
          powered by groq · llama-3.3-70b-versatile
          {!groqKey && <span style={{ color: '#cc4444', marginLeft: 8 }}>— no api key set</span>}
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
          <button
            onClick={planWeek} disabled={loading}
            style={{ ...S.btn, borderColor: '#1e3555', color: '#4488cc', background: '#0f1820',
              opacity: loading ? 0.5 : 1 }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#4488cc' }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#1e3555' }}
          >
            ✦ PLAN MY WEEK
          </button>
          <button
            onClick={getLearningSuggestions} disabled={loading}
            style={{ ...S.btn, borderColor: '#1e4030', color: '#44aa66', background: '#0f1a14',
              opacity: loading ? 0.5 : 1 }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#44aa66' }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#1e4030' }}
          >
            ◈ LEARNING SUGGESTIONS
          </button>
          {output && (
            <button onClick={() => setOutput('')}
              style={{ ...S.btn, borderColor: 'transparent', color: 'var(--text-ghost)' }}>
              CLEAR
            </button>
          )}
        </div>

        {/* Output terminal */}
        {(output || loading) && (
          <div
            ref={outputRef}
            style={{
              background: 'var(--bg-s1)', border: '1px solid var(--border-dim)',
              borderRadius: 3, padding: '12px 14px', marginBottom: 12,
              fontSize: 10, color: 'var(--text-secondary)', lineHeight: 1.8,
              whiteSpace: 'pre-wrap', maxHeight: 360,
              overflowY: 'auto', scrollbarWidth: 'thin',
              scrollbarColor: 'var(--border-dim) transparent',
              fontFamily: 'var(--font)',
            }}
          >
            {output}
            {loading && <span style={{ color: 'var(--text-ghost)', animation: 'none' }}>▌</span>}
          </div>
        )}

        {/* Chat input */}
        <div style={{ borderTop: '1px solid var(--border-dim)', paddingTop: 12 }}>
          <div style={{ fontSize: 8, color: 'var(--text-ghost)', letterSpacing: '0.1em', marginBottom: 6 }}>
            MUSIC Q&amp;A
          </div>
          <form onSubmit={sendChat} style={{ display: 'flex', gap: 6 }}>
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="ask anything about production, mixing, guitar..."
              style={{ ...S.input, flex: 1, marginBottom: 0 }}
              onFocus={FOCUS_HOVER} onBlur={BLUR_RESET}
              disabled={loading}
            />
            <button
              type="submit" disabled={loading || !chatInput.trim()}
              style={{ ...S.btn, flexShrink: 0, opacity: (loading || !chatInput.trim()) ? 0.4 : 1 }}
              onMouseEnter={BTN_OVER} onMouseLeave={BTN_OUT}
            >
              ASK
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

// ─── ROOT COMPONENT ──────────────────────────────────────────────────────────

export default function MusicView() {
  const [activeTab, setActiveTab] = useState('tracks')

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Music sub-tab bar */}
      <div style={{
        display: 'flex', gap: 0, borderBottom: '1px solid var(--border-dim)',
        paddingLeft: 16, flexShrink: 0, overflowX: 'auto',
        scrollbarWidth: 'none',
      }}>
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase',
              padding: '9px 14px', color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-ghost)',
              borderBottom: activeTab === tab ? '2px solid var(--text-primary)' : '2px solid transparent',
              fontFamily: 'var(--font)', cursor: 'pointer', whiteSpace: 'nowrap',
              transition: 'color 100ms',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: 16,
        scrollbarWidth: 'thin', scrollbarColor: 'var(--border-dim) transparent',
      }}>
        {activeTab === 'tracks'     && <TracksTab />}
        {activeTab === 'pipeline'   && <PipelineTab />}
        {activeTab === 'sessions'   && <SessionsTab />}
        {activeTab === 'references' && <ReferencesTab />}
        {activeTab === 'guitar'     && <GuitarTab />}
        {activeTab === 'ai brain'   && <AIBrainTab />}
      </div>
    </div>
  )
}

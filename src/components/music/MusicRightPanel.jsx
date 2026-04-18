import useMusicStore from '../../stores/useMusicStore'
import SectionHeader from '../shared/SectionHeader'

function asciiBar(value, max = 100, width = 10) {
  const filled = Math.round((value / max) * width)
  return '█'.repeat(filled) + '░'.repeat(width - filled)
}

const STAGE_COLORS = {
  idea:       '#7755aa',
  production: '#4488cc',
  mixing:     '#44aa66',
  mastering:  '#cc8844',
  released:   '#aaaacc',
}

export default function MusicRightPanel() {
  const { tracks, sessions, guitarLogs } = useMusicStore()

  // ── Pipeline snapshot ────────────────────────────────────────────────────
  const stages = ['idea','production','mixing','mastering','released']
  const stageCounts = stages.map(s => ({ stage: s, count: tracks.filter(t => t.status === s).length }))

  // ── Total session time this week ─────────────────────────────────────────
  const today = new Date()
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - today.getDay())
  const weekKey = weekStart.toISOString().slice(0, 10)
  const weekSessionMins = sessions
    .filter(s => s.date >= weekKey)
    .reduce((acc, s) => acc + (s.duration || 0), 0)
  const weekGuitarMins = guitarLogs
    .filter(l => l.date >= weekKey)
    .reduce((acc, l) => acc + (l.duration || 0), 0)

  // ── Guitar streak ────────────────────────────────────────────────────────
  const practicedDays = new Set(guitarLogs.map(l => l.date))
  let guitarStreak = 0
  const d = new Date()
  while (true) {
    const key = d.toISOString().slice(0, 10)
    if (practicedDays.has(key)) { guitarStreak++; d.setDate(d.getDate() - 1) }
    else break
  }

  // ── Latest session ───────────────────────────────────────────────────────
  const latestSession = sessions[0]
  const latestTrack = latestSession ? tracks.find(t => t.id === latestSession.trackId) : null

  // ── In-progress tracks ───────────────────────────────────────────────────
  const inProgress = tracks.filter(t => t.status !== 'released' && t.status !== 'idea').slice(0, 4)

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      overflowY: 'auto', scrollbarWidth: 'thin', scrollbarColor: 'var(--border-dim) transparent',
      background: 'var(--bg-s1)',
    }}>

      {/* Pipeline snapshot */}
      <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border-dim)' }}>
        <SectionHeader label="PIPELINE" />
        {stageCounts.map(({ stage, count }) => (
          <div key={stage} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <span style={{ fontSize: 8, color: STAGE_COLORS[stage] || 'var(--text-ghost)', letterSpacing: '0.08em' }}>
              {stage}
            </span>
            <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
              <span style={{ fontSize: 9, color: count > 0 ? 'var(--text-tertiary)' : 'var(--text-ghost)' }}>
                {count}
              </span>
              <div style={{ display: 'flex', gap: 2 }}>
                {Array.from({ length: Math.max(count, 0) }).map((_, i) => (
                  <div key={i} style={{
                    width: 5, height: 5, borderRadius: 1,
                    background: STAGE_COLORS[stage] + '66',
                    border: `1px solid ${STAGE_COLORS[stage]}44`,
                  }} />
                ))}
              </div>
            </div>
          </div>
        ))}
        <div style={{ marginTop: 6, fontSize: 8, color: 'var(--text-ghost)' }}>
          {tracks.length} total · {tracks.filter(t => t.status === 'released').length} released
        </div>
      </div>

      {/* This week stats */}
      <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border-dim)' }}>
        <SectionHeader label="THIS WEEK" />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 300, color: 'var(--text-primary)' }}>
              {Math.round(weekSessionMins / 60 * 10) / 10}h
            </div>
            <div style={{ fontSize: 7, color: 'var(--text-ghost)', letterSpacing: '0.08em' }}>production</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 300, color: '#44aa66' }}>
              {weekGuitarMins}m
            </div>
            <div style={{ fontSize: 7, color: 'var(--text-ghost)', letterSpacing: '0.08em' }}>guitar</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 300, color: guitarStreak > 0 ? '#44aa66' : 'var(--text-ghost)' }}>
              {guitarStreak}
            </div>
            <div style={{ fontSize: 7, color: 'var(--text-ghost)', letterSpacing: '0.08em' }}>day streak</div>
          </div>
        </div>
      </div>

      {/* Active tracks with progress bars */}
      <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border-dim)' }}>
        <SectionHeader label="IN PROGRESS" />
        {inProgress.length === 0 && (
          <div style={{ fontSize: 9, color: 'var(--text-ghost)' }}>no active tracks</div>
        )}
        {inProgress.map((t) => (
          <div key={t.id} style={{ marginBottom: 8 }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              fontSize: 9, color: 'var(--text-secondary)', marginBottom: 2,
            }}>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 120 }}>
                {t.title}
              </span>
              <span style={{ color: STAGE_COLORS[t.status], flexShrink: 0, marginLeft: 4 }}>{t.status}</span>
            </div>
            <div style={{ fontFamily: 'var(--font)', fontSize: 8, color: 'var(--text-ghost)', letterSpacing: 1 }}>
              {asciiBar(t.progress)}
            </div>
            <div style={{ fontSize: 7, color: 'var(--text-ghost)', marginTop: 1 }}>{t.progress}%</div>
          </div>
        ))}
      </div>

      {/* Latest session */}
      {latestSession && (
        <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border-dim)' }}>
          <SectionHeader label="LAST SESSION" />
          <div style={{ fontSize: 10, color: 'var(--text-primary)', marginBottom: 2 }}>
            {latestSession.trackName || latestTrack?.title || '—'}
          </div>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 4 }}>
            <span style={{ fontSize: 8, color: 'var(--text-ghost)' }}>{latestSession.date}</span>
            <span style={{ fontSize: 8, color: 'var(--text-tertiary)' }}>{latestSession.duration}min</span>
            <span style={{ fontSize: 8, color: 'var(--text-ghost)' }}>{latestSession.sessionType}</span>
          </div>
          {latestSession.notes && (
            <div style={{ fontSize: 8, color: 'var(--text-ghost)', lineHeight: 1.5, fontStyle: 'italic' }}>
              {latestSession.notes.slice(0, 80)}{latestSession.notes.length > 80 ? '…' : ''}
            </div>
          )}
        </div>
      )}

      {/* References count */}
      <div style={{ padding: '10px 12px' }}>
        <SectionHeader label="LIBRARY" />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9 }}>
          <span style={{ color: 'var(--text-ghost)' }}>reference tracks</span>
          <span style={{ color: 'var(--text-tertiary)' }}>
            {useMusicStore.getState().references.length}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, marginTop: 3 }}>
          <span style={{ color: 'var(--text-ghost)' }}>guitar sessions</span>
          <span style={{ color: 'var(--text-tertiary)' }}>{guitarLogs.length}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, marginTop: 3 }}>
          <span style={{ color: 'var(--text-ghost)' }}>prod sessions</span>
          <span style={{ color: 'var(--text-tertiary)' }}>{sessions.length}</span>
        </div>
      </div>
    </div>
  )
}

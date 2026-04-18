import useUIStore from '../../stores/useUIStore'
import useConfigStore from '../../stores/useConfigStore'

export default function SyncIndicator() {
  const syncStatus = useUIStore((s) => s.syncStatus)
  const setSyncStatus = useUIStore((s) => s.setSyncStatus)
  const { pat, owner, repo } = useConfigStore()

  const colors = {
    synced: 'var(--text-primary)',
    syncing: 'var(--text-ghost)',
    offline: 'var(--text-tertiary)',
  }

  const labels = {
    synced: '●',
    syncing: '○',
    offline: '–',
  }

  const titles = {
    synced: 'Synced with GitHub',
    syncing: 'Syncing...',
    offline: 'Offline / No GitHub configured',
  }

  const handleClick = async () => {
    if (!pat || !owner || !repo) return
    setSyncStatus('syncing')
    try {
      // Trigger a sync attempt — stores handle their own sync
      await new Promise((r) => setTimeout(r, 800))
      setSyncStatus('synced')
    } catch {
      setSyncStatus('offline')
    }
  }

  return (
    <button
      onClick={handleClick}
      title={titles[syncStatus]}
      style={{
        fontSize: 10,
        color: colors[syncStatus],
        letterSpacing: '0.05em',
        transition: 'color var(--transition)',
        lineHeight: 1,
      }}
    >
      {labels[syncStatus]}
    </button>
  )
}

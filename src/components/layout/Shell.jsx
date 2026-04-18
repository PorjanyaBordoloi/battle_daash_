import { Outlet, useLocation } from 'react-router-dom'
import useConfigStore from '../../stores/useConfigStore'
import SetupWizard from '../setup/SetupWizard'
import Topbar from './Topbar'
import Sidebar from './Sidebar'
import RightPanel from '../rightpanel/RightPanel'
import MusicRightPanel from '../music/MusicRightPanel'

const styles = {
  shell: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    background: 'var(--bg-base)',
    overflow: 'hidden',
  },
  body: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  },
  center: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    borderRight: '1px solid var(--border-dim)',
  },
  right: {
    width: 'var(--right-w)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
}

export default function Shell() {
  const isSetup = useConfigStore((s) => s.isSetup)
  const location = useLocation()
  const isMusic = location.pathname === '/music'

  if (!isSetup) return <SetupWizard />

  return (
    <div style={styles.shell}>
      <Topbar />
      <div style={styles.body}>
        <Sidebar />
        <div style={styles.center}>
          <Outlet />
        </div>
        <div style={styles.right}>
          {isMusic ? <MusicRightPanel /> : <RightPanel />}
        </div>
      </div>
    </div>
  )
}

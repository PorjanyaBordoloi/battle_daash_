import { NavLink } from 'react-router-dom'

const nav = [
  {
    to: '/today',
    label: 'Today',
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2">
        <rect x="1" y="1" width="12" height="12" rx="1" />
        <line x1="1" y1="4" x2="13" y2="4" />
        <line x1="4" y1="1" x2="4" y2="4" />
        <line x1="10" y1="1" x2="10" y2="4" />
      </svg>
    ),
  },
  {
    to: '/week',
    label: 'Week',
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2">
        <rect x="1" y="1" width="12" height="12" rx="1" />
        <line x1="1" y1="4" x2="13" y2="4" />
        <line x1="5" y1="1" x2="5" y2="13" />
        <line x1="9" y1="1" x2="9" y2="13" />
        <line x1="1" y1="8" x2="13" y2="8" />
      </svg>
    ),
  },
  {
    to: '/projects',
    label: 'Projects',
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2">
        <rect x="1" y="1" width="5" height="12" rx="1" />
        <rect x="8" y="1" width="5" height="6" rx="1" />
        <rect x="8" y="9" width="5" height="4" rx="1" />
      </svg>
    ),
  },
  {
    to: '/habits',
    label: 'Habits',
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2">
        <circle cx="7" cy="7" r="5" />
        <circle cx="7" cy="7" r="2" />
      </svg>
    ),
  },
  {
    to: '/music',
    label: 'Music',
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2">
        <path d="M5 10V3l7-1.5V9" />
        <circle cx="3.5" cy="10.5" r="1.5" />
        <circle cx="10.5" cy="9.5" r="1.5" />
      </svg>
    ),
  },
]

export default function Sidebar() {
  return (
    <nav style={{
      width: 'var(--sidebar-w)',
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingTop: 8,
      borderRight: '1px solid var(--border-dim)',
      background: 'var(--bg-s1)',
      gap: 2,
    }}>
      {nav.map(({ to, label, icon }) => (
        <NavLink
          key={to}
          to={to}
          title={label}
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: 40,
            position: 'relative',
            color: isActive ? 'var(--text-primary)' : 'var(--text-ghost)',
            transition: 'color var(--transition)',
            borderLeft: isActive ? '2px solid var(--text-primary)' : '2px solid transparent',
          })}
        >
          {icon}
        </NavLink>
      ))}
    </nav>
  )
}

export default function SectionHeader({ label, action }) {
  return (
    <div className="section-header">
      <span className="section-header__label">{label}</span>
      <div className="section-header__line" />
      {action && <span>{action}</span>}
    </div>
  )
}

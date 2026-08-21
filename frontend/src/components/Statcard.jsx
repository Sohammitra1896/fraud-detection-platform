function StatCard({
  label,
  value,
  description,
  icon,
  variant = "purple",
}) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${variant}`}>
        {icon}
      </div>

      <div className="stat-content">
        <span className="stat-label">{label}</span>
        <strong className="stat-value">{value}</strong>
        <span className="stat-description">{description}</span>
      </div>
    </div>
  );
}

export default StatCard;
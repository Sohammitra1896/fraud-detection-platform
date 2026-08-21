function Sidebar({ activePage, navigate, apiOnline }) {
  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: "▦",
    },
    {
      id: "analyze",
      label: "Analyze Transaction",
      icon: "↝",
    },
    {
      id: "history",
      label: "History",
      icon: "◷",
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: "▥",
    },
    {
      id: "model",
      label: "Model",
      icon: "◇",
    },
    {
      id: "settings",
      label: "Settings",
      icon: "⚙",
    },
    {
      id: "about",
      label: "About",
      icon: "ⓘ",
    },
  ];

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">
          <span>F</span>
        </div>

        <div>
          <div className="brand-name">FraudLens</div>
          <div className="brand-tagline">
            Intelligent Transaction Risk
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${
              activePage === item.id ? "active" : ""
            }`}
            onClick={() => navigate(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="system-status-card">
          <div className={`status-dot ${apiOnline ? "online" : "offline"}`} />

          <div>
            <strong>
              {apiOnline ? "System Operational" : "Backend Offline"}
            </strong>

            <span>
              {apiOnline
                ? "Fraud detection model ready"
                : "Start the FastAPI server"}
            </span>
          </div>
        </div>

        <div className="sidebar-version">
          FraudLens <span>v1.0.0</span>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
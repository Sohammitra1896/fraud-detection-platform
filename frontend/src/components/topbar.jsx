function Topbar({ activePage, apiOnline }) {
  const titles = {
    dashboard: {
      title: "Dashboard",
      subtitle: "Monitor fraud detection activity and transaction risk.",
    },
    analyze: {
      title: "Analyze Transaction",
      subtitle:
        "Submit transaction features and evaluate fraud probability.",
    },
    history: {
      title: "Transaction History",
      subtitle: "Review previously analyzed transactions.",
    },
    analytics: {
      title: "Analytics",
      subtitle: "Understand transaction risk and fraud patterns.",
    },
    model: {
      title: "Model",
      subtitle: "View information about the deployed machine-learning model.",
    },
    settings: {
      title: "Settings",
      subtitle: "View application and API configuration.",
    },
    about: {
      title: "About",
      subtitle: "Learn more about the FraudLens platform.",
    },
  };

  const page = titles[activePage] || titles.dashboard;

  return (
    <header className="topbar">
      <div>
        <h1>{page.title}</h1>
        <p>{page.subtitle}</p>
      </div>

      <div className="topbar-status">
        <span
          className={`status-dot ${
            apiOnline ? "online" : "offline"
          }`}
        />

        <span>
          {apiOnline ? "API Connected" : "API Offline"}
        </span>
      </div>
    </header>
  );
}

export default Topbar;
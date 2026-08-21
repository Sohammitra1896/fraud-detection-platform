import { useEffect, useMemo, useState } from "react";
import "./App.css";

const API_BASE = "http://127.0.0.1:8000";

const FEATURE_NAMES = [
  "Time",
  "V1",
  "V2",
  "V3",
  "V4",
  "V5",
  "V6",
  "V7",
  "V8",
  "V9",
  "V10",
  "V11",
  "V12",
  "V13",
  "V14",
  "V15",
  "V16",
  "V17",
  "V18",
  "V19",
  "V20",
  "V21",
  "V22",
  "V23",
  "V24",
  "V25",
  "V26",
  "V27",
  "V28",
  "Amount",
];

const SAMPLE_TRANSACTION = [
  0,
  -1.359807,
  -0.072781,
  2.536347,
  1.378155,
  -0.338321,
  0.462388,
  0.239599,
  0.098698,
  0.363787,
  0.090794,
  -0.5516,
  -0.617801,
  -0.99139,
  -0.311169,
  1.468177,
  -0.470401,
  0.207971,
  0.025791,
  0.403993,
  0.251412,
  -0.018307,
  0.277838,
  -0.110474,
  0.066928,
  0.128539,
  -0.189115,
  0.133558,
  -0.021053,
  149.62,
];

const PAGE_INFO = {
  dashboard: {
    eyebrow: "OVERVIEW",
    title: "Dashboard",
    description:
      "Monitor transaction activity, risk signals and fraud detection performance.",
  },
  analyze: {
    eyebrow: "TRANSACTION ANALYSIS",
    title: "Analyze Transaction",
    description:
      "Submit transaction features and evaluate fraud probability using the deployed model.",
  },
  history: {
    eyebrow: "TRANSACTION RECORDS",
    title: "Transaction History",
    description:
      "Review and explore previously analyzed transactions.",
  },
  analytics: {
    eyebrow: "PERFORMANCE",
    title: "Analytics",
    description:
      "Understand transaction risk and fraud detection patterns.",
  },
  model: {
    eyebrow: "MACHINE LEARNING",
    title: "Model",
    description:
      "View information about the deployed fraud detection model.",
  },
  settings: {
    eyebrow: "CONFIGURATION",
    title: "Settings",
    description:
      "View application, API and model configuration.",
  },
  about: {
    eyebrow: "PLATFORM",
    title: "About",
    description:
      "Learn about the FraudLens transaction intelligence platform.",
  },
};

function App() {
  const [activePage, setActivePage] = useState("dashboard");

  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem("fraudlens_history");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [apiOnline, setApiOnline] = useState(false);

  const [lastResult, setLastResult] = useState(null);

  const modelInfo = useMemo(
    () => ({
      name: "Random Forest",
      version: "1.0.0",
      threshold: 0.55,
      features: 30,
    }),
    []
  );

  useEffect(() => {
    localStorage.setItem(
      "fraudlens_history",
      JSON.stringify(history)
    );
  }, [history]);

  useEffect(() => {
    let mounted = true;

    const checkApi = async () => {
      try {
        const response = await fetch(`${API_BASE}/docs`);

        if (mounted) {
          setApiOnline(response.ok);
        }
      } catch {
        if (mounted) {
          setApiOnline(false);
        }
      }
    };

    checkApi();

    const interval = setInterval(checkApi, 10000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const addHistoryEntry = (data, values) => {
    const entry = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      amount: Number(values[29] || 0),
      fraud: Boolean(data.fraud),
      probability: Number(data.probability || 0),
      threshold: Number(data.threshold ?? 0.55),
      modelVersion: data.model_version || "1.0.0",
    };

    setHistory((previous) => [entry, ...previous]);
    setLastResult({
      ...data,
      entryId: entry.id,
    });
  };

  const navigate = (page) => {
    setActivePage(page);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("fraudlens_history");
  };

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return (
          <Dashboard
            history={history}
            modelInfo={modelInfo}
            navigate={navigate}
          />
        );

      case "analyze":
        return (
          <AnalyzePage
            apiOnline={apiOnline}
            modelInfo={modelInfo}
            onPrediction={addHistoryEntry}
            lastResult={lastResult}
          />
        );

      case "history":
        return (
          <HistoryPage
            history={history}
            navigate={navigate}
            clearHistory={clearHistory}
          />
        );

      case "analytics":
        return <AnalyticsPage history={history} />;

      case "model":
        return (
          <ModelPage
            modelInfo={modelInfo}
            apiOnline={apiOnline}
          />
        );

      case "settings":
        return (
          <SettingsPage
            apiOnline={apiOnline}
            modelInfo={modelInfo}
          />
        );

      case "about":
        return <AboutPage />;

      default:
        return (
          <Dashboard
            history={history}
            modelInfo={modelInfo}
            navigate={navigate}
          />
        );
    }
  };

  return (
    <div className="app-shell">
      <Sidebar
        activePage={activePage}
        navigate={navigate}
        apiOnline={apiOnline}
      />

      <div className="main-area">
        <Topbar
          page={PAGE_INFO[activePage]}
          navigate={navigate}
          apiOnline={apiOnline}
        />

        <main className="main-content">
          {renderPage()}
        </main>

        <footer className="app-footer">
          <span>FraudLens</span>
          <span>Intelligent Transaction Risk Detection</span>
          <span>Model v1.0.0</span>
        </footer>
      </div>
    </div>
  );
}

/* =========================================================
   SIDEBAR
========================================================= */

function Sidebar({
  activePage,
  navigate,
  apiOnline,
}) {
  const groups = [
    {
      title: "OVERVIEW",
      items: [
        ["dashboard", "Dashboard", "▦"],
      ],
    },
    {
      title: "DETECTION",
      items: [
        ["analyze", "Analyze Transaction", "⌁"],
      ],
    },
    {
      title: "INSIGHTS",
      items: [
        ["history", "Transactions", "◷"],
        ["analytics", "Analytics", "▥"],
      ],
    },
    {
      title: "SYSTEM",
      items: [
        ["model", "Model", "◇"],
        ["settings", "Settings", "⚙"],
      ],
    },
    {
      title: "SUPPORT",
      items: [
        ["about", "About", "ⓘ"],
      ],
    },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="logo-mark">
          <span />
          <span />
          <span />
        </div>

        <div>
          <div className="brand-name">
            FraudLens
          </div>

          <div className="brand-subtitle">
            Transaction Intelligence
          </div>
        </div>
      </div>

      <nav className="sidebar-navigation">
        {groups.map((group) => (
          <div
            className="nav-group"
            key={group.title}
          >
            <div className="nav-group-title">
              {group.title}
            </div>

            {group.items.map(
              ([id, label, icon]) => (
                <button
                  key={id}
                  className={`nav-item ${
                    activePage === id
                      ? "active"
                      : ""
                  }`}
                  onClick={() => navigate(id)}
                >
                  <span className="nav-icon">
                    {icon}
                  </span>

                  <span className="nav-label">
                    {label}
                  </span>
                </button>
              )
            )}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-status">
          <span
            className={`status-dot ${
              apiOnline ? "online" : "offline"
            }`}
          />

          <div>
            <strong>
              {apiOnline
                ? "System Operational"
                : "Backend Offline"}
            </strong>

            <span>
              {apiOnline
                ? "Fraud detection model ready"
                : "FastAPI server unavailable"}
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

/* =========================================================
   TOPBAR
========================================================= */

function Topbar({
  page,
  navigate,
  apiOnline,
}) {
  return (
    <header className="topbar">
      <div>
        <div className="topbar-eyebrow">
          {page.eyebrow}
        </div>

        <h1>{page.title}</h1>

        <p>{page.description}</p>
      </div>

      <div className="topbar-actions">
        <div className="api-indicator">
          <span
            className={`status-dot ${
              apiOnline ? "online" : "offline"
            }`}
          />

          <span>
            {apiOnline
              ? "API Online"
              : "API Offline"}
          </span>
        </div>

        <button
          className="topbar-button"
          onClick={() => navigate("analyze")}
        >
          + Analyze Transaction
        </button>
      </div>
    </header>
  );
}

/* =========================================================
   DASHBOARD
========================================================= */

function Dashboard({
  history,
  modelInfo,
  navigate,
}) {
  const total = history.length;

  const fraud = history.filter(
    (item) => item.fraud
  ).length;

  const legitimate = total - fraud;

  const avgRisk =
    total === 0
      ? 0
      : history.reduce(
          (sum, item) =>
            sum +
            Number(item.probability || 0),
          0
        ) / total;

  const fraudRate =
    total === 0
      ? 0
      : (fraud / total) * 100;

  return (
    <div className="page">
      <section className="page-intro">
        <div>
          <div className="eyebrow">
            TRANSACTION OVERVIEW
          </div>

          <h2>
            Fraud Detection Dashboard
          </h2>

          <p>
            Monitor transaction activity,
            risk levels and fraud detection
            performance from one place.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={() => navigate("analyze")}
        >
          + Analyze Transaction
        </button>
      </section>

      <section className="stats-grid">
        <StatCard
          label="Total Analyzed"
          value={total}
          description="All analyzed transactions"
          icon="↗"
          variant="purple"
        />

        <StatCard
          label="Legitimate"
          value={legitimate}
          description="Low-risk transactions"
          icon="✓"
          variant="green"
        />

        <StatCard
          label="Fraud Detected"
          value={fraud}
          description="High-risk transactions"
          icon="!"
          variant="red"
        />

        <StatCard
          label="Average Risk"
          value={`${(
            avgRisk * 100
          ).toFixed(1)}%`}
          description={`${fraudRate.toFixed(
            1
          )}% fraud rate`}
          icon="%"
          variant="purple"
        />
      </section>

      <section className="dashboard-grid">
        <div className="panel model-panel">
          <div className="panel-heading">
            <div>
              <div className="eyebrow">
                MODEL
              </div>

              <h3>
                Detection Model
              </h3>
            </div>

            <span className="online-badge">
              <span className="status-dot online" />
              Online
            </span>
          </div>

          <div className="model-grid">
            <ModelStat
              label="Algorithm"
              value={modelInfo.name}
            />

            <ModelStat
              label="Version"
              value={modelInfo.version}
            />

            <ModelStat
              label="Threshold"
              value={modelInfo.threshold}
            />

            <ModelStat
              label="Features"
              value={modelInfo.features}
            />
          </div>

          <button
            className="secondary-button"
            onClick={() => navigate("model")}
          >
            View Model Details →
          </button>
        </div>

        <div className="panel quick-panel">
          <div className="eyebrow">
            QUICK ACTION
          </div>

          <div className="quick-icon">
            ◈
          </div>

          <h3>
            Analyze a Transaction
          </h3>

          <p>
            Submit transaction features
            and let the machine-learning
            model determine the fraud risk.
          </p>

          <button
            className="primary-button full-width"
            onClick={() => navigate("analyze")}
          >
            Start Analysis
          </button>
        </div>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <div className="eyebrow">
              RECENT ACTIVITY
            </div>

            <h3>
              Recent Transactions
            </h3>
          </div>

          {history.length > 0 && (
            <button
              className="text-button"
              onClick={() =>
                navigate("history")
              }
            >
              View All →
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <EmptyState
            title="No transactions yet"
            text="Run your first transaction analysis to start building your activity history."
            action="Analyze Transaction"
            onClick={() =>
              navigate("analyze")
            }
          />
        ) : (
          <TransactionTable
            transactions={history.slice(0, 5)}
          />
        )}
      </section>
    </div>
  );
}

/* =========================================================
   ANALYZE
========================================================= */

function AnalyzePage({
  apiOnline,
  modelInfo,
  onPrediction,
  lastResult,
}) {
  const [features, setFeatures] = useState(
    Array(30).fill("")
  );

  const [result, setResult] =
    useState(lastResult);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (lastResult) {
      setResult(lastResult);
    }
  }, [lastResult]);

  const updateFeature = (
    index,
    value
  ) => {
    const updated = [...features];
    updated[index] = value;
    setFeatures(updated);
  };

  const loadExample = () => {
    setFeatures(
      SAMPLE_TRANSACTION.map(String)
    );

    setResult(null);
    setError("");
  };

  const clear = () => {
    setFeatures(Array(30).fill(""));
    setResult(null);
    setError("");
  };

  const analyze = async () => {
    setError("");
    setResult(null);

    if (!apiOnline) {
      setError(
        "The FastAPI backend is offline. Start your backend server on port 8000."
      );
      return;
    }

    const values = features.map(
      (value) => {
        if (
          value === "" ||
          value === null ||
          value === undefined
        ) {
          return 0;
        }

        const number =
          Number(value);

        return Number.isFinite(number)
          ? number
          : 0;
      }
    );

    setLoading(true);

    try {
      const response =
        await fetch(
          `${API_BASE}/predict`,
          {
            method: "POST",
            headers: {
              Accept:
                "application/json",
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              features: values,
            }),
          }
        );

      if (!response.ok) {
        const message =
          await response.text();

        throw new Error(
          message ||
            "Prediction request failed."
        );
      }

      const data =
        await response.json();

      setResult(data);

      onPrediction(
        data,
        values
      );
    } catch (err) {
      setError(
        err.message ||
          "Unable to analyze transaction."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <section className="page-intro">
        <div>
          <div className="eyebrow">
            MODEL INPUT
          </div>

          <h2>
            Analyze a Transaction
          </h2>

          <p>
            Enter the 30 features used
            by the deployed fraud detection
            model and submit them for analysis.
          </p>
        </div>
      </section>

      <div className="analysis-layout">
        <section className="panel feature-panel">
          <div className="panel-heading">
            <div>
              <div className="eyebrow">
                TRANSACTION FEATURES
              </div>

              <h3>
                Input Data
              </h3>

              <p className="panel-note">
                Time + V1–V28 + Amount
              </p>
            </div>

            <button
              className="secondary-button"
              onClick={loadExample}
            >
              Load Example
            </button>
          </div>

          <div className="feature-grid">
            {FEATURE_NAMES.map(
              (name, index) => (
                <div
                  className="feature-field"
                  key={name}
                >
                  <label>
                    {name}
                  </label>

                  <input
                    type="number"
                    step="any"
                    value={
                      features[index]
                    }
                    placeholder="0"
                    onChange={(event) =>
                      updateFeature(
                        index,
                        event.target.value
                      )
                    }
                  />
                </div>
              )
            )}
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-actions">
            <button
              className="secondary-button"
              onClick={clear}
              disabled={loading}
            >
              Clear
            </button>

            <button
              className="primary-button"
              onClick={analyze}
              disabled={loading}
            >
              {loading
                ? "Analyzing..."
                : "Analyze Transaction"}
            </button>
          </div>
        </section>

        <section className="panel result-panel">
          <div className="eyebrow">
            MODEL RESULT
          </div>

          {!result && !error && (
            <div className="result-empty">
              <div className="result-symbol">
                ◈
              </div>

              <h3>
                Waiting for Analysis
              </h3>

              <p>
                Submit a transaction to
                receive its fraud probability
                and classification.
              </p>
            </div>
          )}

          {error && (
            <div className="result-empty">
              <div className="result-symbol error">
                !
              </div>

              <h3>
                Analysis Unavailable
              </h3>

              <p>
                {error}
              </p>
            </div>
          )}

          {result && !error && (
            <div className="result-content">
              <div
                className={`result-symbol ${
                  result.fraud
                    ? "danger"
                    : "success"
                }`}
              >
                {result.fraud
                  ? "!"
                  : "✓"}
              </div>

              <div
                className={`result-label ${
                  result.fraud
                    ? "danger-text"
                    : "success-text"
                }`}
              >
                {result.fraud
                  ? "FRAUD RISK DETECTED"
                  : "LEGITIMATE TRANSACTION"}
              </div>

              <h3>
                {result.fraud
                  ? "Potential Fraud"
                  : "Transaction Appears Legitimate"}
              </h3>

              <div className="risk-box">
                <div className="risk-box-header">
                  <span>
                    Fraud Probability
                  </span>

                  <strong>
                    {(
                      Number(
                        result.probability ||
                          0
                      ) * 100
                    ).toFixed(2)}
                    %
                  </strong>
                </div>

                <div className="risk-track">
                  <div
                    style={{
                      width: `${Math.min(
                        Number(
                          result.probability ||
                            0
                        ) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>

                <span className="risk-note">
                  Decision threshold:{" "}
                  {(
                    Number(
                      result.threshold ??
                        modelInfo.threshold
                    ) * 100
                  ).toFixed(0)}
                  %
                </span>
              </div>

              <div className="result-meta">
                <div>
                  <span>
                    Classification
                  </span>

                  <strong>
                    {result.fraud
                      ? "Fraud"
                      : "Legitimate"}
                  </strong>
                </div>

                <div>
                  <span>
                    Model Version
                  </span>

                  <strong>
                    {result.model_version ||
                      modelInfo.version}
                  </strong>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

/* =========================================================
   HISTORY
========================================================= */

function HistoryPage({
  history,
  navigate,
  clearHistory,
}) {
  const [query, setQuery] =
    useState("");

  const [filter, setFilter] =
    useState("all");

  const filtered = history.filter(
    (item) => {
      const searchText =
        `${item.id} ${item.amount} ${new Date(
          item.timestamp
        ).toLocaleString()}`.toLowerCase();

      const matchesSearch =
        searchText.includes(
          query.toLowerCase()
        );

      const matchesFilter =
        filter === "all" ||
        (filter === "fraud" &&
          item.fraud) ||
        (filter ===
          "legitimate" &&
          !item.fraud);

      return (
        matchesSearch &&
        matchesFilter
      );
    }
  );

  const exportCSV = () => {
    if (!history.length) {
      return;
    }

    const rows = [
      [
        "Transaction ID",
        "Timestamp",
        "Amount",
        "Probability",
        "Fraud",
        "Threshold",
        "Model Version",
      ],
      ...history.map(
        (item) => [
          item.id,
          item.timestamp,
          item.amount,
          item.probability,
          item.fraud,
          item.threshold,
          item.modelVersion,
        ]
      ),
    ];

    const csv = rows
      .map((row) =>
        row
          .map(
            (value) =>
              `"${String(value).replace(
                /"/g,
                '""'
              )}"`
          )
          .join(",")
      )
      .join("\n");

    const blob =
      new Blob([csv], {
        type: "text/csv",
      });

    const url =
      URL.createObjectURL(blob);

    const anchor =
      document.createElement("a");

    anchor.href = url;
    anchor.download =
      "fraudlens-transactions.csv";

    anchor.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="page">
      <section className="page-intro history-intro">
        <div>
          <div className="eyebrow">
            ACTIVITY
          </div>

          <h2>
            Transaction History
          </h2>

          <p>
            Search, filter and export your
            analyzed transaction records.
          </p>
        </div>

        <div className="intro-actions">
          <button
            className="secondary-button"
            onClick={exportCSV}
            disabled={!history.length}
          >
            Export CSV
          </button>

          <button
            className="primary-button"
            onClick={() =>
              navigate("analyze")
            }
          >
            + New Analysis
          </button>
        </div>
      </section>

      <section className="stats-grid">
        <StatCard
          label="Total Analyzed"
          value={history.length}
          description="All transactions"
          icon="↗"
          variant="purple"
        />

        <StatCard
          label="Legitimate"
          value={
            history.filter(
              (item) => !item.fraud
            ).length
          }
          description="Safe transactions"
          icon="✓"
          variant="green"
        />

        <StatCard
          label="Fraud Detected"
          value={
            history.filter(
              (item) => item.fraud
            ).length
          }
          description="Flagged transactions"
          icon="!"
          variant="red"
        />

        <StatCard
          label="Fraud Rate"
          value={`${(
            history.length
              ? history.filter(
                  (item) =>
                    item.fraud
                ).length /
                history.length *
                100
              : 0
          ).toFixed(1)}%`}
          description="Detection rate"
          icon="%"
          variant="purple"
        />
      </section>

      <section className="panel">
        <div className="history-toolbar">
          <div>
            <div className="eyebrow">
              RECORDS
            </div>

            <h3>
              All Transactions
            </h3>
          </div>

          <div className="history-tools">
            <div className="search-input">
              <span>⌕</span>

              <input
                value={query}
                onChange={(event) =>
                  setQuery(
                    event.target.value
                  )
                }
                placeholder="Search..."
              />
            </div>

            <div className="filter-buttons">
              {[
                ["all", "All"],
                [
                  "legitimate",
                  "Legitimate",
                ],
                ["fraud", "Fraud"],
              ].map(
                ([value, label]) => (
                  <button
                    key={value}
                    className={
                      filter === value
                        ? "filter-button active"
                        : "filter-button"
                    }
                    onClick={() =>
                      setFilter(value)
                    }
                  >
                    {label}
                  </button>
                )
              )}
            </div>

            {history.length > 0 && (
              <button
                className="danger-outline-button"
                onClick={clearHistory}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            title={
              history.length
                ? "No matching transactions"
                : "No transactions found"
            }
            text={
              history.length
                ? "Try another search or filter."
                : "Analyze a transaction and the result will appear here."
            }
            action={
              history.length
                ? null
                : "Analyze Transaction"
            }
            onClick={() =>
              navigate("analyze")
            }
          />
        ) : (
          <TransactionTable
            transactions={filtered}
          />
        )}
      </section>
    </div>
  );
}

/* =========================================================
   ANALYTICS
========================================================= */

function AnalyticsPage({ history }) {
  const total = history.length;

  const fraud =
    history.filter(
      (item) => item.fraud
    ).length;

  const legitimate =
    total - fraud;

  const averageRisk =
    total === 0
      ? 0
      : history.reduce(
          (sum, item) =>
            sum +
            Number(
              item.probability || 0
            ),
          0
        ) / total;

  const maximumRisk =
    total === 0
      ? 0
      : Math.max(
          ...history.map(
            (item) =>
              Number(
                item.probability ||
                  0
              )
          )
        );

  const legitimatePercent =
    total === 0
      ? 0
      : (legitimate / total) * 100;

  const fraudPercent =
    total === 0
      ? 0
      : (fraud / total) * 100;

  return (
    <div className="page">
      <section className="page-intro">
        <div>
          <div className="eyebrow">
            ANALYTICS
          </div>

          <h2>
            Detection Insights
          </h2>

          <p>
            Performance metrics calculated
            from your analyzed transactions.
          </p>
        </div>
      </section>

      <section className="stats-grid">
        <StatCard
          label="Transactions"
          value={total}
          description="Analyzed transactions"
          icon="↗"
          variant="purple"
        />

        <StatCard
          label="Legitimate"
          value={legitimate}
          description="Low-risk classifications"
          icon="✓"
          variant="green"
        />

        <StatCard
          label="Fraud"
          value={fraud}
          description="High-risk classifications"
          icon="!"
          variant="red"
        />

        <StatCard
          label="Average Risk"
          value={`${(
            averageRisk * 100
          ).toFixed(1)}%`}
          description="Mean fraud probability"
          icon="%"
          variant="purple"
        />
      </section>

      <div className="analytics-grid">
        <section className="panel analytics-panel">
          <div className="eyebrow">
            DISTRIBUTION
          </div>

          <h3>
            Transaction Classification
          </h3>

          {total === 0 ? (
            <EmptyState
              title="No analytics yet"
              text="Analyze transactions to generate detection insights."
            />
          ) : (
            <div className="classification-layout">
              <div
                className="donut-chart"
                style={{
                  "--legitimate":
                    `${legitimatePercent}%`,
                }}
              >
                <div className="donut-center">
                  <strong>
                    {total}
                  </strong>
                  <span>
                    Total
                  </span>
                </div>
              </div>

              <div className="chart-legend">
                <LegendRow
                  label="Legitimate"
                  value={legitimate}
                  percent={
                    legitimatePercent
                  }
                  type="green"
                />

                <LegendRow
                  label="Fraud"
                  value={fraud}
                  percent={
                    fraudPercent
                  }
                  type="red"
                />
              </div>
            </div>
          )}
        </section>

        <section className="panel analytics-panel">
          <div className="eyebrow">
            RISK PROFILE
          </div>

          <h3>
            Current Risk Level
          </h3>

          <div className="risk-profile">
            <div
              className="risk-ring"
              style={{
                "--risk":
                  `${Math.min(
                    averageRisk * 100,
                    100
                  )}%`,
              }}
            >
              <div>
                <strong>
                  {(
                    averageRisk *
                    100
                  ).toFixed(1)}
                  %
                </strong>

                <span>
                  Average
                </span>
              </div>
            </div>

            <div className="risk-facts">
              <Fact
                label="Average Probability"
                value={`${(
                  averageRisk * 100
                ).toFixed(2)}%`}
              />

              <Fact
                label="Highest Probability"
                value={`${(
                  maximumRisk * 100
                ).toFixed(2)}%`}
              />

              <Fact
                label="Decision Threshold"
                value="55%"
              />

              <Fact
                label="Fraud Rate"
                value={`${fraudPercent.toFixed(
                  1
                )}%`}
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

/* =========================================================
   MODEL
========================================================= */

function ModelPage({
  modelInfo,
  apiOnline,
}) {
  return (
    <div className="page">
      <section className="page-intro">
        <div>
          <div className="eyebrow">
            MACHINE LEARNING
          </div>

          <h2>
            Model Intelligence
          </h2>

          <p>
            Information about the model
            currently used for transaction
            risk detection.
          </p>
        </div>
      </section>

      <div className="model-layout">
        <section className="panel">
          <div className="eyebrow">
            DEPLOYED MODEL
          </div>

          <h3>
            Model Details
          </h3>

          <div className="details">
            <DetailRow
              label="Algorithm"
              value={modelInfo.name}
            />

            <DetailRow
              label="Version"
              value={modelInfo.version}
            />

            <DetailRow
              label="Decision Threshold"
              value={modelInfo.threshold}
            />

            <DetailRow
              label="Prediction Type"
              value="Binary Classification"
            />

            <DetailRow
              label="Input Features"
              value={modelInfo.features}
            />

            <DetailRow
              label="Prediction Endpoint"
              value="POST /predict"
            />
          </div>
        </section>

        <section className="panel model-status-card">
          <div className="eyebrow">
            SYSTEM STATUS
          </div>

          <div
            className={`model-status-circle ${
              apiOnline
                ? "success"
                : "danger"
            }`}
          >
            {apiOnline ? "✓" : "!"}
          </div>

          <h3>
            {apiOnline
              ? "Model Online"
              : "Model Offline"}
          </h3>

          <p>
            {apiOnline
              ? "The fraud detection model is available and ready to analyze transactions."
              : "The FastAPI service is currently unavailable."}
          </p>

          <div className="connected-row">
            <span
              className={`status-dot ${
                apiOnline
                  ? "online"
                  : "offline"
              }`}
            />

            {apiOnline
              ? "API Connected"
              : "API Disconnected"}
          </div>
        </section>
      </div>

      <section className="panel pipeline-panel">
        <div className="eyebrow">
          DETECTION PIPELINE
        </div>

        <h3>
          How a Transaction Is Evaluated
        </h3>

        <div className="pipeline">
          <PipelineStep
            number="01"
            title="Input"
            text="30 transaction features enter the system."
          />

          <PipelineArrow />

          <PipelineStep
            number="02"
            title="Model"
            text="Random Forest evaluates the feature vector."
          />

          <PipelineArrow />

          <PipelineStep
            number="03"
            title="Probability"
            text="The model produces a fraud probability."
          />

          <PipelineArrow />

          <PipelineStep
            number="04"
            title="Decision"
            text="Probability is compared with the threshold."
          />
        </div>
      </section>
    </div>
  );
}

/* =========================================================
   SETTINGS
========================================================= */

function SettingsPage({
  apiOnline,
  modelInfo,
}) {
  return (
    <div className="page">
      <section className="page-intro">
        <div>
          <div className="eyebrow">
            CONFIGURATION
          </div>

          <h2>
            Settings
          </h2>

          <p>
            Current application,
            API and model configuration.
          </p>
        </div>
      </section>

      <div className="settings-grid">
        <section className="panel">
          <div className="eyebrow">
            BACKEND
          </div>

          <h3>
            API Configuration
          </h3>

          <div className="details">
            <DetailRow
              label="Base URL"
              value={API_BASE}
            />

            <DetailRow
              label="Status"
              value={
                apiOnline
                  ? "Online"
                  : "Offline"
              }
              success={apiOnline}
            />

            <DetailRow
              label="Prediction"
              value="POST /predict"
            />
          </div>
        </section>

        <section className="panel">
          <div className="eyebrow">
            MODEL
          </div>

          <h3>
            Detection Configuration
          </h3>

          <div className="details">
            <DetailRow
              label="Algorithm"
              value={modelInfo.name}
            />

            <DetailRow
              label="Version"
              value={modelInfo.version}
            />

            <DetailRow
              label="Threshold"
              value={modelInfo.threshold}
            />

            <DetailRow
              label="Features"
              value={modelInfo.features}
            />
          </div>
        </section>
      </div>

      <section className="panel technology-panel">
        <div className="eyebrow">
          TECHNOLOGY
        </div>

        <h3>
          Platform Stack
        </h3>

        <div className="technology-grid">
          <TechCard
            title="Frontend"
            value="React + Vite"
          />

          <TechCard
            title="Backend"
            value="FastAPI"
          />

          <TechCard
            title="Machine Learning"
            value="Python + Scikit-learn"
          />

          <TechCard
            title="Communication"
            value="REST + JSON"
          />
        </div>
      </section>
    </div>
  );
}

/* =========================================================
   ABOUT
========================================================= */

function AboutPage() {
  return (
    <div className="page">
      <section className="about-hero">
        <div className="about-logo">
          <div className="logo-mark large">
            <span />
            <span />
            <span />
          </div>
        </div>

        <div>
          <div className="eyebrow light">
            FRAUDLENS
          </div>

          <h2>
            Intelligent Transaction
            <br />
            Risk Detection
          </h2>

          <p>
            A machine-learning powered platform
            for analyzing transaction risk and
            identifying potentially fraudulent activity.
          </p>
        </div>
      </section>

      <div className="about-grid">
        <section className="panel">
          <div className="eyebrow">
            PURPOSE
          </div>

          <h3>
            What FraudLens Does
          </h3>

          <p className="about-text">
            FraudLens provides an interface
            for analyzing transaction features
            through a deployed machine-learning
            model.
          </p>

          <p className="about-text">
            A transaction is submitted through
            the FastAPI backend, which returns
            a fraud probability, decision
            threshold and classification.
          </p>
        </section>

        <section className="panel">
          <div className="eyebrow">
            TECHNOLOGY
          </div>

          <h3>
            Technology Stack
          </h3>

          <div className="stack-list">
            <StackRow
              label="Frontend"
              value="React + Vite"
            />

            <StackRow
              label="Backend"
              value="FastAPI"
            />

            <StackRow
              label="Machine Learning"
              value="Python + Scikit-learn"
            />

            <StackRow
              label="API"
              value="REST + JSON"
            />
          </div>
        </section>
      </div>

      <section className="panel about-flow">
        <div className="eyebrow">
          SYSTEM FLOW
        </div>

        <h3>
          From Transaction to Risk Decision
        </h3>

        <div className="about-pipeline">
          <FlowItem
            number="01"
            title="Transaction"
            text="Input features"
          />

          <PipelineArrow />

          <FlowItem
            number="02"
            title="FastAPI"
            text="Request processing"
          />

          <PipelineArrow />

          <FlowItem
            number="03"
            title="ML Model"
            text="Risk prediction"
          />

          <PipelineArrow />

          <FlowItem
            number="04"
            title="Result"
            text="Fraud classification"
          />
        </div>
      </section>
    </div>
  );
}

/* =========================================================
   REUSABLE COMPONENTS
========================================================= */

function StatCard({
  label,
  value,
  description,
  icon,
  variant,
}) {
  return (
    <div className="stat-card">
      <div
        className={`stat-icon ${variant}`}
      >
        {icon}
      </div>

      <div>
        <span className="stat-label">
          {label}
        </span>

        <strong className="stat-value">
          {value}
        </strong>

        <small className="stat-description">
          {description}
        </small>
      </div>
    </div>
  );
}

function ModelStat({
  label,
  value,
}) {
  return (
    <div className="model-stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function TransactionTable({
  transactions,
}) {
  return (
    <div className="table-wrapper">
      <table className="transaction-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Date & Time</th>
            <th>Amount</th>
            <th>Probability</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {transactions.map(
            (item) => (
              <tr key={item.id}>
                <td className="transaction-id">
                  TX-
                  {String(
                    item.id
                  ).slice(-6)}
                </td>

                <td>
                  {new Date(
                    item.timestamp
                  ).toLocaleString()}
                </td>

                <td>
                  ${Number(
                    item.amount || 0
                  ).toFixed(2)}
                </td>

                <td>
                  {(
                    Number(
                      item.probability ||
                        0
                    ) * 100
                  ).toFixed(2)}
                  %
                </td>

                <td>
                  <span
                    className={`status-pill ${
                      item.fraud
                        ? "fraud"
                        : "safe"
                    }`}
                  >
                    {item.fraud
                      ? "Fraud"
                      : "Legitimate"}
                  </span>
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
}

function EmptyState({
  title,
  text,
  action,
  onClick,
}) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        ◈
      </div>

      <h3>{title}</h3>

      <p>{text}</p>

      {action && (
        <button
          className="secondary-button"
          onClick={onClick}
        >
          {action}
        </button>
      )}
    </div>
  );
}

function LegendRow({
  label,
  value,
  percent,
  type,
}) {
  return (
    <div className="legend-row">
      <div>
        <span
          className={`legend-dot ${type}`}
        />

        <span>{label}</span>
      </div>

      <strong>
        {value}{" "}
        <small>
          ({percent.toFixed(1)}%)
        </small>
      </strong>
    </div>
  );
}

function Fact({
  label,
  value,
}) {
  return (
    <div className="fact">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function DetailRow({
  label,
  value,
  success,
}) {
  return (
    <div className="detail-row">
      <span>{label}</span>

      <strong
        className={
          success
            ? "success-text"
            : ""
        }
      >
        {value}
      </strong>
    </div>
  );
}

function PipelineStep({
  number,
  title,
  text,
}) {
  return (
    <div className="pipeline-step">
      <span className="pipeline-number">
        {number}
      </span>

      <h4>{title}</h4>

      <p>{text}</p>
    </div>
  );
}

function PipelineArrow() {
  return (
    <div className="pipeline-arrow">
      →
    </div>
  );
}

function TechCard({
  title,
  value,
}) {
  return (
    <div className="technology-card">
      <span>{title}</span>
      <strong>{value}</strong>
    </div>
  );
}

function StackRow({
  label,
  value,
}) {
  return (
    <div className="stack-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function FlowItem({
  number,
  title,
  text,
}) {
  return (
    <div className="flow-item">
      <span>{number}</span>

      <strong>{title}</strong>

      <small>{text}</small>
    </div>
  );
}

export default App;
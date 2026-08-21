import { useEffect, useState } from "react";
import "./App.css";

import {
  API_BASE,
  checkApi,
  getAnalytics,
  getModelInfo,
  getTransactions,
  predictTransaction,
  updateReviewStatus,
} from "./services/api";

const FEATURE_NAMES = [
  "Time", "V1", "V2", "V3", "V4", "V5", "V6", "V7",
  "V8", "V9", "V10", "V11", "V12", "V13", "V14",
  "V15", "V16", "V17", "V18", "V19", "V20", "V21",
  "V22", "V23", "V24", "V25", "V26", "V27", "V28",
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

/*
 * Genuine fraud row from the project's creditcard.csv.
 * Your current saved Random Forest scored this row at 100%.
 */
const FRAUD_SAMPLE = [
  170348.0,
  1.9919760961759,
  0.158475887304227,
  -2.58344064503516,
  0.408669992998441,
  1.15114706077937,
  -0.0966947441848027,
  0.223050267455537,
  -0.0683838777747007,
  0.577829383844873,
  -0.888721675865145,
  0.491140241656789,
  0.728903319843614,
  0.380428045513993,
  -1.94888334870021,
  -0.832498136300872,
  0.519435549203291,
  0.903562376617253,
  1.19731471799372,
  0.593508846946918,
  -0.0176522567052908,
  -0.164350327825504,
  -0.295135166851559,
  -0.0721725311018398,
  -0.450261313423321,
  0.313266608995469,
  -0.289616585696882,
  0.002987582243429,
  -0.0153088128485981,
  42.53,
];

const DEFAULT_MODEL = {
  model_name: "Random Forest",
  model_version: "1.0.0",
  threshold: 0.55,
  precision: null,
  recall: null,
  f1_score: null,
  roc_auc: null,
  pr_auc: null,
  training_date: null,
  feature_count: 30,
};

const DEFAULT_ANALYTICS = {
  total_transactions: 0,
  legitimate: 0,
  fraud_detected: 0,
  fraud_rate: 0,
  average_risk: 0,
  highest_risk: 0,
};

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
      "Evaluate a transaction for potential fraud risk.",
  },
  history: {
    eyebrow: "TRANSACTION RECORDS",
    title: "Transaction History",
    description:
      "Review and investigate analyzed transactions.",
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
  const [history, setHistory] = useState([]);
  const [analytics, setAnalytics] = useState(DEFAULT_ANALYTICS);
  const [modelInfo, setModelInfo] = useState(DEFAULT_MODEL);
  const [apiOnline, setApiOnline] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [globalError, setGlobalError] = useState("");
  const [lastResult, setLastResult] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const loadApplicationData = async () => {
    try {
      setGlobalError("");

      const [
        ,
        model,
        transactions,
        analyticsData,
      ] = await Promise.all([
        checkApi(),
        getModelInfo(),
        getTransactions(),
        getAnalytics(),
      ]);

      setApiOnline(true);

      setModelInfo({
        ...DEFAULT_MODEL,
        ...model,
      });

      setHistory(
        Array.isArray(transactions) ? transactions : []
      );

      setAnalytics({
        ...DEFAULT_ANALYTICS,
        ...analyticsData,
      });
    } catch (error) {
      setApiOnline(false);
      setGlobalError(
        error.message || "Unable to connect to the backend."
      );
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    loadApplicationData();

    const interval = setInterval(
      loadApplicationData,
      15000
    );

    return () => clearInterval(interval);
  }, []);

  const navigate = (page) => {
    setActivePage(page);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const refreshTransactionData = async () => {
    try {
      const [transactions, analyticsData] =
        await Promise.all([
          getTransactions(),
          getAnalytics(),
        ]);

      setHistory(
        Array.isArray(transactions) ? transactions : []
      );

      setAnalytics({
        ...DEFAULT_ANALYTICS,
        ...analyticsData,
      });

      setApiOnline(true);

      return transactions;
    } catch (error) {
      setApiOnline(false);
      setGlobalError(
        error.message || "Unable to refresh transaction data."
      );
      return null;
    }
  };

  const handlePrediction = async (data) => {
    setLastResult(data);
    await refreshTransactionData();
  };

  const handleReviewStatus = async (id, status) => {
    try {
      const updated = await updateReviewStatus(
        id,
        status
      );

      setHistory((current) =>
        current.map((item) =>
          item.id === updated.id ? updated : item
        )
      );

      setSelectedTransaction(updated);
      await refreshTransactionData();
    } catch (error) {
      setGlobalError(
        error.message || "Unable to update review status."
      );
    }
  };

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return (
          <Dashboard
            history={history}
            analytics={analytics}
            modelInfo={modelInfo}
            navigate={navigate}
            loading={initialLoading}
            onSelectTransaction={setSelectedTransaction}
          />
        );

      case "analyze":
        return (
          <AnalyzePage
            apiOnline={apiOnline}
            modelInfo={modelInfo}
            onPrediction={handlePrediction}
            lastResult={lastResult}
          />
        );

      case "history":
        return (
          <HistoryPage
            history={history}
            navigate={navigate}
            onReviewStatusChange={handleReviewStatus}
            onSelectTransaction={setSelectedTransaction}
            loading={initialLoading}
          />
        );

      case "analytics":
        return (
          <AnalyticsPage
            history={history}
            analytics={analytics}
            loading={initialLoading}
          />
        );

      case "model":
        return (
          <ModelPage
            modelInfo={modelInfo}
            apiOnline={apiOnline}
            loading={initialLoading}
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
            analytics={analytics}
            modelInfo={modelInfo}
            navigate={navigate}
            loading={initialLoading}
            onSelectTransaction={setSelectedTransaction}
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

        {globalError && (
          <div className="global-error">
            <strong>Backend Notice:</strong>{" "}
            {globalError}
          </div>
        )}

        <main className="main-content">
          {renderPage()}
        </main>

        <footer className="app-footer">
          <span>FraudLens</span>
          <span>
            Intelligent Transaction Risk Detection
          </span>
          <span>
            Model {modelInfo.model_version || "1.0.0"}
          </span>
        </footer>
      </div>

      {selectedTransaction && (
        <TransactionDetails
          transaction={selectedTransaction}
          onUpdated={(updated) => {
            setSelectedTransaction(updated);

            setHistory((current) =>
              current.map((item) =>
                item.id === updated.id ? updated : item
              )
            );
          }}
          onClose={() =>
            setSelectedTransaction(null)
          }
        />
      )}
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
      items: [["dashboard", "Dashboard", "▦"]],
    },
    {
      title: "DETECTION",
      items: [["analyze", "Analyze Transaction", "⌁"]],
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
      items: [["about", "About", "ⓘ"]],
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
          <div className="nav-group" key={group.title}>
            <div className="nav-group-title">
              {group.title}
            </div>

            {group.items.map(([id, label, icon]) => (
              <button
                key={id}
                className={`nav-item ${
                  activePage === id ? "active" : ""
                }`}
                onClick={() => navigate(id)}
              >
                <span className="nav-icon">{icon}</span>
                <span className="nav-label">{label}</span>
              </button>
            ))}
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
            {apiOnline ? "API Online" : "API Offline"}
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
  analytics,
  modelInfo,
  navigate,
  loading,
  onSelectTransaction,
}) {
  const total = Number(
    analytics.total_transactions || 0
  );

  const fraud = Number(
    analytics.fraud_detected || 0
  );

  const legitimate = Number(
    analytics.legitimate || 0
  );

  const averageRisk = Number(
    analytics.average_risk || 0
  );

  const fraudRate = Number(
    analytics.fraud_rate || 0
  );

  const highRiskTransactions = history
    .filter((item) => item.risk_level === "High")
    .slice(0, 4);

  const pendingHighRisk = history.filter(
    (item) =>
      item.risk_level === "High" &&
      item.review_status === "Pending"
  ).length;

  return (
    <div className="page">
      <section className="page-intro">
        <div>
          <div className="eyebrow">
            TRANSACTION OVERVIEW
          </div>

          <h2>Fraud Detection Dashboard</h2>

          <p>
            Monitor transaction activity, risk levels
            and fraud detection performance from one place.
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
          value={loading ? "—" : total}
          description="Stored transactions"
          icon="↗"
          variant="purple"
        />

        <StatCard
          label="Legitimate"
          value={loading ? "—" : legitimate}
          description="Low-risk transactions"
          icon="✓"
          variant="green"
        />

        <StatCard
          label="Fraud Detected"
          value={loading ? "—" : fraud}
          description="High-risk transactions"
          icon="!"
          variant="red"
        />

        <StatCard
          label="Pending Review"
          value={loading ? "—" : pendingHighRisk}
          description="High-risk cases"
          icon="◷"
          variant="purple"
        />
      </section>

      <section className="dashboard-grid">
        <div className="panel model-panel">
          <div className="panel-heading">
            <div>
              <div className="eyebrow">MODEL</div>
              <h3>Detection Model</h3>
            </div>

            <span className="online-badge">
              <span className="status-dot online" />
              Online
            </span>
          </div>

          <div className="model-grid">
            <ModelStat
              label="Algorithm"
              value={modelInfo.model_name}
            />

            <ModelStat
              label="Version"
              value={modelInfo.model_version}
            />

            <ModelStat
              label="Threshold"
              value={modelInfo.threshold}
            />

            <ModelStat
              label="Features"
              value={modelInfo.feature_count || 30}
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
          <div className="eyebrow">QUICK ACTION</div>

          <div className="quick-icon">◈</div>

          <h3>Analyze a Transaction</h3>

          <p>
            Review a transaction and get a clear
            risk assessment from the deployed model.
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
              HIGH-RISK ACTIVITY
            </div>

            <h3>
              Transactions Requiring Attention
            </h3>
          </div>

          {highRiskTransactions.length > 0 && (
            <button
              className="text-button"
              onClick={() => navigate("history")}
            >
              View All →
            </button>
          )}
        </div>

        {highRiskTransactions.length === 0 ? (
          <EmptyState
            title="No high-risk transactions"
            text="Transactions with elevated risk will appear here for review."
            action="Analyze Transaction"
            onClick={() => navigate("analyze")}
          />
        ) : (
          <TransactionTable
            transactions={highRiskTransactions}
            onReviewStatusChange={() => {}}
            onSelectTransaction={onSelectTransaction}
          />
        )}
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <div className="eyebrow">RISK OVERVIEW</div>
            <h3>Current Transaction Risk</h3>
          </div>
        </div>

        <div className="dashboard-risk-summary">
          <Fact
            label="Average Risk"
            value={`${(averageRisk * 100).toFixed(1)}%`}
          />

          <Fact
            label="Fraud Rate"
            value={`${fraudRate.toFixed(1)}%`}
          />

          <Fact
            label="Highest Risk"
            value={`${(
              Number(analytics.highest_risk || 0) * 100
            ).toFixed(1)}%`}
          />

          <Fact
            label="Transactions"
            value={total}
          />
        </div>
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
  const [reference, setReference] = useState("");
  const [amount, setAmount] = useState("");
  const [transactionTime, setTransactionTime] =
    useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [features, setFeatures] = useState(
    Array(30).fill("")
  );
  const [result, setResult] = useState(lastResult);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (lastResult) {
      setResult(lastResult);

      if (lastResult.reference) {
        setReference(lastResult.reference);
      }

      if (lastResult.amount !== undefined) {
        setAmount(String(lastResult.amount));
      }
    }
  }, [lastResult]);

  const updateFeature = (index, value) => {
    const updated = [...features];
    updated[index] = value;
    setFeatures(updated);
  };

  const loadLegitimateSample = () => {
    setFeatures(
      SAMPLE_TRANSACTION.map(String)
    );

    setReference(
      `TX-${String(Date.now()).slice(-6)}`
    );

    setAmount(
      String(SAMPLE_TRANSACTION[29])
    );

    setTransactionTime(
      new Date().toLocaleString()
    );

    setResult(null);
    setError("");
  };

  const loadFraudSample = () => {
    setFeatures(
      FRAUD_SAMPLE.map(String)
    );

    setReference("FRAUD-TEST-001");

    setAmount(
      String(FRAUD_SAMPLE[29])
    );

    setTransactionTime(
      "170348"
    );

    setShowAdvanced(false);
    setResult(null);
    setError("");
  };

  const clear = () => {
    setReference("");
    setAmount("");
    setTransactionTime("");
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
      (value, index) => {
        if (
          value === "" ||
          value === null ||
          value === undefined
        ) {
          if (index === 29 && amount !== "") {
            return Number(amount) || 0;
          }

          return 0;
        }

        const number = Number(value);

        return Number.isFinite(number)
          ? number
          : 0;
      }
    );

    if (amount !== "") {
      values[29] =
        Number(amount) || 0;
    }

    setLoading(true);

    try {
      const data =
        await predictTransaction(
          values,
          reference,
          transactionTime
        );

      setResult(data);
      onPrediction(data);
    } catch (err) {
      setError(
        err.message ||
          "Unable to analyze transaction."
      );
    } finally {
      setLoading(false);
    }
  };

  const probability =
    Number(result?.probability || 0) * 100;

  const threshold =
    Number(
      result?.threshold ??
        modelInfo.threshold ??
        0.55
    ) * 100;

  const riskLevel =
    result?.risk_level ||
    (result?.fraud ? "High" : "Low");

  const isHighRisk =
    riskLevel === "High";

  return (
    <div className="page">
      <section className="page-intro">
        <div>
          <div className="eyebrow">
            TRANSACTION ANALYSIS
          </div>

          <h2>Review a Transaction</h2>

          <p>
            Enter the basic transaction information,
            then run the fraud risk assessment.
          </p>
        </div>
      </section>

      <div className="sample-actions">
        <button
          className="secondary-button"
          onClick={loadLegitimateSample}
        >
          Use Legitimate Sample
        </button>

        <button
          className="fraud-test-button"
          onClick={loadFraudSample}
        >
          Test Fraud Scenario
        </button>
      </div>

      <div className="user-analysis-grid">
        <section className="panel user-input-panel">
          <div className="panel-heading">
            <div>
              <div className="eyebrow">
                TRANSACTION DETAILS
              </div>

              <h3>
                Transaction Information
              </h3>
            </div>
          </div>

          <div className="business-input-grid">
            <div className="business-field">
              <label>
                Transaction Reference
              </label>

              <input
                value={reference}
                onChange={(event) =>
                  setReference(
                    event.target.value
                  )
                }
                placeholder="e.g. TX-10482"
              />

              <small>
                Used to identify this transaction
                in history.
              </small>
            </div>

            <div className="business-field">
              <label>
                Transaction Amount
              </label>

              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(event) =>
                  setAmount(
                    event.target.value
                  )
                }
                placeholder="e.g. 149.62"
              />

              <small>
                Used as the model's Amount feature.
              </small>
            </div>

            <div className="business-field">
              <label>
                Transaction Time
              </label>

              <input
                value={transactionTime}
                onChange={(event) =>
                  setTransactionTime(
                    event.target.value
                  )
                }
                placeholder="e.g. 170348"
              />

              <small>
                Stored with the transaction record.
              </small>
            </div>
          </div>

          <div className="analysis-divider" />

          <div className="advanced-toggle-row">
            <div>
              <div className="eyebrow">
                MODEL INPUTS
              </div>

              <strong>
                Advanced Model Features
              </strong>

              <p>
                Technical inputs used directly
                by the deployed model.
              </p>
            </div>

            <button
              className="advanced-toggle"
              onClick={() =>
                setShowAdvanced(
                  (previous) => !previous
                )
              }
            >
              {showAdvanced
                ? "Hide Advanced Inputs"
                : "Show Advanced Inputs"}

              <span>
                {showAdvanced ? "↑" : "↓"}
              </span>
            </button>
          </div>

          {showAdvanced && (
            <div className="advanced-model-section">
              <div className="advanced-warning">
                These are technical model inputs:
                Time, V1–V28 and Amount. Most
                users do not need to modify them
                manually.
              </div>

              <div className="feature-grid">
                {FEATURE_NAMES.map(
                  (name, index) => (
                    <div
                      className="feature-field"
                      key={name}
                    >
                      <label>{name}</label>

                      <input
                        type="number"
                        step="any"
                        value={
                          name === "Amount" &&
                          amount !== ""
                            ? amount
                            : features[index]
                        }
                        placeholder="0"
                        onChange={(event) => {
                          updateFeature(
                            index,
                            event.target.value
                          );

                          if (
                            name === "Amount"
                          ) {
                            setAmount(
                              event.target.value
                            );
                          }
                        }}
                      />
                    </div>
                  )
                )}
              </div>
            </div>
          )}

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

        <section className="panel risk-assessment-panel">
          <div className="eyebrow">
            RISK ASSESSMENT
          </div>

          {!result && !error && (
            <div className="assessment-empty">
              <div className="assessment-icon">
                ◈
              </div>

              <span className="assessment-kicker">
                READY TO ANALYZE
              </span>

              <h3>
                Waiting for a transaction
              </h3>

              <p>
                Submit a transaction to generate
                a fraud risk assessment.
              </p>
            </div>
          )}

          {error && (
            <div className="assessment-empty">
              <div className="assessment-icon danger">
                !
              </div>

              <span className="assessment-kicker danger-text">
                UNAVAILABLE
              </span>

              <h3>
                Risk assessment unavailable
              </h3>

              <p>{error}</p>
            </div>
          )}

          {result && !error && (
            <div className="risk-assessment-result">
              <div
                className={`risk-status-circle ${
                  isHighRisk
                    ? "high-risk"
                    : riskLevel === "Medium"
                    ? "medium-risk"
                    : "low-risk"
                }`}
              >
                {isHighRisk
                  ? "!"
                  : riskLevel === "Medium"
                  ? "•"
                  : "✓"}
              </div>

              <div
                className={`assessment-kicker ${
                  isHighRisk
                    ? "danger-text"
                    : riskLevel === "Medium"
                    ? "medium-text"
                    : "success-text"
                }`}
              >
                {riskLevel.toUpperCase()} RISK
              </div>

              <h3>
                {isHighRisk
                  ? "Potential Fraud"
                  : riskLevel === "Medium"
                  ? "Elevated Risk"
                  : "Transaction Appears Legitimate"}
              </h3>

              <p className="assessment-summary">
                {result.risk_explanation ||
                  (isHighRisk
                    ? "The predicted risk exceeds the configured detection threshold and should be reviewed."
                    : "The predicted risk is below the configured detection threshold.")}
              </p>

              <div className="risk-score-card">
                <div className="risk-score-heading">
                  <span>
                    Fraud Probability
                  </span>

                  <strong>
                    {probability.toFixed(2)}%
                  </strong>
                </div>

                <div className="risk-track">
                  <div
                    className={
                      isHighRisk
                        ? "risk-fill high"
                        : "risk-fill"
                    }
                    style={{
                      width: `${Math.min(
                        probability,
                        100
                      )}%`,
                    }}
                  />
                </div>

                <small>
                  Decision threshold:{" "}
                  {threshold.toFixed(0)}%
                </small>
              </div>

              <div className="assessment-facts">
                <div>
                  <span>Decision</span>

                  <strong>
                    {result.fraud
                      ? "Fraud"
                      : "Legitimate"}
                  </strong>
                </div>

                <div>
                  <span>Transaction</span>

                  <strong>
                    {result.reference ||
                      reference ||
                      "Unspecified"}
                  </strong>
                </div>

                <div>
                  <span>Review</span>

                  <strong>
                    {result.review_status ||
                      "Pending"}
                  </strong>
                </div>

                <div>
                  <span>Model</span>

                  <strong>
                    {result.model_version ||
                      modelInfo.model_version}
                  </strong>
                </div>
              </div>

              <div className="assessment-note">
                <strong>
                  What this means
                </strong>

                <span>
                  This is a risk signal for
                  investigation, not absolute
                  proof of fraud.
                </span>
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
  onReviewStatusChange,
  onSelectTransaction,
  loading,
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = history.filter((item) => {
    const searchText =
      `${item.reference || ""} ${item.id} ${
        item.amount
      } ${item.risk_level || ""} ${
        item.review_status || ""
      } ${new Date(
        item.created_at
      ).toLocaleString()}`.toLowerCase();

    const matchesSearch =
      searchText.includes(
        query.toLowerCase()
      );

    const matchesFilter =
      filter === "all" ||
      (filter === "fraud" && item.fraud) ||
      (filter === "legitimate" && !item.fraud) ||
      (filter === "pending" &&
        item.review_status === "Pending");

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="page">
      <section className="page-intro history-intro">
        <div>
          <div className="eyebrow">
            INVESTIGATION
          </div>

          <h2>Transaction History</h2>

          <p>
            Review transactions stored in the FraudLens
            database and investigate risk signals.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={() => navigate("analyze")}
        >
          + New Analysis
        </button>
      </section>

      <section className="stats-grid">
        <StatCard
          label="Total"
          value={loading ? "—" : history.length}
          description="Stored transactions"
          icon="↗"
          variant="purple"
        />

        <StatCard
          label="Legitimate"
          value={
            loading
              ? "—"
              : history.filter(
                  (item) => !item.fraud
                ).length
          }
          description="Low-risk"
          icon="✓"
          variant="green"
        />

        <StatCard
          label="Fraud"
          value={
            loading
              ? "—"
              : history.filter(
                  (item) => item.fraud
                ).length
          }
          description="High-risk"
          icon="!"
          variant="red"
        />

        <StatCard
          label="Pending Review"
          value={
            loading
              ? "—"
              : history.filter(
                  (item) =>
                    item.review_status ===
                    "Pending"
                ).length
          }
          description="Needs attention"
          icon="◷"
          variant="purple"
        />
      </section>

      <section className="panel">
        <div className="history-toolbar">
          <div>
            <div className="eyebrow">RECORDS</div>
            <h3>All Transactions</h3>
          </div>

          <div className="history-tools">
            <div className="search-input">
              <span>⌕</span>

              <input
                value={query}
                onChange={(event) =>
                  setQuery(event.target.value)
                }
                placeholder="Search..."
              />
            </div>

            <div className="filter-buttons">
              {[
                ["all", "All"],
                ["legitimate", "Legitimate"],
                ["fraud", "Fraud"],
                ["pending", "Pending"],
              ].map(([value, label]) => (
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
              ))}
            </div>
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
                : "Analyze a transaction to create your first database record."
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
            onReviewStatusChange={
              onReviewStatusChange
            }
            onSelectTransaction={
              onSelectTransaction
            }
          />
        )}
      </section>
    </div>
  );
}

/* =========================================================
   ANALYTICS
========================================================= */

function AnalyticsPage({
  history,
  analytics,
  loading,
}) {
  const total = Number(
    analytics.total_transactions ||
      history.length ||
      0
  );

  const fraud = Number(
    analytics.fraud_detected || 0
  );

  const legitimate = Number(
    analytics.legitimate || 0
  );

  const averageRisk = Number(
    analytics.average_risk || 0
  );

  const maximumRisk = Number(
    analytics.highest_risk || 0
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
          <div className="eyebrow">ANALYTICS</div>

          <h2>Detection Insights</h2>

          <p>
            Metrics calculated directly from your
            stored transactions.
          </p>
        </div>
      </section>

      <section className="stats-grid">
        <StatCard
          label="Transactions"
          value={loading ? "—" : total}
          description="Stored transactions"
          icon="↗"
          variant="purple"
        />

        <StatCard
          label="Legitimate"
          value={loading ? "—" : legitimate}
          description="Low-risk"
          icon="✓"
          variant="green"
        />

        <StatCard
          label="Fraud"
          value={loading ? "—" : fraud}
          description="High-risk"
          icon="!"
          variant="red"
        />

        <StatCard
          label="Average Risk"
          value={
            loading
              ? "—"
              : `${(
                  averageRisk * 100
                ).toFixed(1)}%`
          }
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

          <h3>Transaction Classification</h3>

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
                  <strong>{total}</strong>
                  <span>Total</span>
                </div>
              </div>

              <div className="chart-legend">
                <LegendRow
                  label="Legitimate"
                  value={legitimate}
                  percent={legitimatePercent}
                  type="green"
                />

                <LegendRow
                  label="Fraud"
                  value={fraud}
                  percent={fraudPercent}
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

          <h3>Current Risk Level</h3>

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
                    averageRisk * 100
                  ).toFixed(1)}%
                </strong>
                <span>Average</span>
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
  loading,
}) {
  const formatPercent = (value) => {
    if (
      value === null ||
      value === undefined
    ) {
      return "—";
    }

    return `${(
      Number(value) * 100
    ).toFixed(2)}%`;
  };

  const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return value;
    }

    return date.toLocaleString(
      undefined,
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  return (
    <div className="page">
      <section className="page-intro">
        <div>
          <div className="eyebrow">
            MACHINE LEARNING
          </div>

          <h2>Model Intelligence</h2>

          <p>
            Information about the model currently
            used for transaction risk detection.
          </p>
        </div>
      </section>

      <div className="model-layout">
        <section className="panel">
          <div className="eyebrow">
            DEPLOYED MODEL
          </div>

          <h3>Model Details</h3>

          <div className="details">
            <DetailRow
              label="Algorithm"
              value={modelInfo.model_name}
            />

            <DetailRow
              label="Version"
              value={modelInfo.model_version}
            />

            <DetailRow
              label="Decision Threshold"
              value={Number(
                modelInfo.threshold
              ).toFixed(2)}
            />

            <DetailRow
              label="Prediction Type"
              value="Binary Classification"
            />

            <DetailRow
              label="Input Features"
              value={
                modelInfo.feature_count ||
                30
              }
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

      <section className="panel">
        <div className="eyebrow">
          MODEL PERFORMANCE
        </div>

        <h3>Evaluation Metrics</h3>

        {loading ? (
          <div className="metrics-loading">
            Loading model metrics...
          </div>
        ) : (
          <div className="metrics-grid">
            <MetricCard
              label="Precision"
              value={formatPercent(
                modelInfo.precision
              )}
              description="Precision of fraud predictions"
              variant="purple"
            />

            <MetricCard
              label="Recall"
              value={formatPercent(
                modelInfo.recall
              )}
              description="Fraud cases successfully detected"
              variant="green"
            />

            <MetricCard
              label="F1 Score"
              value={formatPercent(
                modelInfo.f1_score
              )}
              description="Balance between precision and recall"
              variant="blue"
            />

            <MetricCard
              label="ROC-AUC"
              value={formatPercent(
                modelInfo.roc_auc
              )}
              description="Overall ranking performance"
              variant="purple"
            />

            <MetricCard
              label="PR-AUC"
              value={formatPercent(
                modelInfo.pr_auc
              )}
              description="Precision-recall performance"
              variant="blue"
            />

            <MetricCard
              label="Training Date"
              value={formatDate(
                modelInfo.training_date
              )}
              description="Model training timestamp"
              variant="neutral"
            />
          </div>
        )}
      </section>

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
            text={`${modelInfo.model_name} evaluates the feature vector.`}
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
            text={`Probability is compared with the ${(
              Number(
                modelInfo.threshold
              ) * 100
            ).toFixed(0)}% threshold.`}
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

          <h2>Settings</h2>

          <p>
            Current application, API and model
            configuration.
          </p>
        </div>
      </section>

      <div className="settings-grid">
        <section className="panel">
          <div className="eyebrow">BACKEND</div>

          <h3>API Configuration</h3>

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

            <DetailRow
              label="Transactions"
              value="GET /transactions"
            />

            <DetailRow
              label="Analytics"
              value="GET /analytics"
            />
          </div>
        </section>

        <section className="panel">
          <div className="eyebrow">MODEL</div>

          <h3>
            Detection Configuration
          </h3>

          <div className="details">
            <DetailRow
              label="Algorithm"
              value={modelInfo.model_name}
            />

            <DetailRow
              label="Version"
              value={modelInfo.model_version}
            />

            <DetailRow
              label="Threshold"
              value={Number(
                modelInfo.threshold
              ).toFixed(2)}
            />

            <DetailRow
              label="Features"
              value={
                modelInfo.feature_count ||
                30
              }
            />
          </div>
        </section>
      </div>

      <section className="panel technology-panel">
        <div className="eyebrow">TECHNOLOGY</div>

        <h3>Platform Stack</h3>

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
            title="Database"
            value="PostgreSQL"
          />

          <TechCard
            title="Machine Learning"
            value="Scikit-learn"
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
          <div className="eyebrow">PURPOSE</div>

          <h3>What FraudLens Does</h3>

          <p className="about-text">
            FraudLens analyzes transaction data,
            assigns a fraud probability and helps
            users prioritize potentially suspicious
            transactions for review.
          </p>

          <p className="about-text">
            Predictions and transaction records are
            served through FastAPI and stored in
            PostgreSQL.
          </p>
        </section>

        <section className="panel">
          <div className="eyebrow">TECHNOLOGY</div>

          <h3>Technology Stack</h3>

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
              label="Database"
              value="PostgreSQL"
            />

            <StackRow
              label="Machine Learning"
              value="Python + Scikit-learn"
            />
          </div>
        </section>
      </div>

      <section className="panel about-flow">
        <div className="eyebrow">SYSTEM FLOW</div>

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
            title="PostgreSQL"
            text="Persistent record"
          />
        </div>
      </section>
    </div>
  );
}

/* =========================================================
   TABLE
========================================================= */

function TransactionTable({
  transactions,
  onReviewStatusChange,
  onSelectTransaction,
}) {
  return (
    <div className="table-wrapper">
      <table className="transaction-table">
        <thead>
          <tr>
            <th>Reference</th>
            <th>Date & Time</th>
            <th>Amount</th>
            <th>Risk</th>
            <th>Decision</th>
            <th>Review</th>
          </tr>
        </thead>

        <tbody>
          {transactions.map((item) => (
            <tr key={item.id}>
              <td className="transaction-id">
                <button
                  className="transaction-link"
                  onClick={() =>
                    onSelectTransaction(
                      item
                    )
                  }
                >
                  {item.reference ||
                    `TX-${String(
                      item.id
                    ).slice(-6)}`}
                </button>
              </td>

              <td>
                {item.created_at
                  ? new Date(
                      item.created_at
                    ).toLocaleString()
                  : "—"}
              </td>

              <td>
                $
                {Number(
                  item.amount || 0
                ).toFixed(2)}
              </td>

              <td>
                <span
                  className={`status-pill ${
                    item.risk_level === "High"
                      ? "fraud"
                      : item.risk_level === "Medium"
                      ? "medium-risk"
                      : "safe"
                  }`}
                >
                  {item.risk_level || "Low"}
                </span>
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

              <td>
                <select
                  className="review-select"
                  value={
                    item.review_status ||
                    "Pending"
                  }
                  onChange={(event) =>
                    onReviewStatusChange(
                      item.id,
                      event.target.value
                    )
                  }
                >
                  <option value="Pending">
                    Pending
                  </option>

                  <option value="Reviewed">
                    Reviewed
                  </option>

                  <option value="Dismissed">
                    Dismissed
                  </option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* =========================================================
   TRANSACTION DETAILS
========================================================= */

function TransactionDetails({
  transaction,
  onUpdated,
  onClose,
}) {
  const [updating, setUpdating] =
    useState(false);

  const [error, setError] =
    useState("");

  if (!transaction) {
    return null;
  }

  const isHighRisk =
    transaction.risk_level === "High";

  const isMediumRisk =
    transaction.risk_level === "Medium";

  const probability =
    Number(
      transaction.probability || 0
    ) * 100;

  const threshold =
    Number(
      transaction.threshold || 0.55
    ) * 100;

  const handleStatusChange =
    async (status) => {
      setUpdating(true);
      setError("");

      try {
        const updated =
          await updateReviewStatus(
            transaction.id,
            status
          );

        onUpdated(updated);
      } catch (err) {
        setError(
          err.message ||
            "Unable to update review status."
        );
      } finally {
        setUpdating(false);
      }
    };

  return (
    <div className="transaction-detail-overlay">
      <div className="transaction-detail-panel">
        <div className="transaction-detail-header">
          <div>
            <div className="eyebrow">
              TRANSACTION REVIEW
            </div>

            <h2>
              {transaction.reference}
            </h2>

            <p>
              Transaction #{transaction.id}
            </p>
          </div>

          <button
            className="detail-close-button"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div
          className={`detail-risk-banner ${
            isHighRisk
              ? "high"
              : isMediumRisk
              ? "medium"
              : "low"
          }`}
        >
          <div className="detail-risk-icon">
            {isHighRisk
              ? "!"
              : isMediumRisk
              ? "•"
              : "✓"}
          </div>

          <div>
            <span>
              {isHighRisk
                ? "HIGH RISK"
                : isMediumRisk
                ? "MEDIUM RISK"
                : "LOW RISK"}
            </span>

            <strong>
              {transaction.fraud
                ? "Potential Fraud"
                : "Transaction Appears Legitimate"}
            </strong>
          </div>
        </div>

        <div className="detail-section">
          <div className="eyebrow">
            RISK ASSESSMENT
          </div>

          <h3>
            Why was this transaction classified this way?
          </h3>

          <div className="detail-risk-score">
            <div>
              <span>
                Fraud Probability
              </span>

              <strong>
                {probability.toFixed(2)}%
              </strong>
            </div>

            <div className="detail-risk-track">
              <div
                className={
                  isHighRisk
                    ? "high"
                    : isMediumRisk
                    ? "medium"
                    : ""
                }
                style={{
                  width: `${Math.min(
                    probability,
                    100
                  )}%`,
                }}
              />
            </div>

            <small>
              Decision threshold:{" "}
              {threshold.toFixed(0)}%
            </small>
          </div>

          <div className="plain-language-explanation">
            <strong>
              Explanation
            </strong>

            <p>
              {transaction.risk_explanation ||
                "No explanation is available for this transaction."}
            </p>
          </div>
        </div>

        <div className="detail-section">
          <div className="eyebrow">
            TRANSACTION INFORMATION
          </div>

          <div className="detail-info-grid">
            <DetailItem
              label="Amount"
              value={`$${Number(
                transaction.amount || 0
              ).toFixed(2)}`}
            />

            <DetailItem
              label="Classification"
              value={
                transaction.fraud
                  ? "Fraud"
                  : "Legitimate"
              }
            />

            <DetailItem
              label="Risk Level"
              value={
                transaction.risk_level ||
                "Low"
              }
            />

            <DetailItem
              label="Model Version"
              value={
                transaction.model_version ||
                "1.0.0"
              }
            />

            <DetailItem
              label="Review Status"
              value={
                transaction.review_status ||
                "Pending"
              }
            />

            <DetailItem
              label="Analyzed"
              value={
                transaction.created_at
                  ? new Date(
                      transaction.created_at
                    ).toLocaleString()
                  : "—"
              }
            />
          </div>
        </div>

        <div className="detail-section">
          <div className="eyebrow">
            REVIEW
          </div>

          <div className="review-status-display">
            <span>
              Current Status
            </span>

            <strong>
              {transaction.review_status ||
                "Pending"}
            </strong>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="detail-actions">
            <button
              className="secondary-button"
              onClick={() =>
                handleStatusChange(
                  "Dismissed"
                )
              }
              disabled={updating}
            >
              Dismiss
            </button>

            <button
              className="primary-button"
              onClick={() =>
                handleStatusChange(
                  "Reviewed"
                )
              }
              disabled={updating}
            >
              {updating
                ? "Updating..."
                : "Mark as Reviewed"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailItem({
  label,
  value,
}) {
  return (
    <div className="detail-info-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

/* =========================================================
   SHARED COMPONENTS
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

function MetricCard({
  label,
  value,
  description,
  variant,
}) {
  return (
    <div
      className={`metric-card ${variant}`}
    >
      <span className="metric-label">
        {label}
      </span>

      <strong className="metric-value">
        {value}
      </strong>

      <small>{description}</small>
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
        className={success ? "success-text" : ""}
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
import { useEffect, useState } from "react";

import StatCard from "../components/StatCard";
import TransactionTable from "../components/TransactionTable";

function Dashboard({ navigate, apiOnline, modelInfo }) {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const saved =
      JSON.parse(localStorage.getItem("fraudTransactions")) || [];

    setTransactions(saved);
  }, []);

  const total = transactions.length;

  const fraudCount = transactions.filter(
    (item) => item.fraud
  ).length;

  const legitimateCount = total - fraudCount;

  const averageRisk =
    total === 0
      ? 0
      : transactions.reduce(
          (sum, item) =>
            sum + Number(item.probability || 0),
          0
        ) / total;

  return (
    <div className="page">
      <section className="page-heading">
        <div>
          <span className="eyebrow">OVERVIEW</span>

          <h2>Fraud Detection Dashboard</h2>

          <p>
            Monitor transaction activity, risk levels and
            fraud detection performance.
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
          label="Total Transactions"
          value={total}
          description="Transactions analyzed"
          icon="◎"
          variant="purple"
        />

        <StatCard
          label="Legitimate"
          value={legitimateCount}
          description="Safe transactions"
          icon="✓"
          variant="green"
        />

        <StatCard
          label="Fraud Detected"
          value={fraudCount}
          description="Suspicious transactions"
          icon="!"
          variant="red"
        />

        <StatCard
          label="Average Risk"
          value={`${(averageRisk * 100).toFixed(1)}%`}
          description="Average fraud probability"
          icon="◇"
          variant="blue"
        />
      </section>

      <section className="dashboard-grid">
        <div className="content-card model-summary">
          <div className="card-header">
            <div>
              <span className="eyebrow">MODEL</span>
              <h3>Detection Model</h3>
            </div>

            <span className="online-pill">
              <span className="status-dot online" />
              Online
            </span>
          </div>

          <div className="model-summary-grid">
            <div>
              <span>Algorithm</span>
              <strong>
                {modelInfo?.algorithm || "Random Forest"}
              </strong>
            </div>

            <div>
              <span>Version</span>
              <strong>
                {modelInfo?.model_version || "1.0.0"}
              </strong>
            </div>

            <div>
              <span>Threshold</span>
              <strong>
                {modelInfo?.threshold ?? "0.55"}
              </strong>
            </div>

            <div>
              <span>ROC-AUC</span>
              <strong>
                {modelInfo?.roc_auc ?? "—"}
              </strong>
            </div>
          </div>

          <button
            className="secondary-button"
            onClick={() => navigate("model")}
          >
            View Model Details →
          </button>
        </div>

        <div className="content-card quick-action">
          <span className="eyebrow">QUICK ACTION</span>

          <h3>Analyze a Transaction</h3>

          <p>
            Submit transaction features and let the
            machine-learning model determine the fraud risk.
          </p>

          <button
            className="primary-button full-width"
            onClick={() => navigate("analyze")}
          >
            Start Analysis
          </button>
        </div>
      </section>

      <section className="content-card activity-card">
        <div className="card-header">
          <div>
            <span className="eyebrow">ACTIVITY</span>
            <h3>Recent Transactions</h3>
          </div>

          <span className="record-count">
            {total} records
          </span>
        </div>

        <TransactionTable
          transactions={transactions.slice(0, 5)}
        />
      </section>
    </div>
  );
}

export default Dashboard;
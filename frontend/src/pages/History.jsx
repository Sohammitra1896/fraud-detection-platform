import { useEffect, useState } from "react";

import StatCard from "../components/StatCard";
import TransactionTable from "../components/TransactionTable";

function History() {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const saved =
      JSON.parse(localStorage.getItem("fraudTransactions")) || [];

    setTransactions(saved);
  }, []);

  const total = transactions.length;

  const fraud = transactions.filter(
    (item) => item.fraud
  ).length;

  const legitimate = total - fraud;

  const fraudRate =
    total === 0 ? 0 : (fraud / total) * 100;

  const clearHistory = () => {
    localStorage.removeItem("fraudTransactions");
    setTransactions([]);
  };

  return (
    <div className="page">
      <section className="page-heading">
        <div>
          <span className="eyebrow">TRANSACTION RECORDS</span>

          <h2>Transaction History</h2>

          <p>
            Review all transactions analyzed by the fraud
            detection system.
          </p>
        </div>

        {total > 0 && (
          <button
            className="danger-outline-button"
            onClick={clearHistory}
          >
            Clear History
          </button>
        )}
      </section>

      <section className="stats-grid">
        <StatCard
          label="Total Analyzed"
          value={total}
          description="All analyzed transactions"
          icon="◎"
        />

        <StatCard
          label="Legitimate"
          value={legitimate}
          description="Safe transactions"
          icon="✓"
          variant="green"
        />

        <StatCard
          label="Fraud Detected"
          value={fraud}
          description="Potentially fraudulent"
          icon="!"
          variant="red"
        />

        <StatCard
          label="Fraud Rate"
          value={`${fraudRate.toFixed(1)}%`}
          description="Detected fraud percentage"
          icon="◇"
          variant="blue"
        />
      </section>

      <section className="content-card activity-card">
        <div className="card-header">
          <div>
            <span className="eyebrow">ACTIVITY</span>
            <h3>All Transactions</h3>
          </div>

          <span className="record-count">
            {total} records
          </span>
        </div>

        <TransactionTable transactions={transactions} />
      </section>
    </div>
  );
}

export default History;
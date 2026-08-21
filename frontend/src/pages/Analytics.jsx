import { useEffect, useState } from "react";

function Analytics() {
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

  const averageRisk =
    total === 0
      ? 0
      : transactions.reduce(
          (sum, item) =>
            sum + Number(item.probability || 0),
          0
        ) / total;

  const fraudRate =
    total === 0 ? 0 : fraud / total;

  return (
    <div className="page">
      <section className="page-heading">
        <div>
          <span className="eyebrow">PERFORMANCE</span>

          <h2>Analytics</h2>

          <p>
            Overview of transaction analysis and fraud
            detection results.
          </p>
        </div>
      </section>

      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon purple">◎</div>
          <div className="stat-content">
            <span className="stat-label">
              Total Transactions
            </span>
            <strong className="stat-value">
              {total}
            </strong>
            <span className="stat-description">
              Transactions analyzed
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">✓</div>
          <div className="stat-content">
            <span className="stat-label">
              Legitimate
            </span>
            <strong className="stat-value">
              {legitimate}
            </strong>
            <span className="stat-description">
              Safe transactions
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon red">!</div>
          <div className="stat-content">
            <span className="stat-label">
              Fraud Detected
            </span>
            <strong className="stat-value">
              {fraud}
            </strong>
            <span className="stat-description">
              Potentially fraudulent
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon blue">◇</div>
          <div className="stat-content">
            <span className="stat-label">
              Average Risk
            </span>
            <strong className="stat-value">
              {(averageRisk * 100).toFixed(1)}%
            </strong>
            <span className="stat-description">
              Average fraud probability
            </span>
          </div>
        </div>
      </section>

      <div className="analytics-grid">
        <section className="content-card analytics-card">
          <span className="eyebrow">
            TRANSACTION DISTRIBUTION
          </span>

          <h3>Detection Summary</h3>

          {total === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">◇</div>

              <h3>No data available</h3>

              <p>
                Analyze transactions to generate analytics.
              </p>
            </div>
          ) : (
            <div className="distribution">
              <div className="distribution-row">
                <div>
                  <span>Legitimate</span>
                  <strong>{legitimate}</strong>
                </div>

                <div className="distribution-bar">
                  <div
                    className="legitimate-bar"
                    style={{
                      width: `${
                        (legitimate / total) * 100
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div className="distribution-row">
                <div>
                  <span>Fraudulent</span>
                  <strong>{fraud}</strong>
                </div>

                <div className="distribution-bar">
                  <div
                    className="fraud-bar"
                    style={{
                      width: `${
                        (fraud / total) * 100
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="content-card analytics-card">
          <span className="eyebrow">RISK SUMMARY</span>

          <h3>Current Risk Level</h3>

          <div className="risk-summary">
            <div
              className="risk-circle"
              style={{
                "--risk": `${Math.min(
                  averageRisk * 100,
                  100
                )}%`,
              }}
            >
              <strong>
                {(averageRisk * 100).toFixed(1)}%
              </strong>

              <span>Average</span>
            </div>

            <div className="risk-details">
              <div>
                <span>Fraud Rate</span>
                <strong>
                  {(fraudRate * 100).toFixed(1)}%
                </strong>
              </div>

              <div>
                <span>Decision Threshold</span>
                <strong>55%</strong>
              </div>

              <div>
                <span>Transactions</span>
                <strong>{total}</strong>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Analytics;
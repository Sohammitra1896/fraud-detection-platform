function TransactionTable({ transactions }) {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">◷</div>

        <h3>No transactions found</h3>

        <p>
          Analyze a transaction and the result will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table className="transaction-table">
        <thead>
          <tr>
            <th>Time</th>
            <th>Risk</th>
            <th>Classification</th>
            <th>Probability</th>
            <th>Model</th>
          </tr>
        </thead>

        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id}>
              <td>{transaction.time}</td>

              <td>
                <span
                  className={`risk-badge ${
                    transaction.fraud
                      ? "high-risk"
                      : "low-risk"
                  }`}
                >
                  {transaction.fraud ? "High" : "Low"}
                </span>
              </td>

              <td>
                <span
                  className={`classification ${
                    transaction.fraud
                      ? "fraud"
                      : "legitimate"
                  }`}
                >
                  {transaction.fraud
                    ? "Fraudulent"
                    : "Legitimate"}
                </span>
              </td>

              <td>
                {(
                  Number(transaction.probability || 0) * 100
                ).toFixed(2)}
                %
              </td>

              <td>
                {transaction.model_version || "1.0.0"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TransactionTable;
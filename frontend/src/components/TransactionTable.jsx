import { useState } from "react";
import { updateReviewStatus } from "../services/api";

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

  const probability =
    Number(
      transaction.probability || 0
    ) * 100;

  const threshold =
    Number(
      transaction.threshold || 0.55
    ) * 100;

  const handleStatusChange = async (
    status
  ) => {
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
              : "low"
          }`}
        >

          <div className="detail-risk-icon">
            {isHighRisk
              ? "!"
              : "✓"}
          </div>

          <div>
            <span>
              {isHighRisk
                ? "HIGH RISK"
                : "LOW RISK"}
            </span>

            <strong>
              {isHighRisk
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
              label="Model Version"
              value={
                transaction.model_version ||
                "1.0.0"
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

      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>

    </div>
  );
}


export default TransactionDetails;
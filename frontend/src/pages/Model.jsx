function Model({ modelInfo, apiOnline }) {
  const algorithm =
    modelInfo?.algorithm || "Random Forest";

  const version =
    modelInfo?.model_version || "1.0.0";

  const threshold =
    modelInfo?.threshold ?? 0.55;

  const rocAuc =
    modelInfo?.roc_auc ?? "—";

  return (
    <div className="page">
      <section className="page-heading">
        <div>
          <span className="eyebrow">
            MACHINE LEARNING
          </span>

          <h2>Model Information</h2>

          <p>
            Details about the currently deployed fraud
            detection model.
          </p>
        </div>
      </section>

      <div className="model-page-grid">
        <section className="content-card">
          <span className="eyebrow">MODEL DETAILS</span>

          <h3>Deployed Model</h3>

          <div className="detail-list">
            <div>
              <span>Algorithm</span>
              <strong>{algorithm}</strong>
            </div>

            <div>
              <span>Model Version</span>
              <strong>{version}</strong>
            </div>

            <div>
              <span>Decision Threshold</span>
              <strong>{threshold}</strong>
            </div>

            <div>
              <span>ROC-AUC</span>
              <strong>{rocAuc}</strong>
            </div>

            <div>
              <span>Prediction Type</span>
              <strong>Binary Classification</strong>
            </div>

            <div>
              <span>Input Features</span>
              <strong>30</strong>
            </div>
          </div>
        </section>

        <section className="content-card model-status-card">
          <span className="eyebrow">
            SYSTEM STATUS
          </span>

          <div
            className={`large-status-icon ${
              apiOnline ? "safe" : "danger"
            }`}
          >
            {apiOnline ? "✓" : "!"}
          </div>

          <h3>
            {apiOnline
              ? "Model Online"
              : "Model Unavailable"}
          </h3>

          <p>
            {apiOnline
              ? "The fraud detection model is available and ready to analyze transactions."
              : "The backend service is currently unavailable."}
          </p>

          <div className="connection-line">
            <span
              className={`status-dot ${
                apiOnline ? "online" : "offline"
              }`}
            />

            {apiOnline
              ? "API Connected"
              : "API Disconnected"}
          </div>
        </section>
      </div>

      <section className="content-card how-it-works">
        <span className="eyebrow">HOW IT WORKS</span>

        <h3>Fraud Prediction Pipeline</h3>

        <div className="pipeline">
          <div className="pipeline-step">
            <span>01</span>
            <strong>Transaction Input</strong>
            <p>
              30 transaction features are submitted.
            </p>
          </div>

          <div className="pipeline-arrow">→</div>

          <div className="pipeline-step">
            <span>02</span>
            <strong>ML Model</strong>
            <p>
              Random Forest evaluates the transaction.
            </p>
          </div>

          <div className="pipeline-arrow">→</div>

          <div className="pipeline-step">
            <span>03</span>
            <strong>Risk Probability</strong>
            <p>
              The model calculates fraud probability.
            </p>
          </div>

          <div className="pipeline-arrow">→</div>

          <div className="pipeline-step">
            <span>04</span>
            <strong>Classification</strong>
            <p>
              Threshold determines fraud or legitimate.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Model;
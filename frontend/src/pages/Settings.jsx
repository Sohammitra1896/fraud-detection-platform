import { API_BASE } from "../services/api";

function Settings({ apiOnline, modelInfo }) {
  return (
    <div className="page">
      <section className="page-heading">
        <div>
          <span className="eyebrow">
            CONFIGURATION
          </span>

          <h2>Settings</h2>

          <p>
            Current application and model configuration.
          </p>
        </div>
      </section>

      <div className="settings-grid">
        <section className="content-card">
          <span className="eyebrow">
            API CONFIGURATION
          </span>

          <h3>Backend Connection</h3>

          <div className="detail-list">
            <div>
              <span>API URL</span>
              <strong>{API_BASE}</strong>
            </div>

            <div>
              <span>Status</span>

              <strong
                className={
                  apiOnline
                    ? "safe-text"
                    : "fraud-text"
                }
              >
                {apiOnline ? "Online" : "Offline"}
              </strong>
            </div>

            <div>
              <span>Prediction Endpoint</span>
              <strong>POST /predict</strong>
            </div>

            <div>
              <span>Model Endpoint</span>
              <strong>GET /model</strong>
            </div>
          </div>
        </section>

        <section className="content-card">
          <span className="eyebrow">
            MODEL CONFIGURATION
          </span>

          <h3>Detection Settings</h3>

          <div className="detail-list">
            <div>
              <span>Model Version</span>
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
              <span>Input Features</span>
              <strong>30</strong>
            </div>

            <div>
              <span>Classification</span>
              <strong>Fraud / Legitimate</strong>
            </div>
          </div>
        </section>
      </div>

      <section className="content-card platform-info">
        <span className="eyebrow">APPLICATION</span>

        <h3>Platform Information</h3>

        <div className="platform-grid">
          <div>
            <span>Application</span>
            <strong>FraudLens</strong>
          </div>

          <div>
            <span>Version</span>
            <strong>1.0.0</strong>
          </div>

          <div>
            <span>Frontend</span>
            <strong>React + Vite</strong>
          </div>

          <div>
            <span>Backend</span>
            <strong>FastAPI</strong>
          </div>

          <div>
            <span>Machine Learning</span>
            <strong>Python + Scikit-learn</strong>
          </div>

          <div>
            <span>Data Format</span>
            <strong>REST + JSON</strong>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Settings;
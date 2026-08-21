import { useState } from "react";
import { predictTransaction } from "../services/api";

const featureNames = [
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

const legitimateExample = new Array(30).fill(0);

const fraudExample = [
  406,
  -2.312227,
  1.951992,
  -1.609851,
  3.997906,
  -0.522188,
  -1.426545,
  -2.537387,
  1.391657,
  -2.770089,
  -3.587346,
  1.772877,
  -2.234737,
  0.952691,
  -4.946138,
  -1.501232,
  -2.282464,
  -4.781606,
  -2.615665,
  -2.013625,
  -0.261235,
  1.054478,
  0.005147,
  -0.204302,
  0.161314,
  -0.149634,
  -0.174126,
  -0.267882,
  -0.007602,
  239.93,
];

function Analyze({ apiOnline }) {
  const [features, setFeatures] = useState(
    new Array(30).fill("")
  );

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const updateFeature = (index, value) => {
    const updated = [...features];
    updated[index] = value;
    setFeatures(updated);
  };

  const loadExample = (example) => {
    setFeatures(example.map(String));
    setResult(null);
    setError("");
  };

  const clearForm = () => {
    setFeatures(new Array(30).fill(""));
    setResult(null);
    setError("");
  };

  const analyze = async () => {
    setError("");
    setResult(null);

    if (!apiOnline) {
      setError(
        "The backend API is offline. Start your FastAPI server first."
      );
      return;
    }

    const values = features.map((value) =>
      value === "" ? 0 : Number(value)
    );

    if (values.some((value) => Number.isNaN(value))) {
      setError("Please enter valid numeric values.");
      return;
    }

    setLoading(true);

    try {
      const response = await predictTransaction(values);

      const record = {
        id: Date.now(),
        time: new Date().toLocaleString(),
        features: values,
        fraud: Boolean(response.fraud),
        probability: Number(response.probability || 0),
        threshold: Number(response.threshold || 0.55),
        model_version:
          response.model_version || "1.0.0",
      };

      const history =
        JSON.parse(
          localStorage.getItem("fraudTransactions")
        ) || [];

      localStorage.setItem(
        "fraudTransactions",
        JSON.stringify([record, ...history])
      );

      setResult(record);
    } catch (err) {
      setError(
        err.message ||
          "Unable to analyze the transaction."
      );
    } finally {
      setLoading(false);
    }
  };

  const probability =
    result?.probability !== undefined
      ? result.probability * 100
      : 0;

  return (
    <div className="page">
      <section className="page-heading">
        <div>
          <span className="eyebrow">TRANSACTION ANALYSIS</span>

          <h2>Analyze a Transaction</h2>

          <p>
            Enter the 30 transaction features and submit
            them to the deployed fraud detection model.
          </p>
        </div>
      </section>

      <div className="analyze-layout">
        <section className="content-card feature-card">
          <div className="card-header">
            <div>
              <span className="eyebrow">INPUT FEATURES</span>
              <h3>Transaction Data</h3>
            </div>

            <span className="feature-count">
              30 FEATURES
            </span>
          </div>

          <div className="feature-grid">
            {featureNames.map((name, index) => (
              <div className="feature-field" key={name}>
                <label>{name}</label>

                <input
                  type="number"
                  step="any"
                  value={features[index]}
                  placeholder="0"
                  onChange={(event) =>
                    updateFeature(
                      index,
                      event.target.value
                    )
                  }
                />
              </div>
            ))}
          </div>

          <div className="example-actions">
            <button
              className="example-button"
              onClick={() =>
                loadExample(legitimateExample)
              }
            >
              Load Legitimate Example
            </button>

            <button
              className="example-button"
              onClick={() =>
                loadExample(fraudExample)
              }
            >
              Load Fraud Example
            </button>

            <button
              className="clear-button"
              onClick={clearForm}
            >
              Clear
            </button>

            <button
              className="primary-button analyze-button"
              onClick={analyze}
              disabled={loading}
            >
              {loading
                ? "Analyzing..."
                : "Analyze Transaction"}
            </button>
          </div>
        </section>

        <aside className="content-card result-card">
          <span className="eyebrow">MODEL RESULT</span>

          {!result && !error && (
            <div className="result-empty">
              <div className="result-icon">◇</div>

              <h3>Waiting for Analysis</h3>

              <p>
                Submit a transaction to see its fraud
                probability and classification.
              </p>
            </div>
          )}

          {error && (
            <div className="result-error">
              <div className="result-icon error">
                !
              </div>

              <h3>Analysis Failed</h3>

              <p>{error}</p>
            </div>
          )}

          {result && (
            <div className="result-success">
              <div
                className={`result-icon ${
                  result.fraud ? "danger" : "safe"
                }`}
              >
                {result.fraud ? "!" : "✓"}
              </div>

              <span className="result-label">
                CLASSIFICATION
              </span>

              <h3
                className={
                  result.fraud
                    ? "fraud-text"
                    : "safe-text"
                }
              >
                {result.fraud
                  ? "Fraudulent Transaction"
                  : "Legitimate Transaction"}
              </h3>

              <div className="probability-box">
                <span>Fraud Probability</span>

                <strong>
                  {probability.toFixed(2)}%
                </strong>

                <div className="probability-bar">
                  <div
                    style={{
                      width: `${Math.min(
                        probability,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <div className="result-details">
                <div>
                  <span>Threshold</span>
                  <strong>
                    {(
                      result.threshold * 100
                    ).toFixed(0)}
                    %
                  </strong>
                </div>

                <div>
                  <span>Model Version</span>
                  <strong>
                    {result.model_version}
                  </strong>
                </div>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

export default Analyze;
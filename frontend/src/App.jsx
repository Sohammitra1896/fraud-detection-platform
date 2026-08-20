import { useState } from "react";
import "./App.css";

function App() {
  const [features, setFeatures] = useState(Array(30).fill(""));
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

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

  const handleChange = (index, value) => {
    const updated = [...features];
    updated[index] = value;
    setFeatures(updated);
  };

  const predictFraud = async () => {
    setLoading(true);
    setResult(null);

    try {
      const values = features.map((value) =>
        value === "" ? 0 : Number(value)
      );

      const response = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          features: values,
        }),
      });

      if (!response.ok) {
        throw new Error("Prediction request failed");
      }

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        error: "Unable to connect to the fraud detection API.",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadExample = () => {
    const example = [
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

    setFeatures(example);
    setResult(null);
  };

  const clearForm = () => {
    setFeatures(Array(30).fill(""));
    setResult(null);
  };

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>Fraud Detection Platform</h1>
          <p>AI-powered transaction risk analysis</p>
        </div>

        <div className="status">
          <span className="status-dot"></span>
          API Online
        </div>
      </header>

      <main className="dashboard">
        <section className="intro">
          <h2>Transaction Analysis</h2>
          <p>
            Enter transaction features to evaluate whether a transaction is
            potentially fraudulent.
          </p>
        </section>

        <section className="card">
          <div className="card-header">
            <div>
              <h3>Transaction Features</h3>
              <p>30 model input features</p>
            </div>

            <button className="secondary-button" onClick={loadExample}>
              Load Example
            </button>
          </div>

          <div className="feature-grid">
            {featureNames.map((name, index) => (
              <div className="input-group" key={name}>
                <label>{name}</label>

                <input
                  type="number"
                  step="any"
                  value={features[index]}
                  onChange={(e) => handleChange(index, e.target.value)}
                  placeholder="0"
                />
              </div>
            ))}
          </div>

          <div className="actions">
            <button className="clear-button" onClick={clearForm}>
              Clear
            </button>

            <button
              className="predict-button"
              onClick={predictFraud}
              disabled={loading}
            >
              {loading ? "Analyzing..." : "Analyze Transaction"}
            </button>
          </div>
        </section>

        {result && !result.error && (
          <section
            className={`result-card ${
              result.fraud ? "fraud-result" : "safe-result"
            }`}
          >
            <div>
              <p className="result-label">Detection Result</p>

              <h2>
                {result.fraud
                  ? "⚠️ Potential Fraud Detected"
                  : "✓ Transaction Appears Legitimate"}
              </h2>

              <p className="result-description">
                {result.fraud
                  ? "The transaction has been classified as potentially fraudulent."
                  : "The transaction has been classified as legitimate."}
              </p>
            </div>

            <div className="probability">
              <span>Fraud Probability</span>

              <strong>
                {(result.probability * 100).toFixed(2)}%
              </strong>

              <small>
                Threshold: {(result.threshold * 100).toFixed(0)}%
              </small>
            </div>
          </section>
        )}

        {result?.error && (
          <section className="error-card">
            <h3>API Connection Error</h3>

            <p>{result.error}</p>

            <p>
              Make sure your FastAPI server is running on port 8000.
            </p>
          </section>
        )}
      </main>

      <footer>
        <span>Fraud Detection Platform</span>
        <span>Model Version 1.0.0</span>
      </footer>
    </div>
  );
}

export default App;
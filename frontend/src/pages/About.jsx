function About() {
  return (
    <div className="page">
      <section className="about-hero">
        <div className="about-logo">
          <span>F</span>
        </div>

        <span className="eyebrow">ABOUT FRAUDLENS</span>

        <h2>
          Intelligent Transaction
          <br />
          Risk Detection
        </h2>

        <p>
          FraudLens is a machine-learning powered platform
          designed to analyze financial transaction data and
          identify potentially fraudulent activity.
        </p>
      </section>

      <div className="about-grid">
        <section className="content-card">
          <span className="eyebrow">PURPOSE</span>

          <h3>What FraudLens Does</h3>

          <p className="large-paragraph">
            FraudLens accepts transaction features, sends
            them to a trained machine-learning model through
            a FastAPI service, and returns a fraud probability
            together with a risk classification.
          </p>

          <p className="large-paragraph">
            The platform provides a clean interface for
            analyzing transactions while making the
            machine-learning prediction process easy to
            understand.
          </p>
        </section>

        <section className="content-card">
          <span className="eyebrow">TECHNOLOGY</span>

          <h3>Technology Stack</h3>

          <div className="tech-list">
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
              <span>API Communication</span>
              <strong>REST + JSON</strong>
            </div>
          </div>
        </section>
      </div>

      <section className="content-card mission-card">
        <span className="eyebrow">PROJECT GOAL</span>

        <h3>From Raw Data to Actionable Risk</h3>

        <div className="mission-flow">
          <div>
            <strong>Input</strong>
            <span>30 transaction features</span>
          </div>

          <div className="flow-arrow">→</div>

          <div>
            <strong>Prediction</strong>
            <span>Machine-learning analysis</span>
          </div>

          <div className="flow-arrow">→</div>

          <div>
            <strong>Decision</strong>
            <span>Fraud probability & classification</span>
          </div>
        </div>
      </section>
    </div>
  );
}

export default About;
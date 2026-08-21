import { useState } from "react";
import { askAssistant } from "../services/api";

function FraudCopilot({
  history = [],
  lastPrediction = null,
}) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const suggestions = [
    "Why was FRAUD-TEST-001 considered high risk?",
    "What does the fraud probability mean?",
    "What is the decision threshold?",
    "Explain this transaction in simple terms.",
  ];

  const sendMessage = async (text = message) => {
    const cleanMessage = text.trim();

    if (!cleanMessage || loading) {
      return;
    }

    setError("");

    const userMessage = {
      role: "user",
      content: cleanMessage,
    };

    setMessages((current) => [
      ...current,
      userMessage,
    ]);

    setMessage("");
    setLoading(true);

    try {
      const response = await askAssistant(
        cleanMessage,
        lastPrediction,
        history.slice(0, 10)
      );

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            response.reply ||
            "I couldn't generate a response.",
        },
      ]);
    } catch (err) {
      setError(
        err.message ||
          "Unable to connect to Fraud Copilot."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page copilot-page">
      <section className="page-intro">
        <div>
          <div className="eyebrow">
            AI TOOLS
          </div>

          <h2>Fraud Copilot</h2>

          <p>
            Ask questions about transaction risk,
            predictions, thresholds and fraud concepts
            using the current FraudLens context.
          </p>
        </div>
      </section>

      <section className="copilot-layout">
        <div className="panel copilot-chat-panel">
          <div className="copilot-header">
            <div className="copilot-avatar">
              ✦
            </div>

            <div>
              <h3>Fraud Copilot</h3>

              <p>
                AI-powered fraud risk assistant
              </p>
            </div>

            <span className="copilot-status">
              <span className="status-dot online" />
              Ready
            </span>
          </div>

          <div className="copilot-messages">
            {messages.length === 0 ? (
              <div className="copilot-empty">
                <div className="copilot-empty-icon">
                  ✦
                </div>

                <h3>
                  How can I help?
                </h3>

                <p>
                  Ask me about a transaction,
                  its risk level, or how FraudLens
                  made a prediction.
                </p>

                <div className="copilot-suggestions">
                  {suggestions.map(
                    (suggestion) => (
                      <button
                        key={suggestion}
                        className="copilot-suggestion"
                        onClick={() =>
                          sendMessage(
                            suggestion
                          )
                        }
                      >
                        {suggestion}
                      </button>
                    )
                  )}
                </div>
              </div>
            ) : (
              <>
                {messages.map(
                  (item, index) => (
                    <div
                      key={`${item.role}-${index}`}
                      className={`chat-message ${
                        item.role ===
                        "user"
                          ? "user-message"
                          : "assistant-message"
                      }`}
                    >
                      {item.role ===
                        "assistant" && (
                        <div className="chat-avatar">
                          ✦
                        </div>
                      )}

                      <div className="chat-bubble">
                        {item.content}
                      </div>
                    </div>
                  )
                )}

                {loading && (
                  <div className="chat-message assistant-message">
                    <div className="chat-avatar">
                      ✦
                    </div>

                    <div className="chat-bubble typing">
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {error && (
            <div className="copilot-error">
              {error}
            </div>
          )}

          <div className="copilot-input-area">
            <textarea
              value={message}
              onChange={(event) =>
                setMessage(event.target.value)
              }
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" &&
                  !event.shiftKey
                ) {
                  event.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Ask Fraud Copilot..."
              rows={2}
            />

            <button
              className="primary-button copilot-send"
              onClick={() =>
                sendMessage()
              }
              disabled={
                loading ||
                !message.trim()
              }
            >
              {loading
                ? "Thinking..."
                : "Send"}
            </button>
          </div>
        </div>

        <aside className="copilot-side">
          <div className="panel">
            <div className="eyebrow">
              CURRENT CONTEXT
            </div>

            <h3>
              What Copilot can see
            </h3>

            <div className="copilot-context">
              <ContextRow
                label="Recent Transactions"
                value={history.length}
              />

              <ContextRow
                label="Current Prediction"
                value={
                  lastPrediction
                    ? "Available"
                    : "None"
                }
              />

              <ContextRow
                label="Model Version"
                value={
                  lastPrediction?.model_version ||
                  "1.0.0"
                }
              />
            </div>
          </div>

          <div className="panel copilot-note">
            <div className="eyebrow">
              IMPORTANT
            </div>

            <p>
              Copilot explains model results
              and transaction risk. Its answers
              are informational and should not be
              treated as absolute proof of fraud.
            </p>
          </div>
        </aside>
      </section>
    </div>
  );
}

function ContextRow({
  label,
  value,
}) {
  return (
    <div className="copilot-context-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default FraudCopilot;
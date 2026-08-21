const API_BASE = "http://127.0.0.1:8000";

async function request(url, options = {}) {
  const response = await fetch(
    `${API_BASE}${url}`,
    options
  );

  if (!response.ok) {
    let message = "Request failed.";

    try {
      const data = await response.json();
      message = data.detail || message;
    } catch {
      // Keep default message.
    }

    throw new Error(message);
  }

  return response.json();
}

export async function checkApi() {
  return request("/");
}

export async function getModelInfo() {
  return request("/model");
}

export async function predictTransaction(
  features,
  reference = null,
  transactionTime = null
) {
  return request("/predict", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      features,
      reference,
      transaction_time: transactionTime,
    }),
  });
}

export async function getTransactions() {
  return request("/transactions");
}

export async function getTransaction(id) {
  return request(`/transactions/${id}`);
}

export async function updateReviewStatus(id, status) {
  return request(
    `/transactions/${id}/review`,
    {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status,
      }),
    }
  );
}

export async function getAnalytics() {
  return request("/analytics");
}

export async function askAssistant(
  message,
  prediction = null,
  history = []
) {
  return request("/assistant", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
      prediction,
      history,
    }),
  });
}

export { API_BASE };
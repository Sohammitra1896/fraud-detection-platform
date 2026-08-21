const API_BASE = "http://127.0.0.1:8000";

export async function predictTransaction(features) {
  const response = await fetch(`${API_BASE}/predict`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      features: features.map(Number),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      errorText || `Prediction failed with status ${response.status}`
    );
  }

  return response.json();
}

export async function getHealth() {
  const endpoints = ["/health", "/"];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`);

      if (response.ok) {
        return await response.json().catch(() => ({
          status: "ok",
        }));
      }
    } catch {
      // Try next endpoint
    }
  }

  throw new Error("Backend is offline");
}

export async function getModelInfo() {
  const response = await fetch(`${API_BASE}/model`);

  if (!response.ok) {
    throw new Error("Unable to fetch model information");
  }

  return response.json();
}

export { API_BASE };
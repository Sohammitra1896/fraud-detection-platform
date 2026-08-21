const API_BASE =
  "http://127.0.0.1:8000";

export async function getModelInfo() {
  const response = await fetch(
    `${API_BASE}/model`
  );

  if (!response.ok) {
    throw new Error(
      "Unable to load model information."
    );
  }

  return response.json();
}

export async function predictTransaction(
  features
) {
  const response = await fetch(
    `${API_BASE}/predict`,
    {
      method: "POST",
      headers: {
        Accept:
          "application/json",
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        features,
      }),
    }
  );

  if (!response.ok) {
    const error =
      await response.json().catch(
        () => ({})
      );

    throw new Error(
      error.detail ||
        "Prediction request failed."
    );
  }

  return response.json();
}

export async function checkApi() {
  const response = await fetch(
    `${API_BASE}/`
  );

  if (!response.ok) {
    throw new Error(
      "Backend unavailable."
    );
  }

  return response.json();
}

export { API_BASE };
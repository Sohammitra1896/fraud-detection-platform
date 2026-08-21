import json
import os

import joblib
import pandas as pd
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
from pydantic import BaseModel


# ============================================================
# Environment
# ============================================================

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-5.6")


# ============================================================
# FastAPI application
# ============================================================

app = FastAPI(
    title="Fraud Detection API",
    version="1.0.0"
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# Load ML artifacts
# ============================================================

model = joblib.load("models/fraud_model.pkl")

scaler = joblib.load("models/scaler.pkl")

feature_list = joblib.load(
    "models/feature_list.pkl"
)

with open(
    "models/model_metadata.json",
    "r"
) as file:
    metadata = json.load(file)


# ============================================================
# OpenAI client
# ============================================================

openai_client = None

if OPENAI_API_KEY:
    openai_client = OpenAI(
        api_key=OPENAI_API_KEY
    )


# ============================================================
# Request models
# ============================================================

class Transaction(BaseModel):
    features: list[float]


class AssistantRequest(BaseModel):
    message: str
    prediction: dict | None = None
    history: list[dict] | None = None


# ============================================================
# Health check
# ============================================================

@app.get("/")
def home():

    return {
        "message": "Fraud Detection API is running",
        "version": metadata["model_version"],
        "ai_assistant": openai_client is not None
    }


# ============================================================
# Fraud prediction
# ============================================================

@app.post("/predict")
def predict(transaction: Transaction):

    # Check number of features
    if len(transaction.features) != len(feature_list):
        raise HTTPException(
            status_code=400,
            detail=(
                f"Expected {len(feature_list)} features, "
                f"received {len(transaction.features)}."
            )
        )

    # Convert incoming features to DataFrame
    input_data = pd.DataFrame(
        [transaction.features],
        columns=feature_list
    )

    # Get fraud probability
    probability = model.predict_proba(
        input_data
    )[0][1]

    # Load threshold from metadata
    threshold = metadata["threshold"]

    # Fraud decision
    prediction = int(
        probability >= threshold
    )

    return {
        "fraud": bool(prediction),
        "probability": float(probability),
        "threshold": float(threshold),
        "model_version": metadata["model_version"]
    }


# ============================================================
# AI Fraud Copilot
# ============================================================

@app.post("/assistant")
def assistant(request: AssistantRequest):

    message = request.message.strip()

    if not message:
        raise HTTPException(
            status_code=400,
            detail="Message cannot be empty."
        )

    # --------------------------------------------------------
    # Check API key
    # --------------------------------------------------------

    if openai_client is None:
        raise HTTPException(
            status_code=503,
            detail=(
                "OpenAI API key is not configured. "
                "Add OPENAI_API_KEY to ml-service/.env."
            )
        )

    # --------------------------------------------------------
    # Current prediction context
    # --------------------------------------------------------

    if request.prediction:

        prediction_context = json.dumps(
            request.prediction,
            indent=2
        )

    else:

        prediction_context = (
            "No transaction has been analyzed yet."
        )

    # --------------------------------------------------------
    # Recent history context
    # --------------------------------------------------------

    if request.history:

        history_context = json.dumps(
            request.history[-10:],
            indent=2
        )

    else:

        history_context = (
            "No recent transaction history is available."
        )

    # --------------------------------------------------------
    # AI instructions
    # --------------------------------------------------------

    instructions = """
You are Fraud Copilot, an AI assistant inside a
credit-card fraud detection platform.

Your purpose is to help users understand:

- transaction risk
- fraud probability
- decision thresholds
- model predictions
- recent transaction activity
- basic fraud-detection concepts

Important rules:

1. Be concise, clear, and professional.
2. Explain technical concepts in simple language.
3. A model prediction is a risk signal, not absolute proof
   that a transaction is fraudulent.
4. Never invent transaction values or model results.
5. Use the supplied prediction and history when relevant.
6. Do not claim that you performed actions that you did not perform.
7. When discussing probabilities, clearly distinguish probability
   from certainty.
8. If there is no current transaction, say so.
9. Do not expose API keys, secrets, or internal credentials.
10. If asked about the system architecture, explain the flow:
    React frontend -> FastAPI -> ML model -> prediction.
"""

    # --------------------------------------------------------
    # User context
    # --------------------------------------------------------

    user_input = f"""
User question:
{message}

Current prediction:
{prediction_context}

Recent transaction history:
{history_context}

Model version:
{metadata["model_version"]}

Decision threshold:
{metadata["threshold"]}
"""

    # --------------------------------------------------------
    # Call OpenAI Responses API
    # --------------------------------------------------------

    try:

        response = openai_client.responses.create(
            model=OPENAI_MODEL,
            instructions=instructions,
            input=user_input
        )

    except Exception as error:

        raise HTTPException(
            status_code=502,
            detail=f"AI assistant request failed: {str(error)}"
        )

    # --------------------------------------------------------
    # Return assistant response
    # --------------------------------------------------------

    return {
        "reply": response.output_text,
        "model": OPENAI_MODEL
    }
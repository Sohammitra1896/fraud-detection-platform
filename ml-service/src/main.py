import json
import os
from contextlib import asynccontextmanager
from datetime import datetime

import joblib
import pandas as pd
from dotenv import load_dotenv
from fastapi import Depends
from fastapi import FastAPI
from fastapi import HTTPException
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.orm import Session

from .database import Base
from .database import engine
from .database import get_db
from .model import TransactionRecord


# ============================================================
# Environment
# ============================================================

load_dotenv()

OPENAI_API_KEY = os.getenv(
    "OPENAI_API_KEY"
)

OPENAI_MODEL = os.getenv(
    "OPENAI_MODEL",
    "gpt-5.6"
)


# ============================================================
# Database startup
# ============================================================

@asynccontextmanager
async def lifespan(app: FastAPI):

    Base.metadata.create_all(
        bind=engine
    )

    yield


# ============================================================
# FastAPI application
# ============================================================

app = FastAPI(
    title="Fraud Detection API",
    version="1.0.0",
    lifespan=lifespan,
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# Load ML artifacts
# ============================================================

model = joblib.load(
    "models/fraud_model.pkl"
)

scaler = joblib.load(
    "models/scaler.pkl"
)

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

    reference: str | None = None

    transaction_time: str | None = None


class AssistantRequest(BaseModel):

    message: str

    prediction: dict | None = None

    history: list[dict] | None = None


class ReviewRequest(BaseModel):

    status: str


# ============================================================
# Helper functions
# ============================================================

def get_risk_level(
    probability: float,
    threshold: float,
) -> str:

    if probability >= threshold:
        return "High"

    if probability >= threshold * 0.5:
        return "Medium"

    return "Low"


def get_risk_explanation(
    probability: float,
    threshold: float,
    risk_level: str,
) -> str:

    if risk_level == "High":
        return (
            "Fraud probability exceeds the configured "
            "decision threshold and the transaction "
            "should be reviewed."
        )

    if risk_level == "Medium":
        return (
            "The transaction shows elevated risk but "
            "remains below the fraud decision threshold."
        )

    return (
        "The transaction risk is currently below the "
        "configured review threshold."
    )


def transaction_to_dict(
    transaction: TransactionRecord,
):

    return {
        "id": transaction.id,
        "reference": transaction.reference,
        "transaction_time": (
            transaction.transaction_time
        ),
        "amount": transaction.amount,
        "probability": transaction.probability,
        "fraud": transaction.fraud,
        "risk_level": transaction.risk_level,
        "risk_explanation": (
            transaction.risk_explanation
        ),
        "threshold": transaction.threshold,
        "model_version": (
            transaction.model_version
        ),
        "review_status": (
            transaction.review_status
        ),
        "features": transaction.features,
        "created_at": (
            transaction.created_at.isoformat()
            if transaction.created_at
            else None
        ),
    }


# ============================================================
# Health check
# ============================================================

@app.get("/")
def home():

    return {
        "message": (
            "Fraud Detection API is running"
        ),
        "version": metadata[
            "model_version"
        ],
        "ai_assistant": (
            openai_client is not None
        ),
        "database": "PostgreSQL",
    }


# ============================================================
# Model information
# ============================================================

@app.get("/model")
def model_info():

    return {
        "model_name": metadata.get(
            "model_name",
            "Random Forest",
        ),
        "model_version": metadata.get(
            "model_version",
            "1.0.0",
        ),
        "threshold": metadata.get(
            "threshold",
            0.55,
        ),
        "precision": metadata.get(
            "precision"
        ),
        "recall": metadata.get(
            "recall"
        ),
        "f1_score": metadata.get(
            "f1_score"
        ),
        "roc_auc": metadata.get(
            "roc_auc"
        ),
        "pr_auc": metadata.get(
            "pr_auc"
        ),
        "training_date": metadata.get(
            "training_date"
        ),
        "features": metadata.get(
            "features",
            feature_list,
        ),
        "feature_count": len(
            feature_list
        ),
    }


# ============================================================
# Fraud prediction
# ============================================================

@app.post("/predict")
def predict(
    transaction: Transaction,
    db: Session = Depends(get_db),
):

    # --------------------------------------------------------
    # Validate feature count
    # --------------------------------------------------------

    if len(transaction.features) != len(
        feature_list
    ):

        raise HTTPException(
            status_code=400,
            detail=(
                f"Expected "
                f"{len(feature_list)} "
                f"features, received "
                f"{len(transaction.features)}."
            ),
        )


    # --------------------------------------------------------
    # Convert features to DataFrame
    # --------------------------------------------------------

    input_data = pd.DataFrame(
        [transaction.features],
        columns=feature_list,
    )


    # --------------------------------------------------------
    # Predict fraud probability
    # --------------------------------------------------------

    probability = float(
        model.predict_proba(
            input_data
        )[0][1]
    )


    # --------------------------------------------------------
    # Decision threshold
    # --------------------------------------------------------

    threshold = float(
        metadata["threshold"]
    )


    # --------------------------------------------------------
    # Fraud classification
    # --------------------------------------------------------

    prediction = int(
        probability >= threshold
    )


    # --------------------------------------------------------
    # Risk level
    # --------------------------------------------------------

    risk_level = get_risk_level(
        probability,
        threshold,
    )


    # --------------------------------------------------------
    # Risk explanation
    # --------------------------------------------------------

    risk_explanation = get_risk_explanation(
        probability,
        threshold,
        risk_level,
    )


    # --------------------------------------------------------
    # Reference
    # --------------------------------------------------------

    reference = (
        transaction.reference
        or (
            "TX-"
            + datetime.now().strftime(
                "%Y%m%d%H%M%S"
            )
        )
    )


    # --------------------------------------------------------
    # Amount
    # --------------------------------------------------------

    amount = float(
        transaction.features[-1]
    )


    # --------------------------------------------------------
    # Save prediction in PostgreSQL
    # --------------------------------------------------------

    record = TransactionRecord(

        reference=reference,

        transaction_time=(
            transaction.transaction_time
        ),

        amount=amount,

        probability=probability,

        fraud=bool(prediction),

        risk_level=risk_level,

        risk_explanation=(
            risk_explanation
        ),

        threshold=threshold,

        model_version=metadata[
            "model_version"
        ],

        review_status="Pending",

        features=[
            float(value)
            for value in transaction.features
        ],
    )


    db.add(record)

    db.commit()

    db.refresh(record)


    # --------------------------------------------------------
    # Return response
    # --------------------------------------------------------

    return {

        "id": record.id,

        "reference": record.reference,

        "fraud": bool(prediction),

        "probability": probability,

        "risk_level": risk_level,

        "risk_explanation": (
            risk_explanation
        ),

        "threshold": threshold,

        "model_version": metadata[
            "model_version"
        ],

        "review_status": (
            record.review_status
        ),

    }


# ============================================================
# Transaction history
# ============================================================

@app.get("/transactions")
def get_transactions(
    db: Session = Depends(get_db),
):

    records = (
        db.query(TransactionRecord)
        .order_by(
            TransactionRecord.created_at.desc()
        )
        .all()
    )

    return [
        transaction_to_dict(record)
        for record in records
    ]


# ============================================================
# Single transaction
# ============================================================

@app.get(
    "/transactions/{transaction_id}"
)
def get_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
):

    record = (
        db.query(TransactionRecord)
        .filter(
            TransactionRecord.id
            == transaction_id
        )
        .first()
    )

    if record is None:

        raise HTTPException(
            status_code=404,
            detail="Transaction not found.",
        )

    return transaction_to_dict(
        record
    )


# ============================================================
# Update review status
# ============================================================

@app.patch(
    "/transactions/{transaction_id}/review"
)
def update_review_status(
    transaction_id: int,
    request: ReviewRequest,
    db: Session = Depends(get_db),
):

    allowed_statuses = {
        "Pending",
        "Reviewed",
        "Dismissed",
    }


    if request.status not in (
        allowed_statuses
    ):

        raise HTTPException(
            status_code=400,
            detail=(
                "Status must be "
                "Pending, Reviewed, "
                "or Dismissed."
            ),
        )


    record = (
        db.query(TransactionRecord)
        .filter(
            TransactionRecord.id
            == transaction_id
        )
        .first()
    )


    if record is None:

        raise HTTPException(
            status_code=404,
            detail="Transaction not found.",
        )


    record.review_status = (
        request.status
    )

    db.commit()

    db.refresh(record)


    return transaction_to_dict(
        record
    )


# ============================================================
# Analytics
# ============================================================

@app.get("/analytics")
def get_analytics(
    db: Session = Depends(get_db),
):

    total = (
        db.query(
            func.count(
                TransactionRecord.id
            )
        )
        .scalar()
        or 0
    )


    fraud = (
        db.query(
            func.count(
                TransactionRecord.id
            )
        )
        .filter(
            TransactionRecord.fraud
            == True
        )
        .scalar()
        or 0
    )


    legitimate = (
        total - fraud
    )


    average_probability = (
        db.query(
            func.avg(
                TransactionRecord.probability
            )
        )
        .scalar()
        or 0
    )


    highest_probability = (
        db.query(
            func.max(
                TransactionRecord.probability
            )
        )
        .scalar()
        or 0
    )


    fraud_rate = (
        (fraud / total) * 100
        if total > 0
        else 0
    )


    return {

        "total_transactions": total,

        "legitimate": legitimate,

        "fraud_detected": fraud,

        "fraud_rate": float(
            fraud_rate
        ),

        "average_risk": float(
            average_probability
        ),

        "highest_risk": float(
            highest_probability
        ),

    }


# ============================================================
# AI Fraud Copilot
# ============================================================

@app.post("/assistant")
def assistant(
    request: AssistantRequest
):

    message = request.message.strip()


    if not message:

        raise HTTPException(
            status_code=400,
            detail=(
                "Message cannot be empty."
            ),
        )


    if openai_client is None:

        raise HTTPException(
            status_code=503,
            detail=(
                "OpenAI API key is not configured. "
                "Add OPENAI_API_KEY to "
                "ml-service/.env."
            ),
        )


    if request.prediction:

        prediction_context = json.dumps(
            request.prediction,
            indent=2,
        )

    else:

        prediction_context = (
            "No transaction has been "
            "analyzed yet."
        )


    if request.history:

        history_context = json.dumps(
            request.history[-10:],
            indent=2,
        )

    else:

        history_context = (
            "No recent transaction history "
            "is available."
        )


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
    React frontend -> FastAPI -> ML model -> PostgreSQL.
"""


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


    try:

        response = (
            openai_client.responses.create(
                model=OPENAI_MODEL,
                instructions=instructions,
                input=user_input,
            )
        )

    except Exception as error:

        raise HTTPException(
            status_code=502,
            detail=(
                "AI assistant request failed: "
                f"{str(error)}"
            ),
        )


    return {
        "reply":
            response.output_text,
        "model":
            OPENAI_MODEL,
    }
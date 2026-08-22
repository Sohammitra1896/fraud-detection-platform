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

# OpenAI is no longer required.
# Fraud Copilot is handled locally by this API.


# ============================================================
# Database startup
# ============================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
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
    "https://fraudlens-frontend-0h16.onrender.com",
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
    "r",
) as file:
    metadata = json.load(file)


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
        "transaction_time": transaction.transaction_time,
        "amount": transaction.amount,
        "probability": transaction.probability,
        "fraud": transaction.fraud,
        "risk_level": transaction.risk_level,
        "risk_explanation": transaction.risk_explanation,
        "threshold": transaction.threshold,
        "model_version": transaction.model_version,
        "review_status": transaction.review_status,
        "features": transaction.features,
        "created_at": (
            transaction.created_at.isoformat()
            if transaction.created_at
            else None
        ),
    }


# ============================================================
# Local Fraud Copilot
# ============================================================

def local_copilot_response(
    message: str,
    prediction: dict | None,
    history: list[dict] | None,
) -> str:

    text = message.lower().strip()

    probability = None
    fraud = None
    risk_level = None
    threshold = float(
        metadata.get("threshold", 0.55)
    )
    reference = None
    review_status = None
    amount = None

    if prediction:
        probability = float(
            prediction.get("probability", 0)
        )

        fraud = bool(
            prediction.get("fraud", False)
        )

        risk_level = prediction.get(
            "risk_level"
        )

        threshold = float(
            prediction.get(
                "threshold",
                threshold,
            )
        )

        reference = prediction.get(
            "reference"
        )

        review_status = prediction.get(
            "review_status"
        )

        amount = prediction.get(
            "amount"
        )

    if risk_level is None and probability is not None:
        risk_level = get_risk_level(
            probability,
            threshold,
        )

    # --------------------------------------------------------
    # Current transaction risk
    # --------------------------------------------------------

    if (
        "why" in text
        and (
            "risk" in text
            or "fraud" in text
            or "suspicious" in text
        )
    ):
        if probability is None:
            return (
                "There is no current transaction prediction "
                "available. Analyze a transaction first."
            )

        explanation = get_risk_explanation(
            probability,
            threshold,
            risk_level or "Low",
        )

        return (
            f"{reference or 'This transaction'} has a "
            f"fraud probability of "
            f"{probability * 100:.2f}%. "
            f"The configured decision threshold is "
            f"{threshold * 100:.0f}%. "
            f"{explanation}"
        )

    # --------------------------------------------------------
    # Probability
    # --------------------------------------------------------

    if "probability" in text:
        if probability is None:
            return (
                "No current fraud probability is available. "
                "Analyze a transaction first."
            )

        return (
            f"The current fraud probability is "
            f"{probability * 100:.2f}%. "
            "This is a risk score, not absolute proof "
            "that the transaction is fraudulent."
        )

    # --------------------------------------------------------
    # Threshold
    # --------------------------------------------------------

    if "threshold" in text:
        return (
            f"FraudLens currently uses a "
            f"{threshold * 100:.0f}% decision threshold. "
            "At or above this level, the model classifies "
            "the transaction as potentially fraudulent."
        )

    # --------------------------------------------------------
    # Current transaction
    # --------------------------------------------------------

    if (
        "transaction" in text
        and (
            "details" in text
            or "current" in text
            or "tell me about" in text
        )
    ):
        if prediction is None:
            return (
                "There is no current transaction prediction "
                "available."
            )

        amount_text = (
            f"${float(amount):.2f}"
            if amount is not None
            else "not provided"
        )

        return (
            f"Reference: {reference or 'Not specified'}\n"
            f"Amount: {amount_text}\n"
            f"Risk level: {risk_level or 'Unknown'}\n"
            f"Fraud probability: "
            f"{(probability or 0) * 100:.2f}%\n"
            f"Decision: "
            f"{'Potential Fraud' if fraud else 'Legitimate'}\n"
            f"Review status: "
            f"{review_status or 'Pending'}"
        )

    # --------------------------------------------------------
    # Review guidance
    # --------------------------------------------------------

    if (
        "review" in text
        or "what should i do" in text
        or "action" in text
    ):
        if probability is None:
            return (
                "Analyze a transaction first. "
                "Then I can explain the appropriate "
                "review action."
            )

        if fraud or probability >= threshold:
            return (
                "This transaction should be reviewed because "
                f"its fraud probability is "
                f"{probability * 100:.2f}%, which meets or "
                f"exceeds the {threshold * 100:.0f}% threshold."
            )

        return (
            "The transaction is currently below the fraud "
            "decision threshold. It does not appear to "
            "require fraud escalation based on this model result."
        )

    # --------------------------------------------------------
    # Model information
    # --------------------------------------------------------

    if (
        "model" in text
        or "random forest" in text
    ):
        return (
            f"FraudLens currently uses the "
            f"{metadata.get('model_name', 'Random Forest')} "
            f"model, version "
            f"{metadata.get('model_version', '1.0.0')}, "
            f"with a "
            f"{threshold * 100:.0f}% decision threshold "
            f"and {len(feature_list)} input features."
        )

    # --------------------------------------------------------
    # Metrics
    # --------------------------------------------------------

    if (
        "precision" in text
        or "recall" in text
        or "f1" in text
        or "roc" in text
        or "pr-auc" in text
        or "metrics" in text
    ):
        precision = metadata.get("precision")
        recall = metadata.get("recall")
        f1 = metadata.get("f1_score")
        roc_auc = metadata.get("roc_auc")
        pr_auc = metadata.get("pr_auc")

        return (
            "Current model evaluation metrics:\n"
            f"Precision: "
            f"{precision * 100:.2f}%\n"
            f"Recall: "
            f"{recall * 100:.2f}%\n"
            f"F1 Score: "
            f"{f1 * 100:.2f}%\n"
            f"ROC-AUC: "
            f"{roc_auc * 100:.2f}%\n"
            f"PR-AUC: "
            f"{pr_auc * 100:.2f}%"
        )

    # --------------------------------------------------------
    # History
    # --------------------------------------------------------

    if (
        "history" in text
        or "recent" in text
        or "transactions" in text
    ):
        if not history:
            return (
                "There are no recent transaction records "
                "available yet."
            )

        fraud_count = sum(
            1
            for item in history
            if item.get("fraud")
        )

        return (
            f"There are {len(history)} recent transaction "
            f"records in the supplied context. "
            f"{fraud_count} are classified as fraud."
        )

    # --------------------------------------------------------
    # Help
    # --------------------------------------------------------

    if (
        "help" in text
        or "what can you do" in text
    ):
        return (
            "I can explain the current transaction risk, "
            "fraud probability, decision threshold, model "
            "information, evaluation metrics, recent "
            "transaction activity and recommended review action."
        )

    # --------------------------------------------------------
    # Default response
    # --------------------------------------------------------

    if prediction:
        return (
            f"I can help explain "
            f"{reference or 'the current transaction'}. "
            "Try asking why it was classified as high or low "
            "risk, what the fraud probability means, or what "
            "the decision threshold means."
        )

    return (
        "I can help with transaction risk, fraud probability, "
        "decision thresholds, model information and recent "
        "transaction activity. Analyze a transaction first "
        "for more specific context."
    )


# ============================================================
# Health check
# ============================================================

@app.get("/")
def home():
    return {
        "message": "Fraud Detection API is running",
        "version": metadata["model_version"],
        "ai_assistant": True,
        "assistant_type": "local",
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
        "precision": metadata.get("precision"),
        "recall": metadata.get("recall"),
        "f1_score": metadata.get("f1_score"),
        "roc_auc": metadata.get("roc_auc"),
        "pr_auc": metadata.get("pr_auc"),
        "training_date": metadata.get(
            "training_date"
        ),
        "features": metadata.get(
            "features",
            feature_list,
        ),
        "feature_count": len(feature_list),
    }


# ============================================================
# Fraud prediction
# ============================================================

@app.post("/predict")
def predict(
    transaction: Transaction,
    db: Session = Depends(get_db),
):

    if len(transaction.features) != len(
        feature_list
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                f"Expected {len(feature_list)} "
                f"features, received "
                f"{len(transaction.features)}."
            ),
        )

    input_data = pd.DataFrame(
        [transaction.features],
        columns=feature_list,
    )

    probability = float(
        model.predict_proba(
            input_data
        )[0][1]
    )

    threshold = float(
        metadata["threshold"]
    )

    prediction = int(
        probability >= threshold
    )

    risk_level = get_risk_level(
        probability,
        threshold,
    )

    risk_explanation = get_risk_explanation(
        probability,
        threshold,
        risk_level,
    )

    reference = (
        transaction.reference
        or (
            "TX-"
            + datetime.now().strftime(
                "%Y%m%d%H%M%S"
            )
        )
    )

    amount = float(
        transaction.features[-1]
    )

    record = TransactionRecord(
        reference=reference,
        transaction_time=(
            transaction.transaction_time
        ),
        amount=amount,
        probability=probability,
        fraud=bool(prediction),
        risk_level=risk_level,
        risk_explanation=risk_explanation,
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

    return {
        "id": record.id,
        "reference": record.reference,
        "amount": record.amount,
        "fraud": bool(prediction),
        "probability": probability,
        "risk_level": risk_level,
        "risk_explanation": risk_explanation,
        "threshold": threshold,
        "model_version": metadata[
            "model_version"
        ],
        "review_status": record.review_status,
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

    return transaction_to_dict(record)


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

    if request.status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail=(
                "Status must be Pending, "
                "Reviewed, or Dismissed."
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

    return transaction_to_dict(record)


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
            TransactionRecord.fraud == True
        )
        .scalar()
        or 0
    )

    legitimate = total - fraud

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
        "fraud_rate": float(fraud_rate),
        "average_risk": float(
            average_probability
        ),
        "highest_risk": float(
            highest_probability
        ),
    }


# ============================================================
# Local Fraud Copilot
# ============================================================

@app.post("/assistant")
def assistant(
    request: AssistantRequest,
):

    message = request.message.strip()

    if not message:
        raise HTTPException(
            status_code=400,
            detail="Message cannot be empty.",
        )

    return {
        "reply": local_copilot_response(
            message=message,
            prediction=request.prediction,
            history=request.history,
        ),
        "model": "FraudLens Local Copilot",
    }
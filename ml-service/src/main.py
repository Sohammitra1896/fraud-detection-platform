from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import json
import pandas as pd

app = FastAPI(
    title="Fraud Detection API",
    version="1.0.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load trained model
model = joblib.load("models/fraud_model.pkl")

# Load scaler
scaler = joblib.load("models/scaler.pkl")

# Load feature list
feature_list = joblib.load("models/feature_list.pkl")

# Load model metadata
with open("models/model_metadata.json", "r") as file:
    metadata = json.load(file)


@app.get("/")
def home():
    return {
        "message": "Fraud Detection API is running",
        "version": metadata["model_version"]
    }


class Transaction(BaseModel):
    features: list[float]


@app.post("/predict")
def predict(transaction: Transaction):

    input_data = pd.DataFrame(
        [transaction.features],
        columns=feature_list
    )

    probability = model.predict_proba(input_data)[0][1]

    threshold = metadata["threshold"]

    prediction = int(probability >= threshold)

    return {
        "fraud": bool(prediction),
        "probability": float(probability),
        "threshold": float(threshold),
        "model_version": metadata["model_version"]
    }
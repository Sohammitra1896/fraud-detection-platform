
# FraudLens

## Intelligent Transaction Risk Detection

FraudLens is a machine-learning based fraud detection platform that analyzes transaction data, estimates fraud probability, classifies transaction risk, stores analysis history, and provides a simple investigation workflow.

The platform is designed to make machine-learning based fraud detection understandable and usable through a practical web interface.

---

## Problem

Financial transaction systems can generate a large number of transactions that are difficult to manually review.

A useful fraud detection system should be able to:

- identify potentially fraudulent transactions
- provide a measurable risk score
- separate low-risk and high-risk transactions
- maintain a history of analyzed transactions
- support investigation and review
- present results in an understandable way

---

## Solution

FraudLens combines:

- React for the user interface
- FastAPI for backend services
- Random Forest for fraud prediction
- PostgreSQL for persistent transaction storage
- a local Fraud Copilot for explaining predictions

The system evaluates a transaction using the trained machine-learning model and returns:

- fraud probability
- risk level
- fraud/legitimate classification
- decision threshold
- plain-language risk explanation
- review status

---

## Key Features

### Transaction Analysis

Users can analyze a transaction and receive an immediate risk assessment.

The interface provides basic transaction information while advanced model features remain hidden unless needed.

### Fraud Detection

The deployed Random Forest model produces a fraud probability and compares it with the configured decision threshold.

Current decision threshold:

```text
55%
Risk Classification
Transactions are classified into:

Low Risk

Medium Risk

High Risk

Transaction History
All analyzed transactions are stored in PostgreSQL and can be reviewed later.

Each transaction contains information such as:

transaction reference

amount

fraud probability

risk level

classification

review status

model version

analysis timestamp

Transaction Investigation
Users can open an analyzed transaction and view:

fraud probability

decision threshold

risk level

explanation

transaction details

review status

Transactions can be marked as:


Pending
Reviewed
Dismissed
Dashboard
The Dashboard provides an overview of:

total analyzed transactions

legitimate transactions

detected fraud

pending review cases

average transaction risk

high-risk transactions requiring attention

Analytics
FraudLens provides database-backed analytics including:

total transactions

legitimate transactions

detected fraud

fraud rate

average fraud probability

highest fraud probability

Model Information
The Model section provides information about the currently deployed model and its evaluation metrics.

Fraud Copilot
Fraud Copilot is a local assistant built into the FastAPI backend.

It can explain:

transaction risk

fraud probability

decision threshold

model information

evaluation metrics

recent transaction activity

recommended review actions

The current implementation does not require an external AI API.

System Architecture

                     ┌──────────────────────┐
                     │     React + Vite      │
                     │       Frontend       │
                     └──────────┬───────────┘
                                │
                                │ HTTP / JSON
                                ▼
                     ┌──────────────────────┐
                     │       FastAPI        │
                     │       Backend        │
                     └──────────┬───────────┘
                                │
               ┌────────────────┼────────────────┐
               │                │                │
               ▼                ▼                ▼
        ┌────────────┐   ┌──────────────┐  ┌───────────────┐
        │  Random    │   │  PostgreSQL  │  │ Fraud Copilot │
        │  Forest    │   │   Database   │  │  Local Logic  │
        └────────────┘   └──────────────┘  └───────────────┘
Technology Stack
Frontend
React

Vite

JavaScript

CSS

Backend
Python

FastAPI

Pydantic

SQLAlchemy

Machine Learning
Python

Pandas

Scikit-learn

Joblib

Database
PostgreSQL

Development Tools
Git

GitHub

Postgres.app

Uvicorn

Machine Learning Model
FraudLens currently uses a:


Random Forest Classifier
Model version:


1.0.0
Number of model input features:


30
The model uses:


Time
V1
V2
V3
...
V28
Amount
The configured fraud decision threshold is:


0.55
or:


55%
Model Evaluation
The deployed model currently reports:

MetricValue	
Precision	93.90%
Recall	78.57%
F1 Score	85.56%
ROC-AUC	95.73%
PR-AUC	86.29%
Training date:


2026-08-20 13:20:27
These values are reported by the project's current model metadata.

Dataset
The project uses the credit-card transaction dataset stored at:


ml-service/data/raw/creditcard.csv
The exploratory analysis notebook is located at:


ml-service/notebooks/01_eda.ipynb
The dataset contains legitimate and fraudulent transaction records.

The exploratory analysis records:


Fraudulent transactions: 492
API Endpoints
Health Check

GET /
Returns API status and system information.

Model Information

GET /model
Returns:

model name

version

threshold

evaluation metrics

training date

feature count

Fraud Prediction

POST /predict
Accepts transaction features and returns a fraud prediction.

The request must contain all 30 model features.

Example structure:


{
  "features": [
    0,
    -1.359807,
    -0.072781,
    2.536347
  ]
}
The actual request requires all 30 values.

Transaction History

GET /transactions
Returns analyzed transactions stored in PostgreSQL.

Single Transaction

GET /transactions/{transaction_id}
Returns information about one transaction.

Review Status

PATCH /transactions/{transaction_id}/review
Updates transaction review status.

Supported statuses:


Pending
Reviewed
Dismissed
Analytics

GET /analytics
Returns transaction statistics calculated from PostgreSQL.

Fraud Copilot

POST /assistant
Accepts a user question and relevant transaction context and returns a locally generated explanation.

Database Design
FraudLens stores analyzed transactions in:


transactions
Important fields include:


id
reference
transaction_time
amount
probability
fraud
risk_level
risk_explanation
threshold
model_version
review_status
features
created_at
Project Structure

fraud-detection-platform/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   └── package.json
│
├── ml-service/
│   ├── data/
│   │   └── raw/
│   │       └── creditcard.csv
│   │
│   ├── models/
│   │   ├── fraud_model.pkl
│   │   ├── scaler.pkl
│   │   ├── feature_list.pkl
│   │   └── model_metadata.json
│   │
│   ├── notebooks/
│   │   └── 01_eda.ipynb
│   │
│   ├── src/
│   │   ├── __init__.py
│   │   ├── database.py
│   │   ├── main.py
│   │   └── model.py
│   │
│   ├── .env.example
│   └── requirements.txt
│
├── .gitignore
└── README.md
Local Setup
1. Clone the repository

git clone <your-github-repository-url>
cd fraud-detection-platform
2. Set up the backend

cd ml-service
python3 -m venv venv
source venv/bin/activate
Install dependencies:


pip install -r requirements.txt
3. Set up PostgreSQL
Install and start PostgreSQL locally.

Create a PostgreSQL database named:


fraudlens
The application expects PostgreSQL to be available locally.

4. Configure environment
Copy the example environment file:


cp .env.example .env
The current FraudLens version uses the local Fraud Copilot, so no external AI API key is required.

5. Start FastAPI
From:


ml-service/
run:


uvicorn src.main:app --reload
Backend:


http://127.0.0.1:8000
Swagger documentation:


http://127.0.0.1:8000/docs
6. Start the frontend
Open another terminal:


cd frontend
npm install
npm run dev
Frontend:


http://localhost:5173
Demo Workflow
FraudLens can be demonstrated using the following workflow:


1. Open Analyze Transaction
        ↓
2. Use Legitimate Sample
        ↓
3. Analyze Transaction
        ↓
4. View Low Risk result
        ↓
5. Use Test Fraud Scenario
        ↓
6. Analyze Transaction
        ↓
7. View High Risk / 100% result
        ↓
8. Open Transactions
        ↓
9. Open the fraud transaction
        ↓
10. Review the risk explanation
        ↓
11. Mark transaction as Reviewed
        ↓
12. Open Dashboard
        ↓
13. Open Analytics
        ↓
14. Ask Fraud Copilot about the transaction
Fraud Demo
FraudLens includes a demonstration scenario using a genuine fraud transaction from the project's dataset.

The current model scores the selected fraud demonstration transaction at:


100% fraud probability
with a configured decision threshold of:


55%
This allows the complete fraud detection and investigation workflow to be demonstrated through the UI.

Limitations
The current version is a project/demo system rather than a production banking fraud engine.

Important limitations include:

predictions depend on the trained dataset and model

the current input representation contains anonymized model features

model predictions are risk signals rather than proof of fraud

the current Fraud Copilot is rule-based rather than a large language model

deployment configuration is currently intended for local development

Future Improvements
Potential future improvements include:

real-time transaction streaming

richer transaction attributes

user authentication and role-based access

alert notifications

explainable ML methods such as SHAP

model retraining pipelines

model version management

production monitoring

cloud deployment

automated fraud case management

real-world feature engineering

role-based investigation workflows

Project Objective
FraudLens demonstrates how machine learning can be integrated into a complete software system rather than being used only as an isolated model.

The project combines:


Machine Learning
+
Backend API
+
Database
+
Frontend
+
Investigation Workflow
+
Analytics
+
Local Fraud Copilot
to create a practical end-to-end fraud detection platform.






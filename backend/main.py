from __future__ import annotations

from typing import List

import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.config import API_TITLE, CORS_ALLOW_ORIGINS
from backend.ml_model import RiskModel
from backend.routes import create_analyze_router
from backend.visualization import (
    plot_condition_distribution,
    plot_passport_age,
    plot_risk_distribution,
    plot_by_type,
)

app = FastAPI(title=API_TITLE)
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ALLOW_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

risk_model = RiskModel()
app.include_router(create_analyze_router(risk_model))


@app.post("/visualize")
def visualize(data: List[dict]) -> dict:
    if not data:
        return {
            "condition_chart": None,
            "risk_chart": None,
            "passport_age_chart": None,
            "type_chart": None,
        }

    df = pd.DataFrame(data)

    return {
        "condition_chart": plot_condition_distribution(df),
        "risk_chart": plot_risk_distribution(df),
        "passport_age_chart": plot_passport_age(df),
        "type_chart": plot_by_type(df),
    }


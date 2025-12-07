from __future__ import annotations

"""Service wrapper around RiskForecaster."""

from typing import Dict

import pandas as pd

from app.ai.models import RiskForecaster


class ForecastService:
    """Provides stable time-horizon forecasts."""

    def __init__(self, forecaster: RiskForecaster | None = None) -> None:
        self.forecaster = forecaster or RiskForecaster()

    def fit(self, dataset_with_predictions: pd.DataFrame) -> None:
        if dataset_with_predictions.empty:
            return
        self.forecaster.fit(dataset_with_predictions)

    def predict(self, dataset_with_predictions: pd.DataFrame) -> Dict[str, float]:
        if dataset_with_predictions.empty:
            return {}
        return self.forecaster.forecast(dataset_with_predictions).predictions


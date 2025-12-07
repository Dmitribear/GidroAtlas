from __future__ import annotations

"""Risk forecasting pipeline."""

from dataclasses import dataclass
from typing import Dict, List

import pandas as pd
from joblib import dump
from sklearn.ensemble import RandomForestRegressor

from app.ai.config import settings
from app.ai.data import make_time_series
from app.ai.utils.logger import configure_logger


@dataclass
class ForecastResult:
    horizon_months: int
    predictions: Dict[str, float]


class RiskForecaster:
    """Simple tree-based regressor that projects average risk."""

    def __init__(self, model=None):
        self.logger = configure_logger(self.__class__.__name__)
        self.model = model or RandomForestRegressor(n_estimators=200, random_state=42)
        self.fitted = False

    def fit(self, df) -> None:
        ts = make_time_series(df)
        features = ts[["year_index", "month_index", "avg_condition", "avg_passport_age"]]
        target = ts["risk_share"]
        self.model.fit(features, target)
        dump(self.model, settings.model_dir / "risk_forecaster.pkl")
        self.fitted = True

    def forecast(self, df, horizon: int = 6) -> ForecastResult:
        if not self.fitted:
            self.fit(df)
        ts = make_time_series(df)
        last_row = ts.iloc[-1]
        predictions: List[float] = []
        year = int(last_row["year_index"])
        month = int(last_row["month_index"])
        avg_condition = float(last_row["avg_condition"])
        avg_age = float(last_row["avg_passport_age"])

        for step in range(1, horizon + 1):
            month = (month + 1) % 12
            if month == 0:
                year += 1
            # Keep feature names consistent with training to avoid sklearn warnings.
            features = pd.DataFrame(
                [[year, month, avg_condition, avg_age]],
                columns=["year_index", "month_index", "avg_condition", "avg_passport_age"],
            )
            pred = float(self.model.predict(features)[0])
            predictions.append(max(0.0, min(1.0, pred)))

        labels = {f"{(step+1)*3}_months": round(value, 3) for step, value in enumerate(predictions)}
        return ForecastResult(horizon_months=horizon, predictions=labels)


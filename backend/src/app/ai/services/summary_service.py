from __future__ import annotations

"""Summary aggregation service."""

from typing import Dict

import pandas as pd


class SummaryService:
    """Builds high-level metrics for dashboards."""

    def build(self, dataset_with_predictions: pd.DataFrame) -> Dict[str, float]:
        df = dataset_with_predictions
        if df.empty:
            return {
                "total_objects": 0,
                "avg_risk": 0.0,
                "critical_objects": 0,
                "avg_condition": 0.0,
                "avg_passport_age": 0.0,
                "fauna_count": 0,
            }
        return {
            "total_objects": int(df.shape[0]),
            "avg_risk": round(float(df["risk_score"].mean()), 3),
            "critical_objects": int((df["risk_score"] > 0.7).sum()),
            "avg_condition": round(float(df["condition"].mean()), 2),
            "avg_passport_age": round(float(df["passport_age_years"].mean()), 1),
            "fauna_count": int((df["fauna"] == 1).sum()),
        }


from __future__ import annotations

"""Anomaly detection for risky assets."""

from dataclasses import dataclass
from typing import Dict, List

import pandas as pd
from joblib import dump
from sklearn.ensemble import IsolationForest

from backend.config import settings
from backend.utils.logger import configure_logger


@dataclass
class AnomalyRecord:
    """Single anomalous asset description."""

    name: str
    region: str
    resource_type: str
    score: float


@dataclass
class AnomalyMetrics:
    """Summary statistics for anomaly scores."""

    mean_score: float
    std_score: float
    top_score: float
    threshold: float

    def to_dict(self) -> Dict[str, float]:
        return {
            "mean_score": self.mean_score,
            "std_score": self.std_score,
            "top_score": self.top_score,
            "threshold": self.threshold,
        }


class AnomalyDetector:
    """Isolation Forest on key operational indicators."""

    def __init__(self, contamination: float = 0.08, random_state: int = 42):
        self.model = IsolationForest(random_state=random_state, contamination=contamination)
        self.logger = configure_logger(self.__class__.__name__)
        self.fitted = False
        self.contamination = contamination

    def fit(self, df: pd.DataFrame) -> None:
        if df.empty:
            self.logger.warning("Skip anomaly training: dataset is empty.")
            return
        features = df[["risk_score", "condition", "passport_age_years", "lat", "lon"]]
        self.model.fit(features)
        dump(self.model, settings.model_dir / "risk_anomaly.pkl")
        self.fitted = True

    def detect(self, df: pd.DataFrame, top_n: int = 5) -> List[AnomalyRecord]:
        if not self.fitted:
            self.fit(df)
        if df.empty:
            return []
        scores = self.model.decision_function(df[["risk_score", "condition", "passport_age_years", "lat", "lon"]])
        df = df.copy()
        df["anomaly_score"] = -scores  # lower decision function => more anomalous
        anomalies = df.nlargest(top_n, "anomaly_score")
        return [
            AnomalyRecord(
                name=row["name"],
                region=row["region"],
                resource_type=row["resource_type"],
                score=round(float(row["anomaly_score"]), 3),
            )
            for _, row in anomalies.iterrows()
        ]

    def metrics(self, df: pd.DataFrame) -> AnomalyMetrics:
        """Provide descriptive statistics for anomaly scores."""

        if df.empty or not self.fitted:
            return AnomalyMetrics(mean_score=0.0, std_score=0.0, top_score=0.0, threshold=0.0)
        scores = self.model.decision_function(df[["risk_score", "condition", "passport_age_years", "lat", "lon"]])
        threshold = float(pd.Series(scores).quantile(self.contamination))
        return AnomalyMetrics(
            mean_score=float(scores.mean()),
            std_score=float(scores.std()),
            top_score=float(scores.min()),
            threshold=threshold,
        )


from __future__ import annotations

"""Service wrapper for anomaly detection."""

from dataclasses import asdict
from typing import Dict, List

import pandas as pd

from backend.models import AnomalyDetector


class AnomalyService:
    """Handles IsolationForest training and reporting."""

    def __init__(self, detector: AnomalyDetector | None = None) -> None:
        self.detector = detector or AnomalyDetector()

    def fit(self, dataset_with_predictions: pd.DataFrame) -> None:
        if dataset_with_predictions.empty:
            return
        self.detector.fit(dataset_with_predictions)

    def detect(self, dataset_with_predictions: pd.DataFrame, top_n: int = 5) -> List[Dict[str, object]]:
        if dataset_with_predictions.empty:
            return []
        records = self.detector.detect(dataset_with_predictions, top_n=top_n)
        return [asdict(record) for record in records]

    def metrics(self, dataset_with_predictions: pd.DataFrame) -> Dict[str, float]:
        if dataset_with_predictions.empty:
            return {"mean_score": 0.0, "std_score": 0.0, "top_score": 0.0, "threshold": 0.0}
        return self.detector.metrics(dataset_with_predictions).to_dict()


from __future__ import annotations

"""Clustering utilities for grouped insights."""

from typing import Dict, List

import pandas as pd
from sklearn.cluster import KMeans


class ClusterService:
    """Generates cluster summaries based on risk/condition/location."""

    def __init__(self, n_clusters: int = 3) -> None:
        self.n_clusters = n_clusters

    def build(self, dataset_with_predictions: pd.DataFrame) -> List[Dict[str, object]]:
        if dataset_with_predictions.empty:
            return []
        features = dataset_with_predictions[["risk_score", "condition", "passport_age_years", "lat", "lon"]]
        kmeans = KMeans(n_clusters=self.n_clusters, n_init=10, random_state=42)
        clusters = kmeans.fit_predict(features)
        df = dataset_with_predictions.copy()
        df["cluster"] = clusters
        summary: List[Dict[str, object]] = []
        for label in sorted(df["cluster"].unique()):
            group = df[df["cluster"] == label]
            summary.append(
                {
                    "cluster_id": int(label),
                    "cluster_risk_mean": round(float(group["risk_score"].mean()), 3),
                    "count": int(group.shape[0]),
                    "condition_avg": round(float(group["condition"].mean()), 2),
                    "critical_present": bool((group["risk_score"] > 0.7).any()),
                }
            )
        return summary


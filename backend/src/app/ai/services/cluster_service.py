from __future__ import annotations

"""Clustering utilities for grouped insights."""

from typing import Dict, List

import numpy as np
import pandas as pd
from sklearn.cluster import KMeans


class ClusterService:
    """Generates cluster summaries based on risk/condition/location."""

    def __init__(self, n_clusters: int = 3) -> None:
        self.n_clusters = n_clusters

    def build(self, dataset_with_predictions: pd.DataFrame) -> List[Dict[str, object]]:
        if dataset_with_predictions.empty:
            return []

        df = dataset_with_predictions.dropna(subset=["lat", "lon"]).copy()
        if df.empty:
            return []

        features = df[["risk_score", "condition", "passport_age_years", "lat", "lon"]].astype(float)
        cluster_count = max(1, min(self.n_clusters, len(features)))
        kmeans = KMeans(n_clusters=cluster_count, n_init=10, random_state=42)
        clusters = kmeans.fit_predict(features)
        centroids = kmeans.cluster_centers_

        df["cluster"] = clusters
        distances = np.linalg.norm(features.values - centroids[clusters], axis=1)
        df["cluster_distance"] = distances

        enriched: List[Dict[str, object]] = []
        for _, row in df.iterrows():
            enriched.append(
                {
                    "name": row.get("name"),
                    "region": row.get("region"),
                    "cluster": int(row["cluster"]),
                    "lat": float(row["lat"]) if pd.notna(row["lat"]) else None,
                    "lon": float(row["lon"]) if pd.notna(row["lon"]) else None,
                    "risk_score": round(float(row["risk_score"]), 3) if pd.notna(row["risk_score"]) else None,
                    "priority_score": int(row["priority_score"]) if pd.notna(row["priority_score"]) else None,
                    "condition": int(row["condition"]) if pd.notna(row["condition"]) else None,
                    "passport_age_years": float(row["passport_age_years"]) if pd.notna(row["passport_age_years"]) else None,
                    "cluster_distance": round(float(row["cluster_distance"]), 3) if pd.notna(row["cluster_distance"]) else None,
                }
            )
        return enriched


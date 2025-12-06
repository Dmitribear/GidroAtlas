from __future__ import annotations

"""Local interpretation service."""

from typing import Dict

from backend.ml_interpretation import (
    explain_anomalies,
    generate_recommendations,
    simulate_scenario,
)
from backend.services.analytics import AnalyticsService


class InsightService:
    """Bridges core analytics with interpretation narratives."""

    def __init__(self, analytics_service: AnalyticsService):
        self.analytics = analytics_service

    def anomaly_report(self) -> str:
        anomalies = self.analytics.anomalies()
        return explain_anomalies(anomalies)

    def recommendations(self) -> str:
        summary = self.analytics.summary()
        forecast = self.analytics.forecast()
        return generate_recommendations(summary, forecast)

    def simulate(self, payload: Dict[str, float]) -> str:
        return simulate_scenario(payload)


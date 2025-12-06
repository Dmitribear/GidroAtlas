from __future__ import annotations

"""Central analytics service orchestrating dedicated domain services."""

import io
from typing import Any, Dict, List

import pandas as pd
from fastapi import HTTPException, UploadFile

from backend.data import REQUIRED_COLUMNS
from backend.services.anomaly_service import AnomalyService
from backend.services.cluster_service import ClusterService
from backend.services.forecast_service import ForecastService
from backend.services.risk_service import RiskService
from backend.services.summary_service import SummaryService


class AnalyticsService:
    """Thin orchestrator delegating heavy lifting to specialized services."""

    def __init__(
        self,
        risk_service: RiskService | None = None,
        summary_service: SummaryService | None = None,
        cluster_service: ClusterService | None = None,
        forecast_service: ForecastService | None = None,
        anomaly_service: AnomalyService | None = None,
    ) -> None:
        self.risk_service = risk_service or RiskService()
        self.summary_service = summary_service or SummaryService()
        self.cluster_service = cluster_service or ClusterService()
        self.forecast_service = forecast_service or ForecastService()
        self.anomaly_service = anomaly_service or AnomalyService()
        self.refresh()

    # ------------------------------------------------------------------ #
    def refresh(self) -> None:
        """Reload dataset and re-fit stateful services."""

        self.risk_service.refresh()
        dataset = self.risk_service.dataset_with_predictions
        self.forecast_service.fit(dataset)
        self.anomaly_service.fit(dataset)

    # ------------------------------------------------------------------ #
    def predict(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        return self.risk_service.predict(payload).to_dict()

    def summary(self) -> Dict[str, Any]:
        return self.summary_service.build(self.risk_service.dataset_with_predictions)

    def clusters(self) -> List[Dict[str, Any]]:
        return self.cluster_service.build(self.risk_service.dataset_with_predictions)

    def forecast(self) -> Dict[str, Any]:
        return self.forecast_service.predict(self.risk_service.dataset_with_predictions)

    def anomalies(self) -> List[Dict[str, Any]]:
        return self.anomaly_service.detect(self.risk_service.dataset_with_predictions)

    def anomaly_metrics(self) -> Dict[str, float]:
        return self.anomaly_service.metrics(self.risk_service.dataset_with_predictions)

    def objects(self) -> List[Dict[str, Any]]:
        return self.risk_service.objects()

    async def upload_csv(self, file: UploadFile) -> Dict[str, Any]:
        content = await file.read()
        if not content:
            raise HTTPException(status_code=400, detail="Файл пуст.")
        frame = pd.read_csv(io.BytesIO(content))
        missing = set(REQUIRED_COLUMNS) - set(frame.columns)
        if missing:
            raise HTTPException(status_code=400, detail=f"Отсутствуют обязательные колонки: {', '.join(sorted(missing))}")
        try:
            result = self.risk_service.replace_dataset(frame)
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        self.refresh()
        return {"status": result["status"], "rows": int(frame.shape[0]), "metrics": result["metrics"]}


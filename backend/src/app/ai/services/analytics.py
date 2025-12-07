from __future__ import annotations

"""Central analytics service orchestrating dedicated domain services."""

import io
from datetime import datetime
from typing import Any, Dict, List

import pandas as pd
from fastapi import HTTPException, UploadFile

from app.ai.data import REQUIRED_COLUMNS
from app.ai.data.transform import align_required_columns
from app.core.config import get_settings
from app.infrastructure.supabase.client import SupabaseClient
from app.ai.services.anomaly_service import AnomalyService
from app.ai.services.cluster_service import ClusterService
from app.ai.services.forecast_service import ForecastService
from app.ai.services.risk_service import RiskService
from app.ai.services.summary_service import SummaryService


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
        settings = get_settings()
        self._supabase = SupabaseClient(settings.supabase_url, settings.supabase_key)
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
        forecasts = self.forecast_service.predict(self.risk_service.dataset_with_predictions)
        if not forecasts:
            return {"series": [], "raw": {}}
        series: List[Dict[str, Any]] = []
        base = pd.Timestamp(datetime.utcnow()).normalize()
        for key, value in sorted(forecasts.items(), key=lambda item: self._months_from_key(item[0])):
            months = self._months_from_key(key)
            future_date = base + pd.DateOffset(months=months)
            score = round(float(value), 3)
            series.append(
                {
                    "label": key,
                    "title": self._horizon_title(months),
                    "date": future_date.strftime("%Y-%m"),
                    "horizon_months": months,
                    "value": score,
                    "lower": round(max(0.0, score - 0.07), 3),
                    "upper": round(min(1.0, score + 0.07), 3),
                }
            )
        return {"series": series, "raw": forecasts}

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
        try:
            frame = align_required_columns(frame, REQUIRED_COLUMNS, optional=["condition"])
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        if "condition" not in frame.columns:
            frame = await self._inject_condition_from_supabase(frame)
        try:
            result = self.risk_service.replace_dataset(frame)
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        self.refresh()
        return {"status": result["status"], "rows": int(frame.shape[0]), "metrics": result["metrics"]}

    async def _inject_condition_from_supabase(self, frame: pd.DataFrame) -> pd.DataFrame:
        """Fill missing condition column using Supabase computed_metrics."""

        objects = await self._supabase.select_many("water_objects")
        metrics = await self._supabase.select_many("computed_metrics")

        def normalize(name: str | None) -> str:
            return (name or "").strip().lower()

        name_to_id = {normalize(row["name"]): row["id"] for row in objects if row.get("name") and row.get("id")}
        id_to_condition = {
            row["object_id"]: row["technical_condition"]
            for row in metrics
            if row.get("object_id") and row.get("technical_condition") is not None
        }

        conditions: list[int] = []
        missing_names: list[str] = []

        for _, row in frame.iterrows():
            obj_id = name_to_id.get(normalize(row.get("name")))
            condition = id_to_condition.get(obj_id) if obj_id else None
            if condition is None:
                missing_names.append(str(row.get("name") or ""))
                conditions.append(None)
            else:
                conditions.append(int(condition))

        if missing_names:
            unique = sorted({name for name in missing_names if name})
            raise HTTPException(
                status_code=400,
                detail=f"Не удалось определить техническое состояние для объектов: {', '.join(unique) or 'неизвестно'}",
            )

        frame = frame.copy()
        frame["condition"] = conditions
        return frame

    @staticmethod
    def _months_from_key(key: str) -> int:
        digits = "".join(ch for ch in key if ch.isdigit())
        return int(digits or 0)

    @staticmethod
    def _horizon_title(months: int) -> str:
        if months < 12:
            return f"{months} мес."
        years = months // 12
        rest = months % 12
        if rest == 0:
            return f"{years} г."
        return f"{years} г. {rest} мес."


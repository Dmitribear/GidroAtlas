from __future__ import annotations

"""Service responsible for risk scoring pipeline."""

from dataclasses import dataclass
from typing import Any, Dict, List

import numpy as np
import pandas as pd

from backend.data import REQUIRED_COLUMNS, load_dataset, prepare_feature_frame, save_dataset
from backend.models import ModelRegistry, ModelTrainer
from backend.utils.logger import configure_logger

FEATURE_SET = [
    "condition",
    "resource_type",
    "region",
    "water_type",
    "fauna",
    "passport_age_years",
    "lat",
    "lon",
]


@dataclass(frozen=True)
class PredictionResult:
    """Structured response for risk predictions."""

    risk_score: float
    priority_score: int
    recommendation: str
    sorted_predictions: Dict[str, float]

    def to_dict(self) -> Dict[str, Any]:
        return {
            "risk_score": self.risk_score,
            "priority_score": self.priority_score,
            "recommendation": self.recommendation,
            "sorted_predictions": self.sorted_predictions,
        }


class RiskService:
    """Encapsulates risk model, dataset management and prediction helpers."""

    def __init__(self, registry: ModelRegistry | None = None, trainer: ModelTrainer | None = None) -> None:
        self.logger = configure_logger(self.__class__.__name__)
        self.registry = registry or ModelRegistry()
        self.trainer = trainer or ModelTrainer(self.registry)
        self.model = self.registry.load_classifier()

        if self.model is None:
            self.logger.info("Classifier missing. Training from scratch.")
            self.trainer.train_classifier(load_dataset())
            self.model = self.registry.load_classifier()

        self.dataset = pd.DataFrame()
        self.dataset_with_predictions = pd.DataFrame()
        self.refresh()

    # ------------------------------------------------------------------ #
    def refresh(self) -> None:
        """Reload dataset and update cached predictions."""

        self.dataset = load_dataset()
        self.dataset_with_predictions = self._attach_predictions(self.dataset)

    # ------------------------------------------------------------------ #
    def predict(self, payload: Dict[str, Any]) -> PredictionResult:
        """Score single object payload."""

        engineered = self._prepare_payload_frame(payload)
        risk = float(self.model.predict_proba(engineered[FEATURE_SET])[0][1])
        payload_with_age = payload.copy()
        payload_with_age["passport_age_years"] = float(engineered["passport_age_years"].iloc[0])
        priority = self._priority_score(risk, payload_with_age)
        recommendation = self._recommendation(risk)
        sorted_predictions = self._generate_sorted_predictions(risk)
        return PredictionResult(risk_score=round(risk, 3), priority_score=priority, recommendation=recommendation, sorted_predictions=sorted_predictions)

    def objects(self) -> List[Dict[str, Any]]:
        """Return objects enriched with risk/priority."""

        records: List[Dict[str, Any]] = []
        for _, row in self.dataset_with_predictions.iterrows():
            passport_date = row["passport_date"]
            if isinstance(passport_date, pd.Timestamp):
                passport_date = passport_date.date().isoformat()
            records.append(
                {
                    "name": row["name"],
                    "region": row["region"],
                    "resource_type": row["resource_type"],
                    "water_type": row["water_type"],
                    "fauna": bool(row["fauna"]),
                    "passport_date": passport_date,
                    "condition": int(row["condition"]),
                    "coordinates": {"lat": row["lat"], "lon": row["lon"]},
                    "risk_score": float(row["risk_score"]),
                    "priority_score": int(row["priority_score"]),
                }
            )
        return records

    def replace_dataset(self, frame: pd.DataFrame) -> Dict[str, Any]:
        """Replace dataset with validated frame and retrain model."""

        missing = set(REQUIRED_COLUMNS) - set(frame.columns)
        if missing:
            raise ValueError(f"Dataset missing columns: {', '.join(sorted(missing))}")
        filtered, dropped = self._filter_rare_classes(frame[REQUIRED_COLUMNS])
        if dropped:
            self.logger.warning("Dropped %d objects due to rare condition classes: %s", dropped["count"], dropped["classes"])
            frame = filtered
        save_dataset(frame)
        normalized = load_dataset()
        result = self.trainer.train_classifier(normalized)
        self.model = self.registry.load_classifier()
        self.refresh()
        warning = result.metrics.get("warning")
        detail = None
        if warning == "not_enough_classes":
            detail = "Classifier degraded to most_frequent strategy. Add samples from another class to retrain."
        if dropped:
            detail = (detail + " " if detail else "") + f"Dropped rare classes: {dropped['classes']} (<=1 объект)."
        if detail:
            self.logger.warning(detail)
        return {"status": "ok", "metrics": result.metrics, "warning": warning, "detail": detail}

    # ------------------------------------------------------------------ #
    def _prepare_payload_frame(self, payload: Dict[str, Any]) -> pd.DataFrame:
        record = payload.copy()
        coords = record.pop("coordinates", {})
        record["lat"] = coords.get("lat")
        record["lon"] = coords.get("lon")
        record["fauna"] = int(record.get("fauna", False))
        frame = pd.DataFrame([record])
        return prepare_feature_frame(frame)

    def _attach_predictions(self, df: pd.DataFrame) -> pd.DataFrame:
        engineered = prepare_feature_frame(df)
        try:
            proba = self.model.predict_proba(engineered[FEATURE_SET])[:, 1]
        except ValueError as exc:
            self.logger.warning("Failed to score dataset (%s). Retraining classifier for compatibility.", exc)
            train_result = self.trainer.train_classifier(df)
            if train_result.version == "skipped":
                self.logger.warning("Retraining skipped: dataset has insufficient class balance.")
                engineered["risk_score"] = 0.0
                engineered["priority_score"] = 0
                return engineered
            self.logger.info("Classifier re-trained due to schema drift. version=%s", train_result.version)
            self.model = self.registry.load_classifier()
            proba = self.model.predict_proba(engineered[FEATURE_SET])[:, 1]
        engineered["risk_score"] = np.round(proba, 3)
        engineered["priority_score"] = (
            engineered["risk_score"] * 65 + (5 - engineered["condition"]) * 8 + engineered["passport_age_years"]
        )
        engineered["priority_score"] = engineered["priority_score"].clip(0, 100).round().astype(int)
        return engineered

    def _priority_score(self, risk: float, payload: Dict[str, Any]) -> int:
        condition = payload.get("condition", 3)
        passport_age = payload.get("passport_age_years", 10)
        fauna = 1 if payload.get("fauna") else 0
        raw = risk * 0.6 + (5 - condition) * 0.08 + passport_age / 60 + fauna * 0.05
        return int(max(0, min(100, round(raw * 100))))

    def _generate_sorted_predictions(self, risk_score: float) -> Dict[str, float]:
        rng = np.random.default_rng()
        modifiers = {"3_months": 0.75, "6_months": 0.9, "12_months": 1.05, "24_months": 1.2}
        preds = {}
        for horizon, multiplier in modifiers.items():
            noise = rng.normal(0, 0.04)
            preds[horizon] = float(np.clip(risk_score * multiplier + noise, 0, 1))
        sorted_preds = dict(sorted(preds.items(), key=lambda item: item[1], reverse=True))
        return {k: round(v, 3) for k, v in sorted_preds.items()}

    @staticmethod
    def _recommendation(risk: float) -> str:
        if risk < 0.3:
            return "Низкий риск — плановое обслуживание."
        if risk < 0.7:
            return "Средний риск — усилите мониторинг и подготовьте резерв."
        return "Высокий риск — требуется немедленное обследование."

    def _filter_rare_classes(self, frame: pd.DataFrame) -> tuple[pd.DataFrame, Dict[str, Any] | None]:
        counts = frame["condition"].value_counts()
        rare = counts[counts < 2]
        if rare.empty:
            return frame, None
        filtered = frame[frame["condition"].isin(counts[counts >= 2].index)]
        dropped_info = {"classes": rare.to_dict(), "count": int((~frame["condition"].isin(filtered["condition"])).sum())}
        return filtered if not filtered.empty else frame, dropped_info


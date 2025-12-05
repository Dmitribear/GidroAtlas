from __future__ import annotations

import os
import tempfile
from typing import Callable, Dict, List

import pandas as pd  # type: ignore

from backend.config import REQUIRED_FIELDS
from backend.logic import calculate_priority, load_csv
from backend.ml_model import RiskModel
from backend.schemas import AnalyzeResponse, Metrics, PriorityResult


class CSVProcessingError(Exception):
    """Raised when CSV payload cannot be processed."""


def _persist_tempfile(payload: bytes) -> str:
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".csv")
    tmp.write(payload)
    tmp.flush()
    tmp.close()
    return tmp.name


def _read_dataframe(path: str) -> pd.DataFrame:
    return load_csv(path)


def _validate_columns(df: pd.DataFrame) -> None:
    missing = REQUIRED_FIELDS - set(df.columns)
    if missing:
        raise CSVProcessingError(
            f"Отсутствуют обязательные столбцы: {', '.join(sorted(missing))}"
        )


def _coerce_int(value: object, default: int = 0) -> int:
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


def _normalize_passport_date(value: object) -> str | None:
    if value is None:
        return None
    text = str(value).strip()
    return text or None


def _enrich_with_risk(
    obj: Dict[str, object],
    risk_model: RiskModel | None,
    fauna: int,
) -> Dict[str, object]:
    condition = int(obj["technical_condition"])
    age_years = int(obj["passport_age_years"])
    if risk_model is None:
        timeline = {
            "3_months": 0.0,
            "6_months": 0.0,
            "12_months": 0.0,
            "24_months": 0.0,
        }
    else:
        timeline = risk_model.predict_timeline(condition, age_years, fauna)

    obj["timeline"] = timeline
    obj["risk_probability"] = timeline["12_months"]
    return obj


def calculate_metrics(items: List[Dict[str, object]]) -> Metrics:
    total_objects = len(items)
    if total_objects == 0:
        return Metrics(
            total_objects=0,
            avg_condition=0.0,
            critical_objects=0,
            without_passport=0,
            avg_passport_age=0.0,
        )

    conditions = [int(item.get("technical_condition", 0)) for item in items]
    avg_condition = sum(conditions) / total_objects if total_objects else 0.0

    critical_objects = sum(1 for value in conditions if value == 5)
    without_passport = sum(1 for item in items if not item.get("passport_date"))

    ages = [
        float(item.get("passport_age_years"))
        for item in items
        if item.get("passport_age_years") is not None
    ]
    avg_passport_age = sum(ages) / len(ages) if ages else 0.0

    return Metrics(
        total_objects=total_objects,
        avg_condition=avg_condition,
        critical_objects=critical_objects,
        without_passport=without_passport,
        avg_passport_age=avg_passport_age,
    )


def _get_sort_key(sort_by: str) -> Callable[[Dict[str, object]], float]:
    def _timeline_value(item: Dict[str, object], key: str) -> float:
        timeline = item.get("timeline", {})  # type: ignore[assignment]
        if isinstance(timeline, dict):
            return float(timeline.get(key, 0.0))
        return 0.0

    mapping: Dict[str, Callable[[Dict[str, object]], float]] = {
        "risk3": lambda item: _timeline_value(item, "3_months"),
        "risk6": lambda item: _timeline_value(item, "6_months"),
        "risk12": lambda item: _timeline_value(item, "12_months"),
        "risk24": lambda item: _timeline_value(item, "24_months"),
        "priority": lambda item: float(item.get("priority_score", 0.0)),
    }
    return mapping.get(sort_by, mapping["priority"])


def analyze_payload(
    payload: bytes,
    risk_model: RiskModel | None = None,
    sort_by: str = "priority",
) -> AnalyzeResponse:
    if not payload:
        raise CSVProcessingError("Файл пустой")

    tmp_path = _persist_tempfile(payload)
    try:
        df = _read_dataframe(tmp_path)
    except Exception as exc:  # pragma: no cover
        raise CSVProcessingError(f"Ошибка чтения CSV: {exc}") from exc
    finally:
        os.unlink(tmp_path)

    _validate_columns(df)

    enriched: List[Dict[str, object]] = []
    metrics_source: List[Dict[str, object]] = []
    for _, row in df.iterrows():
        row_dict = row.to_dict()
        fauna_val = _coerce_int(row_dict.get("fauna"), default=0)
        passport_date = _normalize_passport_date(row_dict.get("passport_date"))
        base = calculate_priority(row_dict)
        metrics_source.append(
            {
                "technical_condition": base["technical_condition"],
                "passport_age_years": base["passport_age_years"],
                "passport_date": passport_date,
            }
        )
        enriched.append(_enrich_with_risk(base, risk_model, fauna_val))

    sort_key = _get_sort_key(sort_by)
    ordered = sorted(enriched, key=sort_key, reverse=True)

    metrics = calculate_metrics(metrics_source)
    results = [PriorityResult(**item) for item in ordered]

    return AnalyzeResponse(metrics=metrics, results=results)


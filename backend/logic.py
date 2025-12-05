from __future__ import annotations

from datetime import date, datetime
from typing import Any, Dict

import pandas as pd  # type: ignore


def load_csv(path: str) -> pd.DataFrame:
    """Load raw CSV into a DataFrame."""
    return pd.read_csv(path)


def classify(score: int) -> str:
    if score >= 12:
        return "Высокий"
    elif score >= 6:
        return "Средний"
    return "Низкий"


def calculate_priority(obj: Dict[str, Any]) -> Dict[str, Any]:
    """Calculate passport age, score and priority label for a row."""
    technical_condition = int(obj["technical_condition"])
    passport_value = obj["passport_date"]

    if isinstance(passport_value, datetime):
        passport_dt = passport_value.date()
    elif isinstance(passport_value, date):
        passport_dt = passport_value
    else:
        passport_dt = datetime.strptime(str(passport_value), "%Y-%m-%d").date()

    passport_age_years = date.today().year - passport_dt.year
    priority_score = (6 - technical_condition) * 3 + passport_age_years
    priority_level = classify(priority_score)

    return {
        "name": obj.get("name"),
        "technical_condition": technical_condition,
        "passport_age_years": passport_age_years,
        "priority_score": priority_score,
        "priority_level": priority_level,
        "resource_type": obj.get("resource_type", "Не указан"),
    }


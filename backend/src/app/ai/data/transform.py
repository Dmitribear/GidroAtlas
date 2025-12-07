from __future__ import annotations

"""Helpers to align uploaded CSV columns with internal schema."""

from typing import Dict, Iterable, List, Set

import pandas as pd

from app.ai.data.schema import REQUIRED_COLUMNS

COLUMN_ALIASES: Dict[str, List[str]] = {
    "name": ["name", "object", "объект"],
    "region": ["region", "область", "region_name"],
    "resource_type": ["resource_type", "resource", "тип"],
    "water_type": ["water_type", "water", "water-kind"],
    "fauna": ["fauna", "has_fauna", "hasFauna", "fauna_present"],
    "passport_date": ["passport_date", "passportDate", "date"],
    "condition": ["condition", "technical_condition", "technicalCondition"],
    "lat": ["lat", "latitude", "coord_lat", "latitude_deg"],
    "lon": ["lon", "longitude", "coord_lon", "longitude_deg"],
}


def align_required_columns(
    df: pd.DataFrame,
    required: Iterable[str] | None = None,
    optional: Iterable[str] | None = None,
) -> pd.DataFrame:
    """Return copy of df where known aliases are remapped to canonical names."""

    frame = df.copy()
    required = list(required or REQUIRED_COLUMNS)
    optional_set: Set[str] = set(optional or [])

    for canonical in required:
        if canonical in frame.columns:
            continue
        for alias in COLUMN_ALIASES.get(canonical, []):
            if alias in frame.columns:
                frame[canonical] = frame[alias]
                break

    missing = set(required) - set(frame.columns)
    blocking = [col for col in missing if col not in optional_set]
    if blocking:
        raise ValueError(f"Отсутствуют обязательные колонки: {', '.join(sorted(missing))}")
    return frame


from __future__ import annotations

"""Feature engineering helpers."""

from dataclasses import dataclass
from datetime import datetime
from typing import Tuple

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split

FEATURE_COLUMNS = [
    "condition",
    "region",
    "resource_type",
    "water_type",
    "fauna",
    "passport_age_years",
    "lat",
    "lon",
]


@dataclass(frozen=True)
class FeatureFrame:
    """Structured container for engineered features."""

    features: pd.DataFrame
    labels: pd.Series


def normalize_dataset(df: pd.DataFrame) -> pd.DataFrame:
    """Ensure consistent dtypes for downstream pipeline."""

    frame = df.copy()
    frame["passport_date"] = pd.to_datetime(frame["passport_date"])
    frame["condition"] = frame["condition"].astype(int)
    frame["fauna"] = frame["fauna"].astype(int)
    frame["lat"] = frame["lat"].astype(float)
    frame["lon"] = frame["lon"].astype(float)
    return frame


def compute_passport_age_years(passport_dates: pd.Series, reference: datetime | None = None) -> pd.Series:
    """Convert passport_date column to age in years."""

    reference = reference or datetime.utcnow()
    ages = ((reference - passport_dates) / np.timedelta64(1, "Y")).clip(lower=0)
    return ages.astype(float)


def prepare_feature_frame(df: pd.DataFrame) -> pd.DataFrame:
    """Expose engineered frame for downstream services."""

    frame = normalize_dataset(df)
    frame["passport_age_years"] = compute_passport_age_years(frame["passport_date"])
    return frame


def _derive_label(frame: pd.DataFrame) -> pd.Series:
    """Rule-based label for logistic regression training."""

    risk_rule = (
        (frame["condition"] <= 2)
        | ((frame["passport_age_years"] > 18) & (frame["water_type"] == "солёная"))
        | ((frame["fauna"] == 1) & (frame["resource_type"] == "водохранилище") & (frame["condition"] <= 3))
    )
    return risk_rule.astype(int)


def build_feature_matrix(df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.Series, pd.DataFrame, pd.Series]:
    """Split dataframe into train/test sets with engineered features."""

    engineered = prepare_feature_frame(df)
    features = engineered[FEATURE_COLUMNS].copy()
    label = _derive_label(engineered)

    stratify = label if label.nunique() > 1 else None
    test_size = min(max(2, int(len(df) * 0.2)), len(df) - 1)
    return train_test_split(features, label, test_size=test_size, random_state=42, stratify=stratify)


def make_time_series(df: pd.DataFrame) -> pd.DataFrame:
    """Produce aggregated time-series for forecasting."""

    frame = prepare_feature_frame(df)
    frame["month_index"] = np.arange(len(frame)) % 12
    frame["year_index"] = np.arange(len(frame)) // 12
    ts = (
        frame.groupby(["year_index", "month_index"])
        .agg(
            avg_condition=("condition", "mean"),
            avg_passport_age=("passport_age_years", "mean"),
            risk_share=("condition", lambda s: (s <= 2).mean()),
        )
        .reset_index()
    )
    return ts


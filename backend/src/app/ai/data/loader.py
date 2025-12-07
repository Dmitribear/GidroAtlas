from __future__ import annotations

"""Utilities to load, validate and persist datasets."""

from pathlib import Path
from typing import Iterable

import pandas as pd

from app.ai.config import settings
from app.ai.data.generator import generate_sample_data
from app.ai.data.schema import REQUIRED_COLUMNS

DATA_FILE = settings.data_dir / "passports.csv"


def ensure_dataset() -> Path:
    """Guarantee sample data exists."""
    if not DATA_FILE.exists():
        return generate_sample_data()
    return DATA_FILE


def load_dataset(columns: Iterable[str] | None = None) -> pd.DataFrame:
    """Load dataset into a pandas DataFrame with normalized types."""
    ensure_dataset()
    df = pd.read_csv(DATA_FILE)
    validate_columns(df, REQUIRED_COLUMNS)
    df = _normalize(df)
    if columns:
        df = df[list(columns)]
    return df


def save_dataset(df: pd.DataFrame) -> None:
    """Persist the dataset and ensure parent exists."""
    DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
    ordered = df[REQUIRED_COLUMNS].copy()
    ordered.to_csv(DATA_FILE, index=False)


def validate_columns(df: pd.DataFrame, required: Iterable[str]) -> None:
    """Raise ValueError if dataset misses required columns."""
    missing = set(required) - set(df.columns)
    if missing:
        raise ValueError(f"Dataset missing columns: {', '.join(sorted(missing))}")


def _normalize(df: pd.DataFrame) -> pd.DataFrame:
    frame = df.copy()
    frame["fauna"] = frame["fauna"].map(_coerce_bool).astype(int)
    frame["condition"] = frame["condition"].astype(int)
    frame["passport_date"] = pd.to_datetime(frame["passport_date"]).dt.date
    frame["lat"] = frame["lat"].apply(_coerce_coordinate("lat"))
    frame["lon"] = frame["lon"].apply(_coerce_coordinate("lon"))
    return frame


def _coerce_bool(value) -> int:
    """Convert heterogeneous boolean representations to int."""

    if isinstance(value, bool):
        return int(value)
    if isinstance(value, (int, float)):
        if value in (0, 1):
            return int(value)
    if isinstance(value, str):
        normalized = value.strip().lower()
        truthy = {"1", "true", "yes", "y", "да", "есть"}
        falsy = {"0", "false", "no", "n", "нет", "none"}
        if normalized in truthy:
            return 1
        if normalized in falsy:
            return 0
    raise ValueError(f"Unsupported boolean literal for fauna: {value!r}")


def _coerce_coordinate(column: str):
    def _convert(value):
        if isinstance(value, (int, float)):
            return float(value)
        if isinstance(value, str):
            normalized = value.strip().replace(",", ".")
            if not normalized:
                raise ValueError(f"Empty value for {column}")
            try:
                return float(normalized)
            except ValueError as exc:  # noqa: BLE001
                raise ValueError(f"Unsupported numeric literal for {column}: {value!r}") from exc
        raise ValueError(f"Unsupported numeric literal for {column}: {value!r}")

    return _convert


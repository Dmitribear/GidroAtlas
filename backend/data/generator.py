from __future__ import annotations

"""Synthetic dataset generation for local demos and tests."""

from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional

import numpy as np
import pandas as pd

from backend.config import settings

REGIONS = ["север", "юг", "восток", "запад", "центр", "алтай", "уральский"]
RESOURCE_TYPES = ["ГЭС", "гидроузел", "водохранилище", "шлюз", "плотина"]
WATER_TYPES = ["пресная", "солёная", "нет"]


def generate_sample_data(n_objects: Optional[int] = None, seed: int = 42) -> Path:
    """Generate a synthetic passport dataset."""

    rng = np.random.default_rng(seed)
    n_objects = n_objects or int(rng.integers(60, 110))
    today = datetime.utcnow().date()
    rows = []

    for idx in range(1, n_objects + 1):
        region = str(rng.choice(REGIONS))
        resource_type = str(rng.choice(RESOURCE_TYPES))
        water_type = str(rng.choice(WATER_TYPES, p=[0.7, 0.2, 0.1]))
        fauna = bool(rng.choice([0, 1], p=[0.4, 0.6]))
        years_ago = int(rng.integers(5, 35))
        passport_date = today - timedelta(days=years_ago * 365 + int(rng.integers(0, 365)))
        condition = int(rng.integers(1, 6))
        lat = round(float(rng.uniform(45.0, 68.0)), 5)
        lon = round(float(rng.uniform(30.0, 75.0)), 5)

        rows.append(
            {
                "name": f"Object-{idx:03d}",
                "region": region,
                "resource_type": resource_type,
                "water_type": water_type,
                "fauna": int(fauna),
                "passport_date": passport_date.isoformat(),
                "condition": condition,
                "lat": lat,
                "lon": lon,
            }
        )

    df = pd.DataFrame(rows)
    path = settings.data_dir / "passports.csv"
    path.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(path, index=False)
    return path


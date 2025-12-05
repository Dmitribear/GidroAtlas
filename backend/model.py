from __future__ import annotations

from dataclasses import dataclass, field
from typing import Mapping, Tuple

import numpy as np
from numpy.typing import NDArray
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

FeatureMatrix = NDArray[np.float64]
LabelVector = NDArray[np.int64]
FeaturePayload = Mapping[str, float]

FEATURE_NAMES: Tuple[str, ...] = (
    "technical_condition",
    "passport_age_years",
    "resource_type",
    "water_type",
    "fauna",
    "region_id",
)


def _sigmoid(x: np.ndarray) -> np.ndarray:
    """Classic logistic function, kept separate for clarity/testing."""
    return 1 / (1 + np.exp(-x))


@dataclass(frozen=True)
class SyntheticDataSettings:
    """Configuration for generating synthetic training samples."""

    n_samples: int = 3000
    random_state: int = 42


@dataclass
class SyntheticHydroDataFactory:
    """Produces tabular hydro-feature tensors alongside risk labels."""

    settings: SyntheticDataSettings = field(default_factory=SyntheticDataSettings)

    def generate(self) -> Tuple[FeatureMatrix, LabelVector]:
        rng = np.random.default_rng(self.settings.random_state)
        n = self.settings.n_samples

        raw_features = {
            "technical_condition": rng.integers(1, 6, size=n),
            "passport_age_years": rng.integers(1, 80, size=n),
            "resource_type": rng.integers(0, 3, size=n),
            "water_type": rng.integers(0, 2, size=n),
            "fauna": rng.integers(0, 2, size=n),
            "region_id": rng.integers(0, 15, size=n),
        }

        feature_matrix = np.column_stack(
            [raw_features[name] for name in FEATURE_NAMES]
        ).astype(np.float64)

        base = -2.5
        tc = raw_features["technical_condition"]
        base += 1.4 * (tc >= 4)
        base += 0.8 * (tc == 5)
        base += 0.03 * raw_features["passport_age_years"]
        base += 0.15 * raw_features["resource_type"]
        base += 0.25 * (raw_features["water_type"] == 1)
        base += 0.18 * raw_features["fauna"]
        base += 0.05 * (raw_features["region_id"] % 3)
        base += rng.normal(0, 0.5, size=n)

        probabilities = _sigmoid(base)
        labels = (rng.random(n) < probabilities).astype(int)
        return feature_matrix, labels


@dataclass
class RiskModelTrainer:
    """Encapsulates the scikit-learn pipeline build for clarity."""

    factory: SyntheticHydroDataFactory = field(default_factory=SyntheticHydroDataFactory)

    def train(self) -> Pipeline:
        features, labels = self.factory.generate()
        pipeline = Pipeline(
            [
                ("scaler", StandardScaler()),
                ("clf", LogisticRegression(max_iter=2000)),
            ]
        )
        pipeline.fit(features, labels)
        return pipeline


@dataclass
class ConditionRiskModel:
    """Public-facing predictor used by FastAPI endpoints."""

    trainer: RiskModelTrainer = field(default_factory=RiskModelTrainer)
    pipeline: Pipeline = field(init=False)

    def __post_init__(self) -> None:
        self.pipeline = self.trainer.train()

    def _as_vector(self, features: FeaturePayload) -> FeatureMatrix:
        return np.array(
            [[float(features[name]) for name in FEATURE_NAMES]], dtype=np.float64
        )

    def predict_risk(self, features: FeaturePayload) -> float:
        vector = self._as_vector(features)
        proba = float(self.pipeline.predict_proba(vector)[0][1])
        return max(0.0, min(1.0, proba))


risk_model = ConditionRiskModel()


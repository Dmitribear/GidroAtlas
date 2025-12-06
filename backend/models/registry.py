from __future__ import annotations

"""Artifact registry for persisted models."""

from pathlib import Path
from typing import Any

from joblib import dump, load

from backend.config import settings
from backend.utils.logger import configure_logger


class ModelRegistry:
    """Utility to manage serialized pipelines."""

    def __init__(self) -> None:
        self.logger = configure_logger(self.__class__.__name__)
        settings.model_dir.mkdir(parents=True, exist_ok=True)
        self.classifier_dir = settings.model_dir / "classifier"
        self.classifier_dir.mkdir(exist_ok=True)
        self.latest_marker = self.classifier_dir / "latest.txt"

        self.forecaster_path = settings.model_dir / "risk_forecaster.pkl"
        self.anomaly_path = settings.model_dir / "risk_anomaly.pkl"

    # ------------------------------------------------------------------ #
    # Classifier artifacts
    # ------------------------------------------------------------------ #
    def save_classifier(self, pipeline, version: str) -> Path:
        path = self.classifier_dir / f"classifier_v{version}.pkl"
        dump(pipeline, path)
        self.latest_marker.write_text(path.name, encoding="utf-8")
        self.logger.info("Saved classifier artifact %s", path.name)
        return path

    def _latest_classifier_path(self) -> Path | None:
        if self.latest_marker.exists():
            candidate = self.classifier_dir / self.latest_marker.read_text(encoding="utf-8").strip()
            if candidate.exists():
                return candidate
        legacy = settings.model_dir / "risk_classifier.pkl"
        if legacy.exists():
            return legacy
        return None

    def load_classifier(self):
        path = self._latest_classifier_path()
        if not path:
            self.logger.warning("Classifier artifact is missing")
            return None
        return load(path)

    # ------------------------------------------------------------------ #
    # Other artifacts
    # ------------------------------------------------------------------ #
    def _load_artifact(self, path: Path) -> Any | None:
        if not path.exists():
            self.logger.warning("Artifact %s is missing", path.name)
            return None
        return load(path)

    def load_forecaster(self):
        return self._load_artifact(self.forecaster_path)

    def load_anomaly(self):
        return self._load_artifact(self.anomaly_path)


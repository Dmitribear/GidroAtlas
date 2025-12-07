from __future__ import annotations

"""Training routines for risk classifier."""

from dataclasses import dataclass
from datetime import datetime
from typing import Dict

import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.dummy import DummyClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import StratifiedKFold, cross_val_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

from app.ai.data import build_feature_matrix
from app.ai.models.evaluation import classification_metrics, summarize_cv_scores
from app.ai.models.registry import ModelRegistry
from app.ai.utils.logger import configure_logger

NUMERIC_FEATURES = ["condition", "passport_age_years", "lat", "lon"]
CAT_FEATURES = ["resource_type", "region", "water_type"]
PASSTHRU = ["fauna"]


@dataclass(frozen=True)
class TrainingResult:
    """Metadata about a completed training run."""

    version: str
    metrics: Dict[str, float]
    artifact_path: str


class ModelTrainer:
    """Train and persist models via the registry."""

    def __init__(self, registry: ModelRegistry | None = None):
        self.registry = registry or ModelRegistry()
        self.logger = configure_logger(self.__class__.__name__)

    def _build_pipeline(self, estimator=None) -> Pipeline:
        """Construct preprocessing + estimator pipeline."""

        preprocessor = ColumnTransformer(
            transformers=[
                ("num", StandardScaler(), NUMERIC_FEATURES),
                ("bin", "passthrough", PASSTHRU),
                ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), CAT_FEATURES),
            ]
        )
        clf = estimator or LogisticRegression(max_iter=1500, solver="lbfgs", class_weight="balanced")
        return Pipeline([("prep", preprocessor), ("clf", clf)])

    def train_classifier(self, df) -> TrainingResult:
        """Train the classifier, persist artifact and return metrics."""

        X_train, X_test, y_train, y_test = build_feature_matrix(df)
        if y_train.nunique() < 2 or y_test.nunique() < 2:
            self.logger.warning(
                "Insufficient classes (train=%s, test=%s). Training DummyClassifier.",
                y_train.value_counts().to_dict(),
                y_test.value_counts().to_dict(),
            )
            pipeline = self._build_pipeline(DummyClassifier(strategy="most_frequent"))
            pipeline.fit(X_train, y_train)
            version = datetime.utcnow().strftime("%Y%m%d%H%M%S")
            artifact_path = self.registry.save_classifier(pipeline, version)
            return TrainingResult(version=version, metrics={"warning": "not_enough_classes"}, artifact_path=str(artifact_path))

        pipeline = self._build_pipeline()

        min_class = int(y_train.value_counts().min())
        splits = max(2, min(5, min_class))
        self.logger.info("Using %d-fold CV (minority class size=%d)", splits, min_class)
        cv = StratifiedKFold(n_splits=splits, shuffle=True, random_state=42)
        cv_scores = cross_val_score(pipeline, X_train, y_train, cv=cv, scoring="roc_auc")
        self.logger.info("Cross-validation ROC-AUC mean=%.4f std=%.4f", cv_scores.mean(), cv_scores.std())

        pipeline.fit(X_train, y_train)
        y_pred = pipeline.predict(X_test)
        y_prob = pipeline.predict_proba(X_test)[:, 1]
        evaluation = classification_metrics(y_test, y_pred, y_prob)

        full_X = pd.concat([X_train, X_test], ignore_index=True)
        full_y = pd.concat([y_train, y_test], ignore_index=True)
        pipeline.fit(full_X, full_y)

        version = datetime.utcnow().strftime("%Y%m%d%H%M%S")
        artifact_path = self.registry.save_classifier(pipeline, version)
        metrics = evaluation.to_dict()
        cv_stats = summarize_cv_scores(cv_scores)
        metrics["cv_roc_auc_mean"] = cv_stats["mean"]
        metrics["cv_roc_auc_std"] = cv_stats["std"]

        self.logger.info("Classifier trained version=%s metrics=%s", version, metrics)
        return TrainingResult(version=version, metrics=metrics, artifact_path=str(artifact_path))

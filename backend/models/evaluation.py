from __future__ import annotations

"""Evaluation utilities for ML pipelines."""

from dataclasses import dataclass
from typing import Dict, Iterable

import numpy as np
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    f1_score,
    precision_recall_curve,
    roc_auc_score,
)


@dataclass(frozen=True)
class EvaluationResult:
    """Structured classification metrics."""

    accuracy: float
    roc_auc: float
    pr_auc: float
    f1: float
    precision_positive: float
    recall_positive: float

    def to_dict(self) -> Dict[str, float]:
        return {
            "accuracy": self.accuracy,
            "roc_auc": self.roc_auc,
            "pr_auc": self.pr_auc,
            "f1": self.f1,
            "precision_high": self.precision_positive,
            "recall_high": self.recall_positive,
        }


def classification_metrics(y_true, y_pred, y_prob) -> EvaluationResult:
    """Compute essential metrics for binary classification."""

    accuracy = accuracy_score(y_true, y_pred)
    roc_auc = roc_auc_score(y_true, y_prob)
    precision, recall, _ = precision_recall_curve(y_true, y_prob)
    pr_auc = np.trapz(recall, precision)
    report = classification_report(y_true, y_pred, output_dict=True)
    f1 = f1_score(y_true, y_pred)
    precision_positive = report["1"]["precision"]
    recall_positive = report["1"]["recall"]
    return EvaluationResult(
        accuracy=accuracy,
        roc_auc=roc_auc,
        pr_auc=pr_auc,
        f1=f1,
        precision_positive=precision_positive,
        recall_positive=recall_positive,
    )


def summarize_cv_scores(scores: Iterable[float]) -> Dict[str, float]:
    """Return mean/std statistics for cross-validation arrays."""

    arr = np.asarray(list(scores), dtype=float)
    return {"mean": float(arr.mean()), "std": float(arr.std(ddof=1)) if arr.size > 1 else 0.0}


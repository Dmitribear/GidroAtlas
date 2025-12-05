from __future__ import annotations

import numpy as np
from sklearn.linear_model import LogisticRegression


class RiskModel:
    """Реалистичная модель риска ухудшения объекта."""

    def __init__(self) -> None:
        X: list[list[float]] = []
        y: list[int] = []

        for age in range(1, 31):
            for cond in range(1, 6):
                for fauna in [0, 1]:
                    risk_score = (
                        0.18 * (6 - cond)  # состояние
                        + 0.04 * age  # возраст паспорта
                        + (0.12 if fauna == 0 else 0)  # отсутствие фауны
                    )
                    risk_score = min(1.0, max(0.0, risk_score))
                    X.append([cond, age, fauna])
                    y.append(1 if risk_score > 0.5 else 0)

        self.model = LogisticRegression()
        self.model.fit(X, y)

    def predict_prob(self, cond: int, age: float, fauna: int) -> float:
        X = np.array([[cond, age, fauna]])
        prob = self.model.predict_proba(X)[0][1]
        return float(prob)

    def predict_timeline(
        self,
        cond: int,
        age: float,
        fauna: int,
    ) -> dict[str, float]:
        return {
            "3_months": self.predict_prob(cond, age + 0.25, fauna),
            "6_months": self.predict_prob(cond, age + 0.5, fauna),
            "12_months": self.predict_prob(cond, age + 1.0, fauna),
            "24_months": self.predict_prob(cond, age + 2.0, fauna),
        }


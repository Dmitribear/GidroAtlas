from __future__ import annotations

"""Risk forecasting pipeline."""

from dataclasses import dataclass
from typing import Dict, List

import pandas as pd
from joblib import dump
from sklearn.ensemble import RandomForestRegressor

from app.ai.config import settings
from app.ai.data import make_time_series
from app.ai.utils.logger import configure_logger


@dataclass
class ForecastResult:
    horizon_months: int
    predictions: Dict[str, float | Dict[str, float]]  # Может быть просто float или dict с value/lower/upper


class RiskForecaster:
    """Simple tree-based regressor that projects average risk."""

    def __init__(self, model=None):
        self.logger = configure_logger(self.__class__.__name__)
        self.model = model or RandomForestRegressor(n_estimators=200, random_state=42)
        self.fitted = False

    def fit(self, df) -> None:
        ts = make_time_series(df)
        if ts.empty or len(ts) < 2:
            self.logger.warning("Недостаточно данных для обучения модели прогноза (требуется минимум 2 записи)")
            self.fitted = False
            return
        features = ts[["year_index", "month_index", "avg_condition", "avg_passport_age"]]
        target = ts["risk_share"]
        if target.nunique() < 2:
            self.logger.warning("Целевая переменная не имеет вариативности, модель может давать одинаковые прогнозы")
        self.model.fit(features, target)
        dump(self.model, settings.model_dir / "risk_forecaster.pkl")
        self.fitted = True
        self.logger.info(f"Модель прогноза обучена на {len(ts)} записях")

    def forecast(self, df, horizon: int = 6) -> ForecastResult:
        if not self.fitted:
            self.fit(df)
            if not self.fitted:
                # Если модель не обучена, возвращаем пустой результат
                return ForecastResult(horizon_months=horizon, predictions={})
        
        ts = make_time_series(df)
        if ts.empty:
            self.logger.warning("Временной ряд пуст, невозможно сделать прогноз")
            return ForecastResult(horizon_months=horizon, predictions={})
        
        last_row = ts.iloc[-1]
        predictions: List[float] = []
        prediction_intervals: List[tuple[float, float]] = []
        
        year = int(last_row["year_index"])
        month = int(last_row["month_index"])
        avg_condition = float(last_row["avg_condition"])
        avg_age = float(last_row["avg_passport_age"])
        current_risk = float(last_row.get("risk_share", 0.0))
        
        # Вычисляем тренд для более реалистичного прогноза
        if len(ts) > 1:
            condition_trend = (ts["avg_condition"].iloc[-1] - ts["avg_condition"].iloc[0]) / max(1, len(ts) - 1)
            age_trend = (ts["avg_passport_age"].iloc[-1] - ts["avg_passport_age"].iloc[0]) / max(1, len(ts) - 1)
            risk_trend = (ts["risk_share"].iloc[-1] - ts["risk_share"].iloc[0]) / max(1, len(ts) - 1)
        else:
            condition_trend = 0.0
            age_trend = 0.01  # Небольшое увеличение возраста по умолчанию
            risk_trend = 0.0

        for step in range(1, horizon + 1):
            month = (month + 1) % 12
            if month == 0:
                year += 1
            
            # Применяем тренд к признакам
            projected_condition = max(1.0, min(5.0, avg_condition + condition_trend * step * 0.1))
            projected_age = max(0.0, avg_age + age_trend * step)
            
            # Keep feature names consistent with training to avoid sklearn warnings.
            features = pd.DataFrame(
                [[year, month, projected_condition, projected_age]],
                columns=["year_index", "month_index", "avg_condition", "avg_passport_age"],
            )
            
            # Получаем предсказания от всех деревьев для вычисления интервалов
            try:
                tree_predictions = [tree.predict(features)[0] for tree in self.model.estimators_]
                pred = float(self.model.predict(features)[0])
            except Exception as e:
                self.logger.error(f"Ошибка при предсказании: {e}")
                # Fallback: используем текущий риск с небольшим трендом
                pred = current_risk + risk_trend * step * 0.1
                tree_predictions = []
            
            pred_clipped = max(0.0, min(1.0, pred))
            
            # Если все прогнозы одинаковые, добавляем небольшую вариативность на основе тренда
            if step > 1 and abs(pred_clipped - predictions[-1]) < 0.001:
                # Добавляем небольшую вариативность на основе тренда риска
                variation = risk_trend * step * 0.05
                pred_clipped = max(0.0, min(1.0, pred_clipped + variation))
            
            predictions.append(pred_clipped)
            
            # Вычисляем доверительный интервал на основе разброса предсказаний деревьев
            if len(tree_predictions) > 0:
                tree_preds_clipped = [max(0.0, min(1.0, p)) for p in tree_predictions]
                std_dev = pd.Series(tree_preds_clipped).std()
                # 95% доверительный интервал (примерно 1.96 * std, но используем более консервативный подход)
                margin = max(0.02, min(0.15, std_dev * 2.0))  # Минимум 0.02, максимум 0.15
                lower = max(0.0, pred_clipped - margin)
                upper = min(1.0, pred_clipped + margin)
            else:
                # Fallback: используем процент от значения или фиксированный интервал
                if pred_clipped > 0:
                    margin = max(0.05, pred_clipped * 0.3)
                else:
                    margin = 0.07  # Для нулевых значений используем фиксированный интервал
                lower = max(0.0, pred_clipped - margin)
                upper = min(1.0, pred_clipped + margin)
            
            prediction_intervals.append((lower, upper))

        # Формируем результат с интервалами
        result: Dict[str, Dict[str, float]] = {}
        for step, (value, (lower, upper)) in enumerate(zip(predictions, prediction_intervals)):
            key = f"{(step+1)*3}_months"
            result[key] = {
                "value": round(value, 3),
                "lower": round(lower, 3),
                "upper": round(upper, 3),
            }
        
        return ForecastResult(horizon_months=horizon, predictions=result)


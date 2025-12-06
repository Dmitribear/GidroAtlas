from __future__ import annotations

"""Simple rule-based recommendation engine."""

from typing import Dict


def generate_recommendations(summary: Dict[str, float], forecast: Dict[str, float]) -> str:
    """Produce actionable recommendations based on summary and forecast."""

    avg_risk = summary.get("avg_risk", 0.0)
    critical = summary.get("critical_objects", 0)
    avg_condition = summary.get("avg_condition", 3.0)
    fauna_count = summary.get("fauna_count", 0)

    recs = []

    if avg_risk > 0.6:
        recs.append("Назначьте расширенный мониторинг всех объектов с риском > 0.6.")
    elif avg_risk > 0.4:
        recs.append("Усилите ежемесячный контроль уровня воды на среднерисковых объектах.")
    else:
        recs.append("Текущий уровень риска низкий — поддерживайте плановые проверки.")

    if critical:
        recs.append(f"Выделите аварийные бригады для {critical} критических объектов.")

    if avg_condition < 3:
        recs.append("Проведите аудит объектов со средним состоянием ниже 3 баллов.")

    if fauna_count:
        recs.append(f"Учтите влияние фауны: требуется мониторинг биоразнообразия на {fauna_count} объектах.")

    top_forecast = sorted(forecast.items(), key=lambda item: item[1], reverse=True)[:2]
    for horizon, value in top_forecast:
        if value > 0.7:
            recs.append(f"Подготовьте резерв водосброса на горизонте {horizon} (прогноз {value:.2f}).")

    return "\n".join(recs)


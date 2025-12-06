from __future__ import annotations

"""Scenario simulation helpers."""

from typing import Dict


def simulate_scenario(payload: Dict[str, float]) -> str:
    """Generate deterministic scenario description."""

    name = payload.get("name", "объект")
    risk = float(payload.get("risk", 0.5))
    resource_type = payload.get("resource_type", "гидрообъект")
    condition = int(payload.get("condition", 3))
    water_type = payload.get("water_type", "пресная")

    trend = "стабильным" if risk < 0.4 else "растущим" if risk < 0.7 else "критически растущим"
    maintenance = "провести косметический ремонт" if condition >= 4 else "усилить мониторинг"
    water_hint = (
        "контролируйте солёность и биоту" if water_type == "солёная" else "следите за уровнем подпитки водоёма"
    )

    return (
        f"Сценарий для {name} ({resource_type}): риск {risk:.2f}, тренд {trend}. "
        f"Состояние {condition}/5 — рекомендуется {maintenance}. Дополнительно: {water_hint} "
        "и подготовить инспекцию на горизонте 1–3 месяцев."
    )


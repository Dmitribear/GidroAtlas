from __future__ import annotations

"""Explain anomalies via rule-based heuristics."""

from typing import List


def explain_anomalies(anomalies: List[dict]) -> str:
    """Return natural-language summary for detected anomalies."""

    if not anomalies:
        return "Аномальные объекты не найдены — все показатели в допустимых пределах."

    lines = []
    for item in anomalies:
        score = item.get("score", 0.0)
        region = item.get("region", "неизвестный регион")
        name = item.get("name", "объект")
        resource_type = item.get("resource_type", "гидрообъект")
        severity = (
            "критическое отклонение" if score > 1.2 else "существенное отклонение" if score > 0.8 else "легкое отклонение"
        )
        hints = []
        if score > 1.0:
            hints.append("проверьте дренаж и сброс воды")
        if score > 0.8:
            hints.append("пересмотрите график инспекций")
        if not hints:
            hints.append("проверьте журналы обслуживания")
        lines.append(f"- {name} ({resource_type}, {region}): {severity}, {', '.join(hints)}.")

    return "\n".join(lines)


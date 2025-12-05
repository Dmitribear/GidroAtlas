from __future__ import annotations

from typing import Dict

from pydantic import BaseModel


class PriorityResult(BaseModel):
    name: str | None
    technical_condition: int
    passport_age_years: int
    priority_score: int
    priority_level: str
    risk_probability: float
    timeline: Dict[str, float]
    resource_type: str | None = None


class Metrics(BaseModel):
    total_objects: int
    avg_condition: float
    critical_objects: int
    without_passport: int
    avg_passport_age: float


class AnalyzeResponse(BaseModel):
    metrics: Metrics
    results: list[PriorityResult]


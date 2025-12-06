from __future__ import annotations

from typing import Dict

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from backend.api.dependencies import get_insight_service
from backend.services.insights import InsightService

router = APIRouter()


@router.get("/explain")
def explain(service: InsightService = Depends(get_insight_service)) -> Dict[str, str]:
    return {"explanation": service.anomaly_report()}


@router.get("/recommend")
def recommend(service: InsightService = Depends(get_insight_service)) -> Dict[str, str]:
    return {"recommendations": service.recommendations()}


class SimulationPayload(BaseModel):
    name: str
    risk: float = Field(..., ge=0.0, le=1.0)
    resource_type: str
    water_type: str
    condition: int = Field(..., ge=1, le=5)


@router.post("/simulate")
def simulate(payload: SimulationPayload, service: InsightService = Depends(get_insight_service)) -> Dict[str, str]:
    return {"simulation": service.simulate(payload.model_dump())}


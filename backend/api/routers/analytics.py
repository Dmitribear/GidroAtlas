from __future__ import annotations

from typing import Any, Dict, List

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from backend.api.dependencies import get_analytics_service
from backend.services.analytics import AnalyticsService

router = APIRouter()


class CoordinatesPayload(BaseModel):
    lat: float = Field(..., ge=-90.0, le=90.0)
    lon: float = Field(..., ge=-180.0, le=180.0)


class PredictPayload(BaseModel):
    name: str
    region: str
    resource_type: str
    water_type: str
    fauna: bool
    passport_date: str
    condition: int = Field(..., ge=1, le=5)
    coordinates: CoordinatesPayload


@router.post("/predict")
def predict(payload: PredictPayload, service: AnalyticsService = Depends(get_analytics_service)) -> Dict[str, Any]:
    return service.predict(payload.model_dump())


@router.get("/summary")
def summary(service: AnalyticsService = Depends(get_analytics_service)) -> Dict[str, Any]:
    return service.summary()


@router.get("/clusters")
def clusters(service: AnalyticsService = Depends(get_analytics_service)) -> List[Dict[str, Any]]:
    return service.clusters()


@router.get("/objects")
def objects(service: AnalyticsService = Depends(get_analytics_service)) -> List[Dict[str, Any]]:
    return service.objects()


@router.get("/forecast")
def forecast(service: AnalyticsService = Depends(get_analytics_service)) -> Dict[str, Any]:
    return service.forecast()


@router.get("/anomalies")
def anomalies(service: AnalyticsService = Depends(get_analytics_service)) -> List[Dict[str, Any]]:
    return service.anomalies()


@router.get("/anomalies/stats")
def anomaly_metrics(service: AnalyticsService = Depends(get_analytics_service)) -> Dict[str, float]:
    return service.anomaly_metrics()


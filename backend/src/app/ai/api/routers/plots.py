from __future__ import annotations

from fastapi import APIRouter, Depends
from fastapi.responses import FileResponse

from app.ai.api.dependencies import get_analytics_service
from app.ai.dashboards.plots import cluster_map_plot, risk_distribution_plot
from app.ai.services.analytics import AnalyticsService

router = APIRouter()


@router.get("/risk_distribution", response_class=FileResponse)
def risk_distribution(service: AnalyticsService = Depends(get_analytics_service)) -> FileResponse:
    df = service.dataset_with_predictions
    path = risk_distribution_plot(df)
    return FileResponse(path, media_type="image/png", filename=path.name)


@router.get("/cluster_map", response_class=FileResponse)
def cluster_map(service: AnalyticsService = Depends(get_analytics_service)) -> FileResponse:
    df = service.dataset_with_predictions
    path = cluster_map_plot(df)
    return FileResponse(path, media_type="image/png", filename=path.name)


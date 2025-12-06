from __future__ import annotations

from fastapi import APIRouter, Depends, UploadFile

from app.ai.api.dependencies import get_analytics_service
from app.ai.services.analytics import AnalyticsService

router = APIRouter()


@router.post("/upload")
async def upload_dataset(
    file: UploadFile,
    service: AnalyticsService = Depends(get_analytics_service),
) -> dict:
    return await service.upload_csv(file)


from __future__ import annotations

from fastapi import APIRouter, File, HTTPException, Query, UploadFile

from backend.ml_model import RiskModel
from backend.schemas import AnalyzeResponse
from backend.services import CSVProcessingError, analyze_payload


def create_analyze_router(risk_model: RiskModel) -> APIRouter:
    router = APIRouter()

    @router.post("/analyze_csv", response_model=AnalyzeResponse)
    async def analyze_csv(
        sort_by: str = Query("priority"),
        file: UploadFile = File(...),
    ) -> AnalyzeResponse:
        try:
            payload = await file.read()
            return analyze_payload(payload, risk_model=risk_model, sort_by=sort_by)
        except CSVProcessingError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc

    @router.post("/analyze", response_model=AnalyzeResponse)
    async def analyze_legacy(
        file: UploadFile = File(...),
        sort_by: str = Query("priority"),
    ) -> AnalyzeResponse:
        try:
            payload = await file.read()
            return analyze_payload(payload, risk_model=risk_model, sort_by=sort_by)
        except CSVProcessingError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc

    return router


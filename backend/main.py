from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api import router as api_router
from backend.services import AnalyticsService, InsightService

app = FastAPI(title="GidroAtlas AI Platform", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event() -> None:
    analytics_service = AnalyticsService()
    app.state.analytics_service = analytics_service  # type: ignore[attr-defined]
    app.state.insight_service = InsightService(analytics_service)  # type: ignore[attr-defined]


app.include_router(api_router)


@app.get("/")
def root() -> dict:
    return {"message": "GidroAtlas analytics backend is up."}


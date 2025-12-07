from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.interfaces.api.v1.auth import router as auth_router
from app.interfaces.api.v1.water_objects import router as water_objects_router
from app.interfaces.maps import router as maps_router
from app.ai.api import router as ai_router
from app.ai.services import AnalyticsService, InsightService


def create_app() -> FastAPI:
  app = FastAPI(title="GidroAtlas API", version="0.1.0")

  app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
  )

  app.include_router(auth_router, prefix="/api/v1")
  app.include_router(water_objects_router, prefix="/api/v1")
  app.include_router(ai_router, prefix="/api/v1")
  app.include_router(maps_router)

  analytics_service = AnalyticsService()
  app.state.analytics_service = analytics_service  # type: ignore[attr-defined]
  app.state.insight_service = InsightService(analytics_service)  # type: ignore[attr-defined]
  return app


app = create_app()

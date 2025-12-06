"""FastAPI routers grouped by domains."""

from fastapi import APIRouter

from backend.api.routers import analytics, analysis, datasets, plots

router = APIRouter()
router.include_router(analytics.router, prefix="/ai", tags=["ai"])
router.include_router(plots.router, prefix="/plots", tags=["plots"])
router.include_router(datasets.router, prefix="/datasets", tags=["datasets"])
router.include_router(analysis.router, prefix="/analysis", tags=["analysis"])


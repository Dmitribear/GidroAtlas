from __future__ import annotations

"""FastAPI dependency helpers."""

from fastapi import Request


def get_analytics_service(request: Request):
    return request.app.state.analytics_service  # type: ignore[attr-defined]


def get_insight_service(request: Request):
    return request.app.state.insight_service  # type: ignore[attr-defined]


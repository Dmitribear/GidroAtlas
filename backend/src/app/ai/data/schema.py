from __future__ import annotations

"""Typed schemas describing dataset rows."""

from datetime import date
from pydantic import BaseModel, Field


class Coordinates(BaseModel):
    """Geographic coordinates."""

    lat: float = Field(ge=-90.0, le=90.0)
    lon: float = Field(ge=-180.0, le=180.0)


class ObjectPassport(BaseModel):
    """Normalized hydrotechnical object passport."""

    name: str
    region: str
    resource_type: str
    water_type: str
    fauna: bool
    passport_date: date
    condition: int = Field(ge=1, le=5)
    coordinates: Coordinates


REQUIRED_COLUMNS = [
    "name",
    "region",
    "resource_type",
    "water_type",
    "fauna",
    "passport_date",
    "condition",
    "lat",
    "lon",
]


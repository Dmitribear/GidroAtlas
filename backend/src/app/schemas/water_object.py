from datetime import date
from typing import Literal

from pydantic import BaseModel, Field, HttpUrl

ResourceType = Literal["lake", "canal", "reservoir"]
WaterType = Literal["fresh", "non_fresh"]
SortDirection = Literal["asc", "desc"]


class WaterObjectCreate(BaseModel):
  name: str = Field(min_length=2, max_length=255)
  region: str = Field(min_length=2, max_length=255)
  resource_type: ResourceType
  water_type: WaterType
  fauna: bool
  passport_date: date
  technical_condition: int = Field(ge=1, le=5)
  latitude: float
  longitude: float
  pdf_url: str | HttpUrl | None = None
  priority: int | None = None


PriorityCategory = Literal["low", "medium", "high"]


class WaterObjectResponse(WaterObjectCreate):
  id: str
  priority_category: PriorityCategory | None = None
  priority_score: int | None = None
  marker_color: str | None = None


class WaterObjectQuery(BaseModel):
  region: str | None = None
  resource_type: ResourceType | None = None
  water_type: WaterType | None = None
  fauna: bool | None = None
  technical_condition: int | None = Field(default=None, ge=1, le=5)
  condition_min: int | None = Field(default=None, ge=1, le=5)
  priority: int | None = None
  passport_date_from: date | None = None
  passport_date_to: date | None = None
  sort_by: Literal[
    "name", "region", "priority", "technical_condition", "passport_date", "resource_type", "water_type"
  ] = "priority"
  sort_dir: SortDirection = "desc"
  limit: int = Field(default=50, ge=1, le=200)
  offset: int = Field(default=0, ge=0)

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
  pdf_url: HttpUrl | None = None
  priority: int | None = None


class WaterObjectResponse(WaterObjectCreate):
  id: str


class WaterObjectQuery(BaseModel):
  region: str | None = None
  resource_type: ResourceType | None = None
  water_type: WaterType | None = None
  fauna: bool | None = None
  sort_by: Literal[
    "name", "region", "priority", "technical_condition", "passport_date", "resource_type", "water_type"
  ] = "priority"
  sort_dir: SortDirection = "desc"
  limit: int = Field(default=50, ge=1, le=200)
  offset: int = Field(default=0, ge=0)

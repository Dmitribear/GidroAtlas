from datetime import date
from dataclasses import asdict

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.application.water_objects.use_cases import ListWaterObjects
from app.core.deps import get_water_object_repository, get_computed_metrics_repository
from app.infrastructure.supabase.computed_metrics import ComputedMetricsRepositorySupabase
from app.infrastructure.supabase.water_objects import WaterObjectRepositorySupabase
from app.models.condition_model import marker_color_for_condition, VALUE_TO_PRIORITY_CATEGORY
from app.schemas.water_object import WaterObjectQuery


class MapCoordinates(BaseModel):
  lat: float
  lng: float


class MapPosition(BaseModel):
  x: float
  y: float


class MapObject(BaseModel):
  id: str
  name: str
  region: str
  resourceType: str
  waterType: str
  hasFauna: bool
  passportDate: date
  condition: int
  priority: str
  priorityCategory: str | None = None
  priorityScore: int | None = None
  markerColor: str | None = None
  coordinates: MapCoordinates
  position: MapPosition
  image: str
  pdfUrl: str | None = None


router = APIRouter()


@router.get("/maps", response_model=list[MapObject])
async def list_map_objects(
  repo: WaterObjectRepositorySupabase = Depends(get_water_object_repository),
  metrics_repo: ComputedMetricsRepositorySupabase = Depends(get_computed_metrics_repository),
) -> list[MapObject]:
  objects = await ListWaterObjects(repo)(WaterObjectQuery(limit=200))
  metrics_map = await metrics_repo.get_by_object_ids([obj.id for obj in objects])
  result: list[MapObject] = []
  for obj in objects:
    data = asdict(obj)
    metric = metrics_map.get(obj.id)
    condition = int(metric["technical_condition"]) if metric and metric.get("technical_condition") else data["technical_condition"]
    priority_category = metric.get("priority_category") if metric else VALUE_TO_PRIORITY_CATEGORY.get(data.get("priority"))
    priority_score = int(metric["priority_score"]) if metric and metric.get("priority_score") is not None else None
    marker_color = metric.get("marker_color") if metric and metric.get("marker_color") else marker_color_for_condition(condition)
    priority_label = priority_category or VALUE_TO_PRIORITY_CATEGORY.get(data.get("priority"), "low")
    result.append(
      MapObject(
        id=data["id"],
        name=data["name"],
        region=data["region"],
        resourceType=data["resource_type"],
        waterType="fresh" if data["water_type"] == "fresh" else "saline",
        hasFauna=data["fauna"],
        passportDate=data["passport_date"],
        condition=condition,
        priority=priority_label or "low",
        priorityCategory=priority_label,
        priorityScore=priority_score,
        markerColor=marker_color,
        coordinates=MapCoordinates(lat=data["latitude"], lng=data["longitude"]),
        position=MapPosition(x=0, y=0),
        image="/placeholder.svg",
        pdfUrl=data.get("pdf_url"),
      )
    )
  return result

from dataclasses import asdict

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.application.water_objects.use_cases import CreateWaterObject, GetWaterObject, ListWaterObjects
from app.core.deps import get_water_object_repository
from app.infrastructure.supabase.water_objects import WaterObjectRepositorySupabase
from app.schemas.water_object import WaterObjectCreate, WaterObjectQuery, WaterObjectResponse

router = APIRouter(prefix="/water-objects", tags=["water_objects"])


@router.get("", response_model=list[WaterObjectResponse])
async def list_water_objects(
  repo: WaterObjectRepositorySupabase = Depends(get_water_object_repository),
  region: str | None = Query(None),
  resource_type: str | None = Query(None),
  water_type: str | None = Query(None),
  fauna: bool | None = Query(None),
  sort_by: str = Query("priority"),
  sort_dir: str = Query("desc"),
  limit: int = Query(50, ge=1, le=200),
  offset: int = Query(0, ge=0),
):
  query = WaterObjectQuery(
    region=region,
    resource_type=resource_type,  # type: ignore[arg-type]
    water_type=water_type,  # type: ignore[arg-type]
    fauna=fauna,
    sort_by=sort_by,  # type: ignore[arg-type]
    sort_dir=sort_dir,  # type: ignore[arg-type]
    limit=limit,
    offset=offset,
  )
  objects = await ListWaterObjects(repo)(query)
  return [WaterObjectResponse.model_validate(asdict(obj)) for obj in objects]


@router.post("", response_model=WaterObjectResponse, status_code=status.HTTP_201_CREATED)
async def create_water_object(
  payload: WaterObjectCreate, repo: WaterObjectRepositorySupabase = Depends(get_water_object_repository)
):
  obj = await CreateWaterObject(repo)(payload)
  return WaterObjectResponse.model_validate(asdict(obj))


@router.get("/{object_id}", response_model=WaterObjectResponse)
async def get_water_object(
  object_id: str, repo: WaterObjectRepositorySupabase = Depends(get_water_object_repository)
):
  obj = await GetWaterObject(repo)(object_id)
  if obj is None:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Water object not found")
  return WaterObjectResponse.model_validate(asdict(obj))


@router.get("/{object_id}/priority")
async def get_water_object_priority(
  object_id: str, repo: WaterObjectRepositorySupabase = Depends(get_water_object_repository)
):
  obj = await GetWaterObject(repo)(object_id)
  if obj is None:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Water object not found")
  return {"id": obj.id, "priority": obj.priority}

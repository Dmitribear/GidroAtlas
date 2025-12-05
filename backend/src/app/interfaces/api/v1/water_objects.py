from dataclasses import asdict

from fastapi import APIRouter, Depends

from app.application.water_objects.use_cases import CreateWaterObject, ListWaterObjects
from app.core.deps import get_water_object_repository
from app.infrastructure.supabase.water_objects import WaterObjectRepositorySupabase
from app.schemas.water_object import WaterObjectCreate, WaterObjectResponse

router = APIRouter(prefix="/water-objects", tags=["water_objects"])


@router.get("", response_model=list[WaterObjectResponse])
async def list_water_objects(repo: WaterObjectRepositorySupabase = Depends(get_water_object_repository)):
  objects = await ListWaterObjects(repo)()
  return [WaterObjectResponse.model_validate(asdict(obj)) for obj in objects]


@router.post("", response_model=WaterObjectResponse, status_code=201)
async def create_water_object(
  payload: WaterObjectCreate, repo: WaterObjectRepositorySupabase = Depends(get_water_object_repository)
):
  obj = await CreateWaterObject(repo)(payload)
  return WaterObjectResponse.model_validate(asdict(obj))

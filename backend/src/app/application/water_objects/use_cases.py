from app.domain.water_object import WaterObject
from app.infrastructure.supabase.water_objects import WaterObjectRepositorySupabase
from app.schemas.water_object import WaterObjectCreate


class CreateWaterObject:
  def __init__(self, repo: WaterObjectRepositorySupabase):
    self._repo = repo

  async def __call__(self, payload: WaterObjectCreate) -> WaterObject:
    return await self._repo.create(payload)


class ListWaterObjects:
  def __init__(self, repo: WaterObjectRepositorySupabase):
    self._repo = repo

  async def __call__(self) -> list[WaterObject]:
    return await self._repo.list_all()

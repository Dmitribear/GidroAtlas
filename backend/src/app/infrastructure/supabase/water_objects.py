from typing import Any
from uuid import uuid4

from app.domain.water_object import WaterObject
from app.infrastructure.supabase.client import SupabaseClient
from app.schemas.water_object import WaterObjectCreate


class WaterObjectRepositorySupabase:
  def __init__(self, client: SupabaseClient):
    self._client = client
    self._table = "water_objects"

  async def create(self, payload: WaterObjectCreate) -> WaterObject:
    record = await self._client.insert(
      self._table,
      {
        "id": str(uuid4()),
        "name": payload.name,
        "region": payload.region,
        "resource_type": payload.resource_type,
        "water_type": payload.water_type,
        "fauna": payload.fauna,
        "passport_date": payload.passport_date.isoformat(),
        "technical_condition": payload.technical_condition,
        "latitude": payload.latitude,
        "longitude": payload.longitude,
        "pdf_url": str(payload.pdf_url) if payload.pdf_url else None,
        "priority": payload.priority,
      },
    )
    return self._to_entity(record)

  async def list_all(self) -> list[WaterObject]:
    rows = await self._client.select_many(self._table)
    return [self._to_entity(row) for row in rows]

  def _to_entity(self, row: dict[str, Any]) -> WaterObject:
    return WaterObject(
      id=str(row["id"]),
      name=row["name"],
      region=row["region"],
      resource_type=row["resource_type"],
      water_type=row["water_type"],
      fauna=bool(row["fauna"]),
      passport_date=self._parse_date(row["passport_date"]),
      technical_condition=int(row["technical_condition"]),
      latitude=float(row["latitude"]),
      longitude=float(row["longitude"]),
      pdf_url=row.get("pdf_url"),
      priority=row.get("priority"),
    )

  def _parse_date(self, value: Any):
    if isinstance(value, str):
      from datetime import date

      return date.fromisoformat(value)
    return value

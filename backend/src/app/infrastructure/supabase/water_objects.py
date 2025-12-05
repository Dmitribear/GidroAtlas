import asyncio
from typing import Any
from uuid import uuid4

from app.domain.water_object import WaterObject
from app.infrastructure.supabase.client import SupabaseClient
from app.schemas.water_object import WaterObjectCreate, WaterObjectQuery


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

  async def list_filtered(self, query: WaterObjectQuery) -> list[WaterObject]:
    qb = self._client.raw.table(self._table).select("*")

    if query.region:
      qb = qb.ilike("region", f"%{query.region}%")
    if query.resource_type:
      qb = qb.eq("resource_type", query.resource_type)
    if query.water_type:
      qb = qb.eq("water_type", query.water_type)
    if query.fauna is not None:
      qb = qb.eq("fauna", query.fauna)
    if query.technical_condition is not None:
      qb = qb.eq("technical_condition", query.technical_condition)
    if query.condition_min is not None:
      qb = qb.gte("technical_condition", query.condition_min)
    if query.priority is not None:
      qb = qb.eq("priority", query.priority)
    if query.passport_date_from:
      qb = qb.gte("passport_date", query.passport_date_from.isoformat())
    if query.passport_date_to:
      qb = qb.lte("passport_date", query.passport_date_to.isoformat())

    qb = qb.order(query.sort_by, desc=query.sort_dir == "desc")
    end = query.offset + query.limit - 1
    qb = qb.range(query.offset, end)

    rows = await asyncio.to_thread(qb.execute)
    return [self._to_entity(row) for row in rows.data or []]

  async def get_by_id(self, object_id: str) -> WaterObject | None:
    record = await self._client.select_one(self._table, "id", object_id)
    if record is None:
      return None
    return self._to_entity(record)

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

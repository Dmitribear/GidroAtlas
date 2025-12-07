import asyncio
import re
from difflib import SequenceMatcher
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

  async def get_by_name(self, name: str) -> WaterObject | None:
    qb = self._client.raw.table(self._table).select("*").ilike("name", name).limit(1)
    rows = await asyncio.to_thread(qb.execute)
    data = rows.data[0] if rows.data else None
    if data:
      return self._to_entity(data)
    # fallback: try exact match to account for case-sensitive names
    qb = self._client.raw.table(self._table).select("*").eq("name", name).limit(1)
    rows = await asyncio.to_thread(qb.execute)
    data = rows.data[0] if rows.data else None
    if data:
      return self._to_entity(data)
    return None

  async def find_by_similar_name(self, name: str, *, min_ratio: float = 0.6) -> WaterObject | None:
    """Find the closest matching object name using fuzzy comparison."""
    target = self._normalize_name(name)

    # First try straightforward ilike/eq matches
    direct = await self.get_by_name(name)
    if direct:
      return direct

    qb = self._client.raw.table(self._table).select("*")
    rows = await asyncio.to_thread(qb.execute)
    best: tuple[float, dict[str, Any]] | None = None
    for row in rows.data or []:
      candidate = self._normalize_name(row["name"])
      if candidate == target:
        return self._to_entity(row)
      ratio = SequenceMatcher(None, target, candidate).ratio()
      if target in candidate or candidate in target:
        ratio = max(ratio, 0.95)  # strong preference for substring matches
      if ratio >= min_ratio and (best is None or ratio > best[0]):
        best = (ratio, row)

    if best:
      return self._to_entity(best[1])
    return None

  async def update_pdf_url(self, object_id: str, pdf_url: str) -> None:
    qb = self._client.raw.table(self._table).update({"pdf_url": pdf_url}).eq("id", object_id)
    await asyncio.to_thread(qb.execute)

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

  def _normalize_name(self, name: str) -> str:
    cleaned = name.replace("_", " ").replace("-", " ")
    cleaned = re.sub(r"\s+", " ", cleaned)
    return cleaned.strip().lower()

import asyncio
from typing import Any

from app.infrastructure.supabase.client import SupabaseClient


class ComputedMetricsRepositorySupabase:
  def __init__(self, client: SupabaseClient):
    self._client = client
    self._table = "computed_metrics"

  async def upsert_metric(self, payload: dict[str, Any]) -> dict[str, Any]:
    query = self._client.raw.table(self._table).upsert(payload, on_conflict="object_id")
    response = await asyncio.to_thread(query.execute)
    return response.data[0] if response.data else payload

  async def get_by_object_ids(self, object_ids: list[str]) -> dict[str, dict[str, Any]]:
    if not object_ids:
      return {}
    query = self._client.raw.table(self._table).select("*").in_("object_id", object_ids)
    response = await asyncio.to_thread(query.execute)
    rows = response.data or []
    return {row["object_id"]: row for row in rows}


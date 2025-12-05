import asyncio
from functools import cached_property
from typing import Any

from supabase import Client, create_client


class SupabaseClient:
  def __init__(self, url: str, key: str):
    self._url = url
    self._key = key

  @cached_property
  def raw(self) -> Client:
    return create_client(self._url, self._key)

  async def insert(self, table: str, data: dict[str, Any]) -> dict[str, Any]:
    response = await asyncio.to_thread(self.raw.table(table).insert(data).execute)
    return response.data[0] if response.data else {}

  async def select_one(self, table: str, column: str, value: Any) -> dict[str, Any] | None:
    response = await asyncio.to_thread(self.raw.table(table).select("*").eq(column, value).limit(1).execute)
    if not response.data:
      return None
    return response.data[0]

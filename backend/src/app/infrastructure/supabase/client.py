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

  async def select_many(self, table: str) -> list[dict[str, Any]]:
    response = await asyncio.to_thread(self.raw.table(table).select("*").execute)
    return response.data or []

  async def upload_to_bucket(
    self,
    bucket: str,
    path: str,
    data: bytes,
    *,
    content_type: str = "application/octet-stream",
    upsert: bool = True,
  ) -> None:
    storage = self.raw.storage.from_(bucket)
    await asyncio.to_thread(storage.upload, path, data, {"contentType": content_type, "upsert": upsert})

  def get_public_url(self, bucket: str, path: str) -> str:
    storage = self.raw.storage.from_(bucket)
    return storage.get_public_url(path)

import asyncio
from functools import cached_property
from typing import Any

from storage3.utils import StorageException
from supabase import Client, create_client


class SupabaseClient:
  def __init__(self, url: str, key: str):
    self._url = url
    self._key = key
    self._ensured_buckets: set[str] = set()

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

  async def _ensure_bucket(self, bucket: str) -> None:
    if bucket in self._ensured_buckets:
      return

    storage = self.raw.storage

    def _create_if_missing() -> None:
      buckets = storage.list_buckets()
      exists = any(getattr(b, "name", None) == bucket or (isinstance(b, dict) and b.get("name") == bucket) for b in buckets)
      if exists:
        return
      try:
        storage.create_bucket(bucket, options={"public": True})
      except StorageException as exc:
        # Ignore race if another worker created the bucket.
        if "already exists" in str(exc).lower():
          return
        # Anon keys cannot create buckets; surface a clearer hint.
        if "unauthorized" in str(exc).lower() or "row-level security" in str(exc).lower():
          raise RuntimeError(
            "Supabase key cannot create buckets. Use the service role key or pre-create the bucket."
          ) from exc
        raise

    await asyncio.to_thread(_create_if_missing)
    self._ensured_buckets.add(bucket)

  async def upload_to_bucket(
    self,
    bucket: str,
    path: str,
    data: bytes,
    *,
    content_type: str = "application/octet-stream",
    upsert: bool = True,
  ) -> None:
    await self._ensure_bucket(bucket)
    storage = self.raw.storage.from_(bucket)
    # Supabase may retain old content-type on upsert; remove first to refresh metadata.
    if upsert:
      try:
        await asyncio.to_thread(storage.remove, [path])
      except Exception:
        # best-effort cleanup; keep going
        pass
    file_options = {"contentType": content_type, "upsert": upsert}
    await asyncio.to_thread(storage.upload, path, data, file_options)

  def get_public_url(self, bucket: str, path: str) -> str:
    storage = self.raw.storage.from_(bucket)
    return storage.get_public_url(path)

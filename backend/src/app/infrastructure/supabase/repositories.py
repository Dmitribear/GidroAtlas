from typing import Any
from uuid import uuid4

from app.domain.user import User
from app.infrastructure.supabase.client import SupabaseClient


class UserRepositorySupabase:
  def __init__(self, client: SupabaseClient):
    self._client = client
    self._table = "users"

  async def get_by_login(self, login: str) -> User | None:
    record = await self._client.select_one(self._table, "login", login)
    if record is None:
      return None
    return self._to_entity(record)

  async def create_user(self, login: str, password_hash: str) -> User:
    record = await self._client.insert(
      self._table,
      {"id": str(uuid4()), "login": login, "password_hash": password_hash},
    )
    return self._to_entity(record)

  def _to_entity(self, row: dict[str, Any]) -> User:
    return User(
      id=str(row["id"]),
      login=row["login"],
      password_hash=row["password_hash"],
      role=row.get("role", "guest"),
    )

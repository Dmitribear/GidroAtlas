from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

from app.domain.user import User
from app.infrastructure.supabase.client import SupabaseClient


class UserRepositorySupabase:
  def __init__(self, client: SupabaseClient):
    self._client = client
    self._table = "users"

  async def get_by_email(self, email: str) -> User | None:
    record = await self._client.select_one(self._table, "email", email)
    if record is None:
      return None
    return self._to_entity(record)

  async def create_user(self, email: str, hashed_password: str) -> User:
    now = datetime.now(timezone.utc)
    record = await self._client.insert(
      self._table,
      {"id": str(uuid4()), "email": email, "hashed_password": hashed_password, "created_at": now.isoformat()},
    )
    return self._to_entity(record)

  def _to_entity(self, row: dict[str, Any]) -> User:
    return User(
      id=str(row["id"]),
      email=row["email"],
      hashed_password=row["hashed_password"],
      created_at=datetime.fromisoformat(row["created_at"]),
    )

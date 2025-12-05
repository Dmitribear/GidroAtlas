from fastapi import HTTPException, status

from app.core.security import create_access_token, hash_password, verify_password
from app.domain.user import User
from app.infrastructure.supabase.repositories import UserRepositorySupabase


class RegisterUser:
  def __init__(self, users: UserRepositorySupabase):
    self._users = users

  async def __call__(self, login: str, password: str) -> User:
    existing = await self._users.get_by_login(login)
    if existing:
      raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="User already exists")

    hashed_password = hash_password(password)
    return await self._users.create_user(login=login, password_hash=hashed_password)


class AuthenticateUser:
  def __init__(self, users: UserRepositorySupabase):
    self._users = users

  async def __call__(self, login: str, password: str) -> str:
    user = await self._users.get_by_login(login)
    if user is None:
      raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    if not verify_password(password, user.password_hash):
      raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    return create_access_token(subject=user.id)

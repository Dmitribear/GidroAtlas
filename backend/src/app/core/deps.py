from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt

from app.core.config import get_settings
from app.infrastructure.supabase.client import SupabaseClient
from app.infrastructure.supabase.repositories import UserRepositorySupabase

http_bearer = HTTPBearer(auto_error=False)


def get_supabase_client() -> SupabaseClient:
  settings = get_settings()
  return SupabaseClient(settings.supabase_url, settings.supabase_key)


def get_user_repository(client: SupabaseClient = Depends(get_supabase_client)) -> UserRepositorySupabase:
  return UserRepositorySupabase(client)


def get_current_subject(
  credentials: HTTPAuthorizationCredentials | None = Depends(http_bearer),
) -> str:
  if credentials is None:
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credentials missing")

  settings = get_settings()

  try:
    payload = jwt.decode(credentials.credentials, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
  except JWTError:
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

  subject = payload.get("sub")
  if subject is None:
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")

  return str(subject)

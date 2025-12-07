from datetime import datetime, timedelta, timezone
from typing import Any

import bcrypt
from jose import jwt

from app.core.config import get_settings


def hash_password(raw_password: str) -> str:
  settings = get_settings()
  salt = bcrypt.gensalt(rounds=settings.bcrypt_rounds)
  return bcrypt.hashpw(raw_password.encode("utf-8"), salt).decode("utf-8")


def verify_password(raw_password: str, hashed_password: str) -> bool:
  try:
    return bcrypt.checkpw(raw_password.encode("utf-8"), hashed_password.encode("utf-8"))
  except ValueError:
    return False


def create_access_token(
  subject: str | int,
  expires_minutes: int | None = None,
  extra_claims: dict[str, Any] | None = None,
) -> str:
  settings = get_settings()
  expire_delta = timedelta(minutes=expires_minutes or settings.access_token_exp_minutes)
  expire_at = datetime.now(tz=timezone.utc) + expire_delta
  to_encode: dict[str, Any] = {"sub": str(subject), "exp": expire_at}
  if extra_claims:
    to_encode.update(extra_claims)
  return jwt.encode(to_encode, settings.jwt_secret, algorithm=settings.jwt_algorithm)

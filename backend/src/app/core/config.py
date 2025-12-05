from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
  model_config = SettingsConfigDict(env_file="../../.env", env_file_encoding="utf-8", extra="ignore")

  app_name: str = "GidroAtlas API"
  env: str = "local"
  debug: bool = False

  supabase_url: str = ""
  supabase_key: str = ""

  jwt_secret: str = "change-me"
  jwt_algorithm: str = "HS256"
  access_token_exp_minutes: int = 60

  bcrypt_rounds: int = 12

  database_url: str = "postgresql+psycopg://user:pass@localhost:5432/gidro"


@lru_cache
def get_settings() -> Settings:
  return Settings()

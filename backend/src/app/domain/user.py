from dataclasses import dataclass
from datetime import datetime


@dataclass(frozen=True, slots=True)
class User:
  id: str
  email: str
  hashed_password: str
  created_at: datetime

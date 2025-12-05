from dataclasses import dataclass


@dataclass(frozen=True, slots=True)
class User:
  id: str
  login: str
  password_hash: str
  role: str

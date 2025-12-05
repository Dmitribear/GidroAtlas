from dataclasses import dataclass


@dataclass(frozen=True, slots=True)
class Token:
  access_token: str
  token_type: str = "bearer"

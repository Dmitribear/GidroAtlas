from dataclasses import dataclass
from datetime import date


@dataclass(frozen=True, slots=True)
class WaterObject:
  id: str
  name: str
  region: str
  resource_type: str  # lake | canal | reservoir
  water_type: str  # fresh | non_fresh
  fauna: bool
  passport_date: date
  technical_condition: int
  latitude: float
  longitude: float
  pdf_url: str | None
  priority: int | None

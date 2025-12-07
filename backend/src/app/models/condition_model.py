from __future__ import annotations

from dataclasses import dataclass
from datetime import date, datetime
from typing import Any, TypedDict

CONDITION_COLORS: dict[int, str] = {
  1: '#0ea05d',  # зелёный
  2: '#7acb64',  # салатовый
  3: '#f4b000',  # жёлтый
  4: '#ed7b2f',  # оранжевый
  5: '#e63946',  # красный
}

PRIORITY_CATEGORY_TO_VALUE = {'low': 1, 'medium': 2, 'high': 3}
VALUE_TO_PRIORITY_CATEGORY = {value: key for key, value in PRIORITY_CATEGORY_TO_VALUE.items()}


class TechnicalRow(TypedDict, total=False):
  passport_date: str
  depth_max_m: float | str | None
  vegetation_surface: str | None
  vegetation_underwater: str | None
  phytoplankton_level: str | None
  fish_presence: str | None
  fish_productivity: float | str | None


@dataclass(frozen=True)
class ConditionWeights:
  age: float = 0.25
  depth: float = 0.20
  vegetation: float = 0.20
  phytoplankton: float = 0.20
  fish: float = 0.15


@dataclass(frozen=True)
class ConditionThresholds:
  very_good: float = 0.20
  good: float = 0.40
  satisfactory: float = 0.60
  bad: float = 0.80


DEFAULT_WEIGHTS = ConditionWeights()
DEFAULT_THRESHOLDS = ConditionThresholds()


def normalize_level(level: str | None) -> float:
  """Преобразование «слабо/средне/сильно» → 0/0.5/1."""
  if not level:
    return 0.5
  normalized = level.lower()
  if "слаб" in normalized:
    return 0.0
  if "сред" in normalized:
    return 0.5
  if "силь" in normalized:
    return 1.0
  return 0.5


def fish_score(fish_presence: str | None, fish_productivity: float | None) -> float:
  """
  Возвращает значение от 0 (отлично) до 1 (плохо) в зависимости от наличия рыбы и продуктивности.
  """
  if not fish_presence or "нет" in fish_presence.lower():
    return 1.0
  if fish_productivity is None:
    return 0.5
  if fish_productivity >= 60:
    return 0.0
  if fish_productivity >= 40:
    return 0.33
  if fish_productivity >= 20:
    return 0.66
  return 1.0


def compute_technical_condition(
  row: TechnicalRow,
  *,
  weights: ConditionWeights = DEFAULT_WEIGHTS,
  thresholds: ConditionThresholds = DEFAULT_THRESHOLDS,
  reference_date: date | None = None,
) -> int:
  """
  Вычисляет техническое состояние (категория 1–5) для одной строки CSV.

  :param row: исходные данные из CSV
  :param weights: набор весов для каждого фактора
  :param thresholds: пороги перехода категорий
  :param reference_date: дата, относительно которой считается возраст паспорта (для тестов)
  """
  passport_raw = row.get("passport_date")
  if not passport_raw:
    raise ValueError("passport_date is required to compute technical condition")
  passport_date = datetime.strptime(passport_raw, "%Y-%m-%d").date()
  today = reference_date or datetime.now().date()
  years = max(0, today.year - passport_date.year)
  age_component = min(years / 30, 1)

  depth_value = row.get("depth_max_m")
  if depth_value in (None, ""):
    depth_component = 0.5
  else:
    depth_component = 1 - min(float(depth_value) / 20, 1)

  vegetation_surface = normalize_level(row.get("vegetation_surface"))
  vegetation_underwater = normalize_level(row.get("vegetation_underwater"))
  vegetation_component = 0.6 * vegetation_surface + 0.4 * vegetation_underwater

  phytoplankton_component = normalize_level(row.get("phytoplankton_level"))

  fish_component = fish_score(
    row.get("fish_presence"),
    float(row["fish_productivity"]) if row.get("fish_productivity") not in (None, "") else None,
  )

  score = (
    weights.age * age_component
    + weights.depth * depth_component
    + weights.vegetation * vegetation_component
    + weights.phytoplankton * phytoplankton_component
    + weights.fish * fish_component
  )

  if score < thresholds.very_good:
    return 1
  if score < thresholds.good:
    return 2
  if score < thresholds.satisfactory:
    return 3
  if score < thresholds.bad:
    return 4
  return 5


def marker_color_for_condition(condition: int) -> str:
  return CONDITION_COLORS.get(condition, '#94a3b8')


def _ensure_date(value: date | str) -> date:
  if isinstance(value, date):
    return value
  return datetime.strptime(value, "%Y-%m-%d").date()


def calculate_priority_score(
  passport_date: date | str,
  technical_condition: int,
  *,
  reference_date: date | None = None,
) -> tuple[int, str]:
  real_date = _ensure_date(passport_date)
  today = reference_date or datetime.now().date()
  years = max(0, today.year - real_date.year)
  score = int((6 - technical_condition) * 3 + years)
  if score >= 12:
    category = "high"
  elif score >= 6:
    category = "medium"
  else:
    category = "low"
  return score, category


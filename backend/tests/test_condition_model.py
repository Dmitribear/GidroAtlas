from datetime import date
from pathlib import Path
import sys

PROJECT_SRC = Path(__file__).resolve().parents[1] / "src"
if str(PROJECT_SRC) not in sys.path:
  sys.path.insert(0, str(PROJECT_SRC))

from app.models.condition_model import (  # noqa: E402
  calculate_priority_score,
  compute_technical_condition,
  fish_score,
  marker_color_for_condition,
  normalize_level,
)


def test_normalize_level_handles_variations():
  assert normalize_level('Слабо') == 0.0
  assert normalize_level('Средне') == 0.5
  assert normalize_level('Сильно') == 1.0
  assert normalize_level(None) == 0.5  # дефолт


def test_fish_score_ranges():
  assert fish_score('нет данных', 80) == 1.0
  assert fish_score('карп', None) == 0.5
  assert fish_score('карп', 65) == 0.0
  assert fish_score('карп', 45) == 0.33
  assert fish_score('карп', 25) == 0.66
  assert fish_score('карп', 5) == 1.0


def test_compute_technical_condition_returns_expected_category():
  row = {
    'passport_date': '2010-01-01',
    'depth_max_m': 10,
    'vegetation_surface': 'сильно',
    'vegetation_underwater': 'слабо',
    'phytoplankton_level': 'средне',
    'fish_presence': 'сазан',
    'fish_productivity': 45,
  }

  result = compute_technical_condition(row, reference_date=date(2025, 1, 1))

  # Расчёт вручную даёт ~0.49 → категория 3
  assert result == 3


def test_calculate_priority_score_categorises_correctly():
  high_score = calculate_priority_score('2000-01-01', technical_condition=5, reference_date=date(2025, 1, 1))
  medium_score = calculate_priority_score('2023-01-01', technical_condition=3, reference_date=date(2025, 1, 1))
  low_score = calculate_priority_score('2025-01-01', technical_condition=5, reference_date=date(2025, 1, 1))

  assert high_score[1] == 'high'
  assert medium_score[1] == 'medium'
  assert low_score[1] == 'low'


def test_marker_color_for_condition_has_fallback():
  assert marker_color_for_condition(1).startswith('#')
  assert marker_color_for_condition(99) == '#94a3b8'


"""Data access, generation and preprocessing utilities."""

from .generator import generate_sample_data
from .loader import DATA_FILE, ensure_dataset, load_dataset, save_dataset
from .preprocess import build_feature_matrix, make_time_series, prepare_feature_frame
from .schema import Coordinates, ObjectPassport, REQUIRED_COLUMNS

__all__ = [
    "generate_sample_data",
    "ensure_dataset",
    "load_dataset",
    "save_dataset",
    "build_feature_matrix",
    "make_time_series",
    "prepare_feature_frame",
    "ObjectPassport",
    "Coordinates",
    "REQUIRED_COLUMNS",
    "DATA_FILE",
]


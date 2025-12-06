import pandas as pd

from backend.data import build_feature_matrix


def test_build_feature_matrix_splits():
    df = pd.DataFrame(
        {
            "name": ["A", "B", "C", "D"],
            "region": ["север", "юг", "восток", "запад"],
            "resource_type": ["ГЭС", "шлюз", "плотина", "водохранилище"],
            "water_type": ["пресная", "солёная", "пресная", "нет"],
            "fauna": [1, 0, 1, 0],
            "passport_date": ["2010-01-01", "2005-06-10", "2015-03-15", "2000-11-30"],
            "condition": [5, 2, 4, 1],
            "lat": [55.1, 60.2, 58.4, 53.9],
            "lon": [37.5, 44.2, 41.8, 39.1],
        }
    )
    X_train, X_test, y_train, y_test = build_feature_matrix(df)
    assert len(X_train) == 2
    assert len(X_test) == 2
    assert set(X_train.columns) == {
        "condition",
        "resource_type",
        "region",
        "water_type",
        "fauna",
        "passport_age_years",
        "lat",
        "lon",
    }


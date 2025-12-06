import pandas as pd
import pytest

from backend.config import settings
from backend.models import ModelTrainer


def test_training_produces_artifact(tmp_path, monkeypatch):
    monkeypatch.setattr(settings, "model_dir", tmp_path)
    trainer = ModelTrainer()
    df = pd.DataFrame(
        {
            "name": [f"Obj-{i}" for i in range(8)],
            "region": ["север", "юг", "восток", "запад"] * 2,
            "resource_type": ["ГЭС", "шлюз", "плотина", "водохранилище"] * 2,
            "water_type": ["пресная", "солёная", "пресная", "нет"] * 2,
            "fauna": [1, 0, 1, 0, 1, 1, 0, 0],
            "passport_date": [
                "2010-01-01",
                "2004-05-12",
                "2015-03-30",
                "2001-10-10",
                "2008-07-07",
                "2018-09-09",
                "2012-02-02",
                "2000-12-12",
            ],
            "condition": [5, 2, 4, 1, 3, 5, 2, 1],
            "lat": [55.1, 60.2, 58.4, 53.9, 56.7, 57.8, 52.1, 61.0],
            "lon": [37.5, 44.2, 41.8, 39.1, 36.5, 45.0, 40.0, 60.0],
        }
    )
    result = trainer.train_classifier(df)
    assert "accuracy" in result.metrics or result.metrics.get("warning") == "not_enough_classes"
    artifact_dir = tmp_path / "classifier"
    assert artifact_dir.exists()
    latest_file = artifact_dir / "latest.txt"
    assert latest_file.exists()
    artifact_path = artifact_dir / latest_file.read_text(encoding="utf-8").strip()
    assert artifact_path.exists()


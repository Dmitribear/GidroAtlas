from backend.config import settings
from backend.data import generate_sample_data, load_dataset


def test_generate_and_load_dataset(tmp_path, monkeypatch):
    target = tmp_path / "passports.csv"
    monkeypatch.setattr("backend.data.loader.DATA_FILE", target)
    monkeypatch.setattr(settings, "data_dir", tmp_path)
    path = generate_sample_data(60, seed=1)
    assert path.exists()
    df = load_dataset()
    assert not df.empty
    assert {"region", "resource_type", "condition", "lat", "lon"} <= set(df.columns)


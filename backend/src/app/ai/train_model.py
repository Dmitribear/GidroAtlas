from __future__ import annotations

"""CLI helper to (re)train all ML assets."""

from app.ai.data import generate_sample_data, load_dataset
from app.ai.models import ModelTrainer


def main() -> None:
    generate_sample_data()
    df = load_dataset()
    trainer = ModelTrainer()
    result = trainer.train_classifier(df)
    print(f"Classifier retrained. Version={result.version} Metrics={result.metrics}")


if __name__ == "__main__":
    main()


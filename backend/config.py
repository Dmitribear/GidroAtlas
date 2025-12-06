from __future__ import annotations

"""Global configuration helpers for the analytics backend."""

from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application-wide settings."""

    project_root: Path = Field(default_factory=lambda: Path(__file__).resolve().parent)
    data_dir: Path = Field(default_factory=lambda: Path(__file__).resolve().parent / "data")
    model_dir: Path = Field(default_factory=lambda: Path(__file__).resolve().parent / "models" / "artifacts")
    plots_dir: Path = Field(default_factory=lambda: Path(__file__).resolve().parent / "dashboards" / "plots")

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        protected_namespaces=("settings_",),
    )


settings = Settings()

# Ensure runtime directories exist
settings.data_dir.mkdir(parents=True, exist_ok=True)
settings.model_dir.mkdir(parents=True, exist_ok=True)
settings.plots_dir.mkdir(parents=True, exist_ok=True)


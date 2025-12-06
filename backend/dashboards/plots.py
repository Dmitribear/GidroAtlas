from __future__ import annotations

"""Seaborn/matplotlib plot generation."""

from pathlib import Path

import matplotlib
import matplotlib.pyplot as plt
import seaborn as sns

from backend.config import settings

matplotlib.use("Agg")


def _ensure_dir() -> Path:
    settings.plots_dir.mkdir(parents=True, exist_ok=True)
    return settings.plots_dir


def risk_distribution_plot(df) -> Path:
    out_dir = _ensure_dir()
    path = out_dir / "risk_distribution.png"
    fig, ax = plt.subplots(figsize=(6, 4), dpi=140)
    sns.histplot(df["risk_score"], kde=True, bins=15, ax=ax, color="#1d8cf8")
    ax.set_xlabel("Risk score")
    ax.set_ylabel("Count")
    ax.set_title("Risk score distribution")
    fig.tight_layout()
    fig.savefig(path)
    plt.close(fig)
    return path


def cluster_map_plot(df) -> Path:
    out_dir = _ensure_dir()
    path = out_dir / "cluster_map.png"
    fig, ax = plt.subplots(figsize=(6, 4), dpi=140)
    palette = sns.color_palette("flare", n_colors=5)
    sns.scatterplot(
        data=df,
        x="lon",
        y="lat",
        hue="condition",
        size="risk_score",
        palette=palette,
        ax=ax,
        sizes=(30, 200),
    )
    ax.set_xlabel("Longitude")
    ax.set_ylabel("Latitude")
    ax.set_title("Geospatial distribution (condition & risk)")
    fig.tight_layout()
    fig.savefig(path)
    plt.close(fig)
    return path


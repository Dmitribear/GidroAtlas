from __future__ import annotations

import base64
import io

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402
import pandas as pd  # noqa: E402
import seaborn as sns  # noqa: E402

sns.set_theme(style="whitegrid")


def fig_to_base64(fig: plt.Figure) -> str:
    buf = io.BytesIO()
    fig.savefig(buf, format="png", bbox_inches="tight")
    plt.close(fig)
    buf.seek(0)
    return base64.b64encode(buf.getvalue()).decode("utf-8")


def _ensure_column(df: pd.DataFrame, column: str, default: object) -> pd.Series:
    if column not in df.columns:
        df[column] = default
    return df[column]


def plot_condition_distribution(df: pd.DataFrame) -> str:
    _ensure_column(df, "technical_condition", 0)
    fig, ax = plt.subplots(figsize=(6, 4))
    sns.countplot(data=df, x="technical_condition", palette="coolwarm", ax=ax)
    ax.set_title("Распределение состояний технического уровня")
    ax.set_xlabel("Состояние")
    ax.set_ylabel("Количество")
    return fig_to_base64(fig)


def plot_risk_distribution(df: pd.DataFrame) -> str:
    _ensure_column(df, "risk_probability", 0.0)
    fig, ax = plt.subplots(figsize=(6, 4))
    sns.histplot(df["risk_probability"], bins=10, kde=True, color="red", ax=ax)
    ax.set_title("Распределение рисков ухудшения (12 месяцев)")
    ax.set_xlabel("Вероятность")
    ax.set_ylabel("Количество")
    return fig_to_base64(fig)


def plot_passport_age(df: pd.DataFrame) -> str:
    _ensure_column(df, "passport_age_years", 0)
    fig, ax = plt.subplots(figsize=(6, 4))
    sns.histplot(df["passport_age_years"], kde=True, color="blue", ax=ax)
    ax.set_title("Возраст паспортов объектов")
    ax.set_xlabel("Возраст (лет)")
    ax.set_ylabel("Количество")
    return fig_to_base64(fig)


def plot_by_type(df: pd.DataFrame) -> str:
    _ensure_column(df, "resource_type", "Не указан")
    fig, ax = plt.subplots(figsize=(6, 4))
    sns.countplot(data=df, x="resource_type", palette="viridis", ax=ax)
    ax.set_title("Количество объектов по типам ресурсов")
    ax.set_xlabel("Тип ресурса")
    ax.set_ylabel("Количество")
    plt.setp(ax.get_xticklabels(), rotation=30, ha="right")
    return fig_to_base64(fig)


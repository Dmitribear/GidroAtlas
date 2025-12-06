from backend.ml_interpretation import (
    explain_anomalies,
    generate_recommendations,
    simulate_scenario,
)


def test_explain_anomalies_returns_text():
    text = explain_anomalies([{"name": "Dam-1", "region": "north", "score": 1.1}])
    assert "Dam-1" in text


def test_generate_recommendations_uses_summary():
    summary = {"avg_risk": 0.7, "critical_objects": 2, "avg_condition": 3.2, "avg_passport_age": 12.5, "fauna_count": 4}
    forecast = {"3_months": 0.8}
    recs = generate_recommendations(summary, forecast)
    assert "0.8" in recs
    assert "критических" in recs.lower()


def test_simulate_scenario_describes_case():
    result = simulate_scenario(
        {"name": "Dam-5", "risk": 0.9, "resource_type": "ГЭС", "water_type": "солёная", "condition": 2}
    )
    assert "Dam-5" in result
    assert "ГЭС" in result


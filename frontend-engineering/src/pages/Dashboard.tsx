import { useEffect, useMemo, useState } from "react";

import { api } from "../api";
import MetricsPanel from "../components/MetricsPanel";
import ObjectTable from "../components/ObjectTable";
import RiskIndicator from "../components/RiskIndicator";
import type { ObjectPassport, PredictionMap, SummaryMetrics } from "../types";

interface PredictState {
  recommendation: string;
  sorted_predictions: PredictionMap;
  priority_score: number;
  risk_score: number;
}

export default function DashboardPage() {
  const [assets, setAssets] = useState<ObjectPassport[]>([]);
  const [summary, setSummary] = useState<SummaryMetrics>();
  const [selected, setSelected] = useState<ObjectPassport | null>(null);
  const [predictInfo, setPredictInfo] = useState<PredictState | null>(null);
  const [loading, setLoading] = useState(true);
  const [predictLoading, setPredictLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [summaryRes, objectsRes] = await Promise.all([api.summary(), api.objects()]);
        setSummary(summaryRes);
        setAssets(objectsRes);
        setSelected(objectsRes[0] ?? null);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Неизвестная ошибка");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchPrediction = async () => {
      if (!selected) {
        setPredictInfo(null);
        return;
      }
      try {
        setPredictLoading(true);
        const payload = {
          name: selected.name,
          region: selected.region,
          resource_type: selected.resource_type,
          water_type: selected.water_type,
          fauna: selected.fauna,
          passport_date: selected.passport_date,
          condition: selected.condition,
          coordinates: selected.coordinates,
        };
        const response = await api.predict(payload);
        setPredictInfo(response);
      } catch (err) {
        setPredictInfo(null);
        console.error(err);
      } finally {
        setPredictLoading(false);
      }
    };
    fetchPrediction();
  }, [selected]);

  const predictions = useMemo(() => {
    if (!predictInfo) return [];
    return Object.entries(predictInfo.sorted_predictions);
  }, [predictInfo]);

  return (
    <div className="page dashboard-page">
      <header className="page-header">
        <div>
          <h1>Мониторинг ГТО</h1>
          <p className="muted">ML-анализ риска по оперативным данным</p>
        </div>
      </header>

      <MetricsPanel data={summary} loading={loading} />

      {error && <div className="error-banner">{error}</div>}

      <section className="layout-grid">
        <div className="panel stretch">
          <div className="panel-header">
            <h2>Объекты</h2>
          </div>
          <ObjectTable data={assets} loading={loading} selectedName={selected?.name} onSelect={setSelected} />
        </div>

        <div className="panel detail-panel">
          <div className="panel-header">
            <h2>Детали объекта</h2>
          </div>
          {selected ? (
            <div className="detail-content">
              <div className="detail-row">
                <strong>{selected.name}</strong>
                <span className="muted">{selected.region}</span>
              </div>
              <RiskIndicator value={predictInfo?.risk_score ?? selected.risk_score} size="lg" />
              <dl>
                <div>
                  <dt>Тип</dt>
                  <dd>{selected.resource_type}</dd>
                </div>
                <div>
                  <dt>Тип воды</dt>
                  <dd>{selected.water_type}</dd>
                </div>
                <div>
                  <dt>Фауна</dt>
                  <dd>{selected.fauna ? "Да" : "Нет"}</dd>
                </div>
                <div>
                  <dt>Дата паспорта</dt>
                  <dd>{selected.passport_date}</dd>
                </div>
                <div>
                  <dt>Координаты</dt>
                  <dd>
                    {selected.coordinates.lat.toFixed(3)}, {selected.coordinates.lon.toFixed(3)}
                  </dd>
                </div>
                <div>
                  <dt>Состояние</dt>
                  <dd>{selected.condition}/5</dd>
                </div>
              </dl>

              {predictInfo && (
                <>
                  <div className="badge">
                    Приоритет: {predictInfo.priority_score} · {predictInfo.recommendation}
                  </div>
                  <div className={`prediction-grid ${predictLoading ? "loading" : ""}`}>
                    {predictions.map(([period, value]) => (
                      <div key={period} className="prediction-card">
                        <span className="muted">{period}</span>
                        <strong>{(value * 100).toFixed(1)}%</strong>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            <p className="muted">Выберите объект.</p>
          )}
        </div>
      </section>
    </div>
  );
}


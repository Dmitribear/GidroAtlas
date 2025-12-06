import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEventHandler } from "react";

import { api } from "../api";
import type { ClusterInfo } from "../types";

export default function AnalyticsPage() {
  const [clusters, setClusters] = useState<ClusterInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [plotVersion, setPlotVersion] = useState(Date.now());
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const riskPlot = useMemo(() => api.riskPlotUrl(), [plotVersion]);
  const clusterPlot = useMemo(() => api.clusterPlotUrl(), [plotVersion]);

  useEffect(() => {
    const fetchClusters = async () => {
      try {
        setLoading(true);
        const data = await api.clusters();
        setClusters(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Не удалось загрузить кластеры");
      } finally {
        setLoading(false);
      }
    };
    fetchClusters();
  }, [plotVersion]);

  const refreshPlots = () => setPlotVersion(Date.now());

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileChange: ChangeEventHandler<HTMLInputElement> = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadMessage(null);
    try {
      const response = await api.uploadDataset(file);
      setUploadMessage(`Загружено ${file.name}, строк: ${response.rows ?? "?"}`);
      refreshPlots();
    } catch (err) {
      setUploadMessage(err instanceof Error ? err.message : "Не удалось загрузить CSV");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  return (
    <div className="page analytics-page">
      <header className="page-header">
        <div>
          <h1>Аналитика рисков</h1>
          <p className="muted">PNG графики от seaborn и кластеризация проблемных активов</p>
        </div>
        <div className="header-actions">
          <button type="button" className="primary-btn" onClick={refreshPlots}>
            Обновить графики
          </button>
          <button
            type="button"
            className="secondary-btn"
            onClick={handleUploadClick}
            disabled={uploading}
          >
            {uploading ? "Загрузка..." : "Загрузить CSV"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            hidden
            onChange={handleFileChange}
          />
        </div>
      </header>

      {uploadMessage && <div className="info-banner">{uploadMessage}</div>}
      {error && <div className="error-banner">{error}</div>}

      <section className="panel">
        <div className="panel-header">
          <h2>Визуализации</h2>
        </div>
        <div className="plot-grid">
          <figure>
            <figcaption>Распределение рисков</figcaption>
            <img src={riskPlot} alt="Risk distribution" />
          </figure>
          <figure>
            <figcaption>Карта кластеров</figcaption>
            <img src={clusterPlot} alt="Cluster map" />
          </figure>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2>Кластеры</h2>
        </div>
        <div className="cluster-grid">
          {loading ? (
            <p>Загрузка кластеров…</p>
          ) : (
            clusters.map((cluster) => (
              <article key={cluster.cluster_id} className="cluster-card">
                <h3>Кластер {cluster.cluster_id + 1}</h3>
                <p>Объектов: {cluster.count}</p>
                <p>Средний риск: {(cluster.cluster_risk_mean * 100).toFixed(1)}%</p>
                <p>Среднее состояние: {cluster.condition_avg.toFixed(2)}</p>
                <p className={cluster.critical_present ? "danger" : "muted"}>
                  Критические: {cluster.critical_present ? "есть" : "нет"}
                </p>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}


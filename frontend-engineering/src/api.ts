import type { ObjectPassport, ClusterInfo, PredictionMap, SummaryMetrics } from "./types";

const API_BASE = `${window.location.protocol}//${window.location.hostname}:8000`;

async function fetchJSON<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
    },
    ...init,
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`API ${response.status}: ${detail}`);
  }
  return response.json() as Promise<T>;
}

export interface PredictPayload {
  name: string;
  region: string;
  resource_type: string;
  water_type: string;
  fauna: boolean;
  passport_date: string;
  condition: number;
  coordinates: { lat: number; lon: number };
}

export interface PredictResponse {
  risk_score: number;
  priority_score: number;
  recommendation: string;
  sorted_predictions: PredictionMap;
}

export const api = {
  summary: () => fetchJSON<SummaryMetrics>("/ai/summary"),
  objects: () => fetchJSON<ObjectPassport[]>("/ai/objects"),
  clusters: () => fetchJSON<ClusterInfo[]>("/ai/clusters"),
  predict: (payload: PredictPayload) =>
    fetchJSON<PredictResponse>("/ai/predict", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  riskPlotUrl: () => `${API_BASE}/plots/risk_distribution?cache=${Date.now()}`,
  clusterPlotUrl: () => `${API_BASE}/plots/cluster_map?cache=${Date.now()}`,
  uploadDataset: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch(`${API_BASE}/datasets/upload`, {
      method: "POST",
      body: formData,
    });
    if (!response.ok) {
      const detail = await response.text();
      throw new Error(detail || "Не удалось загрузить CSV");
    }
    return response.json();
  },
};


import type { SimulationPayload } from "./types";

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
    throw new Error(detail || "Ошибка API");
  }
  return response.json() as Promise<T>;
}

export const api = {
  anomalyInsights: () => fetchJSON<{ explanation: string }>("/analysis/explain"),
  recommendations: () => fetchJSON<{ recommendations: string }>("/analysis/recommend"),
  simulate: (payload: SimulationPayload) =>
    fetchJSON<{ simulation: string }>("/analysis/simulate", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

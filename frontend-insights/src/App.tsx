import { useState } from "react";

import { api } from "./api";
import "./App.css";
import type { SimulationPayload } from "./types";

export default function App() {
  const [anomalyText, setAnomalyText] = useState("Нажмите, чтобы получить объяснение.");
  const [recommendations, setRecommendations] = useState("Готово к генерации.");
  const [simulation, setSimulation] = useState("Введите параметры и запустите симуляцию.");
  const [simulationPayload, setSimulationPayload] = useState<SimulationPayload>({
    name: "Object-001",
    risk: 0.65,
    resource_type: "ГЭС",
    water_type: "пресная",
    condition: 3,
  });
  const [loading, setLoading] = useState({
    anomalies: false,
    recommendations: false,
    simulation: false,
  });

  const handleAnomalies = async () => {
    try {
      setLoading((state) => ({ ...state, anomalies: true }));
      const response = await api.anomalyInsights();
      setAnomalyText(response.explanation);
    } catch (error) {
      setAnomalyText(error instanceof Error ? error.message : "Ошибка интерпретации");
    } finally {
      setLoading((state) => ({ ...state, anomalies: false }));
    }
  };

  const handleRecommendations = async () => {
    try {
      setLoading((state) => ({ ...state, recommendations: true }));
      const response = await api.recommendations();
      setRecommendations(response.recommendations);
    } catch (error) {
      setRecommendations(error instanceof Error ? error.message : "Ошибка интерпретации");
    } finally {
      setLoading((state) => ({ ...state, recommendations: false }));
    }
  };

  const handleSimulation = async () => {
    try {
      setLoading((state) => ({ ...state, simulation: true }));
      const response = await api.simulate(simulationPayload);
      setSimulation(response.simulation);
    } catch (error) {
      setSimulation(error instanceof Error ? error.message : "Ошибка интерпретации");
    } finally {
      setLoading((state) => ({ ...state, simulation: false }));
    }
  };

  return (
    <div className="insights-app">
      <header>
        <h1>AI Insights</h1>
        <p>Локальные интерпретации и рекомендации для гидротехнических объектов</p>
      </header>

      <section className="card">
        <div className="card-header">
          <h2>Объяснение аномалий</h2>
          <button type="button" onClick={handleAnomalies} disabled={loading.anomalies}>
            {loading.anomalies ? "Обработка..." : "Запросить"}
          </button>
        </div>
        <p>{anomalyText}</p>
      </section>

      <section className="card">
        <div className="card-header">
          <h2>Рекомендации</h2>
          <button type="button" onClick={handleRecommendations} disabled={loading.recommendations}>
            {loading.recommendations ? "Обработка..." : "Сгенерировать"}
          </button>
        </div>
        <p>{recommendations}</p>
      </section>

      <section className="card">
        <div className="card-header">
          <h2>Сценарная симуляция</h2>
        </div>
        <div className="form-grid">
          <label>
            Объект
            <input
              value={simulationPayload.name}
              onChange={(event) => setSimulationPayload((data) => ({ ...data, name: event.target.value }))}
            />
          </label>
          <label>
            Риск
            <input
              type="number"
              step="0.01"
              min={0}
              max={1}
              value={simulationPayload.risk}
              onChange={(event) => setSimulationPayload((data) => ({ ...data, risk: Number(event.target.value) }))}
            />
          </label>
          <label>
            Тип объекта
            <input
              value={simulationPayload.resource_type}
              onChange={(event) => setSimulationPayload((data) => ({ ...data, resource_type: event.target.value }))}
            />
          </label>
          <label>
            Тип воды
            <select
              value={simulationPayload.water_type}
              onChange={(event) => setSimulationPayload((data) => ({ ...data, water_type: event.target.value }))}
            >
              <option value="пресная">Пресная</option>
              <option value="солёная">Солёная</option>
              <option value="нет">Нет</option>
            </select>
          </label>
          <label>
            Состояние
            <input
              type="number"
              min={1}
              max={5}
              value={simulationPayload.condition}
              onChange={(event) =>
                setSimulationPayload((data) => ({ ...data, condition: Number(event.target.value) || 1 }))
              }
            />
          </label>
        </div>
        <button type="button" className="primary-btn" onClick={handleSimulation} disabled={loading.simulation}>
          {loading.simulation ? "Считаем..." : "Запустить симуляцию"}
        </button>
        <p className="simulation-output">{simulation}</p>
      </section>
    </div>
  );
}

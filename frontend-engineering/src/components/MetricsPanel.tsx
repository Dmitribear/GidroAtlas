import type { SummaryMetrics } from "../types";

interface Props {
  data?: SummaryMetrics;
  loading?: boolean;
}

type MetricConfig = {
  key: keyof SummaryMetrics;
  label: string;
  format?: (value: number) => string;
  suffix?: string;
};

const items: MetricConfig[] = [
  { key: "total_objects", label: "Всего объектов" },
  { key: "avg_risk", label: "Средний риск", format: (v: number) => (v * 100).toFixed(1) + "%" },
  { key: "critical_objects", label: "Критических объектов" },
  { key: "avg_condition", label: "Среднее состояние" },
  { key: "avg_passport_age", label: "Возраст паспорта", suffix: " лет" },
  { key: "fauna_count", label: "С фауной" },
];

export default function MetricsPanel({ data, loading }: Props) {
  return (
    <section className="metrics-panel">
      {items.map((item) => {
        const value = data ? Number(data[item.key]) : 0;
        const display = item.format ? item.format(value) : `${value}${item.suffix ?? ""}`;
        return (
          <article key={item.key} className={`metric-card ${loading ? "skeleton" : ""}`}>
            <span className="metric-label">{item.label}</span>
            <strong className="metric-value">{loading ? "…" : display}</strong>
          </article>
        );
      })}
    </section>
  );
}


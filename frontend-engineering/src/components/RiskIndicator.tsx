import "./RiskIndicator.css";

interface Props {
  value: number;
  size?: "sm" | "md" | "lg";
}

const labels = ["L1", "L2", "L3", "L4", "L5"];

export function scoreToLevel(score: number): number {
  if (score < 0.2) return 1;
  if (score < 0.4) return 2;
  if (score < 0.6) return 3;
  if (score < 0.8) return 4;
  return 5;
}

export default function RiskIndicator({ value, size = "md" }: Props) {
  const level = scoreToLevel(value);
  const label = labels[level - 1];
  return (
    <div className={`risk-indicator ${size} level-${level}`} title={`Risk ${value.toFixed(2)}`}>
      <div className="risk-indicator__pulse" />
      <span className="risk-indicator__label">
        {label} · {(value * 100).toFixed(0)}%
      </span>
    </div>
  );
}


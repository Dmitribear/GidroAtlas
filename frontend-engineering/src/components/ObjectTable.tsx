import type { ObjectPassport } from "../types";
import RiskIndicator from "./RiskIndicator";

interface Props {
  data: ObjectPassport[];
  loading?: boolean;
  onSelect?: (asset: ObjectPassport) => void;
  selectedName?: string;
}

export default function ObjectTable({ data, loading, onSelect, selectedName }: Props) {
  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Название</th>
            <th>Регион</th>
            <th>Тип</th>
            <th>Состояние</th>
            <th>Риск</th>
            <th>Приоритет</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={6}>Загрузка…</td>
            </tr>
          ) : (
            data.map((asset) => (
              <tr key={asset.name} className={asset.name === selectedName ? "selected" : ""}>
                <td>{asset.name}</td>
                <td className="muted">{asset.region}</td>
                <td>{asset.resource_type}</td>
                <td>{asset.condition}</td>
                <td>
                  <RiskIndicator value={asset.risk_score} size="sm" />
                </td>
                <td>{asset.priority_score}</td>
                <td>
                  <button type="button" onClick={() => onSelect?.(asset)} className="ghost-btn">
                    Подробнее
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}


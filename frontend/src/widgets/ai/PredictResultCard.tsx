import { type PredictionResult } from '@entities/ai/types'

type Props = {
  result: PredictionResult
}

const riskTone = (risk: number) => {
  if (risk >= 0.7) return { label: 'Высокий риск', color: 'text-rose-500', ring: 'ring-rose-300', bg: 'bg-rose-50' }
  if (risk >= 0.4) return { label: 'Средний риск', color: 'text-amber-500', ring: 'ring-amber-300', bg: 'bg-amber-50' }
  return { label: 'Низкий риск', color: 'text-emerald-500', ring: 'ring-emerald-300', bg: 'bg-emerald-50' }
}

const priorityTone = (score: number) => {
  if (score >= 80) return { label: 'Критический приоритет', color: 'text-rose-600' }
  if (score >= 50) return { label: 'Высокий приоритет', color: 'text-amber-600' }
  return { label: 'Плановый контроль', color: 'text-emerald-600' }
}

const horizonLabel = (key: string) => {
  const dict: Record<string, string> = {
    '3_months': '3 мес.',
    '6_months': '6 мес.',
    '12_months': '1 год',
    '24_months': '2 года',
    '60_months': '5 лет',
  }
  return dict[key] ?? key
}

export const PredictResultCard = ({ result }: Props) => {
  const risk = Number(result.risk_score ?? 0)
  const priority = Number(result.priority_score ?? 0)
  const tone = riskTone(risk)
  const priorityInfo = priorityTone(priority)
  const predictions = Object.entries(result.sorted_predictions ?? {}).slice(0, 4)

  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-lg shadow-slate-900/5 p-5 space-y-4">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 rounded-2xl bg-slate-900 text-slate-50 p-4 flex items-center gap-4">
          <div className={`w-24 h-24 rounded-full border-8 ${tone.ring} flex items-center justify-center ${tone.bg}`}>
            <span className={`text-2xl font-bold ${tone.color}`}>{Math.round(risk * 100)}%</span>
          </div>
          <div>
            <p className="text-sm uppercase tracking-wide text-slate-400">Риск объекта</p>
            <p className="text-2xl font-semibold">{tone.label}</p>
            <p className="text-sm text-slate-300 mt-1">{result.recommendation ?? 'Сформируйте прогноз для рекомендаций.'}</p>
          </div>
        </div>
        <div className="w-full lg:w-56 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Приоритет</p>
          <p className="text-4xl font-semibold text-slate-900">{priority}</p>
          <p className={`text-sm font-semibold ${priorityInfo.color}`}>{priorityInfo.label}</p>
          <p className="text-xs text-slate-500 mt-2">Чем выше балл, тем быстрее нужно вмешиваться.</p>
        </div>
      </div>

      {!!predictions.length && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {predictions.map(([horizon, value]) => (
            <div key={horizon} className="rounded-2xl border border-slate-200 p-3 bg-slate-50">
              <p className="text-[11px] uppercase tracking-wide text-slate-500">{horizonLabel(horizon)}</p>
              <p className="text-xl font-semibold text-slate-900">{(Number(value) * 100).toFixed(1)}%</p>
              <p className="text-xs text-slate-500">вероятность фокуса</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}


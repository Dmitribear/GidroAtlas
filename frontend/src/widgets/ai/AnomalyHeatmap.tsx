import { useMemo } from 'react'
import { type AnomalyPoint, type AnomalyStats } from '@entities/ai/types'
import { PlotlyChart } from './PlotlyChart'

type Props = {
  data: AnomalyPoint[]
  stats?: AnomalyStats | null
}

const severityBadge = (score: number) => {
  if (score >= 0.02) return { tone: 'bg-rose-100 text-rose-600', label: 'Требует внимания' }
  if (score >= 0.01) return { tone: 'bg-amber-100 text-amber-600', label: 'Под наблюдением' }
  return { tone: 'bg-emerald-100 text-emerald-600', label: 'Норма' }
}

export const AnomalyHeatmap = ({ data, stats }: Props) => {
  const hasCoords = data.some((d) => Number.isFinite(d.lat) && Number.isFinite(d.lon))

  const chart = useMemo(() => {
    if (!data.length) return { traces: [], layout: {} }
    if (hasCoords) {
      return {
        traces: [
          {
            x: data.map((d) => d.lon ?? 0),
            y: data.map((d) => d.lat ?? 0),
            z: data.map((d) => d.score ?? 0),
            text: data.map((d) => `${d.name ?? 'Объект'}<br>Скор: ${(d.score ?? 0).toFixed(3)}`),
            type: 'heatmap',
            colorscale: [
              [0, '#e0f2fe'],
              [0.3, '#bae6fd'],
              [0.6, '#fdba74'],
              [1, '#dc2626'],
            ],
            hoverinfo: 'text',
          },
        ],
        layout: { margin: { l: 40, r: 10, b: 40, t: 10 } },
      }
    }
    return {
      traces: [
        {
          x: data.map((d) => d.score ?? 0),
          y: data.map((d) => d.name ?? 'Объект'),
          type: 'bar',
          marker: { color: data.map((d) => d.score ?? 0), colorscale: 'YlOrRd' },
          orientation: 'h',
          text: data.map((d) => (d.score ?? 0).toFixed(3)),
          textposition: 'outside',
        },
      ],
      layout: { margin: { l: 120, r: 10, b: 30, t: 10 }, height: Math.max(200, data.length * 40) },
    }
  }, [data, hasCoords])

  if (!data.length) return <p className="text-sm text-slate-600">Нет данных. Обновите аналитику.</p>

  const topList = data.slice(0, 6)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
        <div className="rounded-2xl bg-slate-50 border border-slate-200 px-3 py-2">
          <p className="uppercase text-[10px] tracking-wide text-slate-500">Порог</p>
          <p className="text-lg font-semibold text-slate-900">{stats?.threshold?.toFixed(3) ?? '—'}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 border border-slate-200 px-3 py-2">
          <p className="uppercase text-[10px] tracking-wide text-slate-500">Средний скор</p>
          <p className="text-lg font-semibold text-slate-900">{stats?.mean_score?.toFixed(3) ?? '—'}</p>
        </div>
      </div>
      {chart.traces.length ? (
        <PlotlyChart data={chart.traces} layout={chart.layout} height={hasCoords ? 260 : chart.layout.height} />
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-600">Нет данных для графика.</div>
      )}
      <div className="space-y-3">
        {topList.map((item, idx) => {
          const severity = severityBadge(item.score ?? 0)
          return (
            <div key={`${item.name ?? 'anomaly'}-${idx}`} className="rounded-2xl border border-slate-200 p-3 bg-white shadow-sm">
              <div className="flex justify-between items-center text-xs text-slate-500 mb-1">
                <span>{item.region ?? 'Регион не указан'}</span>
                <span className={`px-2 py-0.5 rounded-full font-semibold ${severity.tone}`}>{severity.label}</span>
              </div>
              <p className="text-sm font-semibold text-slate-900">{item.name ?? 'Объект'}</p>
              <p className="text-xs text-slate-500">Скор: {(item.score ?? 0).toFixed(3)}</p>
            </div>
          )
        })}
        {data.length > topList.length && (
          <div className="text-xs text-slate-500">ещё {data.length - topList.length} объектов в очереди на проверку</div>
        )}
      </div>
    </div>
  )
}

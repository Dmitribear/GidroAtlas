import { useMemo } from 'react'
import { type AnomalyPoint } from '@entities/ai/types'
import { PlotlyChart } from './PlotlyChart'

type Props = {
  data: AnomalyPoint[]
}

export const AnomalyHeatmap = ({ data }: Props) => {
  const hasCoords = data.some((d) => d.lat !== undefined && d.lon !== undefined)

  const heatmapData = useMemo(() => {
    if (!data.length || !hasCoords) return []
    return [
      {
        x: data.map((d) => d.lon ?? 0),
        y: data.map((d) => d.lat ?? 0),
        z: data.map((d) => d.score ?? 0),
        text: data.map((d) => d.name ?? ''),
        type: 'heatmap',
        colorscale: 'YlOrRd',
      },
    ]
  }, [data, hasCoords])

  if (!data.length) return <p className="text-sm text-slate-600">Нет данных. Обновите аналитику.</p>

  return (
    <div className="space-y-3">
      {heatmapData.length ? (
        <PlotlyChart data={heatmapData} layout={{ margin: { l: 40, r: 10, b: 40, t: 10 } }} height={260} />
      ) : (
        <p className="text-sm text-slate-600">Недостаточно координат для тепловой карты.</p>
      )}
      <div className="rounded-xl border border-slate-200 p-3 text-sm text-slate-700 max-h-40 overflow-auto space-y-2">
        {data.slice(0, 8).map((item, idx) => (
          <div key={`${item.name ?? 'anomaly'}-${idx}`} className="flex justify-between gap-2">
            <span className="truncate">{item.name ?? 'Объект'}</span>
            <span className="text-xs text-slate-500">{(item.score ?? 0).toFixed(3)}</span>
          </div>
        ))}
        {data.length > 8 && <div className="text-xs text-slate-500">и ещё {data.length - 8}...</div>}
      </div>
    </div>
  )
}

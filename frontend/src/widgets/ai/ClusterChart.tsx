import { useMemo, useState } from 'react'
import { type ClusterPoint } from '@entities/ai/types'
import { PlotlyChart } from './PlotlyChart'

type Props = {
  data: ClusterPoint[]
}

const COLOR_PALETTE = ['#7c3aed', '#f97316', '#10b981', '#ef4444', '#0ea5e9', '#d946ef']

const severityLabel = (risk: number) => {
  if (risk >= 0.7) return { label: 'Критический риск', tone: 'text-rose-600 bg-rose-100' }
  if (risk >= 0.4) return { label: 'Повышенный риск', tone: 'text-amber-600 bg-amber-100' }
  return { label: 'Стабильно', tone: 'text-emerald-600 bg-emerald-100' }
}

export const ClusterChart = ({ data }: Props) => {
  const [mode3d, setMode3d] = useState(false)
  if (!data.length) return <p className="text-sm text-slate-600">Нет данных. Обновите аналитику.</p>

  const hasCoords = data.some((point) => Number.isFinite(point.lat) && Number.isFinite(point.lon))

  const clusterSummary = useMemo(() => {
    const map = new Map<number, { cluster: number; count: number; avgRisk: number; avgCondition: number }>()
    data.forEach((point) => {
      const key = Number(point.cluster ?? 0)
      const prev = map.get(key) ?? { cluster: key, count: 0, avgRisk: 0, avgCondition: 0 }
      const nextCount = prev.count + 1
      map.set(key, {
        cluster: key,
        count: nextCount,
        avgRisk: ((prev.avgRisk * prev.count + Number(point.risk_score ?? 0)) / nextCount) || 0,
        avgCondition: ((prev.avgCondition * prev.count + Number(point.condition ?? 0)) / nextCount) || 0,
      })
    })
    return Array.from(map.values()).sort((a, b) => a.cluster - b.cluster)
  }, [data])

  const plotData = useMemo(() => {
    if (!hasCoords) return []
    const colors = data.map((d) => COLOR_PALETTE[(Number(d.cluster ?? 0)) % COLOR_PALETTE.length])
    return [
      {
        x: data.map((d) => d.lon ?? 0),
        y: data.map((d) => d.lat ?? 0),
        z: mode3d ? data.map((d) => d.risk_score ?? d.priority_score ?? 0) : undefined,
        text: data.map((d) => `${d.name ?? 'Объект'}<br>Риск: ${(d.risk_score ?? 0).toFixed(2)}`),
        hoverinfo: 'text',
        mode: 'markers',
        marker: { size: 7, color: colors, opacity: 0.9 },
        type: mode3d ? 'scatter3d' : 'scatter',
      },
    ]
  }, [data, mode3d, hasCoords])

  const layout = useMemo(
    () => ({
      margin: { l: 30, r: 10, b: 30, t: 10 },
      scene: {
        xaxis: { title: 'Lon' },
        yaxis: { title: 'Lat' },
        zaxis: { title: 'Риск/приоритет' },
      },
      xaxis: { title: 'Lon' },
      yaxis: { title: 'Lat' },
    }),
    [],
  )

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <button
          className="px-3 py-2 text-xs rounded-lg bg-slate-100 hover:bg-slate-200 transition"
          onClick={() => setMode3d((v) => !v)}
          disabled={!hasCoords}
        >
          Переключить {mode3d ? '2D' : '3D'}
        </button>
        {!hasCoords && <span className="text-xs text-slate-500">Нет координат для визуализации</span>}
      </div>
      {hasCoords ? (
        <PlotlyChart data={plotData} layout={layout} onWebglError={() => setMode3d(false)} height={340} />
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-slate-600">
          Для графика нужны координаты lat/lon в CSV.
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {clusterSummary.map((item) => {
          const severity = severityLabel(item.avgRisk)
          return (
            <div key={item.cluster} className="rounded-2xl border border-slate-200 p-4 bg-white shadow-sm">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>Кластер {item.cluster + 1}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${severity.tone}`}>{severity.label}</span>
              </div>
              <p className="text-2xl font-semibold text-slate-900 mb-1">{item.count} объектов</p>
              <p className="text-sm text-slate-600">
                Риск {item.avgRisk.toFixed(2)} • Состояние {item.avgCondition.toFixed(1)}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

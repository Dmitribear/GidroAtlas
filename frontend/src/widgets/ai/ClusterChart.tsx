import { useMemo, useState, useEffect } from 'react'
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
  const [selectedCluster, setSelectedCluster] = useState<number | null>(null)
  if (!data.length) return <p className="text-sm text-slate-600">Нет данных. Обновите аналитику.</p>

  const hasCoords = data.some((point) => Number.isFinite(point.lat) && Number.isFinite(point.lon))

  const clusterSummary = useMemo(() => {
    // Кластер 0: Все объекты
    const allData = data
    const allRisk = allData.reduce((sum, p) => sum + (p.risk_score ?? 0), 0) / allData.length || 0
    const allCondition = allData.reduce((sum, p) => sum + (p.condition ?? 0), 0) / allData.length || 0

    // Кластер 1: Повышенный риск (risk >= 0.4)
    const highRisk = data.filter((p) => (p.risk_score ?? 0) >= 0.4)
    const highRiskAvg = highRisk.reduce((sum, p) => sum + (p.risk_score ?? 0), 0) / highRisk.length || 0
    const highRiskCondition = highRisk.reduce((sum, p) => sum + (p.condition ?? 0), 0) / highRisk.length || 0

    // Кластер 2: Стабильные (0.1 <= risk < 0.4)
    const stable = data.filter((p) => {
      const risk = p.risk_score ?? 0
      return risk >= 0.1 && risk < 0.4
    })
    const stableAvg = stable.reduce((sum, p) => sum + (p.risk_score ?? 0), 0) / stable.length || 0
    const stableCondition = stable.reduce((sum, p) => sum + (p.condition ?? 0), 0) / stable.length || 0

    // Кластер 3: Пониженный риск (risk < 0.1)
    const lowRisk = data.filter((p) => (p.risk_score ?? 0) < 0.1)
    const lowRiskAvg = lowRisk.reduce((sum, p) => sum + (p.risk_score ?? 0), 0) / lowRisk.length || 0
    const lowRiskCondition = lowRisk.reduce((sum, p) => sum + (p.condition ?? 0), 0) / lowRisk.length || 0

    return [
      { cluster: 0, count: allData.length, avgRisk: allRisk, avgCondition: allCondition, label: 'Все объекты' },
      { cluster: 1, count: highRisk.length, avgRisk: highRiskAvg, avgCondition: highRiskCondition, label: 'Повышенный риск' },
      { cluster: 2, count: stable.length, avgRisk: stableAvg, avgCondition: stableCondition, label: 'Стабильные' },
      { cluster: 3, count: lowRisk.length, avgRisk: lowRiskAvg, avgCondition: lowRiskCondition, label: 'Пониженный риск' },
    ]
  }, [data])

  // Инициализация выбранного кластера при первом рендере
  useEffect(() => {
    if (selectedCluster === null && clusterSummary.length > 0) {
      setSelectedCluster(0) // По умолчанию выбираем "Все объекты"
    }
  }, [clusterSummary, selectedCluster])

  const filteredData = useMemo(() => {
    if (selectedCluster === null) return data
    if (selectedCluster === 0) return data // Все объекты
    if (selectedCluster === 1) return data.filter((p) => (p.risk_score ?? 0) >= 0.4) // Повышенный риск
    if (selectedCluster === 2) {
      return data.filter((p) => {
        const risk = p.risk_score ?? 0
        return risk >= 0.1 && risk < 0.4
      }) // Стабильные
    }
    if (selectedCluster === 3) return data.filter((p) => (p.risk_score ?? 0) < 0.1) // Пониженный риск
    return data
  }, [data, selectedCluster])

  const plotData = useMemo(() => {
    if (!hasCoords) return []
    // Определяем цвет на основе уровня риска
    const colors = filteredData.map((d) => {
      const risk = d.risk_score ?? 0
      if (risk >= 0.4) return COLOR_PALETTE[1] // Оранжевый для повышенного риска
      if (risk >= 0.1) return COLOR_PALETTE[2] // Зеленый для стабильных
      return COLOR_PALETTE[0] // Фиолетовый для пониженного риска
    })
    return [
      {
        x: filteredData.map((d) => d.lon ?? 0),
        y: filteredData.map((d) => d.lat ?? 0),
        z: mode3d ? filteredData.map((d) => d.risk_score ?? d.priority_score ?? 0) : undefined,
        text: filteredData.map((d) => `${d.name ?? 'Объект'}<br>Риск: ${(d.risk_score ?? 0).toFixed(2)}`),
        hoverinfo: 'text',
        mode: 'markers',
        marker: { size: 7, color: colors, opacity: 0.9 },
        type: mode3d ? 'scatter3d' : 'scatter',
      },
    ]
  }, [filteredData, mode3d, hasCoords])

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
      <div className="flex justify-between items-center gap-2">
        <div className="flex gap-2 flex-wrap">
          {clusterSummary.map((item) => (
            <button
              key={item.cluster}
              className={`px-3 py-2 text-xs rounded-lg transition ${
                selectedCluster === item.cluster
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
              onClick={() => setSelectedCluster(item.cluster)}
            >
              {item.cluster === 0 ? 'Все объекты' : `Кластер ${item.cluster + 1}`}
            </button>
          ))}
        </div>
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
          const isSelected = selectedCluster === item.cluster
          return (
            <div
              key={item.cluster}
              className={`rounded-2xl border p-4 shadow-sm transition ${
                isSelected ? 'border-slate-800 bg-slate-50' : 'border-slate-200 bg-white'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>{item.cluster === 0 ? 'Все объекты' : `Кластер ${item.cluster + 1}`}</span>
                {item.cluster !== 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${severity.tone}`}>{severity.label}</span>
                )}
              </div>
              <p className="text-2xl font-semibold text-slate-900 mb-1">{item.count} объектов</p>
              {item.count > 0 && (
                <p className="text-sm text-slate-600">
                  Риск {item.avgRisk.toFixed(2)} • Состояние {item.avgCondition.toFixed(1)}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

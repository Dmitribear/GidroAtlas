import { useMemo, useState } from 'react'
import { type AnomalyPoint, type AnomalyStats } from '@entities/ai/types'
import { PlotlyChart } from './PlotlyChart'

type Props = {
  data: AnomalyPoint[]
  stats?: AnomalyStats | null
}

type SortOrder = 'dangerous' | 'safe'

const severityBadge = (score: number) => {
  if (score >= 0.02) return { tone: 'bg-rose-100 text-rose-600', label: 'Требует внимания' }
  if (score >= 0.01) return { tone: 'bg-amber-100 text-amber-600', label: 'Под наблюдением' }
  return { tone: 'bg-emerald-100 text-emerald-600', label: 'Норма' }
}

export const AnomalyHeatmap = ({ data, stats }: Props) => {
  const [sortOrder, setSortOrder] = useState<SortOrder>('dangerous')
  const [scrollPosition, setScrollPosition] = useState(0)
  const hasCoords = data.some((d) => Number.isFinite(d.lat) && Number.isFinite(d.lon))

  const sortedData = useMemo(() => {
    const sorted = [...data].sort((a, b) => {
      const scoreA = a.score ?? 0
      const scoreB = b.score ?? 0
      return sortOrder === 'dangerous' ? scoreB - scoreA : scoreA - scoreB
    })
    return sorted
  }, [data, sortOrder])

  const chart = useMemo(() => {
    if (!sortedData.length) return { traces: [], layout: {} }
    if (hasCoords) {
      return {
        traces: [
          {
            x: sortedData.map((d) => d.lon ?? 0),
            y: sortedData.map((d) => d.lat ?? 0),
            z: sortedData.map((d) => d.score ?? 0),
            text: sortedData.map((d) => `${d.name ?? 'Объект'}<br>Скор: ${(d.score ?? 0).toFixed(3)}`),
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
          x: sortedData.map((d) => d.score ?? 0),
          y: sortedData.map((d) => d.name ?? 'Объект'),
          type: 'bar',
          marker: { color: sortedData.map((d) => d.score ?? 0), colorscale: 'YlOrRd' },
          orientation: 'h',
          text: sortedData.map((d) => (d.score ?? 0).toFixed(3)),
          textposition: 'outside',
        },
      ],
      layout: { margin: { l: 120, r: 10, b: 30, t: 10 }, height: Math.max(200, sortedData.length * 40) },
    }
  }, [sortedData, hasCoords])

  if (!data.length) return <p className="text-sm text-slate-600">Нет данных. Обновите аналитику.</p>

  const ITEMS_PER_PAGE = 6
  const visibleItems = sortedData.slice(scrollPosition, scrollPosition + ITEMS_PER_PAGE)
  const maxScroll = Math.max(0, sortedData.length - ITEMS_PER_PAGE)

  const handleScroll = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setScrollPosition((prev) => Math.max(0, prev - ITEMS_PER_PAGE))
    } else {
      setScrollPosition((prev) => Math.min(maxScroll, prev + ITEMS_PER_PAGE))
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-center">
        <button
          className={`px-3 py-1.5 text-xs rounded-lg transition ${
            sortOrder === 'dangerous'
              ? 'bg-rose-100 text-rose-700 font-semibold'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
          onClick={() => {
            setSortOrder('dangerous')
            setScrollPosition(0)
          }}
        >
          Самые опасные
        </button>
        <button
          className={`px-3 py-1.5 text-xs rounded-lg transition ${
            sortOrder === 'safe'
              ? 'bg-emerald-100 text-emerald-700 font-semibold'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
          onClick={() => {
            setSortOrder('safe')
            setScrollPosition(0)
          }}
        >
          Самые спокойные
        </button>
      </div>
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
        <div className="max-h-[400px] overflow-y-auto space-y-3 pr-2">
          {visibleItems.map((item, idx) => {
            const severity = severityBadge(item.score ?? 0)
            return (
              <div key={`${item.name ?? 'anomaly'}-${scrollPosition + idx}`} className="rounded-2xl border border-slate-200 p-3 bg-white shadow-sm">
                <div className="flex justify-between items-center text-xs text-slate-500 mb-1">
                  <span>{item.region ?? 'Регион не указан'}</span>
                  <span className={`px-2 py-0.5 rounded-full font-semibold ${severity.tone}`}>{severity.label}</span>
                </div>
                <p className="text-sm font-semibold text-slate-900">{item.name ?? 'Объект'}</p>
                <p className="text-xs text-slate-500">Скор: {(item.score ?? 0).toFixed(3)}</p>
              </div>
            )
          })}
        </div>
        {sortedData.length > ITEMS_PER_PAGE && (
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200">
            <button
              onClick={() => handleScroll('prev')}
              disabled={scrollPosition === 0}
              className="px-3 py-1.5 text-xs rounded-lg bg-slate-100 hover:bg-slate-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Назад
            </button>
            <span className="text-xs text-slate-500">
              {scrollPosition + 1}–{Math.min(scrollPosition + ITEMS_PER_PAGE, sortedData.length)} из {sortedData.length}
            </span>
            <button
              onClick={() => handleScroll('next')}
              disabled={scrollPosition >= maxScroll}
              className="px-3 py-1.5 text-xs rounded-lg bg-slate-100 hover:bg-slate-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Вперёд →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

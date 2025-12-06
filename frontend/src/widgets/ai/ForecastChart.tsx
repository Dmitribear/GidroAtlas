import { useMemo } from 'react'
import { type ForecastPoint } from '@entities/ai/types'
import { PlotlyChart } from './PlotlyChart'

type Props = {
  data: ForecastPoint[]
}

export const ForecastChart = ({ data }: Props) => {
  const traces = useMemo(() => {
    if (!data.length) return []
    const dates = data.map((d) => d.date)
    const values = data.map((d) => d.value)
    const lower = data.map((d) => d.lower ?? d.value)
    const upper = data.map((d) => d.upper ?? d.value)
    return [
      {
        x: dates,
        y: values,
        type: 'scatter',
        mode: 'lines+markers',
        name: 'Прогноз',
        line: { color: '#111827' },
        marker: { size: 6 },
      },
      {
        x: [...dates, ...dates.slice().reverse()],
        y: [...upper, ...lower.slice().reverse()],
        fill: 'toself',
        fillcolor: 'rgba(236,72,153,0.1)',
        line: { color: 'rgba(236,72,153,0.3)' },
        type: 'scatter',
        hoverinfo: 'skip',
        name: 'Доверительный интервал',
      },
    ]
  }, [data])

  if (!data.length) return <p className="text-sm text-slate-600">Данных пока нет. Обновите аналитику.</p>

  return <PlotlyChart data={traces} layout={{ margin: { l: 40, r: 10, b: 40, t: 10 } }} height={320} />
}

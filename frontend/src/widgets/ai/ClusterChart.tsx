import { useMemo, useState } from 'react'
import { type ClusterPoint } from '@entities/ai/types'
import { PlotlyChart } from './PlotlyChart'

type Props = {
  data: ClusterPoint[]
}

export const ClusterChart = ({ data }: Props) => {
  const [mode3d, setMode3d] = useState(false)

  const plotData = useMemo(() => {
    const x = data.map((d) => d.lon ?? 0)
    const y = data.map((d) => d.lat ?? 0)
    const z = data.map((d) => (mode3d ? d.risk_score ?? d.priority_score ?? 0 : null))
    const text = data.map((d) => d.name ?? '')
    const clusterColors = data.map((d) => d.cluster ?? 0)

    return [
      {
        x,
        y,
        z: mode3d ? z : undefined,
        text,
        mode: 'markers',
        marker: { size: 6, color: clusterColors, colorscale: 'Viridis' },
        type: mode3d ? 'scatter3d' : 'scatter',
      },
    ]
  }, [data, mode3d])

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
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <button
          className="px-3 py-2 text-xs rounded-lg bg-slate-100 hover:bg-slate-200 transition"
          onClick={() => setMode3d((v) => !v)}
        >
          Переключить {mode3d ? '2D' : '3D'}
        </button>
        <span className="text-xs text-slate-500">Plotly.react</span>
      </div>
      <PlotlyChart
        data={plotData}
        layout={layout}
        onWebglError={() => setMode3d(false)}
        height={340}
      />
    </div>
  )
}

import { useEffect, useRef } from 'react'
import Plotly from 'plotly.js-dist-min'

type PlotlyChartProps = {
  data: any[]
  layout?: any
  config?: any
  onWebglError?: () => void
  height?: number
}

export const PlotlyChart = ({ data, layout, config, onWebglError, height = 320 }: PlotlyChartProps) => {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!ref.current) return
    const target = ref.current
    const apply = async () => {
      try {
        await Plotly.react(target, data, { ...layout, autosize: true, height }, { displaylogo: false, responsive: true, ...config })
      } catch (err) {
        if (onWebglError) onWebglError()
      }
    }
    apply()
    const handleResize = () => {
      Plotly.Plots.resize(target)
    }
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      Plotly.purge(target)
    }
  }, [data, layout, config, height, onWebglError])

  return <div ref={ref} className="w-full" />
}

import { type ForecastPoint } from '@entities/ai/types'

type Props = {
  data: ForecastPoint[]
}

const formatLabel = (row: ForecastPoint) => {
  if (row.title) return row.title
  if (row.label) return row.label
  if (!row.date) return '—'
  if (row.date.includes('-')) {
    try {
      const date = new Date(`${row.date}-01`)
      return date.toLocaleDateString('ru-RU', { month: 'short', year: 'numeric' })
    } catch {
      return row.date
    }
  }
  return row.date
}

export const ForecastTable = ({ data }: Props) => {
  if (!data.length) return <p className="text-sm text-slate-600">Нет данных. Обновите аналитику.</p>
  return (
    <div className="overflow-auto rounded-xl border border-slate-200">
      <table className="min-w-full text-sm text-left text-slate-800">
        <thead className="bg-slate-50 text-xs uppercase text-slate-500">
          <tr>
            <th className="px-3 py-2 w-1/3">Горизонт</th>
            <th className="px-3 py-2">Риск</th>
            <th className="px-3 py-2">Нижняя</th>
            <th className="px-3 py-2">Верхняя</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={`${row.label ?? row.date}`} className="border-t border-slate-100">
              <td className="px-3 py-2">{formatLabel(row)}</td>
              <td className="px-3 py-2">{Number(row.value ?? 0).toFixed(3)}</td>
              <td className="px-3 py-2">{row.lower !== undefined ? Number(row.lower).toFixed(3) : '—'}</td>
              <td className="px-3 py-2">{row.upper !== undefined ? Number(row.upper).toFixed(3) : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

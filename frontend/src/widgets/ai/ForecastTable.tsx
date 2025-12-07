import { type ForecastPoint } from '@entities/ai/types'

type Props = {
  data: ForecastPoint[]
}

export const ForecastTable = ({ data }: Props) => {
  if (!data.length) return null
  return (
    <div className="overflow-auto rounded-xl border border-slate-200">
      <table className="min-w-full text-sm text-left text-slate-800">
        <thead className="bg-slate-50 text-xs uppercase text-slate-500">
          <tr>
            <th className="px-3 py-2">Дата</th>
            <th className="px-3 py-2">Прогноз</th>
            <th className="px-3 py-2">Нижняя</th>
            <th className="px-3 py-2">Верхняя</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.date} className="border-t border-slate-100">
              <td className="px-3 py-2">{row.date}</td>
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

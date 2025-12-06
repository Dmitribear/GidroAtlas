type Props = {
  data: Record<string, unknown> | null
}

export const SummaryList = ({ data }: Props) => {
  if (!data) return <p className="text-sm text-slate-600">Нажмите «Обновить аналитику», чтобы получить данные.</p>
  const entries = Object.entries(data)
  if (!entries.length) return <p className="text-sm text-slate-600">Пока нет значений.</p>

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {entries.map(([key, value]) => (
        <div key={key} className="rounded-xl border border-slate-200 px-3 py-2 bg-slate-50">
          <p className="text-xs uppercase tracking-wide text-slate-500">{key}</p>
          <p className="text-sm font-semibold text-slate-900">{String(value)}</p>
        </div>
      ))}
    </div>
  )
}

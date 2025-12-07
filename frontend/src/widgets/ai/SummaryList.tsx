const SUMMARY_META: Record<
  string,
  {
    label: string
    unit?: string
    digits?: number
  }
> = {
  total_objects: { label: 'Всего объектов' },
  avg_risk: { label: 'Средний риск', digits: 3 },
  critical_objects: { label: 'Критичные объекты' },
  avg_condition: { label: 'Среднее состояние', digits: 2 },
  avg_passport_age: { label: 'Средний возраст паспорта', unit: 'лет', digits: 1 },
  fauna_count: { label: 'Объектов с фауной' },
}

const SUMMARY_ORDER = Object.keys(SUMMARY_META)

type Props = {
  data: Record<string, unknown> | null
}

const formatValue = (key: string, value: unknown) => {
  const meta = SUMMARY_META[key]
  if (typeof value === 'number') {
    const digits = meta?.digits ?? (value % 1 === 0 ? 0 : 2)
    const formatted = value.toLocaleString('ru-RU', { maximumFractionDigits: digits, minimumFractionDigits: digits })
    return meta?.unit ? `${formatted} ${meta.unit}` : formatted
  }
  if (typeof value === 'string') {
    return meta?.unit ? `${value} ${meta.unit}` : value
  }
  return String(value ?? '—')
}

export const SummaryList = ({ data }: Props) => {
  if (!data) return <p className="text-sm text-slate-600">Нажмите «Обновить аналитику», чтобы получить данные.</p>
  const entries = Object.entries(data)
  if (!entries.length) return <p className="text-sm text-slate-600">Пока нет значений.</p>

  const sorted = entries.sort((a, b) => {
    const idxA = SUMMARY_ORDER.indexOf(a[0])
    const idxB = SUMMARY_ORDER.indexOf(b[0])
    if (idxA === -1 && idxB === -1) return a[0].localeCompare(b[0])
    if (idxA === -1) return 1
    if (idxB === -1) return -1
    return idxA - idxB
  })

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {sorted.map(([key, value]) => (
        <div key={key} className="rounded-2xl border border-slate-200 px-4 py-3 bg-white shadow-sm">
          <p className="text-[11px] uppercase tracking-wide text-slate-500">{SUMMARY_META[key]?.label ?? key}</p>
          <p className="text-xl font-semibold text-slate-900">{formatValue(key, value)}</p>
        </div>
      ))}
    </div>
  )
}

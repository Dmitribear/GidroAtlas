import { type PredictFormData, type ClusterPoint } from '@entities/ai/types'

type Props = {
  value: PredictFormData
  loading?: boolean
  onSubmit: (payload: PredictFormData) => void
  onRefreshAnalytics: () => void
  refreshDisabled?: boolean
  onChange: (next: PredictFormData) => void
  objects: ClusterPoint[]
}

const inputClass =
  'w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-fuchsia-400/40'

export const PredictForm = ({ value, loading, onSubmit, onRefreshAnalytics, refreshDisabled, onChange, objects }: Props) => {
  const handleSelect = (name: string) => {
    const found = objects.find((o) => o.name === name)
    if (!found) {
      onChange({ ...value, name })
      return
    }
    onChange({
      name: found.name ?? '',
      region: found.region ?? '',
      resource_type: String(found.resource_type ?? found.type ?? ''),
      water_type: String(found.water_type ?? ''),
      fauna: found.fauna === true || String(found.fauna ?? '').toLowerCase() === 'yes',
      passport_date: String(found.passport_date ?? value.passport_date ?? ''),
      condition: Number(found.condition ?? value.condition ?? 3),
      lat: Number(found.lat ?? value.lat ?? 0),
      lon: Number(found.lon ?? value.lon ?? 0),
    })
  }

  return (
    <form
      className="grid grid-cols-1 md:grid-cols-2 gap-4"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit(value)
      }}
    >
      <div className="md:col-span-2">
        <select
          className={inputClass}
          value={value.name}
          onChange={(e) => handleSelect(e.target.value)}
        >
          <option value="">Выберите объект из CSV</option>
          {objects.map((o) => (
            <option key={o.name ?? `${o.lat}-${o.lon}`} value={o.name ?? ''}>
              {o.name ?? 'Без названия'}
            </option>
          ))}
        </select>
      </div>
      <input className={inputClass} placeholder="Название" value={value.name} onChange={(e) => onChange({ ...value, name: e.target.value })} />
      <input className={inputClass} placeholder="Регион" value={value.region} onChange={(e) => onChange({ ...value, region: e.target.value })} />
      <input
        className={inputClass}
        placeholder="Тип ресурса"
        value={value.resource_type}
        onChange={(e) => onChange({ ...value, resource_type: e.target.value })}
      />
      <input
        className={inputClass}
        placeholder="Тип воды"
        value={value.water_type}
        onChange={(e) => onChange({ ...value, water_type: e.target.value })}
      />
      <input
        className={inputClass}
        placeholder="Дата паспорта"
        value={value.passport_date}
        onChange={(e) => onChange({ ...value, passport_date: e.target.value })}
      />
      <input
        className={inputClass}
        type="number"
        min={1}
        max={5}
        placeholder="Состояние 1-5"
        value={value.condition}
        onChange={(e) => onChange({ ...value, condition: Number(e.target.value) })}
      />
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={value.fauna}
          onChange={(e) => onChange({ ...value, fauna: e.target.checked })}
          className="h-4 w-4 rounded border-slate-300"
        />
        Наличие фауны
      </label>
      <div className="grid grid-cols-2 gap-3 md:col-span-2">
        <input
          className={inputClass}
          type="number"
          step="0.0001"
          placeholder="Широта"
          value={value.lat}
          onChange={(e) => onChange({ ...value, lat: Number(e.target.value) })}
        />
        <input
          className={inputClass}
          type="number"
          step="0.0001"
          placeholder="Долгота"
          value={value.lon}
          onChange={(e) => onChange({ ...value, lon: Number(e.target.value) })}
        />
      </div>
      <div className="md:col-span-2 flex gap-3">
        <button
          type="submit"
          className="px-4 py-3 rounded-xl bg-black text-white text-sm font-semibold hover:scale-[1.01] transition-transform disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Считаем...' : 'Получить риск'}
        </button>
        <button
          type="button"
          onClick={onRefreshAnalytics}
          className="px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors"
          disabled={refreshDisabled}
        >
          Обновить аналитику
        </button>
      </div>
    </form>
  )
}

import { type ClusterPoint } from '@entities/ai/types'

type Props = {
  uploading: boolean
  message?: string | null
  error?: string | null
  onUpload: (file: File | null) => void
  objects?: ClusterPoint[]
  plots: { risk: string; clusters: string }
}

export const DatasetUpload = ({ uploading, message, error, onUpload, objects = [], plots }: Props) => {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-fuchsia-500">Dataset</p>
        <h2 className="text-xl font-semibold">Загрузка CSV</h2>
        <p className="text-sm text-slate-600">
          Файл должен содержать столбцы: name, region, resource_type, water_type, fauna, passport_date, {`technical_condition/condition`}, latitude, longitude.
        </p>
      </div>
      <input
        type="file"
        accept=".csv,text/csv"
        onChange={(e) => onUpload(e.target.files?.[0] ?? null)}
        className="block w-full text-sm text-slate-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-fuchsia-50 file:text-fuchsia-700 hover:file:bg-fuchsia-100 cursor-pointer"
      />
      {message && <div className="text-sm text-emerald-600">{message}</div>}
      {error && <div className="text-sm text-red-600">{error}</div>}
      {uploading && <div className="text-sm text-slate-600">Загружаем...</div>}

      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-fuchsia-500">Доступные объекты</p>
        {objects.length ? (
          <div className="max-h-40 overflow-auto rounded-xl border border-slate-200 p-3 text-sm text-slate-700 space-y-1">
            {objects.slice(0, 12).map((obj, idx) => (
              <div key={`${obj.name ?? 'obj'}-${idx}`} className="flex justify-between gap-2">
                <span className="truncate">{obj.name ?? 'Без названия'}</span>
                <span className="text-slate-500 text-xs">кластер {obj.cluster ?? '—'}</span>
              </div>
            ))}
            {objects.length > 12 && <div className="text-xs text-slate-500">и ещё {objects.length - 12}...</div>}
          </div>
        ) : (
          <p className="text-sm text-slate-600">Пока нет объектов. Загрузите CSV.</p>
        )}
      </div>

      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.2em] text-fuchsia-500">Плоты</p>
        <div className="space-y-3">
          <img src={plots.risk} alt="Распределение риска" className="w-full rounded-xl border border-slate-200" />
          <img src={plots.clusters} alt="Карта кластеров" className="w-full rounded-xl border border-slate-200" />
        </div>
      </div>
    </div>
  )
}

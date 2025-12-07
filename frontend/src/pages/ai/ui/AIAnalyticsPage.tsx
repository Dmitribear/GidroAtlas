import { useEffect, useMemo, useState } from 'react'
import { Navbar } from '@widgets/landing/Navbar'
import { LoginModal } from '@widgets/landing/LoginModal'
import { RegisterModal } from '@widgets/landing/RegisterModal'
import { API_ROOT, getJson, postJson } from '@shared/api/http'
import { Card } from '@shared/ui/Card'
import { PredictForm } from '@features/ai/predict-form/ui/PredictForm'
import { DatasetUpload } from '@features/ai/dataset-upload/ui/DatasetUpload'
import { SummaryList } from '@widgets/ai/SummaryList'
import { ClusterChart } from '@widgets/ai/ClusterChart'
import { ForecastChart } from '@widgets/ai/ForecastChart'
import { ForecastTable } from '@widgets/ai/ForecastTable'
import { AnomalyHeatmap } from '@widgets/ai/AnomalyHeatmap'
import { PredictResultCard } from '@widgets/ai/PredictResultCard'
import { CORE_NAV_ITEMS } from '@shared/config/navigation'
import {
  type AnomalyPoint,
  type AnomalyStats,
  type ClusterPoint,
  type ForecastPoint,
  type PredictFormData,
  type PredictionResult,
} from '@entities/ai/types'

const initialForm: PredictFormData = {
  name: 'Object-101',
  region: 'Region-1',
  resource_type: 'river',
  water_type: 'fresh',
  fauna: true,
  passport_date: '2012-03-04',
  condition: 3,
  lat: 57.221,
  lon: 39.118,
}

export const AIAnalyticsPage = () => {
  const [showLogin, setShowLogin] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const [userLogin, setUserLogin] = useState<string | null>(localStorage.getItem('user_login'))

  const [prediction, setPrediction] = useState<PredictionResult | null>(null)
  const [summary, setSummary] = useState<Record<string, unknown> | null>(null)
  const [clusters, setClusters] = useState<ClusterPoint[]>([])
  const [forecast, setForecast] = useState<ForecastPoint[]>([])
  const [anomalies, setAnomalies] = useState<AnomalyPoint[]>([])
  const [anomalyStats, setAnomalyStats] = useState<AnomalyStats | null>(null)
  const [objects, setObjects] = useState<ClusterPoint[]>([])
  const [uploadMessage, setUploadMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<PredictFormData>(initialForm)
  const [horizon, setHorizon] = useState<'3_months' | '6_months' | '12_months' | '60_months'>('3_months')
  const [busy, setBusy] = useState<{ predict: boolean; analytics: boolean; upload: boolean }>({
    predict: false,
    analytics: false,
    upload: false,
  })

  const plots = useMemo(
    () => ({
      risk: `${API_ROOT}/plots/risk_distribution`,
      clusters: `${API_ROOT}/plots/cluster_map`,
    }),
    [],
  )

  const horizonProbability = useMemo(() => {
    const preds = prediction?.sorted_predictions
    if (preds) {
      if (preds[horizon] !== undefined) return Number(preds[horizon])
      if (horizon === '60_months' && preds['24_months'] !== undefined) return Number(preds['24_months'])
    }
    const forecastMatch = forecast.find((point) => point.label === horizon || point.title === horizon)
    if (forecastMatch) return Number(forecastMatch.value ?? 0)
    if (forecast.length) {
      const last = forecast[forecast.length - 1]
      return Number(last.value ?? 0)
    }
    return null
  }, [prediction, horizon, forecast])

  const handleAuthSuccess = (token: string, login: string) => {
    localStorage.setItem('access_token', token)
    localStorage.setItem('user_login', login)
    setUserLogin(login)
    setShowLogin(false)
    setShowRegister(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user_login')
    setUserLogin(null)
  }

  const handlePredict = async (payload: PredictFormData) => {
    setBusy((b) => ({ ...b, predict: true }))
    setError(null)
    const res = await postJson<PredictionResult>('/ai/predict', {
      ...payload,
      coordinates: { lat: Number(payload.lat), lon: Number(payload.lon) },
    })
    if ('data' in res) {
      setPrediction(res.data)
    } else {
      setError(res.error)
    }
    setBusy((b) => ({ ...b, predict: false }))
  }

  const normalizeForecast = (raw: any): ForecastPoint[] => {
    if (!raw) return []
    if (Array.isArray(raw)) {
      return raw
        .map((item) => ({
          date: item.date ?? item.timestamp ?? String(item[0] ?? ''),
          value: Number(item.value ?? item.prediction ?? item[1] ?? 0),
          lower: item.lower ?? item.lower_conf ?? item.lower_bound,
          upper: item.upper ?? item.upper_conf ?? item.upper_bound,
          label: item.label,
          title: item.title,
          horizon_months: item.horizon_months,
        }))
        .filter((d) => d.date)
    }
    if (raw.series && Array.isArray(raw.series)) {
      return raw.series
        .map((item: any) => ({
          date: item.date ?? item.title ?? item.label ?? '',
          value: Number(item.value ?? 0),
          lower: item.lower,
          upper: item.upper,
          label: item.label,
          title: item.title,
          horizon_months: item.horizon_months,
        }))
        .filter((d: ForecastPoint) => d.date)
    }
    if (typeof raw === 'object') {
      return Object.entries(raw)
        .map(([key, value]) => ({
          date: key,
          label: key,
          value: Number(value ?? 0),
        }))
        .filter((d) => d.date)
    }
    return []
  }

  const loadAnalytics = async () => {
    setBusy((b) => ({ ...b, analytics: true }))
    setError(null)
    const [summaryRes, clustersRes, forecastRes, anomaliesRes, objectsRes, anomalyStatsRes] = await Promise.all([
      getJson<Record<string, unknown>>('/ai/summary'),
      getJson<ClusterPoint[]>('/ai/clusters'),
      getJson<any>('/ai/forecast'),
      getJson<AnomalyPoint[]>('/ai/anomalies'),
      getJson<ClusterPoint[]>('/ai/objects'),
      getJson<AnomalyStats>('/ai/anomalies/stats'),
    ])

    if ('data' in summaryRes) setSummary(summaryRes.data)
    if ('data' in clustersRes) setClusters(clustersRes.data)
    if ('data' in forecastRes) setForecast(normalizeForecast(forecastRes.data))
    if ('data' in anomaliesRes) setAnomalies(anomaliesRes.data)
    if ('data' in objectsRes) setObjects(objectsRes.data)
    if ('data' in anomalyStatsRes) setAnomalyStats(anomalyStatsRes.data)

    const firstError =
      ('error' in summaryRes && summaryRes.error) ||
      ('error' in clustersRes && clustersRes.error) ||
      ('error' in forecastRes && forecastRes.error) ||
      ('error' in anomaliesRes && anomaliesRes.error) ||
      ('error' in objectsRes && objectsRes.error) ||
      ('error' in anomalyStatsRes && anomalyStatsRes.error)
    if (firstError) setError(firstError)
    setBusy((b) => ({ ...b, analytics: false }))
  }

  const handleUpload = async (file: File | null) => {
    if (!file) return
    setBusy((b) => ({ ...b, upload: true }))
    setUploadMessage(null)
    setError(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch(`${API_ROOT}/datasets/upload`, {
        method: 'POST',
        body: formData,
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(json?.detail || res.statusText || 'Upload failed')
      } else {
        setUploadMessage(`Датасет обновлён (${json.rows ?? 'неизвестно'} строк).`)
        await loadAnalytics()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error')
    } finally {
      setBusy((b) => ({ ...b, upload: false }))
    }
  }

  useEffect(() => {
    loadAnalytics().catch(() => {})
  }, [])

  useEffect(() => {
    if (objects.length && (!form.name || form.name === initialForm.name)) {
      const first = objects[0]
      setForm({
        name: first.name ?? '',
        region: first.region ?? '',
        resource_type: String(first.resource_type ?? first.type ?? ''),
        water_type: String(first.water_type ?? ''),
        fauna: first.fauna === true || String(first.fauna ?? '').toLowerCase() === 'yes',
        passport_date: String(first.passport_date ?? initialForm.passport_date),
        condition: Number(first.condition ?? initialForm.condition),
        lat: Number(first.lat ?? initialForm.lat),
        lon: Number(first.lon ?? initialForm.lon),
      })
    }
  }, [objects])

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100 text-slate-900">
      <Navbar
        onLoginClick={() => setShowLogin(true)}
        userLogin={userLogin}
        onLogout={handleLogout}
        onProfile={() => (window.location.href = '/profile')}
        navItems={CORE_NAV_ITEMS}
      />

      <main className="pt-28 pb-16 px-6">
        <div className="max-w-6xl mx-auto space-y-8">
          <Card
            subtitle="AI аналитика"
            title="Риск, кластеры, прогнозы в одном месте"
            rightMeta={
              <button
                onClick={loadAnalytics}
                className="px-5 py-3 rounded-full bg-black text-white text-sm font-semibold hover:scale-[1.02] transition-transform disabled:opacity-50"
                disabled={busy.analytics}
              >
                {busy.analytics ? 'Обновляем...' : 'Обновить аналитику'}
              </button>
            }
          >
            <p className="text-lg text-slate-600 max-w-3xl">
              Заполните паспорт объекта, получите риск и приоритет, загрузите свой CSV для переобучения модели и смотрите сводку, кластеры,
              прогноз и аномалии из AI-бэкенда.
            </p>
          </Card>

          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card subtitle="Predict" title="Скоринг объекта" rightMeta={<span className="text-xs text-slate-500">POST /ai/predict</span>} className="lg:col-span-2">
              <PredictForm
                value={form}
                onChange={setForm}
                loading={busy.predict}
                onSubmit={handlePredict}
                onRefreshAnalytics={loadAnalytics}
                refreshDisabled={busy.analytics}
                objects={objects}
              />
              {prediction && (
                <div className="mt-4">
                  <PredictResultCard result={prediction} />
                </div>
              )}
            </Card>

            <Card subtitle="Dataset" title="Загрузка CSV">
              <DatasetUpload uploading={busy.upload} message={uploadMessage} error={error} onUpload={handleUpload} objects={objects} plots={plots} />
            </Card>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card title="Сводка" subtitle="GET /ai/summary">
              <SummaryList data={summary} />
            </Card>
            <Card title="Прогноз" subtitle="GET /ai/forecast">
              <div className="flex items-center gap-2 mb-3">
                {[
                  { key: '3_months', label: '3 мес.' },
                  { key: '6_months', label: '6 мес.' },
                  { key: '12_months', label: '1 год' },
                  { key: '60_months', label: '5 лет' },
                ].map((h) => (
                  <button
                    key={h.key}
                    onClick={() => setHorizon(h.key as typeof horizon)}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold border transition ${
                      horizon === h.key ? 'bg-fuchsia-100 border-fuchsia-300 text-fuchsia-700' : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    {h.label}
                  </button>
                ))}
                {horizonProbability !== null && (
                  <span className="text-xs text-slate-600">Вероятность внимания: {horizonProbability.toFixed(3)}</span>
                )}
              </div>
              <ForecastTable data={forecast} />
              <div className="mt-4">
                <ForecastChart data={forecast} />
              </div>
            </Card>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card title="Кластеры" subtitle="GET /ai/clusters">
              {clusters.length ? <ClusterChart data={clusters} /> : <p className="text-sm text-slate-600">Нет данных. Обновите аналитику.</p>}
            </Card>
            <Card title="Аномалии" subtitle="GET /ai/anomalies">
              <AnomalyHeatmap data={anomalies} stats={anomalyStats} />
            </Card>
          </section>

          {error && <div className="max-w-6xl mx-auto text-sm text-red-600">{error}</div>}
        </div>
      </main>

      <LoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onOpenRegister={() => {
          setShowLogin(false)
          setShowRegister(true)
        }}
        onAuthSuccess={handleAuthSuccess}
      />

      <RegisterModal
        isOpen={showRegister}
        onClose={() => setShowRegister(false)}
        onSwitchToLogin={() => {
          setShowRegister(false)
          setShowLogin(true)
        }}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  )
}

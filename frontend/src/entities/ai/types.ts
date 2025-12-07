export type PredictFormData = {
  name: string
  region: string
  resource_type: string
  water_type: string
  fauna: boolean
  passport_date: string
  condition: number
  lat: number
  lon: number
}

export type PredictionResult = {
  risk_score?: number
  priority_score?: number
  recommendation?: string
  sorted_predictions?: Record<string, number>
  [key: string]: unknown
}

export type SummaryPayload = Record<string, unknown>

export type ClusterPoint = {
  name?: string
  region?: string
  cluster?: number
  lat?: number
  lon?: number
  risk_score?: number
  priority_score?: number
  [key: string]: unknown
}

export type ForecastPoint = {
  date: string
  value: number
  lower?: number
  upper?: number
}

export type AnomalyPoint = {
  name?: string
  region?: string
  score?: number
  lat?: number
  lon?: number
  [key: string]: unknown
}

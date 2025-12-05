import { getJson } from '@shared/api/http'
import type { Filters, SortOption, WaterObject } from './types'
import { normalizeRegionName } from './constants'

type ApiWaterObject = {
  id: string
  name: string
  region: string
  resource_type: string
  water_type: string
  fauna: boolean
  passport_date: string
  technical_condition: number
  latitude: number
  longitude: number
  pdf_url?: string | null
  priority?: number | null
}

const WATER_TYPE_TO_API: Record<string, string> = { fresh: 'fresh', saline: 'non_fresh' }
const WATER_TYPE_FROM_API: Record<string, 'fresh' | 'saline'> = { fresh: 'fresh', non_fresh: 'saline' }
const PRIORITY_TO_API: Record<string, number> = { high: 3, medium: 2, low: 1 }
const PRIORITY_FROM_API: Record<number, 'high' | 'medium' | 'low'> = { 3: 'high', 2: 'medium', 1: 'low' }

function mapSort(sortBy: SortOption) {
  if (sortBy === 'dangerous') return { sort_by: 'technical_condition', sort_dir: 'desc' }
  if (sortBy === 'safe') return { sort_by: 'technical_condition', sort_dir: 'asc' }
  if (sortBy === 'oldest') return { sort_by: 'passport_date', sort_dir: 'asc' }
  if (sortBy === 'newest') return { sort_by: 'passport_date', sort_dir: 'desc' }
  return { sort_by: 'priority', sort_dir: 'desc' }
}

function mapApiObject(item: ApiWaterObject): WaterObject {
  const priorityValue = item.priority ?? null
  const priority =
    priorityValue && PRIORITY_FROM_API[priorityValue as keyof typeof PRIORITY_FROM_API]
      ? PRIORITY_FROM_API[priorityValue as keyof typeof PRIORITY_FROM_API]
      : 'low'

  return {
    id: item.id,
    name: item.name,
    region: normalizeRegionName(item.region),
    resourceType: item.resource_type as WaterObject['resourceType'],
    waterType: WATER_TYPE_FROM_API[item.water_type as keyof typeof WATER_TYPE_FROM_API] ?? 'fresh',
    hasFauna: item.fauna,
    passportDate: item.passport_date,
    condition: Number(item.technical_condition) as WaterObject['condition'],
    priority,
    coordinates: { lat: Number(item.latitude), lng: Number(item.longitude) },
    position: { x: 0, y: 0 },
    image: '/placeholder.svg',
    pdfUrl: item.pdf_url || undefined,
  }
}

export async function fetchWaterObjects(
  filters: Filters,
  sortBy: SortOption,
  token?: string | null,
  page = 0,
  pageSize = 50,
): Promise<{ data: WaterObject[]; hasMore: boolean; error?: string }> {
  const params = new URLSearchParams()
  params.set('limit', String(pageSize + 1)) // на один больше, чтобы понять наличие следующей страницы
  params.set('offset', String(page * pageSize))

  if (filters.region) params.set('region', filters.region)
  if (filters.resourceType) params.set('resource_type', filters.resourceType)
  if (filters.waterType) params.set('water_type', WATER_TYPE_TO_API[filters.waterType] ?? filters.waterType)
  if (filters.hasFauna !== null) params.set('fauna', filters.hasFauna ? 'true' : 'false')
  if (filters.condition !== null) params.set('technical_condition', String(filters.condition))
  if (filters.criticalOnly) params.set('condition_min', '4')
  if (filters.priority) {
    const mapped = PRIORITY_TO_API[filters.priority]
    if (mapped) params.set('priority', String(mapped))
  }
  if (filters.passportDateFrom) params.set('passport_date_from', filters.passportDateFrom)
  if (filters.passportDateTo) params.set('passport_date_to', filters.passportDateTo)

  const sortParams = mapSort(sortBy)
  params.set('sort_by', sortParams.sort_by)
  params.set('sort_dir', sortParams.sort_dir)

  const response = await getJson<ApiWaterObject[]>(`/water-objects?${params.toString()}`, token || undefined)
  if ('error' in response) {
    return { data: [], hasMore: false, error: response.error }
  }

  const mapped = (response.data || []).map(mapApiObject)
  const hasMore = mapped.length > pageSize
  const data = hasMore ? mapped.slice(0, pageSize) : mapped
  return { data, hasMore }
}

export async function importCsvToWaterObjects(
  file: File,
  token?: string | null,
): Promise<{ inserted: number; skipped: number; items: WaterObject[]; error?: string }> {
  const formData = new FormData()
  formData.append('file', file)

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000'
  const API_BASE_PATH = import.meta.env.VITE_API_BASE_PATH ?? '/api/v1'
  const url = `${API_BASE_URL}${API_BASE_PATH}/water-objects/import-csv`

  const res = await fetch(url, {
    method: 'POST',
    body: formData,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    return { inserted: 0, skipped: 0, items: [], error: text || res.statusText }
  }

  const json = await res.json()
  const items: WaterObject[] = Array.isArray(json.items) ? json.items.map(mapApiObject) : []
  return { inserted: json.inserted ?? items.length, skipped: json.skipped ?? 0, items }
}

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
  priority_category?: 'high' | 'medium' | 'low' | null
  priority_score?: number | null
  marker_color?: string | null
}

const WATER_TYPE_TO_API: Record<string, string> = { fresh: 'fresh', saline: 'non_fresh' }
const WATER_TYPE_FROM_API: Record<string, 'fresh' | 'saline'> = { fresh: 'fresh', non_fresh: 'saline' }
const PRIORITY_TO_API: Record<string, number> = { high: 3, medium: 2, low: 1 }
const PRIORITY_FROM_API: Record<number, 'high' | 'medium' | 'low'> = { 3: 'high', 2: 'medium', 1: 'low' }

function mapSort(sortBy: SortOption) {
  switch (sortBy) {
    case 'priority_desc':
      return { sort_by: 'priority', sort_dir: 'desc' }
    case 'priority_asc':
      return { sort_by: 'priority', sort_dir: 'asc' }
    case 'condition_desc':
      return { sort_by: 'technical_condition', sort_dir: 'desc' }
    case 'condition_asc':
      return { sort_by: 'technical_condition', sort_dir: 'asc' }
    case 'passport_date_desc':
      return { sort_by: 'passport_date', sort_dir: 'desc' }
    case 'passport_date_asc':
      return { sort_by: 'passport_date', sort_dir: 'asc' }
    case 'name_asc':
      return { sort_by: 'name', sort_dir: 'asc' }
    case 'name_desc':
      return { sort_by: 'name', sort_dir: 'desc' }
    case 'region_asc':
      return { sort_by: 'region', sort_dir: 'asc' }
    case 'region_desc':
      return { sort_by: 'region', sort_dir: 'desc' }
    case 'resource_type_asc':
      return { sort_by: 'resource_type', sort_dir: 'asc' }
    case 'resource_type_desc':
      return { sort_by: 'resource_type', sort_dir: 'desc' }
    case 'water_type_asc':
      return { sort_by: 'water_type', sort_dir: 'asc' }
    case 'water_type_desc':
      return { sort_by: 'water_type', sort_dir: 'desc' }
    case 'fauna_asc':
      return { sort_by: 'fauna', sort_dir: 'asc' }
    case 'fauna_desc':
      return { sort_by: 'fauna', sort_dir: 'desc' }
    default:
      return { sort_by: 'priority', sort_dir: 'desc' }
  }
}

function mapApiObject(item: ApiWaterObject): WaterObject {
  const priorityValue = item.priority ?? null
  const priorityCategoryRaw = typeof item.priority_category === 'string' ? item.priority_category.toLowerCase() : null
  const priorityFromCategory = ['high', 'medium', 'low'].includes(priorityCategoryRaw ?? '')
    ? (priorityCategoryRaw as WaterObject['priority'])
    : null
  const fallbackPriority =
    priorityValue && PRIORITY_FROM_API[priorityValue as keyof typeof PRIORITY_FROM_API]
      ? PRIORITY_FROM_API[priorityValue as keyof typeof PRIORITY_FROM_API]
      : 'low'
  const priority = priorityFromCategory ?? fallbackPriority

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
    priorityCategory: priorityFromCategory ?? priority,
    priorityScore: typeof item.priority_score === 'number' ? item.priority_score : undefined,
    markerColor: item.marker_color ?? undefined,
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
  const limitValue = Math.min(pageSize + 1, 200) // API ограничивает limit <= 200
  params.set('limit', String(limitValue))
  params.set('offset', String(page * pageSize))

  if (filters.region) params.set('region', filters.region)
  if (filters.resourceType) params.set('resource_type', filters.resourceType)
  if (filters.waterType) params.set('water_type', WATER_TYPE_TO_API[filters.waterType] ?? filters.waterType)
  if (filters.hasFauna !== null) params.set('fauna', filters.hasFauna ? 'true' : 'false')
  if (filters.condition.length === 1) params.set('technical_condition', String(filters.condition[0]))
  if (filters.criticalOnly) params.set('condition_min', '4')
  if (filters.priority) {
    const mapped = PRIORITY_TO_API[filters.priority]
    if (mapped) params.set('priority', String(mapped))
  }
  if (filters.passportDateFrom) params.set('passport_date_from', filters.passportDateFrom)
  if (filters.passportDateTo) params.set('passport_date_to', filters.passportDateTo)
  // search handled client-side

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

export interface MapCoordinates {
  lat: number
  lng: number
}

export interface MapPosition {
  x: number
  y: number
}

export type MapResourceType = 'lake' | 'canal' | 'reservoir'
export type MapWaterType = 'fresh' | 'saline'
export type MapPriority = 'high' | 'medium' | 'low'

export interface WaterObject {
  id: string
  name: string
  region: string
  resourceType: MapResourceType
  waterType: MapWaterType
  hasFauna: boolean
  passportDate: string
  condition: 1 | 2 | 3 | 4 | 5
  priority: MapPriority
  priorityCategory?: MapPriority
  priorityScore?: number
  markerColor?: string
  coordinates: MapCoordinates
  position: MapPosition
  image: string
  pdfUrl?: string | null
}

export interface Filters {
  region: string
  resourceType: string
  waterType: string
  hasFauna: boolean | null
  passportDateFrom: string
  passportDateTo: string
  condition: number[]
  priority: string
  criticalOnly: boolean
  search: string
}

export type SortOption =
  | 'priority_desc'
  | 'priority_asc'
  | 'condition_desc'
  | 'condition_asc'
  | 'passport_date_desc'
  | 'passport_date_asc'
  | 'name_asc'
  | 'name_desc'
  | 'region_asc'
  | 'region_desc'
  | 'resource_type_asc'
  | 'resource_type_desc'
  | 'water_type_asc'
  | 'water_type_desc'
  | 'fauna_asc'
  | 'fauna_desc'

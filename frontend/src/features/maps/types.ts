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
  condition: number | null
  priority: string
  criticalOnly: boolean
}

export type SortOption = 'dangerous' | 'safe' | 'oldest' | 'newest'

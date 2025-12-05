export interface WaterObject {
  id: string
  name: string
  region: string
  resourceType: "lake" | "canal" | "reservoir"
  waterType: "fresh" | "saline"
  hasFauna: boolean
  passportDate: string
  condition: 1 | 2 | 3 | 4 | 5
  priority: "high" | "medium" | "low"
  coordinates: {
    lat: number
    lng: number
  }
  position: {
    x: number
    y: number
  }
  image: string
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

export type SortOption = "dangerous" | "safe" | "oldest" | "newest"

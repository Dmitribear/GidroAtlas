import type { WaterObject } from '../types'

export function getConditionColor(condition: number): string {
  const colors: Record<number, string> = {
    1: 'bg-green-500',
    2: 'bg-lime-500',
    3: 'bg-yellow-500',
    4: 'bg-orange-500',
    5: 'bg-red-500',
  }
  return colors[condition] || 'bg-gray-500'
}

export function getConditionLabel(condition: number): string {
  const labels: Record<number, string> = {
    1: 'Минимальный риск',
    2: 'Низкий риск',
    3: 'Средний риск',
    4: 'Повышенный риск',
    5: 'Критичный риск',
  }
  return labels[condition] || 'Нет данных'
}

export function getResourceTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    lake: 'Озеро',
    canal: 'Канал',
    reservoir: 'Водохранилище',
  }
  return labels[type] || type
}

export function normalizeForMarkers(objects: WaterObject[]) {
  return objects.map((obj) => ({
    ...obj,
    latitude: obj.coordinates.lat,
    longitude: obj.coordinates.lng,
    technical_condition: obj.condition,
    resource_type: obj.resourceType,
  }))
}

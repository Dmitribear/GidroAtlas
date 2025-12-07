"use client"

import { X, MapPin, Droplets, FileText, GitCompare, Waves, Database, Calendar, Navigation } from 'lucide-react'
import type { WaterObject } from '../../types'
import { getConditionLabel, getResourceTypeLabel } from '../../utils'
import { getObjectImage } from '../../utils/objectImages'

interface ObjectCardProps {
  object: WaterObject
  onClose: () => void
  onCompare: () => void
  isInCompare: boolean
  canViewPassport?: boolean
  isExpert?: boolean
}

function getConditionStyles(condition: number) {
  const styles: Record<number, { badgeBg: string; badgeText: string; accent: string }> = {
    1: { badgeBg: 'bg-emerald-100', badgeText: 'text-emerald-700', accent: 'text-emerald-600' },
    2: { badgeBg: 'bg-lime-100', badgeText: 'text-lime-700', accent: 'text-lime-600' },
    3: { badgeBg: 'bg-amber-100', badgeText: 'text-amber-700', accent: 'text-amber-600' },
    4: { badgeBg: 'bg-orange-100', badgeText: 'text-orange-700', accent: 'text-orange-600' },
    5: { badgeBg: 'bg-red-100', badgeText: 'text-red-700', accent: 'text-red-600' },
  }
  return styles[condition] || styles[3]
}

function ResourceTypeIcon({ type, className = '' }: { type: string; className?: string }) {
  switch (type) {
    case 'lake':
      return <Droplets className={className} />
    case 'canal':
      return <Waves className={className} />
    case 'reservoir':
      return <Database className={className} />
    default:
      return <Droplets className={className} />
  }
}

export function ObjectCard({ object, onClose, onCompare, isInCompare, canViewPassport = true, isExpert = true }: ObjectCardProps) {
  const conditionStyles = isExpert
    ? getConditionStyles(object.condition)
    : { badgeBg: 'bg-gray-100', badgeText: 'text-gray-500', accent: 'text-gray-600' }
  const formatWaterType = object.waterType === 'fresh' ? 'Пресная' : 'Непресная'
  const formatFauna = object.hasFauna ? 'Есть' : 'Нет'
  const conditionDisplay = isExpert ? object.condition : '—'
  const conditionLabel = isExpert ? getConditionLabel(object.condition) : 'Доступно эксперту'

  const objectImage = getObjectImage(object.name, object.image || '/placeholder.svg?height=200&width=300&query=water reservoir lake')

  return (
    <div
      className="absolute bottom-4 left-4 w-[280px] bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-40"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="relative h-32">
        <img
          src={objectImage}
          alt={object.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

        <button
          onClick={onClose}
          className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center bg-white/95 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-colors"
        >
          <X className="w-3.5 h-3.5 text-gray-600" />
        </button>

        <div className="absolute top-2 left-2 px-2.5 py-1 bg-black/70 backdrop-blur-sm rounded-full text-[10px] font-semibold text-white flex items-center gap-1.5">
          <ResourceTypeIcon type={object.resourceType} className="w-3 h-3" />
          {getResourceTypeLabel(object.resourceType)}
        </div>
      </div>

      <div className="p-3 space-y-3">
        <div className="flex items-center gap-2.5">
          <span
            className={`w-9 h-9 rounded-xl ${conditionStyles.badgeBg} ${conditionStyles.badgeText} text-sm font-bold flex items-center justify-center shrink-0`}
          >
            {conditionDisplay}
          </span>
          <div className="min-w-0 flex-1">
            <p className={`text-xs font-semibold ${conditionStyles.accent} leading-tight`}>{conditionLabel}</p>
            <p className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5 truncate">
              <MapPin className="w-2.5 h-2.5 shrink-0" />
              <span className="truncate">{object.region}</span>
            </p>
          </div>
        </div>

        <h3 className="text-base font-bold text-gray-900 leading-tight line-clamp-2">{object.name}</h3>

        <div className="space-y-2 text-xs text-gray-700">
          <div className="flex items-center gap-2">
            <Droplets className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span className="text-[11px]">{formatWaterType}</span>
          </div>
          <div className="flex items-center gap-2">
            <Waves className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span className="text-[11px]">Фауна: {formatFauna}</span>
          </div>
          {object.passportDate && (
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="text-[11px]">{object.passportDate}</span>
            </div>
          )}
          <div className="flex items-start gap-2">
            <Navigation className="w-3.5 h-3.5 text-purple-500 shrink-0 mt-0.5" />
            <span className="text-[10px] text-gray-600 leading-tight">{formatCoordinates(object.coordinates.lat, object.coordinates.lng)}</span>
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          {canViewPassport && (
            <a
              href={object.pdfUrl || '#'}
              target="_blank"
              rel="noopener"
              className={`flex-1 h-9 flex items-center justify-center gap-1.5 rounded-lg text-xs font-semibold text-white transition-colors ${
                object.pdfUrl ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-400 cursor-not-allowed'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              PDF
            </a>
          )}
          <button
            onClick={onCompare}
            className={`h-9 w-9 flex items-center justify-center border rounded-lg transition-colors ${
              isInCompare
                ? 'border-blue-500 bg-blue-50 text-blue-600'
                : 'border-gray-200 text-gray-500 hover:bg-gray-50'
            }`}
          >
            <GitCompare className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}

function formatCoordinates(lat: number, lon: number) {
  const format = (value: number, axis: 'lat' | 'lon') => {
    const abs = Math.abs(value)
    const degrees = Math.floor(abs)
    const minutes = Math.round((abs - degrees) * 60)
    const suffix = axis === 'lat' ? (value >= 0 ? 'с. ш.' : 'ю. ш.') : value >= 0 ? 'в. д.' : 'з. д.'
    return `${degrees}°${minutes.toString().padStart(2, '0')}′ ${suffix}`
  }
  return `${format(lat, 'lat')}, ${format(lon, 'lon')}`
}

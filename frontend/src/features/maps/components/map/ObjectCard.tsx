"use client"

import { X, MapPin, Droplets, Fish, Calendar, FileText, GitCompare, Waves, Database } from 'lucide-react'
import type { WaterObject } from '../../types'
import { getConditionLabel, getResourceTypeLabel } from '../../utils'

interface ObjectCardProps {
  object: WaterObject
  onClose: () => void
  onCompare: () => void
  isInCompare: boolean
  canViewPassport?: boolean
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

export function ObjectCard({ object, onClose, onCompare, isInCompare, canViewPassport = true }: ObjectCardProps) {
  const conditionStyles = getConditionStyles(object.condition)

  return (
    <div
      className="absolute bottom-4 left-4 w-[320px] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-40"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="relative h-40">
        <img
          src={object.image || '/placeholder.svg?height=200&width=300&query=water reservoir lake'}
          alt={object.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />

        <button
          onClick={onClose}
          className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
        >
          <X className="w-4 h-4 text-gray-600" />
        </button>

        <div className="absolute top-3 left-3 px-3 py-1 bg-white/90 rounded-full text-[11px] font-semibold text-gray-800 flex items-center gap-1.5 shadow">
          <ResourceTypeIcon type={object.resourceType} className="w-3.5 h-3.5 text-blue-600" />
          {getResourceTypeLabel(object.resourceType)}
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="flex items-center gap-3">
          <span
            className={`w-10 h-10 rounded-2xl ${conditionStyles.badgeBg} ${conditionStyles.badgeText} text-base font-bold flex items-center justify-center`}
          >
            {object.condition}
          </span>
          <div>
            <p className={`text-sm font-semibold ${conditionStyles.accent}`}>{getConditionLabel(object.condition)}</p>
            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3" />
              {object.region}
            </p>
          </div>
        </div>

        <h3 className="text-lg font-bold text-gray-900 leading-tight">{object.name}</h3>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 p-2.5 bg-cyan-50 rounded-xl">
            <Droplets className="w-4 h-4 text-cyan-600" />
            <div className="text-xs">
              <p className="text-[10px] text-gray-500 uppercase tracking-wide">Вода</p>
              <p className="font-semibold text-gray-900">{object.waterType === 'fresh' ? 'Пресная' : 'Непресная'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2.5 bg-green-50 rounded-xl">
            <Fish className="w-4 h-4 text-green-600" />
            <div className="text-xs">
              <p className="text-[10px] text-gray-500 uppercase tracking-wide">Фауна</p>
              <p className="font-semibold text-gray-900">{object.hasFauna ? 'Есть' : 'Нет'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2.5 bg-orange-50 rounded-xl">
            <Calendar className="w-4 h-4 text-orange-600" />
            <div className="text-xs">
              <p className="text-[10px] text-gray-500 uppercase tracking-wide">Паспорт</p>
              <p className="font-semibold text-gray-900">{object.passportDate}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl">
            <MapPin className="w-4 h-4 text-gray-600" />
            <div className="text-xs">
              <p className="text-[10px] text-gray-500 uppercase tracking-wide">Координаты</p>
              <p className="font-semibold text-gray-900">
                {object.coordinates.lat.toFixed(1)}°, {object.coordinates.lng.toFixed(1)}°
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          {canViewPassport && (
            <a
              href={object.pdfUrl || '#'}
              target="_blank"
              rel="noopener"
              className={`flex-1 h-10 flex items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white transition-colors ${
                object.pdfUrl ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-400 cursor-not-allowed'
              }`}
            >
              <FileText className="w-4 h-4" />
              Открыть PDF
            </a>
          )}
          <button
            onClick={onCompare}
            className={`h-10 w-10 flex items-center justify-center border rounded-xl transition-colors ${
              isInCompare
                ? 'border-blue-500 bg-blue-50 text-blue-600'
                : 'border-gray-200 text-gray-500 hover:bg-gray-50'
            }`}
          >
            <GitCompare className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

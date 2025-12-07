"use client"

import { X, Droplets, Waves, Database } from 'lucide-react'
import type { WaterObject } from '../../types'
import { getConditionColor, getConditionLabel, getResourceTypeLabel } from '../../utils'
import { getObjectImage } from '../../utils/objectImages'

interface ComparePanelProps {
  objects: WaterObject[]
  onClose: () => void
  onRemove: (id: string) => void
}

function ConditionBadge({ value }: { value: number }) {
  const bg = getConditionColor(value)
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-white text-xs font-semibold ${bg}`}>
      <span className="w-2 h-2 rounded-full bg-white/70" />
      {value} / 5
    </div>
  )
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

export function ComparePanel({ objects, onClose, onRemove }: ComparePanelProps) {
  return (
    <div className="absolute inset-y-4 right-4 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50 flex flex-col">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-white">
        <div>
          <p className="text-xs text-gray-500">Сравнение объектов</p>
          <h3 className="text-lg font-semibold text-gray-900">{objects.length} выбрано</h3>
        </div>
        <button
          onClick={onClose}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white border border-gray-200 shadow-sm hover:bg-gray-50"
        >
          <X className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
        {objects.map((object) => {
          const conditionColor = getConditionColor(object.condition)

          return (
            <div key={object.id} className="p-4 relative group">
              <button
                onClick={() => onRemove(object.id)}
                className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full bg-white border border-gray-200 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3.5 h-3.5 text-gray-600" />
              </button>

              <div className="flex items-start gap-3">
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                  <img
                    src={getObjectImage(object.name, object.image || '/placeholder.svg?height=56&width=56')}
                    alt={object.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <ResourceTypeIcon type={object.resourceType} className="w-4 h-4 text-blue-600" />
                    <span className="text-xs text-gray-500">{getResourceTypeLabel(object.resourceType)}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-gray-900">{object.name}</h4>
                  <p className="text-xs text-gray-500">{object.region}</p>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
                  <span className={`w-2.5 h-2.5 rounded-full ${conditionColor}`} />
                  <div>
                    <p className="text-gray-500">Состояние</p>
                    <p className="text-gray-900 font-semibold">{getConditionLabel(object.condition)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <div>
                    <p className="text-gray-500">Паспорт</p>
                    <p className="text-gray-900 font-semibold">{object.passportDate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <div>
                    <p className="text-gray-500">Фауна</p>
                    <p className="text-gray-900 font-semibold">{object.hasFauna ? 'Есть' : 'Нет'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                  <div>
                    <p className="text-gray-500">Тип воды</p>
                    <p className="text-gray-900 font-semibold">{object.waterType === 'fresh' ? 'Пресная' : 'Солёная'}</p>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <ConditionBadge value={object.condition} />
                <div className="text-[11px] text-gray-500">
                  {object.coordinates.lat.toFixed(2)}°, {object.coordinates.lng.toFixed(2)}°
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

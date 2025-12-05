"use client"

import { X, FileText } from "lucide-react"
import type { WaterObject } from "@/lib/types"
import { getConditionColor, getConditionLabel, getResourceTypeLabel } from "@/lib/utils"

interface ComparePanelProps {
  objects: WaterObject[]
  onClose: () => void
  onRemove: (id: string) => void
}

export function ComparePanel({ objects, onClose, onRemove }: ComparePanelProps) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Сравнение ({objects.length})</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-auto">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${objects.length}, 1fr)` }}>
            {objects.map((obj) => (
              <CompareCard key={obj.id} object={obj} onRemove={() => onRemove(obj.id)} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function CompareCard({ object, onRemove }: { object: WaterObject; onRemove: () => void }) {
  const conditionColor = getConditionColor(object.condition)

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Image */}
      <div className="relative h-32">
        <img
          src={object.image || "/placeholder.svg?height=150&width=200&query=water lake"}
          alt={object.name}
          className="w-full h-full object-cover"
        />
        <button
          onClick={onRemove}
          className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center bg-white rounded-full shadow hover:bg-gray-50 transition-colors"
        >
          <X className="w-3.5 h-3.5 text-gray-600" />
        </button>
        <div className={`absolute bottom-2 left-2 px-2 py-0.5 rounded text-xs font-bold text-white ${conditionColor}`}>
          {object.condition}
        </div>
      </div>

      {/* Info */}
      <div className="p-3 space-y-2">
        <div>
          <h3 className="font-semibold text-sm text-gray-900 truncate">{object.name}</h3>
          <p className="text-xs text-gray-500 truncate">{object.region}</p>
        </div>

        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-500">Тип:</span>
            <span className="font-medium">{getResourceTypeLabel(object.resourceType)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Вода:</span>
            <span className="font-medium">{object.waterType === "fresh" ? "Пресная" : "Непресная"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Фауна:</span>
            <span className="font-medium">{object.hasFauna ? "Есть" : "Нет"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Состояние:</span>
            <span
              className={`font-medium ${
                object.condition <= 2 ? "text-emerald-600" : object.condition === 3 ? "text-amber-600" : "text-red-600"
              }`}
            >
              {getConditionLabel(object.condition)}
            </span>
          </div>
        </div>

        <button className="w-full h-8 flex items-center justify-center gap-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors">
          <FileText className="w-3.5 h-3.5" />
          PDF
        </button>
      </div>
    </div>
  )
}

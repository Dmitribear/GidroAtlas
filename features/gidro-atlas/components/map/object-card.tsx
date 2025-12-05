"use client"

import { X, MapPin, Droplets, Fish, Calendar, FileText, GitCompare, Waves, Database } from "lucide-react"
import type { WaterObject } from "@/lib/types"
import { getConditionLabel, getResourceTypeLabel } from "@/lib/utils"

interface ObjectCardProps {
  object: WaterObject
  onClose: () => void
  onCompare: () => void
  isInCompare: boolean
}

function getConditionStyles(condition: number) {
  const styles: Record<number, { bg: string; text: string }> = {
    1: { bg: "bg-emerald-500", text: "text-emerald-600" },
    2: { bg: "bg-lime-500", text: "text-lime-600" },
    3: { bg: "bg-amber-400", text: "text-amber-600" },
    4: { bg: "bg-orange-500", text: "text-orange-600" },
    5: { bg: "bg-red-500", text: "text-red-600" },
  }
  return styles[condition] || styles[3]
}

function ResourceTypeIcon({ type, className = "" }: { type: string; className?: string }) {
  switch (type) {
    case "lake":
      return <Droplets className={className} />
    case "canal":
      return <Waves className={className} />
    case "reservoir":
      return <Database className={className} />
    default:
      return <Droplets className={className} />
  }
}

export function ObjectCard({ object, onClose, onCompare, isInCompare }: ObjectCardProps) {
  const conditionStyles = getConditionStyles(object.condition)

  return (
    <div
      className="absolute bottom-4 left-4 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-40"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="relative h-36">
        <img
          src={object.image || "/placeholder.svg?height=200&width=300&query=water reservoir lake"}
          alt={object.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

        <button
          onClick={onClose}
          className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
        >
          <X className="w-4 h-4 text-gray-600" />
        </button>

        <div className="absolute bottom-2 left-2 px-2 py-1 bg-white/95 rounded-md text-xs font-medium text-gray-700 flex items-center gap-1.5">
          <ResourceTypeIcon type={object.resourceType} className="w-3.5 h-3.5 text-blue-600" />
          {getResourceTypeLabel(object.resourceType)}
        </div>
      </div>

      <div className="p-3 space-y-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`w-6 h-6 rounded-full ${conditionStyles.bg} text-white text-xs font-bold flex items-center justify-center`}
            >
              {object.condition}
            </span>
            <span className={`text-sm font-semibold ${conditionStyles.text}`}>
              {getConditionLabel(object.condition)}
            </span>
          </div>
          <h3 className="text-base font-bold text-gray-900">{object.name}</h3>
          <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3" />
            {object.region}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 p-2 bg-cyan-50 rounded-lg">
            <Droplets className="w-4 h-4 text-cyan-600" />
            <div>
              <p className="text-[10px] text-gray-500">Вода</p>
              <p className="text-xs font-medium text-gray-900">
                {object.waterType === "fresh" ? "Пресная" : "Солёная"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
            <Fish className="w-4 h-4 text-green-600" />
            <div>
              <p className="text-[10px] text-gray-500">Фауна</p>
              <p className="text-xs font-medium text-gray-900">{object.hasFauna ? "Есть" : "Нет"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 bg-orange-50 rounded-lg">
            <Calendar className="w-4 h-4 text-orange-600" />
            <div>
              <p className="text-[10px] text-gray-500">Паспорт</p>
              <p className="text-xs font-medium text-gray-900">{object.passportDate}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
            <MapPin className="w-4 h-4 text-gray-600" />
            <div>
              <p className="text-[10px] text-gray-500">Координаты</p>
              <p className="text-xs font-medium text-gray-900">
                {object.coordinates.lat.toFixed(1)}°, {object.coordinates.lng.toFixed(1)}°
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button className="flex-1 h-9 flex items-center justify-center gap-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors">
            <FileText className="w-3.5 h-3.5" />
            Открыть PDF
          </button>
          <button
            onClick={onCompare}
            className={`h-9 w-9 flex items-center justify-center border rounded-lg transition-colors ${
              isInCompare
                ? "border-blue-500 bg-blue-50 text-blue-600"
                : "border-gray-200 text-gray-500 hover:bg-gray-50"
            }`}
          >
            <GitCompare className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

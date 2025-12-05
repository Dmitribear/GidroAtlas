"use client"

import { Heart, GitCompare, ChevronDown, Droplets, Waves, Database, Fish } from "lucide-react"
import type { WaterObject, SortOption } from "@/lib/types"
import { getResourceTypeLabel } from "@/lib/utils"
import { useState, useRef, useEffect } from "react"

interface ObjectListProps {
  objects: WaterObject[]
  selectedId?: string
  hoveredId?: string | null
  onSelect: (object: WaterObject) => void
  onHover: (id: string | null) => void
  sortBy: SortOption
  onSortChange: (sort: SortOption) => void
  compareObjects: WaterObject[]
  onToggleCompare: (obj: WaterObject) => void
  onOpenCompare: () => void
}

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "dangerous", label: "Сначала опасные" },
  { value: "safe", label: "Сначала безопасные" },
  { value: "oldest", label: "Старые паспорта" },
  { value: "newest", label: "Новые паспорта" },
]

export function ObjectList({
  objects,
  selectedId,
  hoveredId,
  onSelect,
  onHover,
  sortBy,
  onSortChange,
  compareObjects,
  onToggleCompare,
  onOpenCompare,
}: ObjectListProps) {
  const [showSortMenu, setShowSortMenu] = useState(false)
  const sortRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setShowSortMenu(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="w-96 border-l border-gray-200 flex flex-col bg-white shrink-0">
      <div className="p-3 border-b border-gray-100">
        <h2 className="text-base font-semibold text-gray-900">Водные ресурсы</h2>
        <div className="flex items-center justify-between mt-1">
          <p className="text-xs text-gray-500">{objects.length} объектов</p>

          {/* Сортировка */}
          <div className="relative" ref={sortRef}>
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="text-xs text-gray-600 hover:text-gray-900 flex items-center gap-1"
            >
              <span className="font-medium">{sortOptions.find((s) => s.value === sortBy)?.label}</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            {showSortMenu && (
              <div className="absolute top-full right-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1">
                {sortOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      onSortChange(opt.value)
                      setShowSortMenu(false)
                    }}
                    className={`w-full px-3 py-1.5 text-left text-xs hover:bg-gray-50 transition-colors ${
                      sortBy === opt.value ? "bg-blue-50 text-blue-700" : "text-gray-700"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Кнопка сравнения */}
        {compareObjects.length > 0 && (
          <button
            onClick={onOpenCompare}
            className="mt-2 w-full h-8 flex items-center justify-center gap-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <GitCompare className="w-3.5 h-3.5" />
            Сравнить ({compareObjects.length})
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {objects.map((obj) => (
          <ObjectListCard
            key={obj.id}
            object={obj}
            isSelected={obj.id === selectedId}
            isHovered={obj.id === hoveredId}
            isInCompare={compareObjects.some((o) => o.id === obj.id)}
            onClick={() => onSelect(obj)}
            onMouseEnter={() => onHover(obj.id)}
            onMouseLeave={() => onHover(null)}
            onToggleCompare={() => onToggleCompare(obj)}
          />
        ))}
      </div>
    </div>
  )
}

interface ObjectListCardProps {
  object: WaterObject
  isSelected: boolean
  isHovered: boolean
  isInCompare: boolean
  onClick: () => void
  onMouseEnter: () => void
  onMouseLeave: () => void
  onToggleCompare: () => void
}

function getConditionBgColor(condition: number): string {
  const colors: Record<number, string> = {
    1: "bg-emerald-500",
    2: "bg-lime-500",
    3: "bg-amber-400",
    4: "bg-orange-500",
    5: "bg-red-500",
  }
  return colors[condition] || "bg-gray-500"
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

function ObjectListCard({
  object,
  isSelected,
  isHovered,
  isInCompare,
  onClick,
  onMouseEnter,
  onMouseLeave,
  onToggleCompare,
}: ObjectListCardProps) {
  const conditionBgColor = getConditionBgColor(object.condition)

  return (
    <div
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`flex gap-3 p-2 rounded-lg cursor-pointer transition-all ${
        isSelected ? "bg-blue-50 ring-1 ring-blue-500" : isHovered ? "bg-gray-50" : "hover:bg-gray-50"
      }`}
    >
      {/* Изображение */}
      <div className="relative w-24 h-20 rounded-lg overflow-hidden shrink-0">
        <img
          src={object.image || "/placeholder.svg?height=80&width=100&query=water resource"}
          alt={object.name}
          className="w-full h-full object-cover"
        />
        <div
          className={`absolute top-1 left-1 w-5 h-5 rounded-full ${conditionBgColor} text-white text-[10px] font-bold flex items-center justify-center`}
        >
          {object.condition}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggleCompare()
          }}
          className={`absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
            isInCompare ? "bg-blue-600 text-white" : "bg-white/90 text-gray-500 hover:text-red-500"
          }`}
        >
          <Heart className={`w-3 h-3 ${isInCompare ? "fill-current" : ""}`} />
        </button>
      </div>

      {/* Контент */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <ResourceTypeIcon type={object.resourceType} className="w-3.5 h-3.5 text-blue-600" />
          <span className="text-[10px] text-gray-500">{getResourceTypeLabel(object.resourceType)}</span>
          {object.hasFauna && <Fish className="w-3 h-3 text-green-500" />}
        </div>
        <h3 className="text-sm font-semibold text-gray-900 truncate">{object.name}</h3>
        <p className="text-[10px] text-gray-500 truncate">{object.region}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium text-white ${conditionBgColor}`}>
            {object.condition <= 2 ? "Норма" : object.condition <= 3 ? "Внимание" : "Критично"}
          </span>
          <span className="text-[10px] text-gray-400">{object.waterType === "fresh" ? "Пресная" : "Солёная"}</span>
        </div>
      </div>
    </div>
  )
}

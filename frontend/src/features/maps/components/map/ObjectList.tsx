"use client"

import { Heart, GitCompare, ChevronDown, Droplets, Waves, Database, Fish } from 'lucide-react'
import type { WaterObject, SortOption } from '../../types'
import { getResourceTypeLabel } from '../../utils'
import { useState, useRef, useEffect, useMemo } from 'react'

const EditIcon = ({ className = '' }: { className?: string }) => (
  <svg
    className={className}
    width="16"
    height="16"
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M11.442 1.707a1.21 1.21 0 011.71 0l1.142 1.14a1.21 1.21 0 010 1.711l-.856.856-2.852-2.852.856-.855zM9.31 3.839L3.164 9.985l-.91 3.714 3.761-.863 6.146-6.146L9.31 3.84z"
      fill="currentColor"
    ></path>
  </svg>
)

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
  isLoading?: boolean
  onOpenEditor?: () => void
  isExpert?: boolean
  canSortByPriority?: boolean
  hideCondition?: boolean
  totalCount: number
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  onToggleList: () => void
}

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'priority_desc', label: 'Приоритет: высокий → низкий' },
  { value: 'priority_asc', label: 'Приоритет: низкий → высокий' },
  { value: 'condition_desc', label: 'Состояние: 5 → 1' },
  { value: 'condition_asc', label: 'Состояние: 1 → 5' },
  { value: 'passport_date_desc', label: 'Паспорт: новые → старые' },
  { value: 'passport_date_asc', label: 'Паспорт: старые → новые' },
  { value: 'name_asc', label: 'Название A → Я' },
  { value: 'name_desc', label: 'Название Я → A' },
  { value: 'region_asc', label: 'Регион A → Я' },
  { value: 'region_desc', label: 'Регион Я → A' },
  { value: 'resource_type_asc', label: 'Тип ресурса A → Я' },
  { value: 'resource_type_desc', label: 'Тип ресурса Я → A' },
  { value: 'water_type_asc', label: 'Тип воды A → Я' },
  { value: 'water_type_desc', label: 'Тип воды Я → A' },
  { value: 'fauna_desc', label: 'Фауна: есть → нет' },
  { value: 'fauna_asc', label: 'Фауна: нет → есть' },
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
  isLoading = false,
  onOpenEditor,
  isExpert = false,
  canSortByPriority = true,
  hideCondition = false,
  totalCount,
  currentPage,
  totalPages,
  onPageChange,
  onToggleList,
}: ObjectListProps) {
  const [showSortMenu, setShowSortMenu] = useState(false)
  const sortRef = useRef<HTMLDivElement>(null)
  const availableSortOptions = useMemo(
    () => (canSortByPriority ? sortOptions : sortOptions.filter((opt) => !opt.value.startsWith('priority_'))),
    [canSortByPriority],
  )
  const pages = useMemo(() => Array.from({ length: totalPages }, (_, i) => i + 1), [totalPages])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setShowSortMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (!availableSortOptions.some((opt) => opt.value === sortBy) && availableSortOptions.length > 0) {
      onSortChange(availableSortOptions[0].value)
    }
  }, [availableSortOptions, onSortChange, sortBy])

  return (
    <div className="w-96 border-l border-gray-200 flex flex-col bg-white shrink-0 relative">
      <div className="p-3 border-b border-gray-100">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Список объектов</h2>
            <p className="text-xs text-gray-500">{totalCount} найдено</p>
          </div>

          <div className="flex items-center gap-2" ref={sortRef}>
            <button
              onClick={onToggleList}
              className="h-8 px-2 rounded-lg border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Скрыть
            </button>
            {isExpert && (
              <button
                onClick={onOpenEditor}
                className="h-8 w-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-700 hover:text-blue-700 hover:border-blue-400 transition-colors"
                title="Редактировать объект"
              >
                <EditIcon className="w-4 h-4" />
              </button>
            )}

            <div className="relative">
              <button
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="text-xs text-gray-600 hover:text-gray-900 flex items-center gap-1"
              >
                <span className="font-medium">
                  {availableSortOptions.find((s) => s.value === sortBy)?.label ||
                    availableSortOptions[0]?.label ||
                    'Сортировка'}
                </span>
                <ChevronDown className="w-3 h-3" />
              </button>
              {showSortMenu && (
                <div className="absolute top-full right-0 mt-1 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1">
                  {availableSortOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        onSortChange(opt.value)
                        setShowSortMenu(false)
                      }}
                      className={`w-full px-3 py-1.5 text-left text-xs hover:bg-gray-50 transition-colors ${
                        sortBy === opt.value ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {compareObjects.length > 0 && (
          <button
            onClick={onOpenCompare}
            className="mt-2 w-full h-8 flex items-center justify-center gap-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <GitCompare className="w-3.5 h-3.5" />
            Сравнить ({compareObjects.length})
          </button>
        )}

        {pages.length > 1 && (
          <div className="mt-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 flex-wrap">
              {pages.map((page) => (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  disabled={isLoading || page === currentPage}
                  className={`h-8 min-w-[2.5rem] px-2 rounded-lg border text-xs font-medium transition-colors ${
                    page === currentPage
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  } disabled:opacity-70`}
                >
                  {page}
                </button>
              ))}
            </div>
            <div className="text-[11px] text-gray-500">
              Страница {currentPage} из {totalPages}
            </div>
          </div>
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
            hideCondition={hideCondition}
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
  hideCondition?: boolean
}

function getConditionBgColor(condition: number): string {
  const colors: Record<number, string> = {
    1: 'bg-emerald-500',
    2: 'bg-lime-500',
    3: 'bg-amber-400',
    4: 'bg-orange-500',
    5: 'bg-red-500',
  }
  return colors[condition] || 'bg-gray-500'
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

function ObjectListCard({
  object,
  isSelected,
  isHovered,
  isInCompare,
  onClick,
  onMouseEnter,
  onMouseLeave,
  onToggleCompare,
  hideCondition = false,
}: ObjectListCardProps) {
  const conditionBgColor = hideCondition ? 'bg-gray-200' : getConditionBgColor(object.condition)
  const conditionLabel = hideCondition
    ? 'Доступно эксперту'
    : object.condition <= 2
      ? 'Хорошее'
      : object.condition <= 3
        ? 'Удовлетворительное'
        : 'Аварийное'

  return (
    <div
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`flex gap-3 p-2 rounded-lg cursor-pointer transition-all ${
        isSelected ? 'bg-blue-50 ring-1 ring-blue-500' : isHovered ? 'bg-gray-50' : 'hover:bg-gray-50'
      }`}
    >
      <div className="relative w-24 h-20 rounded-lg overflow-hidden shrink-0">
        <img
          src={object.image || '/placeholder.svg?height=80&width=100&query=water resource'}
          alt={object.name}
          className="w-full h-full object-cover"
        />
        <div
          className={`absolute top-1 left-1 w-5 h-5 rounded-full ${conditionBgColor} ${
            hideCondition ? 'text-gray-600' : 'text-white'
          } text-[10px] font-bold flex items-center justify-center`}
        >
          {hideCondition ? '—' : object.condition}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggleCompare()
          }}
          className={`absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
            isInCompare ? 'bg-blue-600 text-white' : 'bg-white/90 text-gray-500 hover:text-red-500'
          }`}
        >
          <Heart className={`w-3 h-3 ${isInCompare ? 'fill-current' : ''}`} />
        </button>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <ResourceTypeIcon type={object.resourceType} className="w-3.5 h-3.5 text-blue-600" />
          <span className="text-[10px] text-gray-500">{getResourceTypeLabel(object.resourceType)}</span>
          {object.hasFauna && <Fish className="w-3 h-3 text-green-500" />}
        </div>
        <h3 className="text-sm font-semibold text-gray-900 truncate">{object.name}</h3>
        <p className="text-[10px] text-gray-500 truncate">{object.region}</p>
        <div className="flex items-center gap-2 mt-1">
          <span
            className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${hideCondition ? 'text-gray-600 bg-gray-100' : 'text-white'} ${conditionBgColor}`}
          >
            {hideCondition ? '—' : conditionLabel}
          </span>
          <span className="text-[10px] text-gray-400">
            {object.waterType === 'fresh' ? 'Пресная' : 'Непресная'}
          </span>
        </div>
      </div>
    </div>
  )
}

"use client"

import type React from 'react'
import { Search, ChevronDown, X, AlertTriangle, Droplets, Waves, Database } from 'lucide-react'
import type { Filters } from '../../types'
import { useState, useRef, useEffect } from 'react'
import { REGION_OPTIONS } from '../../constants'

const resourceTypes = [
  { value: 'lake', label: 'Озеро', icon: Droplets },
  { value: 'canal', label: 'Канал', icon: Waves },
  { value: 'reservoir', label: 'Водохранилище', icon: Database },
]

const waterTypes = [
  { value: 'fresh', label: 'Пресная вода' },
  { value: 'saline', label: 'Непресная / солёная вода' },
]

const conditions = [
  { value: 1, label: '1 - Отличное', color: 'bg-emerald-500' },
  { value: 2, label: '2 - Хорошее', color: 'bg-lime-500' },
  { value: 3, label: '3 - Удовлетворительное', color: 'bg-amber-400' },
  { value: 4, label: '4 - Неудовлетворительное', color: 'bg-orange-500' },
  { value: 5, label: '5 - Аварийное', color: 'bg-red-500' },
]

interface FilterBarProps {
  filters: Filters
  onFiltersChange: (filters: Filters) => void
  onShowCritical: () => void
  normalizeRegion: (value: string) => string
}

export function FilterBar({ filters, onFiltersChange, onShowCritical, normalizeRegion }: FilterBarProps) {
  const activeFiltersCount = Object.values(filters).filter((v) => v !== '' && v !== null && v !== false).length

  const clearFilters = () => {
    onFiltersChange({
      region: '',
      resourceType: '',
      waterType: '',
      hasFauna: null,
      passportDateFrom: '',
      passportDateTo: '',
      condition: null,
      priority: '',
      criticalOnly: false,
    })
  }

  return (
    <div className="h-12 border-b border-gray-200 flex items-center px-3 gap-2 bg-white">
      <div className="relative w-64 group">
        <input
          type="text"
          placeholder="Поиск..."
          className="w-full h-8 pl-8 pr-3 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
        />
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
      </div>

      <div className="w-px h-6 bg-gray-200" />

      <FilterDropdownWithIcons
        label="Тип"
        value={filters.resourceType}
        options={resourceTypes}
        onChange={(v) => onFiltersChange({ ...filters, resourceType: v })}
      />

      <FilterDropdown
        label="Регион"
        value={filters.region}
        options={REGION_OPTIONS.map((r) => ({ value: r, label: r }))}
        onChange={(v) => onFiltersChange({ ...filters, region: normalizeRegion(v) })}
      />

      <FilterDropdown
        label="Вода"
        value={filters.waterType}
        options={waterTypes}
        onChange={(v) => onFiltersChange({ ...filters, waterType: v })}
      />

      <FilterDropdown
        label="Состояние"
        value={filters.condition?.toString() || ''}
        options={conditions.map((c) => ({ value: c.value.toString(), label: c.label }))}
        onChange={(v) => onFiltersChange({ ...filters, condition: v ? Number.parseInt(v) : null })}
        showConditionColors
      />

      <button
        onClick={onShowCritical}
        className={`h-8 px-3 flex items-center gap-1.5 rounded-lg border text-xs font-medium transition-all ${
          filters.criticalOnly
            ? 'border-red-500 bg-red-500 text-white'
            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
        }`}
      >
        <AlertTriangle className="w-3.5 h-3.5" />
        Только критические
      </button>

      <div className="flex-1" />

      {activeFiltersCount > 0 && (
        <button
          onClick={clearFilters}
          className="h-8 px-2 flex items-center gap-1 text-xs text-gray-600 hover:text-red-600 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
          Сбросить ({activeFiltersCount})
        </button>
      )}
    </div>
  )
}

interface FilterDropdownWithIconsProps {
  label: string
  value: string
  options: { value: string; label: string; icon: React.ComponentType<{ className?: string }> }[]
  onChange: (value: string) => void
}

function FilterDropdownWithIcons({ label, value, options, onChange }: FilterDropdownWithIconsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const selectedOption = options.find((o) => o.value === value)
  const isActive = value !== ''

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const SelectedIcon = selectedOption?.icon

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`h-8 px-3 flex items-center gap-1.5 rounded-lg border text-xs font-medium transition-all ${
          isActive
            ? 'border-blue-500 bg-blue-50 text-blue-700'
            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
        }`}
      >
        {SelectedIcon && <SelectedIcon className="w-3.5 h-3.5" />}
        {selectedOption?.label || label}
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 min-w-[160px] bg-white border border-gray-200 rounded-lg shadow-xl z-50 py-1 overflow-hidden">
          <button
            onClick={() => {
              onChange('')
              setIsOpen(false)
            }}
            className="w-full px-3 py-2 text-left text-xs text-gray-500 hover:bg-gray-50 transition-colors"
          >
            Не важно
          </button>
          {options.map((opt) => {
            const Icon = opt.icon
            return (
              <button
                key={opt.value}
                onClick={() => {
                  onChange(opt.value)
                  setIsOpen(false)
                }}
                className={`w-full px-3 py-2 text-left text-xs hover:bg-gray-50 flex items-center gap-2 transition-colors ${
                  value === opt.value ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${value === opt.value ? 'text-blue-600' : 'text-gray-500'}`} />
                {opt.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

interface FilterDropdownProps {
  label: string
  value: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
  showConditionColors?: boolean
}

function FilterDropdown({ label, value, options, onChange, showConditionColors }: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const selectedOption = options.find((o) => o.value === value)
  const isActive = value !== ''

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getConditionColor = (val: string) => {
    const colors: Record<string, string> = {
      '1': 'bg-emerald-500',
      '2': 'bg-lime-500',
      '3': 'bg-amber-400',
      '4': 'bg-orange-500',
      '5': 'bg-red-500',
    }
    return colors[val] || ''
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`h-8 px-3 flex items-center gap-1.5 rounded-lg border text-xs font-medium transition-all ${
          isActive
            ? 'border-blue-500 bg-blue-50 text-blue-700'
            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
        }`}
      >
        {showConditionColors && value && <span className={`w-2.5 h-2.5 rounded-full ${getConditionColor(value)}`} />}
        {selectedOption?.label || label}
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 min-w-[180px] bg-white border border-gray-200 rounded-lg shadow-xl z-50 py-1 max-h-56 overflow-auto">
          <button
            onClick={() => {
              onChange('')
              setIsOpen(false)
            }}
            className="w-full px-3 py-2 text-left text-xs text-gray-500 hover:bg-gray-50 transition-colors"
          >
            Сбросить
          </button>
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                onChange(opt.value)
                setIsOpen(false)
              }}
              className={`w-full px-3 py-2 text-left text-xs hover:bg-gray-50 flex items-center gap-2 transition-colors ${
                value === opt.value ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
              }`}
            >
              {showConditionColors && <span className={`w-2.5 h-2.5 rounded-full ${getConditionColor(opt.value)}`} />}
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

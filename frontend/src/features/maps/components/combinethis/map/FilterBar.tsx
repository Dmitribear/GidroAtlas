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
<<<<<<< HEAD
  { value: 'saline', label: 'Непресная / солёная вода' },
=======
  { value: 'saline', label: 'Солёная / минерализованная вода' },
>>>>>>> b7d5fce (redaction and profile)
]

const conditions = [
  { value: 1, label: '1 - Отличное', color: 'bg-emerald-500' },
  { value: 2, label: '2 - Хорошее', color: 'bg-lime-500' },
  { value: 3, label: '3 - Удовлетворительное', color: 'bg-amber-400' },
<<<<<<< HEAD
  { value: 4, label: '4 - Неудовлетворительное', color: 'bg-orange-500' },
=======
  { value: 4, label: '4 - Плохое', color: 'bg-orange-500' },
>>>>>>> b7d5fce (redaction and profile)
  { value: 5, label: '5 - Аварийное', color: 'bg-red-500' },
]

interface FilterBarProps {
  filters: Filters
  onFiltersChange: (filters: Filters) => void
  onShowCritical: () => void
  normalizeRegion: (value: string) => string
  isExpert: boolean
}

export function FilterBar({ filters, onFiltersChange, onShowCritical, normalizeRegion, isExpert }: FilterBarProps) {
  const activeFiltersCount = Object.values(filters).filter((v) => v !== '' && v !== null && v !== false).length

  const clearFilters = () => {
    if (!isExpert) return
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
      search: '',
    })
  }

  return (
    <div className="h-12 border-b border-gray-200 flex items-center px-3 gap-2 bg-white">
      <div className="relative w-64 group">
        <input
          type="text"
          placeholder="Поиск по названию или тегам..."
          className="w-full h-8 pl-8 pr-3 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
<<<<<<< HEAD
          value={filters.search}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
=======
          disabled={!isExpert}
          value={filters.search}
          onChange={(e) => isExpert && onFiltersChange({ ...filters, search: e.target.value })}
>>>>>>> b7d5fce (redaction and profile)
        />
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
      </div>

      <div className="w-px h-6 bg-gray-200" />

      <FilterDropdownWithIcons
        label="Тип"
        value={filters.resourceType}
        options={resourceTypes}
        onChange={(v) => isExpert && onFiltersChange({ ...filters, resourceType: v })}
        disabled={!isExpert}
      />

      <FilterDropdown
        label="Регион"
        value={filters.region}
        options={REGION_OPTIONS.map((r) => ({ value: r, label: r }))}
        onChange={(v) => isExpert && onFiltersChange({ ...filters, region: normalizeRegion(v) })}
        disabled={!isExpert}
      />

      <FilterDropdown
        label="Вода"
        value={filters.waterType}
        options={waterTypes}
        onChange={(v) => isExpert && onFiltersChange({ ...filters, waterType: v })}
        disabled={!isExpert}
      />

      <FilterDropdown
        label="Состояние"
        value={filters.condition?.toString() || ''}
        options={conditions.map((c) => ({ value: c.value.toString(), label: c.label }))}
        onChange={(v) => isExpert && onFiltersChange({ ...filters, condition: v ? Number.parseInt(v) : null })}
        showConditionColors
        disabled={!isExpert}
      />

      <FilterDropdown
        label="Фауна"
        value={filters.hasFauna === null ? '' : filters.hasFauna ? 'true' : 'false'}
        options={[
          { value: 'true', label: 'Есть' },
          { value: 'false', label: 'Нет' },
        ]}
        onChange={(v) => onFiltersChange({ ...filters, hasFauna: v === '' ? null : v === 'true' })}
      />

      <div className="flex items-center gap-2 text-xs text-gray-700">
        <label className="text-gray-600">Паспорт:</label>
        <input
          type="date"
          className="h-8 px-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-xs"
          value={filters.passportDateFrom}
          onChange={(e) => onFiltersChange({ ...filters, passportDateFrom: e.target.value })}
        />
        <span className="text-gray-400">—</span>
        <input
          type="date"
          className="h-8 px-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-xs"
          value={filters.passportDateTo}
          onChange={(e) => onFiltersChange({ ...filters, passportDateTo: e.target.value })}
        />
      </div>

      <button
        onClick={() => isExpert && onShowCritical()}
        className={`h-8 px-3 flex items-center gap-1.5 rounded-lg border text-xs font-medium transition-all ${
          filters.criticalOnly
            ? 'border-red-500 bg-red-500 text-white'
            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
        } ${!isExpert ? 'opacity-60 cursor-not-allowed' : ''}`}
        disabled={!isExpert}
      >
        <AlertTriangle className="w-3.5 h-3.5" />
        Только критические
      </button>

      <div className="flex-1" />

      {!isExpert && (
        <span className="text-[11px] text-gray-500 px-2 py-1 rounded-md border border-dashed border-gray-300 bg-gray-50">
          Поиск и фильтры доступны экспертам
        </span>
      )}

      {activeFiltersCount > 0 && (
        <button
          onClick={clearFilters}
          className="h-8 px-2 flex items-center gap-1 text-xs text-gray-600 hover:text-red-600 transition-colors disabled:opacity-60"
          disabled={!isExpert}
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
  disabled?: boolean
}

function FilterDropdownWithIcons({ label, value, options, onChange, disabled }: FilterDropdownWithIconsProps) {
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
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`h-8 px-3 flex items-center gap-1.5 rounded-lg border text-xs font-medium transition-all ${
          isActive
            ? 'border-blue-500 bg-blue-50 text-blue-700'
            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
        } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
        disabled={disabled}
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
            Без фильтра
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
  disabled?: boolean
}

function FilterDropdown({ label, value, options, onChange, showConditionColors, disabled }: FilterDropdownProps) {
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
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`h-8 px-3 flex items-center gap-1.5 rounded-lg border text-xs font-medium transition-all ${
          isActive
            ? 'border-blue-500 bg-blue-50 text-blue-700'
            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
        } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
        disabled={disabled}
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

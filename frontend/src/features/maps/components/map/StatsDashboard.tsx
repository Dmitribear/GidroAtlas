"use client"

import { AlertTriangle, CheckCircle, Activity, X, Layers, Crop } from 'lucide-react'
import type { WaterObject } from '../../types'

interface StatsDashboardProps {
  objects: WaterObject[]
  totalObjects: number
  onToggleLayers: () => void
  onSelectArea: () => void
  onClearArea: () => void
  hasSelection: boolean
  isSelecting: boolean
}

export function StatsDashboard({
  objects,
  totalObjects,
  onToggleLayers,
  onSelectArea,
  onClearArea,
  hasSelection,
  isSelecting,
}: StatsDashboardProps) {
  const criticalCount = objects.filter((o) => o.condition >= 4).length
  const goodCount = objects.filter((o) => o.condition <= 2).length
  const avgCondition =
    objects.length > 0 ? (objects.reduce((sum, o) => sum + o.condition, 0) / objects.length).toFixed(1) : '—'

  return (
    <div className="absolute top-4 left-4 z-20 flex items-center gap-3">
      <div className="h-9 px-4 bg-gradient-to-r from-gray-900 to-gray-800 text-white text-sm font-medium rounded-lg flex items-center gap-2 shadow-lg">
        <Layers className="w-4 h-4 text-cyan-400" />
        {objects.length} из {totalObjects} объектов
      </div>

      <div className="flex items-center gap-3 h-9 px-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <div>
            <span className="text-sm font-bold text-gray-900">{criticalCount}</span>
            <span className="text-xs text-gray-500 ml-1">критичных</span>
          </div>
        </div>

        <div className="w-px h-6 bg-gray-200" />

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <span className="text-sm font-bold text-gray-900">{goodCount}</span>
            <span className="text-xs text-gray-500 ml-1">в хорошем</span>
          </div>
        </div>

        <div className="w-px h-6 bg-gray-200" />

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
            <Activity className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <span className="text-sm font-bold text-gray-900">{avgCondition}</span>
            <span className="text-xs text-gray-500 ml-1">ср. состояние</span>
          </div>
        </div>
      </div>

      <button
        onClick={onToggleLayers}
        className="h-9 px-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-100 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
      >
        Скрыть слои
        <X className="w-3.5 h-3.5" />
      </button>

      <button
        onClick={hasSelection ? onClearArea : onSelectArea}
        className="h-9 px-3 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-100 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
      >
        <Crop className="w-4 h-4" />
        {hasSelection ? 'Сбросить зону' : isSelecting ? 'Выделение...' : 'Выделить зону'}
        {hasSelection && <X className="w-3 h-3" />}
      </button>
    </div>
  )
}

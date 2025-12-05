"use client"

import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { Header } from './map/Header'
import { FilterBar } from './map/FilterBar'
import { ObjectList } from './map/ObjectList'
import { MapView } from './map/MapView'
import { ObjectCard } from './map/ObjectCard'
import { StatsDashboard } from './map/StatsDashboard'
import { ComparePanel } from './map/ComparePanel'
import type { WaterObject, Filters, SortOption } from '../types'
import { waterObjects as fallbackObjects } from '../data/waterObjects'
import { normalizeForMarkers } from '../utils'
import { renderMarkers } from '../utils/mapMarkers'
import { fetchWaterObjects, importCsvToWaterObjects } from '../api'
import { getJson } from '@shared/api/http'
import { normalizeRegionName } from '../constants'

export function GidroAtlasMap() {
  const [objects, setObjects] = useState<WaterObject[]>([])
  const [loadingObjects, setLoadingObjects] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [userLogin, setUserLogin] = useState<string | null>(null)
  const [selectedObject, setSelectedObject] = useState<WaterObject | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [compareObjects, setCompareObjects] = useState<WaterObject[]>([])
  const [showCompare, setShowCompare] = useState(false)
  const [sortBy, setSortBy] = useState<SortOption>('dangerous')
  const [filters, setFilters] = useState<Filters>({
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

  useEffect(() => {
    const storedToken = localStorage.getItem('access_token')
    const storedLogin = localStorage.getItem('user_login')
    setToken(storedToken)
    setUserLogin(storedLogin)

    const sync = async () => {
      if (!storedToken) return
      const res = await getJson<{ login: string }>('/auth/me', storedToken)
      if ('data' in res && res.data?.login) {
        setUserLogin(res.data.login)
        localStorage.setItem('user_login', res.data.login)
      }
    }
    sync().catch(() => {})
  }, [])

  const filteredObjects = useMemo(() => objects, [objects])

  const [csvMarkers, setCsvMarkers] = useState<any[]>([])
  const [uploadStatus, setUploadStatus] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [showLayers, setShowLayers] = useState(true)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  const loadObjects = useCallback(
    async (nextPage = 0, append = false) => {
      setLoadingObjects(true)
      setFetchError(null)
      const result = await fetchWaterObjects(filters, sortBy, token, nextPage, 50)
      if (result.error) {
        setFetchError(result.error)
        setObjects(fallbackObjects)
        setHasMore(false)
      } else {
        setHasMore(result.hasMore)
        const data = result.data.length ? result.data : fallbackObjects
        setObjects((prev) => (append ? [...prev, ...data] : data))
      }
      setLoadingObjects(false)
    },
    [filters, sortBy, token],
  )

  // debounce filters/sort changes
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setPage(0)
      loadObjects(0, false).catch(() => {
        setFetchError('Не удалось обновить данные.')
        setObjects(fallbackObjects)
        setLoadingObjects(false)
      })
    }, 250)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [filters, sortBy, loadObjects])

  const toggleCompare = (obj: WaterObject) => {
    setCompareObjects((prev) => {
      const exists = prev.find((o) => o.id === obj.id)
      if (exists) {
        return prev.filter((o) => o.id !== obj.id)
      }
      if (prev.length >= 3) return prev
      return [...prev, obj]
    })
  }

  const handleMapClick = () => {
    setSelectedObject(null)
  }

  const updateLeafletMarkers = useCallback(() => {
    if (typeof window === 'undefined') return
    const map = (window as any)._leafletMap
    if (!map) return
    const combinedMarkers = [...normalizeForMarkers(filteredObjects), ...csvMarkers]
    renderMarkers(map, combinedMarkers)
  }, [csvMarkers, filteredObjects])

  useEffect(() => {
    updateLeafletMarkers()
  }, [updateLeafletMarkers])

  useEffect(() => {
    const handler = () => updateLeafletMarkers()
    window.addEventListener('leaflet-map-ready', handler)
    return () => window.removeEventListener('leaflet-map-ready', handler)
  }, [updateLeafletMarkers])

  const handleCsvFile = async (file: File) => {
    setIsUploading(true)
    setUploadStatus(null)
    setUploadError(null)
    try {
      const result = await importCsvToWaterObjects(file, token)
      if (result.error) {
        setUploadError(result.error)
        setCsvMarkers([])
      } else {
        setCsvMarkers(result.items)
        setUploadStatus(`Импортировано ${result.inserted}, пропущено ${result.skipped}`)
        loadObjects(page, false).catch(() => {})
      }
    } catch (error) {
      console.error(error)
      setUploadError((error as Error).message || 'Не удалось импортировать CSV.')
      setCsvMarkers([])
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    await handleCsvFile(file)
  }

  const requestCsvUpload = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Header
        onUploadCsv={requestCsvUpload}
        isUploading={isUploading}
        userLogin={userLogin}
        onLogout={() => {
          localStorage.removeItem('access_token')
          localStorage.removeItem('user_login')
          setToken(null)
          setUserLogin(null)
        }}
      />
      {(uploadStatus || uploadError || fetchError || loadingObjects) && (
        <div className="px-4 pt-2 text-xs space-y-1">
          {loadingObjects && <div className="text-gray-500">Загружаем объекты карты...</div>}
          {uploadStatus && !uploadError && <div className="text-gray-600">{uploadStatus}</div>}
          {uploadError && <div className="text-red-600">{uploadError}</div>}
          {fetchError && <div className="text-amber-600">{fetchError}</div>}
        </div>
      )}
      <FilterBar
        filters={filters}
        onFiltersChange={setFilters}
        onShowCritical={() => setFilters((f) => ({ ...f, criticalOnly: !f.criticalOnly }))}
        normalizeRegion={normalizeRegionName}
      />

      <div className="flex-1 flex overflow-hidden">
        <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
        <div className="flex-1 relative">
          <MapView
            objects={filteredObjects}
            selectedId={selectedObject?.id}
            hoveredId={hoveredId}
            onSelect={setSelectedObject}
            onHover={setHoveredId}
            onMapClick={handleMapClick}
          />

          {showLayers && <StatsDashboard objects={filteredObjects} totalObjects={objects.length} onToggleLayers={() => setShowLayers((v) => !v)} />}

          {selectedObject && (
            <ObjectCard
              object={selectedObject}
              onClose={() => setSelectedObject(null)}
              onCompare={() => toggleCompare(selectedObject)}
              isInCompare={compareObjects.some((o) => o.id === selectedObject.id)}
            />
          )}
        </div>

        <ObjectList
          objects={filteredObjects}
          selectedId={selectedObject?.id}
          hoveredId={hoveredId}
          onSelect={setSelectedObject}
          onHover={setHoveredId}
          sortBy={sortBy}
          onSortChange={setSortBy}
          compareObjects={compareObjects}
          onToggleCompare={toggleCompare}
          onOpenCompare={() => setShowCompare(true)}
          hasMore={hasMore}
          onLoadMore={() => {
            const next = page + 1
            setPage(next)
            loadObjects(next, true).catch(() => {})
          }}
          isLoading={loadingObjects}
        />
      </div>

      {showCompare && compareObjects.length > 0 && (
        <ComparePanel
          objects={compareObjects}
          onClose={() => setShowCompare(false)}
          onRemove={(id) => setCompareObjects((prev) => prev.filter((o) => o.id !== id))}
        />
      )}
    </div>
  )
}

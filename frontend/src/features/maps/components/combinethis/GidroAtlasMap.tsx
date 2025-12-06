"use client"

import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
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
import { Navbar } from '@widgets/landing/Navbar'
import { LoginModal } from '@widgets/landing/LoginModal'
import { RegisterModal } from '@widgets/landing/RegisterModal'
import { normalizeRegionName } from '../constants'
import { supabase } from '@shared/api/supabaseClient'

type Bounds = { south: number; west: number; north: number; east: number }
type UserRole = 'guest' | 'expert'

const PRIORITY_TO_NUMBER: Record<string, number> = { high: 3, medium: 2, low: 1 }

type Bounds = { south: number; west: number; north: number; east: number }

export function GidroAtlasMap() {
  const [objects, setObjects] = useState<WaterObject[]>([])
  const [loadingObjects, setLoadingObjects] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [userLogin, setUserLogin] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<UserRole>('guest')
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
    search: '',
  })
  const [showLogin, setShowLogin] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const [selectionBounds, setSelectionBounds] = useState<Bounds | null>(null)
  const [isSelectingArea, setIsSelectingArea] = useState(false)
<<<<<<< HEAD
=======

  const [csvMarkers, setCsvMarkers] = useState<any[]>([])
  const [uploadStatus, setUploadStatus] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [showLayers, setShowLayers] = useState(true)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  const [showEditor, setShowEditor] = useState(false)
  const [editorTarget, setEditorTarget] = useState<WaterObject | null>(null)
  const [editorCondition, setEditorCondition] = useState<number>(3)
  const [editorPriority, setEditorPriority] = useState<WaterObject['priority']>('medium')
  const [isSavingEdit, setIsSavingEdit] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

  const isExpert = userRole === 'expert'

  const fetchRole = useCallback(async (login: string | null) => {
    if (!login) {
      setUserRole('guest')
      return
    }
    const { data, error } = await supabase.from('users').select('role').eq('login', login).single()
    if (error) {
      setUserRole('guest')
      return
    }
    const roleValue = (data as { role?: string } | null)?.role
    setUserRole(roleValue === 'expert' ? 'expert' : 'guest')
  }, [])
>>>>>>> b7d5fce (redaction and profile)

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
        fetchRole(res.data.login).catch(() => setUserRole('guest'))
      }
    }
    sync().catch(() => {})
    if (storedLogin) {
      fetchRole(storedLogin).catch(() => setUserRole('guest'))
    }
  }, [fetchRole])

  const filteredObjects = useMemo(() => {
    let result = objects
    if (selectionBounds) {
      result = result.filter((obj) => {
        const lat = Number(obj.coordinates.lat)
        const lng = Number(obj.coordinates.lng)
        if (Number.isNaN(lat) || Number.isNaN(lng)) return false
        return (
          lat >= selectionBounds.south &&
          lat <= selectionBounds.north &&
          lng >= selectionBounds.west &&
          lng <= selectionBounds.east
        )
      })
    }
    if (filters.search.trim()) {
      const q = filters.search.trim().toLowerCase()
      result = result.filter((obj) => {
<<<<<<< HEAD
        const haystack = [
          obj.name,
          obj.region,
          obj.resourceType,
          obj.waterType,
          obj.pdfUrl || '',
        ]
=======
        const haystack = [obj.name, obj.region, obj.resourceType, obj.waterType, obj.pdfUrl || '']
>>>>>>> b7d5fce (redaction and profile)
          .join(' ')
          .toLowerCase()
        return haystack.includes(q)
      })
    }
    if (filters.hasFauna !== null) {
      result = result.filter((o) => o.hasFauna === filters.hasFauna)
    }
    if (filters.passportDateFrom) {
      result = result.filter((o) => o.passportDate >= filters.passportDateFrom)
    }
    if (filters.passportDateTo) {
      result = result.filter((o) => o.passportDate <= filters.passportDateTo)
    }
    return result
  }, [objects, selectionBounds, filters.search, filters.hasFauna, filters.passportDateFrom, filters.passportDateTo])

<<<<<<< HEAD
  const [csvMarkers, setCsvMarkers] = useState<any[]>([])
=======
>>>>>>> b7d5fce (redaction and profile)
  const filteredCsvMarkers = useMemo(() => {
    if (!selectionBounds) return csvMarkers
    return csvMarkers.filter((obj) => {
      const lat = Number(obj.latitude ?? obj.lat)
      const lng = Number(obj.longitude ?? obj.lng)
      if (Number.isNaN(lat) || Number.isNaN(lng)) return false
      return (
        lat >= selectionBounds.south &&
        lat <= selectionBounds.north &&
        lng >= selectionBounds.west &&
        lng <= selectionBounds.east
      )
    })
  }, [csvMarkers, selectionBounds])
<<<<<<< HEAD
  const [uploadStatus, setUploadStatus] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [showLayers, setShowLayers] = useState(true)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)
=======
>>>>>>> b7d5fce (redaction and profile)

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

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setPage(0)
      loadObjects(0, false).catch(() => {
        setFetchError('Не удалось загрузить объекты.')
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
    const combinedMarkers = [...normalizeForMarkers(filteredObjects), ...filteredCsvMarkers]
    renderMarkers(map, combinedMarkers, selectedObject?.id)
  }, [filteredCsvMarkers, filteredObjects, selectedObject?.id])

  useEffect(() => {
    updateLeafletMarkers()
  }, [updateLeafletMarkers])

  // highlight first match on search
  useEffect(() => {
    if (!filters.search.trim()) return
    if (filteredObjects.length === 0) return
    const first = filteredObjects[0]
    setSelectedObject(first)
    setHoveredId(first.id)
  }, [filters.search, filteredObjects])

  useEffect(() => {
    const handler = () => updateLeafletMarkers()
    window.addEventListener('leaflet-map-ready', handler)
    return () => window.removeEventListener('leaflet-map-ready', handler)
  }, [updateLeafletMarkers])

  // Rectangle selection mode
  useEffect(() => {
    if (!isSelectingArea) return
    if (typeof window === 'undefined' || !(window as any).L) return
    const map = (window as any)._leafletMap
    if (!map) return

    const L = (window as any).L
    let rect: any = null
    let start: any = null

    const onMouseMove = (e: any) => {
      if (!start) return
      const bounds = L.latLngBounds(start, e.latlng)
      if (rect) {
        rect.setBounds(bounds)
      } else {
        rect = L.rectangle(bounds, { color: '#2563eb', weight: 1, fillOpacity: 0.08 })
        rect.addTo(map)
      }
    }

    const cleanup = () => {
      if (rect) {
        map.removeLayer(rect)
        rect = null
      }
      map.off('mousemove', onMouseMove)
      map.dragging.enable()
      map.boxZoom?.enable?.()
      map.doubleClickZoom?.enable?.()
      start = null
    }

    const onMouseUp = (e: any) => {
      if (!start) return
      const bounds = L.latLngBounds(start, e.latlng)
      setSelectionBounds({
        south: bounds.getSouth(),
        west: bounds.getWest(),
        north: bounds.getNorth(),
        east: bounds.getEast(),
      })
      map.fitBounds(bounds, { padding: [20, 20] })
      cleanup()
      setIsSelectingArea(false)
    }

    const onMouseDown = (e: any) => {
      start = e.latlng
      map.dragging.disable()
      map.boxZoom?.disable?.()
      map.doubleClickZoom?.disable?.()
      map.on('mousemove', onMouseMove)
      map.once('mouseup', onMouseUp)
    }

    map.on('mousedown', onMouseDown)

    return () => {
      cleanup()
      map.off('mousedown', onMouseDown)
    }
  }, [isSelectingArea])

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
        setCsvMarkers(normalizeForMarkers(result.items))
        setUploadStatus(`Импортировано ${result.inserted}, пропущено ${result.skipped}`)
        loadObjects(page, false).catch(() => {})
      }
    } catch (error) {
      console.error(error)
      setUploadError((error as Error).message || 'Не удалось загрузить CSV.')
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
    if (!isExpert) return
    fileInputRef.current?.click()
  }

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user_login')
    setToken(null)
    setUserLogin(null)
<<<<<<< HEAD
=======
    setUserRole('guest')
>>>>>>> b7d5fce (redaction and profile)
  }

  const handleAuthSuccess = (nextToken: string, login: string) => {
    setToken(nextToken)
    setUserLogin(login)
    localStorage.setItem('access_token', nextToken)
    localStorage.setItem('user_login', login)
    setShowLogin(false)
    setShowRegister(false)
<<<<<<< HEAD
    loadObjects(0, false).catch(() => {})
  }

=======
    fetchRole(login).catch(() => setUserRole('guest'))
    loadObjects(0, false).catch(() => {})
  }

  const openEditor = () => {
    if (!isExpert) return
    const target = selectedObject || filteredObjects[0] || null
    if (!target) return
    setEditorTarget(target)
    setEditorCondition(target.condition)
    setEditorPriority(target.priority)
    setShowEditor(true)
    setEditError(null)
  }

  const handleSaveEdit = async () => {
    if (!isExpert || !editorTarget) return
    setIsSavingEdit(true)
    setEditError(null)
    const priorityValue = PRIORITY_TO_NUMBER[editorPriority] ?? PRIORITY_TO_NUMBER.low
    const { error } = await supabase
      .from('water_objects')
      .update({ technical_condition: editorCondition, priority: priorityValue })
      .eq('id', editorTarget.id)
    if (error) {
      setEditError(error.message || 'Не удалось сохранить изменения')
      setIsSavingEdit(false)
      return
    }

    setObjects((prev) =>
      prev.map((o) =>
        o.id === editorTarget.id ? { ...o, condition: editorCondition as WaterObject['condition'], priority: editorPriority } : o,
      ),
    )
    setSelectedObject((prev) =>
      prev && prev.id === editorTarget.id
        ? { ...prev, condition: editorCondition as WaterObject['condition'], priority: editorPriority }
        : prev,
    )
    setShowEditor(false)
    setIsSavingEdit(false)
  }

>>>>>>> b7d5fce (redaction and profile)
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Navbar
        onLoginClick={() => setShowLogin(true)}
        userLogin={userLogin}
        onLogout={handleLogout}
        onProfile={() => (window.location.href = '/profile')}
<<<<<<< HEAD
        ctaLabel="На главную"
        ctaHref="/"
        navItems={[
          { label: 'В профиль', href: '/profile' },
          { label: 'Отчёты', href: '/reports' },
        ]}
=======
>>>>>>> b7d5fce (redaction and profile)
      />

      <div className="pt-20 flex flex-col h-full">
        <div className="px-4 pb-2 flex items-center gap-3 text-xs text-gray-700">
          <button
            onClick={requestCsvUpload}
<<<<<<< HEAD
            className="h-8 px-3 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 text-xs font-medium transition-colors"
            disabled={isUploading}
=======
            className="h-8 px-3 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 text-xs font-medium transition-colors disabled:opacity-60"
            disabled={isUploading || !isExpert}
>>>>>>> b7d5fce (redaction and profile)
          >
            {isUploading ? 'Импортируем...' : 'Импорт CSV'}
          </button>
          <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
<<<<<<< HEAD
          {loadingObjects && <div className="text-gray-500">Загружаем объекты...</div>}
=======
          {loadingObjects && <div className="text-gray-500">Загрузка объектов...</div>}
>>>>>>> b7d5fce (redaction and profile)
          {uploadStatus && !uploadError && <div className="text-gray-600">{uploadStatus}</div>}
          {uploadError && <div className="text-red-600">{uploadError}</div>}
          {fetchError && <div className="text-amber-600">{fetchError}</div>}
          {!isExpert && (
            <div className="ml-auto text-[11px] text-gray-500 flex items-center gap-2">
              Редактирование и импорт доступны только экспертам
            </div>
          )}
        </div>

        <FilterBar
          filters={filters}
          onFiltersChange={setFilters}
          onShowCritical={() => setFilters((f) => ({ ...f, criticalOnly: !f.criticalOnly }))}
          normalizeRegion={normalizeRegionName}
<<<<<<< HEAD
=======
          isExpert={isExpert}
>>>>>>> b7d5fce (redaction and profile)
        />

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 relative">
            <MapView
              objects={filteredObjects}
              selectedId={selectedObject?.id}
              hoveredId={hoveredId}
              onSelect={setSelectedObject}
              onHover={setHoveredId}
              onMapClick={handleMapClick}
            />

            {showLayers ? (
              <StatsDashboard
                objects={filteredObjects}
                totalObjects={objects.length}
                onToggleLayers={() => setShowLayers(false)}
<<<<<<< HEAD
                onSelectArea={() => {
                  setSelectionBounds(null)
                  setIsSelectingArea(true)
                }}
                onClearArea={() => {
                  setSelectionBounds(null)
                  setIsSelectingArea(false)
                }}
                hasSelection={!!selectionBounds}
                isSelecting={isSelectingArea}
=======
>>>>>>> b7d5fce (redaction and profile)
              />
            ) : (
              <button
                onClick={() => setShowLayers(true)}
                className="absolute top-4 left-4 z-20 h-9 px-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-100 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
              >
                Показать слои
              </button>
            )}

            {selectedObject && (
              <ObjectCard
                object={selectedObject}
                onClose={() => setSelectedObject(null)}
                onCompare={() => toggleCompare(selectedObject)}
                isInCompare={compareObjects.some((o) => o.id === selectedObject.id)}
<<<<<<< HEAD
=======
                canViewPassport={isExpert}
>>>>>>> b7d5fce (redaction and profile)
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
<<<<<<< HEAD
=======
            onOpenEditor={openEditor}
            isExpert={isExpert}
>>>>>>> b7d5fce (redaction and profile)
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

<<<<<<< HEAD
=======
      {isExpert && showEditor && editorTarget && (
        <div className="fixed right-4 top-24 w-80 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs text-gray-500">Объект</p>
              <h3 className="text-sm font-semibold text-gray-900">{editorTarget.name}</h3>
              <p className="text-[11px] text-gray-500">{editorTarget.region}</p>
            </div>
            <button
              onClick={() => setShowEditor(false)}
              className="text-gray-500 hover:text-gray-900 rounded-full p-1 border border-gray-200"
            >
              x
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-gray-600">Техническое состояние</label>
            <select
              className="w-full h-9 border border-gray-300 rounded-lg text-sm px-2"
              value={editorCondition}
              onChange={(e) => setEditorCondition(Number.parseInt(e.target.value) as WaterObject['condition'])}
            >
              {[1, 2, 3, 4, 5].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-gray-600">Приоритет</label>
            <select
              className="w-full h-9 border border-gray-300 rounded-lg text-sm px-2"
              value={editorPriority}
              onChange={(e) => setEditorPriority(e.target.value as WaterObject['priority'])}
            >
              <option value="high">Высокий</option>
              <option value="medium">Средний</option>
              <option value="low">Низкий</option>
            </select>
          </div>

          {editError && <div className="text-xs text-red-600">{editError}</div>}

          <button
            onClick={handleSaveEdit}
            disabled={isSavingEdit}
            className="w-full h-10 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
          >
            {isSavingEdit ? 'Сохранение...' : 'Сохранить изменения'}
          </button>
        </div>
      )}

>>>>>>> b7d5fce (redaction and profile)
      <LoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onOpenRegister={() => {
          setShowLogin(false)
          setShowRegister(true)
        }}
        onAuthSuccess={handleAuthSuccess}
      />
      <RegisterModal
        isOpen={showRegister}
        onClose={() => setShowRegister(false)}
        onSwitchToLogin={() => {
          setShowRegister(false)
          setShowLogin(true)
        }}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  )
}

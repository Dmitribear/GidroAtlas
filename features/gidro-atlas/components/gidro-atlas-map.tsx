"use client"

import { useState, useMemo, useEffect, useCallback, useRef } from "react"
import { Header } from "./map/header"
import { FilterBar } from "./map/filter-bar"
import { ObjectList } from "./map/object-list"
import { MapView } from "./map/map-view"
import { ObjectCard } from "./map/object-card"
import { StatsDashboard } from "./map/stats-dashboard"
import { ComparePanel } from "./map/compare-panel"
import type { WaterObject, Filters, SortOption } from "@/lib/types"
import { waterObjects } from "@/lib/data"
import { renderMarkers } from "@/features/gidro-atlas/utils/map-markers"

export function GidroAtlasMap() {
  const [selectedObject, setSelectedObject] = useState<WaterObject | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [compareObjects, setCompareObjects] = useState<WaterObject[]>([])
  const [showCompare, setShowCompare] = useState(false)
  const [sortBy, setSortBy] = useState<SortOption>("dangerous")
  const [filters, setFilters] = useState<Filters>({
    region: "",
    resourceType: "",
    waterType: "",
    hasFauna: null,
    passportDateFrom: "",
    passportDateTo: "",
    condition: null,
    priority: "",
    criticalOnly: false,
  })

  const filteredObjects = useMemo(() => {
    let result = waterObjects.filter((obj) => {
      if (filters.region && obj.region !== filters.region) return false
      if (filters.resourceType && obj.resourceType !== filters.resourceType) return false
      if (filters.waterType && obj.waterType !== filters.waterType) return false
      if (filters.hasFauna !== null && obj.hasFauna !== filters.hasFauna) return false
      if (filters.condition !== null && obj.condition !== filters.condition) return false
      if (filters.criticalOnly && obj.condition < 4) return false
      if (filters.priority && obj.priority !== filters.priority) return false
      return true
    })

    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case "dangerous":
          return b.condition - a.condition
        case "safe":
          return a.condition - b.condition
        case "oldest":
          return new Date(a.passportDate).getTime() - new Date(b.passportDate).getTime()
        case "newest":
          return new Date(b.passportDate).getTime() - new Date(a.passportDate).getTime()
        default:
          return 0
      }
    })

    return result
  }, [filters, sortBy])

  const [csvMarkers, setCsvMarkers] = useState<any[]>([])
  const [uploadStatus, setUploadStatus] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

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
    if (typeof window === "undefined") return
    const map = (window as any)._leafletMap
    if (!map) return
    renderMarkers(map, csvMarkers)
  }, [csvMarkers])

  useEffect(() => {
    updateLeafletMarkers()
  }, [updateLeafletMarkers])

  useEffect(() => {
    const handler = () => updateLeafletMarkers()
    window.addEventListener("leaflet-map-ready", handler)
    return () => window.removeEventListener("leaflet-map-ready", handler)
  }, [updateLeafletMarkers])

  const splitCsvLine = (line: string) => {
    const result: string[] = []
    let current = ""
    let inQuotes = false
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      if (char === '"') {
        inQuotes = !inQuotes
        continue
      }
      if (char === "," && !inQuotes) {
        result.push(current.trim())
        current = ""
        continue
      }
      current += char
    }
    if (current.length || line.endsWith(",")) {
      result.push(current.trim())
    }
    return result
  }

  const handleCsvFile = async (file: File) => {
    setIsUploading(true)
    setUploadStatus(null)
    setUploadError(null)
    try {
      const text = await file.text()
      const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
      if (lines.length < 2) {
        throw new Error("CSV пустой или содержит только заголовок.")
      }
      const headers = splitCsvLine(lines[0]).map((h) => h.replace(/^"|"$/g, ""))
      const rows = lines.slice(1).map((line) => {
        const values = splitCsvLine(line).map((v) => v.replace(/^"|"$/g, ""))
        const entry: Record<string, string> = {}
        headers.forEach((header, idx) => {
          entry[header] = values[idx] ?? ""
        })
        return entry
      })

      const mapped = rows
        .map((row) => ({
          name: row.name || row.Name || "Неизвестный объект",
          region: row.region || row.Region || "",
          resource_type: row.resource_type || row.resourceType || row.ResourceType || "",
          latitude: parseFloat(row.latitude || row.lat || row.Latitude || row.Lat),
          longitude: parseFloat(row.longitude || row.lon || row.Longitude || row.Lon),
          pdf_url: row.pdf_url || row.passport_url || row.Passport || "",
          technical_condition: Number(row.technical_condition || row.condition || row.Condition || 0) || undefined,
        }))
        .filter((row) => !Number.isNaN(row.latitude) && !Number.isNaN(row.longitude))

      setCsvMarkers(mapped)
      setUploadStatus(`Загружено ${mapped.length} объектов`)
      if (!mapped.length) {
        setUploadError("В CSV нет валидных координат.")
      }
    } catch (error) {
      console.error(error)
      setCsvMarkers([])
      setUploadError((error as Error).message || "Не удалось прочитать CSV.")
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
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
      <Header onUploadCsv={requestCsvUpload} isUploading={isUploading} />
      {(uploadStatus || uploadError) && (
        <div className="px-4 pt-2 text-xs">
          {uploadStatus && !uploadError && <span className="text-gray-600">{uploadStatus}</span>}
          {uploadError && <span className="text-red-600">{uploadError}</span>}
        </div>
      )}
      <FilterBar
        filters={filters}
        onFiltersChange={setFilters}
        onShowCritical={() => setFilters((f) => ({ ...f, criticalOnly: !f.criticalOnly }))}
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

          {/* Мини-дашборд */}
          <StatsDashboard objects={filteredObjects} totalObjects={waterObjects.length} />

          {/* Карточка объекта */}
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
        />
      </div>

      {/* Панель сравнения */}
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

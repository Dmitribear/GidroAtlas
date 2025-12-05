"use client"

import { useEffect, useRef } from "react"
import type { WaterObject } from "@/lib/types"

interface MapViewProps {
  objects: WaterObject[]
  selectedId?: string
  hoveredId?: string | null
  onSelect: (object: WaterObject) => void
  onHover: (id: string | null) => void
  onMapClick?: () => void
}

const tileLayers = {
  standard: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: "© OpenStreetMap contributors",
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles © Esri — Sources: Esri, i-cubed, USDA, USGS, AEX, GeoEye",
  },
  terrain: {
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution: "© OpenTopoMap contributors",
  },
} as const

type TileLayerKey = keyof typeof tileLayers

export function MapView({ objects, selectedId, hoveredId, onSelect, onHover, onMapClick }: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<any>(null)
  const tileLayerRef = useRef<any>(null)
  const initIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const initializeMap = () => {
    if (typeof window === "undefined" || !(window as any).L || mapRef.current || !mapContainerRef.current) return

    const L = (window as any).L
    mapRef.current = L.map(mapContainerRef.current, {
      center: [46.0, 76.0],
      zoom: 6,
      zoomControl: false,
    })

    const config = tileLayers.standard
    tileLayerRef.current = L.tileLayer(config.url, {
      attribution: config.attribution,
      maxZoom: 19,
    })
    tileLayerRef.current.addTo(mapRef.current)

    ;(window as any)._leafletMap = mapRef.current
    window.dispatchEvent(new Event("leaflet-map-ready"))
  }

  useEffect(() => {
    initializeMap()

    if (!mapRef.current) {
      initIntervalRef.current = setInterval(() => {
        if (mapRef.current) {
          if (initIntervalRef.current) clearInterval(initIntervalRef.current)
        } else {
          initializeMap()
        }
      }, 150)
    }

    return () => {
      if (initIntervalRef.current) clearInterval(initIntervalRef.current)
      if (mapRef.current) {
        if (tileLayerRef.current) {
          tileLayerRef.current.remove()
          tileLayerRef.current = null
        }
        mapRef.current.remove()
        if ((window as any)._leafletMap === mapRef.current) {
          ;(window as any)._leafletMap = null
        }
        mapRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (!mapRef.current || !onMapClick) return
    const handler = () => onMapClick()
    mapRef.current.on("click", handler)
    return () => {
      mapRef.current?.off("click", handler)
    }
  }, [onMapClick])

  return (
    <div className="w-full h-full relative bg-sky-100 rounded-3xl overflow-hidden">
      <div ref={mapContainerRef} className="absolute inset-0 z-0" />
      <div className="absolute inset-0 bg-gradient-to-b from-sky-50/20 via-transparent to-blue-50/30 pointer-events-none rounded-3xl" />
    </div>
  )
}

import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useMapStore, useFilterStore } from '@/store'
import { MAP_LAYERS, NEPAL_CENTER, NEPAL_DEFAULT_ZOOM } from '@/constants'
import type { MunicipalityListItem } from '@/types'

interface MapContainerProps {
  municipalities?: MunicipalityListItem[]
  onSelectMunicipality: (municipality: MunicipalityListItem) => void
}

export const MapContainer = ({ municipalities = [], onSelectMunicipality }: MapContainerProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const markersRef = useRef<maplibregl.Marker[]>([])

  const { setMapLoaded, setSelectedMunicipality } = useMapStore()
  const { activeMapLayer } = useFilterStore()

  // Initialize MapLibre GL map instance
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    const tileUrl = import.meta.env.VITE_MAP_TILE_URL || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'

    const style: maplibregl.StyleSpecification = {
      version: 8,
      sources: {
        'osm-tiles': {
          type: 'raster',
          tiles: [tileUrl],
          tileSize: 256,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        },
      },
      layers: [
        {
          id: 'osm-tiles-layer',
          type: 'raster',
          source: 'osm-tiles',
          minzoom: 0,
          maxzoom: 19,
        },
      ],
    }

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style,
      center: [NEPAL_CENTER.lng, NEPAL_CENTER.lat],
      zoom: NEPAL_DEFAULT_ZOOM,
      maxBounds: [
        [79.5, 25.5], // Southwest
        [89.0, 31.5], // Northeast
      ],
    })

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right')
    map.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-right')

    map.on('load', () => {
      setMapLoaded(true)
    })

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
      setMapLoaded(false)
    }
  }, [setMapLoaded])

  // Update map markers when municipalities prop changes
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current = []

    municipalities.forEach((m) => {
      const el = document.createElement('div')
      el.className =
        'w-7 h-7 rounded-full bg-terraced-500 border-2 border-white shadow-lg cursor-pointer hover:scale-125 transition-transform flex items-center justify-center text-white text-[10px] font-bold z-10'
      el.innerText = m.name.substring(0, 1)

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([m.center.lng, m.center.lat])
        .addTo(map)

      el.addEventListener('click', () => {
        setSelectedMunicipality(m.id)
        onSelectMunicipality(m)
        map.flyTo({ center: [m.center.lng, m.center.lat], zoom: 10, duration: 1200 })
      })

      markersRef.current.push(marker)
    })
  }, [municipalities, onSelectMunicipality, setSelectedMunicipality])

  return (
    <div className="relative w-full h-full min-h-[500px]">
      <div ref={mapContainerRef} className="absolute inset-0 rounded-2xl overflow-hidden shadow-inner border border-peak-200" />

      {/* Active Layer Indicator Legend */}
      {activeMapLayer && (
        <div className="absolute bottom-6 left-6 z-10 glass-panel p-3 text-xs space-y-2 shadow-lg max-w-xs">
          <p className="font-semibold text-peak-700">{MAP_LAYERS[activeMapLayer].label}</p>
          <p className="text-peak-500 text-2xs">{MAP_LAYERS[activeMapLayer].description}</p>
          <div className="flex h-3 rounded overflow-hidden">
            {MAP_LAYERS[activeMapLayer].colorScale.map((color, i) => (
              <div key={i} className="flex-1" style={{ backgroundColor: color }} />
            ))}
          </div>
          <div className="flex justify-between text-2xs text-peak-500">
            <span>Low (0)</span>
            <span>High (100)</span>
          </div>
        </div>
      )}
    </div>
  )
}

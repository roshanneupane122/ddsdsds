import { useEffect } from 'react'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MAP_LAYERS, NEPAL_CENTER, NEPAL_DEFAULT_ZOOM } from '@/constants'
import { useFilterStore, useMapStore } from '@/store'
import type { MunicipalityListItem } from '@/types'

interface LeafletMapContainerProps {
  municipalities: MunicipalityListItem[]
  onSelectMunicipality: (municipality: MunicipalityListItem) => void
}

const markerIcon = new L.DivIcon({
  className: 'leaflet-municipality-marker',
  html: '<span>•</span>',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -14],
})

const FitSelectedMunicipality = ({ municipality }: { municipality: MunicipalityListItem | null }) => {
  const map = useMap()

  useEffect(() => {
    if (municipality) {
      map.flyTo([municipality.center.lat, municipality.center.lng], 10, { duration: 1.2 })
    }
  }, [map, municipality])

  return null
}

export const LeafletMapContainer = ({ municipalities, onSelectMunicipality }: LeafletMapContainerProps) => {
  const { activeMapLayer } = useFilterStore()
  const { selectedMunicipalityId, setSelectedMunicipality } = useMapStore()
  const selected = municipalities.find((municipality) => municipality.id === selectedMunicipalityId) ?? null

  return (
    <div className="relative w-full h-full min-h-[500px] rounded-2xl overflow-hidden border border-peak-200">
      <MapContainer
        center={[NEPAL_CENTER.lat, NEPAL_CENTER.lng]}
        zoom={NEPAL_DEFAULT_ZOOM}
        minZoom={6}
        maxZoom={18}
        maxBounds={[[25.5, 79.5], [31.5, 89]]}
        className="absolute inset-0 h-full w-full"
        scrollWheelZoom
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url={import.meta.env.VITE_MAP_TILE_URL || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'}
        />
        <FitSelectedMunicipality municipality={selected} />
        {municipalities.map((municipality) => (
          <Marker
            key={municipality.id}
            position={[municipality.center.lat, municipality.center.lng]}
            icon={markerIcon}
            eventHandlers={{
              click: () => {
                setSelectedMunicipality(municipality.id)
                onSelectMunicipality(municipality)
              },
            }}
          >
            <Popup>
              <strong>{municipality.name}</strong>
              <br />
              {municipality.district} · Province {municipality.province}
              <br />
              Population: {municipality.population.toLocaleString()}
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {activeMapLayer && (
        <div className="absolute bottom-6 left-6 z-[1000] glass-panel p-3 text-xs space-y-2 shadow-lg max-w-xs">
          <p className="font-semibold text-peak-700">{MAP_LAYERS[activeMapLayer].label}</p>
          <p className="text-peak-500 text-2xs">{MAP_LAYERS[activeMapLayer].description}</p>
          <div className="flex h-3 rounded overflow-hidden">
            {MAP_LAYERS[activeMapLayer].colorScale.map((color, index) => (
              <div key={index} className="flex-1" style={{ backgroundColor: color }} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

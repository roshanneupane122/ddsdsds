import { useEffect } from 'react'
import { MapContainer, Marker, Popup, TileLayer, Circle, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MAP_LAYERS, NEPAL_CENTER, NEPAL_DEFAULT_ZOOM } from '@/constants'
import { useFilterStore, useMapStore } from '@/store'
import type { MunicipalityListItem } from '@/types'

interface LeafletMapContainerProps {
  municipalities: MunicipalityListItem[]
  selectedMunicipality?: MunicipalityListItem | null
  onSelectMunicipality: (municipality: MunicipalityListItem) => void
}

const markerIcon = new L.DivIcon({
  className: 'leaflet-municipality-marker',
  html: '<div className="w-5 h-5 rounded-full bg-emerald-600 border-2 border-white shadow-md animate-pulse"></div>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12],
})

const FitSelectedMunicipality = ({ municipality }: { municipality: MunicipalityListItem | null }) => {
  const map = useMap()

  useEffect(() => {
    if (municipality) {
      map.flyTo([municipality.center.lat, municipality.center.lng], 12, { duration: 1.2 })
    }
  }, [map, municipality])

  return null
}

export const LeafletMapContainer = ({
  municipalities,
  selectedMunicipality: selectedProp,
  onSelectMunicipality,
}: LeafletMapContainerProps) => {
  const { activeMapLayer } = useFilterStore()
  const { selectedMunicipalityId, setSelectedMunicipality } = useMapStore()

  const selected = selectedProp || municipalities.find((m) => m.id === selectedMunicipalityId) || null

  return (
    <div className="relative w-full h-full min-h-[500px] rounded-2xl overflow-hidden border border-emerald-200 shadow-sm">
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

        {/* Selected Municipality Boundary Highlight */}
        {selected && (
          <Circle
            center={[selected.center.lat, selected.center.lng]}
            radius={4500}
            pathOptions={{
              color: '#059669',
              fillColor: '#10b981',
              fillOpacity: 0.25,
              weight: 3,
              dashArray: '6, 6',
            }}
          />
        )}

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
              <div className="font-sans text-xs space-y-1">
                <strong className="text-emerald-800 text-sm font-bold block">{municipality.name}</strong>
                <p className="text-slate-600 font-medium">{municipality.district} District · Province {municipality.province}</p>
                <p className="text-emerald-700 font-mono font-bold">Pop: {municipality.population.toLocaleString()}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {activeMapLayer && (
        <div className="absolute bottom-6 left-6 z-[1000] bg-white/95 backdrop-blur-md p-3.5 rounded-2xl text-xs space-y-2 shadow-xl max-w-xs border border-emerald-200">
          <p className="font-bold text-slate-900 font-display">{MAP_LAYERS[activeMapLayer].label}</p>
          <p className="text-slate-600 text-[10px] font-medium leading-normal">{MAP_LAYERS[activeMapLayer].description}</p>
          <div className="flex h-2.5 rounded-full overflow-hidden">
            {MAP_LAYERS[activeMapLayer].colorScale.map((color, index) => (
              <div key={index} className="flex-1" style={{ backgroundColor: color }} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

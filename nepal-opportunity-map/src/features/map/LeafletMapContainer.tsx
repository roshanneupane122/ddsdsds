import { useEffect } from 'react'
import { MapContainer, Popup, TileLayer, Circle, CircleMarker, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { MAP_LAYERS, NEPAL_CENTER, NEPAL_DEFAULT_ZOOM, PROVINCES } from '@/constants'
import { useFilterStore, useMapStore } from '@/store'
import type { MunicipalityListItem } from '@/types'
import { Link } from 'react-router-dom'

interface LeafletMapContainerProps {
  municipalities: MunicipalityListItem[]
  selectedMunicipality?: MunicipalityListItem | null
  onSelectMunicipality: (municipality: MunicipalityListItem) => void
}

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
  const { activeMapLayer, addToCompare, compareIds, sectorFilter, gapFilter } = useFilterStore()
  const { selectedMunicipalityId, setSelectedMunicipality } = useMapStore()

  const selected = selectedProp || municipalities.find((m) => m.id === selectedMunicipalityId) || null

  // Function to dynamically calculate styled circle marker properties (color & radius)
  const getStyleForLayer = (municipality: MunicipalityListItem) => {
    if (!activeMapLayer) {
      return {
        color: '#ffffff',
        fillColor: '#10b981',
        radius: 8,
        weight: 1.5,
        fillOpacity: 0.85
      }
    }

    const layer = MAP_LAYERS[activeMapLayer]
    let value = 0

    if (activeMapLayer === 'opportunity') {
      // If a sector filter is active, adjust score dynamically based on sector match
      let sectorBonus = 0
      if (sectorFilter) {
        // Mock sector-based dynamic scoring adjustments
        const nameHash = (municipality.name.length + (sectorFilter.length * 3)) % 10
        sectorBonus = nameHash * 4 - 20
      }
      value = Math.min(Math.max((municipality.economicScore || 50) + sectorBonus, 10), 100)
    } else if (activeMapLayer === 'gap') {
      // If a gap category filter is active, adjust gap score
      let gapBonus = 0
      if (gapFilter) {
        const nameHash = (municipality.name.length + (gapFilter.length * 5)) % 10
        gapBonus = nameHash * 5 - 25
      }
      // Gap score: lower infrastructure readiness = higher gap severity
      value = Math.min(Math.max(100 - (municipality.infrastructureScore || 50) + gapBonus, 5), 100)
    } else {
      const key = layer.dataKey as keyof MunicipalityListItem
      value = Number(municipality[key] || 0)
    }

    // Determine color index (0-4) based on 0-100 score ranges
    let colorIndex = 0
    if (activeMapLayer === 'population') {
      // Normalize population ranges dynamically relative to Rupandehi max population
      const normVal = Math.min((value / 200000) * 100, 100)
      colorIndex = Math.min(Math.floor(normVal / 20), 4)
    } else {
      colorIndex = Math.min(Math.floor(value / 20), 4)
    }

    const fillColor = layer.colorScale[colorIndex] || layer.colorScale[0]
    
    // Circle size scaling (radius from 6px to 22px)
    let radius = 7 + (value / 100) * 15
    if (activeMapLayer === 'population') {
      radius = 6 + Math.min((value / 200000) * 18, 18)
    }

    return {
      color: '#ffffff',
      fillColor,
      radius,
      weight: 1.5,
      fillOpacity: 0.9
    }
  }

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
              fillOpacity: 0.15,
              weight: 2.5,
              dashArray: '6, 6',
            }}
          />
        )}

        {/* Render circle markers for all municipalities */}
        {municipalities.map((municipality) => {
          const style = getStyleForLayer(municipality)
          const isSelected = selected && selected.id === municipality.id
          const isCompared = compareIds.includes(municipality.id)

          return (
            <CircleMarker
              key={municipality.id}
              center={[municipality.center.lat, municipality.center.lng]}
              radius={isSelected ? style.radius + 4 : style.radius}
              pathOptions={{
                color: isSelected ? '#047857' : style.color,
                fillColor: style.fillColor,
                weight: isSelected ? 3.5 : style.weight,
                fillOpacity: style.fillOpacity,
              }}
              eventHandlers={{
                click: () => {
                  setSelectedMunicipality(municipality.id)
                  onSelectMunicipality(municipality)
                },
              }}
            >
              <Popup>
                <div className="p-1 font-sans text-xs space-y-3 min-w-[240px]">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-tight m-0">{municipality.name}</h3>
                    <p className="text-[10px] text-slate-500 font-medium m-0 mt-0.5">
                      {municipality.district} District · {PROVINCES.find(p => p.id === municipality.province)?.name ?? `Province ${municipality.province}`}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 pt-1.5 border-t border-slate-100 font-mono text-[10px]">
                    <div>
                      <span className="text-slate-400 block uppercase font-bold text-[8px] tracking-wide">Population</span>
                      <span className="font-bold text-slate-800">{municipality.population.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block uppercase font-bold text-[8px] tracking-wide">Dev Index</span>
                      <span className="font-bold text-emerald-700">{municipality.economicScore || 50}/100</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block uppercase font-bold text-[8px] tracking-wide">Agri Score</span>
                      <span className="font-bold text-slate-800">{municipality.agricultureScore || 50}/100</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block uppercase font-bold text-[8px] tracking-wide">Opportunity</span>
                      <span className="font-bold text-emerald-800">{municipality.economicScore || 65}/100</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-100">
                    <Link to={`/citizen/municipalities/${municipality.id}`}>
                      <button className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold transition-colors">
                        View Intelligence Profile →
                      </button>
                    </Link>
                    <div className="flex gap-1.5">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation()
                          addToCompare(municipality.id)
                        }}
                        disabled={isCompared}
                        className={`flex-1 py-1 px-2 border rounded-lg text-[9px] font-bold transition-colors ${
                          isCompared ? 'bg-slate-50 border-slate-200 text-slate-400' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        {isCompared ? 'In Compare' : '+ Compare'}
                      </button>
                      <Link to={`/citizen/dashboard?chatContext=${municipality.name}`} className="flex-1">
                        <button className="w-full py-1 px-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[9px] font-bold transition-colors text-center">
                          🤖 Ask AI
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          )
        })}
      </MapContainer>

      {/* Dynamic Layer Legend */}
      {activeMapLayer && MAP_LAYERS[activeMapLayer] && (
        <div className="absolute bottom-6 left-6 z-[1000] bg-white/95 backdrop-blur-md p-3.5 rounded-2xl text-xs space-y-2 shadow-xl max-w-xs border border-emerald-200">
          <p className="font-bold text-slate-900 font-display">{MAP_LAYERS[activeMapLayer].label}</p>
          <p className="text-slate-600 text-[10px] font-medium leading-normal">{MAP_LAYERS[activeMapLayer].description}</p>
          <div className="flex h-2.5 rounded-full overflow-hidden">
            {MAP_LAYERS[activeMapLayer].colorScale.map((color, index) => (
              <div key={index} className="flex-1" style={{ backgroundColor: color }} />
            ))}
          </div>
          <div className="flex justify-between text-[9px] text-slate-500 font-mono font-bold pt-0.5">
            <span>Low ({MAP_LAYERS[activeMapLayer].unit})</span>
            <span>High</span>
          </div>
        </div>
      )}
    </div>
  )
}

import { useEffect } from 'react'
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MAP_LAYERS, NEPAL_CENTER, NEPAL_DEFAULT_ZOOM } from '@/constants'
import { useFilterStore, useMapStore } from '@/store'
import type { MunicipalityListItem } from '@/types'

interface LeafletMapContainerProps {
  municipalities: MunicipalityListItem[]
  geojsonData?: GeoJSON.FeatureCollection | null
  selectedMunicipality?: MunicipalityListItem | null
  hoveredMunicipalityId?: string | null
  onSelectMunicipality: (municipality: MunicipalityListItem) => void
}

const FitBoundsOnGeoJSON = ({ geojsonData, selectedMunicipality }: { geojsonData?: GeoJSON.FeatureCollection | null, selectedMunicipality?: MunicipalityListItem | null }) => {
  const map = useMap()
  
  useEffect(() => {
    // If a municipality is selected, try to find its bounds in the geojson layer
    if (selectedMunicipality && geojsonData && geojsonData.features) {
      const feature = geojsonData.features.find((f: any) => f.properties?.id === selectedMunicipality.id)
      if (feature) {
        try {
          const geoJsonLayer = L.geoJSON(feature as any)
          map.flyToBounds(geoJsonLayer.getBounds(), { padding: [50, 50], duration: 1.2 })
          return
        } catch (e) {
          // Fallback to center point if bounding box extraction fails
          map.flyTo([selectedMunicipality.center.lat, selectedMunicipality.center.lng], 13, { duration: 1.2 })
        }
      } else {
        map.flyTo([selectedMunicipality.center.lat, selectedMunicipality.center.lng], 13, { duration: 1.2 })
      }
    } else if (!selectedMunicipality && geojsonData && geojsonData.features && geojsonData.features.length > 0) {
      // Zoom out to all features (e.g. province) if no specific selection
      try {
        const geoJsonLayer = L.geoJSON(geojsonData as any)
        map.fitBounds(geoJsonLayer.getBounds(), { padding: [20, 20] })
      } catch (e) {}
    }
  }, [map, geojsonData, selectedMunicipality])

  return null
}

export const LeafletMapContainer = ({
  municipalities,
  geojsonData,
  selectedMunicipality: selectedProp,
  hoveredMunicipalityId,
  onSelectMunicipality,
}: LeafletMapContainerProps) => {
  const { activeMapLayer } = useFilterStore()
  const { selectedMunicipalityId, setSelectedMunicipality } = useMapStore()

  const selected = selectedProp || municipalities.find((m) => m.id === selectedMunicipalityId) || null

  const getStyleForFeature = (feature: any) => {
    const isSelected = selected && selected.id === feature.properties.id
    const isHovered = hoveredMunicipalityId && hoveredMunicipalityId === feature.properties.id

    const baseStyle = {
      color: isSelected ? '#047857' : isHovered ? '#10b981' : '#ffffff',
      weight: isSelected ? 3.5 : isHovered ? 2.5 : 1,
      fillOpacity: isSelected ? 0.9 : isHovered ? 0.85 : 0.75,
      dashArray: isSelected ? '' : isHovered ? '' : '3',
    }

    if (!activeMapLayer) {
      return {
        ...baseStyle,
        fillColor: isHovered ? '#059669' : '#10b981',
      }
    }

    const layer = MAP_LAYERS[activeMapLayer]
    
    // Map activeMapLayer to the appropriate property returned by the backend in spatial.py
    const propertyMap: Record<string, string> = {
      opportunity: 'opportunityScore',
      gap: 'infrastructureGapScore',
      population: 'population',
      agriculture: 'agricultureScore',
      tourism: 'tourismScore',
      infrastructure: 'infrastructureScore',
      economic: 'economicScore',
      digital: 'digitalScore'
    }

    const key = propertyMap[activeMapLayer] || 'population'
    const value = Number(feature.properties[key] || 0)

    let colorIndex = 0
    if (activeMapLayer === 'population') {
      const normVal = Math.min((value / 200000) * 100, 100)
      colorIndex = Math.min(Math.floor(normVal / 20), 4)
    } else {
      colorIndex = Math.min(Math.floor(value / 20), 4)
    }

    const fillColor = layer.colorScale[colorIndex] || layer.colorScale[0]

    return {
      ...baseStyle,
      fillColor,
    }
  }

  const onEachFeature = (feature: any, layer: L.Layer) => {
    layer.on({
      click: () => {
        // Find corresponding municipality list item
        const mun = municipalities.find(m => m.id === feature.properties.id)
        if (mun) {
          setSelectedMunicipality(mun.id)
          onSelectMunicipality(mun)
        }
      },
      mouseover: (e) => {
        const layer = e.target as L.Path
        layer.setStyle({
          weight: 2.5,
          color: '#34d399',
          dashArray: '',
          fillOpacity: 0.9
        })
        layer.bringToFront()
      },
      mouseout: (e) => {
        const layer = e.target as L.Path
        // Reset style
        layer.setStyle(getStyleForFeature(feature))
      }
    })
    
    // Simple tooltip instead of bulky Popup (intelligence panel handles the rest)
    if (feature.properties && feature.properties.name) {
      layer.bindTooltip(
        `<div class="font-bold text-xs">${feature.properties.name}</div>
         <div class="text-[10px] text-gray-500">${feature.properties.district} District</div>`,
        { sticky: true, className: 'bg-white/90 backdrop-blur-sm border-none shadow-md rounded-md p-2' }
      )
    }
  }

  return (
    <div className="relative w-full h-full min-h-[500px] rounded-2xl overflow-hidden border border-emerald-200/80 shadow-sm z-0">
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
          url={import.meta.env.VITE_MAP_TILE_URL || 'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png'}
        />
        
        <FitBoundsOnGeoJSON geojsonData={geojsonData} selectedMunicipality={selected} />

        {/* Render true GeoJSON boundaries */}
        {geojsonData && geojsonData.features && (
          <GeoJSON
            key={`geojson-layer-${activeMapLayer}-${selected?.id}-${hoveredMunicipalityId}`}
            data={geojsonData}
            style={getStyleForFeature}
            onEachFeature={onEachFeature}
          />
        )}
      </MapContainer>

      {/* Dynamic Layer Legend */}
      {activeMapLayer && MAP_LAYERS[activeMapLayer] && (
        <div className="absolute bottom-6 left-6 z-[20] bg-white/90 backdrop-blur-xl p-3.5 rounded-2xl text-xs space-y-2 shadow-xl max-w-xs border border-white/60 pointer-events-none">
          <p className="font-bold text-slate-900 font-display">{MAP_LAYERS[activeMapLayer].label}</p>
          <p className="text-slate-600 text-[10px] font-medium leading-normal">{MAP_LAYERS[activeMapLayer].description}</p>
          <div className="flex h-2.5 rounded-full overflow-hidden">
            {MAP_LAYERS[activeMapLayer].colorScale.map((color, index) => (
              <div key={index} className="flex-1" style={{ backgroundColor: color }} />
            ))}
          </div>
          <div className="flex justify-between text-[8px] text-slate-500 font-mono font-bold pt-1 px-0.5">
            <span className="text-center w-1/5">0-20<br/>V. Low</span>
            <span className="text-center w-1/5">21-40<br/>Low</span>
            <span className="text-center w-1/5">41-60<br/>Mod</span>
            <span className="text-center w-1/5">61-80<br/>High</span>
            <span className="text-center w-1/5">81-100<br/>V. High</span>
          </div>
        </div>
      )}
    </div>
  )
}

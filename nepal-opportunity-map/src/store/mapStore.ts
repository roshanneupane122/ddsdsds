import { create } from 'zustand'
import type { Coordinates } from '@/types'

interface MapViewState {
  longitude: number
  latitude: number
  zoom: number
}

interface MapState {
  viewState: MapViewState
  selectedMunicipalityId: string | null
  hoveredMunicipalityId: string | null
  isMapLoaded: boolean
  mapStyle: string

  setViewState: (vs: Partial<MapViewState>) => void
  flyToMunicipality: (center: Coordinates, zoom?: number) => void
  setSelectedMunicipality: (id: string | null) => void
  setHoveredMunicipality: (id: string | null) => void
  setMapLoaded: (loaded: boolean) => void
  resetView: () => void
}

// Nepal's geographic center, zoom shows full country
const NEPAL_DEFAULT_VIEW: MapViewState = {
  longitude: 84.124,
  latitude: 28.394,
  zoom: 6.5,
}

export const useMapStore = create<MapState>((set) => ({
  viewState: NEPAL_DEFAULT_VIEW,
  selectedMunicipalityId: null,
  hoveredMunicipalityId: null,
  isMapLoaded: false,
  mapStyle: import.meta.env.VITE_MAP_STYLE_URL as string,

  setViewState: (vs) =>
    set((state) => ({ viewState: { ...state.viewState, ...vs } })),

  flyToMunicipality: (center, zoom = 11) =>
    set({ viewState: { longitude: center.lng, latitude: center.lat, zoom } }),

  setSelectedMunicipality: (id) => set({ selectedMunicipalityId: id }),
  setHoveredMunicipality: (id) => set({ hoveredMunicipalityId: id }),
  setMapLoaded: (loaded) => set({ isMapLoaded: loaded }),

  resetView: () => set({ viewState: NEPAL_DEFAULT_VIEW, selectedMunicipalityId: null }),
}))

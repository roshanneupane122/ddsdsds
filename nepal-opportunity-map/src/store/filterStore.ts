import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { MunicipalityFilter, RecommendationFilter, ChoroplethLayerId } from '@/types'

const DEFAULT_MUNICIPALITY_FILTER: MunicipalityFilter = {
  search: '',
  province: null,
  type: null,
  minPopulation: null,
  maxPopulation: null,
  minAgricultureScore: null,
  minTourismScore: null,
  minInfrastructureScore: null,
}

const DEFAULT_RECOMMENDATION_FILTER: RecommendationFilter = {
  search: '',
  province: null,
  category: null,
  confidence: null,
  minInvestmentUSD: null,
  maxInvestmentUSD: null,
}

interface FilterState {
  municipalityFilter: MunicipalityFilter
  recommendationFilter: RecommendationFilter
  activeMapLayer: ChoroplethLayerId | null
  compareIds: string[]
  sectorFilter: string | null
  gapFilter: string | null

  // Municipality filter actions
  setMunicipalityFilter: (filter: Partial<MunicipalityFilter>) => void
  resetMunicipalityFilter: () => void

  // Recommendation filter actions
  setRecommendationFilter: (filter: Partial<RecommendationFilter>) => void
  resetRecommendationFilter: () => void

  // Map layer toggle
  setActiveMapLayer: (layer: ChoroplethLayerId | null) => void
  setSectorFilter: (sector: string | null) => void
  setGapFilter: (gap: string | null) => void

  // Compare selection
  addToCompare: (id: string) => void
  removeFromCompare: (id: string) => void
  clearCompare: () => void
}

export const useFilterStore = create<FilterState>()(
  persist(
    (set) => ({
      municipalityFilter: DEFAULT_MUNICIPALITY_FILTER,
      recommendationFilter: DEFAULT_RECOMMENDATION_FILTER,
      activeMapLayer: null,
      compareIds: [],
      sectorFilter: null,
      gapFilter: null,

      setMunicipalityFilter: (filter) =>
        set((state) => ({
          municipalityFilter: { ...state.municipalityFilter, ...filter },
        })),

      resetMunicipalityFilter: () =>
        set({ municipalityFilter: DEFAULT_MUNICIPALITY_FILTER }),

      setRecommendationFilter: (filter) =>
        set((state) => ({
          recommendationFilter: { ...state.recommendationFilter, ...filter },
        })),

      resetRecommendationFilter: () =>
        set({ recommendationFilter: DEFAULT_RECOMMENDATION_FILTER }),

      setActiveMapLayer: (layer) => set({ activeMapLayer: layer }),
      setSectorFilter: (sector) => set({ sectorFilter: sector }),
      setGapFilter: (gap) => set({ gapFilter: gap }),

      addToCompare: (id) =>
        set((state) => {
          if (state.compareIds.includes(id) || state.compareIds.length >= 4) return state
          return { compareIds: [...state.compareIds, id] }
        }),

      removeFromCompare: (id) =>
        set((state) => ({ compareIds: state.compareIds.filter((cid) => cid !== id) })),

      clearCompare: () => set({ compareIds: [] }),
    }),
    {
      name: 'catalyst-filters',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

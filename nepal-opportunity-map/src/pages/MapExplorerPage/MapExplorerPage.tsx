import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { LeafletMapContainer, LayerControls, MunicipalityDetailPanel } from '@/features/map'
import { Input, Badge, SkeletonCard } from '@/components/ui'
import { municipalitiesApi } from '@/services/municipalities.api'
import type { MunicipalityListItem } from '@/types'
import { PROVINCES } from '@/constants'
import { useFilterStore, useMapStore } from '@/store'

export const MapExplorerPage = () => {
  const [selectedMunicipality, setSelectedMunicipality] = useState<MunicipalityListItem | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const { municipalityFilter, setMunicipalityFilter } = useFilterStore()

  // Fetch live municipalities from backend API via React Query
  const { data: municipalitiesData, isLoading } = useQuery({
    queryKey: ['municipalities', 'list', municipalityFilter.province],
    queryFn: () => municipalitiesApi.list({ province: municipalityFilter.province ?? undefined, limit: 200 }),
  })

  // Dynamic search query to API backend
  const { data: apiSearchResults = [] } = useQuery({
    queryKey: ['municipalities-search', searchQuery],
    queryFn: () => municipalitiesApi.search(searchQuery),
    enabled: searchQuery.trim().length > 1,
  })

  const municipalities = municipalitiesData?.data ?? []

  const filteredMunicipalities = useMemo(() => {
    if (!searchQuery.trim()) return municipalities
    const q = searchQuery.toLowerCase().trim()
    
    // Combine API search results with local filtered items
    const map = new Map<string, MunicipalityListItem>()
    
    municipalities.forEach((m) => {
      if (
        m.name.toLowerCase().includes(q) ||
        m.district.toLowerCase().includes(q) ||
        (m.nameNepali && m.nameNepali.toLowerCase().includes(q))
      ) {
        map.set(m.id, m)
      }
    })

    apiSearchResults.forEach((m) => {
      map.set(m.id, m)
    })

    return Array.from(map.values())
  }, [searchQuery, municipalities, apiSearchResults])

  // Ensure map container gets all search results & selected municipality
  const allMapMunicipalities = useMemo(() => {
    const map = new Map<string, MunicipalityListItem>()
    municipalities.forEach((m) => map.set(m.id, m))
    apiSearchResults.forEach((m) => map.set(m.id, m))
    if (selectedMunicipality) {
      map.set(selectedMunicipality.id, selectedMunicipality)
    }
    return Array.from(map.values())
  }, [municipalities, apiSearchResults, selectedMunicipality])

  return (
    <div className="h-[calc(100vh-6.5rem)] flex flex-col space-y-4">
      {/* Top Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-emerald-100/90 shadow-sm">
        <div className="relative flex-1">
          <Input
            placeholder="Search municipality or district (e.g., Pokhara, Kathmandu, Tilottama, Mustang)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={
              <svg className="w-4.5 h-4.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
          />
          {searchQuery.trim() && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-emerald-200 rounded-2xl shadow-xl z-50 max-h-72 overflow-y-auto divide-y divide-emerald-50">
              <div className="p-2 bg-emerald-50/60 text-2xs font-mono font-bold text-emerald-800 uppercase tracking-wider flex justify-between items-center">
                <span>Search Suggestions ({filteredMunicipalities.length})</span>
                <button
                  onClick={() => setSearchQuery('')}
                  className="hover:text-emerald-950 font-bold"
                >
                  Clear Search ✕
                </button>
              </div>
              {filteredMunicipalities.length === 0 ? (
                <div className="p-4 text-xs text-slate-500 font-mono text-center">
                  No municipalities found matching "{searchQuery}"
                </div>
              ) : (
                filteredMunicipalities.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setSelectedMunicipality(m)
                      useMapStore.getState().setSelectedMunicipality(m.id)
                      setSearchQuery('')
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-emerald-50/80 flex justify-between items-center transition-colors group"
                  >
                    <div>
                      <div className="font-bold text-slate-900 text-sm group-hover:text-emerald-800 flex items-center gap-2">
                        <span>{m.name}</span>
                        {m.nameNepali && <span className="text-xs text-slate-400 font-normal">({m.nameNepali})</span>}
                      </div>
                      <span className="text-xs text-slate-500 font-medium block mt-0.5">{m.district} District · Province {m.province}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        Score: {m.economicScore ?? 70}
                      </span>
                      <Badge variant="success" size="sm">Select on map →</Badge>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Province Filter Dropdown */}
        <div className="flex items-center gap-2">
          <select
            value={municipalityFilter.province ?? ''}
            onChange={(e) =>
              setMunicipalityFilter({
                province: e.target.value ? (Number(e.target.value) as any) : null,
              })
            }
            className="px-3.5 py-2.5 bg-white border border-emerald-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 shadow-2xs"
          >
            <option value="">All 7 Provinces</option>
            {PROVINCES.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Layer Controls Bar */}
      <LayerControls />

      {/* Main Interactive GIS Map Canvas */}
      <div className="relative flex-1 rounded-2xl overflow-hidden shadow-sm border border-emerald-100">
        {isLoading ? (
          <SkeletonCard className="w-full h-full" />
        ) : (
          <LeafletMapContainer
            municipalities={allMapMunicipalities}
            selectedMunicipality={selectedMunicipality}
            onSelectMunicipality={(m) => {
              setSelectedMunicipality(m)
              useMapStore.getState().setSelectedMunicipality(m.id)
            }}
          />
        )}
        <MunicipalityDetailPanel
          municipality={selectedMunicipality}
          onClose={() => setSelectedMunicipality(null)}
        />
      </div>
    </div>
  )
}

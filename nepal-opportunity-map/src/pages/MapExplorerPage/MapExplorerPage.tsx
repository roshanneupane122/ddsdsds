import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { LeafletMapContainer, LayerControls, MunicipalityDetailPanel } from '@/features/map'
import { Input, Badge, SkeletonCard } from '@/components/ui'
import { municipalitiesApi } from '@/services/municipalities.api'
import type { MunicipalityListItem } from '@/types'
import { PROVINCES } from '@/constants'
import { useFilterStore } from '@/store'

export const MapExplorerPage = () => {
  const [selectedMunicipality, setSelectedMunicipality] = useState<MunicipalityListItem | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const { municipalityFilter, setMunicipalityFilter } = useFilterStore()

  // Fetch live municipalities from backend API via React Query
  const { data: municipalitiesData, isLoading } = useQuery({
    queryKey: ['municipalities', 'list', municipalityFilter.province],
    queryFn: () => municipalitiesApi.list({ province: municipalityFilter.province ?? undefined }),
  })

  const municipalities = municipalitiesData?.data ?? []

  const filteredMunicipalities = useMemo(() => {
    if (!searchQuery) return municipalities
    const q = searchQuery.toLowerCase()
    return municipalities.filter(
      (m) => m.name.toLowerCase().includes(q) || m.district.toLowerCase().includes(q)
    )
  }, [searchQuery, municipalities])

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col space-y-4">
      {/* Top Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-peak-100 shadow-sm">
        <div className="relative flex-1">
          <Input
            placeholder="Search municipality or district (e.g., Pokhara, Kathmandu, Tilottama)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
          />
          {searchQuery && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-peak-200 rounded-xl shadow-xl z-30 max-h-60 overflow-y-auto">
              {filteredMunicipalities.map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    setSelectedMunicipality(m)
                    setSearchQuery('')
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-terraced-50 flex justify-between items-center border-b border-peak-50 last:border-0"
                >
                  <div>
                    <span className="font-semibold text-peak-700">{m.name}</span>
                    <span className="text-xs text-peak-400 block">{m.district} District</span>
                  </div>
                  <Badge variant="muted" size="sm">Prov {m.province}</Badge>
                </button>
              ))}
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
            className="px-3 py-2 bg-peak-50 border border-peak-200 rounded-lg text-xs font-medium text-peak-700 focus:outline-none focus:ring-2 focus:ring-terraced-400"
          >
            <option value="">All Provinces (7)</option>
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
      <div className="relative flex-1 rounded-2xl overflow-hidden shadow-inner">
        {isLoading ? (
          <SkeletonCard className="w-full h-full" />
        ) : (
          <LeafletMapContainer
            municipalities={municipalities}
            onSelectMunicipality={(m) => setSelectedMunicipality(m)}
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

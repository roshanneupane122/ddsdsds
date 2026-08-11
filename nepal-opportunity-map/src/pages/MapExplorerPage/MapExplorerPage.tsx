import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { LeafletMapContainer, LayerControls, MunicipalityDetailPanel, AiAnalysisDrawer, ComparePanel } from '@/features/map'
import { SkeletonCard } from '@/components/ui'
import { municipalitiesApi } from '@/services/municipalities.api'
import type { MunicipalityListItem } from '@/types'
import { PROVINCES } from '@/constants'
import { useFilterStore, useMapStore } from '@/store'

export const MapExplorerPage = () => {
  const [selectedMunicipality, setSelectedMunicipality] = useState<MunicipalityListItem | null>(null)
  const [hoveredMunicipalityId, setHoveredMunicipalityId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchResultsOpen, setIsSearchResultsOpen] = useState(false)
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false)
  const [isMethodologyOpen, setIsMethodologyOpen] = useState(false)
  const { municipalityFilter, setMunicipalityFilter, addToCompare, compareIds } = useFilterStore()

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

  // Fetch GeoJSON spatial data
  const { data: geojsonData, isLoading: isGeoJsonLoading } = useQuery({
    queryKey: ['spatial', 'layers', useFilterStore.getState().sectorFilter, useFilterStore.getState().gapFilter],
    queryFn: () => municipalitiesApi.geojson(
      useFilterStore.getState().sectorFilter ?? undefined,
      useFilterStore.getState().gapFilter ?? undefined
    ),
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

  const showSearchResultsDrawer = isSearchResultsOpen

  return (
    <div className="relative h-[calc(100vh-6rem)] w-full overflow-hidden rounded-2xl border border-emerald-100 shadow-sm flex flex-col bg-slate-950">
      
      {/* 1. TOP FLOATING COMMAND & SEARCH BAR */}
      <div className="absolute top-4 left-4 right-4 z-30 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        
        {/* Search Bar Container */}
        <div className="pointer-events-auto flex items-center gap-2 bg-white/95 backdrop-blur-xl p-2 px-3.5 rounded-2xl border border-white/80 shadow-xl flex-1 max-w-lg transition-all focus-within:ring-2 focus-within:ring-emerald-500/30">
          <svg className="w-5 h-5 text-emerald-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search municipality or district (e.g. Butwal, Tilottama, Rupandehi)..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              if (e.target.value.trim().length > 0) setIsSearchResultsOpen(true)
            }}
            onFocus={() => {
              if (filteredMunicipalities.length > 0) setIsSearchResultsOpen(true)
            }}
            className="w-full bg-transparent text-xs font-medium text-slate-800 focus:outline-none placeholder:text-slate-400"
          />
          {searchQuery.trim() && (
            <button
              onClick={() => {
                setSearchQuery('')
                setIsSearchResultsOpen(false)
              }}
              className="text-slate-400 hover:text-slate-700 text-xs font-bold px-1.5 py-0.5 rounded-full hover:bg-slate-100 transition-colors"
            >
              ✕
            </button>
          )}
          <button
            onClick={() => setIsSearchResultsOpen(!isSearchResultsOpen)}
            className={`px-2.5 py-1 rounded-xl text-2xs font-bold transition-colors flex items-center gap-1 font-mono uppercase tracking-wider ${
              isSearchResultsOpen
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/60'
            }`}
            title="Toggle Search Results Explorer Drawer"
          >
            <span>{filteredMunicipalities.length} items</span>
            <span>{isSearchResultsOpen ? '◀' : '▶'}</span>
          </button>
        </div>

        {/* Right Action Pill Group */}
        <div className="pointer-events-auto flex items-center gap-2 flex-wrap">
          {/* Floating Layer Controls Widget */}
          <LayerControls />

          {/* Province Filter Dropdown */}
          <select
            value={municipalityFilter.province ?? ''}
            onChange={(e) =>
              setMunicipalityFilter({
                province: e.target.value ? (Number(e.target.value) as any) : null,
              })
            }
            className="px-3.5 py-2.5 bg-white/95 backdrop-blur-xl border border-white/80 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 shadow-md cursor-pointer transition-all hover:bg-white"
          >
            <option value="">All 7 Provinces</option>
            {PROVINCES.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Methodology Modal Trigger */}
          <button
            onClick={() => setIsMethodologyOpen(true)}
            className="px-3.5 py-2.5 bg-white/95 backdrop-blur-xl hover:bg-white border border-white/80 rounded-xl text-xs font-bold text-slate-700 shadow-md transition-colors flex items-center gap-1.5"
          >
            <span>Data Info</span>
            <span className="text-emerald-600 font-mono">ℹ️</span>
          </button>
        </div>
      </div>

      {/* 2. FLOATING SEARCH RESULTS SIDE DRAWER */}
      {showSearchResultsDrawer && (
        <div className="absolute top-20 left-4 z-40 w-80 sm:w-96 max-h-[calc(100vh-11rem)] bg-white/95 backdrop-blur-2xl border border-emerald-100 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-slide-in-left">
          <div className="p-3.5 bg-emerald-700 text-white font-mono font-bold text-xs flex justify-between items-center shadow-sm">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span>{searchQuery ? `Search Results (${filteredMunicipalities.length})` : `Municipalities Explorer (${filteredMunicipalities.length})`}</span>
            </div>
            <button
              onClick={() => setIsSearchResultsOpen(false)}
              className="text-emerald-100 hover:text-white font-bold p-1 rounded hover:bg-emerald-600 transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="overflow-y-auto divide-y divide-slate-100 p-2 space-y-1.5 max-h-[calc(100vh-15rem)]">
            {filteredMunicipalities.length === 0 ? (
              <div className="p-6 text-xs text-slate-500 font-mono text-center space-y-2">
                <p>No municipalities found matching "{searchQuery}"</p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-emerald-700 font-bold underline text-2xs uppercase tracking-wider"
                >
                  Clear search term
                </button>
              </div>
            ) : (
              filteredMunicipalities.map((m) => {
                const isSelected = selectedMunicipality?.id === m.id
                const isCompared = compareIds.includes(m.id)
                const prov = PROVINCES.find((p) => p.id === m.province)

                return (
                  <div
                    key={m.id}
                    onMouseEnter={() => setHoveredMunicipalityId(m.id)}
                    onMouseLeave={() => setHoveredMunicipalityId(null)}
                    onClick={() => {
                      setSelectedMunicipality(m)
                      useMapStore.getState().setSelectedMunicipality(m.id)
                      setIsSearchResultsOpen(false)
                    }}
                    className={`p-3 rounded-xl transition-all cursor-pointer border text-left flex flex-col justify-between space-y-2 group ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-400 ring-1 ring-emerald-400/50 shadow-sm'
                        : 'bg-white/80 border-slate-100 hover:bg-emerald-50/50 hover:border-emerald-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-slate-900 text-sm group-hover:text-emerald-800 flex items-center gap-1.5">
                          <span>{m.name}</span>
                          {m.nameNepali && <span className="text-xs text-slate-400 font-normal">({m.nameNepali})</span>}
                        </div>
                        <span className="text-xs text-slate-500 font-medium block mt-0.5">
                          {m.district} District · {prov?.name ?? `Province ${m.province}`}
                        </span>
                      </div>
                      <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full flex-shrink-0">
                        Score: {m.economicScore ?? 70}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-2xs">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          addToCompare(m.id)
                        }}
                        disabled={isCompared}
                        className={`font-mono font-bold px-2 py-1 rounded transition-colors ${
                          isCompared
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : 'bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-900'
                        }`}
                      >
                        {isCompared ? '✓ Compared' : '+ Compare'}
                      </button>
                      <span className="text-emerald-700 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                        Focus Map 🎯
                      </span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}

      {/* 3. MAIN FULL-BLEED GIS MAP CANVAS */}
      <div className="relative w-full h-full flex-1">
        {isLoading || isGeoJsonLoading ? (
          <SkeletonCard className="w-full h-full" />
        ) : (
          <LeafletMapContainer
            municipalities={allMapMunicipalities}
            geojsonData={geojsonData}
            selectedMunicipality={selectedMunicipality}
            hoveredMunicipalityId={hoveredMunicipalityId}
            onSelectMunicipality={(m) => {
              setSelectedMunicipality(m)
              useMapStore.getState().setSelectedMunicipality(m.id)
            }}
          />
        )}

        {/* 4. MUNICIPALITY INTELLIGENCE PANEL (SLIDE OVER) */}
        <MunicipalityDetailPanel
          municipality={selectedMunicipality}
          onClose={() => setSelectedMunicipality(null)}
          onAskAi={() => setIsAiDrawerOpen(true)}
        />
      </div>

      {/* AI Analysis Drawer */}
      <AiAnalysisDrawer
        isOpen={isAiDrawerOpen}
        onClose={() => setIsAiDrawerOpen(false)}
        municipalityName={selectedMunicipality?.name || ''}
      />

      {/* Data & Methodology Dialog */}
      {isMethodologyOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[3000] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative animate-fade-in">
            <button onClick={() => setIsMethodologyOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 font-bold">✕</button>
            <h2 className="text-xl font-bold font-display text-slate-900 mb-4">Data & Methodology</h2>
            
            <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
              <div>
                <h3 className="font-bold text-emerald-800 mb-1">🌍 Real Data (Open Data)</h3>
                <p><strong>Geometries & Boundaries:</strong> Municipality polygons and borders are sourced from official Nepal GIS open datasets. They accurately represent the administrative divisions.</p>
                <p className="mt-1"><strong>Base Demographics:</strong> High-level population counts are aligned with standard census datasets.</p>
              </div>

              <div>
                <h3 className="font-bold text-blue-800 mb-1">🤖 Machine Learning Engine (XGBoost)</h3>
                <p>The core ML engine is an <strong>XGBClassifier</strong> predicting <em>business feasibility based on available synthetic digital-twin indicators</em>.</p>
                <p className="mt-1 text-xs">
                  <strong>Target:</strong> `recommended_business` (Categorical)<br/>
                  <strong>Features:</strong> 32 features including distances, infrastructure percentages, footfall, and relative municipal indices.<br/>
                  <strong>Dataset:</strong> `rupandehi_digital_twin_varied.csv`
                </p>
                <p className="mt-1">This ML feasibility score contributes 30% to the deterministic Sector Opportunity Engine, providing a scientifically honest decoupling of ML confidence from hard infrastructural realities.</p>
              </div>

              <div>
                <h3 className="font-bold text-purple-800 mb-1">📊 Deterministic Scoring & Ensembles</h3>
                <p>The <strong>Opportunity Score</strong> is a deterministic weighted ensemble: 30% ML Feasibility + 70% Heuristic constraints (Purchasing power, Infrastructure readiness, Accessibility). High competition or risk deterministically penalizes the score.</p>
                <p className="mt-1">The <strong>Gap Scores</strong> are calculated by comparing current infrastructure metrics against baseline severity thresholds (e.g., &lt;80% electricity = High Severity Gap).</p>
              </div>

              <div>
                <h3 className="font-bold text-orange-800 mb-1">🧪 Synthetic Digital Twin (FYP Prototype)</h3>
                <p>To demonstrate the platform's analytical capabilities, ward-level micro-indicators (electricity %, internet %, footfall) have been synthetically generated. These indicators are mathematically correlated (e.g., high internet access logically drives the digital readiness score) to ensure the AI engine analyzes a realistic, logically consistent digital twin.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Compare Floating Bottom Bar */}
      <ComparePanel />
    </div>
  )
}


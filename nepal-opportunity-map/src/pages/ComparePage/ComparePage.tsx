import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { municipalitiesApi } from '@/services/municipalities.api'
import { ComparisonTable } from '@/features/dashboard/ComparisonTable'
import { Button, Card, EmptyState, Input, SkeletonCard, Badge } from '@/components/ui'
import { useFilterStore } from '@/store'

export const ComparePage = () => {
  const { compareIds, addToCompare, removeFromCompare, clearCompare } = useFilterStore()
  const [searchQuery, setSearchQuery] = useState('')

  const { data: allMunicipalitiesData } = useQuery({
    queryKey: ['municipalities', 'list'],
    queryFn: () => municipalitiesApi.list({ limit: 200 }),
  })
  const allMunicipalities = allMunicipalitiesData?.data ?? []

  const { data: apiSearchResults = [] } = useQuery({
    queryKey: ['municipalities-compare-search', searchQuery],
    queryFn: () => municipalitiesApi.search(searchQuery),
    enabled: searchQuery.trim().length > 1,
  })

  const searchSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return []
    const q = searchQuery.toLowerCase().trim()
    const map = new Map()

    allMunicipalities.forEach((m) => {
      if (m.name.toLowerCase().includes(q) || m.district.toLowerCase().includes(q)) {
        map.set(m.id, m)
      }
    })

    apiSearchResults.forEach((m) => {
      map.set(m.id, m)
    })

    return Array.from(map.values()).slice(0, 8)
  }, [searchQuery, allMunicipalities, apiSearchResults])

  const { data: compareData = [], isLoading } = useQuery({
    queryKey: ['municipalities', 'compare', compareIds],
    queryFn: () => municipalitiesApi.compare(compareIds),
    enabled: compareIds.length > 0,
  })

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-slate-900 tracking-tight">Municipality Comparison Engine</h1>
          <p className="text-sm text-slate-600 mt-1">Compare up to 4 local units side-by-side across economic, agricultural, and infrastructure metrics.</p>
        </div>
        <div className="flex gap-2">
          {compareIds.length === 1 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={async () => {
                try {
                  const mId = compareIds[0];
                  // Find name from allMunicipalities
                  const mName = allMunicipalities.find(m => m.id === mId)?.name;
                  if (!mName) return;
                  
                  // Use dynamic import or direct fetch to avoid circular dependency
                  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/v1/analyze/similarity?municipality_name=${mName}&top_k=3`);
                  if (response.ok) {
                    const data = await response.json();
                    data.similar_municipalities.forEach((sm: any) => {
                      const match = allMunicipalities.find(m => m.name === sm.municipality_name);
                      if (match) addToCompare(match.id);
                    });
                  }
                } catch (e) {
                  console.error("Failed to fetch similar municipalities", e);
                }
              }} 
              className="self-start md:self-auto text-xs text-emerald-600 border-emerald-200 hover:bg-emerald-50"
            >
              ✨ Find Similar (AI)
            </Button>
          )}
          {compareIds.length > 0 && (
            <Button variant="outline" size="sm" onClick={clearCompare} className="self-start md:self-auto text-xs text-red-600 border-red-200 hover:bg-red-50">
              Clear Selection ({compareIds.length})
            </Button>
          )}
        </div>
      </div>

      {/* Municipality Search & Selection Bar */}
      <Card padding="md" className="bg-white border border-emerald-100 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Input
              placeholder="Search municipality to add to comparison (e.g. Pokhara, Kathmandu, Ilam, Mustang)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={
                <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
            />
            {searchQuery.trim() && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-emerald-200 rounded-2xl shadow-xl z-50 max-h-60 overflow-y-auto divide-y divide-emerald-50">
                {searchSuggestions.length === 0 ? (
                  <div className="p-3 text-xs text-slate-500 font-mono text-center">No municipality matches "{searchQuery}"</div>
                ) : (
                  searchSuggestions.map((m) => {
                    const isAdded = compareIds.includes(m.id)
                    return (
                      <button
                        key={m.id}
                        disabled={isAdded || compareIds.length >= 4}
                        onClick={() => {
                          addToCompare(m.id)
                          setSearchQuery('')
                        }}
                        className={`w-full px-4 py-2.5 text-left text-xs flex justify-between items-center hover:bg-emerald-50 transition-colors ${isAdded ? 'opacity-50 cursor-not-allowed bg-slate-50' : ''}`}
                      >
                        <div>
                          <span className="font-bold text-slate-900">{m.name}</span>
                          <span className="text-slate-500 font-mono block text-[10px]">{m.district} District · Prov {m.province}</span>
                        </div>
                        {isAdded ? (
                          <Badge variant="muted" size="sm">Added ✓</Badge>
                        ) : (
                          <Badge variant="success" size="sm">+ Add to Compare</Badge>
                        )}
                      </button>
                    )
                  })
                )}
              </div>
            )}
          </div>
        </div>

        {/* Selected Badges */}
        {compareIds.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-emerald-100">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">Comparing ({compareIds.length}/4):</span>
            {allMunicipalities
              .filter((m) => compareIds.includes(m.id))
              .map((m) => (
                <span
                  key={m.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300"
                >
                  {m.name}
                  <button
                    onClick={() => removeFromCompare(m.id)}
                    className="hover:text-red-700 text-emerald-800 font-bold ml-1 text-sm"
                  >
                    ×
                  </button>
                </span>
              ))}
          </div>
        )}
      </Card>

      {/* Main Table or Empty State */}
      {isLoading ? (
        <SkeletonCard className="h-96" />
      ) : compareIds.length === 0 ? (
        <EmptyState
          title="No Municipalities Selected for Comparison"
          description="Use the search bar above or select municipalities on the Map Explorer to compare indicators side-by-side."
          action={
            <Link to="/citizen/map">
              <Button>Select Municipalities on Map Explorer →</Button>
            </Link>
          }
        />
      ) : (
        <ComparisonTable items={compareData} />
      )}
    </div>
  )
}

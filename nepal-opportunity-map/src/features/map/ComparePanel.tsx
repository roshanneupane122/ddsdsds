import { useState, useEffect } from 'react'
import { SkeletonCard } from '@/components/ui'
import { useFilterStore } from '@/store'
import { municipalitiesApi } from '@/services/municipalities.api'
import { formatNumber } from '@/lib/formatters'

export const ComparePanel = () => {
  const { compareIds, removeFromCompare, clearCompare } = useFilterStore()
  const [municipalities, setMunicipalities] = useState<any[]>([])
  const [intelData, setIntelData] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      if (compareIds.length === 0) {
        setMunicipalities([])
        setIntelData({})
        return
      }
      
      setLoading(true)
      try {
        // Fetch base details for all in compare
        const muns = await municipalitiesApi.compare(compareIds)
        setMunicipalities(muns)
        
        // Fetch intelligence for each
        const intelObj: Record<string, any> = {}
        await Promise.all(
          muns.map(async (m) => {
            try {
              const data = await municipalitiesApi.getIntelligence(m.id)
              intelObj[m.id] = data
            } catch (e) {
              console.error(`Failed to fetch intel for ${m.id}`)
            }
          })
        )
        setIntelData(intelObj)
      } catch (err) {
        console.error("Failed to load compare data", err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [compareIds])

  if (compareIds.length === 0) return null

  // Helper to find winner in a metric
  const getWinner = (metricFn: (intel: any) => number, inverse = false) => {
    let bestScore = inverse ? Infinity : -Infinity
    let winnerId = null
    
    for (const m of municipalities) {
      const val = metricFn(intelData[m.id])
      if (val !== undefined && val !== null && !isNaN(val)) {
        if ((!inverse && val > bestScore) || (inverse && val < bestScore)) {
          bestScore = val
          winnerId = m.id
        }
      }
    }
    return winnerId
  }

  // Calculate insights
  const strongestEconomy = getWinner(i => i?.development_index?.economic?.score)
  const bestDigital = getWinner(i => i?.development_index?.digital?.score)
  // Inverse severity for gap: sum of scores
  const largestGap = getWinner(i => {
    if (!i?.gaps) return 0
    return i.gaps.reduce((acc: number, g: any) => acc + (g.score || 0), 0)
  })

  return (
    <div className="fixed inset-x-0 bottom-0 z-[2500] animate-slide-up bg-white/95 backdrop-blur-xl border-t border-emerald-200 shadow-2xl">
      <div className="flex justify-between items-center p-3 border-b border-emerald-100 bg-slate-900 text-white">
        <h3 className="font-bold flex items-center gap-2">
          <span>📊</span>
          Municipality Comparison ({municipalities.length})
        </h3>
        <div className="flex gap-2">
          <button onClick={clearCompare} className="text-xs text-slate-300 hover:text-white px-2">Clear All</button>
        </div>
      </div>
      
      <div className="p-4 overflow-x-auto">
        {loading ? (
          <div className="flex gap-4">
            <SkeletonCard className="h-48 w-64 shrink-0" />
            <SkeletonCard className="h-48 w-64 shrink-0" />
          </div>
        ) : (
          <div className="flex gap-4 min-w-max pb-2">
            {/* The Insights Column */}
            <div className="w-48 shrink-0 flex flex-col gap-2 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Automated Insights</h4>
              
              <div className="text-[10px] space-y-2">
                <div>
                  <span className="block text-slate-500 font-bold mb-0.5">Strongest Economy</span>
                  <span className="font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                    {municipalities.find(m => m.id === strongestEconomy)?.name || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="block text-slate-500 font-bold mb-0.5">Best Digital Readiness</span>
                  <span className="font-bold text-blue-800 bg-blue-100 px-1.5 py-0.5 rounded">
                    {municipalities.find(m => m.id === bestDigital)?.name || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="block text-slate-500 font-bold mb-0.5">Largest Development Gap</span>
                  <span className="font-bold text-red-800 bg-red-100 px-1.5 py-0.5 rounded">
                    {municipalities.find(m => m.id === largestGap)?.name || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Municipality Cards */}
            {municipalities.map(m => {
              const intel = intelData[m.id]
              return (
                <div key={m.id} className="w-64 shrink-0 bg-white border border-slate-200 rounded-xl overflow-hidden relative">
                  <button 
                    onClick={() => removeFromCompare(m.id)}
                    className="absolute top-2 right-2 w-5 h-5 bg-slate-100 hover:bg-red-100 hover:text-red-600 rounded-full flex items-center justify-center text-slate-400 transition-colors"
                  >
                    ✕
                  </button>
                  <div className="p-3 bg-slate-50 border-b border-slate-100">
                    <h4 className="font-bold text-slate-900 truncate pr-6">{m.name}</h4>
                    <p className="text-[9px] text-slate-500 uppercase">{m.district}</p>
                  </div>
                  
                  <div className="p-3 space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div>
                        <span className="block text-slate-400 font-bold uppercase mb-0.5">Population</span>
                        <span className="font-mono font-bold text-slate-800">{formatNumber(m.population)}</span>
                      </div>
                      <div>
                        <span className="block text-slate-400 font-bold uppercase mb-0.5">Overall Index</span>
                        <span className="font-mono font-bold text-emerald-600">{intel?.development_index?.overall?.score || 0}/100</span>
                      </div>
                      <div>
                        <span className="block text-slate-400 font-bold uppercase mb-0.5">Economic</span>
                        <span className="font-mono font-bold text-slate-700">{intel?.development_index?.economic?.score || 0}/100</span>
                      </div>
                      <div>
                        <span className="block text-slate-400 font-bold uppercase mb-0.5">Infrastructure</span>
                        <span className="font-mono font-bold text-slate-700">{intel?.development_index?.infrastructure?.score || 0}/100</span>
                      </div>
                    </div>

                    {intel?.gaps && intel.gaps.length > 0 && (
                      <div className="pt-2 border-t border-slate-100">
                        <span className="block text-[10px] text-red-500 font-bold uppercase mb-1">Top Gap</span>
                        <div className="text-[10px] bg-red-50 text-red-800 px-2 py-1 rounded truncate">
                          {intel.gaps[0].type} ({intel.gaps[0].severity})
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
            
            {municipalities.length < 4 && (
              <div className="w-48 shrink-0 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-xs text-slate-400 font-bold p-4 text-center">
                Select another municipality on the map to add it here
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

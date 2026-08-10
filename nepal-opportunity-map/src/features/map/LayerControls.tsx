import { useFilterStore } from '@/store'
import { MAP_LAYER_LIST } from '@/constants'
import type { ChoroplethLayerId } from '@/types'

const SECTORS = ['Agriculture', 'Tourism', 'Retail', 'Logistics', 'Manufacturing', 'Services']
const GAPS = ['Cold Storage', 'Healthcare', 'Warehouse', 'Market', 'Transport']

export const LayerControls = () => {
  const {
    activeMapLayer,
    setActiveMapLayer,
    sectorFilter,
    setSectorFilter,
    gapFilter,
    setGapFilter,
  } = useFilterStore()

  const handleLayerClick = (layerId: ChoroplethLayerId) => {
    const isActive = activeMapLayer === layerId
    setActiveMapLayer(isActive ? null : layerId)
    // Clear sub-filters when switching layers
    setSectorFilter(null)
    setGapFilter(null)
  }

  const handleClearAll = () => {
    setActiveMapLayer(null)
    setSectorFilter(null)
    setGapFilter(null)
  }

  return (
    <div className="glass-panel p-4 space-y-4 border border-white/60">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-peak-700 flex items-center gap-1.5 font-mono">
          <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          GIS Intelligence Layers
        </h3>
        {activeMapLayer && (
          <button
            onClick={handleClearAll}
            className="text-2xs font-bold text-emerald-700 hover:text-emerald-950 transition-colors uppercase tracking-wider font-mono"
          >
            Clear Layer ✕
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
        {MAP_LAYER_LIST.map((layer) => {
          const isActive = activeMapLayer === layer.id
          return (
            <button
              key={layer.id}
              onClick={() => handleLayerClick(layer.id as ChoroplethLayerId)}
              className={`p-2.5 rounded-xl text-left text-xs transition-all border ${
                isActive
                  ? 'bg-emerald-50 border-emerald-400 text-emerald-800 shadow-xs font-bold'
                  : 'bg-white/80 border-slate-200 text-slate-600 hover:bg-white hover:border-emerald-200'
              }`}
            >
              <div className="flex items-center justify-between gap-1">
                <span className="truncate">{layer.label}</span>
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: layer.colorScale[3] }}
                />
              </div>
            </button>
          )
        })}
      </div>

      {/* Dynamic Sector Filter for Business Opportunity Layer */}
      {activeMapLayer === 'opportunity' && (
        <div className="pt-3 border-t border-emerald-50/60 animate-fade-in space-y-2">
          <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
            Filter Opportunity Heatmap by Sector:
          </p>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setSectorFilter(null)}
              className={`px-3 py-1.5 rounded-lg text-2xs font-bold transition-all uppercase tracking-wider font-mono ${
                !sectorFilter
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-100'
              }`}
            >
              All Sectors
            </button>
            {SECTORS.map((sector) => {
              const isSelected = sectorFilter === sector
              return (
                <button
                  key={sector}
                  onClick={() => setSectorFilter(sector)}
                  className={`px-3 py-1.5 rounded-lg text-2xs font-bold transition-all uppercase tracking-wider font-mono ${
                    isSelected
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-100'
                  }`}
                >
                  {sector}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Dynamic Category Filter for Infrastructure Gap Layer */}
      {activeMapLayer === 'gap' && (
        <div className="pt-3 border-t border-emerald-50/60 animate-fade-in space-y-2">
          <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
            Filter Infrastructure Gap Severity:
          </p>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setGapFilter(null)}
              className={`px-3 py-1.5 rounded-lg text-2xs font-bold transition-all uppercase tracking-wider font-mono ${
                !gapFilter
                  ? 'bg-red-600 text-white'
                  : 'bg-red-50 hover:bg-red-100 text-red-800 border border-red-100'
              }`}
            >
              All Gaps
            </button>
            {GAPS.map((gap) => {
              const isSelected = gapFilter === gap
              return (
                <button
                  key={gap}
                  onClick={() => setGapFilter(gap)}
                  className={`px-3 py-1.5 rounded-lg text-2xs font-bold transition-all uppercase tracking-wider font-mono ${
                    isSelected
                      ? 'bg-red-600 text-white'
                      : 'bg-red-50 hover:bg-red-100 text-red-800 border border-red-100'
                  }`}
                >
                  {gap}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

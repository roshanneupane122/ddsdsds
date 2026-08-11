import { useState, useRef, useEffect } from 'react'
import { useFilterStore } from '@/store'
import { MAP_LAYER_LIST } from '@/constants'
import type { ChoroplethLayerId } from '@/types'

const SECTORS = ['Agriculture', 'Tourism', 'Retail', 'Logistics', 'Manufacturing', 'Services']
const GAPS = ['Cold Storage', 'Healthcare', 'Warehouse', 'Market', 'Transport']

interface LayerControlsProps {
  className?: string
}

export const LayerControls = ({ className = '' }: LayerControlsProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)

  const {
    activeMapLayer,
    setActiveMapLayer,
    sectorFilter,
    setSectorFilter,
    gapFilter,
    setGapFilter,
  } = useFilterStore()

  // Close popover on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const activeLayerObj = MAP_LAYER_LIST.find((l) => l.id === activeMapLayer)

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
    <div className={`relative z-30 ${className}`} ref={popoverRef}>
      {/* Floating Trigger Pill */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md backdrop-blur-xl border ${
            activeMapLayer
              ? 'bg-emerald-700/90 text-white border-emerald-500 shadow-emerald-900/20'
              : 'bg-white/90 text-slate-800 border-white/80 hover:bg-white'
          }`}
        >
          <svg className={`w-4 h-4 ${activeMapLayer ? 'text-emerald-200' : 'text-emerald-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <span className="truncate">
            {activeLayerObj ? `Layer: ${activeLayerObj.label}` : 'GIS Layers'}
          </span>
          <span className="text-2xs opacity-75 font-mono">
            {isOpen ? '▲' : '▼'}
          </span>
        </button>

        {activeMapLayer && (
          <button
            onClick={handleClearAll}
            className="p-2 rounded-xl bg-white/80 hover:bg-white text-slate-500 hover:text-red-600 border border-white/80 shadow-md backdrop-blur-xl text-xs transition-colors"
            title="Clear Layer"
          >
            ✕
          </button>
        )}
      </div>

      {/* Floating Layer Controls Popover Card */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-2 w-80 sm:w-96 max-h-[80vh] overflow-y-auto bg-white/95 backdrop-blur-2xl border border-emerald-100 rounded-2xl shadow-2xl p-4 space-y-4 animate-scale-up z-50">
          <div className="flex items-center justify-between border-b border-emerald-50 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5 font-mono">
              <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              Select Heatmap Layer
            </h3>
            {activeMapLayer && (
              <button
                onClick={handleClearAll}
                className="text-2xs font-bold text-emerald-700 hover:text-red-600 uppercase tracking-wider font-mono transition-colors"
              >
                Reset Layer
              </button>
            )}
          </div>

          {/* Grid of 8 Layer Chips */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {MAP_LAYER_LIST.map((layer) => {
              const isActive = activeMapLayer === layer.id
              return (
                <button
                  key={layer.id}
                  onClick={() => handleLayerClick(layer.id as ChoroplethLayerId)}
                  className={`p-2.5 rounded-xl text-left text-xs transition-all border flex items-center justify-between gap-2 ${
                    isActive
                      ? 'bg-emerald-50/90 border-emerald-400 text-emerald-900 font-bold shadow-sm ring-1 ring-emerald-400/40'
                      : 'bg-slate-50/70 border-slate-200/80 text-slate-700 hover:bg-emerald-50/40 hover:border-emerald-200'
                  }`}
                >
                  <span className="truncate">{layer.label}</span>
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0 border border-black/10 shadow-2xs"
                    style={{ backgroundColor: layer.colorScale[3] }}
                  />
                </button>
              )
            })}
          </div>

          {/* Dynamic Sector Filter for Business Opportunity Layer */}
          {activeMapLayer === 'opportunity' && (
            <div className="pt-3 border-t border-emerald-100 animate-fade-in space-y-2">
              <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                Filter Sector Heatmap:
              </p>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setSectorFilter(null)}
                  className={`px-2.5 py-1 rounded-lg text-2xs font-bold transition-all uppercase tracking-wider font-mono ${
                    !sectorFilter
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/60'
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
                      className={`px-2.5 py-1 rounded-lg text-2xs font-bold transition-all uppercase tracking-wider font-mono ${
                        isSelected
                          ? 'bg-emerald-600 text-white'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/60'
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
            <div className="pt-3 border-t border-emerald-100 animate-fade-in space-y-2">
              <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                Filter Infrastructure Deficit:
              </p>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setGapFilter(null)}
                  className={`px-2.5 py-1 rounded-lg text-2xs font-bold transition-all uppercase tracking-wider font-mono ${
                    !gapFilter
                      ? 'bg-red-600 text-white'
                      : 'bg-red-50 hover:bg-red-100 text-red-800 border border-red-200/60'
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
                      className={`px-2.5 py-1 rounded-lg text-2xs font-bold transition-all uppercase tracking-wider font-mono ${
                        isSelected
                          ? 'bg-red-600 text-white'
                          : 'bg-red-50 hover:bg-red-100 text-red-800 border border-red-200/60'
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
      )}
    </div>
  )
}


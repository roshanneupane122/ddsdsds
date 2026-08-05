import { useFilterStore } from '@/store'
import { MAP_LAYER_LIST } from '@/constants'
import type { ChoroplethLayerId } from '@/types'

export const LayerControls = () => {
  const { activeMapLayer, setActiveMapLayer } = useFilterStore()

  return (
    <div className="glass-panel p-4 space-y-3 border border-white/60">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-peak-700 flex items-center gap-1.5">
          <svg className="w-4 h-4 text-terraced-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          Choropleth Layers
        </h3>
        {activeMapLayer && (
          <button
            onClick={() => setActiveMapLayer(null)}
            className="text-2xs text-peak-400 hover:text-peak-600 transition-colors"
          >
            Clear Layer
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
        {MAP_LAYER_LIST.map((layer) => {
          const isActive = activeMapLayer === layer.id
          return (
            <button
              key={layer.id}
              onClick={() => setActiveMapLayer(isActive ? null : (layer.id as ChoroplethLayerId))}
              className={`p-2.5 rounded-lg text-left text-xs transition-all border ${
                isActive
                  ? 'bg-terraced-50 border-terraced-400 text-terraced-700 shadow-sm font-semibold'
                  : 'bg-white/80 border-peak-100 text-peak-600 hover:bg-white hover:border-peak-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="truncate">{layer.label}</span>
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: layer.colorScale[3] }}
                />
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

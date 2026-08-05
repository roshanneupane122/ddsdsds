import { Link } from 'react-router-dom'
import { Card, Button, Badge } from '@/components/ui'
import { MUNICIPALITY_TYPE_LABELS, PROVINCES } from '@/constants'
import { formatNumber, formatArea } from '@/lib/formatters'
import type { MunicipalityListItem } from '@/types'
import { useFilterStore } from '@/store'

interface MunicipalityDetailPanelProps {
  municipality: MunicipalityListItem | null
  onClose: () => void
}

export const MunicipalityDetailPanel = ({ municipality, onClose }: MunicipalityDetailPanelProps) => {
  const { addToCompare, compareIds } = useFilterStore()

  if (!municipality) return null

  const provinceObj = PROVINCES.find(p => p.id === municipality.province)
  const isCompared = compareIds.includes(municipality.id)

  return (
    <Card className="absolute top-4 right-4 z-20 w-80 md:w-96 glass-panel border border-white/80 shadow-2xl p-5 space-y-4 animate-slide-in-right">
      <div className="flex items-start justify-between">
        <div>
          <Badge variant="info" size="sm" className="mb-1">
            {provinceObj?.name ?? `Province ${municipality.province}`}
          </Badge>
          <h3 className="text-lg font-bold font-display text-peak-700 leading-snug">{municipality.name}</h3>
          <p className="text-xs text-peak-400">{municipality.nameNepali} • {municipality.district} District</p>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-peak-400 hover:text-peak-600 hover:bg-peak-100/50"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs py-2 bg-peak-50/50 rounded-lg p-2.5">
        <div>
          <span className="text-peak-400 block text-2xs">Type</span>
          <span className="font-semibold text-peak-700">{MUNICIPALITY_TYPE_LABELS[municipality.type]}</span>
        </div>
        <div>
          <span className="text-peak-400 block text-2xs">Population</span>
          <span className="font-semibold text-peak-700">{formatNumber(municipality.population)}</span>
        </div>
        <div>
          <span className="text-peak-400 block text-2xs">Land Area</span>
          <span className="font-semibold text-peak-700">{formatArea(municipality.area)}</span>
        </div>
        <div>
          <span className="text-peak-400 block text-2xs">Agri Score</span>
          <span className="font-semibold text-terraced-600">{municipality.agricultureScore}/100</span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-peak-500">Tourism Index</span>
          <span className="font-bold text-peak-700">{municipality.tourismScore}/100</span>
        </div>
        <div className="w-full bg-peak-100 rounded-full h-1.5">
          <div className="bg-mist-500 h-1.5 rounded-full" style={{ width: `${municipality.tourismScore}%` }} />
        </div>

        <div className="flex justify-between text-xs pt-1">
          <span className="text-peak-500">Infrastructure Score</span>
          <span className="font-bold text-peak-700">{municipality.infrastructureScore}/100</span>
        </div>
        <div className="w-full bg-peak-100 rounded-full h-1.5">
          <div className="bg-saffron-500 h-1.5 rounded-full" style={{ width: `${municipality.infrastructureScore}%` }} />
        </div>
      </div>

      <div className="flex gap-2 pt-2 border-t border-peak-100">
        <Link to={`/municipalities/${municipality.id}`} className="flex-1">
          <Button size="sm" className="w-full">
            Full Resource Profile
          </Button>
        </Link>
        <Button
          variant={isCompared ? 'secondary' : 'outline'}
          size="sm"
          onClick={() => addToCompare(municipality.id)}
          disabled={isCompared}
        >
          {isCompared ? 'In Compare' : '+ Compare'}
        </Button>
      </div>
    </Card>
  )
}

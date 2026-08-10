import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
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
  const [gaps, setGaps] = useState<any>(null)

  useEffect(() => {
    if (!municipality) {
      setGaps(null)
      return
    }
    const fetchGaps = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/analyze/gaps?municipality_name=${municipality.name}&ward_no=1`)
        if (res.ok) {
          const data = await res.json()
          setGaps(data)
        }
      } catch (err) {
        console.error('Failed to fetch gaps', err)
      }
    }
    fetchGaps()
  }, [municipality])

  if (!municipality) return null

  const provinceObj = PROVINCES.find((p) => p.id === municipality.province)
  const isCompared = compareIds.includes(municipality.id)

  return (
    <Card className="absolute top-4 right-4 z-30 w-80 md:w-96 bg-white/95 backdrop-blur-md border border-emerald-200 shadow-2xl p-5 space-y-4 rounded-2xl animate-slide-in-right">
      <div className="flex items-start justify-between">
        <div>
          <Badge variant="success" size="sm" className="mb-1">
            {provinceObj?.name ?? `Province ${municipality.province}`}
          </Badge>
          <h3 className="text-xl font-bold font-display text-slate-900 leading-snug">{municipality.name}</h3>
          <p className="text-xs text-slate-500 font-medium">{municipality.nameNepali} • {municipality.district} District</p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-emerald-50 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs py-2 bg-emerald-50/60 rounded-xl p-3 border border-emerald-100">
        <div>
          <span className="text-slate-500 block text-[10px] font-mono font-semibold uppercase">Type</span>
          <span className="font-bold text-slate-900">{MUNICIPALITY_TYPE_LABELS[municipality.type]}</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px] font-mono font-semibold uppercase">Population</span>
          <span className="font-bold text-slate-900">{formatNumber(municipality.population)}</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px] font-mono font-semibold uppercase">Land Area</span>
          <span className="font-bold text-slate-900">{formatArea(municipality.area)}</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px] font-mono font-semibold uppercase">Agri Score</span>
          <span className="font-bold text-emerald-700">{municipality.agricultureScore}/100</span>
        </div>
      </div>

      <div className="space-y-2 font-mono">
        <div className="flex justify-between text-xs">
          <span className="text-slate-600 font-medium">Tourism Index</span>
          <span className="font-bold text-emerald-800">{municipality.tourismScore}/100</span>
        </div>
        <div className="w-full bg-emerald-100 rounded-full h-1.5 overflow-hidden">
          <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: `${municipality.tourismScore}%` }} />
        </div>

        <div className="flex justify-between text-xs pt-1">
          <span className="text-slate-600 font-medium">Infrastructure Score</span>
          <span className="font-bold text-emerald-800">{municipality.infrastructureScore}/100</span>
        </div>
        <div className="w-full bg-emerald-100 rounded-full h-1.5 overflow-hidden">
          <div className="bg-teal-600 h-1.5 rounded-full" style={{ width: `${municipality.infrastructureScore}%` }} />
        </div>
      </div>

      {gaps && gaps.gaps && gaps.gaps.length > 0 && gaps.gaps[0].type !== "None" && (
        <div className="pt-2 border-t border-emerald-100">
          <h4 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1">
            <svg className="w-3.5 h-3.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Infrastructure Gaps Detected
          </h4>
          <div className="space-y-1.5">
            {gaps.gaps.map((gap: any, idx: number) => (
              <div key={idx} className="bg-red-50 text-red-800 text-[10px] p-2 rounded-lg border border-red-100">
                <span className="font-bold uppercase tracking-wider">{gap.type}:</span> {gap.description}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2 pt-2 border-t border-emerald-100">
        <Link to={`/citizen/municipalities/${municipality.id}`} className="flex-1">
          <Button size="sm" className="w-full text-xs shadow-sm font-bold">
            Learn More &amp; Features →
          </Button>
        </Link>
        <Button
          variant={isCompared ? 'secondary' : 'outline'}
          size="sm"
          onClick={() => addToCompare(municipality.id)}
          disabled={isCompared}
          className="text-xs"
        >
          {isCompared ? 'In Compare' : '+ Compare'}
        </Button>
      </div>
    </Card>
  )
}

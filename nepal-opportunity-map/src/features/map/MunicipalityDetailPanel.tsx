import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Button, Badge } from '@/components/ui'
import { PROVINCES } from '@/constants'
import type { MunicipalityListItem } from '@/types'
import { useFilterStore } from '@/store'
import { municipalitiesApi } from '@/services/municipalities.api'
import { IntelligenceProfile } from '@/features/municipalities'

interface MunicipalityDetailPanelProps {
  municipality: MunicipalityListItem | null
  onClose: () => void
  onAskAi?: () => void
}

export const MunicipalityDetailPanel = ({ municipality, onClose, onAskAi }: MunicipalityDetailPanelProps) => {
  const { addToCompare, compareIds } = useFilterStore()
  const [intel, setIntel] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [isFullModalOpen, setIsFullModalOpen] = useState(false)

  useEffect(() => {
    if (!municipality) {
      setIntel(null)
      setIsFullModalOpen(false)
      return
    }
    setIsFullModalOpen(true)
    const fetchIntel = async () => {
      setLoading(true)
      try {
        const data = await municipalitiesApi.getIntelligence(municipality.id)
        setIntel(data)
      } catch (err) {
        console.error('Failed to fetch intelligence', err)
      } finally {
        setLoading(false)
      }
    }
    fetchIntel()
  }, [municipality])

  if (!municipality) return null

  const provinceObj = PROVINCES.find((p) => p.id === municipality.province)
  const isCompared = compareIds.includes(municipality.id)

  const overallScore = intel?.development_index?.overall?.score ?? intel?.development_index?.overall ?? municipality.economicScore ?? 75

  return (
    <>
      {/* COMPACT FLOATING MAP PREVIEW CARD (Bottom-Right Floating over Map) */}
      <div className="absolute bottom-6 right-6 z-30 w-80 sm:w-96 bg-white/95 backdrop-blur-2xl border border-emerald-200/80 shadow-2xl rounded-2xl p-4 space-y-3 animate-slide-in-right">
        <div className="flex items-start justify-between">
          <div>
            <Badge variant="success" size="sm" className="mb-1 text-[9px] uppercase tracking-wider font-mono">
              {provinceObj?.name ?? `Province ${municipality.province}`}
            </Badge>
            <h3 className="text-xl font-bold font-display text-slate-900 leading-snug">{municipality.name}</h3>
            <p className="text-xs text-slate-500 font-medium">
              {municipality.nameNepali && `${municipality.nameNepali} • `}{municipality.district} District
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="flex items-center justify-between bg-emerald-50/80 p-3 rounded-xl border border-emerald-100/90">
          <div>
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">Development Score</span>
            <span className="text-xl font-black text-emerald-800 font-display">
              {loading ? '...' : overallScore} <span className="text-xs font-normal text-emerald-600">/ 100</span>
            </span>
          </div>
          <button
            onClick={() => setIsFullModalOpen(true)}
            className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all hover:scale-105 flex items-center gap-1.5"
          >
            <span>Full Report</span>
            <span>📄</span>
          </button>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <Button
            variant={isCompared ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => addToCompare(municipality.id)}
            disabled={isCompared}
            className="flex-1 text-xs py-1.5"
          >
            {isCompared ? '✓ In Compare' : '+ Compare'}
          </Button>

          {onAskAi ? (
            <Button
              onClick={onAskAi}
              variant="primary"
              size="sm"
              className="flex-1 text-xs bg-slate-900 hover:bg-slate-800 text-white font-bold py-1.5"
            >
              🤖 Ask AI
            </Button>
          ) : (
            <Link to={`/citizen/dashboard?chatContext=${encodeURIComponent(municipality.name)}`} className="flex-1">
              <Button variant="primary" size="sm" className="w-full text-xs bg-slate-900 hover:bg-slate-800 text-white font-bold py-1.5">
                🤖 Ask AI
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* FULL-SCREEN / LARGE MODAL POPUP FOR FULL INTELLIGENCE REPORT */}
      {isFullModalOpen && (
        <div className="fixed inset-0 z-[2000] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 md:p-8 animate-fade-in">
          <div className="bg-slate-50 rounded-3xl w-full max-w-5xl max-h-[92vh] overflow-y-auto shadow-2xl border border-emerald-100/80 p-6 md:p-8 relative">
            <button
              onClick={() => setIsFullModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-2xl bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 font-bold transition-all shadow-sm z-50 text-sm"
              title="Close Full Report Popup"
            >
              ✕ Close Report
            </button>

            {loading ? (
              <div className="py-12 space-y-4 text-center">
                <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-xs font-mono text-slate-500">Loading intelligence profile for {municipality.name}...</p>
              </div>
            ) : intel ? (
              <IntelligenceProfile intelligence={intel} />
            ) : (
              <div className="py-12 text-center text-xs font-mono text-slate-400">
                Intelligence report unavailable.
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}


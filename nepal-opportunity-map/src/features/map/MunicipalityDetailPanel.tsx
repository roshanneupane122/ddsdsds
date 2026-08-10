import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Card, Button, Badge } from '@/components/ui'
import { PROVINCES } from '@/constants'
import type { MunicipalityListItem } from '@/types'
import { useFilterStore } from '@/store'
import { municipalitiesApi } from '@/services/municipalities.api'

interface MunicipalityDetailPanelProps {
  municipality: MunicipalityListItem | null
  onClose: () => void
  onAskAi?: () => void
}

export const MunicipalityDetailPanel = ({ municipality, onClose, onAskAi }: MunicipalityDetailPanelProps) => {
  const { addToCompare, compareIds } = useFilterStore()
  const [intel, setIntel] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!municipality) {
      setIntel(null)
      return
    }
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

  return (
    <Card className="absolute top-4 right-4 z-[1000] w-80 md:w-[28rem] max-h-[calc(100vh-8rem)] overflow-y-auto bg-white/95 backdrop-blur-xl border border-emerald-200 shadow-2xl space-y-0 rounded-2xl animate-slide-in-right">
      <div className="flex items-start justify-between sticky top-0 bg-white/95 backdrop-blur-xl p-5 pb-3 border-b border-emerald-50 z-10">
        <div>
          <Badge variant="success" size="sm" className="mb-1 uppercase tracking-wider text-[9px]">
            {provinceObj?.name ?? `Province ${municipality.province}`}
          </Badge>
          <h3 className="text-2xl font-bold font-display text-slate-900 leading-snug">{municipality.name}</h3>
          <p className="text-xs text-slate-500 font-medium">{municipality.nameNepali} • {municipality.district} District</p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-emerald-50 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="p-5 pt-3 space-y-6">
        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-emerald-100 rounded w-3/4"></div>
            <div className="h-4 bg-emerald-100 rounded w-1/2"></div>
            <div className="h-20 bg-emerald-50 rounded w-full"></div>
          </div>
        ) : intel ? (
          <>
            {/* OVERALL DEVELOPMENT INDEX */}
            <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Overall Development Index</h4>
                <div className="text-2xl font-bold text-emerald-800">
                  {intel.development_index?.overall?.score || 0} <span className="text-sm font-medium text-emerald-600">/ 100</span>
                </div>
              </div>
              <Badge variant={intel.development_index?.overall?.status === 'High' ? 'success' : intel.development_index?.overall?.status === 'Moderate' ? 'warning' : 'danger'}>
                {intel.development_index?.overall?.status || 'Unknown'}
              </Badge>
            </div>

            {/* DIMENSIONS */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold font-mono uppercase text-slate-800 tracking-wider">Major Dimensions</h4>
              <div className="grid gap-2">
                {[
                  { label: 'Economic Activity', key: 'economic' },
                  { label: 'Infrastructure', key: 'infrastructure' },
                  { label: 'Digital Readiness', key: 'digital' },
                ].map((dim) => {
                  const data = intel.development_index?.[dim.key]
                  if (!data) return null
                  return (
                    <div key={dim.key} className="flex flex-col p-2.5 rounded-lg border border-slate-100 bg-white">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-slate-800 text-xs">{dim.label}</span>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${
                            data.status === 'High' ? 'text-emerald-600' : data.status === 'Moderate' ? 'text-amber-600' : 'text-red-600'
                          }`}>
                            {data.status}
                          </span>
                          <span className="font-mono text-xs font-bold text-slate-500">{data.score}/100</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-500">{data.text}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* PRIORITIES */}
            {intel.priorities && intel.priorities.length > 0 && (
              <div>
                <h4 className="text-xs font-bold font-mono uppercase text-purple-700 tracking-wider mb-2 flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  Top Priorities
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {intel.priorities.map((p: string, idx: number) => (
                    <Badge key={idx} variant="info" className="bg-purple-50 text-purple-700 border-purple-200">
                      {p}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* STRENGTHS */}
            {intel.strengths && intel.strengths.length > 0 && (
              <div>
                <h4 className="text-xs font-bold font-mono uppercase text-emerald-700 tracking-wider mb-2 flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Key Strengths
                </h4>
                <ul className="space-y-2">
                  {intel.strengths.slice(0, 3).map((s: string, idx: number) => (
                    <li key={idx} className="text-xs text-slate-700 flex items-start gap-2 bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100">
                      <span className="text-emerald-600 mt-0.5">•</span>
                      <span className="leading-relaxed font-medium">{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* DEVELOPMENT GAPS */}
            {(intel.gaps?.length > 0) && (
              <div>
                <h4 className="text-xs font-bold font-mono uppercase text-red-700 tracking-wider mb-2 flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  Development Gaps
                </h4>
                <div className="space-y-2">
                  {intel.gaps.map((gap: any, idx: number) => (
                    <details key={idx} className="group bg-red-50 text-red-900 text-xs p-3 rounded-lg border border-red-100 cursor-pointer">
                      <summary className="font-bold flex justify-between items-center list-none">
                        <div className="flex items-center gap-2">
                          <span className="uppercase tracking-wider">{gap.type} Gap</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            gap.severity === 'High' ? 'bg-red-200 text-red-800' : 'bg-orange-200 text-orange-800'
                          }`}>
                            Severity: {gap.severity}
                          </span>
                          <svg className="w-4 h-4 transition-transform group-open:rotate-180 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </div>
                      </summary>
                      <div className="mt-3 pt-3 border-t border-red-200/50 space-y-2">
                        <div>
                          <span className="block text-[10px] font-bold text-red-800/70 uppercase mb-0.5">Score</span>
                          <span className="font-mono">{gap.score}/100</span>
                        </div>
                        <div>
                          <span className="block text-[10px] font-bold text-red-800/70 uppercase mb-0.5">Evidence</span>
                          <span>{gap.evidence}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] font-bold text-red-800/70 uppercase mb-0.5">Interpretation</span>
                          <span>{gap.description}</span>
                        </div>
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            )}

            {/* TOP OPPORTUNITIES */}
            {intel.opportunities && intel.opportunities.length > 0 && (
              <div>
                <h4 className="text-xs font-bold font-mono uppercase text-blue-700 tracking-wider mb-2 flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  Sector Opportunities
                </h4>
                <div className="space-y-2">
                  {intel.opportunities.map((opp: any, idx: number) => (
                    <details key={idx} className="group bg-blue-50/50 text-blue-900 text-xs p-3 rounded-lg border border-blue-100 cursor-pointer">
                      <summary className="font-bold flex justify-between items-center list-none">
                        <span className="font-bold text-slate-800 text-xs">{opp.proposed_business || opp.business_type || opp.business}</span>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                            Score: {opp.opportunity_score}/100
                          </span>
                          <svg className="w-4 h-4 transition-transform group-open:rotate-180 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </div>
                      </summary>
                      <div className="mt-3 pt-3 border-t border-blue-200/50 space-y-3">
                        {opp.breakdown && (
                          <div className="grid grid-cols-2 gap-2 text-[10px]">
                            <div className="flex justify-between">
                              <span className="text-slate-500">ML Feasibility</span>
                              <span className="font-mono font-bold text-slate-700">{opp.ml_feasibility}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Market Demand</span>
                              <span className="font-mono font-bold text-slate-700">{opp.breakdown.market_demand}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Infrastructure</span>
                              <span className="font-mono font-bold text-slate-700">{opp.breakdown.infrastructure_readiness}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Accessibility</span>
                              <span className="font-mono font-bold text-slate-700">{opp.breakdown.accessibility}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Footfall</span>
                              <span className="font-mono font-bold text-slate-700">{opp.breakdown.footfall}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Competition</span>
                              <span className="font-mono font-bold text-slate-700">{opp.breakdown.competition}</span>
                            </div>
                          </div>
                        )}
                        
                        {opp.positive_factors && opp.positive_factors.length > 0 && (
                          <div>
                            <span className="block text-[10px] font-bold text-emerald-700 uppercase mb-1">Positive Drivers:</span>
                            <ul className="space-y-1">
                              {opp.positive_factors.map((factor: string, i: number) => (
                                <li key={i} className="text-slate-600 leading-snug flex items-start gap-1.5"><span className="text-emerald-500">•</span>{factor}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {opp.negative_factors && opp.negative_factors.length > 0 && (
                          <div>
                            <span className="block text-[10px] font-bold text-red-700 uppercase mb-1">Constraints:</span>
                            <ul className="space-y-1">
                              {opp.negative_factors.map((factor: string, i: number) => (
                                <li key={i} className="text-slate-600 leading-snug flex items-start gap-1.5"><span className="text-red-500">•</span>{factor}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {opp.interpretation && (
                          <div className="bg-white/80 p-2 rounded border border-blue-100">
                            <span className="block text-[10px] font-bold text-blue-800 uppercase mb-0.5">Interpretation</span>
                            <p className="text-slate-700 leading-relaxed italic">{opp.interpretation}</p>
                          </div>
                        )}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            )}

          </>
        ) : (
          <div className="py-8 text-center text-xs text-slate-400 font-mono">
            Intelligence profile unavailable.
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="sticky bottom-0 bg-white/95 backdrop-blur-xl p-5 pt-3 border-t border-slate-100 z-10 flex flex-col gap-2">
        <Link to={`/citizen/municipalities/${municipality.id}`}>
          <Button size="sm" className="w-full text-xs shadow-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white py-2">
            View Full Municipality Profile →
          </Button>
        </Link>
        <div className="flex gap-2">
          <Button
            variant={isCompared ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => addToCompare(municipality.id)}
            disabled={isCompared}
            className="flex-1 text-xs border-slate-200 py-2"
          >
            {isCompared ? 'In Compare' : '+ Compare'}
          </Button>
          {onAskAi ? (
            <Button onClick={onAskAi} variant="primary" size="sm" className="flex-1 text-xs bg-slate-900 hover:bg-slate-800 text-white font-bold py-2">
              🤖 Ask AI
            </Button>
          ) : (
            <Link to={`/citizen/dashboard?chatContext=${encodeURIComponent(municipality.name)}`} className="flex-1">
              <Button variant="primary" size="sm" className="w-full text-xs bg-slate-900 hover:bg-slate-800 text-white font-bold py-2">
                🤖 Ask AI
              </Button>
            </Link>
          )}
        </div>
      </div>
    </Card>
  )
}

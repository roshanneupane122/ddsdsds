import React from 'react'
import { Modal, CircularProgress, ProgressBar, Button, Badge } from '@/components/ui'
import { useNavigate } from 'react-router-dom'

const MapPinIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
  </svg>
)

const CheckCircleIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
)

const ExclamationTriangleIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3Z" />
  </svg>
)

interface EvaluationResultModalProps {
  isOpen: boolean
  onClose: () => void
  result: any // TODO: Type this strictly based on ScoreResponse
}

export const EvaluationResultModal: React.FC<EvaluationResultModalProps> = ({
  isOpen,
  onClose,
  result,
}) => {
  const navigate = useNavigate()

  if (!result) return null

  // Determine colors based on score
  const scoreColor = 
    result.opportunity_score >= 75 ? 'text-emerald-500' :
    result.opportunity_score >= 60 ? 'text-amber-500' :
    'text-red-500'

  const scoreBg = 
    result.opportunity_score >= 75 ? 'bg-emerald-500' :
    result.opportunity_score >= 60 ? 'bg-amber-500' :
    'bg-red-500'

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      title="Business Idea Evaluation"
    >
      <div className="space-y-6 sm:space-y-8 max-h-[80vh] overflow-y-auto pr-1">
        
        {/* Header & Overall Score */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 md:gap-8 items-center bg-slate-50 p-4 sm:p-6 rounded-2xl border border-slate-100">
          <div className="flex-1 space-y-2 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 text-slate-500 font-medium text-xs sm:text-sm">
              <MapPinIcon className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
              <span>{result.location}</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 leading-tight">{result.proposed_business}</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-2">
              {result.summary}
            </p>
          </div>
          <div className="flex flex-col items-center gap-2 shrink-0">
            <CircularProgress 
              value={result.opportunity_score ?? 75} 
              color={scoreColor}
              size={110}
            />
            <span className={`text-xs font-bold px-3 py-1 rounded-full text-white ${scoreBg}`}>
              {result.opportunity_level || 'EVALUATED'}
            </span>
          </div>
        </div>

        {/* Detailed Breakdown */}
        {result.breakdown && (
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2 font-mono">Score Breakdown</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              <ProgressBar label="Market Demand & Footfall" value={result.breakdown.market_demand ?? 75} color="bg-indigo-500" />
              <ProgressBar label="Purchasing Power" value={result.breakdown.purchasing_power ?? 70} color="bg-indigo-500" />
              <ProgressBar label="Accessibility" value={result.breakdown.accessibility ?? 70} color="bg-indigo-500" />
              <ProgressBar label="Infrastructure Readiness" value={result.breakdown.infrastructure_readiness ?? 65} color="bg-indigo-500" />
              <ProgressBar label="Existing Competition" value={result.breakdown.competition ?? 45} color="bg-amber-500" />
              <ProgressBar label="Business Risk" value={result.breakdown.business_risk ?? 25} color="bg-amber-500" />
            </div>
          </div>
        )}

        {/* Explainable AI */}
        <div>
          <h4 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2 font-mono">Why This Score?</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-3">
              <span className="text-2xs sm:text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md inline-block uppercase tracking-wider font-mono">Positive Factors</span>
              <ul className="space-y-2">
                {result.positive_factors && result.positive_factors.length > 0 ? result.positive_factors.map((factor: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700">
                    <CheckCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{factor}</span>
                  </li>
                )) : <li className="text-xs sm:text-sm text-slate-500 italic">No significant positive factors identified.</li>}
              </ul>
            </div>
            <div className="space-y-3">
              <span className="text-2xs sm:text-xs font-bold text-red-700 bg-red-50 px-2.5 py-1 rounded-md inline-block uppercase tracking-wider font-mono">Negative Factors & Risks</span>
              <ul className="space-y-2">
                {result.negative_factors && result.negative_factors.length > 0 ? result.negative_factors.map((factor: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700">
                    <ExclamationTriangleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 shrink-0 mt-0.5" />
                    <span>{factor}</span>
                  </li>
                )) : <li className="text-xs sm:text-sm text-slate-500 italic">No significant negative factors identified.</li>}
              </ul>
            </div>
          </div>
        </div>

        {/* Investment Details */}
        <div className="bg-slate-50 p-3.5 sm:p-4 rounded-xl border border-slate-100">
           <p className="text-2xs sm:text-xs text-slate-600 font-medium italic text-center leading-relaxed">
             Note: Financial returns, payback periods, and ROI estimates are computed based on demographic indices and geospatial digital twin features.
           </p>
        </div>

        {/* Alternatives */}
        {result.alternatives && result.alternatives.length > 0 && (
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2 font-mono">Consider These Alternatives</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {result.alternatives.map((alt: any, idx: number) => (
                <div key={idx} className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-col items-center text-center">
                  <span className="font-bold text-slate-800 text-xs mb-2 leading-tight">{alt.business}</span>
                  <div className="mt-auto">
                    <Badge variant={alt.confidence > 70 ? 'success' : 'warning'} size="sm">
                      {Math.round(alt.confidence)}% Match
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
      
      {/* Footer Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mt-6 pt-4 border-t border-slate-100">
        <div className="text-2xs sm:text-xs text-slate-500 text-center sm:text-left">
          <strong>ML Confidence:</strong> {result.ml_confidence ?? 80}%
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onClose} className="flex-1 sm:flex-none text-xs">Close</Button>
          <Button variant="primary" size="sm" className="flex-1 sm:flex-none text-xs" onClick={() => {
            const muniId = result.location.split(' - ')[0]
            navigate(`/citizen/explorer?search=${encodeURIComponent(muniId)}`)
          }}>
            View Intelligence Map
          </Button>
        </div>
      </div>
    </Modal>
  )
}

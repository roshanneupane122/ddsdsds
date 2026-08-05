import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, Badge, ConfidenceBadge, CategoryBadge, Button, Modal } from '@/components/ui'
import { formatCurrency, formatROIRange } from '@/lib/formatters'
import type { Recommendation } from '@/types'

export const RecommendationCard = ({ recommendation }: { recommendation: Recommendation }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <Card hover className="flex flex-col justify-between h-full border border-peak-100 space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <CategoryBadge category={recommendation.category} />
            <ConfidenceBadge level={recommendation.confidence} />
          </div>

          <div>
            <span className="text-2xs text-peak-400 font-semibold uppercase tracking-wider block">
              {recommendation.municipalityName} • Prov {recommendation.province}
            </span>
            <h3 className="font-semibold text-peak-700 text-lg leading-snug line-clamp-2 mt-0.5">
              {recommendation.title}
            </h3>
          </div>

          <p className="text-xs text-peak-500 line-clamp-3 leading-relaxed">
            {recommendation.summary}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {recommendation.tags.slice(0, 3).map((tag, i) => (
              <Badge key={i} variant="muted" size="sm">
                #{tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Investment & Rationale Button */}
        <div className="pt-4 border-t border-peak-100 space-y-3">
          <div className="grid grid-cols-2 gap-2 text-xs bg-peak-50 p-2.5 rounded-lg">
            <div>
              <span className="text-2xs text-peak-400 block">Capital Req.</span>
              <span className="font-semibold text-peak-700">
                {formatCurrency(recommendation.estimatedInvestmentUSD.min, true)} – {formatCurrency(recommendation.estimatedInvestmentUSD.max, true)}
              </span>
            </div>
            <div>
              <span className="text-2xs text-peak-400 block">Est. ROI</span>
              <span className="font-semibold text-terraced-600">
                {formatROIRange(recommendation.estimatedROIPercent.min, recommendation.estimatedROIPercent.max)}
              </span>
            </div>
          </div>

          <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => setIsModalOpen(true)}>
            Inspect Rationale & AI Rationale
          </Button>
        </div>
      </Card>

      {/* Rationale Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={recommendation.title}
        size="lg"
        footer={
          <div className="flex justify-between w-full items-center">
            <Link to={`/municipalities/${recommendation.municipalityId}`}>
              <Button variant="outline" size="sm">
                View Municipal Profile →
              </Button>
            </Link>
            <Button size="sm" onClick={() => setIsModalOpen(false)}>
              Close
            </Button>
          </div>
        }
      >
        <div className="space-y-4 text-xs text-peak-600">
          <div className="flex items-center gap-2">
            <CategoryBadge category={recommendation.category} />
            <ConfidenceBadge level={recommendation.confidence} />
            <span className="text-peak-400 ml-auto">
              Confidence Score: {(recommendation.confidenceScore * 100).toFixed(0)}%
            </span>
          </div>

          <div className="p-3 bg-terraced-50 border border-terraced-200 rounded-xl space-y-1">
            <h4 className="font-semibold text-terraced-800 text-sm">Synthesized Business Case</h4>
            <p className="text-peak-700 leading-relaxed">{recommendation.explanation}</p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-peak-700 text-sm">Why This Opportunity Fits:</h4>
            <ul className="list-disc pl-5 space-y-1 text-peak-600">
              {recommendation.whyThisFits.map((fit, idx) => (
                <li key={idx}>{fit}</li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 bg-peak-50 rounded-lg">
              <span className="font-semibold text-peak-700 block mb-1">Time to Market</span>
              <p className="text-sm font-bold text-peak-600">{recommendation.timeToMarketMonths} months</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg border border-red-100">
              <span className="font-semibold text-red-700 block mb-1">Key Risk Factors</span>
              <p className="text-2xs text-red-600">{recommendation.riskFactors.join(' • ')}</p>
            </div>
          </div>
        </div>
      </Modal>
    </>
  )
}

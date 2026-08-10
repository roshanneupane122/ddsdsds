import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import apiClient from '@/services/apiClient'
import { ENDPOINTS } from '@/services/endpoints'
import { recommendationsApi } from '@/services/recommendations.api'
import { RecommendationCard, EvaluationResultModal } from '@/features/recommendations'
import { Input, SkeletonCard, EmptyState, Card, Button } from '@/components/ui'
import { OPPORTUNITY_CATEGORIES, PROVINCES } from '@/constants'
import { useFilterStore } from '@/store'

const SUPPORTED_BUSINESSES = [
  'Agro-vet Clinic', 'Bookstore', 'Boutique Hotel', 'Cafe', 'Cold Storage',
  'Dairy Farm', 'Electronics Shop', 'Fashion Boutique', 'Fertilizer Store',
  'Grocery Store', 'Gym & Fitness Center', 'Handicraft Shop', 'Hardware Store',
  'IT Services', 'Logistics/Freight Service', 'Medical Supply Store',
  'Mobile Repair Shop', 'Pharmacy', 'Polyclinic', 'Restaurant',
  'Stationery Shop', 'Supermarket', 'Tailoring Shop', 'Travel Agency',
  'Tutoring Center', 'Wholesale Distributor'
]

export const RecommendationsPage = () => {
  const { recommendationFilter, setRecommendationFilter, resetRecommendationFilter } = useFilterStore()

  const { data: paginatedData, isLoading } = useQuery({
    queryKey: ['recommendations', 'list', recommendationFilter],
    queryFn: () => recommendationsApi.list(recommendationFilter),
  })

  const recommendations = paginatedData?.data ?? []

  // Evaluation State
  const [evaluationResult, setEvaluationResult] = useState<any>(null)
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleEvaluate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const muni = (form.elements.namedItem('municipality') as HTMLInputElement).value
    const ward = (form.elements.namedItem('ward') as HTMLInputElement).value
    const business = (form.elements.namedItem('business') as HTMLSelectElement).value
    const budget = (form.elements.namedItem('budget') as HTMLInputElement).value

    if (!muni || !ward || !business || !budget) return

    setIsEvaluating(true)
    try {
      const res = await apiClient.post(ENDPOINTS.analyze.score, {
        municipality_name: muni,
        ward_no: parseInt(ward, 10),
        proposed_business: business,
        // budget is collected but ML model currently doesn't use it. Sent for future expandability.
      })
      setEvaluationResult(res.data)
      setIsModalOpen(true)
    } catch (err: any) {
      if (err.statusCode === 404) {
        alert("Failed to evaluate. Make sure the municipality and ward exist in the dataset.")
      } else {
        alert("Error connecting to evaluation engine.")
      }
    } finally {
      setIsEvaluating(false)
    }
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold font-display text-slate-900 tracking-tight">AI Business Opportunity Explorer</h1>
        <p className="text-sm text-slate-600 max-w-2xl">
          Filter and analyze AI-generated business venture opportunities across Nepal's 753 municipalities.
        </p>
      </div>

      {/* Evaluate Idea Banner */}
      <Card padding="md" className="bg-emerald-50 border border-emerald-200 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-emerald-900">✨ Evaluate Your Own Business Idea</h3>
        <p className="text-sm text-emerald-700">Get an instant AI decision-support evaluation based on local demographics, purchasing power, and infrastructure data.</p>
        <form 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end"
          onSubmit={handleEvaluate}
        >
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Municipality</label>
            <Input name="municipality" placeholder="e.g. Butwal" required className="bg-white w-full" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Ward</label>
            <Input name="ward" type="number" placeholder="e.g. 11" required min={1} className="bg-white w-full" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Business Idea</label>
            <select 
              name="business" 
              required 
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 h-[42px]"
            >
              <option value="">Select Business...</option>
              {SUPPORTED_BUSINESSES.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Budget (NPR)</label>
            <Input name="budget" type="number" placeholder="e.g. 1500000" required min={50000} step={10000} className="bg-white w-full" />
          </div>
          <div className="pt-2">
            <Button type="submit" variant="primary" className="w-full h-[42px]" isLoading={isEvaluating}>
              {isEvaluating ? 'Evaluating...' : 'Evaluate'}
            </Button>
          </div>
        </form>
      </Card>
      
      <EvaluationResultModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        result={evaluationResult}
      />

      {/* Filter Bar */}
      <div className="bg-white p-4.5 rounded-2xl border border-emerald-100/90 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            placeholder="Search opportunity title or keyword..."
            value={recommendationFilter.search}
            onChange={(e) => setRecommendationFilter({ search: e.target.value })}
            leftIcon={
              <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
          />

          <select
            value={recommendationFilter.category ?? ''}
            onChange={(e) =>
              setRecommendationFilter({
                category: e.target.value ? (e.target.value as any) : null,
              })
            }
            className="px-3.5 py-2.5 bg-white border border-emerald-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/25"
          >
            <option value="">All Sectors / Categories</option>
            {OPPORTUNITY_CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.icon} {cat.label}
              </option>
            ))}
          </select>

          <select
            value={recommendationFilter.province ?? ''}
            onChange={(e) =>
              setRecommendationFilter({
                province: e.target.value ? (Number(e.target.value) as any) : null,
              })
            }
            className="px-3.5 py-2.5 bg-white border border-emerald-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/25"
          >
            <option value="">All 7 Provinces</option>
            {PROVINCES.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-between items-center text-xs text-slate-500 pt-3 border-t border-emerald-100 font-mono">
          <span className="font-semibold">Showing {recommendations.length} opportunities</span>
          <button
            onClick={resetRecommendationFilter}
            className="text-emerald-700 hover:underline font-bold"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} className="h-80" />
          ))}
        </div>
      ) : recommendations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recommendations.map((rec) => (
            <RecommendationCard key={rec.id} recommendation={rec} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No Opportunities Match Criteria"
          description="Try broadening your category or province filter selections."
          action={
            <button
              onClick={resetRecommendationFilter}
              className="text-xs text-emerald-700 hover:underline font-bold"
            >
              Reset All Filters
            </button>
          }
        />
      )}
    </div>
  )
}

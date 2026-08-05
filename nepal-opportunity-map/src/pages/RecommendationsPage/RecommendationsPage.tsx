import { useQuery } from '@tanstack/react-query'
import { recommendationsApi } from '@/services/recommendations.api'
import { RecommendationCard } from '@/features/recommendations'
import { Input, SkeletonCard, EmptyState } from '@/components/ui'
import { OPPORTUNITY_CATEGORIES, PROVINCES } from '@/constants'
import { useFilterStore } from '@/store'

export const RecommendationsPage = () => {
  const { recommendationFilter, setRecommendationFilter, resetRecommendationFilter } = useFilterStore()

  const { data: paginatedData, isLoading } = useQuery({
    queryKey: ['recommendations', 'list', recommendationFilter],
    queryFn: () => recommendationsApi.list(recommendationFilter),
  })

  const recommendations = paginatedData?.data ?? []

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold font-display text-peak-700">AI Business Opportunity Explorer</h1>
        <p className="text-sm text-peak-500 max-w-2xl">
          Filter and analyze AI-generated business venture opportunities across Nepal's 753 municipalities.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-peak-100 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            placeholder="Search opportunity title or keyword..."
            value={recommendationFilter.search}
            onChange={(e) => setRecommendationFilter({ search: e.target.value })}
            leftIcon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            className="px-3 py-2 bg-peak-50 border border-peak-200 rounded-lg text-xs font-medium text-peak-700 focus:outline-none focus:ring-2 focus:ring-terraced-400"
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
            className="px-3 py-2 bg-peak-50 border border-peak-200 rounded-lg text-xs font-medium text-peak-700 focus:outline-none focus:ring-2 focus:ring-terraced-400"
          >
            <option value="">All Provinces (7)</option>
            {PROVINCES.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-between items-center text-xs text-peak-400 pt-2 border-t border-peak-50">
          <span>Showing {recommendations.length} opportunities</span>
          <button
            onClick={resetRecommendationFilter}
            className="text-terraced-600 hover:underline"
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
              className="text-xs text-terraced-600 hover:underline font-semibold"
            >
              Reset All Filters
            </button>
          }
        />
      )}
    </div>
  )
}

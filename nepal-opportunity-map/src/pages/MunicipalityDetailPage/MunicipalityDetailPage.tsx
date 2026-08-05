import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { municipalitiesApi } from '@/services/municipalities.api'
import { recommendationsApi } from '@/services/recommendations.api'
import { ResourceProfile } from '@/features/municipalities'
import { RecommendationCard } from '@/features/recommendations/RecommendationCard'
import { Button, SkeletonCard, EmptyState } from '@/components/ui'

export const MunicipalityDetailPage = () => {
  const { id = 'pokhara-metro' } = useParams<{ id: string }>()

  const { data: detail, isLoading: isLoadingDetail } = useQuery({
    queryKey: ['municipalities', 'detail', id],
    queryFn: () => municipalitiesApi.detail(id),
  })

  const { data: recommendations = [] } = useQuery({
    queryKey: ['municipalities', id, 'recommendations'],
    queryFn: () => recommendationsApi.byMunicipality(id),
    enabled: !!detail,
  })

  if (isLoadingDetail) {
    return (
      <div className="space-y-6">
        <SkeletonCard className="h-48" />
        <SkeletonCard className="h-96" />
      </div>
    )
  }

  if (!detail) {
    return (
      <EmptyState
        title="Municipality Not Found"
        description="The requested municipality profile could not be found or has not been ingested into the system yet."
        action={
          <Link to="/map">
            <Button>Back to Map Explorer</Button>
          </Link>
        }
      />
    )
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-peak-400">
        <Link to="/map" className="hover:text-peak-600">Map Explorer</Link>
        <span>/</span>
        <span className="text-peak-700 font-semibold">{detail.name}</span>
      </div>

      {/* Main Resource Profile Component */}
      <ResourceProfile detail={detail} />

      {/* AI Recommendations for this Municipality */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-t border-peak-200 pt-6">
          <div>
            <h2 className="text-xl font-bold font-display text-peak-700">
              AI Opportunity Recommendations for {detail.name}
            </h2>
            <p className="text-xs text-peak-500">Synthesized opportunities tailored to local asset profile.</p>
          </div>
        </div>

        {recommendations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recommendations.map((rec) => (
              <RecommendationCard key={rec.id} recommendation={rec} />
            ))}
          </div>
        ) : (
          <div className="p-6 bg-white rounded-xl border border-peak-100 text-center text-xs text-peak-400">
            No specific venture cards generated for this municipality yet. Check regional recommendations in the Opportunity Explorer.
          </div>
        )}
      </section>
    </div>
  )
}

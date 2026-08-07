import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { municipalitiesApi } from '@/services/municipalities.api'
import { recommendationsApi } from '@/services/recommendations.api'
import { ResourceProfile } from '@/features/municipalities'
import { RecommendationCard } from '@/features/recommendations/RecommendationCard'
import { Button, SkeletonCard, EmptyState } from '@/components/ui'

export const MunicipalityDetailPage = () => {
  const { id = 'tilottama-mun' } = useParams<{ id: string }>()

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
        title="Municipality Profile Not Found"
        description="The requested local unit profile could not be retrieved from the spatial API."
        action={
          <Link to="/citizen/map">
            <Button>Back to Map Explorer →</Button>
          </Link>
        }
      />
    )
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500 font-mono font-medium">
        <Link to="/citizen/map" className="hover:text-emerald-700 font-bold">Map Explorer</Link>
        <span>/</span>
        <span className="text-slate-900 font-bold">{detail.name}</span>
      </div>

      {/* Main Resource Profile Component */}
      <ResourceProfile detail={detail} />

      {/* AI Recommendations for this Municipality */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-t border-emerald-100 pt-6">
          <div>
            <h2 className="text-xl font-bold font-display text-slate-900">
              AI Opportunity Cards for {detail.name}
            </h2>
            <p className="text-xs text-slate-600 font-medium">Algorithmic venture rationale tailored to local indicators and connectivity.</p>
          </div>
          <Link to="/citizen/reports">
            <Button size="sm" variant="outline" className="text-xs border-emerald-200">
              📄 Export Profile PDF
            </Button>
          </Link>
        </div>

        {recommendations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recommendations.map((rec) => (
              <RecommendationCard key={rec.id} recommendation={rec} />
            ))}
          </div>
        ) : (
          <div className="p-8 bg-white rounded-2xl border border-emerald-100 text-center text-xs text-slate-500 font-mono">
            No specific venture cards generated for this municipality yet. Explore regional opportunities in the Opportunity Explorer.
          </div>
        )}
      </section>
    </div>
  )
}

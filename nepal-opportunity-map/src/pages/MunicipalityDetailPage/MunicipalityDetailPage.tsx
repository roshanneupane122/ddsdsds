import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { municipalitiesApi } from '@/services/municipalities.api'
import { IntelligenceProfile } from '@/features/municipalities'
import { Button, SkeletonCard, EmptyState } from '@/components/ui'

export const MunicipalityDetailPage = () => {
  const { id } = useParams<{ id: string }>()

  // Fetch the unified intelligence profile from the new backend endpoint
  const { data: intelligence, isLoading, error } = useQuery({
    queryKey: ['municipalities', 'intelligence', id],
    queryFn: () => municipalitiesApi.getIntelligence(id as string),
    enabled: !!id,
    retry: false, // Don't retry on 404s
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SkeletonCard className="h-48 rounded-2xl" />
        <SkeletonCard className="h-96 rounded-2xl" />
      </div>
    )
  }

  if (error || !intelligence) {
    return (
      <div className="pt-12">
        <EmptyState
          title="Unable to load municipality information"
          description="The intelligence profile for this municipality could not be retrieved. It may not exist in the dataset."
          action={
            <Link to="/citizen/map">
              <Button>Back to Map Explorer →</Button>
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500 font-mono font-medium">
        <Link to="/citizen/map" className="hover:text-emerald-700 font-bold">Map Explorer</Link>
        <span>/</span>
        <span className="text-slate-900 font-bold">{intelligence.name} Profile</span>
      </div>

      {/* Unified Intelligence Profile Component */}
      <IntelligenceProfile intelligence={intelligence} />
    </div>
  )
}

import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { municipalitiesApi } from '@/services/municipalities.api'
import { ComparisonTable } from '@/features/dashboard/ComparisonTable'
import { Button, EmptyState, SkeletonCard } from '@/components/ui'
import { useFilterStore } from '@/store'

export const ComparePage = () => {
  const { compareIds, addToCompare } = useFilterStore()

  const { data: allMunicipalitiesData } = useQuery({
    queryKey: ['municipalities', 'list'],
    queryFn: () => municipalitiesApi.list(),
  })
  const allMunicipalities = allMunicipalitiesData?.data ?? []

  const { data: compareData = [], isLoading } = useQuery({
    queryKey: ['municipalities', 'compare', compareIds],
    queryFn: () => municipalitiesApi.compare(compareIds),
    enabled: compareIds.length > 0,
  })

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-peak-700">Municipality Comparison Engine</h1>
          <p className="text-sm text-peak-500">Compare 2 to 4 municipalities side-by-side to evaluate development indicators and capital readiness.</p>
        </div>

        {/* Quick Add Buttons */}
        {compareIds.length < 4 && allMunicipalities.length > 0 && (
          <div className="flex gap-2 items-center flex-wrap">
            <span className="text-xs text-peak-400">Quick add:</span>
            {allMunicipalities
              .filter((m) => !compareIds.includes(m.id))
              .slice(0, 3)
              .map((m) => (
                <Button key={m.id} variant="outline" size="sm" onClick={() => addToCompare(m.id)}>
                  + {m.name.split(' ')[0]}
                </Button>
              ))}
          </div>
        )}
      </div>

      {isLoading ? (
        <SkeletonCard className="h-96" />
      ) : compareIds.length === 0 ? (
        <EmptyState
          title="No Municipalities Selected for Comparison"
          description="Select 2 to 4 municipalities from the Map Explorer or using the quick-add buttons above to generate a comparative analysis."
          action={
            <Link to="/map">
              <Button>Select Municipalities on Map</Button>
            </Link>
          }
        />
      ) : (
        <ComparisonTable items={compareData} />
      )}
    </div>
  )
}

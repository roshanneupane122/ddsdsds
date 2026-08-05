import { useQuery } from '@tanstack/react-query'
import { ReportGenerator } from '@/features/reports'
import { Card, Badge, EmptyState } from '@/components/ui'
import { reportsApi } from '@/services/reports.api'
import { formatDate } from '@/lib/formatters'

export const ReportsPage = () => {
  const { data: reportsData } = useQuery({
    queryKey: ['reports', 'list'],
    queryFn: () => reportsApi.list(),
  })
  const reports = reportsData?.data ?? []

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold font-display text-peak-700">Report & Intelligence Generator</h1>
        <p className="text-sm text-peak-500">Generate executive summary PDF reports or export structured raw dataset CSVs for analytical modeling.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7">
          <ReportGenerator />
        </div>

        <div className="lg:col-span-5 space-y-4">
          <h3 className="font-semibold text-peak-700 text-base font-display">Recent Saved Reports</h3>

          {reports.length === 0 ? (
            <EmptyState
              title="No Reports Yet"
              description="Generate your first PDF or CSV report using the form on the left."
            />
          ) : (
            <div className="space-y-3">
              {reports.map((report) => (
                <Card key={report.id} padding="md" className="space-y-2 border border-peak-100">
                  <div className="flex items-center justify-between">
                    <Badge variant="success" size="sm">READY</Badge>
                    <span className="text-2xs text-peak-400">{formatDate(report.createdAt)}</span>
                  </div>
                  <h4 className="font-semibold text-peak-700 text-sm leading-snug">{report.title}</h4>
                  <div className="flex justify-between items-center text-xs pt-2 border-t border-peak-50">
                    <span className="text-2xs uppercase text-peak-400">{report.format.toUpperCase()} • {report.type}</span>
                    <button className="text-terraced-600 font-medium hover:underline text-xs">Download</button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

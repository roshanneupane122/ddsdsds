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
        <h1 className="text-3xl font-bold font-display text-slate-900 tracking-tight">Report & Intelligence Generator</h1>
        <p className="text-sm text-slate-600 mt-1">Generate executive summary PDF reports or export structured raw dataset CSVs for analytical modeling.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7">
          <ReportGenerator />
        </div>

        <div className="lg:col-span-5 space-y-4">
          <h3 className="font-bold text-slate-900 text-base font-display">Recent Saved Reports</h3>

          {reports.length === 0 ? (
            <EmptyState
              title="No Reports Generated Yet"
              description="Generate your first PDF or CSV report using the configuration panel."
            />
          ) : (
            <div className="space-y-3">
              {reports.map((report) => (
                <Card key={report.id} padding="md" className="space-y-2 bg-white border border-emerald-100 shadow-sm">
                  <div className="flex items-center justify-between">
                    <Badge variant="success" size="sm">READY FOR DOWNLOAD</Badge>
                    <span className="text-xs font-mono text-slate-500">{formatDate(report.createdAt)}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm leading-snug">{report.title}</h4>
                  <div className="flex justify-between items-center text-xs pt-2 border-t border-emerald-100 font-mono">
                    <span className="uppercase text-slate-500 font-semibold">{report.format.toUpperCase()} • {report.type}</span>
                    <button className="text-emerald-700 font-bold hover:underline">Download →</button>
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

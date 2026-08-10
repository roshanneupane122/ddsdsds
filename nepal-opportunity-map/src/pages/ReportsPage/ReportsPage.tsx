import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ReportGenerator } from '@/features/reports'
import { Card, Badge, EmptyState, toast } from '@/components/ui'
import { reportsApi } from '@/services/reports.api'
import { formatDate } from '@/lib/formatters'
import jsPDF from 'jspdf'
import type { Report } from '@/types'

export const ReportsPage = () => {
  const queryClient = useQueryClient()
  const { data: reportsData } = useQuery({
    queryKey: ['reports', 'list'],
    queryFn: () => reportsApi.list(),
  })
  const reports = reportsData?.data ?? []

  const handleDownload = (report: Report) => {
    if (report.format === 'csv') {
      const headers = 'ID,Title,Type,Format,GeneratedAt\n'
      const row = `${report.id},"${report.title}",${report.type},${report.format},${report.createdAt}\n`
      const blob = new Blob([headers + row], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${report.title.replace(/ /g, '_')}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success(`Downloaded ${report.title}`)
    } else {
      const doc = new jsPDF()
      doc.setFillColor(5, 150, 105)
      doc.rect(0, 0, 210, 35, 'F')
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(18)
      doc.setTextColor(255, 255, 255)
      doc.text('NEPAL OPPORTUNITY MAP', 14, 20)
      doc.setFontSize(11)
      doc.text(report.title, 14, 28)

      doc.setFontSize(12)
      doc.setTextColor(15, 23, 42)
      doc.text(`Report ID: ${report.id}`, 14, 50)
      doc.text(`Generated At: ${formatDate(report.createdAt)}`, 14, 58)
      doc.text(`Format: ${report.format.toUpperCase()} | Type: ${report.type}`, 14, 66)

      doc.save(`${report.title.replace(/ /g, '_')}.pdf`)
      toast.success(`Downloaded ${report.title}`)
    }
  }

  const handleDelete = async (id: string) => {
    await reportsApi.delete(id)
    queryClient.invalidateQueries({ queryKey: ['reports', 'list'] })
    toast.success('Report removed from history.')
  }

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 tracking-tight">
          Report & Intelligence Generator
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Generate executive summary PDF reports or export structured raw dataset CSVs for analytical modeling.
        </p>
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
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleDownload(report)}
                        className="text-emerald-700 font-bold hover:underline"
                      >
                        Download →
                      </button>
                      <button
                        onClick={() => handleDelete(report.id)}
                        className="text-slate-400 hover:text-red-600 font-semibold"
                        title="Delete report"
                      >
                        ✕
                      </button>
                    </div>
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

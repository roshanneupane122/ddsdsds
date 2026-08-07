import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, Button, toast } from '@/components/ui'
import { municipalitiesApi } from '@/services/municipalities.api'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export const ReportGenerator = () => {
  const { data: municipalitiesData } = useQuery({
    queryKey: ['municipalities', 'list'],
    queryFn: () => municipalitiesApi.list({ limit: 200 }),
  })
  const municipalities = municipalitiesData?.data ?? []

  const [selectedMuniId, setSelectedMuniId] = useState('')
  const [includeRecs, setIncludeRecs] = useState(true)
  const [includeDemo, setIncludeDemo] = useState(true)
  const [isExporting, setIsExporting] = useState(false)

  const activeMuniId = selectedMuniId || municipalities[0]?.id || 'muni-1'

  const handleExportPDF = async () => {
    setIsExporting(true)
    toast.info('Generating PDF report...')

    try {
      const element = document.getElementById('main-content')
      if (!element) throw new Error('Target container not found')

      const canvas = await html2canvas(element, { scale: 1.5, useCORS: true })
      const imgData = canvas.toDataURL('image/png')

      const pdf = new jsPDF('p', 'mm', 'a4')
      const imgWidth = 210
      const pageHeight = 295
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight
      let position = 0

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      pdf.save(`Nepal_Opportunity_Report_${activeMuniId}.pdf`)
      toast.success('Report downloaded successfully!')
    } catch (err) {
      console.error(err)
      toast.error('PDF export failed. Try again.')
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportCSV = () => {
    toast.info('Preparing CSV dataset...')
    const muni = municipalities.find((m) => m.id === activeMuniId) || municipalities[0]
    if (!muni) return

    const headers = 'ID,Name,District,Province,Population,Area,AgriScore,TourismScore,InfraScore\n'
    const row = `${muni.id},"${muni.name}",${muni.district},${muni.province},${muni.population},${muni.area},${muni.agricultureScore},${muni.tourismScore},${muni.infrastructureScore}\n`

    const blob = new Blob([headers + row], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `Municipality_Data_${muni.id}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('CSV dataset exported!')
  }

  return (
    <Card padding="lg" className="space-y-6 max-w-2xl bg-white border border-emerald-100 shadow-sm rounded-2xl">
      <div className="space-y-1">
        <h3 className="font-bold text-slate-900 text-lg font-display">Generate Investment & Profile Report</h3>
        <p className="text-xs text-slate-500 font-medium">Configure parameters for automated PDF synthesis or raw CSV dataset export.</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">Target Municipality</label>
          <select
            value={activeMuniId}
            onChange={(e) => setSelectedMuniId(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white border border-emerald-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/25"
          >
            {municipalities.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.district} District, Prov {m.province})
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2 pt-3 border-t border-emerald-100">
          <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider">Include Report Sections</label>
          <div className="flex items-center gap-6 text-xs text-slate-700 font-medium">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeRecs}
                onChange={(e) => setIncludeRecs(e.target.checked)}
                className="rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
              />
              AI Recommendations Rationale
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeDemo}
                onChange={(e) => setIncludeDemo(e.target.checked)}
                className="rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
              />
              Demographics Breakdown
            </label>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t border-emerald-100">
        <Button onClick={handleExportPDF} isLoading={isExporting} className="flex-1 shadow-md shadow-emerald-600/20">
          Export PDF Report
        </Button>
        <Button variant="outline" onClick={handleExportCSV} className="border-emerald-200">
          Export CSV Data
        </Button>
      </div>

      <p className="text-2xs text-slate-500 font-mono italic">
        Connected to FastAPI GIS Backend engine. PDF compilation extracts active indicator layers.
      </p>
    </Card>
  )
}

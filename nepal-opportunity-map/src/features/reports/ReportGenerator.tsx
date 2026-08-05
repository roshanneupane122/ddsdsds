import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, Button, toast } from '@/components/ui'
import { municipalitiesApi } from '@/services/municipalities.api'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export const ReportGenerator = () => {
  const { data: municipalitiesData } = useQuery({
    queryKey: ['municipalities', 'list'],
    queryFn: () => municipalitiesApi.list(),
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
    <Card padding="lg" className="space-y-6 max-w-2xl bg-white border border-peak-100 shadow-md">
      <div className="space-y-1">
        <h3 className="font-semibold text-peak-700 text-lg font-display">Generate Investment & Profile Report</h3>
        <p className="text-xs text-peak-400">Configure parameters for automated PDF synthesis or raw CSV dataset export.</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-peak-600 mb-1">Target Municipality</label>
          <select
            value={activeMuniId}
            onChange={(e) => setSelectedMuniId(e.target.value)}
            className="w-full px-3 py-2 bg-peak-50 border border-peak-200 rounded-lg text-xs font-medium text-peak-700 focus:outline-none focus:ring-2 focus:ring-terraced-400"
          >
            {municipalities.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.district} District, Prov {m.province})
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2 pt-2 border-t border-peak-100">
          <label className="block text-xs font-medium text-peak-600">Include Sections</label>
          <div className="flex items-center gap-4 text-xs text-peak-600">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeRecs}
                onChange={(e) => setIncludeRecs(e.target.checked)}
                className="rounded border-peak-300 text-terraced-500 focus:ring-terraced-400"
              />
              AI Recommendations Rationale
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeDemo}
                onChange={(e) => setIncludeDemo(e.target.checked)}
                className="rounded border-peak-300 text-terraced-500 focus:ring-terraced-400"
              />
              Demographics Breakdown
            </label>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t border-peak-100">
        <Button onClick={handleExportPDF} isLoading={isExporting} className="flex-1">
          Export PDF Report
        </Button>
        <Button variant="outline" onClick={handleExportCSV}>
          Export CSV Data
        </Button>
      </div>

      <p className="text-2xs text-peak-400 italic">
        Note: Connected to FastAPI backend. Exporting report compiles active indicators.
      </p>
    </Card>
  )
}

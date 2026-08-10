import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { Card, Button, toast } from '@/components/ui'
import { municipalitiesApi } from '@/services/municipalities.api'

export const ReportGenerator = () => {
  const [searchParams] = useSearchParams()
  const urlMuniId = searchParams.get('municipalityId') || ''
  const urlMuniName = searchParams.get('municipalityName') || ''

  const { data: municipalitiesData } = useQuery({
    queryKey: ['municipalities', 'list'],
    queryFn: () => municipalitiesApi.list({ limit: 200 }),
  })
  const municipalities = municipalitiesData?.data ?? []

  const [selectedMuniId, setSelectedMuniId] = useState(urlMuniId)
  const [isExporting, setIsExporting] = useState(false)

  // When municipalities load, auto-select from URL param
  useEffect(() => {
    if (urlMuniId && municipalities.length > 0) {
      const match = municipalities.find((m) => m.id === urlMuniId)
      if (match) setSelectedMuniId(urlMuniId)
    } else if (!selectedMuniId && municipalities.length > 0) {
      setSelectedMuniId(municipalities[0]?.id || '')
    }
  }, [municipalities, urlMuniId])

  const activeMuni = municipalities.find((m) => m.id === selectedMuniId) || municipalities[0]

  // Fetch intelligence profile for the selected municipality
  const { data: intelligence, isLoading: intelLoading } = useQuery({
    queryKey: ['municipalities', 'intelligence', selectedMuniId],
    queryFn: () => municipalitiesApi.getIntelligence(selectedMuniId),
    enabled: !!selectedMuniId,
  })

  const handleExportPDF = async () => {
    if (!activeMuni || !intelligence) {
      toast.error('Please wait for municipality data to load.')
      return
    }
    setIsExporting(true)
    toast.info('Generating municipality intelligence report...')

    try {
      const devIndex = intelligence.development_index || {}
      const economy = intelligence.economy || {}
      const infra = intelligence.infrastructure || {}
      const agri = intelligence.agriculture || {}
      const opps = intelligence.opportunities || []
      const gaps = intelligence.gaps || []
      const strengths = intelligence.strengths || []
      const challenges = intelligence.challenges || []

      const payload = {
        title: `${activeMuni.name} Municipality Intelligence Report`,
        municipality_name: activeMuni.name,
        content: [
          `CATALYST MUNICIPALITY INTELLIGENCE REPORT`,
          `Municipality: ${activeMuni.name}`,
          `District: ${activeMuni.district}`,
          `Province: Lumbini Province`,
          ``,
          `OVERVIEW`,
          `Population: ${(intelligence.overview?.population || 0).toLocaleString()}`,
          `Households: ${(intelligence.overview?.households || 0).toLocaleString()}`,
          `Urbanization Rate: ${intelligence.overview?.urbanization_rate || 0}%`,
          `Average Income: NPR ${economy.average_income_npr || 'N/A'}`,
          ``,
          `DEVELOPMENT INDEX`,
          `Overall: ${devIndex.overall || 0}/100`,
          `Economic: ${devIndex.economic || 0}/100`,
          `Infrastructure: ${devIndex.infrastructure || 0}/100`,
          `Social: ${devIndex.social || 0}/100`,
          `Accessibility: ${devIndex.accessibility || 0}/100`,
          `Digital: ${devIndex.digital || 0}/100`,
          ``,
          `ECONOMIC INDICATORS`,
          `Business Density: ${economy.business_density || 'N/A'} per sq km`,
          `Purchasing Power Index: ${economy.purchasing_power_index || 'N/A'}/100`,
          `Commercial Buildings (avg/ward): ${economy.commercial_buildings_avg || 'N/A'}`,
          `Industrial Units (avg/ward): ${economy.industries_avg || 'N/A'}`,
          ``,
          `AGRICULTURE`,
          `Agricultural Participation: ${agri.agriculture_pct || 'N/A'}%`,
          ``,
          `INFRASTRUCTURE`,
          `Electricity Access: ${infra.electricity_access_pct || 'N/A'}%`,
          `Internet Penetration: ${infra.internet_access_pct || 'N/A'}%`,
          `Water Access: ${infra.water_access_pct || 'N/A'}%`,
          `Avg Road Distance: ${infra.road_distance_km || 'N/A'} km`,
          `Avg Market Distance: ${infra.market_distance_km || 'N/A'} km`,
          `Avg Hospital Distance: ${infra.hospital_distance_km || 'N/A'} km`,
          ``,
          `DATA-DERIVED STRENGTHS`,
          ...strengths.map((s: string) => `• ${s}`),
          ``,
          `IDENTIFIED CHALLENGES`,
          ...challenges.map((c: string) => `• ${c}`),
          ``,
          `INFRASTRUCTURE GAPS`,
          ...gaps.filter((g: any) => g.type !== 'None').map((g: any) => `• [${g.severity}] ${g.type}: ${g.description}`),
          gaps.filter((g: any) => g.type !== 'None').length === 0 ? '• No significant gaps detected.' : '',
          ``,
          `TOP BUSINESS OPPORTUNITIES (ML-Ranked)`,
          ...opps.slice(0, 8).map((o: any, i: number) => `${i + 1}. ${o.business} — Score: ${Math.round(o.confidence)}/100`),
          ``,
          `Report generated by Catalyst AI-Powered Geospatial Decision Support System`,
          `Data Coverage: Rupandehi District, Lumbini Province, Nepal`,
          `Generated: ${new Date().toLocaleDateString()}`,
        ].join('\n'),
        metrics: {
          overall_development_index: devIndex.overall || 0,
          economic_index: devIndex.economic || 0,
          infrastructure_index: devIndex.infrastructure || 0,
          social_index: devIndex.social || 0,
          population: intelligence.overview?.population || 0,
          business_density: economy.business_density || 0,
          electricity_access: infra.electricity_access_pct || 0,
          internet_access: infra.internet_access_pct || 0,
          agriculture_pct: agri.agriculture_pct || 0,
          top_opportunity: opps[0]?.business || 'N/A',
        }
      }

      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/report/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) throw new Error('Backend failed to generate report')

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Catalyst_Report_${activeMuni.name.replace(/ /g, '_')}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('Report downloaded successfully!')
    } catch (err) {
      console.error(err)
      toast.error('PDF export failed. Ensure the backend is running.')
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportCSV = () => {
    if (!intelligence || !activeMuni) return
    toast.info('Preparing CSV dataset...')

    const devIndex = intelligence.development_index || {}
    const economy = intelligence.economy || {}
    const infra = intelligence.infrastructure || {}

    const headers = 'Name,District,Province,Population,Households,Dev_Overall,Dev_Economic,Dev_Infrastructure,Dev_Social,Dev_Digital,Business_Density,Purchasing_Power,Electricity_Pct,Internet_Pct,Road_Dist_km\n'
    const row = [
      `"${activeMuni.name}"`,
      `"${activeMuni.district}"`,
      `"Lumbini"`,
      intelligence.overview?.population || 0,
      intelligence.overview?.households || 0,
      devIndex.overall || 0,
      devIndex.economic || 0,
      devIndex.infrastructure || 0,
      devIndex.social || 0,
      devIndex.digital || 0,
      economy.business_density || 0,
      economy.purchasing_power_index || 0,
      infra.electricity_access_pct || 0,
      infra.internet_access_pct || 0,
      infra.road_distance_km || 0,
    ].join(',') + '\n'

    const blob = new Blob([headers + row], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `Catalyst_Data_${activeMuni.name.replace(/ /g, '_')}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('CSV dataset exported!')
  }

  return (
    <Card padding="lg" className="space-y-6 max-w-2xl bg-white border border-emerald-100 shadow-sm rounded-2xl">
      <div className="space-y-1">
        <h3 className="font-bold text-slate-900 text-lg font-display">Generate Municipality Intelligence Report</h3>
        <p className="text-xs text-slate-500 font-medium">Full report generated from live intelligence data — economy, infrastructure, gaps and opportunities.</p>
      </div>

      {urlMuniName && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2 text-xs font-mono text-emerald-800">
          📍 Pre-selected: <strong>{urlMuniName}</strong>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">Target Municipality</label>
          <select
            value={selectedMuniId}
            onChange={(e) => setSelectedMuniId(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white border border-emerald-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/25"
          >
            {municipalities.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} — {m.district} District, Lumbini Province
              </option>
            ))}
          </select>
        </div>

        {/* Preview of loaded intelligence */}
        {intelligence && !intelLoading && (
          <div className="bg-slate-50 rounded-xl border border-slate-100 p-4 space-y-2 text-xs">
            <p className="font-bold text-slate-700 font-mono uppercase">Report Preview</p>
            <div className="grid grid-cols-2 gap-2 text-slate-600">
              <span>Population: <strong>{(intelligence.overview?.population || 0).toLocaleString()}</strong></span>
              <span>Dev Index: <strong>{intelligence.development_index?.overall || 0}/100</strong></span>
              <span>Top Opportunity: <strong>{intelligence.opportunities?.[0]?.business || 'N/A'}</strong></span>
              <span>Gaps: <strong>{intelligence.gaps?.filter((g: any) => g.type !== 'None').length || 0} identified</strong></span>
            </div>
          </div>
        )}
        {intelLoading && (
          <div className="text-xs text-slate-400 font-mono animate-pulse">Loading intelligence data...</div>
        )}
      </div>

      <div className="flex gap-3 pt-4 border-t border-emerald-100">
        <Button
          onClick={handleExportPDF}
          isLoading={isExporting}
          disabled={intelLoading || !intelligence}
          className="flex-1 shadow-md shadow-emerald-600/20"
        >
          Export PDF Report
        </Button>
        <Button variant="outline" onClick={handleExportCSV} disabled={!intelligence} className="border-emerald-200">
          Export CSV Data
        </Button>
      </div>

      <p className="text-2xs text-slate-500 font-mono italic">
        Powered by Catalyst Intelligence Engine • Data: Rupandehi District ML Dataset
      </p>
    </Card>
  )
}


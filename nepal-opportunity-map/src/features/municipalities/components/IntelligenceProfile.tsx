import React from 'react'
import { Card, Badge, Button, ProgressBar } from '@/components/ui'
import { Link, useNavigate } from 'react-router-dom'
import { formatNumber, formatCurrency } from '@/lib/formatters'
import { useFilterStore } from '@/store'

interface IntelligenceProfileProps {
  intelligence: any
}

export const IntelligenceProfile: React.FC<IntelligenceProfileProps> = ({ intelligence }) => {
  const navigate = useNavigate()
  const { addToCompare, compareIds } = useFilterStore()
  const isCompared = compareIds.includes(intelligence?.municipality_id || intelligence?.id)

  const handleCompare = () => {
    addToCompare(intelligence.municipality_id)
    navigate('/citizen/compare')
  }

  const handleAskAI = () => {
    // Navigate to Dashboard/Chat with pre-filled context
    navigate(`/citizen/dashboard?chatContext=${intelligence.name}`)
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 1. MUNICIPALITY HEADER */}
      <Card padding="lg" className="bg-white border border-emerald-100 shadow-sm rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <svg className="w-64 h-64 text-emerald-900" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="success">{intelligence.province} Province</Badge>
              <Badge variant="muted">{intelligence.district} District</Badge>
            </div>
            <h1 className="text-4xl font-bold font-display text-slate-900 tracking-tight">{intelligence.name}</h1>
            <p className="text-sm text-slate-500 font-medium mt-1">Municipality Intelligence Profile</p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Link to={`/citizen/map?focus=${intelligence.municipality_id}`}>
              <Button variant="outline" className="text-xs">📍 View Map</Button>
            </Link>
            <Button variant={isCompared ? 'secondary' : 'outline'} className="text-xs" onClick={handleCompare}>
              ⚖️ {isCompared ? 'In Compare' : 'Compare'}
            </Button>
            <Link to={`/citizen/reports?municipalityId=${intelligence.municipality_id}&municipalityName=${encodeURIComponent(intelligence.name)}`}>
              <Button className="text-xs">📄 Generate Report</Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-emerald-50">
          <div>
            <p className="text-xs font-mono font-bold text-slate-400 uppercase">Population</p>
            <p className="text-2xl font-bold text-slate-900">{intelligence.overview?.population ? formatNumber(intelligence.overview.population) : <span className="text-sm font-normal italic">Data unavailable</span>}</p>
          </div>
          <div>
            <p className="text-xs font-mono font-bold text-slate-400 uppercase">Households</p>
            <p className="text-2xl font-bold text-slate-900">{intelligence.overview?.households ? formatNumber(intelligence.overview.households) : <span className="text-sm font-normal italic">Data unavailable</span>}</p>
          </div>
          <div>
            <p className="text-xs font-mono font-bold text-slate-400 uppercase">Urbanization</p>
            <p className="text-2xl font-bold text-emerald-700">{intelligence.overview?.urbanization_rate != null ? `${intelligence.overview.urbanization_rate}%` : <span className="text-sm font-normal italic text-slate-500">Data unavailable</span>}</p>
          </div>
          <div>
            <p className="text-xs font-mono font-bold text-slate-400 uppercase">Est. Income / Capita</p>
            <p className="text-2xl font-bold text-emerald-700">{intelligence.economy?.average_income_npr != null ? formatCurrency(intelligence.economy.average_income_npr) : <span className="text-sm font-normal italic text-slate-500">Data unavailable</span>}</p>
          </div>
        </div>
      </Card>

      {/* 2. DEVELOPMENT INDEX */}
      <section>
        <h2 className="text-xl font-bold font-display text-slate-900 mb-4">Municipality Development Index</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white text-slate-900 rounded-2xl p-5 shadow-sm border border-emerald-200 flex flex-col justify-between">
            <div>
              <span className="text-xs font-mono font-bold text-emerald-800 uppercase tracking-wider block mb-1">
                Overall Index
              </span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-5xl font-black font-mono text-emerald-700 tracking-tight">
                  {(() => {
                    const ov = intelligence.development_index?.overall
                    const score = typeof ov === 'object' ? ov?.score : ov
                    return score != null ? score : 'N/A'
                  })()}
                </span>
                <span className="text-base font-bold text-emerald-600 font-mono">/ 100</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-emerald-100 flex items-center justify-between text-xs text-slate-600">
              <span>Composite Index Status</span>
              <span className="font-bold text-emerald-800 font-mono uppercase bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                {(() => {
                  const ov = intelligence.development_index?.overall
                  const status = typeof ov === 'object' ? ov?.status : 'Moderate'
                  return status || 'High'
                })()}
              </span>
            </div>
          </div>
          
          <Card padding="sm" className="bg-white border border-emerald-100 flex flex-col justify-center">
            {(() => {
              const val = intelligence.development_index?.economic
              const score = typeof val === 'object' ? val?.score : val
              return score != null ? <ProgressBar label="Economic Performance" value={score} color="bg-blue-500" /> : <p className="text-xs italic text-slate-500 text-center">Economic data unavailable</p>
            })()}
          </Card>
          <Card padding="sm" className="bg-white border border-emerald-100 flex flex-col justify-center">
            {(() => {
              const val = intelligence.development_index?.infrastructure
              const score = typeof val === 'object' ? val?.score : val
              return score != null ? <ProgressBar label="Infrastructure Readiness" value={score} color="bg-emerald-500" /> : <p className="text-xs italic text-slate-500 text-center">Infrastructure data unavailable</p>
            })()}
          </Card>
          <Card padding="sm" className="bg-white border border-emerald-100 flex flex-col justify-center">
            {(() => {
              const val = intelligence.development_index?.social
              const score = typeof val === 'object' ? val?.score : val
              return score != null ? <ProgressBar label="Social & Healthcare" value={score} color="bg-purple-500" /> : <p className="text-xs italic text-slate-500 text-center">Social data unavailable</p>
            })()}
          </Card>
          <Card padding="sm" className="bg-white border border-emerald-100 flex flex-col justify-center">
            {(() => {
              const val = intelligence.development_index?.accessibility
              const score = typeof val === 'object' ? val?.score : val
              return score != null ? <ProgressBar label="Market Accessibility" value={score} color="bg-orange-500" /> : <p className="text-xs italic text-slate-500 text-center">Accessibility data unavailable</p>
            })()}
          </Card>
          <Card padding="sm" className="bg-white border border-emerald-100 flex flex-col justify-center">
            {(() => {
              const val = intelligence.development_index?.digital
              const score = typeof val === 'object' ? val?.score : val
              return score != null ? <ProgressBar label="Digital Connectivity" value={score} color="bg-cyan-500" /> : <p className="text-xs italic text-slate-500 text-center">Digital data unavailable</p>
            })()}
          </Card>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 3. STRENGTHS & CHALLENGES */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold font-display text-slate-900">Key Insights</h2>
          <Card padding="md" className="bg-white border border-emerald-100 h-full">
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-emerald-800 flex items-center gap-2 mb-3">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-xs">✓</span>
                  Data-Derived Strengths
                </h3>
                <ul className="space-y-2">
                  {intelligence.strengths?.length > 0 ? intelligence.strengths.map((s: string, i: number) => (
                    <li key={i} className="text-sm text-slate-700 bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-50">{s}</li>
                  )) : <li className="text-sm text-slate-500 italic">No significant strengths isolated from data.</li>}
                </ul>
              </div>
              
              <div>
                <h3 className="text-sm font-bold text-red-800 flex items-center gap-2 mb-3">
                  <span className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center text-xs">⚠</span>
                  Identified Challenges
                </h3>
                <ul className="space-y-2">
                  {intelligence.challenges?.length > 0 ? intelligence.challenges.map((c: string, i: number) => (
                    <li key={i} className="text-sm text-slate-700 bg-red-50/30 p-2.5 rounded-lg border border-red-50">{c}</li>
                  )) : <li className="text-sm text-slate-500 italic">No critical challenges isolated from data.</li>}
                </ul>
              </div>
            </div>
          </Card>
        </section>

        {/* 4. INFRASTRUCTURE GAPS */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold font-display text-slate-900">Infrastructure Gaps</h2>
          <Card padding="md" className="bg-white border border-emerald-100 h-full">
            <div className="space-y-3">
              {intelligence.gaps?.length > 0 ? (
                intelligence.gaps.map((gap: any, i: number) => (
                  <div key={i} className={`p-4 rounded-xl border ${
                    gap.severity === 'High' ? 'bg-red-50 border-red-100' : 
                    gap.severity === 'Medium' ? 'bg-orange-50 border-orange-100' : 
                    'bg-amber-50 border-amber-100'
                  }`}>
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-slate-900">{gap.type}</span>
                      <Badge variant={gap.severity === 'High' ? 'danger' : 'warning'}>{gap.severity} Priority</Badge>
                    </div>
                    <p className="text-xs text-slate-600 font-medium">Reason: {gap.description}</p>
                  </div>
                ))
              ) : (
                <div className="text-center p-8 text-slate-500">
                  No significant infrastructure gaps detected relative to district baselines.
                </div>
              )}
            </div>
          </Card>
        </section>
      </div>

      {/* 5. ECONOMIC & AGRICULTURE */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold font-display text-slate-900">Sector Intelligence</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card padding="md" className="bg-white border border-emerald-100 space-y-4">
            <h3 className="font-bold text-slate-800 text-sm">Economy & Business</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-500 font-medium">Business Density</span>
                <span className="font-bold text-slate-900">{intelligence.economy?.business_density != null ? `${intelligence.economy.business_density} / sq.km` : <span className="text-xs italic text-slate-400">Unavailable</span>}</span>
              </div>
              <div className="flex justify-between items-center text-sm p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-500 font-medium">Commercial Bldgs</span>
                <span className="font-bold text-slate-900">{intelligence.economy?.commercial_buildings_avg != null ? `${intelligence.economy.commercial_buildings_avg} avg/ward` : <span className="text-xs italic text-slate-400">Unavailable</span>}</span>
              </div>
              <div className="flex justify-between items-center text-sm p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-500 font-medium">Industrial Units</span>
                <span className="font-bold text-slate-900">{intelligence.economy?.industries_avg != null ? `${intelligence.economy.industries_avg} avg/ward` : <span className="text-xs italic text-slate-400">Unavailable</span>}</span>
              </div>
              <div className="flex justify-between items-center text-sm p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-500 font-medium">Purchasing Power</span>
                <span className="font-bold text-slate-900">{intelligence.economy?.purchasing_power_index != null ? `${intelligence.economy.purchasing_power_index}/100` : <span className="text-xs italic text-slate-400">Unavailable</span>}</span>
              </div>
            </div>
          </Card>
          
          <Card padding="md" className="bg-white border border-emerald-100 space-y-4">
            <h3 className="font-bold text-slate-800 text-sm">Agriculture</h3>
            <div className="space-y-3">
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-center">
                <span className="text-xs font-mono font-bold text-emerald-800 uppercase block mb-1">Agricultural Participation</span>
                <span className="text-3xl font-black text-emerald-700">{intelligence.agriculture?.agriculture_pct != null ? `${intelligence.agriculture.agriculture_pct}%` : 'N/A'}</span>
              </div>
              <p className="text-xs text-slate-600 text-center px-4 leading-relaxed font-medium">
                {intelligence.agriculture?.agriculture_pct > 50 
                  ? "Highly agrarian economy with significant potential for agro-processing and cold storage." 
                  : "Mixed economy with lower direct reliance on primary agriculture."}
              </p>
            </div>
          </Card>

          <Card padding="md" className="bg-white border border-emerald-100 space-y-4">
            <h3 className="font-bold text-slate-800 text-sm">Infrastructure Availability</h3>
            <div className="space-y-3">
              {intelligence.infrastructure?.electricity_access_pct != null ? <ProgressBar label="Electricity Access" value={intelligence.infrastructure.electricity_access_pct} /> : <p className="text-xs italic text-slate-500">Electricity access unavailable</p>}
              {intelligence.infrastructure?.internet_access_pct != null ? <ProgressBar label="Internet Penetration" value={intelligence.infrastructure.internet_access_pct} color="bg-blue-500" /> : <p className="text-xs italic text-slate-500">Internet data unavailable</p>}
              {intelligence.infrastructure?.water_access_pct != null ? <ProgressBar label="Water Access" value={intelligence.infrastructure.water_access_pct} color="bg-cyan-500" /> : <p className="text-xs italic text-slate-500">Water data unavailable</p>}
              
              <div className="pt-2 flex justify-between items-center text-xs border-t border-slate-100">
                <span className="text-slate-500 font-medium">Avg Road Dist.</span>
                <span className="font-bold">{intelligence.infrastructure?.road_distance_km != null ? `${intelligence.infrastructure.road_distance_km} km` : 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Avg Market Dist.</span>
                <span className="font-bold">{intelligence.infrastructure?.market_distance_km != null ? `${intelligence.infrastructure.market_distance_km} km` : 'N/A'}</span>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* 6. BUSINESS OPPORTUNITIES */}
      <section className="space-y-4">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-xl font-bold font-display text-slate-900">Highest Ranked Opportunities</h2>
            <p className="text-sm text-slate-500 mt-1">Generated by Catalyst Opportunity Engine based on local data.</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {intelligence.opportunities?.map((opp: any, i: number) => (
            <div 
              key={i} 
              className="bg-white text-slate-900 rounded-2xl p-4 border border-emerald-200/80 shadow-sm flex flex-col justify-between hover:border-emerald-400 hover:shadow-md hover:scale-[1.02] transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 uppercase tracking-wider">
                  Rank #{i+1}
                </span>
              </div>
              <p className="font-bold text-sm text-slate-900 leading-snug my-2 min-h-[40px]">
                {opp.proposed_business || opp.business}
              </p>
              <div className="flex items-center justify-between mt-auto pt-3 border-t border-emerald-100 text-xs">
                <span className="text-slate-500 font-medium font-mono uppercase text-[10px]">Score</span>
                <span className="font-black text-emerald-700 text-base font-mono">
                  {Math.round(opp.opportunity_score ?? opp.confidence ?? 0)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. SIMILAR MUNICIPALITIES */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold font-display text-slate-900">Similar Municipalities</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {intelligence.similar_municipalities?.map((sim: any, i: number) => (
            <Card key={i} padding="md" className="bg-white border border-emerald-100 hover:border-emerald-300 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-bold text-slate-900">{sim.municipality_name}</h4>
                <Badge variant="success">{sim.similarity_score}% Match</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500 block mb-0.5">Population</span>
                  <span className="font-bold">{formatNumber(sim.key_stats?.population || 0)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-0.5">Dev Index</span>
                  <span className="font-bold text-emerald-700">{Math.round(sim.key_stats?.development_index || 0)}/100</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* 8. AI ANALYST */}
      <section>
        <Card padding="lg" className="bg-white text-slate-900 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 border border-emerald-200 shadow-sm">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold font-display text-slate-900 mb-2">AI Municipality Analyst</h2>
            <p className="text-slate-600 text-sm leading-relaxed mb-4">
              Have questions about {intelligence.name}? Ask the AI Assistant to deeply analyze the sectors, explain the infrastructure gaps, or validate business ideas specific to this municipality's data profile.
            </p>
            <div className="flex flex-wrap gap-2 mb-6">
              <Badge variant="muted" className="bg-emerald-50 text-emerald-800 border-emerald-200 font-medium">"What are the biggest infrastructure gaps?"</Badge>
              <Badge variant="muted" className="bg-emerald-50 text-emerald-800 border-emerald-200 font-medium">"Why is agriculture important here?"</Badge>
              <Badge variant="muted" className="bg-emerald-50 text-emerald-800 border-emerald-200 font-medium">"Compare with Tilottama"</Badge>
            </div>
            <Button onClick={handleAskAI} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold border-transparent shadow-sm px-6 py-2.5 cursor-pointer">
              Ask AI About This Municipality
            </Button>
          </div>
          <div className="hidden md:block">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <svg className="w-16 h-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </Card>
      </section>

      {/* 9. DATA & METHODOLOGY */}
      <section className="text-center pb-8">
        <p className="text-xs text-slate-400 font-mono">
          Data Coverage: Rupandehi District • Data Type: ML Research Dataset • Last Updated: 2026-08-10
        </p>
      </section>
    </div>
  )
}

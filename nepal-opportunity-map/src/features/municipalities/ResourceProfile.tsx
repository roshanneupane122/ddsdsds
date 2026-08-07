import { useState } from 'react'
import { Card, Badge } from '@/components/ui'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts'
import type { MunicipalityDetail } from '@/types'
import { formatNumber, formatCurrency } from '@/lib/formatters'

const COLORS = ['#10b981', '#059669', '#047857', '#14b8a6', '#0f766e']

export const ResourceProfile = ({ detail }: { detail: MunicipalityDetail }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'features' | 'agriculture' | 'tourism' | 'infrastructure' | 'demographics'>('overview')

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <Card padding="lg" className="bg-white border border-emerald-100 shadow-sm space-y-4 rounded-2xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Badge variant="success">Province {detail.province}</Badge>
              <Badge variant="muted">{detail.type.replace('_', ' ').toUpperCase()}</Badge>
              <span className="text-2xs font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200">
                District: {detail.district}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold font-display text-slate-900 tracking-tight">{detail.name}</h1>
            <p className="text-sm text-slate-500 font-medium mt-0.5">{detail.nameNepali} • Rupandehi, Lumbini Province</p>
          </div>

          <div className="flex gap-6 text-center bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-100">
            <div>
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">Total Population</span>
              <p className="text-xl font-extrabold text-slate-900 font-display tabular-nums">{formatNumber(detail.population)}</p>
            </div>
            <div className="border-l border-emerald-200 pl-6">
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">Est. GDP / Capita</span>
              <p className="text-xl font-extrabold text-emerald-700 font-display tabular-nums">{formatCurrency(detail.indicators.gdpPerCapitaUSD)}</p>
            </div>
          </div>
        </div>

        {/* Key Indicators Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-center">
            <span className="text-[10px] font-mono font-bold text-emerald-800 uppercase">Agri Score</span>
            <p className="text-2xl font-bold text-emerald-700">{detail.agricultureScore}/100</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-center">
            <span className="text-[10px] font-mono font-bold text-emerald-800 uppercase">Tourism Index</span>
            <p className="text-2xl font-bold text-emerald-700">{detail.tourismScore}/100</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-center">
            <span className="text-[10px] font-mono font-bold text-emerald-800 uppercase">Infrastructure</span>
            <p className="text-2xl font-bold text-emerald-700">{detail.infrastructureScore}/100</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-center">
            <span className="text-[10px] font-mono font-bold text-emerald-800 uppercase">Economic Index</span>
            <p className="text-2xl font-bold text-emerald-700">{detail.economicScore}/100</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-center col-span-2 sm:col-span-1">
            <span className="text-[10px] font-mono font-bold text-emerald-800 uppercase">Digital Readiness</span>
            <p className="text-2xl font-bold text-emerald-700">{detail.digitalScore}/100</p>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="border-b border-emerald-100">
        <nav className="flex space-x-6 overflow-x-auto" aria-label="Resource tabs">
          {(['overview', 'features', 'agriculture', 'tourism', 'infrastructure', 'demographics'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 px-1 border-b-2 font-bold text-xs sm:text-sm capitalize whitespace-nowrap transition-colors font-mono uppercase tracking-wider ${
                activeTab === tab
                  ? 'border-emerald-600 text-emerald-800'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Panels */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card padding="md" className="space-y-4 bg-white border border-emerald-100 shadow-sm rounded-2xl">
            <h3 className="font-bold text-slate-900 text-base font-display">Key Municipal Assets</h3>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-500 font-mono font-bold block mb-1 uppercase">Natural Resources:</span>
                <p className="text-slate-900 font-bold bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100">
                  {detail.resources.naturalResources.join(' • ')}
                </p>
              </div>
              <div>
                <span className="text-slate-500 font-mono font-bold block mb-1 uppercase">Major Agricultural Yields:</span>
                <p className="text-slate-900 font-bold bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100">
                  {detail.resources.agriculturalProducts.join(' • ')}
                </p>
              </div>
            </div>
          </Card>

          <Card padding="md" className="space-y-4 bg-white border border-emerald-100 shadow-sm rounded-2xl">
            <h3 className="font-bold text-slate-900 text-base font-display">Economic &amp; Industry Base</h3>
            <div className="space-y-3">
              {detail.resources.industries.map((ind, i) => (
                <div key={i} className="flex justify-between items-center text-xs p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                  <div>
                    <p className="font-bold text-slate-900">{ind.name}</p>
                    <p className="text-[10px] font-mono text-emerald-800 uppercase font-bold">{ind.sector}</p>
                  </div>
                  <span className="font-mono font-bold text-emerald-700">{formatNumber(ind.employeeCount)} workforce</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'features' && (
        <div className="space-y-6">
          <Card padding="lg" className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white rounded-2xl space-y-4 shadow-xl">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-300 animate-pulse" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-200">
                Local Strategic Highlights — {detail.name}
              </span>
            </div>
            <h3 className="text-2xl font-bold font-display">What Makes {detail.name} a Prime Investment &amp; Living Hub?</h3>
            <p className="text-emerald-50 text-sm leading-relaxed max-w-3xl">
              Strategically positioned along the Siddharth Highway in Rupandehi District, Tilottama is a model municipality in Lumbini Province. Featuring rapid urbanization, 99.5% grid electrification, and direct access to Gautam Buddha International Airport.
            </p>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card padding="md" className="bg-white border border-emerald-100 shadow-sm space-y-3 rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-xl font-bold">🌾</div>
              <h4 className="font-bold text-slate-900 text-base">Agro-Processing &amp; Cold Storage</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                With 82.5% irrigated fertile land, Tilottama hosts commercial cold storage hubs and high-capacity Basmati rice processing units.
              </p>
            </Card>

            <Card padding="md" className="bg-white border border-emerald-100 shadow-sm space-y-3 rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-xl font-bold">✈️</div>
              <h4 className="font-bold text-slate-900 text-base">Airport &amp; Highway Connectivity</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Located just 12 km from Gautam Buddha International Airport with direct feeder roads to the India-Nepal trade border at Sunauli.
              </p>
            </Card>

            <Card padding="md" className="bg-white border border-emerald-100 shadow-sm space-y-3 rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-xl font-bold">🌳</div>
              <h4 className="font-bold text-slate-900 text-base">Green City &amp; Banbatika Park</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Home to Shankar Nagar Banbatika &amp; Zoo and green corridor parks, attracting over 145,000 eco-tourists and visitors annually.
              </p>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'demographics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card padding="md" className="space-y-4 bg-white border border-emerald-100 shadow-sm rounded-2xl">
            <h3 className="font-bold text-slate-900 text-base">Age Distribution (%)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={detail.demographics?.ageDistribution || []}>
                  <XAxis dataKey="group" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="percent" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card padding="md" className="space-y-4 bg-white border border-emerald-100 shadow-sm rounded-2xl">
            <h3 className="font-bold text-slate-900 text-base">Ethnic Composition</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={detail.demographics?.ethnicGroups || []}
                    dataKey="percent"
                    nameKey="group"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ group, percent }) => `${group}: ${percent}%`}
                  >
                    {(detail.demographics?.ethnicGroups || []).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'tourism' && (
        <Card padding="md" className="space-y-4 bg-white border border-emerald-100 shadow-sm rounded-2xl">
          <h3 className="font-bold text-slate-900 text-base">Top Tourist Attractions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {detail.resources.touristAttractions.map((att, i) => (
              <div key={i} className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-100 flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{att.name}</h4>
                  <p className="text-xs text-slate-500 capitalize mt-0.5">{att.type} • ★ {att.rating}/5.0</p>
                </div>
                {att.annualVisitors && (
                  <Badge variant="success">{formatNumber(att.annualVisitors)} visitors/yr</Badge>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeTab === 'infrastructure' && (
        <Card padding="md" className="space-y-4 bg-white border border-emerald-100 shadow-sm rounded-2xl">
          <h3 className="font-bold text-slate-900 text-base">Infrastructure Asset Inventory</h3>
          <div className="space-y-2.5">
            {detail.resources.infrastructure.map((inf, i) => (
              <div key={i} className="flex justify-between items-center text-xs p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                <div>
                  <span className="font-bold text-slate-900">{inf.name}</span>
                  <span className="text-slate-500 block uppercase text-[10px] font-mono font-semibold">{inf.type}</span>
                </div>
                <Badge variant={inf.status === 'operational' ? 'success' : 'warning'}>
                  {inf.status.replace('_', ' ')}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeTab === 'agriculture' && (
        <Card padding="md" className="space-y-4 bg-white border border-emerald-100 shadow-sm rounded-2xl">
          <h3 className="font-bold text-slate-900 text-base">Agricultural Performance Metrics</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-100">
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">Cultivated Land</span>
              <p className="text-xl font-bold text-emerald-800 mt-1">{detail.indicators.cultivatedLandPercent}%</p>
            </div>
            <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-100">
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">Irrigated Coverage</span>
              <p className="text-xl font-bold text-emerald-800 mt-1">{detail.indicators.irrigatedLandPercent}%</p>
            </div>
            <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-100">
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">Crop Yield</span>
              <p className="text-xl font-bold text-emerald-800 mt-1">{detail.indicators.agriculturalYield} MT/ha</p>
            </div>
            <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-100">
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">Major Crops</span>
              <p className="text-xs font-bold text-emerald-800 mt-1">{detail.indicators.majorCrops.slice(0, 3).join(', ')}</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

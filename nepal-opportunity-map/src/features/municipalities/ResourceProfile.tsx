import { useState } from 'react'
import { Card, Badge } from '@/components/ui'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts'
import type { MunicipalityDetail } from '@/types'
import { formatNumber, formatCurrency } from '@/lib/formatters'

const COLORS = ['#52B788', '#F4A261', '#8ECAE6', '#2D6A4F', '#1B3A4B']

export const ResourceProfile = ({ detail }: { detail: MunicipalityDetail }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'agriculture' | 'tourism' | 'infrastructure' | 'demographics'>('overview')

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <Card padding="lg" className="bg-white border border-peak-100 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="info">Province {detail.province}</Badge>
              <Badge variant="muted">{detail.type.replace('_', ' ').toUpperCase()}</Badge>
            </div>
            <h1 className="text-3xl font-bold font-display text-peak-700">{detail.name}</h1>
            <p className="text-sm text-peak-400">{detail.nameNepali} • {detail.district} District</p>
          </div>
          <div className="flex gap-6 text-center bg-peak-50 p-3 rounded-xl border border-peak-100">
            <div>
              <span className="text-2xs text-peak-400 uppercase tracking-wider font-semibold">Population</span>
              <p className="text-lg font-bold text-peak-700 font-display">{formatNumber(detail.population)}</p>
            </div>
            <div className="border-l border-peak-200 pl-6">
              <span className="text-2xs text-peak-400 uppercase tracking-wider font-semibold">GDP / Capita</span>
              <p className="text-lg font-bold text-terraced-600 font-display">{formatCurrency(detail.indicators.gdpPerCapitaUSD)}</p>
            </div>
          </div>
        </div>

        {/* Indicator Scores Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
          <div className="p-3 rounded-lg bg-terraced-50 border border-terraced-100 text-center">
            <span className="text-2xs font-semibold text-terraced-700 uppercase">Agri Score</span>
            <p className="text-xl font-bold text-terraced-600">{detail.agricultureScore}</p>
          </div>
          <div className="p-3 rounded-lg bg-mist-50 border border-mist-100 text-center">
            <span className="text-2xs font-semibold text-mist-700 uppercase">Tourism Index</span>
            <p className="text-xl font-bold text-mist-600">{detail.tourismScore}</p>
          </div>
          <div className="p-3 rounded-lg bg-saffron-50 border border-saffron-100 text-center">
            <span className="text-2xs font-semibold text-saffron-700 uppercase">Infrastructure</span>
            <p className="text-xl font-bold text-saffron-600">{detail.infrastructureScore}</p>
          </div>
          <div className="p-3 rounded-lg bg-purple-50 border border-purple-100 text-center">
            <span className="text-2xs font-semibold text-purple-700 uppercase">Economic</span>
            <p className="text-xl font-bold text-purple-600">{detail.economicScore}</p>
          </div>
          <div className="p-3 rounded-lg bg-blue-50 border border-blue-100 text-center col-span-2 sm:col-span-1">
            <span className="text-2xs font-semibold text-blue-700 uppercase">Digital Score</span>
            <p className="text-xl font-bold text-blue-600">{detail.digitalScore}</p>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="border-b border-peak-200">
        <nav className="flex space-x-6 overflow-x-auto" aria-label="Resource tabs">
          {(['overview', 'agriculture', 'tourism', 'infrastructure', 'demographics'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 px-1 border-b-2 font-medium text-xs sm:text-sm capitalize whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? 'border-terraced-500 text-terraced-600 font-semibold'
                  : 'border-transparent text-peak-500 hover:text-peak-700'
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
          <Card padding="md" className="space-y-4">
            <h3 className="font-semibold text-peak-700 text-base">Key Municipal Assets</h3>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-peak-400 font-medium">Natural Resources:</span>
                <p className="text-peak-700 font-semibold">{detail.resources.naturalResources.join(', ')}</p>
              </div>
              <div>
                <span className="text-peak-400 font-medium">Agricultural Outputs:</span>
                <p className="text-peak-700 font-semibold">{detail.resources.agriculturalProducts.join(', ')}</p>
              </div>
            </div>
          </Card>

          <Card padding="md" className="space-y-4">
            <h3 className="font-semibold text-peak-700 text-base">Economic & Employment Base</h3>
            <div className="space-y-3">
              {detail.resources.industries.map((ind, i) => (
                <div key={i} className="flex justify-between items-center text-xs p-2.5 bg-peak-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-peak-700">{ind.name}</p>
                    <p className="text-2xs text-peak-400 uppercase">{ind.sector}</p>
                  </div>
                  <span className="font-semibold text-terraced-600">{formatNumber(ind.employeeCount)} workers</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'demographics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card padding="md" className="space-y-4">
            <h3 className="font-semibold text-peak-700 text-base">Age Distribution (%)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={detail.demographics.ageDistribution}>
                  <XAxis dataKey="group" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="percent" fill="#52B788" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card padding="md" className="space-y-4">
            <h3 className="font-semibold text-peak-700 text-base">Ethnic Composition</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={detail.demographics.ethnicGroups}
                    dataKey="percent"
                    nameKey="group"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ group, percent }) => `${group}: ${percent}%`}
                  >
                    {detail.demographics.ethnicGroups.map((_, index) => (
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
        <Card padding="md" className="space-y-4">
          <h3 className="font-semibold text-peak-700 text-base">Top Tourist Attractions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {detail.resources.touristAttractions.map((att, i) => (
              <div key={i} className="p-3 bg-peak-50 rounded-xl border border-peak-100 flex justify-between items-center">
                <div>
                  <h4 className="font-semibold text-peak-700 text-sm">{att.name}</h4>
                  <p className="text-xs text-peak-400 capitalize">{att.type} • ★ {att.rating}/5.0</p>
                </div>
                {att.annualVisitors && (
                  <Badge variant="info">{formatNumber(att.annualVisitors)}/yr</Badge>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeTab === 'infrastructure' && (
        <Card padding="md" className="space-y-4">
          <h3 className="font-semibold text-peak-700 text-base">Infrastructure Asset Inventory</h3>
          <div className="space-y-2">
            {detail.resources.infrastructure.map((inf, i) => (
              <div key={i} className="flex justify-between items-center text-xs p-3 bg-peak-50 rounded-lg">
                <div>
                  <span className="font-semibold text-peak-700">{inf.name}</span>
                  <span className="text-peak-400 block uppercase text-2xs">{inf.type}</span>
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
        <Card padding="md" className="space-y-4">
          <h3 className="font-semibold text-peak-700 text-base">Agricultural Performance Metrics</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-terraced-50 rounded-lg border border-terraced-100">
              <span className="text-2xs text-peak-400 uppercase">Cultivated Land</span>
              <p className="text-lg font-bold text-terraced-700">{detail.indicators.cultivatedLandPercent}%</p>
            </div>
            <div className="p-3 bg-terraced-50 rounded-lg border border-terraced-100">
              <span className="text-2xs text-peak-400 uppercase">Irrigated Land</span>
              <p className="text-lg font-bold text-terraced-700">{detail.indicators.irrigatedLandPercent}%</p>
            </div>
            <div className="p-3 bg-terraced-50 rounded-lg border border-terraced-100">
              <span className="text-2xs text-peak-400 uppercase">Crop Yield</span>
              <p className="text-lg font-bold text-terraced-700">{detail.indicators.agriculturalYield} MT/ha</p>
            </div>
            <div className="p-3 bg-terraced-50 rounded-lg border border-terraced-100">
              <span className="text-2xs text-peak-400 uppercase">Major Crops</span>
              <p className="text-xs font-semibold text-terraced-700">{detail.indicators.majorCrops.join(', ')}</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

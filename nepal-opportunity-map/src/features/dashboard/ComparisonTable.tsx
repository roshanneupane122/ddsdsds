import { Card, Button, Badge } from '@/components/ui'
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Tooltip } from 'recharts'
import type { MunicipalityDetail } from '@/types'
import { formatNumber, formatCurrency } from '@/lib/formatters'
import { useFilterStore } from '@/store'

const CHART_COLORS = ['#52B788', '#F4A261', '#8ECAE6', '#2D6A4F']

export const ComparisonTable = ({ items }: { items: MunicipalityDetail[] }) => {
  const { removeFromCompare, clearCompare } = useFilterStore()

  if (items.length === 0) return null

  // Format data for radar chart comparing composite scores
  const radarData = [
    { subject: 'Agriculture', ...Object.fromEntries(items.map(m => [m.id, m.agricultureScore])) },
    { subject: 'Tourism', ...Object.fromEntries(items.map(m => [m.id, m.tourismScore])) },
    { subject: 'Infrastructure', ...Object.fromEntries(items.map(m => [m.id, m.infrastructureScore])) },
    { subject: 'Economic', ...Object.fromEntries(items.map(m => [m.id, m.economicScore])) },
    { subject: 'Digital', ...Object.fromEntries(items.map(m => [m.id, m.digitalScore])) },
  ]

  return (
    <div className="space-y-8">
      {/* Selection Control Bar */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-peak-100 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-peak-700">Comparing ({items.length}/4) Municipalities:</span>
          <div className="flex flex-wrap gap-2">
            {items.map(m => (
              <Badge key={m.id} variant="info" className="flex items-center gap-1.5">
                {m.name}
                <button onClick={() => removeFromCompare(m.id)} className="hover:text-red-500">×</button>
              </Badge>
            ))}
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={clearCompare} className="text-xs text-peak-400 hover:text-red-500">
          Clear All
        </Button>
      </div>

      {/* Radar Chart Overlay */}
      <Card padding="md" className="space-y-4">
        <h3 className="font-semibold text-peak-700 text-base">Composite Score Radar Overlay</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis angle={30} domain={[0, 100]} />
              {items.map((m, index) => (
                <Radar
                  key={m.id}
                  name={m.name}
                  dataKey={m.id}
                  stroke={CHART_COLORS[index % CHART_COLORS.length]}
                  fill={CHART_COLORS[index % CHART_COLORS.length]}
                  fillOpacity={0.3}
                />
              ))}
              <Tooltip />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Side-by-Side Indicator Comparison Table */}
      <Card padding="none" className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th className="w-48">Indicator</th>
              {items.map(m => (
                <th key={m.id} className="min-w-[180px]">{m.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="font-semibold text-peak-600">Province</td>
              {items.map(m => (
                <td key={m.id}>Province {m.province}</td>
              ))}
            </tr>
            <tr>
              <td className="font-semibold text-peak-600">District</td>
              {items.map(m => (
                <td key={m.id}>{m.district}</td>
              ))}
            </tr>
            <tr>
              <td className="font-semibold text-peak-600">Population</td>
              {items.map(m => (
                <td key={m.id} className="font-bold text-peak-700">{formatNumber(m.population)}</td>
              ))}
            </tr>
            <tr>
              <td className="font-semibold text-peak-600">GDP / Capita</td>
              {items.map(m => (
                <td key={m.id} className="font-bold text-terraced-600">{formatCurrency(m.indicators.gdpPerCapitaUSD)}</td>
              ))}
            </tr>
            <tr>
              <td className="font-semibold text-peak-600">Agriculture Score</td>
              {items.map(m => (
                <td key={m.id}>{m.agricultureScore}/100</td>
              ))}
            </tr>
            <tr>
              <td className="font-semibold text-peak-600">Tourism Score</td>
              {items.map(m => (
                <td key={m.id}>{m.tourismScore}/100</td>
              ))}
            </tr>
            <tr>
              <td className="font-semibold text-peak-600">Infrastructure Score</td>
              {items.map(m => (
                <td key={m.id}>{m.infrastructureScore}/100</td>
              ))}
            </tr>
            <tr>
              <td className="font-semibold text-peak-600">Electrification</td>
              {items.map(m => (
                <td key={m.id}>{m.indicators.electrificationPercent}%</td>
              ))}
            </tr>
            <tr>
              <td className="font-semibold text-peak-600">Internet Penetration</td>
              {items.map(m => (
                <td key={m.id}>{m.indicators.internetPenetrationPercent}%</td>
              ))}
            </tr>
          </tbody>
        </table>
      </Card>
    </div>
  )
}

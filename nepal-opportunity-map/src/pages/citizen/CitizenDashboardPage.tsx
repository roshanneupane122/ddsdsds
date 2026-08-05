import { Link, useNavigate } from 'react-router-dom'
import { Button, Card, Badge } from '@/components/ui'
import { useAuthStore } from '@/store'
import { useQuery } from '@tanstack/react-query'
import { recommendationsApi } from '@/services/recommendations.api'

export const CitizenDashboardPage = () => {
  const navigate = useNavigate()
  const { user, clearAuth } = useAuthStore()

  const { data: featuredRecs = [] } = useQuery({
    queryKey: ['citizen-featured-recommendations'],
    queryFn: () => recommendationsApi.featured(),
  })

  const handleLogout = () => {
    clearAuth()
    navigate('/')
  }

  return (
    <div className="space-y-8 pb-12">
      {/* ── WELCOME BANNER ── */}
      <section className="bg-gradient-hero rounded-2xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#52B788_1px,transparent_1px)] [background-size:20px_20px]" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-terraced-300 text-xs font-medium border border-white/15">
              <span className="w-2 h-2 rounded-full bg-terraced-400 animate-pulse" />
              Citizen Dashboard
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display">
              Welcome, <span className="text-terraced-300">{user?.name || user?.email || 'Citizen'}</span>!
            </h1>
            <p className="text-peak-100 text-sm max-w-xl">
              Explore GIS layers, economic indicators, and AI-powered investment opportunities across all of Nepal's 753 local units.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/citizen/map">
              <Button size="sm" className="bg-terraced-500 hover:bg-terraced-600 text-white font-semibold shadow-md">
                Launch Map Explorer
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-white/30 text-white hover:bg-white/10 hover:border-white"
            >
              Logout
            </Button>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card padding="md" className="bg-white border border-peak-100 shadow-xs space-y-2">
          <p className="text-2xs font-semibold text-peak-400 uppercase tracking-wider">Local Units Mapped</p>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-display text-peak-800">753</span>
            <Badge variant="info" size="sm">100% Coverage</Badge>
          </div>
          <p className="text-xs text-peak-500">All 7 provinces included</p>
        </Card>

        <Card padding="md" className="bg-white border border-peak-100 shadow-xs space-y-2">
          <p className="text-2xs font-semibold text-peak-400 uppercase tracking-wider">AI Opportunities</p>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-display text-peak-800">1,420+</span>
            <Badge variant="success" size="sm">Active Engine</Badge>
          </div>
          <p className="text-xs text-peak-500">Evidence-backed venture cards</p>
        </Card>

        <Card padding="md" className="bg-white border border-peak-100 shadow-xs space-y-2">
          <p className="text-2xs font-semibold text-peak-400 uppercase tracking-wider">Capital Pipeline</p>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-display text-peak-800">$85M+</span>
            <Badge variant="warning" size="sm">High Confidence</Badge>
          </div>
          <p className="text-xs text-peak-500">Across agriculture &amp; tourism</p>
        </Card>

        <Card padding="md" className="bg-white border border-peak-100 shadow-xs space-y-2">
          <p className="text-2xs font-semibold text-peak-400 uppercase tracking-wider">Your Role</p>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-display text-peak-800">Citizen</span>
            <Badge variant="muted" size="sm">Verified</Badge>
          </div>
          <p className="text-xs text-peak-500">{user?.email}</p>
        </Card>
      </section>

      {/* ── MODULES ── */}
      <section className="space-y-6">
        <h2 className="text-xl font-bold font-display text-peak-700">Explore</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card hover className="bg-white border border-peak-100 shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-lg bg-terraced-100 text-terraced-700 flex items-center justify-center text-lg">🗺️</div>
              <h3 className="font-semibold text-peak-800 text-base">Map Explorer</h3>
              <p className="text-xs text-peak-500">Choropleth spatial visualization with indicator filters across all local units.</p>
            </div>
            <Link to="/citizen/map" className="block pt-2 border-t border-peak-100">
              <Button variant="outline" size="sm" className="w-full text-xs">Open Map →</Button>
            </Link>
          </Card>

          <Card hover className="bg-white border border-peak-100 shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-lg bg-mist-100 text-mist-700 flex items-center justify-center text-lg">⭐</div>
              <h3 className="font-semibold text-peak-800 text-base">AI Recommendations</h3>
              <p className="text-xs text-peak-500">Sector-specific opportunity rationale, ROI estimates, and risk factors.</p>
            </div>
            <Link to="/citizen/recommendations" className="block pt-2 border-t border-peak-100">
              <Button variant="outline" size="sm" className="w-full text-xs">View Recommendations →</Button>
            </Link>
          </Card>

          <Card hover className="bg-white border border-peak-100 shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-lg bg-saffron-100 text-saffron-700 flex items-center justify-center text-lg">📊</div>
              <h3 className="font-semibold text-peak-800 text-base">Compare Municipalities</h3>
              <p className="text-xs text-peak-500">Side-by-side indicator metrics comparison for up to 4 municipalities.</p>
            </div>
            <Link to="/citizen/compare" className="block pt-2 border-t border-peak-100">
              <Button variant="outline" size="sm" className="w-full text-xs">Compare →</Button>
            </Link>
          </Card>

          <Card hover className="bg-white border border-peak-100 shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-lg bg-ridge-100 text-ridge-700 flex items-center justify-center text-lg">📄</div>
              <h3 className="font-semibold text-peak-800 text-base">Reports &amp; Exports</h3>
              <p className="text-xs text-peak-500">Generate downloadable PDF profiles and structured data exports.</p>
            </div>
            <Link to="/citizen/reports" className="block pt-2 border-t border-peak-100">
              <Button variant="outline" size="sm" className="w-full text-xs">Generate Reports →</Button>
            </Link>
          </Card>
        </div>
      </section>

      {/* ── FEATURED OPPORTUNITIES ── */}
      {featuredRecs.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-display text-peak-700">Featured Opportunities</h2>
            <Link to="/citizen/recommendations" className="text-xs text-terraced-600 hover:underline font-semibold">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {featuredRecs.map((rec) => (
              <Card key={rec.id} padding="md" className="bg-white border border-peak-100 shadow-xs space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-semibold text-peak-800 leading-snug">{rec.title}</span>
                  <Badge variant={rec.confidence === 'high' ? 'success' : rec.confidence === 'medium' ? 'warning' : 'muted'} size="sm">
                    {rec.confidence}
                  </Badge>
                </div>
                <p className="text-2xs text-peak-400">{rec.municipalityName} · Province {rec.province}</p>
                <p className="text-xs text-peak-500 line-clamp-2">{rec.summary}</p>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

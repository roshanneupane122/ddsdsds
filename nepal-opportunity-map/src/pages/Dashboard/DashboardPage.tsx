import { Link, useNavigate } from 'react-router-dom'
import { Button, Card, Badge } from '@/components/ui'
import { useAuthStore } from '@/store'

export const DashboardPage = () => {
  const navigate = useNavigate()
  const { user, clearAuth } = useAuthStore()

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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs text-terraced-300 font-medium border border-white/15">
              <span className="w-2 h-2 rounded-full bg-terraced-400 animate-pulse" />
              Authenticated Session Active
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display">
              Welcome back, <span className="text-terraced-300">{user?.name || user?.email || 'User'}</span>!
            </h1>
            <p className="text-peak-100 text-sm max-w-xl">
              Access real-time GIS layers, regional economic indicators, and AI opportunity recommendations across Nepal.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/dashboard/map">
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

      {/* ── METRICS OVERVIEW ── */}
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
          <p className="text-xs text-peak-500">Across agriculture & tourism</p>
        </Card>

        <Card padding="md" className="bg-white border border-peak-100 shadow-xs space-y-2">
          <p className="text-2xs font-semibold text-peak-400 uppercase tracking-wider">Account Role</p>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-display text-peak-800 capitalize">{user?.role || 'Entrepreneur'}</span>
            <Badge variant="muted" size="sm">Verified</Badge>
          </div>
          <p className="text-xs text-peak-500">{user?.email}</p>
        </Card>
      </section>

      {/* ── DASHBOARD HOME PLACEHOLDER CONTENT ── */}
      <section className="space-y-6">
        <h2 className="text-xl font-bold font-display text-peak-700">Protected Dashboard Modules</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card hover className="bg-white border border-peak-100 shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-lg bg-terraced-100 text-terraced-700 flex items-center justify-center text-lg">
                🗺️
              </div>
              <h3 className="font-semibold text-peak-800 text-base">Map Explorer</h3>
              <p className="text-xs text-peak-500">Choropleth spatial visualization across local units with indicator filters.</p>
            </div>
            <Link to="/dashboard/map" className="block pt-2 border-t border-peak-100">
              <Button variant="outline" size="sm" className="w-full text-xs">
                Open Map →
              </Button>
            </Link>
          </Card>

          <Card hover className="bg-white border border-peak-100 shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-lg bg-mist-100 text-mist-700 flex items-center justify-center text-lg">
                ⭐
              </div>
              <h3 className="font-semibold text-peak-800 text-base">AI Recommendations</h3>
              <p className="text-xs text-peak-500">Explore sector-specific opportunity rationale, ROI estimates, and risk factors.</p>
            </div>
            <Link to="/dashboard/recommendations" className="block pt-2 border-t border-peak-100">
              <Button variant="outline" size="sm" className="w-full text-xs">
                View Recommendations →
              </Button>
            </Link>
          </Card>

          <Card hover className="bg-white border border-peak-100 shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-lg bg-saffron-100 text-saffron-700 flex items-center justify-center text-lg">
                📊
              </div>
              <h3 className="font-semibold text-peak-800 text-base">Municipality Compare</h3>
              <p className="text-xs text-peak-500">Side-by-side indicator metrics comparison for up to 4 municipalities.</p>
            </div>
            <Link to="/dashboard/compare" className="block pt-2 border-t border-peak-100">
              <Button variant="outline" size="sm" className="w-full text-xs">
                Compare Local Units →
              </Button>
            </Link>
          </Card>

          <Card hover className="bg-white border border-peak-100 shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-lg bg-ridge-100 text-ridge-700 flex items-center justify-center text-lg">
                📄
              </div>
              <h3 className="font-semibold text-peak-800 text-base">Reports & Exports</h3>
              <p className="text-xs text-peak-500">Generate downloadable PDF profiles and structured data exports for pitching.</p>
            </div>
            <Link to="/dashboard/reports" className="block pt-2 border-t border-peak-100">
              <Button variant="outline" size="sm" className="w-full text-xs">
                Generate Reports →
              </Button>
            </Link>
          </Card>
        </div>

        {/* Placeholder Information Box */}
        <Card padding="lg" className="bg-white border border-peak-100 shadow-sm space-y-4">
          <h3 className="text-lg font-bold font-display text-peak-800">System Status & Environment</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-peak-600">
            <div className="p-3 bg-peak-50 rounded-lg border border-peak-100 space-y-1">
              <span className="font-semibold text-peak-800 block">FastAPI Backend Status</span>
              <span className="text-terraced-600 font-mono font-medium">Connected to http://127.0.0.1:8000</span>
            </div>
            <div className="p-3 bg-peak-50 rounded-lg border border-peak-100 space-y-1">
              <span className="font-semibold text-peak-800 block">JWT Authentication Token</span>
              <span className="text-terraced-600 font-mono font-medium">Auto-Attached via Request Interceptor</span>
            </div>
            <div className="p-3 bg-peak-50 rounded-lg border border-peak-100 space-y-1">
              <span className="font-semibold text-peak-800 block">Session State Persistence</span>
              <span className="text-terraced-600 font-mono font-medium">Active across page refreshes</span>
            </div>
          </div>
        </Card>
      </section>
    </div>
  )
}

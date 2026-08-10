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
      <section className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-700 rounded-2xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#ecfdf5_1px,transparent_1px)] [background-size:20px_20px]" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-emerald-100 text-xs font-bold border border-white/20 uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
              Citizen Intelligence Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Welcome, <span className="text-emerald-200">{user?.name || user?.email || 'Citizen'}</span>!
            </h1>
            <p className="text-emerald-50 text-sm max-w-xl leading-relaxed">
              Discover local GIS layers, agricultural yields, infrastructure scores, and AI investment cards across Nepal's 753 local units.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link to="/citizen/map">
              <Button size="sm" className="bg-white text-emerald-900 hover:bg-emerald-50 font-bold shadow-md h-9">
                Launch Map Explorer
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              // FIX: Added '!bg-transparent', '!border-white/40', '!text-white' to override default outline styles
              className="!bg-transparent !border-white/40 !text-white hover:!bg-white/10 hover:!border-white h-9"
            >
              Logout
            </Button>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card padding="md" className="bg-white border border-emerald-100 shadow-sm space-y-2">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Local Units Mapped</p>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-slate-900">753</span>
            <Badge variant="success" size="sm">100% COVERED</Badge>
          </div>
          <p className="text-xs text-slate-600 font-medium">All 7 provinces included</p>
        </Card>

        <Card padding="md" className="bg-white border border-emerald-100 shadow-sm space-y-2">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">AI Opportunities</p>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-slate-900">1,420+</span>
            <Badge variant="success" size="sm">ACTIVE ENGINE</Badge>
          </div>
          <p className="text-xs text-slate-600 font-medium">Evidence-backed venture cards</p>
        </Card>

        <Card padding="md" className="bg-white border border-emerald-100 shadow-sm space-y-2">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Capital Pipeline</p>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-slate-900">$85M+</span>
            <Badge variant="warning" size="sm">HIGH IMPACT</Badge>
          </div>
          <p className="text-xs text-slate-600 font-medium">Across agriculture &amp; tourism</p>
        </Card>

        <Card padding="md" className="bg-white border border-emerald-100 shadow-sm space-y-2">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Your Role</p>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-slate-900">Citizen</span>
            <Badge variant="info" size="sm">VERIFIED</Badge>
          </div>
          <p className="text-xs text-slate-600 font-medium">{user?.email}</p>
        </Card>
      </section>

      {/* ── MODULES ── */}
      <section className="space-y-5">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Explore Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card hover className="bg-white border border-emerald-100 shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-xl font-bold">🗺️</div>
              <h3 className="font-bold text-slate-900 text-base">Map Explorer</h3>
              <p className="text-xs text-slate-600 leading-relaxed">Interactive spatial GIS choropleth map visualization with instant municipality search.</p>
            </div>
            <Link to="/citizen/map" className="block pt-3 border-t border-emerald-100">
              <Button variant="outline" size="sm" className="w-full text-xs">Open Map →</Button>
            </Link>
          </Card>

          <Card hover className="bg-white border border-emerald-100 shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-xl font-bold">⭐</div>
              <h3 className="font-bold text-slate-900 text-base">AI Recommendations</h3>
              <p className="text-xs text-slate-600 leading-relaxed">Sector opportunity rationale, expected ROI, and risk analysis for local investments.</p>
            </div>
            <Link to="/citizen/recommendations" className="block pt-3 border-t border-emerald-100">
              <Button variant="outline" size="sm" className="w-full text-xs">View Recommendations →</Button>
            </Link>
          </Card>

          <Card hover className="bg-white border border-emerald-100 shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-xl font-bold">📊</div>
              <h3 className="font-bold text-slate-900 text-base">Compare Municipalities</h3>
              <p className="text-xs text-slate-600 leading-relaxed">Side-by-side indicator metrics comparison for up to 4 municipalities in Nepal.</p>
            </div>
            <Link to="/citizen/compare" className="block pt-3 border-t border-emerald-100">
              <Button variant="outline" size="sm" className="w-full text-xs">Compare →</Button>
            </Link>
          </Card>

          <Card hover className="bg-white border border-emerald-100 shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-xl font-bold">📄</div>
              <h3 className="font-bold text-slate-900 text-base">Reports &amp; Exports</h3>
              <p className="text-xs text-slate-600 leading-relaxed">Generate downloadable PDF profiles and structured data exports for local planning.</p>
            </div>
            <Link to="/citizen/reports" className="block pt-3 border-t border-emerald-100">
              <Button variant="outline" size="sm" className="w-full text-xs">Generate Reports →</Button>
            </Link>
          </Card>
        </div>
      </section>

      {/* ── FEATURED OPPORTUNITIES ── */}
      {featuredRecs.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-display text-slate-900">Featured Opportunities</h2>
            <Link to="/citizen/recommendations" className="text-xs text-emerald-700 hover:underline font-bold">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {featuredRecs.map((rec) => (
              <Card key={rec.id} padding="md" className="bg-white border border-emerald-100 shadow-sm space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-bold text-slate-900 leading-snug">{rec.title}</span>
                  <Badge variant={rec.confidence === 'high' ? 'success' : rec.confidence === 'medium' ? 'warning' : 'muted'} size="sm">
                    {rec.confidence}
                  </Badge>
                </div>
                <p className="text-2xs font-mono font-semibold text-slate-500">{rec.municipalityName} · Province {rec.province}</p>
                <p className="text-xs text-slate-600 line-clamp-2 font-normal leading-relaxed">{rec.summary}</p>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

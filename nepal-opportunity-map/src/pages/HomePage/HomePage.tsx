import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button, Card, Badge, ConfidenceBadge } from '@/components/ui'
import { useQuery } from '@tanstack/react-query'
import { recommendationsApi } from '@/services/recommendations.api'
import { MUNICIPALITY_TYPE_LABELS } from '@/constants'

export const HomePage = () => {
  const [activeTab, setActiveTab] = useState<'entrepreneur' | 'investor' | 'policymaker'>('entrepreneur')

  const { data: featuredRecs = [] } = useQuery({
    queryKey: ['recommendations', 'featured'],
    queryFn: () => recommendationsApi.featured(),
  })

  // Hero animated stat counter values
  const [stats, setStats] = useState({ municipalities: 0, opportunities: 0, investment: 0 })

  useEffect(() => {
    const duration = 1200
    const steps = 30
    const stepTime = duration / steps
    let currentStep = 0

    const timer = setInterval(() => {
      currentStep++
      const progress = currentStep / steps
      setStats({
        municipalities: Math.floor(753 * Math.min(1, progress)),
        opportunities: Math.floor(1420 * Math.min(1, progress)),
        investment: Math.floor(85 * Math.min(1, progress)),
      })

      if (currentStep >= steps) clearInterval(timer)
    }, stepTime)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="space-y-16 pb-12">
      {/* ── HERO SECTION ── */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-hero text-white p-8 md:p-12 lg:p-16 shadow-2xl border border-peak-700">
        {/* Background Decorative Grid / Map Fragment Graphic */}
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#52B788_1px,transparent_1px)] [background-size:24px_24px]" />
        
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-medium text-terraced-300">
              <span className="w-2 h-2 rounded-full bg-terraced-400 animate-pulse" />
              AI-Powered GIS Intelligence for Nepal
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight text-white">
              Catalyst is Nepal’s private intelligence layer for <span className="bg-gradient-to-r from-terraced-300 via-mist-200 to-saffron-300 bg-clip-text text-transparent">high-impact opportunities</span>
            </h1>

            <p className="text-peak-100 text-lg md:text-xl font-normal max-w-2xl leading-relaxed">
              This platform helps founders, investors, and municipalities discover evidence-backed opportunities across Nepal. Sign in or create an account to access the protected experience.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link to="/auth/login">
                <Button size="lg" className="bg-terraced-500 hover:bg-terraced-600 text-white font-semibold shadow-lg shadow-terraced-500/20">
                  Sign In
                </Button>
              </Link>
              <Link to="/auth/register">
                <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 hover:border-white">
                  Create Account
                </Button>
              </Link>
            </div>

            {/* Stat Counters */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/15">
              <div>
                <p className="text-2xl md:text-3xl font-bold font-display text-terraced-300">{stats.municipalities}</p>
                <p className="text-xs text-peak-200 uppercase tracking-wider font-medium">Municipalities Covered</p>
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-bold font-display text-mist-200">{stats.opportunities}+</p>
                <p className="text-xs text-peak-200 uppercase tracking-wider font-medium">AI Recommendations</p>
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-bold font-display text-saffron-300">${stats.investment}M+</p>
                <p className="text-xs text-peak-200 uppercase tracking-wider font-medium">Potential Capital Pipeline</p>
              </div>
            </div>
          </div>

          {/* Hero Signature Map Fragment Graphic */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden bg-peak-900/80 border border-white/20 shadow-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-terraced-300 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-terraced-400" />
                  Live GIS Spotlight: Butwal Sub-Metro
                </span>
                <Badge variant="info">Lumbini Province</Badge>
              </div>

              {/* Animated Territory Overlay Mock Visual */}
              <div className="h-48 rounded-xl bg-gradient-to-br from-ridge-900 via-peak-900 to-peak-800 relative flex items-center justify-center overflow-hidden border border-white/10">
                <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#8ECAE6_1px,transparent_1px)] [background-size:16px_16px]" />
                <svg className="w-44 h-44 text-terraced-400/30 animate-pulse-slow" viewBox="0 0 100 100" fill="currentColor">
                  <polygon points="20,10 80,15 90,60 60,95 15,80 10,40" />
                </svg>
                <div className="absolute z-10 text-center space-y-1">
                  <span className="px-3 py-1 bg-terraced-500/90 text-white font-semibold text-xs rounded-full shadow-lg">
                    Highest Industrial & Trade Potential
                  </span>
                  <p className="text-2xs text-peak-200">Rupandehi Agro-Industrial Corridor</p>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <div className="flex justify-between text-xs text-peak-200">
                  <span>Agricultural Output:</span>
                  <span className="font-semibold text-white">51/100</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-1.5">
                  <div className="bg-terraced-400 h-1.5 rounded-full" style={{ width: '51%' }} />
                </div>

                <div className="flex justify-between text-xs text-peak-200 pt-1">
                  <span>Tourism Index:</span>
                  <span className="font-semibold text-white">94/100</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-1.5">
                  <div className="bg-mist-300 h-1.5 rounded-full" style={{ width: '94%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHO IS THIS FOR (PERSONA TABS) ── */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-3xl font-bold font-display text-peak-700">Built for Strategic Decision Makers</h2>
          <p className="text-peak-500 text-sm">Tailored analytical views for every stakeholder in Nepal's economic development.</p>
        </div>

        <div className="flex justify-center border-b border-peak-200">
          <nav className="flex space-x-8" aria-label="Tabs">
            {(['entrepreneur', 'investor', 'policymaker'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
                  activeTab === tab
                    ? 'border-terraced-500 text-terraced-600 font-semibold'
                    : 'border-transparent text-peak-500 hover:text-peak-700 hover:border-peak-300'
                }`}
              >
                {tab === 'entrepreneur' && '🚀 Entrepreneurs'}
                {tab === 'investor' && '💼 Investors & Funds'}
                {tab === 'policymaker' && '🏛️ Municipalities & Policy'}
              </button>
            ))}
          </nav>
        </div>

        <Card padding="lg" className="bg-white border border-peak-100 shadow-md">
          {activeTab === 'entrepreneur' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h3 className="font-semibold text-peak-700 text-lg">Spot Unmet Demand</h3>
                <p className="text-sm text-peak-500">Discover niche market gaps in high-yield sectors like organic tea processing, eco-tourism, or solar microgrids before competitors.</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-peak-700 text-lg">Feasibility Context</h3>
                <p className="text-sm text-peak-500">Instantly inspect road density, clean water access, internet connectivity, and banking branch density for any site.</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-peak-700 text-lg">Export-Ready Pitching</h3>
                <p className="text-sm text-peak-500">Export structured pitch data and municipality profiles into PDF format to present to bank managers and investors.</p>
              </div>
            </div>
          )}

          {activeTab === 'investor' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h3 className="font-semibold text-peak-700 text-lg">Regional Comparison</h3>
                <p className="text-sm text-peak-500">Side-by-side comparative analytics for up to 4 municipalities evaluating GDP, labor availability, and literacy rates.</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-peak-700 text-lg">Risk & Confidence Ratings</h3>
                <p className="text-sm text-peak-500">AI opportunity cards provide detailed confidence scores, risk factor analysis, and projected ROI ranges.</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-peak-700 text-lg">Pipeline Generation</h3>
                <p className="text-sm text-peak-500">Filter deal flow across all 7 provinces by capital requirement, sector classification, and payback period.</p>
              </div>
            </div>
          )}

          {activeTab === 'policymaker' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h3 className="font-semibold text-peak-700 text-lg">Resource Mapping</h3>
                <p className="text-sm text-peak-500">Comprehensive inventory of natural assets, cultural sites, existing industrial units, and agricultural yields.</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-peak-700 text-lg">Promotional Intelligence</h3>
                <p className="text-sm text-peak-500">Generate evidence-based municipal investment guides to attract private capital to rural and suburban local units.</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-peak-700 text-lg">Infrastructure Gap Analysis</h3>
                <p className="text-sm text-peak-500">Identify bottleneck indicators hindering local economic growth compared to provincial averages.</p>
              </div>
            </div>
          )}
        </Card>
      </section>

      {/* ── FEATURED OPPORTUNITIES ── */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold font-display text-peak-700">Top AI Opportunity Recommendations</h2>
            <p className="text-peak-500 text-sm">High-confidence ventures generated from regional data synthesis.</p>
          </div>
          <Link to="/recommendations">
            <Button variant="ghost" size="sm" className="text-terraced-600 hover:text-terraced-700">
              View All Opportunities →
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredRecs.slice(0, 3).map(rec => (
            <Card key={rec.id} hover className="flex flex-col justify-between h-full border border-peak-100">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="muted" size="sm">{MUNICIPALITY_TYPE_LABELS['metropolitan_city']}</Badge>
                  <ConfidenceBadge level={rec.confidence} />
                </div>
                <h3 className="font-semibold text-peak-700 text-base leading-snug line-clamp-2">{rec.title}</h3>
                <p className="text-xs text-peak-500 line-clamp-3">{rec.summary}</p>
              </div>

              <div className="pt-4 mt-4 border-t border-peak-100 space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-peak-400">Est. Investment:</span>
                  <span className="font-semibold text-peak-700">
                    ${(rec.estimatedInvestmentUSD.min / 1000).toFixed(0)}k - ${(rec.estimatedInvestmentUSD.max / 1000).toFixed(0)}k
                  </span>
                </div>
                <Link to={`/recommendations#${rec.id}`} className="block">
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    Inspect Rationale & Data
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="rounded-2xl bg-peak-700 text-white p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2 text-center md:text-left">
          <h3 className="text-2xl font-bold font-display">Ready to access the protected platform?</h3>
          <p className="text-peak-200 text-sm max-w-xl">
            Join Catalyst to review opportunity intelligence, saved recommendations, and map-based analysis for Nepal.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 justify-center md:justify-end">
          <Link to="/auth/login">
            <Button size="lg" className="bg-terraced-500 hover:bg-terraced-600 text-white">
              Sign In
            </Button>
          </Link>
          <Link to="/auth/register">
            <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 hover:border-white">
              Create Account
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}

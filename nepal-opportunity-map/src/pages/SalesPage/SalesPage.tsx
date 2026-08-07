import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button, Card, Input, toast } from '@/components/ui'

export const SalesPage = () => {
  const [stats, setStats] = useState({ municipalities: 0, opportunities: 0, investment: 0 })
  const [contactName, setContactName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactMsg, setContactMsg] = useState('')
  const [isSending, setIsSending] = useState(false)

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

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!contactEmail || !contactMsg) {
      toast.error('Please fill in your email and message.')
      return
    }
    setIsSending(true)
    setTimeout(() => {
      setIsSending(false)
      toast.success('Thank you for reaching out! We will contact you soon.')
      setContactName('')
      setContactEmail('')
      setContactMsg('')
    }, 600)
  }

  return (
    <div className="min-h-screen bg-[#F4FBF7] text-slate-800 font-body">
      {/* ── NAVBAR ── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-emerald-100/90 px-6 py-4 flex items-center justify-between shadow-2xs">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-700 via-emerald-600 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-600/20 group-hover:shadow-lg transition-all duration-300">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <div>
            <span className="font-display font-bold text-slate-900 text-lg tracking-tight leading-none block group-hover:text-emerald-700 transition-colors">
              Catalyst
            </span>
            <span className="block text-[10px] text-emerald-700 font-mono font-bold uppercase tracking-widest mt-0.5">Nepal Opportunity Map</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">
          <a href="#home" className="hover:text-emerald-700 transition-colors">Home</a>
          <a href="#services" className="hover:text-emerald-700 transition-colors">Services</a>
          <a href="#architecture" className="hover:text-emerald-700 transition-colors">Architecture</a>
          <a href="#contact" className="hover:text-emerald-700 transition-colors">Contact</a>
          <div className="h-4 w-px bg-emerald-200 mx-2" />
          <Link to="/login" className="text-slate-800 hover:text-emerald-800 transition-colors font-bold">Login</Link>
          <Link to="/register">
            <Button size="sm" className="font-bold shadow-md shadow-emerald-600/20 px-5 text-xs">
              Get Access →
            </Button>
          </Link>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24 py-12 md:py-20">
        
        {/* ── HERO SECTION ── */}
        <section id="home" className="relative pt-6 pb-12 lg:pt-12 lg:pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-8">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-300 bg-emerald-100/90 text-xs font-mono font-bold text-emerald-900 uppercase tracking-wider shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                Spatial GIS Intelligence Engine v2.4
              </div>

              <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] text-slate-900">
                Economic clarity for <br />
                <span className="text-emerald-700">Nepal's 753 local units.</span>
              </h1>

              <p className="text-slate-600 text-lg md:text-xl max-w-xl leading-relaxed font-medium">
                Institutional-grade GIS data, AI-driven opportunity matching, and capital pipeline analytics. Built for entrepreneurs, investors, and municipal policymakers.
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <Link to="/register">
                  <Button size="lg" className="h-13 px-8 text-base font-bold shadow-lg shadow-emerald-600/30">
                    Start Exploration →
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="lg" className="h-13 px-8 text-base font-bold border-emerald-300 text-emerald-900 hover:bg-emerald-50 bg-white">
                    Platform Login
                  </Button>
                </Link>
              </div>

              {/* Stat Counters */}
              <div className="grid grid-cols-3 gap-6 sm:gap-8 pt-8 border-t border-emerald-100">
                <div>
                  <p className="text-4xl font-display font-extrabold text-slate-900 tabular-nums tracking-tight">{stats.municipalities}</p>
                  <p className="text-xs text-emerald-800 font-mono font-bold uppercase tracking-wider mt-1">Local Units Mapped</p>
                </div>
                <div>
                  <p className="text-4xl font-display font-extrabold text-emerald-700 tabular-nums tracking-tight">{stats.opportunities}<span className="text-lg align-top ml-0.5">+</span></p>
                  <p className="text-xs text-emerald-800 font-mono font-bold uppercase tracking-wider mt-1">AI Opportunities</p>
                </div>
                <div>
                  <p className="text-4xl font-display font-extrabold text-teal-700 tabular-nums tracking-tight">${stats.investment}<span className="text-lg align-top ml-0.5">M</span></p>
                  <p className="text-xs text-emerald-800 font-mono font-bold uppercase tracking-wider mt-1">Capital Pipeline</p>
                </div>
              </div>
            </div>

            {/* MAP CARD SHOWCASE */}
            <div className="lg:col-span-5 relative w-full">
              <div className="rounded-3xl bg-gradient-to-b from-white to-emerald-50/50 border border-emerald-200 shadow-2xl p-2">
                <div className="rounded-2xl bg-white border border-emerald-100 p-6 space-y-5 shadow-sm">
                  
                  {/* Map Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-emerald-100">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
                      <span className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider">Live GIS Map Preview</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      LUMBINI · RUPANDEHI
                    </span>
                  </div>

                  {/* Stylized Map View */}
                  <div className="relative w-full aspect-[4/3] bg-emerald-950 rounded-xl border border-emerald-800 overflow-hidden group shadow-inner">
                    <div className="absolute inset-0 opacity-20" 
                         style={{ backgroundImage: 'radial-gradient(circle, #34d399 1px, transparent 1px)', backgroundSize: '24px 24px' }} 
                    />

                    {/* SVG Map Shape */}
                    <svg 
                      className="absolute inset-0 w-full h-full p-4 sm:p-6 text-emerald-800 group-hover:text-emerald-700 transition-colors duration-500" 
                      viewBox="0 0 800 400" 
                      fill="currentColor"
                      preserveAspectRatio="xMidYMid meet"
                    >
                      <path d="M50,180 L90,120 L160,100 L240,80 L320,60 L420,50 L520,70 L600,90 L680,120 L750,160 L760,200 L720,260 L650,300 L580,320 L500,330 L420,340 L340,330 L260,310 L180,280 L100,250 L40,220 Z" 
                            stroke="#10b981" strokeWidth="2" fill="#064e3b" />
                      <path d="M240,80 L260,310 M420,50 L420,340 M580,320 L600,90" 
                            stroke="#34d399" strokeWidth="1" strokeDasharray="4 4" fill="none" />
                    </svg>

                    {/* TILOTTAMA PIN */}
                    <div className="absolute top-[68%] left-[38%] z-20 group/cursor">
                      <span className="absolute -inset-4 rounded-full bg-emerald-400/30 animate-ping" />
                      <span className="absolute -inset-2 rounded-full bg-emerald-400/50 animate-pulse" />
                      <div className="relative w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white shadow-lg cursor-pointer" />

                      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-52 bg-white border border-emerald-200 rounded-xl p-3.5 shadow-2xl">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-600" />
                          <span className="text-xs font-bold text-slate-900 uppercase">Tilottama Municipality</span>
                        </div>
                        <div className="space-y-1.5 font-mono text-xs">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Match Score:</span>
                            <span className="text-emerald-700 font-bold">94/100</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Top Sector:</span>
                            <span className="text-slate-900 font-bold">Agro-Processing</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Est. ROI:</span>
                            <span className="text-emerald-700 font-bold">18.4%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-emerald-50/70 border border-emerald-100 p-3 rounded-xl">
                      <p className="text-[10px] text-emerald-800 font-mono font-bold uppercase mb-1">Infrastructure Score</p>
                      <div className="h-2 w-full bg-emerald-200 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-600 w-[88%]" />
                      </div>
                    </div>
                    <div className="bg-emerald-50/70 border border-emerald-100 p-3 rounded-xl">
                      <p className="text-[10px] text-emerald-800 font-mono font-bold uppercase mb-1">Market Connectivity</p>
                      <div className="h-2 w-full bg-emerald-200 rounded-full overflow-hidden">
                        <div className="h-full bg-teal-600 w-[92%]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── SERVICES SECTION ── */}
        <section id="services" className="space-y-12">
          <div className="max-w-2xl">
            <h2 className="text-3xl sm:text-4xl font-bold font-display text-slate-900 tracking-tight mb-3">Intelligence Suite</h2>
            <p className="text-slate-600 text-base leading-relaxed">
              Three integrated modules built for rapid due diligence, spatial analysis, and capital deployment across Nepal's 7 provinces.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { 
                icon: '🗺️', 
                title: 'Spatial GIS Explorer', 
                desc: 'Multi-layer choropleth maps covering agricultural yield, road connectivity, tourism density, and electrification indices across all local units.'
              },
              { 
                icon: '🤖', 
                title: 'Predictive AI Matching', 
                desc: 'Proprietary ML scoring engine analyzing municipal indicators to match venture cards with estimated return-on-investment targets.'
              },
              { 
                icon: '📊', 
                title: 'Institutional Reporting', 
                desc: 'Downloadable PDF profiles, raw dataset CSV exports, and side-by-side comparative tables for rapid municipal benchmarking.'
              }
            ].map((service, idx) => (
              <Card key={idx} padding="lg" className="bg-white border border-emerald-100 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all duration-300 group rounded-2xl">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100/80 text-emerald-800 flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
                  {service.icon}
                </div>
                <h3 className="text-xl font-bold font-display text-slate-900 mb-3">{service.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed font-normal">{service.desc}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* ── CONTACT SECTION ── */}
        <section id="contact" className="max-w-xl mx-auto space-y-8 pb-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold font-display text-slate-900">Request Platform Access</h2>
            <p className="text-slate-600 text-sm">Join entrepreneurs, researchers, and policymakers accessing Nepal's local unit intelligence engine.</p>
          </div>

          <Card padding="lg" className="bg-white border border-emerald-100 shadow-xl rounded-2xl">
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <Input
                label="Full Name"
                placeholder="Ram Bahadur"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
              />
              <Input
                label="Work Email"
                type="email"
                placeholder="ram@organization.np"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
              />
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 font-mono">Inquiry Details</label>
                <textarea
                  rows={4}
                  className="w-full px-3.5 py-2.5 bg-white border border-emerald-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25 focus:outline-none transition-all font-medium resize-none"
                  placeholder="Describe your use case or data requirements..."
                  value={contactMsg}
                  onChange={(e) => setContactMsg(e.target.value)}
                />
              </div>
              <Button 
                type="submit" 
                isLoading={isSending} 
                className="w-full h-11 text-base font-bold shadow-md shadow-emerald-600/20 mt-2"
              >
                Submit Access Request →
              </Button>
            </form>
          </Card>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer className="bg-white text-slate-600 text-xs py-10 px-6 border-t border-emerald-100 shadow-2xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-600 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <p className="font-medium text-slate-800">© {new Date().getFullYear()} Catalyst Spatial Intelligence. Kathmandu, Nepal.</p>
          </div>
          <div className="flex gap-8 font-mono font-bold uppercase tracking-wider text-slate-700">
            <Link to="/login" className="hover:text-emerald-700 transition-colors">Login</Link>
            <Link to="/register" className="hover:text-emerald-700 transition-colors">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
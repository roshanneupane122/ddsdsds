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
    <div className="min-h-screen bg-[#0A0C10] text-slate-300 font-body selection:bg-terraced-500/30 selection:text-terraced-200">
      {/* ── PREMIUM DARK NAVBAR ── */}
      <header className="sticky top-0 z-50 bg-[#0A0C10]/95 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-lg bg-terraced-600 flex items-center justify-center shadow-[0_0_15px_rgba(20,184,166,0.3)] group-hover:shadow-[0_0_20px_rgba(20,184,166,0.5)] transition-all duration-300">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <div>
            <span className="font-display font-bold text-white text-base tracking-tight leading-none block">
              Catalyst
            </span>
            <span className="block text-[10px] text-slate-500 font-mono uppercase tracking-widest mt-0.5">Nepal Opportunity Map</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-slate-400 uppercase tracking-wide">
          <a href="#home" className="hover:text-terraced-400 transition-colors">Home</a>
          <a href="#services" className="hover:text-terraced-400 transition-colors">Services</a>
          <a href="#architecture" className="hover:text-terraced-400 transition-colors">Architecture</a>
          <a href="#contact" className="hover:text-terraced-400 transition-colors">Contact</a>
          <div className="h-4 w-px bg-white/10 mx-2" />
          <Link to="/login" className="text-slate-300 hover:text-white transition-colors">Login</Link>
          <Link to="/register">
            <Button size="sm" className="bg-terraced-600 hover:bg-terraced-500 text-white border-0 font-semibold shadow-none h-8 px-4 text-xs">
              Get Access
            </Button>
          </Link>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-32 py-16">
        
        {/* ── HERO SECTION (FLAT DARK PREMIUM) ── */}
              {/* ── HERO SECTION (FLAT DARK PREMIUM) ── */}
        <section id="home" className="relative pt-8 pb-12 lg:pt-16 lg:pb-20">
          {/* Subtle grid background - NO GRADIENTS */}
          <div className="absolute inset-0 -z-10 opacity-[0.03]" 
               style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} 
          />
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-terraced-500/30 bg-terraced-500/5 text-[10px] font-mono text-terraced-400 uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-terraced-500 animate-pulse" />
                Spatial Intelligence v2.4 Live
              </div>

              <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tighter leading-[1.1] text-white">
                Economic clarity for <br />
                <span className="text-slate-500">Nepal's 753 municipalities.</span>
              </h1>

              <p className="text-slate-400 text-lg md:text-xl max-w-xl leading-relaxed font-light">
                Institutional-grade GIS data, AI-driven opportunity matching, and capital pipeline analytics. Built for investors, development funds, and policy makers.
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <Link to="/register">
                  <Button size="lg" className="bg-white text-[#0A0C10] hover:bg-slate-200 font-bold shadow-none border-0 h-12 px-8">
                    Start Analysis
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="lg" className="border-white/10 text-slate-300 hover:bg-white/5 hover:text-white hover:border-white/20 h-12 px-8 bg-transparent">
                    Platform Demo
                  </Button>
                </Link>
              </div>

              {/* Premium Stat Counters */}
              <div className="grid grid-cols-3 gap-8 pt-10 border-t border-white/5">
                <div>
                  <p className="text-4xl font-display font-bold text-white tabular-nums tracking-tight">{stats.municipalities}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1 font-medium">Local Units Mapped</p>
                </div>
                <div>
                  <p className="text-4xl font-display font-bold text-terraced-400 tabular-nums tracking-tight">{stats.opportunities}<span className="text-lg align-top ml-0.5">+</span></p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1 font-medium">AI Opportunities</p>
                </div>
                <div>
                  <p className="text-4xl font-display font-bold text-saffron-400 tabular-nums tracking-tight">${stats.investment}<span className="text-lg align-top ml-0.5">M</span></p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1 font-medium">Capital Pipeline</p>
                </div>
              </div>
            </div>

            {/* RESPONSIVE NEPAL MAP WITH TILOTTAMA POINTER */}
            <div className="lg:col-span-5 relative w-full">
              <div className="rounded-xl bg-[#12141A] border border-white/5 shadow-2xl p-1 overflow-hidden">
                <div className="rounded-lg bg-[#0F1115] border border-white/5 p-6 space-y-5">
                  
                  {/* Map Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-white/5">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-terraced-500 animate-pulse" />
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Live GIS Layer</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-600">PROV: LUMBINI | DIST: RUPANDEHI</span>
                  </div>

                  {/* Responsive Map Container */}
                  <div className="relative w-full aspect-[4/3] bg-[#0A0C10] rounded-lg border border-white/5 overflow-hidden group">
                    {/* Background Grid Dots */}
                    <div className="absolute inset-0 opacity-10" 
                         style={{ backgroundImage: 'radial-gradient(circle, #334155 1px, transparent 1px)', backgroundSize: '24px 24px' }} 
                    />

                    {/* Stylized Flat Nepal Map SVG */}
                    <svg 
                      className="absolute inset-0 w-full h-full p-4 sm:p-6 text-slate-800 group-hover:text-slate-700 transition-colors duration-500" 
                      viewBox="0 0 800 400" 
                      fill="currentColor"
                      preserveAspectRatio="xMidYMid meet"
                    >
                      {/* Simplified but recognizable Nepal outline */}
                      <path d="M50,180 L90,120 L160,100 L240,80 L320,60 L420,50 L520,70 L600,90 L680,120 L750,160 L760,200 L720,260 L650,300 L580,320 L500,330 L420,340 L340,330 L260,310 L180,280 L100,250 L40,220 Z" 
                            stroke="#1e293b" strokeWidth="2" />
                      
                      {/* Province Boundaries (Abstract) */}
                      <path d="M240,80 L260,310 M420,50 L420,340 M580,320 L600,90" 
                            stroke="#1e293b" strokeWidth="1" strokeDasharray="4 4" fill="none" />
                    </svg>

                    {/* TILOTTAMA POINTER & TOOLTIP */}
                    {/* Positioned approximately in Rupandehi/Lumbini area (South-Central) */}
                    <div className="absolute top-[68%] left-[38%] z-20 group/cursor">
                      {/* Pulsing Radar Effect */}
                      <span className="absolute -inset-4 rounded-full bg-terraced-500/20 animate-ping" />
                      <span className="absolute -inset-2 rounded-full bg-terraced-500/30 animate-pulse" />
                      
                      {/* Pin Dot */}
                      <div className="relative w-3 h-3 bg-terraced-500 rounded-full shadow-[0_0_12px_rgba(20,184,166,0.9)] cursor-pointer" />

                      {/* Floating Tooltip Card */}
                      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-48 bg-[#0A0C10]/95 backdrop-blur-md border border-terraced-500/30 rounded-lg p-3 shadow-xl opacity-100 sm:opacity-0 sm:group-hover/cursor:opacity-100 transition-opacity duration-300 pointer-events-none sm:pointer-events-auto">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-terraced-400" />
                          <span className="text-[10px] font-bold text-white uppercase tracking-wider">Tilottama Municipality</span>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[10px]">
                            <span className="text-slate-500">Opportunity Score</span>
                            <span className="text-terraced-400 font-mono font-bold">94/100</span>
                          </div>
                          <div className="flex justify-between text-[10px]">
                            <span className="text-slate-500">Primary Sector</span>
                            <span className="text-white font-mono">Agro-Processing</span>
                          </div>
                          <div className="flex justify-between text-[10px]">
                            <span className="text-slate-500">Est. ROI</span>
                            <span className="text-saffron-400 font-mono">18.4%</span>
                          </div>
                        </div>
                        {/* Tooltip Arrow */}
                        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#0A0C10]/95 border-r border-b border-terraced-500/30 rotate-45" />
                      </div>
                    </div>

                    {/* Secondary Data Points (Context) */}
                    <div className="absolute top-[35%] left-[55%] w-2 h-2 bg-saffron-500/60 rounded-full" title="Kathmandu Valley" />
                    <div className="absolute top-[55%] right-[20%] w-2 h-2 bg-mist-500/60 rounded-full" title="Biratnagar Corridor" />

                  </div>

                  {/* Bottom Metrics Bar */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/[0.02] border border-white/5 p-3 rounded-md">
                      <p className="text-[9px] text-slate-500 uppercase tracking-wider mb-1">Infrastructure Index</p>
                      <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-terraced-600 w-[88%]" />
                      </div>
                    </div>
                    <div className="bg-white/[0.02] border border-white/5 p-3 rounded-md">
                      <p className="text-[9px] text-slate-500 uppercase tracking-wider mb-1">Market Connectivity</p>
                      <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-saffron-600 w-[92%]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* ── TRUSTED DATA SOURCES (NEW SECTION) ── */}
        <section className="border-y border-white/5 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-[10px] font-mono text-slate-600 uppercase tracking-[0.2em] mb-8">
              Verified Data Integration Partners
            </p>
            <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6 opacity-40 grayscale">
              {['MOFAGA', 'CBS NEPAL', 'WORLDBANK', 'ADB', 'NRB'].map((partner) => (
                <span key={partner} className="text-lg font-display font-bold text-white tracking-tight">{partner}</span>
              ))}
            </div>
          </div>
        </section>

        {/* ── SERVICES SECTION (DARK CARD STYLE) ── */}
        <section id="services" className="space-y-16">
          <div className="max-w-2xl">
            <h2 className="text-3xl sm:text-4xl font-bold font-display text-white tracking-tight mb-4">Intelligence Suite</h2>
            <p className="text-slate-400 text-base leading-relaxed">
              Three core pillars designed to reduce due diligence time by 80% and increase investment confidence across provincial boundaries.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { 
                icon: '🗺️', 
                title: 'Spatial GIS Explorer', 
                desc: 'Multi-layer choropleth visualization covering agriculture, infrastructure, tourism density, and digital connectivity indices.',
                color: 'bg-terraced-500/10 text-terraced-400 border-terraced-500/20'
              },
              { 
                icon: '🤖', 
                title: 'Predictive AI Matching', 
                desc: 'Proprietary ML models analyzing 140+ variables to surface high-confidence opportunities with projected ROI and risk scores.',
                color: 'bg-mist-500/10 text-mist-400 border-mist-500/20'
              },
              { 
                icon: '📊', 
                title: 'Institutional Reporting', 
                desc: 'Automated generation of bank-grade PDF/CSV reports. Side-by-side municipal benchmarking for rapid comparative analysis.',
                color: 'bg-saffron-500/10 text-saffron-400 border-saffron-500/20'
              }
            ].map((service, idx) => (
              <Card key={idx} padding="lg" className="bg-[#12141A] border border-white/5 hover:border-white/10 transition-all duration-300 group">
                <div className={`w-12 h-12 rounded-lg border ${service.color} flex items-center justify-center text-xl mb-6 group-hover:scale-110 transition-transform`}>
                  {service.icon}
                </div>
                <h3 className="text-lg font-semibold font-display text-white mb-3">{service.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{service.desc}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* ── PLATFORM ARCHITECTURE (NEW TECHNICAL SECTION) ── */}
        <section id="architecture" className="rounded-2xl bg-[#12141A] border border-white/5 p-8 md:p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold font-display text-white">Built for Scale & Security</h2>
              <ul className="space-y-4">
                {[
                  'Real-time vector tile rendering via FastAPI backend',
                  'SOC2 compliant data handling & encryption at rest',
                  'Offline-first mobile field data collection sync',
                  'REST & GraphQL API access for enterprise integration'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-400">
                    <svg className="w-5 h-5 text-terraced-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/contact" className="inline-block text-sm text-terraced-400 hover:text-terraced-300 font-medium mt-2">
                Request Technical Documentation →
              </Link>
            </div>
            
            {/* Code/Terminal Visual */}
            <div className="bg-[#0A0C10] rounded-lg border border-white/5 p-4 font-mono text-xs text-slate-500 overflow-hidden">
              <div className="flex gap-1.5 mb-3">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
                <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
                <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
              </div>
              <div className="space-y-2">
                <p><span className="text-terraced-500">GET</span> /api/v2/municipalities?province=3&sector=agri</p>
                <p className="text-slate-600 pl-4">→ 200 OK (42ms)</p>
                <p className="text-slate-600 pl-4">→ Payload: 753 records, 12MB compressed</p>
                <p className="mt-4"><span className="text-saffron-500">POST</span> /api/v2/ai/recommendations</p>
                <p className="text-slate-600 pl-4">→ Processing: Risk Model v4.2...</p>
                <p className="text-slate-600 pl-4">→ Confidence: <span className="text-white">94.7%</span></p>
              </div>
            </div>
          </div>
        </section>

        {/* ── CONTACT SECTION (MINIMAL DARK FORM) ── */}
        <section id="contact" className="max-w-xl mx-auto space-y-10 pb-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold font-display text-white">Request Institutional Access</h2>
            <p className="text-slate-400 text-sm">Limited seats available for Q3 2026 cohort. Priority given to verified organizations.</p>
          </div>

          <Card padding="lg" className="bg-[#12141A] border border-white/5 shadow-2xl">
            <form onSubmit={handleContactSubmit} className="space-y-5">
              <Input
                label="Full Name"
                placeholder="Ram Bahadur"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="bg-[#0A0C10] border-white/10 text-white placeholder:text-slate-600 focus:border-terraced-500/50 focus:ring-1 focus:ring-terraced-500/50"
              />
              <Input
                label="Work Email"
                type="email"
                placeholder="ram@organization.np"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="bg-[#0A0C10] border-white/10 text-white placeholder:text-slate-600 focus:border-terraced-500/50 focus:ring-1 focus:ring-terraced-500/50"
              />
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Inquiry Details</label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-3 bg-[#0A0C10] border border-white/10 rounded-lg text-sm text-white placeholder:text-slate-600 focus:border-terraced-500/50 focus:ring-1 focus:ring-terraced-500/50 focus:outline-none transition-all resize-none"
                  placeholder="Describe your use case and data requirements..."
                  value={contactMsg}
                  onChange={(e) => setContactMsg(e.target.value)}
                />
              </div>
              <Button 
                type="submit" 
                isLoading={isSending} 
                className="w-full bg-terraced-600 hover:bg-terraced-500 text-white font-semibold border-0 h-11 mt-2"
              >
                Submit Request
              </Button>
            </form>
          </Card>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer className="bg-[#08090D] text-slate-600 text-xs py-12 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-slate-800 flex items-center justify-center">
              <svg className="w-3 h-3 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <p>© {new Date().getFullYear()} Catalyst Spatial Intelligence. Kathmandu, Nepal.</p>
          </div>
          <div className="flex gap-8 font-mono uppercase tracking-wider">
            <Link to="/login" className="hover:text-slate-400 transition-colors">Login</Link>
            <Link to="/register" className="hover:text-slate-400 transition-colors">Register</Link>
            <a href="#" className="hover:text-slate-400 transition-colors">Privacy</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button, Card, Input, toast } from '@/components/ui'

// --- ICONS (Inline SVGs for zero-dependency premium look) ---
const Icons = {
  Map: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>,
  Chart: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
  Cpu: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>,
  Check: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>,
  ChevronDown: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>,
  ArrowRight: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>,
  Globe: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Shield: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
}

export const SalesPage = () => {
  // ── STATE ──
  const [stats, setStats] = useState({ municipalities: 0, opportunities: 0, investment: 0 })
  const [contactName, setContactName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactMsg, setContactMsg] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [activeFaq, setActiveFaq] = useState<number | null>(null)

  // ── ANIMATED COUNTERS ──
  useEffect(() => {
    const duration = 2000
    const steps = 60
    const stepTime = duration / steps
    let currentStep = 0

    const timer = setInterval(() => {
      currentStep++
      const progress = currentStep / steps
      // Ease-out quart function for premium feel
      const ease = 1 - Math.pow(1 - progress, 4)
      
      setStats({
        municipalities: Math.floor(753 * ease),
        opportunities: Math.floor(1420 * ease),
        investment: Math.floor(85 * ease),
      })

      if (currentStep >= steps) clearInterval(timer)
    }, stepTime)

    return () => clearInterval(timer)
  }, [])

  // ── HANDLERS ──
  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!contactEmail || !contactMsg) {
      toast.error('Please fill in your email and message.')
      return
    }
    setIsSending(true)
    setTimeout(() => {
      setIsSending(false)
      toast.success('Request received. Our team will verify your credentials within 24h.')
      setContactName('')
      setContactEmail('')
      setContactMsg('')
    }, 1200)
  }

  const faqs = [
    { q: "Is the data real-time?", a: "Our GIS layers are updated quarterly from government open data sources, with satellite imagery refreshed monthly for key economic corridors." },
    { q: "Can I export raw datasets?", a: "Yes. Institutional and Enterprise plans include full CSV/GeoJSON export capabilities for all 753 local units and 14,000+ indicators." },
    { q: "How is the ROI calculated?", a: "Our AI model uses a weighted index of infrastructure density, market access, labor cost, and historical sector performance to project potential returns." },
  ]

  return (
    <div className="min-h-screen bg-[#F4FBF7] text-slate-800 font-body selection:bg-emerald-200 selection:text-emerald-900">
      
      {/* ── NAVBAR ── */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-emerald-100/60 px-6 py-4 transition-all duration-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-600/20 group-hover:shadow-emerald-600/40 transition-all duration-300">
              <Icons.Map />
            </div>
            <div>
              <span className="font-display font-bold text-slate-900 text-lg tracking-tight leading-none block group-hover:text-emerald-700 transition-colors">
                Catalyst
              </span>
              <span className="block text-[10px] text-emerald-600 font-mono font-bold uppercase tracking-[0.2em] mt-0.5">Nepal Intelligence</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-slate-600 uppercase tracking-wider font-mono">
            {['Features', 'Architecture', 'Data Sources', 'Pricing'].map((item) => (
              <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} className="hover:text-emerald-700 transition-colors relative group">
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-500 transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
            <div className="h-4 w-px bg-emerald-200 mx-2" />
            <Link to="/login" className="text-slate-800 hover:text-emerald-800 transition-colors">Login</Link>
            <Link to="/register">
              <Button size="sm" className="font-bold shadow-lg shadow-emerald-600/20 px-6 text-xs bg-emerald-700 hover:bg-emerald-800 border-0">
                Get Access →
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-32 py-16 md:py-24">
        
        {/* ── HERO SECTION ── */}
        <section id="home" className="relative">
          {/* Background Glow */}
          <div className="absolute -top-24 -right-24 w-[600px] h-[600px] bg-emerald-400/20 rounded-full blur-[120px] pointer-events-none" />
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center relative z-10">
            <div className="lg:col-span-7 space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-200 bg-white/60 backdrop-blur-sm text-xs font-mono font-bold text-emerald-800 uppercase tracking-wider shadow-sm animate-fade-in-up">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                </span>
                Spatial Engine v2.4 Live
              </div>

              <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05] text-slate-900">
                Economic clarity for <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600">
                  Nepal's 753 local units.
                </span>
              </h1>

              <p className="text-slate-600 text-xl max-w-2xl leading-relaxed font-medium">
                The first institutional-grade GIS intelligence platform built for Nepal. 
                Combine satellite data, municipal budgets, and market indicators to uncover 
                high-yield opportunities across all 7 provinces.
              </p>

              <div className="flex flex-wrap gap-4 pt-4">
                <Link to="/register">
                  <Button size="lg" className="h-14 px-10 text-base font-bold shadow-xl shadow-emerald-600/25 bg-emerald-700 hover:bg-emerald-800 border-0 transition-all hover:-translate-y-0.5">
                    Start Exploration →
                  </Button>
                </Link>
                <Link to="/demo">
                  <Button variant="outline" size="lg" className="h-14 px-10 text-base font-bold border-emerald-200 text-emerald-900 hover:bg-emerald-50 bg-white/50 backdrop-blur-sm">
                    View Sample Report
                  </Button>
                </Link>
              </div>

              {/* Stat Counters */}
              <div className="grid grid-cols-3 gap-8 pt-12 border-t border-emerald-100/80">
                {[
                  { label: 'Local Units Mapped', value: stats.municipalities, suffix: '', color: 'text-slate-900' },
                  { label: 'AI Opportunities', value: stats.opportunities, suffix: '+', color: 'text-emerald-700' },
                  { label: 'Capital Pipeline', value: `$${stats.investment}`, suffix: 'M', color: 'text-teal-700' },
                ].map((stat, i) => (
                  <div key={i}>
                    <p className={`text-4xl sm:text-5xl font-extrabold tracking-tight ${stat.color}`}>
                      {stat.value}<span className="text-xl align-top ml-0.5">{stat.suffix}</span>
                    </p>
                    <p className="text-[11px] text-emerald-800/80 font-bold uppercase tracking-widest mt-2">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* MAP CARD SHOWCASE */}
            <div className="lg:col-span-5 relative w-full perspective-1000">
              <div className="relative rounded-3xl bg-gradient-to-b from-white to-emerald-50/30 border border-white/60 shadow-2xl shadow-emerald-900/10 p-3 transform rotate-y-[-2deg] rotate-x-[2deg] hover:rotate-0 transition-transform duration-700 ease-out">
                <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden relative aspect-[4/3]">
                  
                  {/* Grid Overlay */}
                  <div className="absolute inset-0 opacity-20" 
                       style={{ backgroundImage: 'linear-gradient(#10b981 1px, transparent 1px), linear-gradient(90deg, #10b981 1px, transparent 1px)', backgroundSize: '40px 40px' }} 
                  />
                  
                  {/* Abstract Map Shape */}
                  <svg className="absolute inset-0 w-full h-full p-8 text-emerald-500/30" viewBox="0 0 800 600" fill="currentColor">
                    <path d="M100,300 Q250,100 400,250 T700,300 V500 H100 Z" fill="url(#grad1)" opacity="0.4" />
                    <defs>
                      <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: '#10b981', stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: '#0f766e', stopOpacity: 1 }} />
                      </linearGradient>
                    </defs>
                    {/* Connection Lines */}
                    <path d="M200,350 L350,280 L500,320 L650,250" stroke="#34d399" strokeWidth="2" fill="none" strokeDasharray="4 4" className="animate-pulse" />
                  </svg>

                  {/* Floating UI Elements */}
                  <div className="absolute top-6 left-6 right-6 flex justify-between items-start">
                    <div className="bg-slate-800/90 backdrop-blur border border-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase">Live Analysis</span>
                    </div>
                    <div className="bg-slate-800/90 backdrop-blur border border-slate-700 px-3 py-1.5 rounded-lg">
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Lumbini Prov.</span>
                    </div>
                  </div>

                  {/* Interactive Pin */}
                  <div className="absolute top-[45%] left-[45%] z-20 group cursor-pointer">
                    <span className="absolute -inset-6 rounded-full bg-emerald-400/20 animate-ping" />
                    <div className="relative w-4 h-4 bg-emerald-400 rounded-full border-2 border-white shadow-[0_0_20px_rgba(52,211,153,0.6)]" />
                    
                    {/* Tooltip */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-56 bg-white rounded-xl p-4 shadow-2xl border border-emerald-100 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 pointer-events-none">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-900 uppercase">Tilottama</span>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">94/100</span>
                      </div>
                      <div className="space-y-1.5">
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 w-[92%]" />
                        </div>
                        <div className="flex justify-between text-[10px] font-mono text-slate-500">
                          <span>Infra Score</span>
                          <span className="text-slate-900 font-bold">High</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Metrics Bar */}
                  <div className="absolute bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur border-t border-slate-800 p-4 grid grid-cols-3 gap-4">
                    {[
                      { l: 'Growth Rate', v: '+8.4%' },
                      { l: 'Market Access', v: '92/100' },
                      { l: 'Risk Index', v: 'Low' },
                    ].map((m, i) => (
                      <div key={i} className="text-center">
                        <p className="text-[9px] text-slate-500 font-mono uppercase mb-0.5">{m.l}</p>
                        <p className="text-sm font-bold text-emerald-400 font-mono">{m.v}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── TRUSTED BY / LOGOS ── */}
        <section className="border-y border-emerald-100/60 py-12 bg-white/40">
          <p className="text-center text-xs font-mono font-bold text-slate-400 uppercase tracking-widest mb-8">Trusted by forward-thinking organizations</p>
          <div className="flex flex-wrap justify-center gap-12 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            {['Ministry of Finance', 'ADB Nepal', 'World Bank', 'FNCCI', 'Invest Nepal'].map((logo) => (
              <span key={logo} className="text-lg font-display font-bold text-slate-800 flex items-center gap-2">
                <div className="w-6 h-6 bg-slate-200 rounded-full" /> {logo}
              </span>
            ))}
          </div>
        </section>

        {/* ── SERVICES / FEATURES ── */}
        <section id="features" className="space-y-16">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h2 className="text-3xl sm:text-4xl font-bold font-display text-slate-900 tracking-tight">
              Institutional Intelligence Suite
            </h2>
            <p className="text-slate-600 text-lg leading-relaxed">
              Three integrated modules designed for rapid due diligence, spatial analysis, and capital deployment across Nepal's diverse topography.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                icon: <Icons.Globe />,
                title: 'Spatial GIS Explorer', 
                desc: 'Multi-layer choropleth maps covering agricultural yield, road connectivity, tourism density, and electrification indices.',
                tags: ['Vector Tiles', 'Satellite Imagery', 'Zoning Data']
              },
              { 
                icon: <Icons.Cpu />,
                title: 'Predictive AI Matching', 
                desc: 'Proprietary ML scoring engine analyzing 14,000+ municipal indicators to match venture cards with ROI targets.',
                tags: ['Random Forest', 'ROI Projection', 'Risk Scoring']
              },
              { 
                icon: <Icons.Chart />,
                title: 'Capital Pipeline Analytics', 
                desc: 'Track government budget allocation, donor funding, and private FDI flows down to the ward level.',
                tags: ['Budget Tracking', 'FDI Flows', 'Grant Monitoring']
              }
            ].map((service, idx) => (
              <Card key={idx} padding="none" className="group bg-white border border-emerald-100 shadow-sm hover:shadow-xl hover:shadow-emerald-900/5 hover:border-emerald-300 transition-all duration-300 rounded-2xl overflow-hidden flex flex-col h-full">
                <div className="p-8 flex-1">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                    {service.icon}
                  </div>
                  <h3 className="text-xl font-bold font-display text-slate-900 mb-3">{service.title}</h3>
                  <p className="text-slate-600 leading-relaxed mb-6">{service.desc}</p>
                </div>
                <div className="px-8 pb-8 pt-4 border-t border-emerald-50 bg-slate-50/50">
                  <div className="flex flex-wrap gap-2">
                    {service.tags.map(tag => (
                      <span key={tag} className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100/50 px-2 py-1 rounded-md uppercase tracking-wide">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* ── ARCHITECTURE / HOW IT WORKS ── */}
        <section id="architecture" className="relative py-16 bg-slate-900 rounded-3xl overflow-hidden text-white">
          {/* Decorative BG */}
          <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(16,185,129,0.15) 1px, transparent 0)', backgroundSize: '32px 32px' }} />
          
          <div className="relative z-10 px-6 md:px-12 lg:px-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <div className="inline-block px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider">
                  Data Architecture
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold font-display tracking-tight">
                  From Raw Chaos to <br />
                  <span className="text-emerald-400">Actionable Signals</span>
                </h2>
                <p className="text-slate-400 text-lg leading-relaxed">
                  We ingest fragmented data from 753 municipalities, normalize it against national standards, and enrich it with proprietary satellite analysis.
                </p>
                
                <ul className="space-y-4 pt-4">
                  {[
                    'Automated ingestion of municipal budget PDFs',
                    'Satellite-derived crop yield estimation',
                    'Road network connectivity graph analysis',
                    'Real-time electricity consumption monitoring'
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-slate-300 font-medium">
                      <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <Icons.Check />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Visual Flow Diagram */}
              <div className="relative bg-slate-800/50 border border-slate-700 rounded-2xl p-8 backdrop-blur-sm">
                <div className="space-y-6">
                  {[
                    { label: 'Raw Data Sources', sub: 'Govt APIs, Satellite, Surveys', color: 'bg-blue-500' },
                    { label: 'Normalization Engine', sub: 'Cleaning, Geocoding, Tagging', color: 'bg-purple-500' },
                    { label: 'AI Analysis Layer', sub: 'Scoring, Matching, Forecasting', color: 'bg-emerald-500' },
                    { label: 'Catalyst Platform', sub: 'Interactive Maps, Reports, Alerts', color: 'bg-white' },
                  ].map((step, i) => (
                    <div key={i} className="relative flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${step.color} ring-4 ring-slate-800 z-10`} />
                      {i < 3 && <div className="absolute left-1.5 top-3 bottom-[-24px] w-px bg-slate-700" />}
                      <div className="flex-1 bg-slate-800 border border-slate-700 rounded-lg p-3 hover:border-emerald-500/50 transition-colors">
                        <p className="text-sm font-bold text-white">{step.label}</p>
                        <p className="text-xs text-slate-400 font-mono">{step.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ SECTION ── */}
        <section className="max-w-3xl mx-auto space-y-8">
          <h2 className="text-2xl font-bold font-display text-slate-900 text-center">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-emerald-100 bg-white rounded-xl overflow-hidden">
                <button 
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-emerald-50/50 transition-colors"
                >
                  <span className="font-bold text-slate-900">{faq.q}</span>
                  <div className={`transform transition-transform duration-300 text-emerald-600 ${activeFaq === i ? 'rotate-180' : ''}`}>
                    <Icons.ChevronDown />
                  </div>
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${activeFaq === i ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <p className="px-6 pb-4 text-slate-600 text-sm leading-relaxed">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CONTACT SECTION ── */}
        <section id="contact" className="relative max-w-4xl mx-auto">
          <div className="absolute inset-0 bg-emerald-600/5 rounded-3xl transform scale-105 -z-10" />
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-12 bg-white border border-emerald-100 shadow-2xl shadow-emerald-900/5 rounded-3xl overflow-hidden">
            
            {/* Info Side */}
            <div className="md:col-span-2 bg-emerald-900 p-10 text-white flex flex-col justify-between relative overflow-hidden">
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
              
              <div className="relative z-10">
                <h3 className="text-2xl font-bold font-display mb-4">Get Early Access</h3>
                <p className="text-emerald-200 text-sm leading-relaxed mb-8">
                  Join the closed beta. We are currently onboarding institutional partners and verified researchers.
                </p>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 text-emerald-400"><Icons.Shield /></div>
                    <div>
                      <p className="font-bold text-sm">Enterprise Security</p>
                      <p className="text-xs text-emerald-300">SOC2 compliant data handling</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 text-emerald-400"><Icons.Map /></div>
                    <div>
                      <p className="font-bold text-sm">Full Coverage</p>
                      <p className="text-xs text-emerald-300">All 77 districts included</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative z-10 mt-12">
                <p className="text-xs text-emerald-400 font-mono uppercase tracking-widest mb-2">Support</p>
                <p className="text-sm font-medium">hello@catalyst.np</p>
              </div>
            </div>

            {/* Form Side */}
            <div className="md:col-span-3 p-10">
              <form onSubmit={handleContactSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Input
                    label="Full Name"
                    placeholder="Ram Bahadur"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="bg-slate-50 border-slate-200 focus:bg-white"
                  />
                  <Input
                    label="Organization"
                    placeholder="Company / Institution"
                    className="bg-slate-50 border-slate-200 focus:bg-white"
                  />
                </div>
                <Input
                  label="Work Email"
                  type="email"
                  placeholder="ram@organization.np"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="bg-slate-50 border-slate-200 focus:bg-white"
                />
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 font-mono">Use Case</label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all font-medium resize-none"
                    placeholder="Describe your data requirements or investment focus..."
                    value={contactMsg}
                    onChange={(e) => setContactMsg(e.target.value)}
                  />
                </div>
                <Button 
                  type="submit" 
                  isLoading={isSending} 
                  className="w-full h-12 text-base font-bold shadow-lg shadow-emerald-600/20 bg-emerald-700 hover:bg-emerald-800 border-0 mt-2"
                >
                  Request Platform Access →
                </Button>
                <p className="text-[10px] text-slate-400 text-center mt-4">
                  By submitting, you agree to our Privacy Policy. No spam, ever.
                </p>
              </form>
            </div>
          </div>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer className="bg-white border-t border-emerald-100 pt-16 pb-10 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center text-white">
                  <Icons.Map />
                </div>
                <span className="font-display font-bold text-slate-900 text-lg">Catalyst</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">
                Kathmandu, Nepal<br/>
                Building the digital infrastructure for economic prosperity.
              </p>
            </div>
            
            {[
              { head: 'Platform', links: ['GIS Explorer', 'AI Matching', 'Data API', 'Pricing'] },
              { head: 'Resources', links: ['Documentation', 'Case Studies', 'Blog', 'Open Data'] },
              { head: 'Legal', links: ['Privacy Policy', 'Terms of Service', 'Security', 'Compliance'] },
            ].map((col, i) => (
              <div key={i}>
                <h4 className="font-bold text-slate-900 text-sm mb-4">{col.head}</h4>
                <ul className="space-y-2">
                  {col.links.map(link => (
                    <li key={link}>
                      <a href="#" className="text-sm text-slate-500 hover:text-emerald-700 transition-colors">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-400 font-mono">© {new Date().getFullYear()} Catalyst Spatial Intelligence Pvt. Ltd.</p>
            <div className="flex gap-6">
              {['Twitter', 'LinkedIn', 'GitHub'].map(social => (
                <a key={social} href="#" className="text-xs font-bold text-slate-400 hover:text-emerald-700 uppercase tracking-wider transition-colors">
                  {social}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
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
    <div className="min-h-screen bg-cloud text-peak-700 font-body">
      {/* ── SALES PAGE NAVBAR ── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-peak-100 px-6 py-4 flex items-center justify-between shadow-xs">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-himalaya flex items-center justify-center shadow-sm">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <div>
            <span className="font-display font-bold text-peak-800 text-base leading-none">
              Catalyst
            </span>
            <span className="block text-2xs text-peak-400 font-medium">Nepal Opportunity Map</span>
          </div>
        </Link>

        {/* Nav Links: Home, Services, Contact, Login, Register */}
        <nav className="flex items-center gap-6 text-sm font-medium text-peak-600">
          <a href="#home" className="hover:text-terraced-600 transition-colors">Home</a>
          <a href="#services" className="hover:text-terraced-600 transition-colors">Services</a>
          <a href="#contact" className="hover:text-terraced-600 transition-colors">Contact</a>
          <Link to="/login">
            <Button variant="outline" size="sm" className="font-semibold border-peak-200">
              Login
            </Button>
          </Link>
          <Link to="/register">
            <Button size="sm" className="bg-terraced-500 hover:bg-terraced-600 text-white font-semibold shadow-sm">
              Register
            </Button>
          </Link>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24 py-12">
        {/* ── HOME / HERO SECTION ── */}
        <section id="home" className="relative overflow-hidden rounded-3xl bg-gradient-hero text-white p-8 md:p-14 lg:p-16 shadow-2xl border border-peak-700">
          <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#52B788_1px,transparent_1px)] [background-size:24px_24px]" />
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-medium text-terraced-300">
                <span className="w-2 h-2 rounded-full bg-terraced-400 animate-pulse" />
                AI-Powered Spatial GIS Intelligence
              </div>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight text-white">
                Empowering Nepal with <span className="bg-gradient-to-r from-terraced-300 via-mist-200 to-saffron-300 bg-clip-text text-transparent">Data-Driven Economic Intelligence</span>
              </h1>

              <p className="text-peak-100 text-lg md:text-xl font-normal max-w-2xl leading-relaxed">
                Discover high-potential business ventures across all 753 local units in Nepal. Access interactive choropleth layers, AI recommendations, and provincial benchmarks.
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <Link to="/login">
                  <Button size="lg" className="bg-terraced-500 hover:bg-terraced-600 text-white font-semibold shadow-lg shadow-terraced-500/20">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 hover:border-white">
                    Create Account
                  </Button>
                </Link>
              </div>

              {/* Stat Counters */}
              <div className="grid grid-cols-3 gap-4 pt-8 border-t border-white/15">
                <div>
                  <p className="text-3xl font-bold font-display text-terraced-300">{stats.municipalities}</p>
                  <p className="text-xs text-peak-200 uppercase tracking-wider font-medium">Municipalities Covered</p>
                </div>
                <div>
                  <p className="text-3xl font-bold font-display text-mist-200">{stats.opportunities}+</p>
                  <p className="text-xs text-peak-200 uppercase tracking-wider font-medium">AI Recommendations</p>
                </div>
                <div>
                  <p className="text-3xl font-bold font-display text-saffron-300">${stats.investment}M+</p>
                  <p className="text-xs text-peak-200 uppercase tracking-wider font-medium">Capital Pipeline</p>
                </div>
              </div>
            </div>

            {/* Map Visual Hero Card */}
            <div className="lg:col-span-5 relative">
              <div className="rounded-2xl bg-peak-900/90 border border-white/20 shadow-2xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-terraced-300 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-terraced-400" />
                    GIS Intelligence Engine
                  </span>
                  <span className="px-2 py-0.5 rounded bg-terraced-500/30 text-terraced-200 text-xs font-mono">v1.0 FastAPI</span>
                </div>

                <div className="h-48 rounded-xl bg-gradient-to-br from-ridge-900 via-peak-900 to-peak-800 relative flex items-center justify-center overflow-hidden border border-white/10">
                  <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#8ECAE6_1px,transparent_1px)] [background-size:16px_16px]" />
                  <svg className="w-44 h-44 text-terraced-400/30 animate-pulse-slow" viewBox="0 0 100 100" fill="currentColor">
                    <polygon points="20,10 80,15 90,60 60,95 15,80 10,40" />
                  </svg>
                  <div className="absolute z-10 text-center space-y-1">
                    <span className="px-3 py-1 bg-terraced-500/90 text-white font-semibold text-xs rounded-full shadow-lg">
                      753 Municipalities Mapped
                    </span>
                    <p className="text-2xs text-peak-200">Real-Time Spatial Data Processing</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white/5 p-2.5 rounded-lg border border-white/10">
                    <p className="text-peak-300 text-2xs uppercase">Agriculture Output</p>
                    <p className="text-white font-bold text-sm">High Yield</p>
                  </div>
                  <div className="bg-white/5 p-2.5 rounded-lg border border-white/10">
                    <p className="text-peak-300 text-2xs uppercase">Tourism Potential</p>
                    <p className="text-white font-bold text-sm">Eco-Cluster Active</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── SERVICES SECTION ── */}
        <section id="services" className="space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl font-bold font-display text-peak-800">Our Services & Platform Features</h2>
            <p className="text-peak-500 text-base">Comprehensive economic development toolset built for entrepreneurs, funds, and municipal leaders.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card padding="lg" className="bg-white border border-peak-100 shadow-md hover:shadow-lg transition-shadow space-y-4">
              <div className="w-12 h-12 rounded-xl bg-terraced-100 text-terraced-700 flex items-center justify-center text-xl font-bold">
                🗺️
              </div>
              <h3 className="text-xl font-semibold font-display text-peak-700">Spatial GIS Explorer</h3>
              <p className="text-sm text-peak-500 leading-relaxed">
                Interactive choropleth map layers displaying agricultural yield, infrastructure index, tourism density, and digital connectivity across all 7 provinces.
              </p>
            </Card>

            <Card padding="lg" className="bg-white border border-peak-100 shadow-md hover:shadow-lg transition-shadow space-y-4">
              <div className="w-12 h-12 rounded-xl bg-mist-100 text-mist-700 flex items-center justify-center text-xl font-bold">
                🤖
              </div>
              <h3 className="text-xl font-semibold font-display text-peak-700">AI Recommendations</h3>
              <p className="text-sm text-peak-500 leading-relaxed">
                Machine-learning driven opportunity matching engine providing confidence scores, ROI projections, risk assessment, and required capital pipelines.
              </p>
            </Card>

            <Card padding="lg" className="bg-white border border-peak-100 shadow-md hover:shadow-lg transition-shadow space-y-4">
              <div className="w-12 h-12 rounded-xl bg-saffron-100 text-saffron-700 flex items-center justify-center text-xl font-bold">
                📊
              </div>
              <h3 className="text-xl font-semibold font-display text-peak-700">Comparative Analytics & PDF Reports</h3>
              <p className="text-sm text-peak-500 leading-relaxed">
                Side-by-side benchmarking of up to 4 municipalities and instant automated report generation in PDF, CSV, or JSON format.
              </p>
            </Card>
          </div>
        </section>

        {/* ── CONTACT SECTION ── */}
        <section id="contact" className="space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl font-bold font-display text-peak-800">Get in Touch</h2>
            <p className="text-peak-500 text-base">Have questions about Catalyst or need institutional spatial access? Send us a message.</p>
          </div>

          <Card padding="lg" className="max-w-2xl mx-auto bg-white border border-peak-100 shadow-xl">
            <form onSubmit={handleContactSubmit} className="space-y-5">
              <Input
                label="Your Name"
                placeholder="Ram Bahadur"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
              />
              <Input
                label="Email Address"
                type="email"
                placeholder="ram@organization.np"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
              />
              <div>
                <label className="block text-xs font-medium text-peak-600 mb-1">Message</label>
                <textarea
                  rows={4}
                  className="w-full px-3 py-2 bg-white border border-peak-200 rounded-lg text-xs text-peak-700 focus:ring-2 focus:ring-terraced-400 focus:outline-none"
                  placeholder="Tell us about your inquiry..."
                  value={contactMsg}
                  onChange={(e) => setContactMsg(e.target.value)}
                />
              </div>
              <Button type="submit" isLoading={isSending} className="w-full bg-terraced-500 hover:bg-terraced-600 text-white font-semibold">
                Send Message
              </Button>
            </form>
          </Card>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer className="bg-peak-800 text-peak-300 text-xs py-8 px-6 border-t border-peak-700">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Catalyst — Nepal Opportunity Map. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/login" className="hover:text-white transition-colors">Login</Link>
            <Link to="/register" className="hover:text-white transition-colors">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

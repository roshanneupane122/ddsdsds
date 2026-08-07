import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store'
import { Button, Card, Badge } from '@/components/ui'
import { useNavigate } from 'react-router-dom'
import { usersApi } from '@/services/users.api'

const StatCard = ({
  label,
  value,
  badge,
  badgeVariant = 'info',
  sub,
}: {
  label: string
  value: string
  badge: string
  badgeVariant?: 'info' | 'success' | 'warning' | 'muted'
  sub: string
}) => (
  <Card padding="md" className="bg-[#12141A] border border-white/5 shadow-none space-y-3 hover:border-white/10 transition-colors">
    <p className="text-[10px] font-mono font-semibold text-slate-500 uppercase tracking-widest">{label}</p>
    <div className="flex items-baseline justify-between gap-2">
      <span className="text-2xl font-bold font-display text-white tabular-nums tracking-tight">{value}</span>
      <Badge variant={badgeVariant} size="sm" className="shrink-0">
        {badge}
      </Badge>
    </div>
    <p className="text-xs text-slate-400">{sub}</p>
  </Card>
)

export const AdminDashboardPage = () => {
  const navigate = useNavigate()
  const { user, clearAuth } = useAuthStore()
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'system'>('overview')

  const { data: recentUsers = [] } = useQuery({
    queryKey: ['admin-dashboard', 'recent-users'],
    queryFn: () => usersApi.list({ limit: 5 }),
  })

  const handleLogout = () => {
    clearAuth()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-[#0A0C10] text-slate-300 space-y-8 pb-12">
      {/* ── ADMIN WELCOME BANNER (FLAT DARK) ── */}
      <section className="bg-[#12141A] rounded-xl p-6 md:p-8 border border-white/5 relative overflow-hidden">
        {/* Subtle dot pattern - NO GRADIENTS */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} 
        />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-[10px] font-mono font-medium border border-red-500/20 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              Admin Control Panel
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-white tracking-tight">
              Administrator, <span className="text-terraced-400">{user?.name || user?.email}</span>
            </h1>
            <p className="text-slate-400 text-sm max-w-xl leading-relaxed">
              Manage users, municipalities, and AI-generated opportunity data across Nepal's 753 local units.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link to="/admin/municipalities">
              <Button size="sm" className="bg-terraced-600 hover:bg-terraced-500 text-white font-semibold shadow-none border-0 h-9">
                Manage Municipalities
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-white/10 text-slate-300 hover:bg-white/5 hover:text-white hover:border-white/20 bg-transparent h-9"
            >
              Logout
            </Button>
          </div>
        </div>
      </section>

      {/* ── SYSTEM METRICS ── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Users"
          value="1,284"
          badge="↑ 12% this month"
          badgeVariant="success"
          sub="Registered accounts"
        />
        <StatCard
          label="Local Units"
          value="753"
          badge="100% Coverage"
          badgeVariant="info"
          sub="All 7 provinces mapped"
        />
        <StatCard
          label="AI Opportunities"
          value="1,420+"
          badge="Active Engine"
          badgeVariant="success"
          sub="Reviewed & published"
        />
        <StatCard
          label="Pending Reviews"
          value="23"
          badge="Needs Action"
          badgeVariant="warning"
          sub="Opportunities awaiting approval"
        />
      </section>

      {/* ── TABS ── */}
      <section className="space-y-6">
        <div className="flex gap-1 bg-[#12141A] p-1 rounded-lg border border-white/5 w-fit">
          {(['overview', 'users', 'system'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={[
                'px-4 py-1.5 rounded-md text-xs font-semibold transition-all font-mono uppercase tracking-wider',
                activeTab === tab
                  ? 'bg-[#0A0C10] text-white shadow-sm border border-white/10'
                  : 'text-slate-500 hover:text-slate-300',
              ].join(' ')}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { to: '/admin/users', icon: '👥', title: 'User Management', desc: 'View, search, and manage citizen accounts and roles.', color: 'bg-terraced-500/10 text-terraced-400 border-terraced-500/20' },
              { to: '/admin/municipalities', icon: '🗺️', title: 'Municipality Data', desc: 'Manage local unit indicators, scores, and GIS data.', color: 'bg-mist-500/10 text-mist-400 border-mist-500/20' },
              { to: '/admin/opportunities', icon: '⭐', title: 'Opportunity Moderation', desc: 'Review, approve, or reject AI-generated opportunities.', color: 'bg-saffron-500/10 text-saffron-400 border-saffron-500/20' },
              { to: '/admin/recommendations', icon: '🤖', title: 'Recommendation Review', desc: 'Create, edit, and remove AI recommendation records.', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
            ].map((item) => (
              <Link key={item.to} to={item.to}>
                <Card hover className="bg-[#12141A] border border-white/5 shadow-none flex flex-col space-y-4 h-full hover:border-white/10 transition-all group">
                  <div className="space-y-3">
                    <div className={`w-10 h-10 rounded-lg border ${item.color} flex items-center justify-center text-lg group-hover:scale-110 transition-transform`}>
                      {item.icon}
                    </div>
                    <h3 className="font-semibold text-white text-sm">{item.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                  </div>
                  <div className="pt-3 border-t border-white/5 mt-auto">
                    <span className="text-[10px] font-mono text-terraced-400 uppercase tracking-wider group-hover:text-terraced-300 transition-colors">
                      Manage →
                    </span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <Card padding="none" className="bg-[#12141A] border border-white/5 shadow-none overflow-hidden">
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <h3 className="font-semibold text-white text-sm font-display">Recent Users</h3>
              <Link to="/admin/users">
                <Button variant="outline" size="sm" className="text-xs border-white/10 text-slate-300 hover:bg-white/5 hover:text-white bg-transparent h-7">
                  View All
                </Button>
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-[#0A0C10] border-b border-white/5">
                  <tr>
                    <th className="text-left px-4 py-3 font-mono font-semibold text-slate-500 uppercase tracking-widest text-[10px]">Name</th>
                    <th className="text-left px-4 py-3 font-mono font-semibold text-slate-500 uppercase tracking-widest text-[10px]">Email</th>
                    <th className="text-left px-4 py-3 font-mono font-semibold text-slate-500 uppercase tracking-widest text-[10px]">Role</th>
                    <th className="text-left px-4 py-3 font-mono font-semibold text-slate-500 uppercase tracking-widest text-[10px]">Joined</th>
                    <th className="text-left px-4 py-3 font-mono font-semibold text-slate-500 uppercase tracking-widest text-[10px]">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {recentUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3 font-medium text-white">{u.name}</td>
                      <td className="px-4 py-3 text-slate-400 font-mono">{u.email}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${
                            u.role === 'ADMIN'
                              ? 'bg-red-500/10 text-red-400 border-red-500/20'
                              : 'bg-terraced-500/10 text-terraced-400 border-terraced-500/20'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 font-mono">{u.createdAt.slice(0, 10)}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-green-500/10 text-green-400 border border-green-500/20">
                          <span className="w-1 h-1 rounded-full bg-green-400" />
                          Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* System Tab */}
        {activeTab === 'system' && (
          <Card padding="lg" className="bg-[#12141A] border border-white/5 shadow-none space-y-6">
            <h3 className="text-sm font-bold text-white font-display">System Status & Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              {[
                { label: 'FastAPI Backend', value: 'Connected to http://127.0.0.1:8000', valueColor: 'text-terraced-400' },
                { label: 'JWT Authentication', value: 'Auto-attached via request interceptor', valueColor: 'text-terraced-400' },
                { label: 'Session Persistence', value: 'LocalStorage + Expiry Validation', valueColor: 'text-terraced-400' },
                { label: 'Auth Role', value: 'ADMIN', valueColor: 'text-red-400 font-bold' },
                { label: 'Admin Identity', value: user?.name || user?.email || 'Signed in admin', valueColor: 'text-slate-400 break-all' },
                { label: 'Email', value: user?.email, valueColor: 'text-slate-400' },
              ].map((item, i) => (
                <div key={i} className="p-4 bg-[#0A0C10] rounded-lg border border-white/5 space-y-1.5">
                  <span className="font-mono font-semibold text-slate-500 uppercase tracking-wider text-[10px] block">{item.label}</span>
                  <span className={`font-mono text-xs ${item.valueColor}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </section>
    </div>
  )
}
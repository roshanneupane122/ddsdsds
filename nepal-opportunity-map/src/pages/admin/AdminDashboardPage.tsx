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
  <Card padding="md" className="bg-white border border-emerald-100/90 shadow-sm space-y-3 hover:border-emerald-300 transition-all">
    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">{label}</p>
    <div className="flex items-baseline justify-between gap-2">
      <span className="text-2xl font-extrabold text-slate-900 tracking-tight">{value}</span>
      <Badge variant={badgeVariant} size="sm" className="shrink-0">
        {badge}
      </Badge>
    </div>
    <p className="text-xs text-slate-600 font-medium">{sub}</p>
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
    <div className="space-y-8 pb-12">
      {/* ── ADMIN WELCOME BANNER ── */}
      <section className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-700 rounded-2xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#ecfdf5_1px,transparent_1px)] [background-size:20px_20px]" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-emerald-100 text-xs font-mono font-bold border border-white/20 uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
              Admin Control Panel
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-white tracking-tight">
              Administrator, <span className="text-emerald-200">{user?.name || user?.email}</span>
            </h1>
            <p className="text-emerald-50 text-sm max-w-xl leading-relaxed">
              Manage users, local unit boundaries, and AI business opportunity algorithms across all 753 municipalities in Nepal.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link to="/admin/municipalities">
              <Button size="sm" className="bg-white text-emerald-900 hover:bg-emerald-50 font-bold shadow-md h-9">
                Manage Municipalities
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-white/40 text-white hover:bg-white/10 hover:border-white bg-transparent h-9"
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
        <div className="flex gap-1 bg-emerald-100/60 p-1.5 rounded-2xl border border-emerald-200/80 w-fit">
          {(['overview', 'users', 'system'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={[
                'px-4 py-1.5 rounded-xl text-xs font-bold transition-all font-mono uppercase tracking-wider',
                activeTab === tab
                  ? 'bg-white text-emerald-900 shadow-sm border border-emerald-300'
                  : 'text-slate-600 hover:text-emerald-800',
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
              { to: '/admin/users', icon: '👥', title: 'User Management', desc: 'View, search, and manage user accounts and access roles.' },
              { to: '/admin/municipalities', icon: '🗺️', title: 'Municipality Data', desc: 'Search, audit, and modify local unit indicators and GeoJSON.' },
              { to: '/admin/opportunities', icon: '⭐', title: 'Opportunity Catalog', desc: 'Create, update, or remove investment opportunities.' },
              { to: '/admin/recommendations', icon: '🤖', title: 'AI Recommendations', desc: 'Manage algorithmic scoring models and recommendations.' },
            ].map((item) => (
              <Link key={item.to} to={item.to}>
                <Card hover className="bg-white border border-emerald-100 shadow-sm flex flex-col space-y-4 h-full group">
                  <div className="space-y-3">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                      {item.icon}
                    </div>
                    <h3 className="font-bold text-slate-900 text-base">{item.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                  </div>
                  <div className="pt-3 border-t border-emerald-100 mt-auto">
                    <span className="text-xs font-mono font-bold text-emerald-700 uppercase tracking-wider group-hover:text-emerald-800 transition-colors">
                      Open Console →
                    </span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <Card padding="none" className="bg-white border border-emerald-100 shadow-sm overflow-hidden rounded-2xl">
            <div className="p-4 md:p-5 border-b border-emerald-100 flex items-center justify-between bg-emerald-50/40">
              <h3 className="font-bold text-slate-900 text-sm font-display">Recent Users</h3>
              <Link to="/admin/users">
                <Button variant="outline" size="sm" className="text-xs h-8">
                  View All Users
                </Button>
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-emerald-50/70 border-b border-emerald-100">
                  <tr>
                    <th className="text-left px-4 py-3 font-mono font-semibold text-emerald-900 uppercase tracking-wider text-[10px]">Name</th>
                    <th className="text-left px-4 py-3 font-mono font-semibold text-emerald-900 uppercase tracking-wider text-[10px]">Email</th>
                    <th className="text-left px-4 py-3 font-mono font-semibold text-emerald-900 uppercase tracking-wider text-[10px]">Role</th>
                    <th className="text-left px-4 py-3 font-mono font-semibold text-emerald-900 uppercase tracking-wider text-[10px]">Joined</th>
                    <th className="text-left px-4 py-3 font-mono font-semibold text-emerald-900 uppercase tracking-wider text-[10px]">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-emerald-50/40 transition-colors">
                      <td className="px-4 py-3.5 font-bold text-slate-900">{u.name}</td>
                      <td className="px-4 py-3.5 text-slate-600 font-mono font-medium">{u.email}</td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border ${
                            u.role === 'ADMIN'
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 font-mono">{u.createdAt.slice(0, 10)}</td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
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
          <Card padding="lg" className="bg-white border border-emerald-100 shadow-sm space-y-6 rounded-2xl">
            <h3 className="text-base font-bold text-slate-900 font-display">System Status & Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {[
                { label: 'FastAPI Backend Engine', value: 'Active API: http://127.0.0.1:8000', valueColor: 'text-emerald-700 font-bold' },
                { label: 'JWT Authorization Header', value: 'Auto-attached via Axios interceptor', valueColor: 'text-emerald-700 font-bold' },
                { label: 'Session Persistence', value: 'Local Storage token engine active', valueColor: 'text-emerald-700 font-bold' },
                { label: 'System Access Role', value: 'ADMINISTRATOR', valueColor: 'text-emerald-900 font-extrabold' },
                { label: 'Admin Identity', value: user?.name || user?.email || 'Signed in admin', valueColor: 'text-slate-700 font-mono font-semibold' },
                { label: 'System Email', value: user?.email || 'admin@nepal.gov.np', valueColor: 'text-slate-700 font-mono' },
              ].map((item, i) => (
                <div key={i} className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100 space-y-1.5">
                  <span className="font-mono font-bold text-slate-500 uppercase tracking-wider text-[10px] block">{item.label}</span>
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
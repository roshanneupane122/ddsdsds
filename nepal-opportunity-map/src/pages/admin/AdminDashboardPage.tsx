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
  <Card padding="md" className="bg-white border border-peak-100 shadow-xs space-y-2">
    <p className="text-2xs font-semibold text-peak-400 uppercase tracking-wider">{label}</p>
    <div className="flex items-baseline justify-between">
      <span className="text-2xl font-bold font-display text-peak-800">{value}</span>
      <Badge variant={badgeVariant} size="sm">
        {badge}
      </Badge>
    </div>
    <p className="text-xs text-peak-500">{sub}</p>
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
      <section className="bg-gradient-to-r from-peak-800 to-peak-900 rounded-2xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 text-red-200 text-xs font-medium border border-red-400/30">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
              Admin Control Panel
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display">
              Administrator, <span className="text-terraced-300">{user?.name || user?.email}</span>
            </h1>
            <p className="text-peak-300 text-sm max-w-xl">
              Manage users, municipalities, and AI-generated opportunity data across Nepal's 753 local units.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/admin/municipalities">
              <Button size="sm" className="bg-terraced-500 hover:bg-terraced-600 text-white font-semibold shadow-md">
                Manage Municipalities
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

      {/* ── SYSTEM METRICS ── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
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
      <section className="space-y-5">
        <div className="flex gap-1 bg-peak-50 p-1 rounded-xl border border-peak-100 w-fit">
          {(['overview', 'users', 'system'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={[
                'px-4 py-1.5 rounded-lg text-xs font-semibold transition-all',
                activeTab === tab
                  ? 'bg-white text-peak-800 shadow-sm border border-peak-100'
                  : 'text-peak-400 hover:text-peak-700',
              ].join(' ')}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link to="/admin/users">
              <Card hover className="bg-white border border-peak-100 shadow-sm flex flex-col space-y-4 h-full">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-lg bg-terraced-100 text-terraced-700 flex items-center justify-center text-lg">
                    👥
                  </div>
                  <h3 className="font-semibold text-peak-800">User Management</h3>
                  <p className="text-xs text-peak-500">View, search, and manage citizen accounts and roles.</p>
                </div>
                <div className="pt-2 border-t border-peak-100 mt-auto">
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    Manage Users →
                  </Button>
                </div>
              </Card>
            </Link>

            <Link to="/admin/municipalities">
              <Card hover className="bg-white border border-peak-100 shadow-sm flex flex-col space-y-4 h-full">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-lg bg-mist-100 text-mist-700 flex items-center justify-center text-lg">
                    🗺️
                  </div>
                  <h3 className="font-semibold text-peak-800">Municipality Data</h3>
                  <p className="text-xs text-peak-500">Manage local unit indicators, scores, and GIS data.</p>
                </div>
                <div className="pt-2 border-t border-peak-100 mt-auto">
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    Manage Municipalities →
                  </Button>
                </div>
              </Card>
            </Link>

            <Link to="/admin/opportunities">
              <Card hover className="bg-white border border-peak-100 shadow-sm flex flex-col space-y-4 h-full">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-lg bg-saffron-100 text-saffron-700 flex items-center justify-center text-lg">
                    ⭐
                  </div>
                  <h3 className="font-semibold text-peak-800">Opportunity Moderation</h3>
                  <p className="text-xs text-peak-500">Review, approve, or reject AI-generated opportunities.</p>
                </div>
                <div className="pt-2 border-t border-peak-100 mt-auto">
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    Moderate Opportunities →
                  </Button>
                </div>
              </Card>
            </Link>

            <Link to="/admin/recommendations">
              <Card hover className="bg-white border border-peak-100 shadow-sm flex flex-col space-y-4 h-full">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-lg bg-ridge-100 text-ridge-700 flex items-center justify-center text-lg">
                    🤖
                  </div>
                  <h3 className="font-semibold text-peak-800">Recommendation Review</h3>
                  <p className="text-xs text-peak-500">Create, edit, and remove AI recommendation records.</p>
                </div>
                <div className="pt-2 border-t border-peak-100 mt-auto">
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    Manage Recommendations →
                  </Button>
                </div>
              </Card>
            </Link>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <Card padding="none" className="bg-white border border-peak-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-peak-100 flex items-center justify-between">
              <h3 className="font-semibold text-peak-800 text-sm">Recent Users</h3>
              <Link to="/admin/users">
                <Button variant="outline" size="sm" className="text-xs">
                  View All
                </Button>
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-peak-50 border-b border-peak-100">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-peak-500 uppercase tracking-wider">Name</th>
                    <th className="text-left px-4 py-3 font-semibold text-peak-500 uppercase tracking-wider">Email</th>
                    <th className="text-left px-4 py-3 font-semibold text-peak-500 uppercase tracking-wider">Role</th>
                    <th className="text-left px-4 py-3 font-semibold text-peak-500 uppercase tracking-wider">Joined</th>
                    <th className="text-left px-4 py-3 font-semibold text-peak-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-peak-50">
                  {recentUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-peak-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-peak-800">{u.name}</td>
                      <td className="px-4 py-3 text-peak-500 font-mono">{u.email}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-2xs font-semibold ${
                            u.role === 'ADMIN'
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : 'bg-terraced-50 text-terraced-700 border border-terraced-200'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-peak-400">{u.createdAt.slice(0, 10)}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-2xs font-semibold ${
                            'bg-green-50 text-green-700 border border-green-200'
                          }`}
                        >
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
          <Card padding="lg" className="bg-white border border-peak-100 shadow-sm space-y-5">
            <h3 className="text-sm font-bold text-peak-800">System Status &amp; Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-peak-600">
              <div className="p-3 bg-peak-50 rounded-lg border border-peak-100 space-y-1">
                <span className="font-semibold text-peak-800 block">FastAPI Backend</span>
                <span className="text-terraced-600 font-mono">Connected to http://127.0.0.1:8000</span>
              </div>
              <div className="p-3 bg-peak-50 rounded-lg border border-peak-100 space-y-1">
                <span className="font-semibold text-peak-800 block">JWT Authentication</span>
                <span className="text-terraced-600 font-mono">Auto-attached via request interceptor</span>
              </div>
              <div className="p-3 bg-peak-50 rounded-lg border border-peak-100 space-y-1">
                <span className="font-semibold text-peak-800 block">Session Persistence</span>
                <span className="text-terraced-600 font-mono">LocalStorage + Expiry Validation</span>
              </div>
              <div className="p-3 bg-peak-50 rounded-lg border border-peak-100 space-y-1">
                <span className="font-semibold text-peak-800 block">Auth Role</span>
                <span className="text-red-600 font-mono font-bold">ADMIN</span>
              </div>
              <div className="p-3 bg-peak-50 rounded-lg border border-peak-100 space-y-1">
                <span className="font-semibold text-peak-800 block">Admin Identity</span>
                <span className="text-peak-500 font-mono break-all">{user?.name || user?.email || 'Signed in admin'}</span>
              </div>
              <div className="p-3 bg-peak-50 rounded-lg border border-peak-100 space-y-1">
                <span className="font-semibold text-peak-800 block">Email</span>
                <span className="text-peak-500 font-mono">{user?.email}</span>
              </div>
            </div>
          </Card>
        )}
      </section>
    </div>
  )
}

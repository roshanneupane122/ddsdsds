import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useUIStore, useAuthStore } from '@/store'
import { Button } from '@/components/ui'

interface NavItem {
  to: string
  label: string
  icon: React.ReactNode
}

const HomeIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
)

const MapIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
  </svg>
)

const StarIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
)

const CompareIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
  </svg>
)

const ReportIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
)

const UsersIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const ShieldIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
)

const citizenNavItems: NavItem[] = [
  { to: '/citizen/dashboard', label: 'Dashboard', icon: <HomeIcon /> },
  { to: '/citizen/map', label: 'Map Explorer', icon: <MapIcon /> },
  { to: '/citizen/recommendations', label: 'Opportunities', icon: <StarIcon /> },
  { to: '/citizen/compare', label: 'Compare', icon: <CompareIcon /> },
  { to: '/citizen/reports', label: 'Reports', icon: <ReportIcon /> },
]

const adminNavItems: NavItem[] = [
  { to: '/admin/dashboard', label: 'Admin Dashboard', icon: <HomeIcon /> },
  { to: '/admin/users', label: 'User Management', icon: <UsersIcon /> },
  { to: '/admin/municipalities', label: 'Municipalities', icon: <MapIcon /> },
  { to: '/admin/opportunities', label: 'Opportunities', icon: <ShieldIcon /> },
]

export const Sidebar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { isSidebarOpen } = useUIStore()
  const { user, isAuthenticated, clearAuth } = useAuthStore()

  const isAdmin = user?.role === 'ADMIN'
  const navItems = isAdmin ? adminNavItems : citizenNavItems

  const handleLogout = () => {
    clearAuth()
    navigate('/')
  }

  return (
    <aside
      className={[
        'flex flex-col border-r transition-all duration-300 ease-in-out',
        'fixed left-0 top-16 bottom-0 z-30 overflow-hidden',
        isAdmin ? 'bg-peak-900 border-peak-700' : 'bg-white border-peak-100',
        isSidebarOpen ? 'w-60' : 'w-0 lg:w-16',
      ].join(' ')}
      aria-label="Main navigation"
    >
      <div className="flex-1 overflow-y-auto py-4 px-3">
        {/* Section label when expanded */}
        {isSidebarOpen && (
          <div className="mb-6 px-2">
            {isAdmin ? (
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse flex-shrink-0" />
                <p className="text-2xs uppercase tracking-widest font-semibold text-peak-400">
                  Admin Panel
                </p>
              </div>
            ) : (
              <p className="text-2xs uppercase tracking-widest font-semibold text-peak-400">Navigation</p>
            )}
          </div>
        )}

        {/* Nav items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.to || location.pathname.startsWith(item.to + '/')
            return (
              <Link
                key={item.to}
                to={item.to}
                className={[
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium',
                  isAdmin
                    ? isActive
                      ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                      : 'text-peak-400 hover:text-peak-200 hover:bg-peak-700/50'
                    : isActive
                      ? 'nav-link-active nav-link'
                      : 'nav-link',
                  !isSidebarOpen ? 'justify-center px-2' : '',
                ].join(' ')}
                title={!isSidebarOpen ? item.label : undefined}
                aria-current={isActive ? 'page' : undefined}
              >
                {item.icon}
                {isSidebarOpen && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* User section */}
      <div className={`p-3 border-t ${isAdmin ? 'border-peak-700' : 'border-peak-100'}`}>
        {isAuthenticated && user ? (
          <div className={`flex items-center gap-2.5 ${!isSidebarOpen ? 'justify-center' : ''}`}>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                isAdmin ? 'bg-red-500/20 text-red-300' : 'bg-terraced-100 text-terraced-700'
              }`}
            >
              <span className="text-xs font-semibold">
                {(user.name || user.email || 'U').charAt(0).toUpperCase()}
              </span>
            </div>
            {isSidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-medium truncate ${isAdmin ? 'text-peak-200' : 'text-peak-700'}`}>
                  {user.name || user.email}
                </p>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-2xs font-semibold px-1.5 py-0.5 rounded ${
                      isAdmin ? 'bg-red-500/20 text-red-300' : 'bg-terraced-100 text-terraced-600'
                    }`}
                  >
                    {user.role}
                  </span>
                  <button
                    onClick={handleLogout}
                    className={`text-2xs transition-colors ${
                      isAdmin ? 'text-peak-400 hover:text-red-400' : 'text-peak-400 hover:text-red-500'
                    }`}
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          isSidebarOpen && (
            <Link to="/login">
              <Button variant="outline" size="sm" className="w-full">
                Sign in
              </Button>
            </Link>
          )
        )}
      </div>
    </aside>
  )
}

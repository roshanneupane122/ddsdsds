import { Link, useNavigate } from 'react-router-dom'
import { useUIStore, useAuthStore } from '@/store'
import { Button } from '@/components/ui'
import { getRoleDashboard } from '@/routes/ProtectedRoute'

const MenuIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
)

const MoonIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
)

const SunIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
)

const LogoutIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
)

export const Header = () => {
  const navigate = useNavigate()
  const { toggleSidebar, isDarkMode, toggleDarkMode } = useUIStore()
  const { user, isAuthenticated, clearAuth } = useAuthStore()

  const isAdmin = user?.role === 'ADMIN'
  const dashboardLink = getRoleDashboard(user?.role)

  const handleLogout = () => {
    clearAuth()
    navigate('/')
  }

  return (
    <header
      className={[
        'fixed top-0 left-0 right-0 z-40 h-16 flex items-center px-4 gap-4 shadow-2xs',
        isAdmin
          ? 'bg-peak-900 border-b border-peak-700'
          : 'bg-white border-b border-peak-100',
      ].join(' ')}
    >
      {/* Sidebar toggle */}
      <button
        onClick={toggleSidebar}
        className={`p-2 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terraced-400 ${
          isAdmin
            ? 'text-peak-400 hover:text-peak-200 hover:bg-peak-700'
            : 'text-peak-500 hover:text-peak-700 hover:bg-peak-50'
        }`}
        aria-label="Toggle sidebar navigation"
        id="sidebar-toggle-btn"
      >
        <MenuIcon />
      </button>

      {/* Logo */}
      <Link
        to={dashboardLink}
        className="flex items-center gap-2.5 flex-shrink-0"
        aria-label="Catalyst Nepal Opportunity Map — Dashboard"
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-himalaya flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        </div>
        <div className="hidden sm:block">
          <span className={`font-display font-semibold text-sm leading-none ${isAdmin ? 'text-peak-100' : 'text-peak-700'}`}>
            Catalyst
          </span>
          <span className={`block text-2xs tracking-wide ${isAdmin ? 'text-peak-400' : 'text-peak-400'}`}>
            Nepal Opportunity Map
          </span>
        </div>
      </Link>

      {/* Admin banner badge */}
      {isAdmin && (
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/20 border border-red-500/30 text-red-300 text-2xs font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
          ADMIN
        </div>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Dark mode toggle */}
      <button
        onClick={toggleDarkMode}
        className={`p-2 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terraced-400 ${
          isAdmin
            ? 'text-peak-400 hover:text-peak-200 hover:bg-peak-700'
            : 'text-peak-500 hover:text-peak-700 hover:bg-peak-50'
        }`}
        aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        id="dark-mode-toggle-btn"
      >
        {isDarkMode ? <SunIcon /> : <MoonIcon />}
      </button>

      {/* User & Logout section */}
      {isAuthenticated && (
        <div className={`flex items-center gap-3 border-l pl-4 ${isAdmin ? 'border-peak-700' : 'border-peak-100'}`}>
          <div className="hidden sm:block text-right">
            <span className={`block text-xs font-semibold leading-none ${isAdmin ? 'text-peak-100' : 'text-peak-700'}`}>
              {user?.name || user?.email}
            </span>
            <span
              className={`text-2xs font-semibold px-1.5 py-0.5 rounded ${
                isAdmin
                  ? 'text-red-300 bg-red-500/10'
                  : 'text-terraced-600 bg-terraced-50'
              }`}
            >
              {user?.role}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className={`flex items-center gap-1.5 text-xs ${
              isAdmin
                ? 'border-peak-600 text-peak-300 hover:text-red-400 hover:border-red-500/40 bg-transparent'
                : 'text-peak-600 hover:text-red-600 hover:border-red-200'
            }`}
          >
            <LogoutIcon />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      )}
    </header>
  )
}

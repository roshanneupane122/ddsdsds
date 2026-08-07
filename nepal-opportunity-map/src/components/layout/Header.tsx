import { Link, useNavigate } from 'react-router-dom'
import { useUIStore, useAuthStore } from '@/store'
import { Button } from '@/components/ui'
import { getRoleDashboard } from '@/routes/ProtectedRoute'

const MenuIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
)

const LogoutIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
)

export const Header = () => {
  const navigate = useNavigate()
  const { toggleSidebar } = useUIStore()
  const { user, isAuthenticated, clearAuth } = useAuthStore()

  const isAdmin = user?.role === 'ADMIN'
  const dashboardLink = getRoleDashboard(user?.role)

  const handleLogout = () => {
    clearAuth()
    navigate('/')
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-16 flex items-center px-4 md:px-6 gap-4 bg-white/95 backdrop-blur-md border-b border-emerald-100/90 shadow-sm">
      {/* Sidebar toggle */}
      <button
        onClick={toggleSidebar}
        className="p-2 rounded-xl text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
        aria-label="Toggle navigation menu"
        id="sidebar-toggle-btn"
      >
        <MenuIcon />
      </button>

      {/* Logo */}
      <Link
        to={dashboardLink}
        className="flex items-center gap-3 group"
        aria-label="Catalyst Nepal Opportunity Map — Dashboard"
      >
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-700 via-emerald-600 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-600/20 group-hover:shadow-lg group-hover:shadow-emerald-600/30 transition-all duration-300">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
        <div className="hidden sm:block">
          <span className="font-display font-bold text-base leading-none text-slate-900 tracking-tight block group-hover:text-emerald-700 transition-colors">
            Catalyst
          </span>
          <span className="block text-[10px] font-semibold tracking-wider text-emerald-600 uppercase mt-0.5">
            Nepal Opportunity Map
          </span>
        </div>
      </Link>

      {/* Admin banner badge */}
      {isAdmin && (
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/80 border border-emerald-300 text-emerald-800 text-[10px] font-mono font-semibold uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
          ADMIN SYSTEM
        </div>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* User & Logout section */}
      {isAuthenticated && (
        <div className="flex items-center gap-3 border-l border-emerald-100 pl-4">
          <div className="hidden sm:block text-right">
            <span className="block text-xs font-bold leading-none text-slate-900 tracking-tight">
              {user?.name || user?.email}
            </span>
            <span
              className={`inline-block mt-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                isAdmin
                  ? 'text-emerald-900 bg-emerald-100 border border-emerald-300'
                  : 'text-emerald-700 bg-emerald-50 border border-emerald-200'
              }`}
            >
              {user?.role}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs border-emerald-200 text-slate-700 hover:text-red-600 hover:border-red-300 hover:bg-red-50 bg-white transition-all duration-200 h-8 rounded-xl"
          >
            <LogoutIcon />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      )}
    </header>
  )
}
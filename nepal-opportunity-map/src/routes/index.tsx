import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import App from '@/App'
import { AdminRoute, CitizenRoute, PublicRoute } from './ProtectedRoute'
import { ErrorBoundary } from '@/components/ui'
import { Outlet } from 'react-router-dom'

// ──────────────────────────────────────────────
// Lazy-loaded Auth Pages
// ──────────────────────────────────────────────
const SalesPage = lazy(() => import('@/pages/SalesPage/SalesPage').then((m) => ({ default: m.SalesPage })))
const LoginPage = lazy(() => import('@/pages/auth/LoginPage').then((m) => ({ default: m.LoginPage })))
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage').then((m) => ({ default: m.RegisterPage })))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage/NotFoundPage').then((m) => ({ default: m.NotFoundPage })))

// ──────────────────────────────────────────────
// Lazy-loaded Citizen Pages
// ──────────────────────────────────────────────
const CitizenDashboardPage = lazy(() =>
  import('@/pages/citizen/CitizenDashboardPage').then((m) => ({ default: m.CitizenDashboardPage }))
)
const MapExplorerPage = lazy(() =>
  import('@/pages/MapExplorerPage/MapExplorerPage').then((m) => ({ default: m.MapExplorerPage }))
)
const MunicipalityDetailPage = lazy(() =>
  import('@/pages/MunicipalityDetailPage/MunicipalityDetailPage').then((m) => ({ default: m.MunicipalityDetailPage }))
)
const ComparePage = lazy(() => import('@/pages/ComparePage/ComparePage').then((m) => ({ default: m.ComparePage })))
const RecommendationsPage = lazy(() =>
  import('@/pages/RecommendationsPage/RecommendationsPage').then((m) => ({ default: m.RecommendationsPage }))
)
const ReportsPage = lazy(() => import('@/pages/ReportsPage/ReportsPage').then((m) => ({ default: m.ReportsPage })))

// ──────────────────────────────────────────────
// Lazy-loaded Admin Pages
// ──────────────────────────────────────────────
const AdminDashboardPage = lazy(() =>
  import('@/pages/admin/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage }))
)
const AdminUsersPage = lazy(() =>
  import('@/pages/admin/AdminUsersPage').then((m) => ({ default: m.AdminUsersPage }))
)
const AdminMunicipalitiesPage = lazy(() =>
  import('@/pages/admin/AdminMunicipalitiesPage').then((m) => ({ default: m.AdminMunicipalitiesPage }))
)
const AdminOpportunitiesPage = lazy(() =>
  import('@/pages/admin/AdminOpportunitiesPage').then((m) => ({ default: m.AdminOpportunitiesPage }))
)
const AdminRecommendationsPage = lazy(() =>
  import('@/pages/admin/AdminRecommendationsPage').then((m) => ({ default: m.AdminRecommendationsPage }))
)

const Loading = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600" />
  </div>
)

const S = ({ children }: { children: React.ReactNode }) => <Suspense fallback={<Loading />}>{children}</Suspense>

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: (
      <div className="p-8 text-center text-red-500 font-semibold">
        Application Error — Please refresh the page.
      </div>
    ),
    children: [
      // ── Public Routes ──────────────────────────────────
      {
        index: true,
        element: (
          <S>
            <PublicRoute>
              <SalesPage />
            </PublicRoute>
          </S>
        ),
      },
      {
        path: 'login',
        element: (
          <S>
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          </S>
        ),
      },
      {
        path: 'register',
        element: (
          <S>
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          </S>
        ),
      },

      // ── Citizen Routes ─────────────────────────────────
      {
        path: 'citizen',
        element: (
          <CitizenRoute>
            <Outlet />
          </CitizenRoute>
        ),
        children: [
          { index: true, element: <Navigate to="/citizen/dashboard" replace /> },
          {
            path: 'dashboard',
            element: (
              <S>
                <CitizenDashboardPage />
              </S>
            ),
          },
          {
            path: 'map',
            element: (
              <S>
                <ErrorBoundary featureName="Map Explorer">
                  <MapExplorerPage />
                </ErrorBoundary>
              </S>
            ),
          },
          {
            path: 'explorer',
            element: (
              <S>
                <ErrorBoundary featureName="Explorer">
                  <MapExplorerPage />
                </ErrorBoundary>
              </S>
            ),
          },
          {
            path: 'municipalities/:id',
            element: (
              <S>
                <MunicipalityDetailPage />
              </S>
            ),
          },
          {
            path: 'compare',
            element: (
              <S>
                <ComparePage />
              </S>
            ),
          },
          {
            path: 'recommendations',
            element: (
              <S>
                <RecommendationsPage />
              </S>
            ),
          },
          {
            path: 'reports',
            element: (
              <S>
                <ReportsPage />
              </S>
            ),
          },
          { path: '*', element: <S><NotFoundPage /></S> },
        ],
      },

      // ── Admin Routes ───────────────────────────────────
      {
        path: 'admin',
        element: (
          <AdminRoute>
            <Outlet />
          </AdminRoute>
        ),
        children: [
          { index: true, element: <Navigate to="/admin/dashboard" replace /> },
          {
            path: 'dashboard',
            element: (
              <S>
                <AdminDashboardPage />
              </S>
            ),
          },
          {
            path: 'users',
            element: (
              <S>
                <AdminUsersPage />
              </S>
            ),
          },
          {
            path: 'municipalities',
            element: (
              <S>
                <AdminMunicipalitiesPage />
              </S>
            ),
          },
          {
            path: 'opportunities',
            element: (
              <S>
                <AdminOpportunitiesPage />
              </S>
            ),
          },
          {
            path: 'recommendations',
            element: (
              <S>
                <AdminRecommendationsPage />
              </S>
            ),
          },
          { path: '*', element: <S><NotFoundPage /></S> },
        ],
      },

      // ── Legacy redirects ───────────────────────────────
      { path: 'map', element: <Navigate to="/citizen/map" replace /> },
      { path: 'municipalities/:id', element: <Navigate to="/citizen/municipalities/:id" replace /> },
      { path: 'compare', element: <Navigate to="/citizen/compare" replace /> },
      { path: 'recommendations', element: <Navigate to="/citizen/recommendations" replace /> },
      { path: 'reports', element: <Navigate to="/citizen/reports" replace /> },
      { path: 'dashboard/*', element: <Navigate to="/citizen/dashboard" replace /> },
      {
        path: '*',
        element: (
          <S>
            <NotFoundPage />
          </S>
        ),
      },
    ],
  },
])

import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store'
import type { UserRole } from '@/types'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
}

interface PublicRouteProps {
  children: React.ReactNode
}

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-terraced-500" />
  </div>
)

/** Get the default dashboard path for a given role */
export function getRoleDashboard(role: UserRole | undefined): string {
  if (role === 'ADMIN') return '/admin/dashboard'
  return '/citizen/dashboard'
}

/** Generic protected route - blocks unauthenticated, optionally restricts by role */
export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, user } = useAuthStore()
  const location = useLocation()

  if (isLoading) return <LoadingFallback />

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (allowedRoles && user?.role && !allowedRoles.includes(user.role)) {
    // Redirect to their own dashboard
    return <Navigate to={getRoleDashboard(user.role)} replace />
  }

  return <>{children}</>
}

/** Route accessible only to ADMIN role */
export const AdminRoute = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute allowedRoles={['ADMIN']}>{children}</ProtectedRoute>
)

/** Route accessible only to CITIZEN role */
export const CitizenRoute = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute allowedRoles={['CITIZEN']}>{children}</ProtectedRoute>
)

/** Public-only route — redirects authenticated users to their role's dashboard */
export const PublicRoute = ({ children }: PublicRouteProps) => {
  const { isAuthenticated, isLoading, user } = useAuthStore()

  if (isLoading) return <LoadingFallback />

  if (isAuthenticated) {
    return <Navigate to={getRoleDashboard(user?.role)} replace />
  }

  return <>{children}</>
}

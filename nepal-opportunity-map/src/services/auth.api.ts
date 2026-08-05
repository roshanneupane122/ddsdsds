import apiClient, { tokenStore } from './apiClient'
import { ENDPOINTS } from './endpoints'
import type { AuthResponse, LoginCredentials, RegisterPayload, User, UserRole } from '@/types'

export interface JwtPayload {
  sub?: string
  role?: string
  exp?: number
  email?: string
}

export function parseJwt(token: string): JwtPayload {
  try {
    const base64Url = token.split('.')[1]
    if (!base64Url) return {}
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch {
    return {}
  }
}

export function resolveUserRole(rawRole?: string): UserRole {
  if (!rawRole) return 'CITIZEN'
  const normalized = String(rawRole).trim().toUpperCase()
  return normalized === 'ADMIN' ? 'ADMIN' : 'CITIZEN'
}

export function isTokenExpired(token: string): boolean {
  const payload = parseJwt(token)
  if (!payload.exp) return false
  return payload.exp * 1000 <= Date.now()
}

export function extractUserFromToken(token: string, fallbackEmail = 'user@catalyst.np'): User {
  const payload = parseJwt(token)
  const role = resolveUserRole(payload.role)
  const email = payload.email || fallbackEmail
  const name = email.split('@')[0]

  return {
    id: payload.sub || 'usr-1',
    email,
    name: name.charAt(0).toUpperCase() + name.slice(1),
    role,
    createdAt: new Date().toISOString(),
  }
}

export const authApi = {
  /** Login user via POST /auth/login */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const { data } = await apiClient.post<{ access_token: string; token_type: string }>(
      ENDPOINTS.auth.login,
      {
        email: credentials.email,
        password: credentials.password,
      }
    )

    const accessToken = data.access_token
    tokenStore.set(accessToken)

    const payload = parseJwt(accessToken)
    const role = resolveUserRole(payload.role)
    const user: User = {
      id: payload.sub || 'usr-1',
      email: credentials.email,
      name: credentials.email.split('@')[0],
      role,
      createdAt: new Date().toISOString(),
    }

    const tokens = {
      accessToken,
      refreshToken: '',
      expiresAt: payload.exp ? payload.exp * 1000 : Date.now() + 3600 * 1000,
    }

    return { user, tokens }
  },

  /** Register new user via POST /auth/register and automatically log in */
  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const backendPayload = {
      name: payload.name,
      email: payload.email,
      password: payload.password,
    }

    const { data: rawUser } = await apiClient.post<any>(ENDPOINTS.auth.register, backendPayload)

    // Log in to retrieve JWT access token
    const loginResult = await authApi.login({
      email: payload.email,
      password: payload.password,
    })

    if (rawUser) {
      loginResult.user.id = rawUser.user_id || rawUser.id || loginResult.user.id
      loginResult.user.name = rawUser.name || payload.name
      loginResult.user.email = rawUser.email || payload.email
    }

    return loginResult
  },

  /** Logout */
  logout: async (): Promise<void> => {
    tokenStore.clear()
  },
}


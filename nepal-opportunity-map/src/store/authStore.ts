import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { tokenStore } from '@/services/apiClient'
import { isTokenExpired, extractUserFromToken } from '@/services/auth.api'
import type { User, AuthTokens } from '@/types'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  // Actions
  setUser: (user: User, tokens: AuthTokens | { accessToken: string }) => void
  clearAuth: () => void
  setLoading: (loading: boolean) => void
  validateSession: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: tokenStore.get(),
      isAuthenticated: !!tokenStore.get(),
      isLoading: false,

      setUser: (user, tokens) => {
        const token = tokens.accessToken
        tokenStore.set(token)
        // Ensure user role matches JWT claim
        const tokenUser = extractUserFromToken(token, user.email)
        const updatedUser = {
          ...user,
          role: tokenUser.role,
        }
        set({ user: updatedUser, token, isAuthenticated: true, isLoading: false })
      },

      clearAuth: () => {
        tokenStore.clear()
        set({ user: null, token: null, isAuthenticated: false, isLoading: false })
      },

      setLoading: (loading) => set({ isLoading: loading }),

      validateSession: () => {
        const token = get().token || tokenStore.get()
        if (!token || isTokenExpired(token)) {
          get().clearAuth()
          return false
        }
        return true
      },
    }),
    {
      name: 'catalyst-auth-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
      onRehydrateStorage: () => (state) => {
        if (!state) return
        const token = state.token || tokenStore.get()
        if (token) {
          if (isTokenExpired(token)) {
            state.clearAuth()
          } else {
            tokenStore.set(token)
            const tokenUser = extractUserFromToken(token, state.user?.email)
            state.user = {
              ...(state.user || tokenUser),
              role: tokenUser.role,
            }
            state.isAuthenticated = true
          }
        }
      },
    }
  )
)

// Listen for forced logout events from the API client (e.g., 401 Unauthorized)
if (typeof window !== 'undefined') {
  window.addEventListener('auth:logout', () => {
    useAuthStore.getState().clearAuth()
  })
}

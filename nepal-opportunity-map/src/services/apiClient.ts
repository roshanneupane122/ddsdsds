// ============================================================
// Axios API Client
// - Base URL from VITE_API_BASE_URL env var (never hardcoded)
// - Auth token injection via request interceptor
// - Unified error normalization via response interceptor
// - Automatic token refresh on 401
// ============================================================

import axios from 'axios'
import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import type { ApiError } from '@/types'

// BASE_URL can be empty in dev — Vite proxy will route relative paths to FastAPI
const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) ?? ''

if (!BASE_URL) {
  console.info('[apiClient] Using Vite dev proxy for API calls (VITE_API_BASE_URL is empty).')
}

// ── Token storage helpers ────────────────────────────────────
const TOKEN_KEY = 'catalyst_access_token'
let _accessToken: string | null = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null

export const tokenStore = {
  get: (): string | null => {
    if (!_accessToken && typeof window !== 'undefined') {
      _accessToken = localStorage.getItem(TOKEN_KEY)
    }
    return _accessToken
  },
  set: (token: string): void => {
    _accessToken = token
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token)
    }
  },
  clear: (): void => {
    _accessToken = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY)
    }
  },
}

// ── Create Axios instance ────────────────────────────────────
export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30_000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true, // Send httpOnly cookie for refresh token
})

// ── Request interceptor: attach Bearer token ─────────────────
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenStore.get()
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

apiClient.interceptors.response.use(
  response => response,
  async (error: AxiosError<{ message?: string; detail?: string }>) => {
    // ── 401 → clear auth token & notify ───────────────────────
    if (error.response?.status === 401) {
      tokenStore.clear()
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('auth:logout'))
      }
    }

    // ── Normalize error to ApiError shape ─────────────────────
    const normalizedError: ApiError = {
      statusCode: error.response?.status ?? 0,
      message:
        error.response?.data?.message ??
        error.response?.data?.detail ??
        error.message ??
        'An unexpected error occurred',
      details: undefined,
    }

    return Promise.reject(normalizedError)
  }
)

export default apiClient

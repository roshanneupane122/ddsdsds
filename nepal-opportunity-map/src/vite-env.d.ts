/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_MAP_TILE_URL: string
  readonly VITE_MAP_STYLE_URL: string
  readonly VITE_APP_ENV: string
  readonly VITE_ENABLE_AI_RECOMMENDATIONS: string
  readonly VITE_SENTRY_DSN: string
  readonly VITE_GOOGLE_ANALYTICS_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '*.css'

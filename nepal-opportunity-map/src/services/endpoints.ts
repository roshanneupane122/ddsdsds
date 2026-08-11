// ============================================================
// API Endpoint path constants
// Matched to Catalyst FastAPI Backend routes:
// - /users
// - /municipalities
// - /opportunities
// - /recommendations
// - /resource_data
// - /saved_recommendation
// ============================================================

export const ENDPOINTS = {
  // ── Auth & Users ──────────────────────────────────────────
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    me: '/users/',
    list: '/users/',
    detail: (id: string) => `/users/${id}`,
    updateProfile: (id: string) => `/users/${id}`,
  },

  // ── Municipalities ─────────────────────────────────────────
  municipalities: {
    base: '/municipalities',
    list: '/municipalities/',
    detail: (id: string) => `/municipalities/${id}`,
    create: '/municipalities/',
    update: (id: string) => `/municipalities/${id}`,
    delete: (id: string) => `/municipalities/${id}`,
  },

  // ── Business Opportunities ──────────────────────────────────
  opportunities: {
    list: '/opportunities/',
    detail: (id: string) => `/opportunities/${id}`,
    create: '/opportunities/',
    update: (id: string) => `/opportunities/${id}`,
    delete: (id: string) => `/opportunities/${id}`,
  },

  // ── AI Recommendations ─────────────────────────────────────
  recommendations: {
    list: '/recommendations/',
    detail: (id: string) => `/recommendations/${id}`,
    create: '/recommendations/',
    bulk: '/recommendations/bulk/',
    update: (id: string) => `/recommendations/${id}`,
    delete: (id: string) => `/recommendations/${id}`,
  },

  // ── Resource Data Indicators ───────────────────────────────
  resourceData: {
    list: '/resource_data/',
    detail: (id: string) => `/resource_data/${id}`,
    create: '/resource_data/',
    bulk: '/resource_data/bulk/',
    update: (id: string) => `/resource_data/${id}`,
    delete: (id: string) => `/resource_data/${id}`,
  },

  // ── Saved Recommendations ──────────────────────────────────
  savedRecommendations: {
    list: '/saved_recommendation/',
    detail: (id: string) => `/saved_recommendation/${id}`,
    create: '/saved_recommendation/',
    delete: (id: string) => `/saved_recommendation/${id}`,
  },

  // ── AI Analytics ───────────────────────────────────────────
  analyze: {
    score: '/analyze/score',
    similarity: '/analyze/similarity',
    chat: '/analyze/chat',
  },

  // ── Spatial Data ───────────────────────────────────────────
  spatial: {
    layers: '/spatial/layers',
  },

  // ── Report Generation ──────────────────────────────────────
  report: {
    generate: '/report/generate',
  },
} as const

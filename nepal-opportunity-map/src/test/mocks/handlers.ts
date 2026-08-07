import { http, HttpResponse } from 'msw'
import type { PaginatedResponse } from '@/types'
import {
  MOCK_MUNICIPALITIES,
  MOCK_MUNICIPALITY_DETAIL,
  TILOTTAMA_MUNICIPALITY_DETAIL,
  MOCK_RECOMMENDATIONS,
  MOCK_REPORTS,
  MOCK_USER,
} from './data'

const BASE = import.meta.env.VITE_API_BASE_URL as string

const paginate = <T>(
  items: T[],
  page: number,
  pageSize: number
): PaginatedResponse<T> => {
  const start = (page - 1) * pageSize
  const slice = items.slice(start, start + pageSize)
  return {
    data: slice,
    total: items.length,
    page,
    pageSize,
    hasNext: start + pageSize < items.length,
    hasPrev: page > 1,
  }
}

export const handlers = [
  // ── Auth ──────────────────────────────────────────────────
  http.post(`${BASE}/auth/login`, async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string }
    if (body.password.length < 6) {
      return HttpResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      )
    }
    return HttpResponse.json({
      user: MOCK_USER,
      tokens: {
        accessToken: 'mock-access-token-xyz',
        refreshToken: 'mock-refresh-token-xyz',
        expiresAt: Date.now() + 3600 * 1000,
      },
    })
  }),

  http.post(`${BASE}/auth/register`, async () => {
    return HttpResponse.json({
      user: MOCK_USER,
      tokens: {
        accessToken: 'mock-access-token-xyz',
        refreshToken: 'mock-refresh-token-xyz',
        expiresAt: Date.now() + 3600 * 1000,
      },
    })
  }),

  http.post(`${BASE}/auth/logout`, () => {
    return new HttpResponse(null, { status: 204 })
  }),

  http.get(`${BASE}/auth/me`, () => {
    return HttpResponse.json(MOCK_USER)
  }),

  // ── Municipalities ─────────────────────────────────────────
  http.get(`${BASE}/municipalities`, ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 1)
    const pageSize = Number(url.searchParams.get('pageSize') ?? 20)
    const search = url.searchParams.get('search') || url.searchParams.get('q') || ''
    const province = url.searchParams.get('province')

    let filtered = MOCK_MUNICIPALITIES
    if (search) {
      const qLower = search.toLowerCase()
      filtered = filtered.filter(m =>
        m.name.toLowerCase().includes(qLower) ||
        m.district.toLowerCase().includes(qLower)
      )
    }
    if (province) {
      filtered = filtered.filter(m => String(m.province) === province)
    }

    return HttpResponse.json(paginate(filtered, page, pageSize))
  }),

  http.get(`${BASE}/municipalities/search`, ({ request }) => {
    const url = new URL(request.url)
    const q = url.searchParams.get('q') || url.searchParams.get('search') || ''
    const limit = Number(url.searchParams.get('limit') ?? 15)
    const qLower = q.toLowerCase()
    const results = MOCK_MUNICIPALITIES
      .filter(m =>
        m.name.toLowerCase().includes(qLower) ||
        m.district.toLowerCase().includes(qLower)
      )
      .slice(0, limit)
    return HttpResponse.json(results)
  }),

  http.get(`${BASE}/municipalities/:id`, ({ params }) => {
    const { id } = params
    if (id === 'tilottama-mun' || id === 'tilottama') {
      return HttpResponse.json(TILOTTAMA_MUNICIPALITY_DETAIL)
    }
    if (id === MOCK_MUNICIPALITY_DETAIL.id) {
      return HttpResponse.json(MOCK_MUNICIPALITY_DETAIL)
    }
    const match = MOCK_MUNICIPALITIES.find(m => m.id === id)
    if (match) {
      return HttpResponse.json({ ...MOCK_MUNICIPALITY_DETAIL, ...match })
    }
    return HttpResponse.json({ message: 'Municipality not found' }, { status: 404 })
  }),

  http.get(`${BASE}/municipalities/:id/recommendations`, ({ params }) => {
    const { id } = params
    const recs = MOCK_RECOMMENDATIONS.filter(r => r.municipalityId === id)
    return HttpResponse.json(recs)
  }),

  http.post(`${BASE}/municipalities/compare`, async ({ request }) => {
    const body = (await request.json()) as { ids: string[] }
    const results = body.ids.map(id => ({
      ...MOCK_MUNICIPALITY_DETAIL,
      ...MOCK_MUNICIPALITIES.find(m => m.id === id),
    }))
    return HttpResponse.json(results)
  }),

  // ── Recommendations ────────────────────────────────────────
  http.get(`${BASE}/recommendations`, ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 1)
    const pageSize = Number(url.searchParams.get('pageSize') ?? 9)
    const category = url.searchParams.get('category')
    const confidence = url.searchParams.get('confidence')
    const province = url.searchParams.get('province')

    let filtered = MOCK_RECOMMENDATIONS
    if (category) filtered = filtered.filter(r => r.category === category)
    if (confidence) filtered = filtered.filter(r => r.confidence === confidence)
    if (province) filtered = filtered.filter(r => String(r.province) === province)

    return HttpResponse.json(paginate(filtered, page, pageSize))
  }),

  http.get(`${BASE}/recommendations/featured`, () => {
    return HttpResponse.json(MOCK_RECOMMENDATIONS.filter(r => r.confidence === 'high').slice(0, 3))
  }),

  http.get(`${BASE}/recommendations/:id`, ({ params }) => {
    const rec = MOCK_RECOMMENDATIONS.find(r => r.id === params.id)
    if (!rec) return HttpResponse.json({ message: 'Not found' }, { status: 404 })
    return HttpResponse.json(rec)
  }),

  // ── Reports ────────────────────────────────────────────────
  http.get(`${BASE}/reports`, () => {
    return HttpResponse.json(paginate(MOCK_REPORTS, 1, 10))
  }),

  http.post(`${BASE}/reports/generate`, async ({ request }) => {
    const body = await request.json()
    const newReport = {
      id: `rpt-${Date.now()}`,
      title: (body as { title?: string }).title ?? 'Custom Report',
      type: 'municipality',
      format: 'pdf',
      status: 'generating',
      createdAt: new Date().toISOString(),
      municipalityIds: [],
    }
    return HttpResponse.json(newReport, { status: 202 })
  }),

  http.get(`${BASE}/reports/:id`, ({ params }) => {
    const report = MOCK_REPORTS.find(r => r.id === params.id)
    if (!report) return HttpResponse.json({ message: 'Not found' }, { status: 404 })
    return HttpResponse.json(report)
  }),
]

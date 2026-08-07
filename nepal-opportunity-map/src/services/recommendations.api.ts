import apiClient from './apiClient'
import { ENDPOINTS } from './endpoints'
import { parseProvinceNumber } from './municipalities.api'
import type {
  Recommendation,
  PaginatedResponse,
  RecommendationFilter,
  ConfidenceLevel,
  OpportunityCategory,
} from '@/types'

// Transformer for Backend AIRecommendationRead/Detail -> Frontend Recommendation
export function transformBackendRecommendation(r: any): Recommendation {
  const score = r.suitability_score ?? 80
  const confidence: ConfidenceLevel = score >= 80 ? 'high' : score >= 60 ? 'medium' : 'low'

  const muniName = r.municipality?.name || 'Local Municipality'
  const oppTitle = r.opportunity?.title || 'High-Yield Local Venture'
  const sector = (r.opportunity?.sector || 'agribusiness').toLowerCase()
  const provinceValue = r.municipality?.province

  // Map sector string to OpportunityCategory
  const categoryMap: Record<string, OpportunityCategory> = {
    agriculture: 'agribusiness',
    agribusiness: 'agribusiness',
    tourism: 'eco_tourism',
    eco_tourism: 'eco_tourism',
    manufacturing: 'manufacturing',
    technology: 'digital_services',
    energy: 'renewable_energy',
    healthcare: 'healthcare',
    education: 'education',
    infrastructure: 'infrastructure',
    trade: 'export_trade',
  }

  const category: OpportunityCategory = categoryMap[sector] || 'agribusiness'
  const minInv = r.opportunity?.min_investment ?? 1500000
  const maxInv = r.opportunity?.max_investment ?? 4500000

  return {
    id: r.recommendation_id || r.id,
    municipalityId: r.municipality_id || 'muni-1',
    opportunityId: r.opportunity_id,
    modelVersion: r.model_version || 'v1.0',
    municipalityName: muniName,
    province: parseProvinceNumber(provinceValue ?? 4),
    title: oppTitle,
    category,
    confidence,
    confidenceScore: score / 100,
    summary:
      r.explanation ||
      r.opportunity?.description ||
      `High-potential venture with calculated suitability score of ${score}/100.`,
    explanation:
      r.explanation ||
      `Synthesized AI recommendation based on local GIS parameters, road connectivity, and agricultural output.`,
    whyThisFits: [
      `High suitability score (${score}%) calculated by AI models`,
      `Required infrastructure alignment: ${r.opportunity?.required_infrastructure || 'Standard road and power access'}`,
      `Strong economic alignment in ${muniName}`,
    ],
    estimatedInvestmentUSD: {
      min: Math.round(minInv / 130), // Convert NPR -> USD approx
      max: Math.round(maxInv / 130),
    },
    estimatedROIPercent: { min: 18, max: 32 },
    timeToMarketMonths: 12,
    riskFactors: ['Seasonal climatic fluctuation', 'Market supply chain logistics'],
    supportingData: [
      { label: 'Suitability Score', value: `${score}/100` },
      { label: 'Model Version', value: r.model_version || 'v1.0' },
    ],
    tags: [category, 'AI Recommended'],
    createdAt: r.created_at || new Date().toISOString(),
  }
}

export const recommendationsApi = {
  /** List all recommendations with optional filters */
  list: async (
    params?: Partial<RecommendationFilter> & { page?: number; pageSize?: number; skip?: number; limit?: number }
  ): Promise<PaginatedResponse<Recommendation>> => {
    const skip = params?.skip ?? ((params?.page ?? 1) - 1) * (params?.pageSize ?? 20)
    const limit = params?.limit ?? params?.pageSize ?? 50

    const { data } = await apiClient.get<any[]>(ENDPOINTS.recommendations.list, {
      params: { skip, limit },
    })

    const transformed = (data || []).map(transformBackendRecommendation)

    // Filter locally if search / category query passed
    let filtered = transformed
    if (params?.search) {
      const q = params.search.toLowerCase()
      filtered = filtered.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.municipalityName.toLowerCase().includes(q) ||
          r.summary.toLowerCase().includes(q)
      )
    }
    if (params?.category) {
      filtered = filtered.filter((r) => r.category === params.category)
    }

    return {
      data: filtered,
      total: filtered.length,
      page: params?.page ?? 1,
      pageSize: limit,
      hasNext: false,
      hasPrev: false,
    }
  },

  /** Get a single recommendation by ID */
  detail: async (id: string): Promise<Recommendation> => {
    try {
      const { data } = await apiClient.get<any>(ENDPOINTS.recommendations.detail(id))
      return transformBackendRecommendation(data)
    } catch {
      const { data } = await apiClient.get<any[]>(ENDPOINTS.recommendations.list)
      const match = (data || []).find((r) => r.recommendation_id === id || r.id === id)
      if (match) return transformBackendRecommendation(match)
      throw new Error(`Recommendation ${id} not found`)
    }
  },

  /** Get AI recommendations for a specific municipality */
  byMunicipality: async (municipalityId: string): Promise<Recommendation[]> => {
    const { data } = await apiClient.get<any[]>(ENDPOINTS.recommendations.list, {
      params: { municipality_id: municipalityId },
    })
    return (data || []).map(transformBackendRecommendation)
  },

  /** Get featured/highlighted opportunities */
  featured: async (): Promise<Recommendation[]> => {
    const { data } = await apiClient.get<any[]>(ENDPOINTS.recommendations.list, {
      params: { limit: 6 },
    })
    const transformed = (data || []).map(transformBackendRecommendation)
    return transformed.length > 0 ? transformed.slice(0, 3) : []
  },

  create: async (payload: {
    municipality_id: string
    opportunity_id: string
    suitability_score: number
    explanation?: string
    model_version?: string
  }): Promise<Recommendation> => {
    const { data } = await apiClient.post<any>(ENDPOINTS.recommendations.create, payload)
    return transformBackendRecommendation(data)
  },

  update: async (
    id: string,
    payload: Partial<{
      municipality_id: string
      opportunity_id: string
      suitability_score: number
      explanation?: string
      model_version?: string
    }>
  ): Promise<Recommendation> => {
    const { data } = await apiClient.patch<any>(ENDPOINTS.recommendations.update(id), payload)
    return transformBackendRecommendation(data)
  },

  remove: async (id: string): Promise<Recommendation> => {
    const { data } = await apiClient.delete<any>(ENDPOINTS.recommendations.delete(id))
    return transformBackendRecommendation(data)
  },
}

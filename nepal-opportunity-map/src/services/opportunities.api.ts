import apiClient from './apiClient'
import { ENDPOINTS } from './endpoints'

export interface BusinessOpportunity {
  opportunity_id: string
  title: string
  sector?: string
  description?: string
  required_infrastructure?: string
  min_investment?: number
  max_investment?: number
  estimated_investment_scale?: string
  created_at: string
  updated_at: string
}

export interface BusinessOpportunityUpsertPayload {
  title: string
  sector?: string
  description?: string
  required_infrastructure?: string
  min_investment?: number
  max_investment?: number
  estimated_investment_scale?: string
}

export const opportunitiesApi = {
  /** List business opportunities with optional filters */
  list: async (params?: {
    sector?: string
    min_budget?: number
    max_budget?: number
    skip?: number
    limit?: number
  }): Promise<BusinessOpportunity[]> => {
    const { data } = await apiClient.get<BusinessOpportunity[]>(ENDPOINTS.opportunities.list, {
      params,
    })
    return data || []
  },

  /** Get single opportunity by ID */
  detail: async (id: string): Promise<BusinessOpportunity> => {
    const { data } = await apiClient.get<BusinessOpportunity>(ENDPOINTS.opportunities.detail(id))
    return data
  },

  /** Create opportunity */
  create: async (payload: Partial<BusinessOpportunity>): Promise<BusinessOpportunity> => {
    const { data } = await apiClient.post<BusinessOpportunity>(ENDPOINTS.opportunities.create, payload)
    return data
  },
  
  /** Update opportunity */
  update: async (id: string, payload: Partial<BusinessOpportunityUpsertPayload>): Promise<BusinessOpportunity> => {
    const { data } = await apiClient.patch<BusinessOpportunity>(ENDPOINTS.opportunities.update(id), payload)
    return data
  },

  /** Delete opportunity */
  remove: async (id: string): Promise<BusinessOpportunity> => {
    const { data } = await apiClient.delete<BusinessOpportunity>(ENDPOINTS.opportunities.delete(id))
    return data
  },
}

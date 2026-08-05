import apiClient from './apiClient'
import { ENDPOINTS } from './endpoints'

export interface ResourceDataRecord {
  data_id: string
  municipality_id: string
  category: string
  indicator_name: string
  value?: number
  year: number
  data_source?: string
  created_at: string
  updated_at: string
}

export const resourceDataApi = {
  /** List resource data with optional filters */
  list: async (params?: {
    municipality_id?: string
    category?: string
    indicator_name?: string
    year?: number
    skip?: number
    limit?: number
  }): Promise<ResourceDataRecord[]> => {
    const { data } = await apiClient.get<ResourceDataRecord[]>(ENDPOINTS.resourceData.list, {
      params,
    })
    return data || []
  },

  /** Get single resource data by ID */
  detail: async (id: string): Promise<ResourceDataRecord> => {
    const { data } = await apiClient.get<ResourceDataRecord>(ENDPOINTS.resourceData.detail(id))
    return data
  },

  /** Create resource data record */
  create: async (payload: {
    municipality_id: string
    category: string
    indicator_name: string
    value?: number
    year: number
    data_source?: string
  }): Promise<ResourceDataRecord> => {
    const { data } = await apiClient.post<ResourceDataRecord>(ENDPOINTS.resourceData.create, payload)
    return data
  },
}

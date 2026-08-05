import apiClient from './apiClient'
import { ENDPOINTS } from './endpoints'

export type AdminUserRole = 'ADMIN' | 'MUNICIPAL_OFFICIAL' | 'CITIZEN'

export interface AdminUserRecord {
  id: string
  name: string
  email: string
  role: AdminUserRole
  createdAt: string
  updatedAt: string
}

export interface AdminUserUpdatePayload {
  name?: string
  email?: string
  password?: string
  role?: AdminUserRole
}

function normalizeRoleForBackend(role?: AdminUserRole): string | undefined {
  if (!role) return undefined
  return role.toLowerCase()
}

function transformUser(user: any): AdminUserRecord {
  return {
    id: user.user_id || user.id,
    name: user.name || '',
    email: user.email || '',
    role: String(user.role || 'CITIZEN').trim().toUpperCase() as AdminUserRole,
    createdAt: user.created_at || new Date().toISOString(),
    updatedAt: user.updated_at || user.created_at || new Date().toISOString(),
  }
}

export const usersApi = {
  list: async (params?: { skip?: number; limit?: number }): Promise<AdminUserRecord[]> => {
    const { data } = await apiClient.get<any[]>(ENDPOINTS.auth.list, { params })
    return (data || []).map(transformUser)
  },

  detail: async (id: string): Promise<AdminUserRecord> => {
    const { data } = await apiClient.get<any>(ENDPOINTS.auth.detail(id))
    return transformUser(data)
  },

  update: async (id: string, payload: AdminUserUpdatePayload): Promise<AdminUserRecord> => {
    const { data } = await apiClient.patch<any>(ENDPOINTS.auth.updateProfile(id), {
      ...payload,
      role: normalizeRoleForBackend(payload.role),
    })
    return transformUser(data)
  },

  remove: async (id: string): Promise<AdminUserRecord> => {
    const { data } = await apiClient.delete<any>(ENDPOINTS.auth.detail(id))
    return transformUser(data)
  },
}
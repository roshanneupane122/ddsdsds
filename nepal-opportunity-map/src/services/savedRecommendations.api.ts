import apiClient from './apiClient'
import { ENDPOINTS } from './endpoints'

export interface SavedRecommendationDetail {
  user_id: string
  recommendation_id: string
  saved_at: string
  recommendation?: any
}

export const savedRecommendationsApi = {
  /** List saved recommendations for a user */
  list: async (userId: string, skip = 0, limit = 20): Promise<SavedRecommendationDetail[]> => {
    const { data } = await apiClient.get<SavedRecommendationDetail[]>(ENDPOINTS.savedRecommendations.list, {
      params: { user_id: userId, skip, limit },
    })
    return data || []
  },

  /** Bookmark / save a recommendation for a user */
  save: async (userId: string, recommendationId: string): Promise<SavedRecommendationDetail> => {
    const { data } = await apiClient.post<SavedRecommendationDetail>(
      ENDPOINTS.savedRecommendations.create,
      { recommendation_id: recommendationId },
      { params: { user_id: userId } }
    )
    return data
  },

  /** Delete a saved recommendation */
  delete: async (userId: string, recommendationId: string): Promise<void> => {
    await apiClient.delete(ENDPOINTS.savedRecommendations.detail(recommendationId), {
      params: { user_id: userId },
    })
  },
}

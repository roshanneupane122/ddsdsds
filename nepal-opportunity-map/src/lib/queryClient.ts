import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Keep data fresh for 2 minutes before refetching
      staleTime: 2 * 60 * 1000,
      // Cache for 10 minutes (data stays available even after unmount)
      gcTime: 10 * 60 * 1000,
      // Retry failed requests once before showing error
      retry: 1,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10_000),
      // Refetch on window focus for data-sensitive pages
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
})

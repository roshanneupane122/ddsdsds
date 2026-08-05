import { create } from 'zustand'

export type ToastVariant = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: string
  message: string
  variant: ToastVariant
  duration?: number
}

interface UIState {
  // Sidebar
  isSidebarOpen: boolean
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void

  // Dark mode
  isDarkMode: boolean
  toggleDarkMode: () => void

  // Toast notifications
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void

  // Global loading (for page transitions)
  isGlobalLoading: boolean
  setGlobalLoading: (loading: boolean) => void

  // Mobile menu
  isMobileMenuOpen: boolean
  setMobileMenuOpen: (open: boolean) => void
}

let toastIdCounter = 0

export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: true,
  isDarkMode: false,
  toasts: [],
  isGlobalLoading: false,
  isMobileMenuOpen: false,

  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),

  toggleDarkMode: () =>
    set((state) => {
      const next = !state.isDarkMode
      // Sync with document class for Tailwind dark mode
      document.documentElement.classList.toggle('dark', next)
      return { isDarkMode: next }
    }),

  addToast: (toast) => {
    const id = String(++toastIdCounter)
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }))
    // Auto-remove after duration
    const duration = toast.duration ?? 4000
    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
      }, duration)
    }
  },

  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),

  setGlobalLoading: (loading) => set({ isGlobalLoading: loading }),
  setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
}))

// Convenience toast helper — import this in components
export const toast = {
  success: (message: string, duration?: number) =>
    useUIStore.getState().addToast({ message, variant: 'success', duration }),
  error: (message: string, duration?: number) =>
    useUIStore.getState().addToast({ message, variant: 'error', duration }),
  info: (message: string, duration?: number) =>
    useUIStore.getState().addToast({ message, variant: 'info', duration }),
  warning: (message: string, duration?: number) =>
    useUIStore.getState().addToast({ message, variant: 'warning', duration }),
}

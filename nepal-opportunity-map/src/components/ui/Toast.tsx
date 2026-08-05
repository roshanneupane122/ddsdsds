import { useUIStore } from '@/store'
import type { Toast } from '@/store/uiStore'

const variantStyles: Record<Toast['variant'], string> = {
  success: 'bg-terraced-600 text-white',
  error: 'bg-red-500 text-white',
  info: 'bg-mist-600 text-white',
  warning: 'bg-saffron-500 text-white',
}

const icons: Record<Toast['variant'], string> = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
  warning: '⚠',
}

export const ToastContainer = () => {
  const { toasts, removeToast } = useUIStore()

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none"
    >
      {toasts.map(toast => (
        <div
          key={toast.id}
          role="alert"
          className={[
            'flex items-start gap-3 px-4 py-3 rounded-xl shadow-panel',
            'animate-slide-in-right pointer-events-auto',
            variantStyles[toast.variant],
          ].join(' ')}
        >
          <span className="text-lg leading-none mt-0.5 select-none" aria-hidden="true">
            {icons[toast.variant]}
          </span>
          <p className="flex-1 text-sm font-medium leading-snug">{toast.message}</p>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-white/70 hover:text-white transition-colors p-0.5 -mr-1 -mt-0.5"
            aria-label="Dismiss notification"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  )
}

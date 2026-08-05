import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

// This service worker is started in main.tsx when VITE_APP_ENV=development
export const worker = setupWorker(...handlers)

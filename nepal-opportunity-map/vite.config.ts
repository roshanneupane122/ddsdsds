
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    visualizer({
      filename: 'dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ],

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@features': resolve(__dirname, 'src/features'),
      '@services': resolve(__dirname, 'src/services'),
      '@store': resolve(__dirname, 'src/store'),
      '@hooks': resolve(__dirname, 'src/hooks'),
      '@lib': resolve(__dirname, 'src/lib'),
      '@constants': resolve(__dirname, 'src/constants'),
      '@pages': resolve(__dirname, 'src/pages'),
    },
  },

  server: {
    host: true,
    port: 5173,
    strictPort: true,

    allowedHosts: [
      'pert-mathilde-untheoretically.ngrok-free.dev',
    ],

    proxy: {
      // Docker:
      // "backend" is the Docker Compose service name.
      '/auth': {
        target: 'http://backend:8000',
        changeOrigin: true,
      },

      '/users': {
        target: 'http://backend:8000',
        changeOrigin: true,
      },

      '/municipalities': {
        target: 'http://backend:8000',
        changeOrigin: true,
      },

      '/opportunities': {
        target: 'http://backend:8000',
        changeOrigin: true,
      },

      '/recommendations': {
        target: 'http://backend:8000',
        changeOrigin: true,
      },

      '/resource_data': {
        target: 'http://backend:8000',
        changeOrigin: true,
      },

      '/saved_recommendation': {
        target: 'http://backend:8000',
        changeOrigin: true,
      },
    },
  },

  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules')) {
            if (id.includes('maplibre-gl')) return 'vendor-map'
            if (id.includes('recharts')) return 'vendor-charts'

            if (
              id.includes('react-router-dom') ||
              id.includes('react-dom') ||
              id.includes('react/')
            ) {
              return 'vendor-react'
            }

            if (
              id.includes('@tanstack') ||
              id.includes('axios') ||
              id.includes('zustand')
            ) {
              return 'vendor-query'
            }

            if (
              id.includes('react-hook-form') ||
              id.includes('zod')
            ) {
              return 'vendor-forms'
            }

            if (
              id.includes('jspdf') ||
              id.includes('html2canvas')
            ) {
              return 'vendor-pdf'
            }
          }
        },
      },
    },

    target: 'es2020',
    sourcemap: mode === 'development',
  },

  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
  },

  envPrefix: 'VITE_',
}))
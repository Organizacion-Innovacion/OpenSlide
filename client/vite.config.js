import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/openslide/',
  server: {
    host: true,
    proxy: {
      '/openslide/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/openslide\/api/, '/api'),
        timeout: 300000,
        proxyTimeout: 300000,
      },
      '/openslide/slides': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/openslide\/slides/, '/slides'),
      },
    },
  },
})
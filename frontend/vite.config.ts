import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The proxy forwards /api/* requests from the Vite dev server to the real backend.
// From the browser's perspective, all requests go to localhost:5173 (same origin),
// so HttpOnly cookies are set and sent on the same origin — no cross-origin issues.
const BACKEND_URL = 'https://medics-production.up.railway.app';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: BACKEND_URL,
        changeOrigin: true,
        secure: true,
      },
    },
  },
})

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/v1/productos': 'http://localhost:8082',
      '/api/v1/categorias': 'http://localhost:8082',
      '/api/v1/ventas': 'http://localhost:8083',
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.js',
  },
})
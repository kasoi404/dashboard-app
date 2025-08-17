import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': 'http://localhost:4000',
      '/products': 'http://localhost:4000',
      '/inbound': 'http://localhost:4000',
      '/outbound': 'http://localhost:4000',
      '/employees': 'http://localhost:4000',
      '/users': 'http://localhost:4000',
      '/exports': 'http://localhost:4000',
      '/alerts': 'http://localhost:4000',
      '/uploads': 'http://localhost:4000'
    }
  }
})

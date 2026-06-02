import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,        // listen on all network interfaces, so the phone can reach it
    port: 5173,
    strictPort: true,  // fail loudly instead of silently picking another port
  },
})

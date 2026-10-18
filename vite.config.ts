import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// `base` is '/sprout/' for production builds (the GitHub Pages project site is
// served from /sprout/), but '/' in dev so the phone can preview at the root.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/sprout/' : '/',
  plugins: [react()],
  server: {
    host: true,        // listen on all network interfaces, so the phone can reach it
    port: 5173,
    strictPort: true,  // fail loudly instead of silently picking another port
    proxy: {
      // SPROUT_EXAM_API points the proxy at another port when 8787 is taken.
      '/api': { target: process.env.SPROUT_EXAM_API || 'http://127.0.0.1:8787', changeOrigin: true },
    },
  },
}))

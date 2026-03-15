import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // No base path needed for Vercel/Netlify
  // Only use base: '/repo-name/' for GitHub Pages
})

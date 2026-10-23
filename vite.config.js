
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Ottokonek Order Manager — GitHub Pages configuration
export default defineConfig({
  plugins: [react()],
  base: '/ottokonek-order-manager/',
})

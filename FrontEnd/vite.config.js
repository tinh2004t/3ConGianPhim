import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5001,
    historyApiFallback: true, 
  },
  preview: {
    port: 4173,
    historyApiFallback: true, 
  }
})

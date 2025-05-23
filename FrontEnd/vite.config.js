import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // hoặc port bạn muốn
    historyApiFallback: true, // Quan trọng: cho phép client-side routing
  },
  preview: {
    port: 4173,
    historyApiFallback: true, // Cũng cần cho preview mode
  }
})

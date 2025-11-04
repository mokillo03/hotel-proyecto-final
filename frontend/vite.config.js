import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Redirige /api a tu backend de Node.js
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false, // Usar false si tu backend no tiene HTTPS
        rewrite: (path) => path.replace(/^\/api/, '/api'), // Asegura que el path /api se mantenga
      },
    }
  }
})
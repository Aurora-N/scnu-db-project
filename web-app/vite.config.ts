import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from "path"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // Express 服务器地址
        changeOrigin: true,
        // 重写路径，去掉 /api
        rewrite: (path) => path.replace(/^\/api/, ''), 
      },
    },
  },
})

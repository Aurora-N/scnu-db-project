import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
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

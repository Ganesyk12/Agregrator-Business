import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  },
  server: {
    // @ts-ignore
    sourcemap: false,
    port: 5173,
    open: true
  },
  build: {
    sourcemap: false,
  },
  optimizeDeps: {
    exclude: [
      'jquery',
      'bootstrap',
      'swiper'
    ]
  }
})
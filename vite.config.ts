import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [
    vue(),
    {
      name: 'dashboard-rewrite',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url) {
            const urlPath = req.url.split('?')[0]
            if (urlPath === '/dashboard' || urlPath.startsWith('/dashboard/')) {
              req.url = '/dashboard.html' + (req.url.includes('?') ? '?' + req.url.split('?')[1] : '')
            }
          }
          next()
        })
      }
    }
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  },
  server: {
    // @ts-ignore
    sourcemap: false,
    port: 5173,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    sourcemap: false,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        dashboard: path.resolve(__dirname, 'dashboard.html'),
      },
    },
  },
  optimizeDeps: {
    exclude: [
      'jquery',
      'bootstrap',
      'swiper'
    ]
  }
})
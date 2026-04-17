import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: 'dist/stats.html',
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  define: {
    __FRONTEND_VERSION__: JSON.stringify(process.env.FRONTEND_VERSION ?? 'dev'),
    __FRONTEND_COMMIT__: JSON.stringify(process.env.FRONTEND_COMMIT ?? 'none'),
    __FRONTEND_BUILD_DATE__: JSON.stringify(process.env.FRONTEND_BUILD_DATE ?? 'unknown'),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    proxy: {
       '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      }
    }
  },
  optimizeDeps: {
    
  }
})

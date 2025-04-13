import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  const isDev = mode === 'development'
  const basePath = isDev ? '/' : '/static/'

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
    publicDir: 'public',
    server: isDev
      ? {
          headers: {
            'Service-Worker-Allowed': '/',
          },
          port: 3000,
          proxy: {
            '/api': {
              target: 'http://localhost:8000',
              changeOrigin: true,
              rewrite: (path) => path.replace(/^\/api/, '/api'),
            },
          },
        }
      : undefined,
    build: {
      // outDir: resolve(__dirname, '../../api/backend/static'),
      outDir: 'dist',
      emptyOutDir: true,
      manifest: true,
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
          sw: resolve(__dirname, 'public/sw.js'),
        },
        output: {
          entryFileNames: (chunkInfo) =>
            chunkInfo.name === 'sw' ? '[name].js' : `assets/[name].[hash].js`,
          chunkFileNames: `assets/[name].[hash].js`,
          assetFileNames: `assets/[name].[hash].[ext]`,
        },
      },
    },
    base: basePath,
  }
})

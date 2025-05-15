import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  const isDev = mode === 'development'
  const basePath = isDev ? '/' : '/frontend-static/'
  const serverTarget = isDev
    ? 'http://localhost:8000'
    : 'https://grustno-insrtuction.ru'

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
    publicDir: 'public',
    server: {
      headers: {
        'Service-Worker-Allowed': '/',
      },
      port: 3000,
      proxy: {
        '/api': {
          target: serverTarget,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '/api'),
        },
      },
    },
    build: {
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

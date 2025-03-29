import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  const isDev = mode === 'development'

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
    server: isDev
      ? {
          port: 3000,
          proxy: {
            '/api': {
              target: 'http://localhost:8000',
              changeOrigin: true,
              rewrite: (path) => path.replace(/^\/api/, ''),
            },
          },
        }
      : undefined,
    build: {
      // Путь относительно client/vite.config.js → api/backend/static/
      outDir: resolve(__dirname, '../../api/backend/static'),
      emptyOutDir: true, // Очищать папку перед сборкой
    },
    base: isDev ? '/' : '/static/', // В prod пути начинаются с /static/
  }
})

/*
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  const isDev = mode === 'development'

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '@components': resolve(__dirname, 'src/components'),
        '@pages': resolve(__dirname, 'src/pages'),
      },
    },
    server: isDev
      ? {
          proxy: {
            '/api': {
              target: 'http://localhost:8000',
              changeOrigin: true,
              rewrite: (path) => path.replace(/^\/api/, ''),
            },
          },
        }
      : undefined,
    build: {
      outDir: '../backend/static/frontend',
      emptyOutDir: true,
    },
    base: isDev ? '/' : '/static/frontend/',
  }
})
*/

/*

В dev-режиме (npm run dev):

--Vite запускается на http://localhost:3000.
--Все запросы к /api/... проксируются на Django (http://localhost:8000).
--React работает с HMR (горячая перезагрузка).

В prod-режиме (npm run build):
--React собирается в backend/static/.
--Django раздаёт статику из этой папки.
*/


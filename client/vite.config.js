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
    publicDir: 'public', // Папка для статических файлов (включая sw.js)
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
              configure: (proxy) => {
                proxy.on('proxyReq', (proxyReq) => {
                  console.log('Proxy Request:', proxyReq.method, proxyReq.path)
                })
                proxy.on('proxyRes', (proxyRes) => {
                  console.log('Proxy Response:', proxyRes.statusCode)
                })
              },
            },
          },
        }
      : undefined,
    build: {
      outDir: resolve(__dirname, '../../api/backend/static'),
      emptyOutDir: true,
      manifest: true,
      assetsInlineLimit: 4096, // файлы меньше этого размера будут инлайниться
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
          // Добавляем sw.js в сборку
          sw: resolve(__dirname, 'public/sw.js'),
        },
        output: {
          assetFileNames: 'assets/[name].[hash].[ext]',
          entryFileNames: (chunkInfo) => {
            // Сохраняем sw.js без хэша в имени файла
            return chunkInfo.name === 'sw'
              ? '[name].js'
              : `assets/[name].[hash].js`
          },
          chunkFileNames: `assets/[name].[hash].js`,
          assetFileNames: `assets/[name].[hash].[ext]`,
        },
      },
    },
    base: basePath,
  }
})
// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// import { resolve } from 'path'

// export default defineConfig(({ mode }) => {
//   const isDev = mode === 'development'

//   return {
//     plugins: [react()],
//     resolve: {
//       alias: {
//         '@': resolve(__dirname, 'src'),
//       },
//     },
//     server: isDev
//       ? {
//           port: 3000,
//           proxy: {
//             '/api': {
//               target: 'http://localhost:8000',
//               changeOrigin: true,
//               rewrite: (path) => path.replace(/^\/api/, '/api'), // Не удаляем /api
//               configure: (proxy) => {
//                 // Логирование прокси-запросов
//                 proxy.on('proxyReq', (proxyReq) => {
//                   console.log('Proxy Request:', proxyReq.method, proxyReq.path)
//                 })
//                 proxy.on('proxyRes', (proxyRes) => {
//                   console.log('Proxy Response:', proxyRes.statusCode)
//                 })
//               },
//             },
//           },
//         }
//       : undefined,
//     build: {
//       // Путь относительно client/vite.config.js → api/backend/static/
//       outDir: resolve(__dirname, '../../api/backend/static'),
//       emptyOutDir: true, // Очищать папку перед сборкой
//     },
//     base: isDev ? '/' : '/static/', // В prod пути начинаются с /static/
//   }
// })

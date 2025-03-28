import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'), // можете использовать '@' 'src'
    },
  },
  // server: {
  //   proxy: {
  //     '/api': {
  //       target: 'http://127.0.0.1:5000',
  //       changeOrigin: true,
  //       rewrite: (path) => path.replace(/^\/api/, ''),
  //     },
  //   },
  // },
})


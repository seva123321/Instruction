import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'

import App from '@/App'

import store from './slices'

import '@/index.css'

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    const swUrl = import.meta.env.DEV ? '/sw.js' : '/static/sw.js'

    window.addEventListener('load', () => {
      navigator.serviceWorker.register(swUrl).then((registration) => {
        if (import.meta.env.DEV) {
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            newWorker.addEventListener('statechange', () => {
              if (
                newWorker.state === 'installed' &&
                navigator.serviceWorker.controller
              ) {
                window.location.reload()
              }
            })
          })
        }
      })
    })
  }
}

// Утилиты для отладки в разработке
if (import.meta.env.DEV) {
  window.debugSW = {
    unregister: async () => {
      const registrations = await navigator.serviceWorker.getRegistrations()
      await Promise.all(registrations.map((reg) => reg.unregister()))
      console.log('SW unregistered')
      window.location.reload()
    },
    clearCache: async () => {
      const keys = await caches.keys()
      await Promise.all(keys.map((key) => caches.delete(key)))
      console.log('Cache cleared')
    },
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Provider store={store}>
        <App />
      </Provider>
    </BrowserRouter>
  </StrictMode>
)

// Регистрируем SW после рендера приложения
registerServiceWorker()

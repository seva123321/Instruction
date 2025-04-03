/***************************************************** */
// Отключение кеширования в dev-режиме
// const isDev = self.location.hostname === 'localhost'

// self.addEventListener('fetch', (event) => {
//   if (isDev) {
//     // Пропускаем HMR и API запросы
//     if (
//       event.request.url.includes('@vite') ||
//       event.request.url.includes('/api/')
//     ) {
//       return fetch(event.request)
//     }

//     // Для навигации - всегда сеть, с fallback
//     if (event.request.mode === 'navigate') {
//       event.respondWith(
//         fetch(event.request).catch(() => caches.match('/index.html'))
//       )
//       return
//     }
//   }

//   // Остальная логика...
// })

/***************************************************** */

const CACHE_NAME = 'auth-cache-v5'
const API_CACHE = 'api-cache-v5'
const DB_NAME = 'TestsOfflineDB'
const DB_VERSION = 3
const isDev = self.location.hostname === 'localhost'

// Улучшенный менеджер IndexedDB
const idb = {
  db: null,

  async connect() {
    if (this.db) return this.db

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = (event) => {
        console.error('IDB open error:', event.target.error)
        reject(event.target.error)
      }

      request.onsuccess = (event) => {
        this.db = event.target.result
        resolve(this.db)
      }

      request.onupgradeneeded = (event) => {
        const db = event.target.result
        ;['testsContent', 'tests', 'pendingResults'].forEach((storeName) => {
          if (!db.objectStoreNames.contains(storeName)) {
            db.createObjectStore(storeName, { keyPath: 'id' })
          }
        })
      }
    })
  },

  async getTest(id) {
    try {
      const db = await this.connect()
      const tx = db.transaction(['testsContent', 'tests'], 'readonly')

      return new Promise((resolve) => {
        const contentStore = tx.objectStore('testsContent')
        const request = contentStore.get(Number(id))

        request.onsuccess = () => {
          if (request.result) {
            resolve(request.result)
          } else {
            const testsStore = tx.objectStore('tests')
            testsStore.get(Number(id)).onsuccess = (e) =>
              resolve(e.target.result)
          }
        }

        request.onerror = () => resolve(null)
      })
    } catch (e) {
      console.error('IDB getTest error:', e)
      return null
    }
  },

  async savePendingResult(data) {
    try {
      const db = await this.connect()
      const tx = db.transaction('pendingResults', 'readwrite')
      const store = tx.objectStore('pendingResults')

      return new Promise((resolve, reject) => {
        const record = {
          ...data,
          id: Date.now(),
          status: 'pending',
        }

        const request = store.put(record)
        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      })
    } catch (e) {
      console.error('IDB save error:', e)
      throw e
    }
  },
}

// Установка и кэширование
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      const cacheUrls = [
        isDev ? '/' : '/static/',
        isDev ? '/index.html' : '/static/index.html',
        '/manifest.json',
        '/logo.png',
        '/static/js/main.js',
        '/static/css/main.css',
      ].filter(Boolean)

      return cache
        .addAll(
          cacheUrls.map(
            (url) =>
              new Request(url, {
                cache: 'reload',
                credentials: 'same-origin',
              })
          )
        )
        .catch((e) => {
          console.warn('Cache preload failed:', e)
        })
    })
  )
  self.skipWaiting()
})

// Активация
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches
        .keys()
        .then((keys) =>
          Promise.all(
            keys.map((key) =>
              key !== CACHE_NAME && key !== API_CACHE
                ? caches.delete(key)
                : null
            )
          )
        ),
      idb.connect().catch((e) => console.error('IDB init error:', e)),
      self.clients.claim(),
    ])
  )
})

// Обработка fetch
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Навигационные запросы
  // if (request.mode === 'navigate') {
  //   event.respondWith(
  //     caches
  //       .match(isDev ? '/' : '/static/')
  //       .then((cached) => cached || fetch(request))
  //       .catch(() => caches.match(isDev ? '/' : '/static/'))
  //   )
  //   return
  // }

  // Универсальный обработчик навигации
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        // Для dev и prod используем разные fallback-страницы
        const fallbackPage = isDev ? '/index.html' : '/static/index.html'

        try {
          // Сначала пробуем сеть
          const networkResponse = await fetch(request)
          if (networkResponse.ok) return networkResponse
        } catch (e) {}

        // Пробуем кеш
        const cached = await caches.match(fallbackPage)
        if (cached) return cached

        // Крайний fallback
        return new Response('Offline Page', {
          status: 200,
          headers: { 'Content-Type': 'text/html' },
        })
      })()
    )
    return
  }

  // API тестов
  if (url.pathname.startsWith('/api/tests/') && request.method === 'GET') {
    event.respondWith(handleTestRequest(event))
    return
  }

  // API результатов
  if (
    url.pathname.startsWith('/api/test_result/') &&
    request.method === 'POST'
  ) {
    event.respondWith(handleTestResultRequest(event))
    return
  }

  // Статические ресурсы
  event.respondWith(
    caches
      .match(request)
      .then((cached) => cached || fetch(request))
      .catch(() => caches.match(isDev ? '/' : '/static/'))
  )
})

async function handleTestRequest(event) {
  try {
    // Сначала пробуем сеть (если онлайн)
    if (navigator.onLine) {
      const networkResponse = await fetch(event.request)

      // Кешируем успешные ответы
      if (networkResponse.ok) {
        const cache = await caches.open(API_CACHE)
        await cache.put(event.request, networkResponse.clone())
      }
      return networkResponse
    }

    // Оффлайн-режим: пробуем кеш и IndexedDB
    return await getFromCacheOrIDB(event)
  } catch (error) {
    // Фолбэк на кеш/IDB при ошибках сети
    return getFromCacheOrIDB(event)
  }
}

async function getFromCacheOrIDB(event) {
  const url = new URL(event.request.url)

  // 1. Пробуем кеш API
  const cachedApiResponse = await caches.match(event.request)
  if (cachedApiResponse) return cachedApiResponse

  // 2. Для API тестов пробуем IndexedDB
  if (url.pathname.startsWith('/api/tests/')) {
    const testId = url.pathname.split('/').pop()
    const test = await idb.getTest(testId)

    if (test) {
      return new Response(JSON.stringify(test), {
        headers: { 'Content-Type': 'application/json' },
      })
    }
  }

  // 3. Фолбэк для других запросов
  return Response.error()
}
async function handleTestResultRequest(event) {
  if (!navigator.onLine) {
    try {
      const resultData = await event.request.clone().json()
      await idb.savePendingResult(resultData)
      return new Response(
        JSON.stringify({ message: 'Result saved for sync' }),
        { status: 202, headers: { 'Content-Type': 'application/json' } }
      )
    } catch (e) {
      console.error('Offline save error:', e)
      return Response.error()
    }
  }

  try {
    return await fetch(event.request)
  } catch (error) {
    return Response.error()
  }
}

// Фоновая синхронизация
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-pending-results') {
    event.waitUntil(syncPendingResults())
  }
})

async function syncPendingResults() {
  try {
    const db = await idb.connect()
    const tx = db.transaction('pendingResults', 'readwrite')
    const store = tx.objectStore('pendingResults')
    const results = await new Promise((resolve) => {
      const request = store.getAll()
      request.onsuccess = () => resolve(request.result || [])
      request.onerror = () => resolve([])
    })

    for (const result of results) {
      try {
        const response = await fetch('/api/test_result/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(result.data),
          credentials: 'include',
        })

        if (response.ok) {
          await new Promise((resolve) => {
            const deleteRequest = store.delete(result.id)
            deleteRequest.onsuccess = () => resolve()
            deleteRequest.onerror = () => resolve()
          })
        }
      } catch (error) {
        console.error('Sync error for result:', result.id, error)
      }
    }
  } catch (e) {
    console.error('Sync failed:', e)
  }
}

// const CACHE_NAME = 'auth-cache-v1'
// const API_CACHE = 'api-cache-v1'
// const isDev = self.location.hostname === 'localhost'
// const DB_NAME = 'TestsOfflineDB'

// self.addEventListener('install', (event) => {
//   event.waitUntil(
//     caches.open(CACHE_NAME).then((cache) => {
//       return cache.addAll([
//         isDev ? '/' : '/static/',
//         isDev ? '/index.html' : '/static/index.html',
//         '/static/manifest.json',
//         '/static/logo.png',
//       ])
//     })
//   )
//   self.skipWaiting()
// })

// self.addEventListener('fetch', (event) => {
//   const { request } = event
//   const url = new URL(request.url)

//   // Навигационные запросы
//   if (request.mode === 'navigate') {
//     event.respondWith(handleNavigationRequest(event))
//     return
//   }

//   // API запросы для тестов
//   if (url.pathname.startsWith('/api/tests/') && !navigator.onLine) {
//     event.respondWith(handleTestRequestOffline(event))
//     return
//   }

//   // Статические ресурсы
//   event.respondWith(
//     caches.match(request).then((cached) => cached || fetch(request))
//   )
// })

// async function handleTestRequestOffline(event) {
//   const url = new URL(event.request.url)
//   const testId = url.pathname.split('/').pop()

//   try {
//     // Эмулируем ответ API, который будет обработан клиентским кодом
//     return new Response(
//       JSON.stringify({
//         offline: true,
//         testId,
//       }),
//       {
//         headers: { 'Content-Type': 'application/json' },
//       }
//     )
//   } catch (error) {
//     return new Response(
//       JSON.stringify({ error: 'Failed to process offline request' }),
//       { status: 500, headers: { 'Content-Type': 'application/json' } }
//     )
//   }
// }

// async function handleNavigationRequest(event) {
//   try {
//     const cached = await caches.match(event.request)
//     return cached || fetch(event.request)
//   } catch (error) {
//     return fetch(event.request)
//   }
// }

//   // if (url.pathname.startsWith('/api/tests/') && !navigator.onLine) {
//   //   const testId = url.pathname.split('/').pop()
//   //   console.log('Trying to serve test from IndexedDB:', testId)

//   //   event.respondWith(
//   //     new Promise(async (resolve) => {
//   //       try {
//   //         // Пробуем получить из IndexedDB
//   //         const db = await openDB('TestsOfflineDB')
//   //         let test = await db.get('testsContent', testId)
//   //         if (!test) test = await db.get('tests', testId)

//   //         if (test) {
//   //           console.log('Serving test from IndexedDB')
//   //           resolve(
//   //             new Response(JSON.stringify(test), {
//   //               headers: { 'Content-Type': 'application/json' },
//   //             })
//   //           )
//   //         } else {
//   //           console.log('Test not found in IndexedDB')
//   //           resolve(Response.error())
//   //         }
//   //       } catch (e) {
//   //         console.error('IndexedDB access error:', e)
//   //         resolve(Response.error())
//   //       }
//   //     })
//   //   )
//   //   return
//   // }
// // })

// async function handleTestRequest(event) {
//   const cache = await caches.open(API_CACHE)
//   const cachedResponse = await cache.match(event.request)

//   // Если оффлайн - пытаемся получить из IndexedDB
//   if (!navigator.onLine) {
//     try {
//       const testId = event.request.url.split('/').pop()
//       const test = await getTestFromIDB(testId)
//       if (test) {
//         return new Response(JSON.stringify(test), {
//           headers: { 'Content-Type': 'application/json' },
//         })
//       }
//     } catch (e) {
//       console.error('IDB access error:', e)
//     }
//   }

//   try {
//     const networkResponse = await fetch(event.request)
//     if (networkResponse.ok) {
//       const clone = networkResponse.clone()
//       cache.put(event.request, clone)
//     }
//     return networkResponse
//   } catch (error) {
//     return cachedResponse || Response.error()
//   }
// }

// // Вспомогательная функция для доступа к IndexedDB из Service Worker
// async function getTestFromIDB(testId) {
//   return new Promise((resolve) => {
//     const request = indexedDB.open(DB_NAME)
//     request.onsuccess = (e) => {
//       const db = e.target.result
//       const tx = db.transaction(['testsContent', 'tests'], 'readonly')
//       const store = tx.objectStore('testsContent')
//       const getReq = store.get(testId)

//       getReq.onsuccess = () => {
//         if (getReq.result) {
//           resolve(getReq.result)
//         } else {
//           // Пробуем основное хранилище
//           const fallbackStore = tx.objectStore('tests')
//           const fallbackReq = fallbackStore.get(testId)
//           fallbackReq.onsuccess = () => resolve(fallbackReq.result)
//         }
//       }

//       getReq.onerror = () => resolve(null)
//     }
//     request.onerror = () => resolve(null)
//   })
// }

// async function handleNavigationRequest(event) {
//   try {
//     // Важно: credentials: 'include' для передачи cookies
//     const networkResponse = await fetch(event.request, {
//       credentials: 'include',
//     })
//     return networkResponse
//   } catch (error) {
//     const cached = await caches.match(isDev ? '/' : '/static/')
//     return cached || Response.error()
//   }
// }

// async function handleApiRequest(event) {
//   const cache = await caches.open(API_CACHE)
//   const cachedResponse = await cache.match(event.request)

//   if (event.request.method !== 'GET') {
//     return fetch(event.request, { credentials: 'include' })
//   }

//   try {
//     // Всегда пытаемся получить свежие данные с сервера
//     const networkResponse = await fetch(event.request, {
//       credentials: 'include', // Важно для передачи cookies
//     })

//     // Кешируем только успешные ответы
//     if (networkResponse.ok) {
//       const clone = networkResponse.clone()
//       cache.put(event.request, clone)
//     }

//     return networkResponse
//   } catch (error) {
//     // В offline-режиме возвращаем закешированный ответ
//     if (cachedResponse) {
//       return cachedResponse
//     }
//     return new Response(JSON.stringify({ error: 'Offline' }), {
//       status: 503,
//       headers: { 'Content-Type': 'application/json' },
//     })
//   }
// }

// self.addEventListener('activate', (event) => {
//   event.waitUntil(
//     caches
//       .keys()
//       .then((keys) => {
//         return Promise.all(
//           keys.map((key) =>
//             key !== CACHE_NAME && key !== API_CACHE ? caches.delete(key) : null
//           )
//         )
//       })
//       .then(() => self.clients.claim())
//   )
// })

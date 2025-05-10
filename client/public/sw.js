const CACHE_NAME = 'auth-cache-v5'
const API_CACHE = 'api-cache-v5'
const DB_NAME = 'TestsOfflineDB'
const DB_VERSION = 3
const isDev = self.location.hostname === 'localhost'

// Добавьте путь к оффлайн-странице
const OFFLINE_PAGE = isDev ? '/offline.html' : '/static/offline.html'

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
        OFFLINE_PAGE, // Добавляем оффлайн-страницу в кеш
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
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          // Сначала пробуем сеть
          const networkResponse = await fetch(request)
          if (networkResponse.ok) return networkResponse
        } catch (e) {}

        // Пробуем кеш
        const cached = await caches.match(request)
        if (cached) return cached

        // Если страница не найдена, возвращаем оффлайн-страницу
        return caches.match(OFFLINE_PAGE)
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

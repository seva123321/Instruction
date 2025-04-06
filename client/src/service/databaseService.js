import { openDB } from 'idb'

import { initDB, getDB, DB_NAME, deleteDatabase, closeDB } from './offlineDB'

const RESULTS_DB_NAME = 'TestResultsDB'
const RESULTS_DB_VERSION = 1

let resultsDbInstance = null
let isInitializing = false

const getResultsDB = async () => {
  if (resultsDbInstance) return resultsDbInstance

  try {
    resultsDbInstance = await openDB(RESULTS_DB_NAME, RESULTS_DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('results')) {
          const store = db.createObjectStore('results', { keyPath: 'id' })
          store.createIndex('by_test', 'test', { unique: false })
        }
        if (!db.objectStoreNames.contains('pendingResults')) {
          db.createObjectStore('pendingResults', { keyPath: 'id' })
        }
      },
    })
    return resultsDbInstance
  } catch (e) {
    console.error('Failed to open results DB:', e)
    resultsDbInstance = null
    throw e
  }
}

export const closeAllDBConnections = async () => {
  try {
    if (resultsDbInstance) {
      resultsDbInstance.close()
      resultsDbInstance = null
    }
    await closeDB()
  } catch (e) {
    console.error('Error closing DB connections:', e)
  }
}

export const initializeApplicationDatabases = async () => {
  if (isInitializing) {
    return false
  }

  isInitializing = true
  try {
    // Закрываем существующие соединения
    await closeAllDBConnections()

    // Инициализируем основную базу тестов
    try {
      await initDB()
    } catch (e) {
      console.error('Main DB init failed, recreating...', e)
      await deleteDatabase(DB_NAME)
      await initDB()
    }

    // Инициализируем базу результатов
    try {
      await getResultsDB()
    } catch (e) {
      console.error('Results DB init failed, recreating...', e)
      await deleteDatabase(RESULTS_DB_NAME)
      await getResultsDB()
    }

    return true
  } catch (e) {
    console.error('Database initialization error:', e)
    await closeAllDBConnections()
    throw new Error('Failed to initialize databases')
  } finally {
    isInitializing = false
  }
}

export const checkDatabasesReady = async () => {
  try {
    const db = await getDB().catch(() => null)
    const resultsDb = await getResultsDB().catch(() => null)
    return db !== null && resultsDb !== null
  } catch (e) {
    console.error('DB connection check failed:', e)
    return false
  }
}
// export const initializeApplicationDatabases = async () => {
//   try {
//     // Инициализация TestsOfflineDB
//     await initDB()

//     // Инициализация TestResultsDB
//     const resultsDB = await openDB('TestResultsDB', 1, {
//       upgrade(db) {
//         if (!db.objectStoreNames.contains('results')) {
//           const store = db.createObjectStore('results', { keyPath: 'id' })
//           store.createIndex('by_test', 'test', { unique: false })
//         }
//         if (!db.objectStoreNames.contains('pendingResults')) {
//           db.createObjectStore('pendingResults', { keyPath: 'id' })
//         }
//       },
//     })
//     resultsDB.close()

//     return true
//   } catch (e) {
//     console.error('Database initialization error:', e)
//     throw new Error('Failed to initialize application databases')
//   }
// }

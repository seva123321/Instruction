/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable implicit-arrow-linebreak */

import { useCallback } from 'react'
import { openDB } from 'idb'

import { usePostTestResultMutation } from '../slices/testApi'

const DB_NAME = 'TestResultsDB'
const DB_VERSION = 1

let dbInstance = null
let isInitializing = false

const initDB = async () => {
  if (dbInstance) return dbInstance
  if (isInitializing) {
    // Ждем завершения инициализации
    await new Promise((resolve) => setTimeout(resolve, 100))
    return initDB()
  }

  isInitializing = true
  try {
    dbInstance = await openDB(DB_NAME, DB_VERSION, {
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
    return dbInstance
  } catch (error) {
    console.error('Database initialization failed:', error)
    dbInstance = null
    throw error
  } finally {
    isInitializing = false
  }
}

const closeDB = () => {
  if (dbInstance) {
    dbInstance.close()
    dbInstance = null
  }
}

const useTestResults = () => {
  const [postTestResult] = usePostTestResultMutation()

  const withDB = useCallback(async (operation) => {
    let db
    try {
      db = await initDB()
      return await operation(db)
    } catch (error) {
      console.error('Database operation failed:', error)
      throw error
    }
  }, [])

  // Сохранение результатов в основное хранилище
  const saveResultsToDB = useCallback(
    (testResults) =>
      withDB(async (db) => {
        const tx = db.transaction('results', 'readwrite')
        const store = tx.objectStore('results')
        await store.put(testResults)
        await tx.done
        return testResults
      }),
    [withDB]
  )

  // Добавление в очередь для синхронизации
  const addPendingResult = useCallback(
    (testResults) =>
      withDB(async (db) => {
        if (!testResults || !testResults.test) {
          throw new Error('Invalid result data')
        }

        const tx = db.transaction('pendingResults', 'readwrite')
        const store = tx.objectStore('pendingResults')
        await store.put({
          ...testResults,
          id: `${testResults.test}-${Date.now()}`,
          attemptCount: 0,
        })
        await tx.done
      }),
    [withDB]
  )

  // Получение результатов теста
  const getTestResults = useCallback(
    (testId) =>
      withDB(async (db) => {
        const tx = db.transaction('results', 'readonly')
        const store = tx.objectStore('results')
        const index = store.index('by_test')
        const results = await index.getAll(testId)
        await tx.done
        return results
      }),
    [withDB]
  )

  // Синхронизация ожидающих результатов
  const syncPendingResults = useCallback(async () => {
    let db
    try {
      db = await initDB()
      const tx = db.transaction('pendingResults', 'readwrite')
      const store = tx.objectStore('pendingResults')
      const pendingResults = await store.getAll()

      const resultsToSync = pendingResults.filter((r) => !r.synced)

      for (const result of resultsToSync) {
        try {
          const serverData = {
            test: result.test,
            is_passed: result.is_passed,
            total_score: result.total_score,
            mark: result.mark,
            start_time: result.start_time,
            completion_time: result.completion_time,
            test_duration: result.test_duration,
            user_answers: result.user_answers,
          }

          await postTestResult(serverData).unwrap()
          await store.delete(result.id)
        } catch (error) {
          console.error('Failed to sync result:', error)
          await store.put({
            ...result,
            syncError: error.message,
            attemptCount: (result.attemptCount || 0) + 1,
          })
        }
      }

      await tx.done
      return resultsToSync.length
    } catch (error) {
      console.error('Sync transaction failed:', error)
      throw error
    }
  }, [postTestResult])

  // Основная функция сохранения результатов
  const saveTestResults = useCallback(
    async (testId, fullResults, serverResults) => {
      try {
        const resultsWithMeta = {
          ...fullResults,
          id: `${testId}-${Date.now()}`,
          synced: false,
          createdAt: new Date().toISOString(),
        }

        await saveResultsToDB(resultsWithMeta)

        if (navigator.onLine) {
          try {
            const response = await postTestResult(serverResults).unwrap()
            await saveResultsToDB({
              ...resultsWithMeta,
              ...response,
              synced: true,
            })
            return {
              ...resultsWithMeta,
              ...response,
              synced: true,
            }
          } catch (error) {
            await addPendingResult(serverResults)
            return resultsWithMeta
          }
        } else {
          await addPendingResult(serverResults)
          return resultsWithMeta
        }
      } catch (error) {
        console.error('Complete save failure:', error)
        throw new Error('Не удалось сохранить результаты теста')
      }
    },
    [postTestResult, saveResultsToDB, addPendingResult]
  )

  return {
    saveTestResults,
    getTestResults,
    syncPendingResults,
    initializeDB: initDB,
    closeDB,
  }
}

export default useTestResults

// import { useCallback } from 'react'
// import { openDB } from 'idb'

// import { usePostTestResultMutation } from '../slices/testApi'

// const DB_NAME = 'TestResultsDB'
// const DB_VERSION = 1

// let dbInstance = null

// const initDB = async () => {
//   if (dbInstance) return dbInstance

//   try {
//     dbInstance = await openDB(DB_NAME, DB_VERSION, {
//       upgrade(db) {
//         if (!db.objectStoreNames.contains('results')) {
//           const store = db.createObjectStore('results', { keyPath: 'id' })
//           store.createIndex('by_test_id', 'test_id', { unique: false })
//         }
//         if (!db.objectStoreNames.contains('pendingResults')) {
//           db.createObjectStore('pendingResults', { keyPath: 'id' })
//         }
//       },
//     })
//     return dbInstance
//   } catch (error) {
//     console.error('DB initialization failed:', error)
//     dbInstance = null
//     throw error
//   }
// }

// const useTestResults = () => {
//   const [postTestResult] = usePostTestResultMutation()

//   const withDB = useCallback(async (operation) => {
//     const db = await initDB()
//     try {
//       return await operation(db)
//     } catch (error) {
//       if (error.name === 'AbortError') {
//         console.warn('Connection aborted, retrying...')
//         dbInstance = null
//         const freshDB = await initDB()
//         return await operation(freshDB)
//       }
//       throw error
//     }
//   }, [])

//   const saveResultsToDB = useCallback(
//     async (testResults) =>
//       withDB(async (db) => {
//         const tx = db.transaction('results', 'readwrite')
//         await tx.store.put(testResults)
//         await tx.done
//         return testResults
//       }),
//     [withDB]
//   )

//   const addPendingResult = useCallback(
//     async (testResults) =>
//       withDB(async (db) => {
//         const tx = db.transaction('pendingResults', 'readwrite')
//         await tx.store.put(testResults)
//         await tx.done
//         return testResults
//       }),
//     [withDB]
//   )

//   const syncPendingResults = useCallback(
//     async () =>
//       withDB(async (db) => {
//         const tx = db.transaction('pendingResults', 'readwrite')
//         const pendingResults = await tx.store.getAll()

//         const syncedResults = []
//         for (const result of pendingResults) {
//           try {
//             const response = await postTestResult(result).unwrap()
//             await saveResultsToDB(response)
//             await tx.store.delete(result.id)
//             syncedResults.push(response)
//           } catch (error) {
//             console.error('Sync failed for result:', result.id, error)
//           }
//         }

//         await tx.done
//         return syncedResults
//       }),
//     [withDB, postTestResult, saveResultsToDB]
//   )

//   const getTestResults = useCallback(
//     async (testId) =>
//       withDB(async (db) => {
//         try {
//           const tx = db.transaction('results', 'readonly')
//           const results = await tx.store.index('by_test_id').getAll(testId)
//           await tx.done
//           return results
//         } catch (error) {
//           console.warn('Index query failed, using fallback:', error)
//           const tx = db.transaction('results', 'readonly')
//           const allResults = await tx.store.getAll()
//           await tx.done
//           return allResults.filter((r) => r.test_id === testId)
//         }
//       }),
//     [withDB]
//   )

//   const saveTestResults = useCallback(
//     async (testId, results, startTime) => {
//       const testResults = {
//         ...results,
//         id: `${testId}-${Date.now()}`,
//         test_id: testId,
//         start_time: new Date(startTime).toISOString(),
//         completion_time: new Date().toISOString(),
//         test_duration: Math.floor((new Date() - new Date(startTime)) / 1000),
//         synced: navigator.onLine,
//       }

//       console.log('Attempting to save:', testResults) // Логирование

//       try {
//         if (navigator.onLine) {
//           try {
//             console.log('Trying online save...')
//             const response = await postTestResult(testResults).unwrap()
//             const completeResults = {
//               ...testResults,
//               ...response,
//               synced: true,
//             }
//             await saveResultsToDB(completeResults)
//             console.log('Successfully saved online and to DB')
//             return completeResults
//           } catch (onlineError) {
//             console.warn('Online save failed, saving as pending:', onlineError)
//             await addPendingResult(testResults)
//             await saveResultsToDB(testResults)
//             return testResults
//           }
//         } else {
//           console.log('Offline mode - saving locally')
//           await addPendingResult(testResults)
//           await saveResultsToDB(testResults)
//           return testResults
//         }
//       } catch (error) {
//         console.error('Complete save failure:', error)
//         throw error
//       }
//     },
//     [postTestResult, saveResultsToDB, addPendingResult]
//   )

//   return {
//     saveTestResults,
//     getTestResults,
//     syncPendingResults,
//   }
// }

// export default useTestResults

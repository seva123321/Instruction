/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable implicit-arrow-linebreak */

import { useCallback } from 'react'
import { openDB } from 'idb'

import { usePostTestResultMutation } from '../slices/testApi'

const DB_NAME = 'TestResultsDB'
const DB_VERSION = 1

let dbInstance = null

const initDB = async () => {
  if (dbInstance) return dbInstance

  try {
    dbInstance = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('results')) {
          const store = db.createObjectStore('results', { keyPath: 'id' })
          store.createIndex('by_test_id', 'test_id', { unique: false })
        }
        if (!db.objectStoreNames.contains('pendingResults')) {
          db.createObjectStore('pendingResults', { keyPath: 'id' })
        }
      },
    })
    return dbInstance
  } catch (error) {
    dbInstance = null
    throw error
  }
}

const useTestResults = () => {
  const [postTestResult] = usePostTestResultMutation()

  const withDB = useCallback(async (operation) => {
    const db = await initDB()
    try {
      return operation(db)
    } catch (error) {
      if (error.name === 'AbortError') {
        dbInstance = null
        const freshDB = await initDB()
        return operation(freshDB)
      }
      throw error
    }
  }, [])

  const saveResultsToDB = useCallback(
    (testResults) =>
      withDB(async (db) => {
        const tx = db.transaction('results', 'readwrite')
        await tx.store.put(testResults)
        await tx.done
        return testResults
      }),
    [withDB]
  )

  const addPendingResult = useCallback(
    (testResults) =>
      withDB(async (db) => {
        const tx = db.transaction('pendingResults', 'readwrite')
        await tx.store.put(testResults)
        await tx.done
        return testResults
      }),
    [withDB]
  )

  const syncPendingResults = useCallback(
    () =>
      withDB(async (db) => {
        const tx = db.transaction('pendingResults', 'readwrite')
        const pendingResults = await tx.store.getAll()

        const syncPromises = pendingResults.map(async (result) => {
          try {
            const response = await postTestResult(result).unwrap()
            await saveResultsToDB(response)
            await tx.store.delete(result.id)
            return response
          } catch (error) {
            return null
          }
        })

        const syncedResults = (await Promise.all(syncPromises)).filter(Boolean)
        await tx.done
        return syncedResults
      }),
    [withDB, postTestResult, saveResultsToDB]
  )

  const getTestResults = useCallback(
    (testId) =>
      withDB(async (db) => {
        try {
          const tx = db.transaction('results', 'readonly')
          const results = await tx.store.index('by_test_id').getAll(testId)
          await tx.done
          return results
        } catch (error) {
          const tx = db.transaction('results', 'readonly')
          const allResults = await tx.store.getAll()
          await tx.done
          return allResults.filter((r) => r.test_id === testId)
        }
      }),
    [withDB]
  )

  const saveTestResults = useCallback(
    async (testId, results, startTime) => {
      const testResults = {
        ...results,
        id: `${testId}-${Date.now()}`,
        test_id: testId,
        start_time: new Date(startTime).toISOString(),
        completion_time: new Date().toISOString(),
        test_duration: Math.floor((new Date() - new Date(startTime)) / 1000),
        synced: navigator.onLine,
      }

      if (navigator.onLine) {
        try {
          const response = await postTestResult(testResults).unwrap()
          const completeResults = {
            ...testResults,
            ...response,
            synced: true,
          }
          await saveResultsToDB(completeResults)
          return completeResults
        } catch (onlineError) {
          await addPendingResult(testResults)
          await saveResultsToDB(testResults)
          return testResults
        }
      }
      await addPendingResult(testResults)
      await saveResultsToDB(testResults)
      return testResults
    },
    [postTestResult, saveResultsToDB, addPendingResult]
  )

  return {
    saveTestResults,
    getTestResults,
    syncPendingResults,
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

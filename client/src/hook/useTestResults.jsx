/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable implicit-arrow-linebreak */

import { useCallback } from 'react'
import { openDB } from 'idb'

import { usePostTestResultMutation } from '@/slices/testApi'

const DB_NAME = 'TestResultsDB'
const DB_VERSION = 1

let dbInstance = null
let isInitializing = false

const initDB = async () => {
  if (dbInstance) return dbInstance
  if (isInitializing) {
    // Ждем завершения инициализации
    await new Promise((resolve) => {
      setTimeout(resolve, 100)
    })
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
    const db = await initDB()
    const value = await operation(db)
    return value
  }, [])

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

  const syncPendingResults = useCallback(async () => {
    const db = await initDB()

    const pendingTx = db.transaction('pendingResults', 'readonly')
    const pendingResults = await pendingTx
      .objectStore('pendingResults')
      .getAll()
    await pendingTx.done

    let successCount = 0
    let failedCount = 0

    const syncResults = await Promise.all(
      pendingResults.map(async (pendingResult) => {
        try {
          const { id, attemptCount, lastAttempt, syncError, ...serverData } =
            pendingResult
          await postTestResult(serverData).unwrap()

          const resultsTx = db.transaction('results', 'readwrite')
          const resultsStore = resultsTx.objectStore('results')
          const index = resultsStore.index('by_test')

          const testResults = await index.getAll(pendingResult.test)
          const resultToDelete = testResults.find(
            (result) =>
              result.test === pendingResult.test &&
              result.id.includes(pendingResult.test)
          )

          if (resultToDelete) {
            const deleteTx = db.transaction(
              ['pendingResults', 'results'],
              'readwrite'
            )

            await Promise.all([
              deleteTx.objectStore('pendingResults').delete(pendingResult.id),
              deleteTx.objectStore('results').delete(resultToDelete.id),
            ])
            await deleteTx.done
          } else {
            const deleteTx = db.transaction('pendingResults', 'readwrite')
            await deleteTx
              .objectStore('pendingResults')
              .delete(pendingResult.id)
            await deleteTx.done
          }

          return { success: true }
        } catch (error) {
          const updateTx = db.transaction('pendingResults', 'readwrite')
          await updateTx.objectStore('pendingResults').put({
            ...pendingResult,
            syncError: error.message,
            attemptCount: (pendingResult.attemptCount || 0) + 1,
            lastAttempt: new Date().toISOString(),
          })
          await updateTx.done

          return { success: false }
        }
      })
    )

    successCount = syncResults.filter((r) => r.success).length
    failedCount = syncResults.filter((r) => !r.success).length

    return {
      total: pendingResults.length,
      success: successCount,
      failed: failedCount,
    }
  }, [postTestResult])

  const saveTestResults = useCallback(
    async (testId, fullResults, serverResults) => {
      const timestamp = Date.now()
      const resultId = `${testId}-${timestamp}`

      const resultsWithMeta = {
        ...fullResults,
        id: resultId,
        createdAt: new Date(timestamp).toISOString(),
      }

      try {
        const resultToSync = {
          ...serverResults,
          id: resultId,
          createdAt: resultsWithMeta.createdAt,
          attemptCount: 0,
        }

        if (navigator.onLine) {
          try {
            const response = await postTestResult(serverResults).unwrap()
            return {
              ...resultsWithMeta,
              ...response,
            }
          } catch (error) {
            await addPendingResult(resultToSync)
            return resultsWithMeta
          }
        } else {
          await addPendingResult(resultToSync)
          return resultsWithMeta
        }
      } catch (error) {
        throw new Error('Не удалось сохранить результаты теста')
      }
    },
    [postTestResult, addPendingResult]
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

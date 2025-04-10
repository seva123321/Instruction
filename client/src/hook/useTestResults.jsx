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

  // const saveResultsToDB = useCallback(
  //   (testResults) =>
  //     withDB(async (db) => {
  //       const tx = db.transaction('results', 'readwrite')
  //       const store = tx.objectStore('results')
  //       await store.put(testResults)
  //       await tx.done
  //       return testResults
  //     }),
  //   [withDB]
  // )

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

  // const getTestResults = useCallback(
  //   (testId) =>
  //     withDB(async (db) => {
  //       const pendingTx = db.transaction('pendingResults', 'readonly')
  //       const store = pendingTx.objectStore('pendingResults')

  //       // Получаем все записи и фильтруем их по testId
  //       const allResults = await store.getAll()
  //       await pendingTx.done

  //       // Фильтруем результаты, где ключ начинается с testId
  //       return allResults
  //         .filter((result) => result.id.startsWith(`${testId}-`))
  //         .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  //     }),
  //   [withDB]
  // )
  // @TODO рабочая версия
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

// import { useCallback } from 'react'
// import { openDB } from 'idb'

// import { usePostTestResultMutation } from '../slices/testApi'

// const DB_NAME = 'TestResultsDB'
// const DB_VERSION = 1

// let dbInstance = null
// let isInitializing = false

// const initDB = async () => {
//   if (dbInstance) return dbInstance
//   if (isInitializing) {
//     // Ждем завершения инициализации
//     await new Promise((resolve) => setTimeout(resolve, 100))
//     return initDB()
//   }

//   isInitializing = true
//   try {
//     dbInstance = await openDB(DB_NAME, DB_VERSION, {
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
//     return dbInstance
//   } catch (error) {
//     console.error('Database initialization failed:', error)
//     dbInstance = null
//     throw error
//   } finally {
//     isInitializing = false
//   }
// }

// const closeDB = () => {
//   if (dbInstance) {
//     dbInstance.close()
//     dbInstance = null
//   }
// }

// const useTestResults = () => {
//   const [postTestResult] = usePostTestResultMutation()

//   const withDB = useCallback(async (operation) => {
//     let db
//     try {
//       db = await initDB()
//       return await operation(db)
//     } catch (error) {
//       console.error('Database operation failed:', error)
//       throw error
//     }
//   }, [])

//   // Сохранение результатов в основное хранилище
//   const saveResultsToDB = useCallback(
//     (testResults) =>
//       withDB(async (db) => {
//         const tx = db.transaction('results', 'readwrite')
//         const store = tx.objectStore('results')
//         await store.put(testResults)
//         await tx.done
//         return testResults
//       }),
//     [withDB]
//   )

//   // Добавление в очередь для синхронизации
//   const addPendingResult = useCallback(
//     (testResults) =>
//       withDB(async (db) => {
//         if (!testResults || !testResults.test) {
//           throw new Error('Invalid result data')
//         }

//         const tx = db.transaction('pendingResults', 'readwrite')
//         const store = tx.objectStore('pendingResults')
//         await store.put({
//           ...testResults,
//           id: `${testResults.test}-${Date.now()}`,
//           attemptCount: 0,
//         })
//         await tx.done
//       }),
//     [withDB]
//   )

//   // Получение результатов теста
//   const getTestResults = useCallback(
//     (testId) =>
//       withDB(async (db) => {
//         const tx = db.transaction('results', 'readonly')
//         const store = tx.objectStore('results')
//         const index = store.index('by_test')
//         const results = await index.getAll(testId)
//         await tx.done
//         return results
//       }),
//     [withDB]
//   )

//   const syncPendingResults = useCallback(async () => {
//     try {
//       const db = await initDB()

//       // Получаем все pending результаты
//       const pendingTx = db.transaction('pendingResults', 'readonly')
//       const pendingResults = await pendingTx
//         .objectStore('pendingResults')
//         .getAll()
//       await pendingTx.done

//       let successCount = 0
//       let failedCount = 0

//       for (const pendingResult of pendingResults) {
//         try {
//           // Отправляем на сервер (без метаданных)
//           const { id, attemptCount, lastAttempt, syncError, ...serverData } =
//             pendingResult
//           await postTestResult(serverData).unwrap()

//           // Находим соответствующий результат в основном хранилище
//           const resultsTx = db.transaction('results', 'readwrite')
//           const resultsStore = resultsTx.objectStore('results')
//           const index = resultsStore.index('by_test')

//           // Ищем все результаты для этого теста
//           const testResults = await index.getAll(pendingResult.test)

//           // Находим результат с таким же test и похожим timestamp в ID
//           const resultToDelete = testResults.find(
//             (result) =>
//               result.test === pendingResult.test &&
//               result.id.includes(pendingResult.test)
//           )

//           if (resultToDelete) {
//             // Удаляем из обоих хранилищ
//             const deleteTx = db.transaction(
//               ['pendingResults', 'results'],
//               'readwrite'
//             )

//             await deleteTx
//               .objectStore('pendingResults')
//               .delete(pendingResult.id)
//             await deleteTx.objectStore('results').delete(resultToDelete.id)
//             await deleteTx.done
//           } else {
//             // Если не нашли в results, удаляем только из pending
//             const deleteTx = db.transaction('pendingResults', 'readwrite')
//             await deleteTx
//               .objectStore('pendingResults')
//               .delete(pendingResult.id)
//             await deleteTx.done
//           }

//           successCount++
//         } catch (error) {
//           console.error(`Failed to sync result ${pendingResult.id}:`, error)

//           // Обновляем счетчик попыток
//           const updateTx = db.transaction('pendingResults', 'readwrite')
//           await updateTx.objectStore('pendingResults').put({
//             ...pendingResult,
//             syncError: error.message,
//             attemptCount: (pendingResult.attemptCount || 0) + 1,
//             lastAttempt: new Date().toISOString(),
//           })
//           await updateTx.done

//           failedCount++
//         }
//       }

//       return {
//         total: pendingResults.length,
//         success: successCount,
//         failed: failedCount,
//       }
//     } catch (error) {
//       console.error('Sync failed:', error)
//       throw error
//     }
//   }, [postTestResult])

//   const saveTestResults = useCallback(
//     async (testId, fullResults, serverResults) => {
//       const timestamp = Date.now()
//       // Генерируем одинаковый ID для обоих хранилищ
//       const resultId = `${testId}-${timestamp}`

//       const resultsWithMeta = {
//         ...fullResults,
//         id: resultId,
//         createdAt: new Date(timestamp).toISOString(),
//       }

//       try {
//         // Сохраняем полные результаты в основное хранилище
//         // await saveResultsToDB(resultsWithMeta) //@TODO - может понадобиться

//         // Подготавливаем данные для сервера
//         const resultToSync = {
//           ...serverResults,
//           id: resultId, // Важно сохранять тот же ID
//           createdAt: resultsWithMeta.createdAt,
//           attemptCount: 0,
//         }

//         if (navigator.onLine) {
//           try {
//             const response = await postTestResult(serverResults).unwrap()
//             return {
//               ...resultsWithMeta,
//               ...response,
//             }
//           } catch (error) {
//             // При ошибке сохраняем в pending
//             await addPendingResult(resultToSync)
//             return resultsWithMeta
//           }
//         } else {
//           // Оффлайн - сразу в pending
//           await addPendingResult(resultToSync)
//           return resultsWithMeta
//         }
//       } catch (error) {
//         console.error('Save failed:', error)
//         throw new Error('Не удалось сохранить результаты теста')
//       }
//     },
//     [postTestResult, addPendingResult]
//   )
//   // const syncPendingResults = useCallback(async () => {
//   //   try {
//   //     const db = await initDB()
//   //     // Сначала получаем все ожидающие результаты в отдельной транзакции
//   //     const pendingResults = await db.getAll('pendingResults')

//   //     let successCount = 0
//   //     let failedCount = 0

//   //     // Синхронизируем каждый результат в отдельной транзакции
//   //     for (const result of pendingResults) {
//   //       try {
//   //         // Создаем новую транзакцию для каждого результата
//   //         const tx = db.transaction(['pendingResults', 'results'], 'readwrite')
//   //         const pendingStore = tx.objectStore('pendingResults')
//   //         const resultsStore = tx.objectStore('results')

//   //         try {
//   //           // Отправляем на сервер
//   //           await postTestResult(result).unwrap()

//   //           // Если успешно - удаляем из pending и results
//   //           await pendingStore.delete(result.id)
//   //           await resultsStore.delete(result.id)

//   //           await tx.done
//   //           successCount++
//   //         } catch (error) {
//   //           console.error(`Failed to sync result ${result.id}:`, error)

//   //           // Обновляем счетчик попыток
//   //           const updatedResult = {
//   //             ...result,
//   //             syncError: error.message,
//   //             attemptCount: (result.attemptCount || 0) + 1,
//   //             lastAttempt: new Date().toISOString(),
//   //           }

//   //           // Обновляем запись в хранилище
//   //           await pendingStore.put(updatedResult)
//   //           await tx.done
//   //           failedCount++
//   //         }
//   //       } catch (txError) {
//   //         console.error(`Transaction failed for result ${result.id}:`, txError)
//   //         failedCount++
//   //       }
//   //     }

//   //     return {
//   //       total: pendingResults.length,
//   //       success: successCount,
//   //       failed: failedCount,
//   //     }
//   //   } catch (error) {
//   //     console.error('Initialization failed:', error)
//   //     throw error
//   //   }
//   // }, [postTestResult])
//   // Синхронизация ожидающих результатов
//   // const syncPendingResults = useCallback(async () => {
//   //   let db
//   //   try {
//   //     db = await initDB()
//   //     const tx = db.transaction('pendingResults', 'readwrite')
//   //     const store = tx.objectStore('pendingResults')
//   //     const pendingResults = await store.getAll()
//   //         debugger
//   //     const resultsToSync = pendingResults.filter((r) => !r.synced)

//   //     for (const result of resultsToSync) {
//   //       try {
//   //         const serverData = {
//   //           test: result.test,
//   //           is_passed: result.is_passed,
//   //           total_score: result.total_score,
//   //           mark: result.mark,
//   //           start_time: result.start_time,
//   //           completion_time: result.completion_time,
//   //           test_duration: result.test_duration,
//   //           user_answers: result.user_answers,
//   //         }

//   //         await postTestResult(serverData).unwrap()
//   //         await store.delete(result.id)
//   //       } catch (error) {
//   //         console.error('Failed to sync result:', error)
//   //         await store.put({
//   //           ...result,
//   //           syncError: error.message,
//   //           attemptCount: (result.attemptCount || 0) + 1,
//   //         })
//   //       }
//   //     }

//   //     await tx.done
//   //     return resultsToSync.length
//   //   } catch (error) {
//   //     console.error('Sync transaction failed:', error)
//   //     throw error
//   //   }
//   // }, [postTestResult])

//   // Основная функция сохранения результатов
//   // const saveTestResults = useCallback(
//   //   async (testId, fullResults, serverResults) => {
//   //     try {
//   //       const resultsWithMeta = {
//   //         ...fullResults,
//   //         id: `${testId}-${Date.now()}`,
//   //         // synced: false,
//   //         createdAt: new Date().toISOString(),
//   //       }

//   //       await saveResultsToDB(resultsWithMeta)

//   //       if (navigator.onLine) {
//   //         try {
//   //           const response = await postTestResult(serverResults).unwrap()
//   //           await saveResultsToDB({
//   //             ...resultsWithMeta,
//   //             ...response,
//   //             // synced: true,
//   //           })
//   //           return {
//   //             ...resultsWithMeta,
//   //             ...response,
//   //             // synced: true,
//   //           }
//   //         } catch (error) {
//   //           await addPendingResult(serverResults)
//   //           return resultsWithMeta
//   //         }
//   //       } else {
//   //         await addPendingResult(serverResults)
//   //         return resultsWithMeta
//   //       }
//   //     } catch (error) {
//   //       console.error('Complete save failure:', error)
//   //       throw new Error('Не удалось сохранить результаты теста')
//   //     }
//   //   },
//   //   [postTestResult, saveResultsToDB, addPendingResult]
//   // )

//   return {
//     saveTestResults,
//     getTestResults,
//     syncPendingResults,
//     initializeDB: initDB,
//     closeDB,
//   }
// }

// export default useTestResults

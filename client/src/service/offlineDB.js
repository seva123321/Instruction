import { openDB, deleteDB } from 'idb'

const DB_NAME = 'TestsOfflineDB'
const DB_VERSION = 3
export const STORE_NAMES = {
  TESTS: 'tests',
  TESTS_CONTENT: 'testsContent',
}

let dbInstance = null
let isInitializing = false

export const getDB = async () => {
  if (dbInstance) return dbInstance

  if (isInitializing) {
    // Ждем завершения инициализации
    await new Promise((resolve) => setTimeout(resolve, 100))
    return getDB()
  }

  isInitializing = true
  try {
    dbInstance = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAMES.TESTS)) {
          db.createObjectStore(STORE_NAMES.TESTS, { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains(STORE_NAMES.TESTS_CONTENT)) {
          db.createObjectStore(STORE_NAMES.TESTS_CONTENT, { keyPath: 'id' })
        }
      },
    })
    return dbInstance
  } catch (e) {
    console.error('Failed to open DB:', e)
    dbInstance = null
    throw e
  } finally {
    isInitializing = false
  }
}

export const initDB = async () => {
  try {
    return await getDB()
  } catch (e) {
    console.error('DB initialization failed:', e)
    throw new Error(`Failed to initialize database: ${e.message}`)
  }
}

export const getTestsFromDB = async () => {
  try {
    const db = await getDB()
    const tx = db.transaction(STORE_NAMES.TESTS, 'readonly')
    const tests = await tx.store.getAll()
    await tx.done
    return tests
  } catch (e) {
    console.error('Failed to get tests from DB:', e)
    return []
  }
}

export const getTestFromDB = async (
  testId,
  storeName = STORE_NAMES.TESTS_CONTENT
) => {
  try {
    const db = await getDB()
    if (!db.objectStoreNames.contains(storeName)) {
      console.error(`Store ${storeName} does not exist`)
      return null
    }
    const tx = db.transaction(storeName, 'readonly')
    const test = await tx.store.get(testId)
    await tx.done
    return test
  } catch (e) {
    console.error(`Failed to get test ${testId} from ${storeName}:`, e)
    return null
  }
}

export const saveTestToDB = async (test, storeName = STORE_NAMES.TESTS) => {
  try {
    const db = await getDB()
    const tx = db.transaction(storeName, 'readwrite')
    await tx.store.put(test)
    await tx.done
    return true
  } catch (e) {
    console.error(`Failed to save test ${test.id}:`, e)
    throw e
  }
}

export const closeDB = () => {
  if (dbInstance) {
    dbInstance.close()
    dbInstance = null
  }
}

export const deleteDatabase = async (name) => {
  try {
    await deleteDB(name)
    console.log(`Database ${name} deleted successfully`)
  } catch (e) {
    console.error(`Failed to delete database ${name}:`, e)
    throw e
  }
}

export const deleteTestFromDB = async (
  testId,
  storeName = STORE_NAMES.TESTS
) => {
  try {
    const db = await getDB()
    const tx = db.transaction(storeName, 'readwrite')
    await tx.store.delete(testId)
    await tx.done
    return true
  } catch (e) {
    console.error(`Failed to delete test ${testId}:`, e)
    return false
  }
}

// Проверяет наличие теста в любом из хранилищ
export const isTestDownloaded = async (testId) => {
  try {
    const db = await getDB()
    const tx = db.transaction(
      [STORE_NAMES.TESTS, STORE_NAMES.TESTS_CONTENT],
      'readonly'
    )
    const [basicTest, fullTest] = await Promise.all([
      tx.objectStore(STORE_NAMES.TESTS).get(testId),
      tx.objectStore(STORE_NAMES.TESTS_CONTENT).get(testId),
    ])
    await tx.done
    return basicTest || fullTest || false
  } catch (e) {
    console.error('Check download status failed:', e)
    return false
  }
}

// Получает тест из любого доступного хранилища
export const getOfflineTest = async (testId) => {
  try {
    const db = await getDB()
    const tx = db.transaction(
      [STORE_NAMES.TESTS_CONTENT, STORE_NAMES.TESTS],
      'readonly'
    )
    const [fullTest, basicTest] = await Promise.all([
      tx.objectStore(STORE_NAMES.TESTS_CONTENT).get(testId),
      tx.objectStore(STORE_NAMES.TESTS).get(testId),
    ])
    await tx.done

    if (!fullTest && !basicTest) {
      throw new Error('TEST_NOT_FOUND')
    }

    return fullTest || basicTest
  } catch (e) {
    console.error('Get offline test failed:', e)
    throw e
  }
}
// import { openDB } from 'idb'

// const DB_NAME = 'TestsOfflineDB'
// const DB_VERSION = 3
// export const STORE_NAMES = {
//   TESTS: 'tests',
//   TESTS_CONTENT: 'testsContent',
// }

// // let dbPromise = null

// // export const getDB = async () => {
// //   if (!dbPromise) {
// //     dbPromise = openDB(DB_NAME, DB_VERSION, {
// //       upgrade(db) {
// //         if (!db.objectStoreNames.contains(STORE_NAMES.TESTS)) {
// //           db.createObjectStore(STORE_NAMES.TESTS, { keyPath: 'id' })
// //         }
// //         if (!db.objectStoreNames.contains(STORE_NAMES.TESTS_CONTENT)) {
// //           db.createObjectStore(STORE_NAMES.TESTS_CONTENT, { keyPath: 'id' })
// //         }
// //       },
// //     })
// //   }
// //   return dbPromise
// // }

// // export const initDB = async () => {
// //   try {
// //     const db = await getDB()
// //     return db
// //   } catch (e) {
// //     throw new Error(`DB initialization failed: ${e.message}`)
// //   }
// // }

// // export const initDB = async () => {
// //   try {
// //     const db = await openDB('TestsOfflineDB', 3, {
// //       upgrade(db, oldVersion, newVersion, transaction) {
// //         if (!db.objectStoreNames.contains(STORE_NAMES.TESTS)) {
// //           db.createObjectStore(STORE_NAMES.TESTS, { keyPath: 'id' })
// //         }
// //         if (!db.objectStoreNames.contains(STORE_NAMES.TESTS_CONTENT)) {
// //           db.createObjectStore(STORE_NAMES.TESTS_CONTENT, { keyPath: 'id' })
// //         }
// //       },
// //     })
// //     return db
// //   } catch (e) {
// //     console.error('DB initialization failed:', e)
// //     throw e
// //   }
// // }

// let dbConnection = null

// export const getDB = async () => {
//   if (!dbConnection) {
//     dbConnection = await openDB('TestsOfflineDB', 3, {
//       upgrade(db) {
//         if (!db.objectStoreNames.contains(STORE_NAMES.TESTS)) {
//           db.createObjectStore(STORE_NAMES.TESTS, { keyPath: 'id' })
//         }
//         if (!db.objectStoreNames.contains(STORE_NAMES.TESTS_CONTENT)) {
//           db.createObjectStore(STORE_NAMES.TESTS_CONTENT, { keyPath: 'id' })
//         }
//       },
//     })
//   }
//   return dbConnection
// }

// export const initDB = async () => {
//   try {
//     return await getDB()
//   } catch (e) {
//     dbConnection = null
//     throw new Error(`DB initialization failed: ${e.message}`)
//   }
// }

// // export const getTestsFromDB = async () => {
// //   try {
// //     const db = await getDB()
// //     return db.getAll(STORE_NAMES.TESTS)
// //   } catch (e) {
// //     return []
// //   }
// // }
// export const getTestsFromDB = async () => {
//   const db = await getDB()
//   try {
//     const tx = db.transaction(STORE_NAMES.TESTS, 'readonly')
//     const tests = await tx.store.getAll()
//     await tx.done
//     return tests
//   } catch (e) {
//     console.error('Failed to get tests from DB:', e)
//     throw e
//   }
// }

// export const getTestsFromDB2 = async () => {
//   try {
//     const db = await getDB()
//     return db.getAll(STORE_NAMES.TESTS_CONTENT)
//   } catch (e) {
//     return []
//   }
// }

// export const getTestFromDB = async (
//   id,
//   storeName = STORE_NAMES.TESTS_CONTENT
// ) =>
//   new Promise((resolve, reject) => {
//     const request = indexedDB.open('TestsOfflineDB', 3)

//     request.onsuccess = (event) => {
//       const db = event.target.result
//       const tx = db.transaction(storeName, 'readonly')
//       const store = tx.objectStore(storeName)

//       const getRequest = store.get(Number(id))

//       getRequest.onsuccess = () => {
//         resolve(getRequest.result || null)
//         db.close()
//       }

//       getRequest.onerror = () => {
//         reject(getRequest.error)
//         db.close()
//       }
//     }

//     request.onerror = (event) => {
//       reject(event.target.error)
//     }
//   })

// export const debugIndexedDB = async () => {
//   try {
//     const db = await getDB()
//     const tx = db.transaction(STORE_NAMES.TESTS_CONTENT, 'readonly')
//     const store = tx.objectStore(STORE_NAMES.TESTS_CONTENT)

//     const allData = await store.getAll()
//     const count = await store.count()

//     return { allData, count }
//   } catch (e) {
//     throw new Error(`Debug error: ${e.message}`)
//   }
// }

// export const testTransaction = async () => {
//   const db = await getDB()
//   const tx = db.transaction(STORE_NAMES.TESTS_CONTENT, 'readonly')
//   const store = tx.objectStore(STORE_NAMES.TESTS_CONTENT)

//   return new Promise((resolve, reject) => {
//     tx.oncomplete = () => resolve('Transaction completed')
//     tx.onerror = (e) =>
//       reject(new Error(`Transaction error: ${e.target.error}`))

//     const req = store.get(2)
//     req.onsuccess = () => resolve(req.result)
//     req.onerror = () => reject(new Error('Request error'))
//   })
// }

// export const saveTestToDB = async (test, storeName = STORE_NAMES.TESTS) => {
//   const db = await getDB()
//   try {
//     const tx = db.transaction(storeName, 'readwrite')
//     await tx.store.put(test)
//     await tx.done
//     return true
//   } catch (e) {
//     console.error(`Failed to save test ${test.id}:`, e)
//     throw e
//   }
// }

// // export const saveTestToDB = async (test, storeName = STORE_NAMES.TESTS) => {
// //   let db
// //   try {
// //     db = await initDB()

// //     // Явно проверяем существование хранилища
// //     if (!db.objectStoreNames.contains(storeName)) {
// //       throw new Error(`Store ${storeName} does not exist`)
// //     }

// //     const tx = db.transaction(storeName, 'readwrite')
// //     await tx.store.put(test)
// //     await tx.done
// //     return true
// //   } catch (e) {
// //     console.error('Failed to save test:', e)

// //     // Если проблема с соединением, пробуем переподключиться
// //     if (e.message.includes('connection is closing')) {
// //       try {
// //         db = await initDB()
// //         const tx = db.transaction(storeName, 'readwrite')
// //         await tx.store.put(test)
// //         await tx.done
// //         return true
// //       } catch (retryError) {
// //         throw new Error(
// //           `Failed to save test after retry: ${retryError.message}`
// //         )
// //       }
// //     }

// //     throw new Error(`Failed to save test: ${e.message}`)
// //   }
// // }
// // export const saveTestToDB = async (test, storeName = STORE_NAMES.TESTS) => {
// //   try {
// //     const db = await getDB()

// //     if (!db.objectStoreNames.contains(storeName)) {
// //       throw new Error(`Store ${storeName} does not exist`)
// //     }

// //     const tx = db.transaction(storeName, 'readwrite')
// //     await tx.store.put(test)
// //     await tx.done
// //     return true
// //   } catch (e) {
// //     throw new Error(`Failed to save test: ${e.message}`)
// //   }
// // }

// export const checkStoresExist = async () => {
//   const db = await getDB()
//   return {
//     tests: db.objectStoreNames.contains(STORE_NAMES.TESTS),
//     testsContent: db.objectStoreNames.contains(STORE_NAMES.TESTS_CONTENT),
//   }
// }

// export const deleteTestFromDB = async (id, storeName = STORE_NAMES.TESTS) => {
//   try {
//     const db = await getDB()

//     if (!db.objectStoreNames.contains(storeName)) {
//       throw new Error(`Store ${storeName} does not exist`)
//     }

//     const tx = db.transaction(storeName, 'readwrite')
//     await tx.store.delete(id)
//     await tx.done
//     return true
//   } catch (e) {
//     throw new Error(`Failed to delete test: ${e.message}`)
//   }
// }

// export const deleteDatabase = () => {
//   try {
//     indexedDB.deleteDatabase(DB_NAME)
//     dbPromise = null
//     return true
//   } catch (e) {
//     throw new Error(`Failed to delete database: ${e.message}`)
//   }
// }

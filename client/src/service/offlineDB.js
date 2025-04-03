import { openDB } from 'idb'

const DB_NAME = 'TestsOfflineDB'
const DB_VERSION = 3
export const STORE_NAMES = {
  TESTS: 'tests',
  TESTS_CONTENT: 'testsContent',
}

let dbPromise = null

export const getDB = async () => {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAMES.TESTS)) {
          db.createObjectStore(STORE_NAMES.TESTS, { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains(STORE_NAMES.TESTS_CONTENT)) {
          db.createObjectStore(STORE_NAMES.TESTS_CONTENT, { keyPath: 'id' })
        }
      },
    })
  }
  return dbPromise
}

export const initDB = async () => {
  try {
    const db = await getDB()
    return db
  } catch (e) {
    throw new Error(`DB initialization failed: ${e.message}`)
  }
}

export const getTestsFromDB = async () => {
  try {
    const db = await getDB()
    return db.getAll(STORE_NAMES.TESTS)
  } catch (e) {
    return []
  }
}

export const getTestsFromDB2 = async () => {
  try {
    const db = await getDB()
    return db.getAll(STORE_NAMES.TESTS_CONTENT)
  } catch (e) {
    return []
  }
}

export const getTestFromDB = async (
  id,
  storeName = STORE_NAMES.TESTS_CONTENT
) =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open('TestsOfflineDB', 3)

    request.onsuccess = (event) => {
      const db = event.target.result
      const tx = db.transaction(storeName, 'readonly')
      const store = tx.objectStore(storeName)

      const getRequest = store.get(Number(id))

      getRequest.onsuccess = () => {
        resolve(getRequest.result || null)
        db.close()
      }

      getRequest.onerror = () => {
        reject(getRequest.error)
        db.close()
      }
    }

    request.onerror = (event) => {
      reject(event.target.error)
    }
  })

export const debugIndexedDB = async () => {
  try {
    const db = await getDB()
    const tx = db.transaction(STORE_NAMES.TESTS_CONTENT, 'readonly')
    const store = tx.objectStore(STORE_NAMES.TESTS_CONTENT)

    const allData = await store.getAll()
    const count = await store.count()

    return { allData, count }
  } catch (e) {
    throw new Error(`Debug error: ${e.message}`)
  }
}

export const testTransaction = async () => {
  const db = await getDB()
  const tx = db.transaction(STORE_NAMES.TESTS_CONTENT, 'readonly')
  const store = tx.objectStore(STORE_NAMES.TESTS_CONTENT)

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve('Transaction completed')
    tx.onerror = (e) =>
      reject(new Error(`Transaction error: ${e.target.error}`))

    const req = store.get(2)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(new Error('Request error'))
  })
}

export const saveTestToDB = async (test, storeName = STORE_NAMES.TESTS) => {
  try {
    const db = await getDB()

    if (!db.objectStoreNames.contains(storeName)) {
      throw new Error(`Store ${storeName} does not exist`)
    }

    const tx = db.transaction(storeName, 'readwrite')
    await tx.store.put(test)
    await tx.done
    return true
  } catch (e) {
    throw new Error(`Failed to save test: ${e.message}`)
  }
}

export const checkStoresExist = async () => {
  const db = await getDB()
  return {
    tests: db.objectStoreNames.contains(STORE_NAMES.TESTS),
    testsContent: db.objectStoreNames.contains(STORE_NAMES.TESTS_CONTENT),
  }
}

export const deleteTestFromDB = async (id, storeName = STORE_NAMES.TESTS) => {
  try {
    const db = await getDB()

    if (!db.objectStoreNames.contains(storeName)) {
      throw new Error(`Store ${storeName} does not exist`)
    }

    const tx = db.transaction(storeName, 'readwrite')
    await tx.store.delete(id)
    await tx.done
    return true
  } catch (e) {
    throw new Error(`Failed to delete test: ${e.message}`)
  }
}

export const deleteDatabase = () => {
  try {
    indexedDB.deleteDatabase(DB_NAME)
    dbPromise = null
    return true
  } catch (e) {
    throw new Error(`Failed to delete database: ${e.message}`)
  }
}

// import { openDB } from 'idb'

// const DB_NAME = 'TestsOfflineDB'
// const DB_VERSION = 3 // Увеличьте версию для активации upgrade
// export const STORE_NAMES = {
//   TESTS: 'tests',
//   TESTS_CONTENT: 'testsContent',
// }

// let dbPromise = null

// export const getDB = async () => {
//   if (!dbPromise) {
//     dbPromise = openDB(DB_NAME, DB_VERSION, {
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
//   return dbPromise
// }

// export const initDB = async () => {
//   try {
//     const db = await getDB()
//     return db
//   } catch (e) {
//     console.error('DB initialization failed:', e)
//     throw e
//   }
// }

// export const getTestsFromDB = async () => {
//   try {
//     const db = await getDB()
//     return await db.getAll(STORE_NAMES.TESTS)
//   } catch (e) {
//     console.error('Failed to get tests from DB:', e)
//     return []
//   }
// }
// export const getTestsFromDB2 = async () => {
//   try {
//     const db = await getDB()
//     const value = await db.getAll(STORE_NAMES.TESTS_CONTENT)
//     console.log('offlineDB value > ', value)

//     return value
//   } catch (e) {
//     console.error('Failed to get tests from DB:', e)
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
//         // console.log('Данные получены:', getRequest.result)
//         resolve(getRequest.result || null)
//         db.close() // Явно закрываем соединение
//       }

//       getRequest.onerror = () => {
//         console.error('Ошибка запроса:', getRequest.error)
//         reject(getRequest.error)
//         db.close()
//       }
//       // для отладки
//       // tx.oncomplete = () => console.log('Транзакция завершена')
//       // tx.onerror = () => console.error('Транзакция ошибка:', tx.error)
//     }

//     request.onerror = (event) => {
//       console.error('Ошибка открытия DB:', event.target.error)
//       reject(event.target.error)
//     }
//   })
// export const debugIndexedDB = async () => {
//   try {
//     const db = await getDB()
//     const tx = db.transaction(STORE_NAMES.TESTS_CONTENT, 'readonly')
//     const store = tx.objectStore(STORE_NAMES.TESTS_CONTENT)

//     const allData = await store.getAll()
//     console.log('Все данные в хранилище:', allData)

//     const count = await store.count()
//     console.log('Количество записей:', count)
//   } catch (e) {
//     console.error('Ошибка при отладке IndexedDB:', e)
//   }
// }

// // для отладки
// export const testTransaction = async () => {
//   const db = await getDB()
//   const tx = db.transaction(STORE_NAMES.TESTS_CONTENT, 'readonly')
//   const store = tx.objectStore(STORE_NAMES.TESTS_CONTENT)

//   console.log('Начало транзакции')

//   tx.oncomplete = () => console.log('Транзакция успешно завершена')
//   tx.onerror = (e) => console.error('Ошибка транзакции:', e.target.error)

//   const req = store.get(2)

//   req.onsuccess = () => console.log('Результат:', req.result)
//   req.onerror = () => console.error('Ошибка запроса:', req.error)
// }

// export const saveTestToDB = async (test, storeName = STORE_NAMES.TESTS) => {
//   try {
//     const db = await getDB()

//     if (!db.objectStoreNames.contains(storeName)) {
//       throw new Error(`Store ${storeName} does not exist`)
//     }

//     const tx = db.transaction(storeName, 'readwrite')
//     await tx.store.put(test)
//     await tx.done
//     return true
//   } catch (e) {
//     console.error('Failed to save test to DB:', e)
//     throw e
//   }
// }

// // Добавим функцию для проверки существования хранилищ
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
//     console.error('Failed to delete test from DB:', e)
//     throw e
//   }
// }

// export const deleteDatabase = () => {
//   try {
//     indexedDB.deleteDatabase(DB_NAME)
//     dbPromise = null
//     return true
//   } catch (e) {
//     console.error('Failed to delete database:', e)
//     return false
//   }
// }

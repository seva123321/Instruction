// service/offlineDB.js
import { openDB } from 'idb'

const DB_NAME = 'TestsOfflineDB'
const DB_VERSION = 3 // Увеличьте версию для активации upgrade
export const STORE_NAMES = {
  TESTS: 'tests',
  TESTS_CONTENT: 'testsContent',
}

let dbPromise = null

export const getDB = async () => {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        // Создаем оба хранилища при первом создании БД
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
    console.error('DB initialization failed:', e)
    throw e
  }
}

export const getTestsFromDB = async () => {
  try {
    const db = await getDB()
    return await db.getAll(STORE_NAMES.TESTS)
  } catch (e) {
    console.error('Failed to get tests from DB:', e)
    return []
  }
}

export const getTestFromDB = async (id) => {
  try {
    const db = await initDB()
    return await db.get('testsContent', id)
  } catch (e) {
    console.error('Failed to get test from DB:', e)
    return null
  }
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
    console.error('Failed to save test to DB:', e)
    throw e
  }
}

// Добавим функцию для проверки существования хранилищ
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
    console.error('Failed to delete test from DB:', e)
    throw e
  }
}

export const deleteDatabase = () => {
  try {
    indexedDB.deleteDatabase(DB_NAME)
    dbPromise = null
    return true
  } catch (e) {
    console.error('Failed to delete database:', e)
    return false
  }
}

// import { openDB } from 'idb'

// const DB_NAME = 'TestsOfflineDB'
// const DB_VERSION = 1

// export const initDB = async () => {
//   return openDB(DB_NAME, DB_VERSION, {
//     upgrade(db) {
//       if (!db.objectStoreNames.contains('tests')) {
//         db.createObjectStore('tests', { keyPath: 'id' })
//       }
//       if (!db.objectStoreNames.contains('testsContent')) {
//         db.createObjectStore('testsContent', { keyPath: 'id' })
//       }
//     },
//   })
// }

// export const getTestsFromDB = async () => {
//   try {
//     const db = await initDB()
//     return await db.getAll('tests')
//   } catch (e) {
//     console.error('Failed to get tests from DB:', e)
//     return []
//   }
// }

// export const getTestFromDB = async (id) => {
//   try {
//     const db = await initDB()
//     return await db.get('testsContent', id)
//   } catch (e) {
//     console.error('Failed to get test from DB:', e)
//     return null
//   }
// }

// export const saveTestToDB = async (test, nameDB) => {
//   try {
//     const db = await initDB()
//     await db.put(nameDB, test)
//     return true
//   } catch (e) {
//     console.error('Failed to save test to DB:', e)
//     throw e
//   }
// }

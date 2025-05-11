import { openDB, deleteDB } from 'idb'

export const DB_NAME = 'TestsOfflineDB'
const DB_VERSION = 3
export const STORE_NAMES = {
  TESTS: 'tests',
  TESTS_CONTENT: 'testsContent',
}

// Глобальное соединение с базой данных
let dbInstance = null
let isInitializing = false
let pendingOperations = []

// Получение или создание соединения с базой данных
export const getDB = async () => {
  if (dbInstance) return dbInstance

  if (isInitializing) {
    // Если уже идет инициализация, ждем ее завершения
    return new Promise((resolve) => {
      pendingOperations.push(resolve)
    })
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

    // Разрешаем все ожидающие операции
    pendingOperations.forEach((resolve) => resolve(dbInstance))
    pendingOperations = []

    return dbInstance
  } catch (e) {
    console.error('Failed to open DB:', e)
    dbInstance = null
    throw e
  } finally {
    isInitializing = false
  }
}

// Инициализация базы данных
export const initDB = async () => {
  try {
    return await getDB()
  } catch (e) {
    console.error('DB initialization failed:', e)
    throw new Error(`Failed to initialize database: ${e.message}`)
  }
}

// Получение всех тестов
export const getTestsFromDB = async () => {
  const db = await getDB()
  try {
    const tx = db.transaction(STORE_NAMES.TESTS, 'readonly')
    const tests = await tx.store.getAll()
    await tx.done
    return tests
  } catch (e) {
    console.error('Failed to get tests from DB:', e)
    return []
  }
}

// Получение конкретного теста
export const getTestFromDB = async (
  testId,
  storeName = STORE_NAMES.TESTS_CONTENT
) => {
  const db = await getDB()
  try {
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

// Сохранение теста
export const saveTestToDB = async (test, storeName = STORE_NAMES.TESTS) => {
  const db = await getDB()
  try {
    const tx = db.transaction(storeName, 'readwrite')
    await tx.store.put(test)
    await tx.done
    return true
  } catch (e) {
    console.error(`Failed to save test ${test.id}:`, e)
    throw e
  }
}

// Удаление теста
export const deleteTestFromDB = async (
  testId,
  storeName = STORE_NAMES.TESTS
) => {
  const db = await getDB()
  try {
    const tx = db.transaction(storeName, 'readwrite')
    await tx.store.delete(testId)
    await tx.done
    return true
  } catch (e) {
    console.error(`Failed to delete test ${testId}:`, e)
    return false
  }
}

// Проверка наличия теста
export const isTestDownloaded = async (testId) => {
  const db = await getDB()
  try {
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

// Получение оффлайн теста
export const getOfflineTest = async (testId) => {
  const db = await getDB()
  try {
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

// Закрытие соединения
export const closeDB = () => {
  if (dbInstance) {
    dbInstance.close()
    dbInstance = null
  }
}

// Удаление всей базы данных
export const deleteDatabase = async (name) => {
  try {
    await deleteDB(name)
    console.log(`Database ${name} deleted successfully`)
  } catch (e) {
    console.error(`Failed to delete database ${name}:`, e)
    throw e
  }
}

import { openDB } from 'idb'

const DB_NAME = 'TestsOfflineDB'
const DB_VERSION = 1

export const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('tests')) {
        db.createObjectStore('tests', { keyPath: 'id' })
      }
    },
  })
}

export const getTestsFromDB = async () => {
  try {
    const db = await initDB()
    return await db.getAll('tests')
  } catch (e) {
    console.error('Failed to get tests from DB:', e)
    return []
  }
}

export const getTestFromDB = async (id) => {
  try {
    const db = await initDB()
    return await db.get('tests', id)
  } catch (e) {
    console.error('Failed to get test from DB:', e)
    return null
  }
}

export const saveTestToDB = async (test) => {
  try {
    const db = await initDB()
    await db.put('tests', test)
    return true
  } catch (e) {
    console.error('Failed to save test to DB:', e)
    throw e
  }
}

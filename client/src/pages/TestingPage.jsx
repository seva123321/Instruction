/* eslint-disable operator-linebreak */
/* eslint-disable indent */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import {
  List,
  Box,
  Chip,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material'
import {
  School as SchoolIcon,
  OfflineBolt as OfflineBoltIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material'

import { initializeApplicationDatabases } from '@/service/databaseService'
import TabsWrapper from '@/components/TabsWrapper'
import KnowBaseHeader from '@/components/KnowBaseHeader'
import TestItem from '@/components/TestItem'

import { areTestsEqual } from '@/service/utilsFunction'
import {
  getTestsFromDB,
  saveTestToDB,
  deleteTestFromDB,
  getTestFromDB,
  STORE_NAMES,
} from '@/service/offlineDB'
import useTestResults from '@/hook/useTestResults'
import { useLazyGetTestByIdQuery, useLazyGetTestsQuery } from '@/slices/testApi'

function ErrorMessage({ error }) {
  return (
    <Box sx={{ p: 3, textAlign: 'center' }}>
      <Alert severity="error">
        {error?.message || 'Ошибка при загрузке тестов'}
      </Alert>
    </Box>
  )
}

function OfflineIndicator() {
  return (
    <Box sx={{ position: 'fixed', top: 70, right: 20, zIndex: 1000 }}>
      <Chip label="Оффлайн режим" color="warning" icon={<OfflineBoltIcon />} />
    </Box>
  )
}

function TestingPage() {
  const [state, setState] = useState({
    isOnline: navigator.onLine,
    tests: [],
    error: null,
    loadingStates: {},
    isDownloading: {},
    dbInitialized: false,
    initialLoadComplete: false,
  })

  const initialLoadRef = useRef(false)
  const { getTestResults, syncPendingResults, closeDB, initializeDB } =
    useTestResults()
  const [getTests, { isLoading, error: fetchError }] = useLazyGetTestsQuery()
  const [getTestById] = useLazyGetTestByIdQuery()

  const updateState = (newState) => {
    setState((prev) => ({ ...prev, ...newState }))
  }

  const initializeDatabase = useCallback(async () => {
    if (!state.isOnline) return false

    try {
      await initializeApplicationDatabases()
      updateState({ dbInitialized: true })
      return true
    } catch (e) {
      updateState({ error: 'Ошибка инициализации локального хранилища' })
      return false
    }
  }, [state.isOnline])

  const loadOnlineTests = useCallback(async () => {
    try {
      const { data } = await getTests()
      if (!data?.results?.length) return []

      if (!state.dbInitialized) {
        await initializeDatabase()
      }

      const savedTests = await Promise.all(
        data.results.map(async (test) => {
          try {
            const testModified = { ...test }
            const existingTest = await getTestFromDB(test.id, STORE_NAMES.TESTS)

            if (!existingTest || !areTestsEqual(existingTest, testModified)) {
              await saveTestToDB(testModified, STORE_NAMES.TESTS)
              return testModified
            }
            return existingTest
          } catch (e) {
            console.error(`Failed to process test ${test.id}:`, e)
            return null
          }
        })
      )

      return savedTests.filter(Boolean)
    } catch (e) {
      updateState({ error: 'Ошибка загрузки тестов с сервера' })
      return []
    }
  }, [getTests, state.dbInitialized, initializeDatabase])

  const loadOfflineTests = useCallback(async () => {
    try {
      if (!state.dbInitialized) {
        await initializeDatabase()
      }
      return await getTestsFromDB()
    } catch (e) {
      return []
    }
  }, [state.dbInitialized, initializeDatabase])

  const mergeTestsWithResults = useCallback(
    async (testsToMerge) => {
      const merged = await Promise.all(
        testsToMerge.map(async (test) => {
          const testId = test.id
          try {
            updateState((prev) => ({
              loadingStates: { ...prev.loadingStates, [testId]: true },
            }))

            const results = await getTestResults(testId).catch(() => [])
            const latestResult = results[0] || {}

            return {
              ...test,
              ...latestResult,
              name: latestResult.test_title || test.name,
              is_passed: latestResult.is_passed ?? false,
              mark: latestResult.mark ?? 0,
              date: latestResult.completion_time ?? null,
            }
          } catch {
            return test
          } finally {
            updateState((prev) => ({
              loadingStates: { ...prev.loadingStates, [testId]: false },
            }))
          }
        })
      )
      return merged
    },
    [getTestResults]
  )

  const loadData = useCallback(async () => {
    try {
      const loadedTests = state.isOnline
        ? await loadOnlineTests().catch(() => loadOfflineTests())
        : await loadOfflineTests()

      if (loadedTests.length > 0) {
        const mergedTests = await mergeTestsWithResults(loadedTests)
        updateState({ tests: mergedTests, initialLoadComplete: true })
      } else {
        updateState({ initialLoadComplete: true })
      }
    } catch {
      updateState({
        error: 'Ошибка загрузки данных. Попробуйте обновить страницу.',
        initialLoadComplete: true,
      })
    }
  }, [state.isOnline, loadOnlineTests, loadOfflineTests, mergeTestsWithResults])

  useEffect(() => () => closeDB(), [closeDB])

  useEffect(() => {
    const handleOnline = async () => {
      updateState({ isOnline: true })
      try {
        await syncPendingResults()
        await loadData()
      } catch (err) {
        throw new Error(err)
      }
    }

    const handleOffline = () => {
      updateState({ isOnline: false })
      loadData()
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [loadData, syncPendingResults])

  const initializeAllDatabases = useCallback(async () => {
    try {
      await initializeApplicationDatabases()
      await initializeDB()
    } catch {
      updateState({ error: 'Ошибка инициализации базы данных' })
    }
  }, [initializeDB])

  useEffect(() => {
    if (initialLoadRef.current) return
    initialLoadRef.current = true

    const init = async () => {
      try {
        await initializeAllDatabases()
        await loadData()
      } catch {
        updateState({ error: 'Ошибка инициализации приложения' })
      }
    }

    init()
  }, [initializeAllDatabases, loadData])

  const handleDownloadTest = useCallback(
    async (e, id) => {
      e.preventDefault()
      e.stopPropagation()

      try {
        updateState((prev) => ({
          isDownloading: { ...prev.isDownloading, [id]: true },
          error: null,
        }))

        const { data: test } = await getTestById(id)
        if (!test) throw new Error('Тест не найден')

        await saveTestToDB(test, STORE_NAMES.TESTS_CONTENT)
        const savedTest = await getTestFromDB(id, STORE_NAMES.TESTS_CONTENT)
        if (!savedTest) throw new Error('Не удалось сохранить тест')

        return true
      } catch (err) {
        updateState({ error: `Ошибка загрузки теста: ${err.message}` })
        return false
      } finally {
        updateState((prev) => ({
          isDownloading: { ...prev.isDownloading, [id]: false },
        }))
      }
    },
    [getTestById]
  )

  const handleDeleteTest = useCallback(async (testId) => {
    try {
      await deleteTestFromDB(testId, STORE_NAMES.TESTS_CONTENT)
      return true
    } catch {
      updateState({ error: 'Не удалось удалить тест' })
      return false
    }
  }, [])

  const tabs = useMemo(() => {
    const renderTestList = (filterFn) => (
      <List sx={{ width: '100%', maxWidth: 800, p: 0 }}>
        {state.tests.filter(filterFn).map((test) => (
          <TestItem
            key={test.id}
            test={test}
            isLoading={state.loadingStates[test.id]}
            isDownloading={state.isDownloading[test.id]}
            onDeleteTest={handleDeleteTest}
            onDownloadTest={handleDownloadTest}
            isOnline={state.isOnline}
          />
        ))}
      </List>
    )

    return [
      {
        label: 'Все тесты',
        icon: <SchoolIcon />,
        content: renderTestList(() => true),
      },
      {
        label: 'Учебные',
        icon: <SchoolIcon />,
        content: renderTestList((test) => !test.test_is_control),
      },
      {
        label: 'Контрольные',
        icon: <AssignmentIcon />,
        content: renderTestList((test) => test.test_is_control),
      },
    ]
  }, [state, handleDeleteTest, handleDownloadTest])

  if (!state.initialLoadComplete || (isLoading && state.isOnline)) {
    return (
      <Box
        sx={{
          height: '70vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress size={60} />
      </Box>
    )
  }

  if (fetchError && state.isOnline) return <ErrorMessage error={fetchError} />

  return (
    <Box>
      {!state.isOnline && <OfflineIndicator />}

      <KnowBaseHeader title="Тестирование" />

      <TabsWrapper centered tabs={tabs} />

      <Snackbar
        open={!!state.error}
        autoHideDuration={6000}
        onClose={() => updateState({ error: null })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity="error"
          onClose={() => updateState({ error: null })}
          sx={{ width: '100%' }}
        >
          {state.error}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default TestingPage

/* eslint-disable operator-linebreak */
/* eslint-disable indent */

import React, { useState, useEffect, useCallback, useMemo } from 'react'
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

import { areTestsEqual } from '../service/utilsFunction'
import {
  useLazyGetTestByIdQuery,
  useLazyGetTestsQuery,
} from '../slices/testApi'
import {
  getTestsFromDB,
  saveTestToDB,
  deleteTestFromDB,
  getTestFromDB,
  STORE_NAMES,
} from '../service/offlineDB'
import useTestResults from '../hook/useTestResults'
import TestItem from '../components/TestItem/TestItem'

import KnowBaseHeader from './KnowBaseHeader'

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
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [tests, setTests] = useState([])
  const [error, setError] = useState(null)
  const [loadingStates, setLoadingStates] = useState({})
  const [isDownloading, setIsDownloading] = useState({})
  const [dbInitialized, setDbInitialized] = useState(false)
  const { initializeDB } = useTestResults()

  const { getTestResults, syncPendingResults, closeDB } = useTestResults()
  const [getTests, { isLoading, error: fetchError }] = useLazyGetTestsQuery()
  const [getTestById] = useLazyGetTestByIdQuery()

  const initializeDatabase = useCallback(async () => {
    if (!isOnline) return false
    try {
      const success = await initializeApplicationDatabases()
      if (!success) {
        throw new Error('Database initialization failed')
      }
      setDbInitialized(true)
      return true
    } catch (e) {
      try {
        await initializeApplicationDatabases()
        setDbInitialized(true)
        return true
      } catch (e2) {
        setError('Ошибка инициализации локального хранилища')
        return false
      }
    }
  }, [isOnline])

  // const loadOnlineTests = useCallback(async () => {
  //   try {
  //     const { data } = await getTests()
  //     if (data?.results?.length > 0) {
  //       if (!dbInitialized) {
  //         await initializeDatabase()
  //       }

  //       const savePromises = data.results.map(
  //         async (test) => {
  //           const testModified = { ...test }
  //           delete testModified.test_results
  //           return saveTestToDB(testModified, STORE_NAMES.TESTS).catch((e) => {
  //             throw new Error(e.message)
  //           })
  //         }
  //         // eslint-disable-next-line function-paren-newline
  //       )

  //       await Promise.all(savePromises)
  //       return data.results
  //     }
  //     return []
  //   } catch (e) {
  //     setError('Ошибка загрузки тестов с сервера')
  //     return []
  //   }
  // }, [getTests, dbInitialized, initializeDatabase])

  const loadOnlineTests = useCallback(async () => {
    try {
      const { data } = await getTests()
      if (data?.results?.length > 0) {
        if (!dbInitialized) {
          await initializeDatabase()
        }

        const savePromises = data.results.map(async (test) => {
          try {
            const testModified = { ...test }
            // delete testModified.test_results

            // Проверяем существует ли уже такой тест в IndexedDB
            const existingTest = await getTestFromDB(test.id, STORE_NAMES.TESTS)

            // Если теста нет или он отличается от полученного с сервера
            if (!existingTest || !areTestsEqual(existingTest, testModified)) {
              await saveTestToDB(testModified, STORE_NAMES.TESTS)
              return testModified
            }

            return existingTest // Возвращаем существующий если он идентичен
          } catch (e) {
            throw new Error(`Failed to process test ${test.id}: ${e.message}`)
          }
        })

        const savedTests = await Promise.all(savePromises)
        return savedTests.filter((test) => test !== null)
      }
      return []
    } catch (e) {
      setError('Ошибка загрузки тестов с сервера')
      return []
    }
  }, [getTests, dbInitialized, initializeDatabase])

  const loadOfflineTests = useCallback(async () => {
    try {
      if (!dbInitialized) {
        await initializeDatabase()
        setDbInitialized(true)
      }
      return await getTestsFromDB()
    } catch (e) {
      return []
    }
  }, [dbInitialized, initializeDatabase])

  // const mergeTestsWithResults = useCallback(
  //   async (testsToMerge) => {
  //     const merged = await Promise.all(
  //       testsToMerge.map(async (test) => {
  //         const testId = test.id
  //         try {
  //           setLoadingStates((prev) => ({ ...prev, [testId]: true }))

  //           // Получаем все результаты для данного теста
  //           const results = await getTestResults(testId)
  //           // Сортируем по дате (новые сначала) и берем последний результат
  //           const latestResult = results[0] || {}
  //           return {
  //             ...test,
  //             ...latestResult,
  //             name: latestResult.test_title || test.name,
  //             is_passed: latestResult.is_passed ?? false,
  //             mark: latestResult.mark ?? 0,
  //             date:
  //               latestResult.completion_time ?? latestResult.createdAt ?? null,
  //           }
  //         } catch (error) {
  //           console.error(`Error merging results for test ${test.id}:`, error)
  //           return test
  //         } finally {
  //           setLoadingStates((prev) => ({ ...prev, [testId]: false }))
  //         }
  //       })
  //     )
  //     return merged
  //   },
  //   [getTestResults]
  // )

  // @TODO рабочий вариант
  const mergeTestsWithResults = useCallback(
    async (testsToMerge) => {
      const merged = await Promise.all(
        testsToMerge.map(async (test) => {
          const testId = test.id
          try {
            setLoadingStates((prev) => ({ ...prev, [testId]: true }))

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
            setLoadingStates((prev) => ({ ...prev, [testId]: false }))
          }
        })
      )
      return merged
    },
    [getTestResults]
  )

  const loadData = useCallback(async () => {
    try {
      const loadedTests = isOnline
        ? await loadOnlineTests().catch(() => loadOfflineTests())
        : await loadOfflineTests()

      if (loadedTests.length > 0) {
        const mergedTests = await mergeTestsWithResults(loadedTests)
        setTests(mergedTests)
      }
    } catch {
      setError('Ошибка загрузки данных. Попробуйте обновить страницу.')
    }
  }, [isOnline, loadOnlineTests, loadOfflineTests, mergeTestsWithResults])

  useEffect(
    () => () => {
      closeDB()
    },
    [closeDB]
  )

  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true)
      try {
        await syncPendingResults()
        await loadData()
      } catch {
        // Handle error silently
      }
    }

    const handleOffline = () => {
      setIsOnline(false)
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
      setError('Ошибка инициализации базы данных')
    }
  }, [initializeDB])

  useEffect(() => {
    let mounted = true

    const init = async () => {
      try {
        await initializeAllDatabases()
        if (mounted) {
          await loadData()
        }
      } catch {
        if (mounted) {
          setError('Ошибка инициализации приложения')
        }
      }
    }

    init()

    return () => {
      mounted = false
    }
  }, [initializeAllDatabases, loadData])

  const handleDownloadTest = useCallback(
    async (e, id) => {
      e.preventDefault()
      e.stopPropagation()

      try {
        setIsDownloading((prev) => ({ ...prev, [id]: true }))
        setError(null)

        const { data: test } = await getTestById(id)
        if (!test) {
          throw new Error('Тест не найден')
        }

        await saveTestToDB(test, STORE_NAMES.TESTS_CONTENT)

        const savedTest = await getTestFromDB(id, STORE_NAMES.TESTS_CONTENT)
        if (!savedTest) {
          throw new Error('Не удалось сохранить тест')
        }

        return true
      } catch (err) {
        setError(`Ошибка загрузки теста: ${err.message}`)
        return false
      } finally {
        setIsDownloading((prev) => ({ ...prev, [id]: false }))
      }
    },
    [getTestById]
  )

  const handleDeleteTest = useCallback(
    async (testId) => {
      try {
        await deleteTestFromDB(testId, STORE_NAMES.TESTS_CONTENT)

        const updatedTests = await getTestsFromDB()
        setTests(await mergeTestsWithResults(updatedTests))
        return true
      } catch {
        setError('Не удалось удалить тест')
        return false
      }
    },
    [mergeTestsWithResults]
  )

  const tabs = useMemo(() => {
    const renderTestList = (filterFn) => (
      <List sx={{ width: '100%', maxWidth: 800, p: 0 }}>
        {tests.filter(filterFn).map((test) => (
          <TestItem
            key={test.id}
            test={test}
            isLoading={loadingStates[test.id]}
            isDownloading={isDownloading[test.id]}
            onDeleteTest={handleDeleteTest}
            onDownloadTest={handleDownloadTest}
            isOnline={isOnline}
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
  }, [
    tests,
    loadingStates,
    isDownloading,
    handleDeleteTest,
    handleDownloadTest,
    isOnline,
  ])

  if (isLoading && isOnline) {
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
  if (fetchError && isOnline) return <ErrorMessage error={fetchError} />

  return (
    <Box>
      {!isOnline && <OfflineIndicator />}

      <KnowBaseHeader title="Тестирование" />

      <TabsWrapper centered tabs={tabs} />

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity="error"
          onClose={() => setError(null)}
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default TestingPage

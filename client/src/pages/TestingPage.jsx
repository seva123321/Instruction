/* eslint-disable operator-linebreak */
/* eslint-disable indent */

/* eslint-disable operator-linebreak */
/* eslint-disable indent */

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  List,
  Typography,
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

import TabsWrapper from '@/components/TabsWrapper'
import { initializeApplicationDatabases } from '@/service/databaseService'

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

import TestItem from './TestItem'

function LoadingIndicator() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
      <CircularProgress size={60} />
    </Box>
  )
}

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

  const loadOnlineTests = useCallback(async () => {
    try {
      const { data } = await getTests()
      if (data?.results?.length > 0) {
        if (!dbInitialized) {
          await initializeDatabase()
        }

        const savePromises = data.results.map(
          (test) =>
            saveTestToDB(test, STORE_NAMES.TESTS).catch((e) => {
              throw new Error(e.message)
            })
          // eslint-disable-next-line function-paren-newline
        )

        await Promise.all(savePromises)
        return data.results
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

  if (isLoading && isOnline) return <LoadingIndicator />
  if (fetchError && isOnline) return <ErrorMessage error={fetchError} />

  return (
    <Box>
      {!isOnline && <OfflineIndicator />}

      <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', mb: 4 }}>
        Тестирование
      </Typography>

      <TabsWrapper tabs={tabs} />

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

// import React, { useState, useEffect, useCallback, useMemo } from 'react'
// import {
//   List,
//   Typography,
//   Box,
//   Chip,
//   CircularProgress,
//   Snackbar,
//   Alert,
// } from '@mui/material'
// import {
//   School as SchoolIcon,
//   OfflineBolt as OfflineBoltIcon,
//   Assignment as AssignmentIcon,
// } from '@mui/icons-material'

// import TabsWrapper from '@/components/TabsWrapper'
// import { initializeApplicationDatabases } from '@/service/databaseService'

// import {
//   useLazyGetTestByIdQuery,
//   useLazyGetTestsQuery,
// } from '../slices/testApi'
// import {
//   getTestsFromDB,
//   saveTestToDB,
//   deleteTestFromDB,
//   getTestFromDB,
//   STORE_NAMES,
// } from '../service/offlineDB'
// import useTestResults from '../hook/useTestResults'

// import TestItem from './TestItem'

// function LoadingIndicator() {
//   return (
//     <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
//       <CircularProgress size={60} />
//     </Box>
//   )
// }

// function ErrorMessage({ error }) {
//   return (
//     <Box sx={{ p: 3, textAlign: 'center' }}>
//       <Alert severity="error">
//         {error?.message || 'Ошибка при загрузке тестов'}
//       </Alert>
//     </Box>
//   )
// }

// function OfflineIndicator() {
//   return (
//     <Box sx={{ position: 'fixed', top: 70, right: 20, zIndex: 1000 }}>
//       <Chip label="Оффлайн режим" color="warning" icon={<OfflineBoltIcon />} />
//     </Box>
//   )
// }

// function TestingPage() {
//   const [isOnline, setIsOnline] = useState(navigator.onLine)
//   // const [offlineTests, setOfflineTests] = useState([])
//   const [tests, setTests] = useState([])
//   const [error, setError] = useState(null)
//   const [loadingStates, setLoadingStates] = useState({})
//   const [isDownloading, setIsDownloading] = useState({})
//   const [dbInitialized, setDbInitialized] = useState(false)
//   // const [dbReady, setDbReady] = useState(false)
//   const { initializeDB } = useTestResults()

//   const { getTestResults, syncPendingResults, closeDB } = useTestResults()
//   const [getTests, { data: testsData, isLoading, error: fetchError }] =
//     useLazyGetTestsQuery()
//   const [getTestById] = useLazyGetTestByIdQuery()

//   // Инициализация базы данных с проверкой существования хранилищ
//   const initializeDatabase = useCallback(async () => {
//     if (!isOnline) return
//     try {
//       const success = await initializeApplicationDatabases()
//       if (!success) {
//         throw new Error('Database initialization failed')
//       }
//       setDbInitialized(true)
//       return true
//     } catch (e) {
//       console.error('Database initialization failed:', e)
//       // Попробуем восстановить базу данных
//       try {
//         await initializeApplicationDatabases()
//         setDbInitialized(true)
//         return true
//       } catch (e2) {
//         setError('Ошибка инициализации локального хранилища')
//         return false
//       }
//     }
//   }, [isOnline])

//   // Загрузка тестов с сервера и сохранение в IndexedDB
//   const loadOnlineTests = useCallback(async () => {
//     try {
//       const { data } = await getTests()
//       if (data?.results?.length > 0) {
//         if (!dbInitialized) {
//           await initializeDatabase()
//         }

//         // Сохраняем тесты с задержкой между операциями
//         for (const test of data.results) {
//           try {
//             await saveTestToDB(test, STORE_NAMES.TESTS)
//             // Небольшая задержка между сохранениями
//             await new Promise((resolve) => setTimeout(resolve, 50))
//           } catch (e) {
//             console.error(`Failed to save test ${test.id}:`, e)
//           }
//         }

//         return data.results
//       }
//       return []
//     } catch (e) {
//       console.error('Failed to load online tests:', e)
//       setError('Ошибка загрузки тестов с сервера')
//       return []
//     }
//   }, [getTests, dbInitialized, initializeDatabase])

//   // Загрузка тестов из IndexedDB
//   const loadOfflineTests = useCallback(async () => {
//     try {
//       if (!dbInitialized) {
//         await initializeDatabase()
//         setDbInitialized(true)
//       }
//       return await getTestsFromDB()
//     } catch (e) {
//       console.error('Failed to load offline tests:', e)
//       return []
//     }
//   }, [dbInitialized, initializeDatabase])

//   // Объединение тестов с результатами
//   const mergeTestsWithResults = useCallback(
//     async (testsToMerge) =>
//       Promise.all(
//         testsToMerge.map(async (test) => {
//           const testId = test.id
//           try {
//             setLoadingStates((prev) => ({ ...prev, [testId]: true }))

//             const results = await getTestResults(testId).catch(() => [])
//             const latestResult = results[0] || {}

//             return {
//               ...test,
//               ...latestResult,
//               name: latestResult.test_title || test.name,
//               is_passed: latestResult.is_passed ?? false,
//               mark: latestResult.mark ?? 0,
//               date: latestResult.completion_time ?? null,
//             }
//           } catch (e) {
//             console.error(`Error processing test ${testId}:`, e)
//             return test
//           } finally {
//             setLoadingStates((prev) => ({ ...prev, [testId]: false }))
//           }
//         })
//       ),
//     [getTestResults]
//   )

//   // Основная функция загрузки данных
//   const loadData = useCallback(async () => {
//     try {
//       let loadedTests = []

//       if (isOnline) {
//         try {
//           loadedTests = await loadOnlineTests()
//         } catch (e) {
//           console.error('Online load failed, trying offline:', e)
//           loadedTests = await loadOfflineTests()
//         }
//       } else {
//         loadedTests = await loadOfflineTests()
//       }

//       if (loadedTests.length > 0) {
//         const mergedTests = await mergeTestsWithResults(loadedTests)
//         setTests(mergedTests)
//         if (!isOnline) {
//           // setOfflineTests(mergedTests)
//         }
//       } else if (!isOnline) {
//         // setOfflineTests([])
//       }
//     } catch (e) {
//       console.error('Failed to load data:', e)
//       setError('Ошибка загрузки данных. Попробуйте обновить страницу.')
//     }
//   }, [isOnline, loadOnlineTests, loadOfflineTests, mergeTestsWithResults])

//   useEffect(
//     () => () => {
//       closeDB()
//     },
//     [closeDB]
//   )

//   // Обработчик изменения сетевого статуса
//   useEffect(() => {
//     const handleOnline = async () => {
//       setIsOnline(true)
//       try {
//         await syncPendingResults()
//         await loadData()
//       } catch (e) {
//         console.error('Online sync failed:', e)
//       }
//     }

//     const handleOffline = () => {
//       setIsOnline(false)
//       loadData()
//     }

//     window.addEventListener('online', handleOnline)
//     window.addEventListener('offline', handleOffline)

//     return () => {
//       window.removeEventListener('online', handleOnline)
//       window.removeEventListener('offline', handleOffline)
//     }
//   }, [loadData, syncPendingResults])

//   const initializeAllDatabases = useCallback(async () => {
//     try {
//       await initializeApplicationDatabases()
//       await initializeDB()
//       // setDbReady(true)
//     } catch (e) {
//       console.error('Failed to initialize databases:', e)
//       setError('Ошибка инициализации базы данных')
//       // setDbReady(false)
//     }
//   }, [initializeDB])
//   useEffect(() => {
//     let mounted = true

//     const init = async () => {
//       try {
//         await initializeAllDatabases()
//         if (mounted) {
//           // setDbReady(true)
//           await loadData()
//         }
//       } catch (e) {
//         console.error('Initialization failed:', e)
//         if (mounted) {
//           setError('Ошибка инициализации приложения')
//         }
//       }
//     }

//     init()

//     return () => {
//       mounted = false
//     }
//   }, [initializeAllDatabases, loadData])

//   // Первоначальная загрузка данных
//   // useEffect(() => {
//   //   const initialize = async () => {
//   //     try {
//   //       await initializeDatabase()
//   //       await loadData()
//   //     } catch (e) {
//   //       console.error('Initialization failed:', e)
//   //     }
//   //   }

//   //   initialize()
//   // }, [initializeDatabase, loadData])

//   // Загрузка теста для оффлайн использования
//   // const handleDownloadTest = useCallback(
//   //   async (e, id) => {
//   //     e.preventDefault()
//   //     e.stopPropagation()

//   //     try {
//   //       setIsDownloading((prev) => ({ ...prev, [id]: true }))
//   //       setError(null)

//   //       const { data: test } = await getTestById(id)
//   //       if (!test) throw new Error('Тест не найден')

//   //       // Сохраняем в оба хранилища
//   //       await saveTestToDB(test, STORE_NAMES.TESTS)
//   //       await saveTestToDB(test, STORE_NAMES.TESTS_CONTENT)

//   //       // Обновляем список оффлайн тестов
//   //       const updatedTests = await getTestsFromDB()
//   //       setOfflineTests(updatedTests)
//   //       setTests(await mergeTestsWithResults(updatedTests))
//   //     } catch (err) {
//   //       console.error('Failed to download test:', err)
//   //       setError(`Ошибка загрузки теста: ${err.message}`)
//   //     } finally {
//   //       setIsDownloading((prev) => ({ ...prev, [id]: false }))
//   //     }
//   //   },
//   //   [getTestById, mergeTestsWithResults]
//   // )

//   const handleDownloadTest = useCallback(
//     async (e, id) => {
//       e.preventDefault()
//       e.stopPropagation()

//       try {
//         setIsDownloading((prev) => ({ ...prev, [id]: true }))
//         setError(null)

//         // Получаем полные данные теста
//         const { data: test } = await getTestById(id)
//         if (!test) {
//           throw new Error('Тест не найден')
//         }

//         // Сохраняем только в хранилище TESTS_CONTENT
//         await saveTestToDB(test, STORE_NAMES.TESTS_CONTENT)

//         // Проверяем что тест действительно сохранился
//         const savedTest = await getTestFromDB(id, STORE_NAMES.TESTS_CONTENT)
//         if (!savedTest) {
//           throw new Error('Не удалось сохранить тест')
//         }

//         return true // Успешное сохранение
//       } catch (err) {
//         console.error('Failed to download test:', err)
//         setError(`Ошибка загрузки теста: ${err.message}`)
//         return false
//       } finally {
//         setIsDownloading((prev) => ({ ...prev, [id]: false }))
//       }
//     },
//     [getTestById]
//   )

//   // Удаление теста
//   const handleDeleteTest = useCallback(
//     async (testId) => {
//       try {
//         await deleteTestFromDB(testId, STORE_NAMES.TESTS_CONTENT)

//         const updatedTests = await getTestsFromDB()
//         // setOfflineTests(updatedTests)
//         setTests(await mergeTestsWithResults(updatedTests))
//         return true
//       } catch (e) {
//         console.error('Failed to delete test:', e)
//         setError('Не удалось удалить тест')
//         return false
//       }
//     },
//     [mergeTestsWithResults]
//   )

//   // Генерация вкладок
//   const tabs = useMemo(() => {
//     const renderTestList = (filterFn) => (
//       <List sx={{ width: '100%', maxWidth: 800, p: 0 }}>
//         {tests.filter(filterFn).map((test) => (
//           <TestItem
//             key={test.id}
//             test={test}
//             isLoading={loadingStates[test.id]}
//             isDownloading={isDownloading[test.id]}
//             onDeleteTest={handleDeleteTest}
//             onDownloadTest={handleDownloadTest}
//             isOnline={isOnline}
//           />
//         ))}
//       </List>
//     )

//     return [
//       {
//         label: 'Все тесты',
//         icon: <SchoolIcon />,
//         content: renderTestList(() => true),
//       },
//       {
//         label: 'Учебные',
//         icon: <SchoolIcon />,
//         content: renderTestList((test) => !test.test_is_control),
//       },
//       {
//         label: 'Контрольные',
//         icon: <AssignmentIcon />,
//         content: renderTestList((test) => test.test_is_control),
//       },
//     ]
//   }, [
//     tests,
//     loadingStates,
//     isDownloading,
//     handleDeleteTest,
//     handleDownloadTest,
//     isOnline,
//   ])

//   // Рендер состояний
//   if (isLoading && isOnline) return <LoadingIndicator />
//   if (fetchError && isOnline) return <ErrorMessage error={fetchError} />

//   return (
//     <Box>
//       {!isOnline && <OfflineIndicator />}

//       <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', mb: 4 }}>
//         Тестирование
//       </Typography>

//       <TabsWrapper tabs={tabs} />

//       <Snackbar
//         open={!!error}
//         autoHideDuration={6000}
//         onClose={() => setError(null)}
//         anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
//       >
//         <Alert
//           severity="error"
//           onClose={() => setError(null)}
//           sx={{ width: '100%' }}
//         >
//           {error}
//         </Alert>
//       </Snackbar>
//     </Box>
//   )
// }

// export default TestingPage

/* eslint-disable operator-linebreak */
/* eslint-disable indent */

import { useState, useEffect, useCallback, useMemo } from 'react'
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
  Assignment as AssignmentIcon,
} from '@mui/icons-material'

import TabsWrapper from '@/components/TabsWrapper'
import { useLazyGetTestByIdQuery, useGetTestsQuery } from '../slices/testApi'
import {
  initDB,
  getTestsFromDB,
  saveTestToDB,
  deleteTestFromDB,
  checkStoresExist,
} from '../service/offlineDB'
import useTestResults from '../hook/useTestResults'
import { STORE_NAMES } from '../service/offlineDB'
import TestItem from './TestItem'

function TestingPage() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [offlineTests, setOfflineTests] = useState([])
  const [syncError, setSyncError] = useState(null)
  const [loadingStates, setLoadingStates] = useState({})
  const [downloadError, setDownloadError] = useState(null)
  const [isDownloading, setIsDownloading] = useState({})

  const { getTestResults, syncPendingResults } = useTestResults()
  const {
    data: testsData,
    isLoading,
    error,
    refetch,
  } = useGetTestsQuery(undefined, { skip: !isOnline })

  // Инициализация базы данных и загрузка тестов
  useEffect(() => {
    const initOfflineData = async () => {
      try {
        await initDB()
        if (!isOnline) {
          const tests = await getTestsFromDB()
          setOfflineTests(tests)
          await syncPendingResults().catch(console.warn)
        }
      } catch (e) {
        console.error('Offline init failed:', e)
      }
    }

    initOfflineData()
  }, [isOnline, syncPendingResults])

  // Обработка изменений онлайн/офлайн статуса
  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true)
      try {
        await refetch()
        await syncPendingResults()
      } catch (e) {
        setSyncError('Ошибка синхронизации результатов')
        console.error('Sync error:', e)
      }
    }

    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [refetch, syncPendingResults])

  // Кэширование тестов при онлайн режиме
  useEffect(() => {
    if (testsData?.results && isOnline) {
      const cacheTests = async () => {
        try {
          await Promise.all(
            testsData.results.map((test) =>
              saveTestToDB(test, STORE_NAMES.TESTS)
            )
          )
        } catch (e) {
          console.error('Cache tests failed:', e)
          setSyncError('Не удалось сохранить тесты для оффлайн-режима')
        }
      }
      cacheTests()
    }
  }, [testsData, isOnline])

  // Получение объединенных данных тестов и результатов
  const getMergedTests = useCallback(async () => {
    const sourceTests = isOnline ? testsData?.results || [] : offlineTests
    const merged = []

    for (const test of sourceTests) {
      try {
        setLoadingStates((prev) => ({ ...prev, [test.id]: true }))
        let latestResult = {}

        try {
          const results = await getTestResults(test.id)
          if (results && results.length > 0) {
            latestResult = results[0] || {}
          }
        } catch (e) {
          console.warn(`Failed to load results for test ${test.id}:`, e)
        }

        merged.push({
          ...test,
          ...latestResult,
          name: latestResult.test_title || test.name,
          is_passed: latestResult.is_passed ?? false,
          mark: latestResult.mark ?? 0,
          date: latestResult.completion_time ?? null,
        })
      } catch (e) {
        console.error(`Failed to process test ${test.id}:`, e)
        merged.push(test)
      } finally {
        setLoadingStates((prev) => ({ ...prev, [test.id]: false }))
      }
    }

    return merged
  }, [isOnline, testsData, offlineTests, getTestResults])
  const [tests, setTests] = useState([])

  useEffect(() => {
    let isActive = true

    const loadData = async () => {
      try {
        const merged = await getMergedTests()
        if (isActive) setTests(merged)
      } catch (e) {
        console.error('Failed to load tests:', e)
      }
    }

    loadData()

    return () => {
      isActive = false
    }
  }, [getMergedTests])

  // Добавьте этот эффект для проверки хранилищ
  useEffect(() => {
    const verifyStores = async () => {
      try {
        const storesExist = await checkStoresExist()
        if (!storesExist.testsContent) {
          console.error('Tests content store is missing!')
          // Можно предложить пользователю обновить страницу
        }
      } catch (e) {
        console.error('Failed to verify DB stores:', e)
      }
    }

    verifyStores()
  }, [])

  const [getTestById] = useLazyGetTestByIdQuery()

  const handleDownloadTest = useCallback(
    async (e, id) => {
      e.preventDefault()
      e.stopPropagation()

      try {
        setIsDownloading((prev) => ({ ...prev, [id]: true }))
        setDownloadError(null)

        const { data: oneTest } = await getTestById(id)
        if (!oneTest) throw new Error('Тест не найден')

        // Явно указываем хранилище для контента теста
        await saveTestToDB(
          {
            ...oneTest,
            downloadedAt: new Date().toISOString(),
          },
          STORE_NAMES.TESTS_CONTENT // Явное указание хранилища
        )

        console.log('Test downloaded:', oneTest)
      } catch (err) {
        console.error('Failed to download test:', err)
        setDownloadError(`Ошибка загрузки теста: ${err.message}`)
      } finally {
        setIsDownloading((prev) => ({ ...prev, [id]: false }))
      }
    },
    [getTestById]
  )

  const handleDeleteTest = useCallback(async (testId) => {
    try {
      await deleteTestFromDB(testId, STORE_NAMES.TESTS_CONTENT)
      return true
    } catch (e) {
      console.error('Failed to delete test:', e)
      setDownloadError('Не удалось удалить тест')
      return false
    }
  }, [])

  const tabs = useMemo(
    () => [
      {
        label: 'Все тесты',
        icon: <SchoolIcon />,
        content: (
          <List sx={{ width: '100%', maxWidth: 800, p: 0 }}>
            {tests.map((test) => (
              <TestItem
                key={test.id}
                test={test}
                isLoading={loadingStates[test.id]}
                isDownloading={isDownloading}
                onDeleteTest={handleDeleteTest}
                onDownloadTest={handleDownloadTest}
              />
            ))}
          </List>
        ),
      },
      {
        label: 'Учебные',
        icon: <SchoolIcon />,
        content: (
          <List sx={{ width: '100%', maxWidth: 800, p: 0 }}>
            {tests
              .filter((test) => !test.test_is_control)
              .map((test) => (
                <TestItem
                  key={test.id}
                  test={test}
                  isLoading={loadingStates[test.id]}
                  isDownloading={isDownloading}
                  onDeleteTest={handleDeleteTest}
                  onDownloadTest={handleDownloadTest}
                />
              ))}
          </List>
        ),
      },
      {
        label: 'Контрольные',
        icon: <AssignmentIcon />,
        content: (
          <List sx={{ width: '100%', maxWidth: 800, p: 0 }}>
            {tests
              .filter((test) => test.test_is_control)
              .map((test) => (
                <TestItem
                  key={test.id}
                  test={test}
                  isLoading={loadingStates[test.id]}
                  isDownloading={isDownloading}
                  onDeleteTest={handleDeleteTest}
                  onDownloadTest={handleDownloadTest}
                />
              ))}
          </List>
        ),
      },
    ],
    [tests, loadingStates, isDownloading, handleDownloadTest]
  )

  if (isLoading && isOnline) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress size={60} />
      </Box>
    )
  }

  if (error && isOnline) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="error">
          Ошибка при загрузке тестов: {error.message}
        </Alert>
      </Box>
    )
  }

  if (!isLoading && !error && tests.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6">
          Нет доступных тестов {!isOnline && 'в оффлайн-режиме'}
        </Typography>
      </Box>
    )
  }

  return (
    <Box>
      {!isOnline && (
        <Box sx={{ position: 'fixed', top: 70, right: 20, zIndex: 1000 }}>
          <Chip
            label="Оффлайн режим"
            color="warning"
            icon={<OfflineBoltIcon />}
          />
        </Box>
      )}

      <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', mb: 4 }}>
        Тестирование
      </Typography>

      <TabsWrapper tabs={tabs} />

      <Snackbar
        open={!!syncError}
        autoHideDuration={6000}
        onClose={() => setSyncError(null)}
      >
        <Alert severity="error" onClose={() => setSyncError(null)}>
          {syncError}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!downloadError}
        autoHideDuration={6000}
        onClose={() => setDownloadError(null)}
      >
        <Alert severity="error" onClose={() => setDownloadError(null)}>
          {downloadError}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default TestingPage

/***************************************************************************** */

// import {
//   List,
//   ListItem,
//   Typography,
//   Box,
//   Chip,
//   CircularProgress,
// } from '@mui/material'
// import { Link } from 'react-router-dom'
// import SchoolIcon from '@mui/icons-material/School'
// import AssignmentIcon from '@mui/icons-material/Assignment'

// import ColoredBadge from '@/components/ColoredBadge'
// import TabsWrapper from '@/components/TabsWrapper'

// import { useGetTestsQuery } from '../slices/testApi'

// // Компонент для отображения теста
// function TestItem({ test }) {
//   return (
//     <ListItem
//       component={Link}
//       to={`/tests/${test.id}`}
//       sx={{
//         mb: 3,
//         bgcolor: 'background.paper',
//         borderRadius: '12px',
//         boxShadow: '0 3px 6px rgba(0, 0, 0, 0.1)',
//         textDecoration: 'none',
//         color: 'inherit',
//         display: 'flex',
//         flexDirection: 'column',
//         p: 3,
//         position: 'relative',
//         overflow: 'hidden',
//         transition: 'all 0.3s ease',
//         '&:hover': {
//           transform: 'translateY(-3px)',
//           boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)',
//         },
//       }}
//     >
//       {/* Тег типа теста - верхний правый угол */}
//       <Chip
//         label={test.test_is_control ? 'Контрольный' : 'Учебный'}
//         color={test.test_is_control ? 'primary' : 'secondary'}
//         size="small"
//         icon={
//           test.test_is_control ? (
//             <AssignmentIcon fontSize="small" />
//           ) : (
//             <SchoolIcon fontSize="small" />
//           )
//         }
//         sx={{
//           position: 'absolute',
//           top: 12,
//           right: test.mark ? 40 : 10,
//           height: 26,
//           borderRadius: '12px',
//           fontWeight: '600',
//         }}
//       />

//       {/* Основное содержимое карточки */}
//       <Box
//         sx={{
//           display: 'flex',
//           flexDirection: 'column',
//           width: '100%',
//           // Оставляем место для оценки
//         }}
//       >
//         {/* Заголовок с переносом слов */}
//         <Typography
//           variant="subtitle1"
//           fontWeight="600"
//           sx={{
//             mb: 1,
//             mt: 1.5,
//             wordBreak: 'break-word',
//             display: '-webkit-box',
//             WebkitLineClamp: 2,
//             WebkitBoxOrient: 'vertical',
//             overflow: 'hidden',
//             lineHeight: 1.4,
//           }}
//         >
//           {test.name}
//         </Typography>

//         {/* Описание теста */}
//         <Typography
//           variant="body2"
//           color="text.secondary"
//           sx={{
//             mb: 2,
//             display: '-webkit-box',
//             WebkitLineClamp: 3,
//             WebkitBoxOrient: 'vertical',
//             overflow: 'hidden',
//             lineHeight: 1.5,
//           }}
//         >
//           {test.description}
//         </Typography>

//         {/* Дата прохождения */}
//         {test.is_passed && test.date && (
//           <Typography
//             variant="caption"
//             color="text.secondary"
//             sx={{
//               mt: 'auto',
//               alignSelf: 'flex-start',
//               backgroundColor: 'action.hover',
//               px: 1,
//               borderRadius: '4px',
//             }}
//           >
//             {`Пройден: ${new Date(test.date).toLocaleString()}`}
//           </Typography>
//         )}
//       </Box>

//       {/* Оценка - правый верхний угол (с отступом от тега) */}
//       {test.is_passed && (
//         <Box
//           sx={{
//             position: 'absolute',
//             top: -2,
//             right: test.mark && 12,
//           }}
//         >
//           <ColoredBadge mark={test.mark} />
//         </Box>
//       )}
//     </ListItem>
//   )
// }

// function TestingPage() {
//   const { data: testsData, isLoading, error } = useGetTestsQuery()

//   // Получаем результаты из localStorage
//   const localResults = (() => {
//     try {
//       return JSON.parse(localStorage.getItem('testResults')) || {}
//     } catch {
//       return {}
//     }
//   })()

//   // Мемоизированный список тестов
//   const tests = (testsData?.results || []).map((test) => {
//     const localResult = localResults[test.id]
//     const apiResult = test.test_results?.[0] || {}

//     return localResult
//       ? {
//           ...test,
//           ...apiResult,
//           ...localResult,
//           name: localResult.test_title || test.name,
//           is_passed: localResult.is_passed ?? apiResult.result ?? false,
//           mark: localResult.mark ?? apiResult.mark ?? 0,
//           date: localResult.completion_time ?? apiResult.date ?? null,
//         }
//       : {
//           ...test,
//           ...apiResult,
//           is_passed: apiResult.result ?? false,
//           mark: apiResult.mark ?? 0,
//           date: apiResult.date ?? null,
//         }
//   })

//   if (isLoading) return <CircularProgress size={50} />
//   if (error) return <div>Ошибка при загрузке тестов</div>

//   // Вкладки с фильтрацией тестов (остается без изменений)
//   const tabs = [
//     {
//       label: 'Все тесты',
//       icon: <SchoolIcon />,
//       content: (
//         <List sx={{ width: '100%', maxWidth: 800, p: 0 }}>
//           {tests.map((test) => (
//             <TestItem key={test.id} test={test} />
//           ))}
//         </List>
//       ),
//     },
//     {
//       label: 'Учебные',
//       icon: <SchoolIcon />,
//       content: (
//         <List sx={{ width: '100%', maxWidth: 800, p: 0 }}>
//           {tests
//             .filter((test) => !test.test_is_control)
//             .map((test) => (
//               <TestItem key={test.id} test={test} />
//             ))}
//         </List>
//       ),
//     },
//     {
//       label: 'Контрольные',
//       icon: <AssignmentIcon />,
//       content: (
//         <List sx={{ width: '100%', maxWidth: 800, p: 0 }}>
//           {tests
//             .filter((test) => test.test_is_control)
//             .map((test) => (
//               <TestItem key={test.id} test={test} />
//             ))}
//         </List>
//       ),
//     },
//   ]

//   return (
//     <Box>
//       <Typography
//         variant="h4"
//         gutterBottom
//         sx={{
//           textAlign: 'center',
//           mb: 4,
//           fontWeight: 'bold',
//           color: 'primary.main',
//         }}
//       >
//         Тестирование
//       </Typography>
//       <TabsWrapper tabs={tabs} />
//     </Box>
//   )
// }

// export default TestingPage

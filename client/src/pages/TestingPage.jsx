/* eslint-disable operator-linebreak */
/* eslint-disable indent */

import { useState, useEffect, useCallback } from 'react'
import {
  List,
  ListItem,
  Typography,
  Box,
  Chip,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material'
import { Link } from 'react-router-dom'
import SchoolIcon from '@mui/icons-material/School'
import AssignmentIcon from '@mui/icons-material/Assignment'
import OfflineBoltIcon from '@mui/icons-material/OfflineBolt'

import ColoredBadge from '@/components/ColoredBadge'
import TabsWrapper from '@/components/TabsWrapper'
import { useGetTestsQuery } from '../slices/testApi'
import { initDB, getTestsFromDB, saveTestToDB } from '../service/offlineDB'
import useTestResults from '../hook/useTestResults'

function TestItem({ test, isLoading }) {
  return (
    <ListItem
      component={Link}
      to={`/tests/${test.id}`}
      sx={{
        mb: 3,
        bgcolor: 'background.paper',
        borderRadius: '12px',
        boxShadow: '0 3px 6px rgba(0, 0, 0, 0.1)',
        textDecoration: 'none',
        color: 'inherit',
        display: 'flex',
        flexDirection: 'column',
        p: 3,
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)',
        },
      }}
    >
      {isLoading && (
        <CircularProgress
          size={24}
          sx={{
            position: 'absolute',
            top: 16,
            left: 16,
          }}
        />
      )}

      {/* Тег типа теста - верхний правый угол */}
      <Chip
        label={test.test_is_control ? 'Контрольный' : 'Учебный'}
        color={test.test_is_control ? 'primary' : 'secondary'}
        size="small"
        icon={
          test.test_is_control ? (
            <AssignmentIcon fontSize="small" />
          ) : (
            <SchoolIcon fontSize="small" />
          )
        }
        sx={{
          position: 'absolute',
          top: 12,
          right: test.mark ? 40 : 10,
          height: 26,
          borderRadius: '12px',
          fontWeight: '600',
        }}
      />

      {/* Основное содержимое карточки */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          // Оставляем место для оценки
        }}
      >
        {/* Заголовок с переносом слов */}
        <Typography
          variant="subtitle1"
          fontWeight="600"
          sx={{
            mb: 1,
            mt: 1.5,
            wordBreak: 'break-word',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: 1.4,
          }}
        >
          {test.name}
        </Typography>

        {/* Описание теста */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: 1.5,
          }}
        >
          {test.description}
        </Typography>

        {/* Дата прохождения */}
        {test.is_passed && test.date && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              mt: 'auto',
              alignSelf: 'flex-start',
              backgroundColor: 'action.hover',
              px: 1,
              borderRadius: '4px',
            }}
          >
            {`Пройден: ${new Date(test.date).toLocaleString()}`}
          </Typography>
        )}
      </Box>

      {/* Оценка - правый верхний угол (с отступом от тега) */}
      {test.is_passed && (
        <Box
          sx={{
            position: 'absolute',
            top: -2,
            right: test.mark && 12,
          }}
        >
          <ColoredBadge mark={test.mark} />
        </Box>
      )}
    </ListItem>
  )
}

function TestingPage() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [offlineTests, setOfflineTests] = useState([])
  const [syncError, setSyncError] = useState(null)
  const [loadingStates, setLoadingStates] = useState({})

  const { getTestResults, syncPendingResults } = useTestResults()
  const {
    data: testsData,
    isLoading,
    error,
    refetch,
  } = useGetTestsQuery(undefined, {
    skip: !isOnline,
  })

  useEffect(() => {
    const initOfflineData = async () => {
      try {
        await initDB()
        if (!isOnline) {
          const tests = await getTestsFromDB()
          setOfflineTests(tests)
          await syncPendingResults().catch((e) => {
            console.warn('Sync pending results failed:', e)
          })
        }
      } catch (e) {
        console.error('Offline init failed:', e)
      }
    }

    initOfflineData()
  }, [isOnline, syncPendingResults])

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      refetch()
      syncPendingResults().catch((e) => {
        setSyncError('Ошибка синхронизации результатов')
        console.error('Sync error:', e)
      })
    }

    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [refetch, syncPendingResults])

  useEffect(() => {
    if (testsData?.results && isOnline) {
      const cacheTests = async () => {
        try {
          await Promise.all(testsData.results.map((test) => saveTestToDB(test)))
        } catch (e) {
          console.error('Cache tests failed:', e)
          setSyncError('Не удалось сохранить тесты для оффлайн-режима')
        }
      }
      cacheTests()
    }
  }, [testsData, isOnline])

  const getMergedTests = useCallback(async () => {
    const sourceTests = isOnline ? testsData?.results || [] : offlineTests
    const merged = []

    for (const test of sourceTests) {
      try {
        setLoadingStates((prev) => ({ ...prev, [test.id]: true }))
        const results = await getTestResults(test.id)
        const latest = results[0] || {}

        merged.push({
          ...test,
          ...latest,
          name: latest.test_title || test.name,
          is_passed: latest.is_passed ?? false,
          mark: latest.mark ?? 0,
          date: latest.completion_time ?? null,
        })
      } catch (e) {
        console.error(`Failed to load results for test ${test.id}:`, e)
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

  const tabs = [
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
              />
            ))}
        </List>
      ),
    },
  ]

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

/* eslint-disable operator-linebreak */
/* eslint-disable indent */

import {
  List,
  ListItem,
  Typography,
  Box,
  Chip,
  CircularProgress,
} from '@mui/material'
import { Link } from 'react-router-dom'
import SchoolIcon from '@mui/icons-material/School'
import AssignmentIcon from '@mui/icons-material/Assignment'

import ColoredBadge from '@/components/ColoredBadge'
import TabsWrapper from '@/components/TabsWrapper'

import { useGetTestsQuery } from '../slices/testApi'

// Компонент для отображения теста
function TestItem({ test }) {
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
  const { data: testsData, isLoading, error } = useGetTestsQuery()

  // Получаем результаты из localStorage
  const localResults = (() => {
    try {
      return JSON.parse(localStorage.getItem('testResults')) || {}
    } catch {
      return {}
    }
  })()

  // Мемоизированный список тестов
  const tests = (testsData?.results || []).map((test) => {
    const localResult = localResults[test.id]
    const apiResult = test.test_results?.[0] || {}

    return localResult
      ? {
          ...test,
          ...apiResult,
          ...localResult,
          name: localResult.test_title || test.name,
          is_passed: localResult.is_passed ?? apiResult.result ?? false,
          mark: localResult.mark ?? apiResult.mark ?? 0,
          date: localResult.completion_time ?? apiResult.date ?? null,
        }
      : {
          ...test,
          ...apiResult,
          is_passed: apiResult.result ?? false,
          mark: apiResult.mark ?? 0,
          date: apiResult.date ?? null,
        }
  })

  if (isLoading) return <CircularProgress size={50} />
  if (error) return <div>Ошибка при загрузке тестов</div>

  // Вкладки с фильтрацией тестов (остается без изменений)
  const tabs = [
    {
      label: 'Все тесты',
      icon: <SchoolIcon />,
      content: (
        <List sx={{ width: '100%', maxWidth: 800, p: 0 }}>
          {tests.map((test) => (
            <TestItem key={test.id} test={test} />
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
              <TestItem key={test.id} test={test} />
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
              <TestItem key={test.id} test={test} />
            ))}
        </List>
      ),
    },
  ]

  return (
    <Box>
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          textAlign: 'center',
          mb: 4,
          fontWeight: 'bold',
          color: 'primary.main',
        }}
      >
        Тестирование
      </Typography>
      <TabsWrapper tabs={tabs} />
    </Box>
  )
}

export default TestingPage

// /* eslint-disable operator-linebreak */
// /* eslint-disable indent */
// import { useState, useEffect } from 'react'
// import { List, ListItem, Typography, Box } from '@mui/material'
// import { Link } from 'react-router-dom'

// import ColoredBadge from '@/components/ColoredBadge'

// import { testingList } from '../service/constValues'
// import { useGetTestsQuery } from '../slices/testApi'

// function TestingPage() {
//   const [tests, setTests] = useState([])
//   const { data: testsData, isLoading, error } = useGetTestsQuery()

//   useEffect(() => {
//     const loadTests = () => {
//       const testResults = JSON.parse(localStorage.getItem('testResults')) || {}
//       const updatedTests = testingList.map((test) => {
//         const result = testResults[test.id]
//         return result
//           ? {
//               ...test, // Данные из testingList
//               ...result, // Данные из localStorage
//               name: result.test_title || test.name, // Используем test_title, если он есть
//               is_passed: result.is_passed || test.is_passed, // Обновляем статус прохождения
//               mark: result.mark || test.mark, // Используем оценку из localStorage, если она есть
//               date: result.completion_time ||
//                test.date, // Используем completion_time, если он есть
//             }
//           : test
//       })
//       setTests(updatedTests)
//     }

//     setTimeout(loadTests, 300)
//   }, [])

//   return (
//     <Box sx={{ p: 3 }}>
//       <Typography variant="h4" gutterBottom>
//         Список всех тестов
//       </Typography>

//       <List
//         sx={{
//           width: '100%',
//           maxWidth: 800,
//         }}
//       >
//         {tests?.map((test) => (
//           <ListItem
//             key={test.id}
//             component={Link}
//             to={`/tests/${test.id}`}
//             sx={{
//               mb: 2,
//               bgcolor: 'background.paper',
//               borderRadius: '10px',
//               boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
//               textDecoration: 'none',
//               color: 'inherit',
//               display: 'flex',
//               justifyContent: 'space-between',
//               alignItems: 'center',
//             }}
//           >
//             <Box>
//               <Typography variant="subtitle1">{test.name}</Typography>
//               <Typography variant="body2" color="text.secondary">
//                 {test.description}
//               </Typography>
//               {test.is_passed && test.date && (
//                 <Typography variant="caption" color="text.secondary">
//                   {`Пройден: ${new Date(test.date).toLocaleString()}`}
//                   {/* Форматируем дату и время */}
//                 </Typography>
//               )}
//             </Box>

//             {test.is_passed && <ColoredBadge mark={test.mark} />}
//           </ListItem>
//         ))}
//       </List>
//     </Box>
//   )
// }

// export default TestingPage

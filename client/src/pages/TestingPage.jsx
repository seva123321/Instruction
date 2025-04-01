/* eslint-disable operator-linebreak */
/* eslint-disable indent */
import { useState, useEffect } from 'react'
import { List, ListItem, Typography, Box } from '@mui/material'
import { Link } from 'react-router-dom'

import ColoredBadge from '@/components/ColoredBadge'

import { testingList } from '../service/constValues'

function TestingPage() {
  const [tests, setTests] = useState([])

  useEffect(() => {
    const loadTests = () => {
      const testResults = JSON.parse(localStorage.getItem('testResults')) || {}
      const updatedTests = testingList.map((test) => {
        const result = testResults[test.id]
        return result
          ? {
              ...test, // Данные из testingList
              ...result, // Данные из localStorage
              name: result.test_title || test.name, // Используем test_title, если он есть
              is_passed: result.is_passed || test.is_passed, // Обновляем статус прохождения
              mark: result.mark || test.mark, // Используем оценку из localStorage, если она есть
              date: result.completion_time || test.date, // Используем completion_time, если он есть
            }
          : test
      })
      setTests(updatedTests)
    }

    setTimeout(loadTests, 300)
  }, [])

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Список всех тестов
      </Typography>

      <List
        sx={{
          width: '100%',
          maxWidth: 800,
        }}
      >
        {tests.map((test) => (
          <ListItem
            key={test.id}
            component={Link}
            to={`/tests/${test.id}`}
            sx={{
              mb: 2,
              bgcolor: 'background.paper',
              borderRadius: '10px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              textDecoration: 'none',
              color: 'inherit',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Box>
              <Typography variant="subtitle1">{test.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {test.description}
              </Typography>
              {test.is_passed && test.date && (
                <Typography variant="caption" color="text.secondary">
                  {`Пройден: ${new Date(test.date).toLocaleString()}`}
                  {/* Форматируем дату и время */}
                </Typography>
              )}
            </Box>

            {test.is_passed && <ColoredBadge mark={test.mark} />}
          </ListItem>
        ))}
      </List>
    </Box>
  )
}

export default TestingPage

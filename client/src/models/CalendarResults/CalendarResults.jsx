import React, { useEffect, useState, useCallback, memo } from 'react'
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  useTheme,
  useMediaQuery,
  IconButton,
  Divider,
  Grid,
  Grid2,
} from '@mui/material'
import { ChevronLeft, ChevronRight } from '@mui/icons-material'
import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  addMonths,
  getDay,
  addDays,
} from 'date-fns'
import { ru } from 'date-fns/locale'

import { getTestsFromDB } from '@/service/offlineDB'

import TestResultsList from '../../components/TestResultsList'
import CalendarDay from '../../components/CalendarDay'
import Legend from '../../components/CalendarLegend'
import { useLazyGetTestsQuery } from '../../slices/testApi'

const WEEK_DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
const MIN_CALENDAR_WIDTH = 700
const LOADER_MIN_HEIGHT = 200

const MemoizedCalendarDay = memo(CalendarDay)
const MemoizedTestResultsList = memo(TestResultsList)

function CalendarResults() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentDate, setCurrentDate] = useState(new Date())
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [getTests] = useLazyGetTestsQuery()

  // Загрузка данных
  useEffect(() => {
    const processTestResults = (tests) =>
      tests.flatMap(
        (test) =>
          test.test_results
            ?.filter((r) => r.completion_time)
            .map((result) => ({
              id: result.id,
              date: parseISO(result.completion_time),
              testName: test.name,
              mark: result.mark,
              score: result.score,
              totalPoints: result.total_points,
              duration: result.test_duration,
              isPassed: result.is_passed,
              testId: test.id,
            })) || []
      )

    const fetchFromServer = async () => {
      try {
        const serverTests = await getTests()
        if (serverTests?.length) {
          return processTestResults(serverTests)
        }
        setError('Нет данных о тестах')
      } catch (serverError) {
        console.error('Ошибка при загрузке с сервера:', serverError)
        setError('Не удалось загрузить результаты тестов')
      }
      return null
    }

    const fetchTestResults = async () => {
      try {
        // Пытаемся получить данные из локальной БД в первую очередь
        const localTests = await getTestsFromDB()
        if (localTests?.length) {
          setEvents(processTestResults(localTests))
          setLoading(false)
          return
        }
      } catch (localError) {
        console.error('Ошибка при загрузке из локальной БД:', localError)
      }

      // Если локальные данные недоступны или пустые, пробуем сервер
      const serverEvents = await fetchFromServer()
      if (serverEvents) {
        setEvents(serverEvents)
      }
      setLoading(false)
    }

    fetchTestResults()
  }, [getTests])

  // Обработчики навигации
  const handlePrevMonth = useCallback(
    () => setCurrentDate(addMonths(currentDate, -1)),
    [currentDate]
  )

  const handleNextMonth = useCallback(
    () => setCurrentDate(addMonths(currentDate, 1)),
    [currentDate]
  )

  // Фильтрация событий по дням
  const getEventsForDay = useCallback(
    (day) => events.filter((event) => isSameDay(event.date, day)),
    [events]
  )

  // Генерация структуры месяца
  const renderMonthView = useCallback(() => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

    // Получаем первый день текущего месяца и его день недели (0-воскресенье, 1-понедельник и т.д.)
    const startDayOfWeek = getDay(monthStart)
    // Вычисляем сколько дней предыдущего месяца нужно показать
    const daysFromPrevMonth = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1

    // Получаем даты предыдущего месяца
    const prevMonthDays = []
    if (daysFromPrevMonth > 0) {
      const prevMonthEnd = addDays(monthStart, -1)
      const prevMonthStart = addDays(prevMonthEnd, -daysFromPrevMonth + 1)
      prevMonthDays.push(
        ...eachDayOfInterval({ start: prevMonthStart, end: prevMonthEnd })
      )
    }

    // Вычисляем сколько дней следующего месяца нужно показать
    const totalCells = prevMonthDays.length + daysInMonth.length
    const remainingCells = 7 - (totalCells % 7)
    const daysFromNextMonth = remainingCells === 7 ? 0 : remainingCells

    // Получаем даты следующего месяца
    const nextMonthDays = []
    if (daysFromNextMonth > 0) {
      const nextMonthStart = addDays(monthEnd, 1)
      const nextMonthEnd = addDays(nextMonthStart, daysFromNextMonth - 1)
      nextMonthDays.push(
        ...eachDayOfInterval({ start: nextMonthStart, end: nextMonthEnd })
      )
    }

    // Объединяем все дни
    const allDays = [...prevMonthDays, ...daysInMonth, ...nextMonthDays]

    // Разбиваем на недели
    const weeks = []
    for (let i = 0; i < allDays.length; i += 7) {
      weeks.push(allDays.slice(i, i + 7))
    }

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        {/* Заголовок с днями недели */}
        <Grid2 container spacing={0} columns={7} sx={{ mb: 1 }}>
          {WEEK_DAYS.map((day) => (
            <Grid2 size={{ xs: 1 }} key={day}>
              <Typography
                variant="body2"
                align="center"
                sx={{ fontWeight: 'bold' }}
              >
                {day}
              </Typography>
            </Grid2>
          ))}
        </Grid2>

        {/* Ячейки календаря */}
        {weeks.map((oneWeek, weekIndex) => (
          <Grid
            container
            spacing={0}
            columns={7}
            key={oneWeek[weekIndex]}
            sx={{ flex: 1 }}
          >
            {oneWeek.map((day) => {
              const isCurrentMonth = isSameMonth(day, currentDate)
              return (
                <Grid item xs={1} key={day.toString()}>
                  <MemoizedCalendarDay
                    day={day}
                    currentDate={currentDate}
                    getEventsForDay={getEventsForDay}
                    theme={theme}
                    isOtherMonth={!isCurrentMonth}
                  />
                </Grid>
              )
            })}
          </Grid>
        ))}
      </Box>
    )
  }, [currentDate, getEventsForDay, theme])

  if (loading) return <LoadingIndicator />
  if (error) return <ErrorIndicator error={error} />

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
      <Header
        currentDate={currentDate}
        onPrev={handlePrevMonth}
        onNext={handleNextMonth}
      />

      <Box sx={{ overflowX: 'auto' }}>
        <Box sx={{ minWidth: isMobile ? '100%' : MIN_CALENDAR_WIDTH }}>
          {renderMonthView()}
        </Box>
      </Box>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
        {`Результаты за ${format(currentDate, 'LLLL yyyy', { locale: ru })}`}
      </Typography>

      <MemoizedTestResultsList
        events={events}
        currentDate={currentDate}
        theme={theme}
      />

      <Legend theme={theme} />
    </Paper>
  )
}

const LoadingIndicator = memo(() => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    minHeight={LOADER_MIN_HEIGHT}
  >
    <CircularProgress />
  </Box>
))

const ErrorIndicator = memo(({ error }) => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    minHeight={LOADER_MIN_HEIGHT}
  >
    <Typography color="error">{error}</Typography>
  </Box>
))

const Header = memo(({ currentDate, onPrev, onNext }) => (
  <Box
    display="flex"
    justifyContent="space-between"
    alignItems="center"
    mb={2}
    flexWrap="wrap"
    gap={2}
  >
    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
      Календарь результатов тестов
    </Typography>
    <Box display="flex" alignItems="center">
      <IconButton
        onClick={onPrev}
        sx={{ color: (theme) => theme.palette.primary.main }}
      >
        <ChevronLeft />
      </IconButton>
      <Typography variant="h6" sx={{ mx: 2, fontWeight: 'bold' }}>
        {format(currentDate, 'LLLL yyyy', { locale: ru })}
      </Typography>
      <IconButton
        onClick={onNext}
        sx={{ color: (theme) => theme.palette.primary.main }}
      >
        <ChevronRight />
      </IconButton>
    </Box>
  </Box>
))

export default CalendarResults

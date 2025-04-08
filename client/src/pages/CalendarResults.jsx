import React, { useEffect, useState, useCallback, memo } from 'react'
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Tooltip,
  useTheme,
  useMediaQuery,
  IconButton,
  Divider,
  Grid,
  Avatar,
} from '@mui/material'
import { ChevronLeft, ChevronRight, Event } from '@mui/icons-material'
import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  getDay,
} from 'date-fns'
import { ru } from 'date-fns/locale'
import { getTestsFromDB } from '@/service/offlineDB'
import TestResultsList from './TestResultsList'
import CalendarDay from './CalendarDay'
// import CalendarHeader from './CalendarHeader'
import Legend from './CalendarLegend'

// Мемоизированные компоненты для предотвращения лишних перерисовок
const MemoizedCalendarDay = memo(CalendarDay)
const MemoizedTestResultsList = memo(TestResultsList)

function CalendarResults() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentDate, setCurrentDate] = useState(new Date())
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  // Загрузка данных
  useEffect(() => {
    const fetchTestResults = async () => {
      try {
        const tests = await getTestsFromDB()
        if (!tests?.length) {
          setError('Нет данных о тестах')
          setLoading(false)
          return
        }

        const allEvents = tests.flatMap(
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

        setEvents(allEvents)
        setLoading(false)
      } catch (err) {
        console.error('Ошибка при загрузке результатов:', err)
        setError('Не удалось загрузить результаты тестов')
        setLoading(false)
      }
    }

    fetchTestResults()
  }, [])

  // Мемоизированные обработчики
  const handlePrevMonth = useCallback(
    () => setCurrentDate(addMonths(currentDate, -1)),
    [currentDate]
  )

  const handleNextMonth = useCallback(
    () => setCurrentDate(addMonths(currentDate, 1)),
    [currentDate]
  )

  // Мемоизированная функция фильтрации событий
  const getEventsForDay = useCallback(
    (day) => events.filter((event) => isSameDay(event.date, day)),
    [events]
  )

  // Генерация структуры месяца
  const renderMonthView = useCallback(() => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })
    const startDayOfWeek = getDay(monthStart)
    const emptyCells = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1

    const weeks = []
    let week = Array(emptyCells).fill(null)

    daysInMonth.forEach((day, index) => {
      week.push(day)
      if (week.length % 7 === 0 || index === daysInMonth.length - 1) {
        while (week.length < 7) week.push(null)
        weeks.push(week)
        week = []
      }
    })

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        {/* <CalendarHeader /> */}

        {weeks.map((week, weekIndex) => (
          <Grid
            container
            spacing={0}
            columns={7}
            key={weekIndex}
            sx={{ flex: 1 }}
          >
            {week.map((day, dayIndex) => (
              <Grid
                item
                xs={1}
                key={day?.toString() || `empty-${weekIndex}-${dayIndex}`}
              >
                {day ? (
                  <MemoizedCalendarDay
                    day={day}
                    currentDate={currentDate}
                    getEventsForDay={getEventsForDay}
                    theme={theme}
                  />
                ) : (
                  <EmptyDayCell />
                )}
              </Grid>
            ))}
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
        <Box sx={{ minWidth: 700 }}>{renderMonthView()}</Box>
      </Box>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
        Результаты за {format(currentDate, 'LLLL yyyy', { locale: ru })}
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

// Вынесенные компоненты
const EmptyDayCell = React.memo(() => (
  <Box
    sx={{
      height: '100%',
      minHeight: 80,
      border: '1px solid',
      borderColor: (theme) => theme.palette.divider,
      bgcolor: (theme) => theme.palette.grey[50],
    }}
  />
))

const LoadingIndicator = () => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    minHeight="200px"
  >
    <CircularProgress />
  </Box>
)

const ErrorIndicator = ({ error }) => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    minHeight="200px"
  >
    <Typography color="error">{error}</Typography>
  </Box>
)

const Header = React.memo(({ currentDate, onPrev, onNext }) => (
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

// import React, { useEffect, useState } from 'react'
// import {
//   Box,
//   Typography,
//   Paper,
//   CircularProgress,
//   Tooltip,
//   useTheme,
//   useMediaQuery,
//   IconButton,
//   Divider,
//   Card,
//   CardContent,
//   Chip,
//   Grid,
//   Avatar,
//   ListItem,
//   List,
// } from '@mui/material'
// import {
//   ChevronLeft,
//   ChevronRight,
//   Event,
//   CheckCircle,
//   Cancel,
// } from '@mui/icons-material'
// import {
//   format,
//   parseISO,
//   startOfMonth,
//   endOfMonth,
//   eachDayOfInterval,
//   isSameMonth,
//   isSameDay,
//   addMonths,
//   getDay,
// } from 'date-fns'
// import { ru } from 'date-fns/locale'
// import { getTestEnding } from '@/service/utilsFunction'
// import { getTestsFromDB } from '@/service/offlineDB'

// function CalendarResults() {
//   const [events, setEvents] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState(null)
//   const [currentDate, setCurrentDate] = useState(new Date())
//   const theme = useTheme()
//   const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

//   useEffect(() => {
//     const fetchTestResults = async () => {
//       try {
//         const tests = await getTestsFromDB()
//         if (!tests || tests.length === 0) {
//           setError('Нет данных о тестах')
//           setLoading(false)
//           return
//         }

//         const allEvents = []

//         tests.forEach((test) => {
//           if (test.test_results && test.test_results.length > 0) {
//             test.test_results.forEach((result) => {
//               if (result.completion_time) {
//                 const eventDate = parseISO(result.completion_time)

//                 allEvents.push({
//                   id: result.id,
//                   date: eventDate,
//                   testName: test.name,
//                   mark: result.mark,
//                   score: result.score,
//                   totalPoints: result.total_points,
//                   duration: result.test_duration,
//                   isPassed: result.is_passed,
//                   testId: test.id,
//                 })
//               }
//             })
//           }
//         })

//         setEvents(allEvents)
//         setLoading(false)
//       } catch (err) {
//         console.error('Ошибка при загрузке результатов:', err)
//         setError('Не удалось загрузить результаты тестов')
//         setLoading(false)
//       }
//     }

//     fetchTestResults()
//   }, [])

//   const handlePrevMonth = () => {
//     setCurrentDate(addMonths(currentDate, -1))
//   }

//   const handleNextMonth = () => {
//     setCurrentDate(addMonths(currentDate, 1))
//   }

//   const getEventsForDay = (day) =>
//     events.filter((event) => isSameDay(event.date, day))

//   const getMarkColor = (mark) => {
//     if (mark >= 8) return 'success'
//     if (mark >= 6) return 'primary'
//     if (mark >= 4) return 'warning'
//     return 'error'
//   }

//   const TooltipTestResults = (dayEvents) => {
//     return (
//       <List>
//         {dayEvents.map((event, index) => (
//           <ListItem
//             sx={{
//               display: 'flex',
//               flexDirection: 'column',
//               alignItems: 'flex-start',
//               borderTop: '1px solid grey',
//             }}
//             // key={event.id + event.duration + event.score}
//             key={index}
//           >
//             <Typography variant="subtitle2">{event.testName}</Typography>
//             <Box display="flex" alignItems="center" gap={1} mt={0.5}>
//               <Typography variant="body2">
//                 {`Оценка: ${event.mark}/10`}
//               </Typography>
//             </Box>
//             <Typography variant="body2" mt={0.5}>
//               {`Баллы: ${event.score}/${event.totalPoints}`}
//             </Typography>
//             <Typography variant="body2">
//               {`Длительность: ${event.duration} сек`}
//             </Typography>
//             <Typography variant="body2">
//               {`Статус: ${event.isPassed ? 'Пройден' : 'Не пройден'}`}
//             </Typography>
//           </ListItem>
//         ))}
//       </List>
//     )
//   }

//   const renderDay = (day) => {
//     const dayEvents = getEventsForDay(day)
//     const isCurrentMonth = isSameMonth(day, currentDate)
//     const isToday = isSameDay(day, new Date())

//     return (
//       <Box
//         key={day.toString()}
//         sx={{
//           height: '100%',
//           minHeight: 80,
//           border: '1px solid',
//           borderColor: theme.palette.divider,
//           p: 0.5,
//           bgcolor: isToday ? theme.palette.action.selected : 'background.paper',
//           opacity: isCurrentMonth ? 1 : 0.6,
//           position: 'relative',
//           '&:hover': {
//             bgcolor: theme.palette.action.hover,
//           },
//           display: 'flex',
//           flexDirection: 'column',
//         }}
//       >
//         <Typography
//           variant="body2"
//           sx={{
//             textAlign: 'right',
//             color: isToday ? theme.palette.primary.main : 'text.secondary',
//             fontWeight: isToday ? 'bold' : 'normal',
//           }}
//         >
//           {format(day, 'd')}
//         </Typography>

//         {dayEvents.length > 0 && (
//           <Box
//             sx={{
//               flex: 1,
//               display: 'flex',
//               flexDirection: 'column',
//               justifyContent: 'center',
//               alignItems: 'center',
//               mt: 0.5,
//             }}
//           >
//             <Tooltip title={TooltipTestResults(dayEvents)} arrow>
//               <Box
//                 sx={{
//                   display: 'flex',
//                   flexDirection: 'column',
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                   width: '100%',
//                   position: 'absolute',
//                 }}
//               >
//                 <Avatar
//                   sx={{
//                     width: 28,
//                     height: 28,
//                     bgcolor: theme.palette.primary.main,
//                     color: theme.palette.primary.contrastText,
//                     fontSize: '0.8rem',
//                     mb: 0.5,
//                   }}
//                 >
//                   {dayEvents.length}
//                 </Avatar>
//                 <Typography
//                   variant="caption"
//                   sx={{
//                     textAlign: 'center',
//                     color: theme.palette.primary.main,
//                     fontWeight: 'medium',
//                   }}
//                 >
//                   {`тест${getTestEnding(dayEvents.length)}`}
//                 </Typography>
//               </Box>
//             </Tooltip>
//           </Box>
//         )}
//       </Box>
//     )
//   }

//   const renderMonthView = () => {
//     const monthStart = startOfMonth(currentDate)
//     const monthEnd = endOfMonth(currentDate)
//     const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

//     const startDayOfWeek = getDay(monthStart)
//     const emptyCells = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1

//     const weeks = []
//     let week = []

//     for (let i = 0; i < emptyCells; i++) {
//       week.push(null)
//     }

//     daysInMonth.forEach((day, index) => {
//       week.push(day)
//       if (week.length % 7 === 0 || index === daysInMonth.length - 1) {
//         while (week.length < 7) {
//           week.push(null)
//         }
//         weeks.push(week)
//         week = []
//       }
//     })

//     return (
//       <Box sx={{ display: 'flex', flexDirection: 'column' }}>
//         {/* Заголовки дней недели */}
//         <Grid container spacing={0} columns={7}>
//           {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day) => (
//             <Grid item xs={1} key={day}>
//               <Box
//                 sx={{
//                   textAlign: 'center',
//                   p: 1,
//                   fontWeight: 'bold',
//                   bgcolor: theme.palette.grey[100],
//                   border: '1px solid',
//                   borderColor: theme.palette.divider,
//                 }}
//               >
//                 <Typography variant="body2">{day}</Typography>
//               </Box>
//             </Grid>
//           ))}
//         </Grid>

//         {/* Недели календаря */}
//         {weeks.map((week, weekIndex) => (
//           <Grid
//             container
//             spacing={0}
//             columns={7}
//             key={weekIndex}
//             sx={{ flex: 1 }}
//           >
//             {week.map((day, dayIndex) => (
//               <Grid
//                 item
//                 xs={1}
//                 key={day ? day.toString() : `empty-${weekIndex}-${dayIndex}`}
//                 sx={{ height: '100%' }}
//               >
//                 {day ? (
//                   renderDay(day)
//                 ) : (
//                   <Box
//                     sx={{
//                       height: '100%',
//                       minHeight: 80,
//                       border: '1px solid',
//                       borderColor: theme.palette.divider,
//                       bgcolor: theme.palette.grey[50],
//                     }}
//                   />
//                 )}
//               </Grid>
//             ))}
//           </Grid>
//         ))}
//       </Box>
//     )
//   }

//   const renderEventList = () => {
//     const monthEvents = events
//       .filter((event) => isSameMonth(event.date, currentDate))
//       .sort((a, b) => b.date - a.date)

//     if (monthEvents.length === 0) {
//       return (
//         <Box sx={{ textAlign: 'center', p: 3 }}>
//           <Event color="disabled" sx={{ fontSize: 40, mb: 1 }} />
//           <Typography variant="body1" color="text.secondary">
//             Нет результатов тестов в этом месяце
//           </Typography>
//         </Box>
//       )
//     }

//     return (
//       <Box sx={{ mt: 2 }}>
//         {monthEvents.map((event) => (
//           <Card
//             key={event.id}
//             sx={{
//               mb: 1.5,
//               borderLeft: `4px solid ${theme.palette[getMarkColor(event.mark)].main}`,
//               transition: 'transform 0.2s',
//               '&:hover': {
//                 transform: 'translateY(-2px)',
//                 boxShadow: theme.shadows[2],
//               },
//             }}
//           >
//             <CardContent sx={{ p: 2 }}>
//               <Box
//                 display="flex"
//                 justifyContent="space-between"
//                 alignItems="center"
//               >
//                 <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
//                   {event.testName}
//                 </Typography>
//                 <Avatar
//                   sx={{
//                     width: 32,
//                     height: 32,
//                     bgcolor: theme.palette[getMarkColor(event.mark)].main,
//                     color: theme.palette[getMarkColor(event.mark)].contrastText,
//                   }}
//                 >
//                   {event.mark}
//                 </Avatar>
//               </Box>

//               <Typography
//                 variant="body2"
//                 color="text.secondary"
//                 sx={{ mt: 0.5 }}
//               >
//                 {format(event.date, 'PPPP', { locale: ru })}
//               </Typography>

//               <Box display="flex" mt={1.5} gap={1} flexWrap="wrap">
//                 <Chip
//                   label={`${event.score}/${event.totalPoints} баллов`}
//                   size="small"
//                   variant="outlined"
//                 />
//                 <Chip
//                   label={`${event.duration} сек`}
//                   size="small"
//                   variant="outlined"
//                 />
//                 {event.isPassed ? (
//                   <Chip
//                     label="Пройден"
//                     color="success"
//                     size="small"
//                     icon={<CheckCircle fontSize="small" />}
//                   />
//                 ) : (
//                   <Chip
//                     label="Не пройден"
//                     color="error"
//                     size="small"
//                     icon={<Cancel fontSize="small" />}
//                   />
//                 )}
//               </Box>
//             </CardContent>
//           </Card>
//         ))}
//       </Box>
//     )
//   }

//   if (loading) {
//     return (
//       <Box
//         display="flex"
//         justifyContent="center"
//         alignItems="center"
//         minHeight="200px"
//       >
//         <CircularProgress />
//       </Box>
//     )
//   }

//   if (error) {
//     return (
//       <Box
//         display="flex"
//         justifyContent="center"
//         alignItems="center"
//         minHeight="200px"
//       >
//         <Typography color="error">{error}</Typography>
//       </Box>
//     )
//   }

//   return (
//     <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
//       <Box
//         display="flex"
//         justifyContent="space-between"
//         alignItems="center"
//         mb={2}
//         flexWrap="wrap"
//         gap={2}
//       >
//         <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
//           Календарь результатов тестов
//         </Typography>
//         <Box display="flex" alignItems="center">
//           <IconButton
//             onClick={handlePrevMonth}
//             sx={{ color: theme.palette.primary.main }}
//           >
//             <ChevronLeft />
//           </IconButton>
//           <Typography variant="h6" sx={{ mx: 2, fontWeight: 'bold' }}>
//             {format(currentDate, 'LLLL yyyy', { locale: ru })}
//           </Typography>
//           <IconButton
//             onClick={handleNextMonth}
//             sx={{ color: theme.palette.primary.main }}
//           >
//             <ChevronRight />
//           </IconButton>
//         </Box>
//       </Box>

//       <Box sx={{ overflowX: 'auto' }}>
//         <Box sx={{ minWidth: 700 }}>{renderMonthView()}</Box>
//       </Box>

//       <Divider sx={{ my: 3 }} />

//       <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
//         Результаты за {format(currentDate, 'LLLL yyyy', { locale: ru })}
//       </Typography>

//       {renderEventList()}

//       <Box
//         sx={{ mt: 3, p: 2, bgcolor: theme.palette.grey[100], borderRadius: 2 }}
//       >
//         <Typography
//           variant="subtitle1"
//           gutterBottom
//           sx={{ fontWeight: 'bold' }}
//         >
//           Легенда оценок:
//         </Typography>
//         <Grid container spacing={1}>
//           {[
//             { range: '8-10', color: 'success' },
//             { range: '6-7', color: 'primary' },
//             { range: '4-5', color: 'warning' },
//             { range: '1-3', color: 'error' },
//           ].map((item) => (
//             <Grid item xs={6} sm={3} key={item.color}>
//               <Box display="flex" alignItems="center">
//                 <Avatar
//                   sx={{
//                     width: 24,
//                     height: 24,
//                     bgcolor: theme.palette[item.color].main,
//                     color: theme.palette[item.color].contrastText,
//                     fontSize: '0.75rem',
//                     mr: 1,
//                   }}
//                 >
//                   {item.range.split('-')[0]}
//                 </Avatar>
//                 <Typography variant="body2">{item.range}</Typography>
//               </Box>
//             </Grid>
//           ))}
//         </Grid>
//       </Box>
//     </Paper>
//   )
// }

// export default CalendarResults

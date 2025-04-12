/* eslint-disable operator-linebreak */
/* eslint-disable operator-linebreak */
import React from 'react'
import PropTypes from 'prop-types'
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  Divider,
  Paper,
  Chip,
  Stack,
  useTheme,
  useMediaQuery,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  Alert,
  Tooltip,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import {
  CheckCircleOutline,
  ErrorOutline,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material'

import { getTestEnding } from '@/service/utilsFunction'

function TestResultsView({
  testTitle = '',
  score = 0,
  totalPoints = 0,
  mark = '0',
  answers = [],
  questions = [],
  startTime = new Date().toISOString(),
  completionTime = new Date().toISOString(),
  duration = 0,
  onRestart = () => {},
  isControlTest = false,
}) {
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [loading, setLoading] = React.useState(false)
  const handleBack = () => navigate('/tests')

  // Проверка наличия необходимых данных
  if (!questions.length || !answers.length) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  const formatTime = (time) => {
    try {
      return new Date(time).toLocaleString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return 'Нет данных'
    }
  }

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins > 0 ? `${mins} мин ` : ''}${secs} сек`
  }

  const handleRestart = async () => {
    setLoading(true)
    try {
      await onRestart()
    } finally {
      setLoading(false)
    }
  }

  if (!questions || !answers) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="error">Не удалось загрузить результаты теста</Alert>
        <Button variant="contained" onClick={onRestart} sx={{ mt: 2 }}>
          Попробовать снова
        </Button>
      </Box>
    )
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Paper
        elevation={isMobile ? 0 : 3}
        sx={{
          p: isMobile ? 2 : 4,
          maxWidth: 800,
          mx: 'auto',
          my: 0,
          bgcolor: 'background.paper',
          borderRadius: isMobile ? 0 : 2,
        }}
      >
        {/* Заголовок */}
        <Typography
          variant={isMobile ? 'h5' : 'h4'}
          component="h1"
          gutterBottom
          sx={{ fontWeight: 600 }}
        >
          {`Результаты теста: ${testTitle || 'Без названия'}`}
        </Typography>

        {/* Основная статистика */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: 3,
            mb: 4,
          }}
        >
          {/* Блок с результатами */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 500 }}>
              Общий результат
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <Tooltip title="Количество баллов из максимально возможных">
                <Chip
                  label={`${score}/${totalPoints}`}
                  color="primary"
                  size={isMobile ? 'medium' : 'large'}
                />
              </Tooltip>
              <Tooltip title="Оценка по 10ти бальной шкале">
                <Chip
                  label={`Оценка: ${mark}/10`}
                  color={parseFloat(mark) >= 6 ? 'success' : 'error'}
                  size={isMobile ? 'medium' : 'large'}
                />
              </Tooltip>
            </Stack>
          </Box>

          {/* Блок с временем */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 500 }}>
              Время прохождения
            </Typography>
            <Stack spacing={1}>
              <Typography variant="body2">
                <Box component="span" fontWeight="500">
                  Начало:&nbsp;
                </Box>
                {formatTime(startTime)}
              </Typography>
              <Typography variant="body2">
                <Box component="span" fontWeight="500">
                  Завершение:&nbsp;
                </Box>
                {formatTime(completionTime)}
              </Typography>
              <Typography variant="body2">
                <Box component="span" fontWeight="500">
                  Продолжительность:&nbsp;
                </Box>
                {formatDuration(duration)}
              </Typography>
            </Stack>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Кнопки управления */}
        <Box
          sx={{
            mt: 4,
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: 2,
            justifyContent: 'center',
          }}
        >
          <Button
            variant="contained"
            size={isMobile ? 'small' : 'medium'}
            onClick={handleBack}
            fullWidth={isMobile}
          >
            Вернуться к списку тестов
          </Button>

          {!isControlTest && (
            <Button
              variant="outlined"
              size={isMobile ? 'small' : 'medium'}
              onClick={handleRestart}
              disabled={loading}
              fullWidth={isMobile}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              Решить еще раз
            </Button>
          )}
        </Box>

        {/* Детализация вопросов */}
        {!isControlTest && (
          <Accordion defaultExpanded sx={{ mt: 4 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" sx={{ fontWeight: 500 }}>
                Ответы на вопросы
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0 }}>
              <List>
                {questions.map((question, index) => {
                  const userAnswer = answers.find((a) => a.id === question.id)
                  const isCorrect = userAnswer?.is_correct ?? false
                  const selectedAnswer = question.answers.find(
                    (a) =>
                      a.id.toString() === userAnswer?.selected_id?.toString()
                  )
                  const correctAnswer = question.answers.find(
                    (a) => a.is_correct
                  )

                  return (
                    <React.Fragment key={question.id}>
                      <ListItem
                        sx={{
                          flexDirection: 'column',
                          alignItems: 'flex-start',
                        }}
                      >
                        <Typography variant="subtitle1" fontWeight={500}>
                          {`${index + 1}. ${question.name}`}
                        </Typography>

                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={1}
                          sx={{ my: 1 }}
                        >
                          {isCorrect ? (
                            <CheckCircleOutline color="success" />
                          ) : (
                            <ErrorOutline color="error" />
                          )}
                          <Typography
                            color={isCorrect ? 'success.main' : 'error.main'}
                          >
                            {isCorrect
                              ? `Правильно (+${question.points} балл${getTestEnding(question.points)})`
                              : 'Неправильно (0 баллов)'}
                          </Typography>
                        </Stack>

                        <Typography variant="body2">
                          <Box component="span" fontWeight={500}>
                            Ваш ответ:&nbsp;
                          </Box>
                          <Box
                            component="span"
                            color={isCorrect ? 'success.main' : 'error.main'}
                          >
                            {selectedAnswer?.name || 'Нет ответа'}
                          </Box>
                        </Typography>

                        {!isCorrect && correctAnswer && (
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            <Box component="span" fontWeight={500}>
                              Правильный ответ:&nbsp;
                            </Box>
                            <Box component="span" color="success.main">
                              {correctAnswer.name}
                            </Box>
                          </Typography>
                        )}

                        {userAnswer?.explanation && (
                          <Paper
                            elevation={0}
                            sx={{ p: 2, mt: 2, bgcolor: 'grey.100' }}
                          >
                            <Typography variant="body2">
                              <Box component="span" fontWeight={500}>
                                Объяснение:&nbsp;
                              </Box>
                              {userAnswer.explanation}
                            </Typography>
                          </Paper>
                        )}
                      </ListItem>
                      {index < questions.length - 1 && <Divider />}
                    </React.Fragment>
                  )
                })}
              </List>
            </AccordionDetails>
          </Accordion>
        )}
      </Paper>
    </Box>
  )
}

TestResultsView.propTypes = {
  testTitle: PropTypes.string,
  score: PropTypes.number,
  totalPoints: PropTypes.number,
  mark: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  answers: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      selected_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      is_correct: PropTypes.bool,
      points: PropTypes.number,
      explanation: PropTypes.string,
    })
  ),
  questions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      name: PropTypes.string,
      points: PropTypes.number,
      answers: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
          name: PropTypes.string,
          is_correct: PropTypes.bool,
        })
      ),
      explanation: PropTypes.string,
    })
  ),
  startTime: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.instanceOf(Date),
  ]),
  completionTime: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.instanceOf(Date),
  ]),
  duration: PropTypes.number,
  onRestart: PropTypes.func,
  isControlTest: PropTypes.bool,
}

export default React.memo(TestResultsView)

/* eslint-disable operator-linebreak */
// import React from 'react'
// import PropTypes from 'prop-types'
// import {
//   Box,
//   Typography,
//   Button,
//   List,
//   ListItem,
//   ListItemText,
//   Divider,
//   Paper,
//   Chip,
//   Stack,
//   Grid2,
// } from '@mui/material'
// import { useNavigate } from 'react-router-dom'
// import { CheckCircleOutline, ErrorOutline } from '@mui/icons-material'

// function TestResultsView({
//   testTitle,
//   score,
//   totalPoints,
//   mark,
//   answers,
//   questions,
//   startTime,
//   completionTime,
//   duration,
// }) {
//   const navigate = useNavigate()

//   const handleBack = () => navigate(-1)

//   const formatTime = (time) => new Date(time).toLocaleString()
//   const formatDuration = (seconds) => {
//     const mins = Math.floor(seconds / 60)
//     const secs = seconds % 60
//     return `${mins > 0 ? `${mins} мин ` : ''}${secs} сек`
//   }

//   return (
//     <Paper
//       elevation={3}
//       sx={{
//         p: 4,
//         maxWidth: 800,
//         mx: 'auto',
//         my: 4,
//       }}
//     >
//       <Typography variant="h4" component="h1" gutterBottom>
//         {`Результаты теста: ${testTitle}`}
//       </Typography>

//       <Grid2 container spacing={2} sx={{ mb: 4 }}>
//         <Grid2 xs={12} md={6}>
//           <Typography variant="h6" gutterBottom>
//             Общий результат
//           </Typography>
//           <Box
//             sx={{
//               display: 'flex',
//               alignItems: 'center',
//               gap: 2,
//             }}
//           >
//             <Chip
//               label={`${score}/${totalPoints}`}
//               color="primary"
//               size="medium"
//               variant="outlined"
//             />
//             <Chip
//               label={`Оценка: ${mark}/10`}
//               color={mark >= 6 ? 'success' : 'error'}
//               size="medium"
//             />
//           </Box>
//         </Grid2>

//         <Grid2 xs={12} md={6}>
//           <Typography variant="h6" gutterBottom>
//             Временные показатели
//           </Typography>
//           <Stack spacing={0.5}>
//             <Typography variant="body2" color="text.secondary">
//               {`Начало: ${formatTime(startTime)}`}
//             </Typography>
//             <Typography variant="body2" color="text.secondary">
//               {`Завершение: ${formatTime(completionTime)}`}
//             </Typography>
//             <Typography variant="body2" color="text.secondary">
//               {`Продолжительность: ${formatDuration(duration)}`}
//             </Typography>
//           </Stack>
//         </Grid2>
//       </Grid2>

//       <Divider sx={{ my: 3 }} />

//       <Typography variant="h5" component="h2" gutterBottom>
//         Детализация по вопросам
//       </Typography>

//       <List sx={{ width: '100%' }}>
//         {questions.map((question, index) => {
//           const userAnswer = answers.find((a) => a.id === question.id)
//           const isCorrect = userAnswer?.is_correct || false
//           const selectedAnswerId = userAnswer?.selected_id
//           const selectedAnswer = question.answers.find(
//             (a) => a.id.toString() === selectedAnswerId
//           )
//           const correctAnswer = question.answers.find((a) => a.is_correct)

//           return (
//             <React.Fragment key={question.id}>
//               <ListItem alignItems="flex-start" sx={{ py: 3 }}>
//                 <ListItemText
//                   primary={
//                     <Typography variant="h6" component="h3">
//                       {`Вопрос ${index + 1}: ${question.name}`}
//                     </Typography>
//                   }
//                   secondary={
//                     <Box component="div" sx={{ mt: 1 }}>
//                       <Stack
//                         direction="row"
//                         spacing={1}
//                         alignItems="center"
//                         sx={{ mb: 1 }}
//                       >
//                         {isCorrect ? (
//                           <CheckCircleOutline
//                             color="success"
//                             fontSize="small"
//                           />
//                         ) : (
//                           <ErrorOutline color="error" fontSize="small" />
//                         )}
//                         <Typography
//                           component="span"
//                           variant="body2"
//                           color={isCorrect ? 'success.main' : 'error.main'}
//                         >
//                           {isCorrect
//                             ? `Правильно (+${question.points} балл)`
//                             : 'Неправильно (0 баллов)'}
//                         </Typography>
//                       </Stack>

//                       <Typography component="div" variant="body2">
//                         <Box component="span" fontWeight="bold">
//                           Ваш ответ:
//                         </Box>
//                         {selectedAnswer?.name || 'Нет ответа'}
//                       </Typography>

//                       {!isCorrect && correctAnswer && (
//                         <Typography component="div" variant="body2">
//                           <Box component="span" fontWeight="bold">
//                             Правильный ответ:
//                           </Box>
//                           {correctAnswer.name}
//                         </Typography>
//                       )}

//                       {userAnswer?.explanation && (
//                         <Paper
//                           elevation={0}
//                           sx={{
//                             p: 2,
//                             mt: 1,
//                             bgcolor: 'grey.100',
//                             borderRadius: 1,
//                           }}
//                         >
//                           <Typography component="div" variant="body2">
//                             <Box component="span" fontWeight="bold">
//                               Объяснение:
//                             </Box>
//                             {userAnswer.explanation}
//                           </Typography>
//                         </Paper>
//                       )}
//                     </Box>
//                   }
//                 />
//               </ListItem>
//               {index < questions.length - 1 && <Divider component="li" />}
//             </React.Fragment>
//           )
//         })}
//       </List>

//       <Box
//         sx={{
//           mt: 4,
//           display: 'flex',
//           justifyContent: 'center',
//         }}
//       >
//         <Button
//           variant="contained"
//           size="large"
//           onClick={handleBack}
//           sx={{
//             px: 4,
//             py: 1.5,
//           }}
//         >
//           Вернуться к списку тестов
//         </Button>
//       </Box>
//     </Paper>
//   )
// }

// TestResultsView.propTypes = {
//   testTitle: PropTypes.string.isRequired,
//   score: PropTypes.number.isRequired,
//   totalPoints: PropTypes.number.isRequired,
//   mark: PropTypes.number.isRequired,
//   answers: PropTypes.arrayOf(
//     // Обновили propTypes
//     PropTypes.shape({
//       id: PropTypes.number.isRequired,
//       selected_id: PropTypes.string,
//       is_correct: PropTypes.bool,
//     })
//   ).isRequired,
//   questions: PropTypes.arrayOf(
//     PropTypes.shape({
//       id: PropTypes.number.isRequired,
//       name: PropTypes.string.isRequired,
//       points: PropTypes.number.isRequired,
//       answers: PropTypes.arrayOf(
//         PropTypes.shape({
//           id: PropTypes.number.isRequired,
//           name: PropTypes.string.isRequired,
//           is_correct: PropTypes.bool,
//         })
//       ).isRequired,
//       explanation: PropTypes.string,
//     })
//   ).isRequired,
//   startTime: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)])
//     .isRequired,
//   completionTime: PropTypes.oneOfType([
//     PropTypes.string,
//     PropTypes.instanceOf(Date),
//   ]).isRequired,
//   duration: PropTypes.number.isRequired,
// }

// export default React.memo(TestResultsView)

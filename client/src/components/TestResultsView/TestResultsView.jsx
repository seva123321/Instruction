/* eslint-disable operator-linebreak */
/* eslint-disable operator-linebreak */
import { memo, useState, Fragment } from 'react'
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
  const [loading, setLoading] = useState(false)
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
                    <Fragment key={question.id}>
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
                    </Fragment>
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

export default memo(TestResultsView)

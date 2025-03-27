import React from 'react'
import PropTypes from 'prop-types'
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  Paper,
  Chip,
  Stack,
  Grid2,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { CheckCircleOutline, ErrorOutline } from '@mui/icons-material'

function TestResultsView({
  testTitle,
  score,
  totalPoints,
  mark,
  answers,
  questions,
  startTime,
  completionTime,
  duration,
}) {
  const navigate = useNavigate()

  const handleBack = () => navigate(-1)

  const formatTime = (time) => new Date(time).toLocaleString()
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins > 0 ? `${mins} мин ` : ''}${secs} сек`
  }

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 800, mx: 'auto', my: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {`Результаты теста: ${testTitle}`}
      </Typography>

      <Grid2 container spacing={2} sx={{ mb: 4 }}>
        <Grid2 xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Общий результат
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip
              label={`${score}/${totalPoints}`}
              color="primary"
              size="medium"
              variant="outlined"
            />
            <Chip
              label={`Оценка: ${mark}/10`}
              color={mark >= 6 ? 'success' : 'error'}
              size="medium"
            />
          </Box>
        </Grid2>

        <Grid2 xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Временные показатели
          </Typography>
          <Stack spacing={0.5}>
            <Typography variant="body2" color="text.secondary">
              {`Начало: ${formatTime(startTime)}`}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {`Завершение: ${formatTime(completionTime)}`}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {`Продолжительность: ${formatDuration(duration)}`}
            </Typography>
          </Stack>
        </Grid2>
      </Grid2>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h5" component="h2" gutterBottom>
        Детализация по вопросам
      </Typography>

      <List sx={{ width: '100%' }}>
        {questions.map((question, index) => {
          const userAnswer = answers.find((a) => a.id === question.id)
          const isCorrect = userAnswer?.is_correct || false
          const selectedAnswerId = userAnswer?.selected_id
          const selectedAnswer = question.answers.find(
            (a) => a.id.toString() === selectedAnswerId
          )
          const correctAnswer = question.answers.find((a) => a.is_correct)

          return (
            <React.Fragment key={question.id}>
              <ListItem alignItems="flex-start" sx={{ py: 3 }}>
                <ListItemText
                  primary={
                    <Typography variant="h6" component="h3">
                      {`Вопрос ${index + 1}:${question.name}`}
                    </Typography>
                  }
                  secondary={
                    <Box component="div" sx={{ mt: 1 }}>
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        sx={{ mb: 1 }}
                      >
                        {isCorrect ? (
                          <CheckCircleOutline
                            color="success"
                            fontSize="small"
                          />
                        ) : (
                          <ErrorOutline color="error" fontSize="small" />
                        )}
                        <Typography
                          component="span"
                          variant="body2"
                          color={isCorrect ? 'success.main' : 'error.main'}
                        >
                          {isCorrect
                            ? `Правильно (+${question.points} балл)`
                            : 'Неправильно (0 баллов)'}
                        </Typography>
                      </Stack>

                      <Typography variant="body2" paragraph>
                        <Box component="span" fontWeight="bold">
                          Ваш ответ:
                        </Box>
                        {selectedAnswer?.name || 'Нет ответа'}
                      </Typography>

                      {!isCorrect && correctAnswer && (
                        <Typography variant="body2" paragraph>
                          <Box component="span" fontWeight="bold">
                            Правильный ответ:
                          </Box>
                          {correctAnswer.name}
                        </Typography>
                      )}

                      {userAnswer?.explanation && (
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2,
                            mt: 1,
                            bgcolor: 'grey.100',
                            borderRadius: 1,
                          }}
                        >
                          <Typography variant="body2">
                            <Box component="span" fontWeight="bold">
                              Объяснение:
                            </Box>
                            {userAnswer.explanation}
                          </Typography>
                        </Paper>
                      )}
                    </Box>
                  }
                />
              </ListItem>
              {index < questions.length - 1 && <Divider component="li" />}
            </React.Fragment>
          )
        })}
      </List>

      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <Button
          variant="contained"
          size="large"
          onClick={handleBack}
          sx={{ px: 4, py: 1.5 }}
        >
          Вернуться к списку тестов
        </Button>
      </Box>
    </Paper>
  )
}

TestResultsView.propTypes = {
  testTitle: PropTypes.string.isRequired,
  score: PropTypes.number.isRequired,
  totalPoints: PropTypes.number.isRequired,
  mark: PropTypes.number.isRequired,
  answers: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      selected_id: PropTypes.string,
      is_correct: PropTypes.bool,
      explanation: PropTypes.string,
    })
  ).isRequired,
  questions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      points: PropTypes.number.isRequired,
      answers: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.string.isRequired,
          name: PropTypes.string.isRequired,
          is_correct: PropTypes.bool,
        })
      ).isRequired,
    })
  ).isRequired,
  startTime: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)])
    .isRequired,
  completionTime: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.instanceOf(Date),
  ]).isRequired,
  duration: PropTypes.number.isRequired,
}

export default React.memo(TestResultsView)

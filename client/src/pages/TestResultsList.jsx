import React, { memo } from 'react'
import { Box, Card, CardContent, Typography, Chip, Avatar } from '@mui/material'
import { CheckCircle, Event, Cancel } from '@mui/icons-material'
import { format, isSameMonth } from 'date-fns'
import { ru } from 'date-fns/locale'

const getMarkColor = (mark) => {
  if (mark >= 8) return 'success'
  if (mark >= 6) return 'primary'
  if (mark >= 4) return 'warning'
  return 'error'
}

export const TestResultsList = memo(({ events, currentDate, theme }) => {
  const monthEvents = events
    ?.filter((event) => isSameMonth(event.date, currentDate))
    .sort((a, b) => b.date - a.date)

  if (!monthEvents?.length) {
    return (
      <Box sx={{ textAlign: 'center', p: 3 }}>
        <Event color="disabled" sx={{ fontSize: 40, mb: 1 }} />
        <Typography variant="body1" color="text.secondary">
          Нет результатов тестов в этом месяце
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ mt: 2 }}>
      {monthEvents?.map((event) => (
        <TestResultCard key={event.id} event={event} theme={theme} />
      ))}
    </Box>
  )
})

const TestResultCard = memo(({ event, theme }) => (
  <Card
    sx={{
      mb: 1.5,
      borderLeft: `4px solid ${theme.palette[getMarkColor(event.mark)].main}`,
      transition: 'transform 0.2s',
      '&:hover': { transform: 'translateY(-2px)', boxShadow: theme.shadows[2] },
    }}
  >
    <CardContent sx={{ p: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
          {event.testName}
        </Typography>
        <Avatar
          sx={{
            width: 32,
            height: 32,
            bgcolor: theme.palette[getMarkColor(event.mark)].main,
            color: theme.palette[getMarkColor(event.mark)].contrastText,
          }}
        >
          {event.mark}
        </Avatar>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
        {format(event.date, 'PPPP', { locale: ru })}
      </Typography>

      <Box display="flex" mt={1.5} gap={1} flexWrap="wrap">
        <Chip
          label={`${event.score}/${event.totalPoints} баллов`}
          size="small"
          variant="outlined"
        />
        <Chip label={`${event.duration} сек`} size="small" variant="outlined" />
        {event.isPassed ? (
          <Chip
            label="Пройден"
            color="success"
            size="small"
            icon={<CheckCircle fontSize="small" />}
          />
        ) : (
          <Chip
            label="Не пройден"
            color="error"
            size="small"
            icon={<Cancel fontSize="small" />}
          />
        )}
      </Box>
    </CardContent>
  </Card>
))

export default TestResultsList

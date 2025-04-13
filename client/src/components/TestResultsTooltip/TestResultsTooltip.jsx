import { Box, List, ListItem, Typography, Chip, Stack } from '@mui/material'
import { School, Quiz, CheckCircle, Cancel } from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'

function TestResultsTooltip({ dayEvents }) {
  const theme = useTheme()

  const eventStyles = {
    test: {
      borderLeft: `4px solid ${theme.palette.primary.main}`,
      // bgcolor: theme.palette.primary.light,
    },
    instruction: {
      borderLeft: `4px solid ${theme.palette.secondary.main}`,
      // bgcolor: theme.palette.secondary.light,
    },
    common: {
      mb: 1,
      borderRadius: 1,
      p: 1.5,
      '&:last-child': { mb: 0 },
    },
  }

  return (
    <List sx={{ p: 0 }}>
      {dayEvents.map((event) => (
        <ListItem
          sx={{
            ...eventStyles.common,
            ...(event.type === 'test'
              ? eventStyles.test
              : eventStyles.instruction),
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
          }}
          key={`${event.type}-${event.id}`}
        >
          <Box width="100%" display="flex" alignItems="center" mb={1}>
            {event.type === 'test' ? (
              <Quiz color="primary" sx={{ mr: 1 }} />
            ) : (
              <School color="secondary" sx={{ mr: 1 }} />
            )}
            <Typography variant="subtitle2" fontWeight="bold">
              {event.type === 'test' ? event.testName : event.instructionName}
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
            <Chip
              label={event.type === 'test' ? 'Тест' : 'Инструктаж'}
              size="small"
              variant="outlined"
              icon={event.type === 'test' ? <Quiz /> : <School />}
              color={event.type === 'test' ? 'primary' : 'secondary'}
            />
            <Chip
              label={event.isPassed ? 'Пройден' : 'Не пройден'}
              size="small"
              color={event.isPassed ? 'success' : 'error'}
              icon={event.isPassed ? <CheckCircle /> : <Cancel />}
            />
          </Stack>

          {event.type === 'test' && (
            <>
              <Box display="flex" alignItems="center" mb={0.5}>
                <Typography
                  variant="caption"
                  sx={{ mr: 1, fontWeight: 'bold' }}
                >
                  Оценка:
                </Typography>
                <Typography variant="body2">{event.mark}/10</Typography>
              </Box>
              <Box display="flex" alignItems="center" mb={0.5}>
                <Typography
                  variant="caption"
                  sx={{ mr: 1, fontWeight: 'bold' }}
                >
                  Баллы:
                </Typography>
                <Typography variant="body2">
                  {event.score}/{event.totalPoints}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center">
                <Typography
                  variant="caption"
                  sx={{ mr: 1, fontWeight: 'bold' }}
                >
                  Длительность:
                </Typography>
                <Typography variant="body2">{event.duration} сек</Typography>
              </Box>
            </>
          )}
        </ListItem>
      ))}
    </List>
  )
}

export default TestResultsTooltip

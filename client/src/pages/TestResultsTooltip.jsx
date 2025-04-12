import { Box, List, ListItem, Typography } from '@mui/material'

function TestResultsTooltip({ dayEvents }) {
  return (
    <List>
      {dayEvents.map((event) => (
        <ListItem
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            borderTop: '1px solid grey',
          }}
          key={event.id + event.date}
        >
          <Typography variant="subtitle2">{event.testName}</Typography>
          <Box display="flex" alignItems="center" gap={1} mt={0.5}>
            <Typography variant="body2">
              {`Оценка: ${event.mark}/10`}
            </Typography>
          </Box>
          <Typography variant="body2" mt={0.5}>
            {`Баллы: ${event.score}/${event.totalPoints}`}
          </Typography>
          <Typography variant="body2">
            {`Длительность: ${event.duration} сек`}
          </Typography>
          <Typography variant="body2">
            {`Статус: ${event.isPassed ? 'Пройден' : 'Не пройден'}`}
          </Typography>
        </ListItem>
      ))}
    </List>
  )
}

export default TestResultsTooltip

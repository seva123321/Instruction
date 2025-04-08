import React, { memo } from 'react'
import { Box, Typography, Tooltip, Avatar } from '@mui/material'
import { format, isSameMonth, isSameDay } from 'date-fns'
import { getTestEnding } from '@/service/utilsFunction'
import TestResultsTooltip from './TestResultsTooltip'

const CalendarDay = ({ day, currentDate, getEventsForDay, theme }) => {
  const dayEvents = getEventsForDay(day)
  const isCurrentMonth = isSameMonth(day, currentDate)
  const isToday = isSameDay(day, new Date())

  return (
    <Box
      sx={{
        height: '100%',
        minHeight: 80,
        border: '1px solid',
        borderColor: theme.palette.divider,
        p: 0.5,
        bgcolor: isToday ? theme.palette.action.selected : 'background.paper',
        opacity: isCurrentMonth ? 1 : 0.6,
        position: 'relative',
        '&:hover': { bgcolor: theme.palette.action.hover },
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Typography
        variant="body2"
        sx={{
          textAlign: 'right',
          color: isToday ? theme.palette.primary.main : 'text.secondary',
          fontWeight: isToday ? 'bold' : 'normal',
        }}
      >
        {format(day, 'd')}
      </Typography>

      {dayEvents.length > 0 && (
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            mt: 0.5,
          }}
        >
          <Tooltip title={<TestResultsTooltip dayEvents={dayEvents} />} arrow>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                position: 'absolute',
              }}
            >
              <Avatar
                sx={{
                  width: 28,
                  height: 28,
                  bgcolor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  fontSize: '0.8rem',
                  mb: 0.5,
                }}
              >
                {dayEvents.length}
              </Avatar>
              <Typography
                variant="caption"
                sx={{
                  textAlign: 'center',
                  color: theme.palette.primary.main,
                  fontWeight: 'medium',
                }}
              >
                {`тест${getTestEnding(dayEvents.length)}`}
              </Typography>
            </Box>
          </Tooltip>
        </Box>
      )}
    </Box>
  )
}

export default memo(CalendarDay)

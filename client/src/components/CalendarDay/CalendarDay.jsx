import { memo, useState, useRef, useEffect } from 'react'
import {
  Box,
  Typography,
  Tooltip,
  useMediaQuery,
  IconButton,
  Paper,
  Divider,
} from '@mui/material'
import { format, isSameMonth, isSameDay } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Close, School, Quiz } from '@mui/icons-material'

import TestResultsTooltip from '@/components/TestResultsTooltip'

function CalendarDay({
  day,
  currentDate,
  getEventsForDay,
  theme,
  isOtherMonth = false,
}) {
  const [open, setOpen] = useState(false)
  const anchorRef = useRef(null)
  const isMobile = useMediaQuery('(max-width:600px)')
  const dayEvents = getEventsForDay(day)
  const hasEvents = dayEvents.length > 0
  const hasTests = dayEvents.some((e) => e.type === 'test')
  const hasInstructions = dayEvents.some((e) => e.type === 'instruction')
  const isCurrentMonth = isSameMonth(day, currentDate)
  const isToday = isSameDay(day, new Date())

  const handleClick = () => {
    if (hasEvents && isMobile) {
      setOpen(!open)
    }
  }

  const handleClose = () => {
    setOpen(false)
  }

  const handleTooltipOpen = () => {
    if (!isMobile && hasEvents) {
      setOpen(true)
    }
  }

  const handleTooltipClose = () => {
    if (!isMobile) {
      setOpen(false)
    }
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (anchorRef.current && !anchorRef.current.contains(event.target)) {
        handleClose()
      }
    }

    if (open && isMobile) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open, isMobile])

  const dayStyles = {
    container: {
      height: isMobile ? 64 : 80,
      minHeight: isMobile ? 64 : 80,
      border: '1px solid',
      borderColor: theme.palette.divider,
      p: isMobile ? 0.2 : 0.5,
      bgcolor: isToday ? theme.palette.action.selected : 'background.paper',
      // eslint-disable-next-line no-nested-ternary
      opacity: isOtherMonth ? 0.5 : isCurrentMonth ? 1 : 0.6,
      position: 'relative',
      '&:hover': { bgcolor: theme.palette.action.hover },
      display: 'flex',
      flexDirection: 'column',
      cursor: hasEvents ? 'pointer' : 'default',
      overflow: 'hidden',
    },
    dayNumber: {
      textAlign: 'right',
      color: isToday ? theme.palette.primary.main : 'text.secondary',
      fontWeight: isToday ? 'bold' : 'normal',
      fontSize: isMobile ? '0.75rem' : '0.875rem',
      lineHeight: 1,
      mb: isMobile ? 0.5 : 1,
    },
    eventBadge: {
      width: '100%',
      position: 'relative',
      top: '-20px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 2,
    },
    eventIcon: {
      fontSize: isMobile ? '0.75rem' : '0.875rem',
    },
    eventCount: {
      fontSize: isMobile ? '0.625rem' : '0.75rem',
      fontWeight: 'bold',
      color: theme.palette.text.primary,
    },
    mobileTooltip: {
      position: 'fixed',
      zIndex: 1300,
      bgcolor: 'background.paper',
      boxShadow: 6,
      borderRadius: 2,
      width: '95vw',
      maxWidth: 450,
      maxHeight: '85vh',
      overflow: 'auto',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      p: 2,
    },
    closeButton: {
      position: 'absolute',
      top: 4,
      right: 4,
      color: theme.palette.text.secondary,
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      mb: 1,
    },
  }

  return (
    <Box
      ref={anchorRef}
      sx={dayStyles.container}
      onClick={handleClick}
      onMouseEnter={handleTooltipOpen}
      onMouseLeave={handleTooltipClose}
    >
      <Typography variant="body2" sx={dayStyles.dayNumber}>
        {format(day, 'd')}
      </Typography>

      {hasEvents && (
        <Box sx={dayStyles.eventBadge}>
          {hasTests && (
            <Box display="flex" alignItems="center" mr={1}>
              <Quiz color="primary" sx={dayStyles.eventIcon} />
              <Typography variant="caption" sx={dayStyles.eventCount}>
                {dayEvents.filter((e) => e.type === 'test').length}
              </Typography>
            </Box>
          )}
          {hasInstructions && (
            <Box display="flex" alignItems="center">
              <School color="secondary" sx={dayStyles.eventIcon} />
              <Typography variant="caption" sx={dayStyles.eventCount}>
                {dayEvents.filter((e) => e.type === 'instruction').length}
              </Typography>
            </Box>
          )}
        </Box>
      )}

      {isMobile && open && (
        <Paper sx={dayStyles.mobileTooltip}>
          <Box sx={dayStyles.header}>
            <Typography variant="h6" color="primary">
              {format(day, 'd MMMM yyyy', { locale: ru })}
            </Typography>
            <IconButton
              onClick={handleClose}
              sx={dayStyles.closeButton}
              aria-label="Закрыть"
              size="small"
            >
              <Close fontSize="small" />
            </IconButton>
          </Box>
          <Divider sx={{ mb: 2 }} />
          <TestResultsTooltip dayEvents={dayEvents} />
        </Paper>
      )}

      {!isMobile && (
        <Tooltip
          open={open}
          title={
            <Paper sx={dayStyles.mobileTooltip}>
              <Typography variant="subtitle1" gutterBottom color="primary">
                {format(day, 'd MMMM yyyy', { locale: ru })}
              </Typography>
              <TestResultsTooltip dayEvents={dayEvents} />
            </Paper>
          }
          arrow
          disableFocusListener
          disableHoverListener
          disableTouchListener
          slotProps={{
            tooltip: {
              sx: {
                bgcolor: 'background.paper',
                boxShadow: 3,
                maxWidth: 'none',
                p: 0,
              },
            },
            arrow: {
              sx: {
                color: 'background.paper',
              },
            },
          }}
        >
          <Box sx={{ width: '100%', height: '100%' }} />
        </Tooltip>
      )}
    </Box>
  )
}

export default memo(CalendarDay)

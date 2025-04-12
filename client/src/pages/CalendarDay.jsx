import { memo, useState, useRef, useEffect } from 'react'
import {
  Box,
  Typography,
  Tooltip,
  Avatar,
  useMediaQuery,
  IconButton,
  Paper,
  Divider,
} from '@mui/material'
import { format, isSameMonth, isSameDay } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Close } from '@mui/icons-material'

import { getTestEnding } from '@/service/utilsFunction'

import TestResultsTooltip from './TestResultsTooltip'

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
      height: '100%',
      minHeight: 80,
      border: '1px solid',
      borderColor: theme.palette.divider,
      p: 0.5,
      bgcolor: isToday ? theme.palette.action.selected : 'background.paper',
      opacity: isOtherMonth ? 0.5 : isCurrentMonth ? 1 : 0.6,
      position: 'relative',
      '&:hover': { bgcolor: theme.palette.action.hover },
      display: 'flex',
      flexDirection: 'column',
      cursor: hasEvents ? 'pointer' : 'default',
    },
    dayNumber: {
      textAlign: 'right',
      color: isToday ? theme.palette.primary.main : 'text.secondary',
      fontWeight: isToday ? 'bold' : 'normal',
    },
    eventsContainer: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      mt: 0.5,
    },
    tooltipContent: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      position: 'absolute',
    },
    avatar: {
      width: 28,
      height: 28,
      bgcolor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
      fontSize: '0.8rem',
      mb: 0.5,
    },
    eventText: {
      textAlign: 'center',
      color: theme.palette.primary.main,
      fontWeight: 'medium',
    },
    mobileTooltip: {
      position: 'fixed',
      zIndex: 1300,
      bgcolor: 'background.paper',
      boxShadow: 6,
      borderRadius: 2,
      width: '90vw',
      maxWidth: 400,
      maxHeight: '80vh',
      overflow: 'auto',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      p: 2,
    },
    closeButton: {
      position: 'absolute',
      top: 8,
      right: 8,
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
        <Box sx={dayStyles.eventsContainer}>
          <Box sx={dayStyles.tooltipContent}>
            <Avatar sx={dayStyles.avatar}>{dayEvents.length}</Avatar>
            <Typography variant="caption" sx={dayStyles.eventText}>
              {`тест${getTestEnding(dayEvents.length)}`}
            </Typography>
          </Box>
        </Box>
      )}

      {isMobile ? (
        open && (
          <Paper sx={dayStyles.mobileTooltip}>
            <Box sx={dayStyles.header}>
              <Typography variant="h6" color="primary">
                {format(day, 'd MMMM yyyy', { locale: ru })}
              </Typography>
              <IconButton
                onClick={handleClose}
                sx={dayStyles.closeButton}
                aria-label="Закрыть"
              >
                <Close />
              </IconButton>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <TestResultsTooltip dayEvents={dayEvents} />
          </Paper>
        )
      ) : (
        <Tooltip
          open={open}
          title={
            <Paper sx={{ p: 2, maxWidth: 400 }}>
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
          componentsProps={{
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
// import { memo, useState, useRef, useEffect } from 'react'
// import {
//   Box,
//   Typography,
//   Tooltip,
//   Avatar,
//   useMediaQuery,
//   IconButton,
//   Paper,
//   Divider,
// } from '@mui/material'
// import { format, isSameMonth, isSameDay } from 'date-fns'
// import { ru } from 'date-fns/locale'
// import { Close } from '@mui/icons-material'

// import { getTestEnding } from '@/service/utilsFunction'

// import TestResultsTooltip from './TestResultsTooltip'

// function CalendarDay({ day, currentDate, getEventsForDay, theme }) {
//   const [open, setOpen] = useState(false)
//   const anchorRef = useRef(null)
//   const isMobile = useMediaQuery('(max-width:600px)')
//   const dayEvents = getEventsForDay(day)
//   const hasEvents = dayEvents.length > 0
//   const isCurrentMonth = isSameMonth(day, currentDate)
//   const isToday = isSameDay(day, new Date())

//   const handleClick = () => {
//     if (hasEvents && isMobile) {
//       setOpen(!open)
//     }
//   }

//   const handleClose = () => {
//     setOpen(false)
//   }

//   const handleTooltipOpen = () => {
//     if (!isMobile && hasEvents) {
//       setOpen(true)
//     }
//   }

//   const handleTooltipClose = () => {
//     if (!isMobile) {
//       setOpen(false)
//     }
//   }

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (anchorRef.current && !anchorRef.current.contains(event.target)) {
//         handleClose()
//       }
//     }

//     if (open && isMobile) {
//       document.addEventListener('mousedown', handleClickOutside)
//     }

//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside)
//     }
//   }, [open, isMobile])

//   const dayStyles = {
//     container: {
//       height: '100%',
//       minHeight: 80,
//       border: '1px solid',
//       borderColor: theme.palette.divider,
//       p: 0.5,
//       bgcolor: isToday ? theme.palette.action.selected : 'background.paper',
//       opacity: isCurrentMonth ? 1 : 0.6,
//       position: 'relative',
//       '&:hover': { bgcolor: theme.palette.action.hover },
//       display: 'flex',
//       flexDirection: 'column',
//       cursor: hasEvents ? 'pointer' : 'default',
//     },
//     dayNumber: {
//       textAlign: 'right',
//       color: isToday ? theme.palette.primary.main : 'text.secondary',
//       fontWeight: isToday ? 'bold' : 'normal',
//     },
//     eventsContainer: {
//       flex: 1,
//       display: 'flex',
//       flexDirection: 'column',
//       justifyContent: 'center',
//       alignItems: 'center',
//       mt: 0.5,
//     },
//     tooltipContent: {
//       display: 'flex',
//       flexDirection: 'column',
//       alignItems: 'center',
//       justifyContent: 'center',
//       width: '100%',
//       position: 'absolute',
//     },
//     avatar: {
//       width: 28,
//       height: 28,
//       bgcolor: theme.palette.primary.main,
//       color: theme.palette.primary.contrastText,
//       fontSize: '0.8rem',
//       mb: 0.5,
//     },
//     eventText: {
//       textAlign: 'center',
//       color: theme.palette.primary.main,
//       fontWeight: 'medium',
//     },
//     mobileTooltip: {
//       position: 'fixed',
//       zIndex: 1300,
//       bgcolor: 'background.paper',
//       boxShadow: 6,
//       borderRadius: 2,
//       width: '90vw',
//       maxWidth: 400,
//       maxHeight: '80vh',
//       overflow: 'auto',
//       top: '50%',
//       left: '50%',
//       transform: 'translate(-50%, -50%)',
//       p: 2,
//     },
//     closeButton: {
//       position: 'absolute',
//       top: 8,
//       right: 8,
//       color: theme.palette.text.secondary,
//     },
//     header: {
//       display: 'flex',
//       justifyContent: 'space-between',
//       alignItems: 'center',
//       mb: 1,
//     },
//   }

//   return (
//     <Box
//       ref={anchorRef}
//       sx={dayStyles.container}
//       onClick={handleClick}
//       onMouseEnter={handleTooltipOpen}
//       onMouseLeave={handleTooltipClose}
//     >
//       <Typography variant="body2" sx={dayStyles.dayNumber}>
//         {format(day, 'd')}
//       </Typography>

//       {hasEvents && (
//         <Box sx={dayStyles.eventsContainer}>
//           <Box sx={dayStyles.tooltipContent}>
//             <Avatar sx={dayStyles.avatar}>{dayEvents.length}</Avatar>
//             <Typography variant="caption" sx={dayStyles.eventText}>
//               {`тест${getTestEnding(dayEvents.length)}`}
//             </Typography>
//           </Box>
//         </Box>
//       )}

//       {isMobile ? (
//         open && (
//           <Paper sx={dayStyles.mobileTooltip}>
//             <Box sx={dayStyles.header}>
//               <Typography variant="h6" color="primary">
//                 {format(day, 'd MMMM yyyy', { locale: ru })}
//               </Typography>
//               <IconButton
//                 onClick={handleClose}
//                 sx={dayStyles.closeButton}
//                 aria-label="Закрыть"
//               >
//                 <Close />
//               </IconButton>
//             </Box>
//             <Divider sx={{ mb: 2 }} />
//             <TestResultsTooltip dayEvents={dayEvents} />
//           </Paper>
//         )
//       ) : (
//         <Tooltip
//           open={open}
//           title={
//             <Paper sx={{ p: 2, maxWidth: 400 }}>
//               <Typography variant="subtitle1" gutterBottom color="primary">
//                 {format(day, 'd MMMM yyyy', { locale: ru })}
//               </Typography>
//               <TestResultsTooltip dayEvents={dayEvents} />
//             </Paper>
//           }
//           arrow
//           disableFocusListener
//           disableHoverListener
//           disableTouchListener
//           componentsProps={{
//             tooltip: {
//               sx: {
//                 bgcolor: 'background.paper',
//                 boxShadow: 3,
//                 maxWidth: 'none',
//                 p: 0,
//               },
//             },
//             arrow: {
//               sx: {
//                 color: 'background.paper',
//               },
//             },
//           }}
//         >
//           <Box sx={{ width: '100%', height: '100%' }} />
//         </Tooltip>
//       )}
//     </Box>
//   )
// }

// export default memo(CalendarDay)

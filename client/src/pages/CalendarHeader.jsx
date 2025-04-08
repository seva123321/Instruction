import { memo } from 'react'
import { Box, IconButton, Typography } from '@mui/material'
import { ChevronLeft, ChevronRight } from '@mui/icons-material'

const CalendarHeader = ({ currentDate, onPrev, onNext }) => {
  return (
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
  )
}

export default memo(CalendarHeader)

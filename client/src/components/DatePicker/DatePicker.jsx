import { memo } from 'react'
import { InputAdornment } from '@mui/material'
import { MobileDatePicker, DesktopDatePicker } from '@mui/x-date-pickers'
import { Cake as CakeIcon } from '@mui/icons-material'

const DatePicker = memo(({ field, isDesktopPicker }) => {
  if (isDesktopPicker) {
    return (
      <DesktopDatePicker
        label="Дата рождения"
        value={field.value}
        onChange={field.onChange}
        format="dd.MM.yyyy"
        maxDate={new Date()}
        slotProps={{
          popper: {
            sx: {
              '& .MuiPaper-root': {
                transform: 'scale(1.2)',
                transformOrigin: 'top left',
                boxShadow: 10,
                borderRadius: 4,
              },
            },
          },
          textField: {
            fullWidth: true,
            InputProps: {
              startAdornment: (
                <InputAdornment position="start">
                  <CakeIcon color="action" />
                </InputAdornment>
              ),
            },
          },
        }}
        views={['year', 'month', 'day']}
        showDaysOutsideCurrentMonth
        fixedWeekNumber={6}
      />
    )
  }
  return (
    <MobileDatePicker
      label="Дата рождения"
      value={field.value}
      onChange={field.onChange}
      format="dd.MM.yyyy"
      maxDate={new Date()}
      slotProps={{
        textField: {
          fullWidth: true,
          InputProps: {
            startAdornment: (
              <InputAdornment position="start">
                <CakeIcon color="action" />
              </InputAdornment>
            ),
          },
        },
        dialog: {
          sx: {
            '& .MuiDialog-paper': {
              width: '90vw',
              maxWidth: '400px',
              maxHeight: '70vh',
            },
          },
        },
      }}
    />
  )
})

export default DatePicker

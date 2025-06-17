import { memo, lazy, Suspense } from 'react'
import { InputAdornment } from '@mui/material'
import { Cake as CakeIcon } from '@mui/icons-material'
import LoadingIndicator from '@/components/LoadingIndicator' // Или другой fallback-компонент

// Динамически загружаемые компоненты
const DesktopDatePicker = lazy(() =>
  import('@mui/x-date-pickers').then((module) => ({
    default: module.DesktopDatePicker,
  }))
)

const MobileDatePicker = lazy(() =>
  import('@mui/x-date-pickers').then((module) => ({
    default: module.MobileDatePicker,
  }))
)

const DatePicker = memo(({ field, isDesktopPicker }) => {
  const pickerProps = {
    label: 'Дата рождения',
    value: field.value,
    onChange: field.onChange,
    format: 'dd.MM.yyyy',
    maxDate: new Date(),
  }

  const commonTextFieldProps = {
    fullWidth: true,
    InputProps: {
      startAdornment: (
        <InputAdornment position="start">
          <CakeIcon color="action" />
        </InputAdornment>
      ),
    },
  }

  return (
    <Suspense fallback={<LoadingIndicator />}>
      {isDesktopPicker ? (
        <DesktopDatePicker
          {...pickerProps}
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
            textField: commonTextFieldProps,
          }}
          views={['year', 'month', 'day']}
          showDaysOutsideCurrentMonth
          fixedWeekNumber={6}
        />
      ) : (
        <MobileDatePicker
          {...pickerProps}
          slotProps={{
            textField: commonTextFieldProps,
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
      )}
    </Suspense>
  )
})

export default DatePicker

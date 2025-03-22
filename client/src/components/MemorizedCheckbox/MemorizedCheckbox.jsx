import { FormControlLabel, Checkbox } from '@mui/material'
import { useWatch } from 'react-hook-form'
import { memo } from 'react'

// Мемоизированный компонент для предотвращения лишних перерендеров
const MemoizedCheckbox = memo(({ name, register, control, data }) => {
  const checked = useWatch({
    control,
    name, // Подписываемся на изменения конкретного поля
  })

  const value = data.find((item) => Object.keys(item)[0] === name)
  const label = Object.values(value)[0]

  return (
    <FormControlLabel
      sx={{ mb: '10px' }}
      control={<Checkbox checked={checked} {...register(name)} />}
      label={label}
    />
  )
})

export default MemoizedCheckbox

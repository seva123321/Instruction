import { memo } from 'react'
import { useWatch } from 'react-hook-form'
import { FormControlLabel, Checkbox, Typography } from '@mui/material'

const MemoizedCheckbox = memo(({ name, register, control, label }) => {
  const checked = useWatch({
    control,
    name,
  })

  return (
    <FormControlLabel
      control={<Checkbox checked={checked} {...register(name)} size="medium" />}
      label={<Typography variant="body1">{label}</Typography>}
      sx={{
        width: '100%',
        m: 0,
      }}
    />
  )
})

export default MemoizedCheckbox

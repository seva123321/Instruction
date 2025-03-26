import { FormControlLabel, Checkbox, Typography } from '@mui/material'
import { useWatch } from 'react-hook-form'
import { memo } from 'react'

const MemoizedCheckbox = memo(({ name, register, control, label }) => {
  const checked = useWatch({
    control,
    name,
  })

  return (
    <FormControlLabel
      control={<Checkbox checked={checked} {...register(name)} size="medium" />}
      label={<Typography variant="body1">{label}</Typography>}
      sx={{ width: '100%', m: 0 }}
    />
  )
})

MemoizedCheckbox.displayName = 'MemoizedCheckbox'

export default MemoizedCheckbox

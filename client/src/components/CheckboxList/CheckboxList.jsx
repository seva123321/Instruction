import { memo } from 'react'
import { Box } from '@mui/material'

import MemoizedCheckbox from '@/components/CheckboxForm'

const CheckboxList = memo(({ data, register, control, sx }) => (
  <Box>
    {data.map((item) => (
      <Box key={item.name} sx={sx}>
        <MemoizedCheckbox
          name={item.name}
          register={register}
          control={control}
          label={item.text}
        />
      </Box>
    ))}
  </Box>
))

export default CheckboxList

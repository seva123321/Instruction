import { memo } from 'react'
import { Box, CircularProgress } from '@mui/material'

const LOADER_MIN_HEIGHT = 200

const LoadingIndicator = memo(() => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    minHeight={LOADER_MIN_HEIGHT}
  >
    <CircularProgress />
  </Box>
))

export default LoadingIndicator

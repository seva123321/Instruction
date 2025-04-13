import { memo } from 'react'
import {
  Typography,
  Box,
  Divider,
  useMediaQuery,
  useTheme,
} from '@mui/material'

function KnowBaseHeader({ title }) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  return (
    <Box sx={{ textAlign: 'center', mb: isMobile ? 4 : 6 }}>
      <Typography
        variant="h3"
        component="h1"
        sx={{
          fontWeight: 700,
          color: theme.palette.primary.dark,
          fontSize: isMobile ? '1.8rem' : '2.2rem',
          mb: 2,
          lineHeight: 1.2,
        }}
      >
        {title}
      </Typography>
      <Divider
        sx={{
          width: isMobile ? '120px' : '200px',
          height: '4px',
          background: theme.palette.secondary.main,
          margin: '0 auto',
          borderRadius: '2px',
        }}
      />
    </Box>
  )
}

export default memo(KnowBaseHeader)

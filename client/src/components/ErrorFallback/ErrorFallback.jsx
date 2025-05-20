import { memo } from 'react'
import {
  Box,
  Typography,
  Button,
  Paper,
  useTheme,
  useMediaQuery,
} from '@mui/material'
import { Refresh as RefreshIcon } from '@mui/icons-material'

import ButtonBack from '../ButtonBack'

function ErrorFallback({ error, resetErrorBoundary }) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        p: isMobile ? 1 : 2,
        backgroundColor: theme.palette.grey[50],
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: isMobile ? 2 : 3,
          maxWidth: 500,
          width: '100%',
          textAlign: 'center',
          backgroundColor: 'background.paper',
          border: `1px solid ${theme.palette.grey[200]}`,
          borderRadius: 2,
          position: 'relative',
          overflow: 'hidden',
          '&:before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '6px',
            height: '100%',
            backgroundColor: theme.palette.error.main,
          },
        }}
      >
        <ButtonBack />

        <Box sx={{ mt: isMobile ? 6 : 4, mb: isMobile ? 2 : 3 }}>
          <Box
            sx={{
              width: isMobile ? 60 : 80,
              height: isMobile ? 60 : 80,
              margin: '0 auto 16px',
              backgroundColor: theme.palette.error.light,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: theme.palette.error.contrastText,
            }}
          >
            <Typography variant={isMobile ? 'h5' : 'h4'}>!</Typography>
          </Box>

          <Typography
            variant={isMobile ? 'subtitle1' : 'h6'}
            gutterBottom
            sx={{
              fontWeight: 600,
              mb: isMobile ? 1 : 2,
              fontSize: isMobile ? '1.1rem' : '1.25rem',
            }}
          >
            Ой, что-то пошло не так
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: isMobile ? 2 : 3,
              fontSize: isMobile ? '0.875rem' : '0.9375rem',
            }}
          >
            При обработке запроса возникла непредвиденная ошибка
          </Typography>

          <Box
            component="pre"
            sx={{
              p: isMobile ? 1 : 2,
              mb: isMobile ? 2 : 3,
              textAlign: 'left',
              backgroundColor: theme.palette.grey[100],
              color: theme.palette.error.dark,
              borderRadius: 1,
              overflowX: 'auto',
              fontSize: isMobile ? '0.6875rem' : '0.75rem',
              borderLeft: `3px solid ${theme.palette.error.main}`,
              maxHeight: isMobile ? '100px' : '150px',
              lineHeight: 1.4,
            }}
          >
            {error.message}
          </Box>
        </Box>

        <Button
          variant="contained"
          onClick={resetErrorBoundary}
          fullWidth
          size={isMobile ? 'medium' : 'large'}
          startIcon={<RefreshIcon fontSize={isMobile ? 'small' : 'medium'} />}
          sx={{
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 500,
            backgroundColor: theme.palette.error.main,
            '&:hover': {
              backgroundColor: theme.palette.error.dark,
            },
            py: isMobile ? 1 : 1.5,
          }}
        >
          Повторить попытку
        </Button>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            mt: isMobile ? 1 : 2,
            display: 'block',
            fontSize: isMobile ? '0.6875rem' : '0.75rem',
          }}
        >
          {`Код ошибки: ${error.code || 'UNKNOWN'}`}
        </Typography>
      </Paper>
    </Box>
  )
}

export default memo(ErrorFallback)

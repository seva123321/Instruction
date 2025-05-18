import { memo } from 'react'
import { Box, Typography, Button, Paper, useTheme } from '@mui/material'
import {
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'

function ErrorFallback({ error, resetErrorBoundary }) {
  const theme = useTheme()
  const navigate = useNavigate()

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        p: 2,
        backgroundColor: theme.palette.grey[50],
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 4 },
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
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            display: 'flex',
            gap: 1,
          }}
        >
          <Button
            onClick={() => navigate(-1)}
            variant="outlined"
            size="small"
            startIcon={<ArrowBackIcon fontSize="small" />}
            sx={{
              borderRadius: '20px',
              textTransform: 'none',
              color: 'text.secondary',
              borderColor: theme.palette.grey[300],
              '&:hover': {
                borderColor: theme.palette.grey[400],
              },
            }}
          >
            Назад
          </Button>
        </Box>

        <Box sx={{ mt: 4, mb: 3 }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              margin: '0 auto 20px',
              backgroundColor: theme.palette.error.light,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: theme.palette.error.contrastText,
            }}
          >
            <Typography variant="h4">!</Typography>
          </Box>

          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Ой, что-то пошло не так
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            При обработке запроса возникла непредвиденная ошибка
          </Typography>

          <Box
            component="pre"
            sx={{
              p: 2,
              mb: 3,
              textAlign: 'left',
              backgroundColor: theme.palette.grey[100],
              color: theme.palette.error.dark,
              borderRadius: 1,
              overflowX: 'auto',
              fontSize: '0.75rem',
              borderLeft: `3px solid ${theme.palette.error.main}`,
              maxHeight: '150px',
            }}
          >
            {error.message}
          </Box>
        </Box>

        <Button
          variant="contained"
          onClick={resetErrorBoundary}
          fullWidth
          size="large"
          startIcon={<RefreshIcon />}
          sx={{
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 500,
            backgroundColor: theme.palette.error.main,
            '&:hover': {
              backgroundColor: theme.palette.error.dark,
            },
          }}
        >
          Повторить попытку
        </Button>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 2, display: 'block' }}
        >
          {`Код ошибки: ${error.code || 'UNKNOWN'}`}
        </Typography>
      </Paper>
    </Box>
  )
}

export default memo(ErrorFallback)

import { Button, Box, Alert } from '@mui/material'

function ErrorMessage({ message, retryFn }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '200px',
        gap: 2,
      }}
    >
      <Alert severity="error" sx={{ mb: 2 }}>
        {message}
      </Alert>
      <Button variant="contained" color="primary" onClick={retryFn}>
        Попробовать снова
      </Button>
    </Box>
  )
}

export default ErrorMessage

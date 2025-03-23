import { Alert } from '@mui/material'

function MessageAlert({ message }) {
  return (
    <Alert
      severity={message.type}
      sx={{
        position: 'fixed',
        bottom: 40,
        left: '50%',
        transform: 'translateX(-50%)',
        maxWidth: '600px',
        zIndex: 1000,
      }}
    >
      {message.text}
    </Alert>
  )
}

export default MessageAlert

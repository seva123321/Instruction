import { useState, useEffect } from 'react'
import { Alert } from '@mui/material'

function MessageAlert({ message, duration = 3000, clearErrors = () => {} }) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      clearErrors()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, clearErrors])

  if (!visible) return null

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

import { useState, useEffect } from 'react'
import { Alert } from '@mui/material'

function MessageAlert({ message, duration = 3000 }) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
    }, duration)

    return () => clearTimeout(timer)
  }, [duration])

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

import { Navigate, useLocation } from 'react-router-dom'
import { Box } from '@mui/material'

import useAuth from '../hook/useAuth'

function RequireAuth({ children }) {
  const location = useLocation()

  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location }} />
  }
  return <Box sx={{ p: 1 }}>{children}</Box>
}

export default RequireAuth

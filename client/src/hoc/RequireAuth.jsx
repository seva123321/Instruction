import { Navigate, useLocation } from 'react-router-dom'
import { Box } from '@mui/material'

import useAuth from '@/hook/useAuth'
import LoadingIndicator from '@/components/LoadingIndicator'

function RequireAuth({ children }) {
  const location = useLocation()

  const { user, isInitialized } = useAuth()

  if (!isInitialized) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <LoadingIndicator />
      </Box>
    )
  }

  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location }} />
  }
  return <Box sx={{ p: 1 }}>{children}</Box>
}

export default RequireAuth

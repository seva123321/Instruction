import {
  Box,
  Typography,
  Container,
  Slide,
  Fade,
  CircularProgress,
} from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { ru } from 'date-fns/locale'

import { useGetProfileQuery } from '@/slices/userApi'
import GameStatsSection from '@/models/GameStatsSection'
import ProfileEditSection from '@/models/ProfileEditSection'

function ProfilePage() {
  const {
    data: profileData,
    isLoading,
    isError: profileError,
  } = useGetProfileQuery()

  if (isLoading) {
    return (
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress size={60} />
      </Box>
    )
  }

  if (profileError) {
    return (
      <Fade in>
        <Typography color="error">Ошибка загрузки профиля</Typography>
      </Fade>
    )
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
      <Container maxWidth="md">
        <Slide in direction="up" timeout={300}>
          <Box>
            <GameStatsSection profileData={profileData} />
            <ProfileEditSection profileData={profileData} />
          </Box>
        </Slide>
      </Container>
    </LocalizationProvider>
  )
}

export default ProfilePage

import { Box, Grid, Typography } from '@mui/material'

import enterpriseDawn2 from '@/assets/img/enterpriseDawn2.jpg'
import AuthPage from '@/models/AuthModel'

export default function RegistrationPage() {
  return (
    <Box sx={{ height: '100vh' }}>
      <Grid container spacing={2} sx={{ height: '100vh' }}>
        <Grid
          size={{
            xs: 12,
            sm: 6,
          }}
          sx={{
            display: {
              xs: 'none',
              sm: 'flex',
            },
            alignItems: 'center',
            justifyContent: 'center',
            padding: 2,
            position: 'relative',
            background: `rgb(74, 84, 86) url(${enterpriseDawn2}) no-repeat center / cover`,
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
            }}
          />
          <Box
            sx={{
              position: 'relative',
              color: 'white',
              textAlign: 'center',
            }}
          >
            <Typography
              variant="h4"
              style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.7)' }}
            >
              Присоединяйтесь к нам!
            </Typography>
            <p style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}>
              Это страница регистрации. Пожалуйста, заполните форму.
            </p>
          </Box>
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 6,
          }}
        >
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 2,
              height: '100%',
            }}
          >
            <AuthPage />
          </Box>
        </Grid>
      </Grid>
    </Box>
  )
}

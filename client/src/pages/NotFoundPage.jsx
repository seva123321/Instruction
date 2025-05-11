import {
  Container,
  Box,
  Typography,
  Button,
  useTheme,
  useMediaQuery,
} from '@mui/material'
import { Link } from 'react-router-dom'

import Enterprise1 from '@/assets/img/enterprise1.jpg'

function NotFoundPage({ to = '/auth/login' }) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  return (
    <Container
      sx={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isMobile ? 2 : 4,
      }}
      maxWidth="lg"
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          gap: isMobile ? 2 : 4,
          width: '100%',
          height: '100%',
          maxWidth: '800px',
          padding: isMobile ? 3 : 4,
          borderRadius: 4,
          backgroundColor: 'background.paper',
          boxShadow: theme.shadows[4],
        }}
      >
        <Typography
          variant={isMobile ? 'h4' : 'h2'}
          sx={{
            fontWeight: 700,
            color: 'text.primary',
          }}
        >
          Страница не найдена.
        </Typography>

        <Typography
          variant="h1"
          sx={{
            fontSize: isMobile ? '80px' : '170px',
            fontWeight: 800,
            letterSpacing: isMobile ? '10px' : '20px',
            lineHeight: 1,
            background: `url(${Enterprise1}) center`,
            backgroundSize: 'cover',
            WebkitTextFillColor: 'transparent',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            mb: isMobile ? 1 : 2,
          }}
        >
          404
        </Typography>

        <Typography
          variant={isMobile ? 'body2' : 'body1'}
          sx={{
            color: 'text.secondary',
            maxWidth: '600px',
            mb: isMobile ? 2 : 3,
          }}
        >
          К сожалению, такой страницы больше нет или она никогда не
          существовала.
        </Typography>

        <Button
          variant="contained"
          size={isMobile ? 'medium' : 'large'}
          sx={{
            mt: 1,
            px: 4,
            py: isMobile ? 1 : 1.5,
            borderRadius: 2,
            fontWeight: 600,
          }}
        >
          <Link
            style={{
              textDecoration: 'none',
              color: 'inherit',
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            to={to}
          >
            На главную
          </Link>
        </Button>
      </Box>
    </Container>
  )
}

export default NotFoundPage

import {
  Box,
  Typography,
  Button,
  Paper,
  useTheme,
  useMediaQuery,
  Grid,
  Divider,
  SvgIcon,
} from '@mui/material'
import {
  OfflineBolt as OfflineIcon,
  CloudOff as CloudOffIcon,
  WifiOff as WifiOffIcon,
  Cached as RefreshIcon,
  Games as GamesIcon,
  Book as BookIcon,
} from '@mui/icons-material'

// Кастомная иконка для оффлайн-режима
function OfflineIllustration() {
  return (
    <SvgIcon viewBox="0 0 512 512" sx={{ fontSize: 100 }}>
      <path
        fill="#ffb74d"
        d="M256,48C141.1,48,48,141.1,48,256s93.1,208,208,208s208-93.1,208-208S370.9,48,256,48z M264,407v0 c0,5.5-4.5,9.9-9.9,9.9h0c-5.5,0-9.9-4.5-9.9-9.9v0c0-5.5,4.5-9.9,9.9-9.9h0C259.5,397.1,264,401.5,264,407z M294.4,356.4 c-2.2,3.7-6.2,6.1-10.6,6.1c-1.9,0-3.7-0.5-5.4-1.4c-5.5-2.9-7.6-9.8-4.7-15.3c8.2-15.4,12.6-32.6,12.6-50.3 c0-8.8-7.2-16-16-16s-16,7.2-16,16c0,12.7-3.4,25.1-9.8,35.9c-2.4,4-7,5.6-11,3.2c-4-2.4-5.6-7-3.2-11 c8.3-14,12.6-30,12.6-46.5V144c0-8.8,7.2-16,16-16s16,7.2,16,16v98.3c0,22.4-5.8,44.3-16.8,63.6C280.8,339.1,288.1,347.7,294.4,356.4z"
      />
    </SvgIcon>
  )
}

function OfflinePage() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const handleRefresh = () => {
    window.location.reload()
  }

  const offlineActivities = [
    {
      icon: <BookIcon color="primary" sx={{ fontSize: 40 }} />,
      title: 'Чтение',
      description: 'Воспользуйтесь временем для чтения сохраненных материалов',
    },
    {
      icon: <GamesIcon color="primary" sx={{ fontSize: 40 }} />,
      title: 'Тренировка',
      description: 'Попрактикуйтесь на оффлайн-тестах',
    },
  ]

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: isMobile ? 2 : 4,
        backgroundColor: theme.palette.grey[100],
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: isMobile ? 3 : 6,
          maxWidth: 800,
          width: '100%',
          textAlign: 'center',
          borderRadius: 4,
        }}
      >
        <Box sx={{ mb: 4 }}>
          <OfflineIllustration />
        </Box>

        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{ fontWeight: 700, color: theme.palette.warning.dark }}
        >
          Оффлайн-режим
        </Typography>

        <Typography variant="h6" component="h2" gutterBottom sx={{ mb: 4 }}>
          Кажется, у вас нет подключения к интернету
        </Typography>

        <Typography
          variant="body1"
          sx={{ mb: 4, color: theme.palette.text.secondary }}
        >
          Не волнуйтесь! Вы все еще можете работать с уже загруженными тестами и
          материалами. Как только соединение восстановится, все данные
          синхронизируются автоматически.
        </Typography>

        <Box sx={{ mb: 4 }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 2,
              fontWeight: 600,
            }}
          >
            Проверить соединение
          </Button>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h6" component="h3" gutterBottom sx={{ mb: 3 }}>
          Чем можно заняться в оффлайн-режиме:
        </Typography>

        <Grid container spacing={3} justifyContent="center">
          {offlineActivities.map((activity) => (
            <Grid size={{ xs: 12, sm: 6 }} key={activity.title}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  backgroundColor: theme.palette.grey[50],
                  borderRadius: 3,
                }}
              >
                <Box sx={{ mb: 2 }}>{activity.icon}</Box>
                <Typography variant="h6" gutterBottom>
                  {activity.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {activity.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
          <CloudOffIcon color="disabled" />
          <WifiOffIcon color="disabled" />
          <OfflineIcon color="warning" />
        </Box>
      </Paper>
    </Box>
  )
}

export default OfflinePage

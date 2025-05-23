/* eslint-disable operator-linebreak */
import { memo, useState, useMemo } from 'react'
import {
  Grid,
  Container,
  Typography,
  useTheme,
  useMediaQuery,
  Box,
  Chip,
  InputAdornment,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
  Alert,
} from '@mui/material'
import { Search, YouTube, VideoFile } from '@mui/icons-material'

import { useGetKnowladgeVideosQuery } from '@/slices/knowladgeApi'
import KnowBaseHeader from '@/components/KnowBaseHeader'
import UniversalVideoPlayer from '@/components/VideoPlayer'

const VideoCard = memo(({ video, isMobile, theme }) => {
  const videoSource = video.type === 'youtube' ? 'YouTube' : 'Наш сервер'
  const chipColor = video.type === 'youtube' ? 'error' : 'info'
  const IconComponent = video.type === 'youtube' ? YouTube : VideoFile

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '12px',
        overflow: 'hidden',
        transition: 'transform 0.3s',
        '&:hover': { transform: 'translateY(-5px)' },
      }}
    >
      <UniversalVideoPlayer {...video} />

      <Box
        sx={{
          p: 2,
          backgroundColor: theme.palette.background.paper,
          borderBottomLeftRadius: '12px',
          borderBottomRightRadius: '12px',
          boxShadow: theme.shadows[1],
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            mb: 1,
            fontSize: isMobile ? '1rem' : '1.1rem',
            minHeight: '3em',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {video.title}
        </Typography>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mt: 'auto',
          }}
        >
          <Chip
            label={videoSource}
            size="small"
            icon={<IconComponent fontSize="small" />}
            color={chipColor}
            sx={{ borderRadius: '4px' }}
          />
          <Typography variant="caption" color="text.secondary">
            {new Date(video.date).toLocaleDateString()}
          </Typography>
        </Box>
      </Box>
    </Box>
  )
})

const NoResults = memo(({ theme }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '300px',
      textAlign: 'center',
      p: 4,
    }}
  >
    <Search sx={{ fontSize: '3rem', color: theme.palette.grey[400], mb: 2 }} />
    <Typography variant="h6" color="text.secondary">
      Ничего не найдено
    </Typography>
    <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
      Попробуйте изменить параметры поиска или фильтры
    </Typography>
  </Box>
))

function KnowBaseVideosPage() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState('all')

  const { data: videos = [], isError, isLoading } = useGetKnowladgeVideosQuery()

  const filteredVideos = useMemo(
    () =>
      videos.filter((video) => {
        const matchesSearch = video.title
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
        const matchesFilter = filter === 'all' || video.type === filter
        return matchesSearch && matchesFilter
      }),
    [videos, searchQuery, filter]
  )
  const handleFilterChange = (_, newFilter) => {
    if (newFilter !== null) setFilter(newFilter)
  }

  const searchFieldStyles = useMemo(
    () => ({
      maxWidth: isMobile ? '100%' : '400px',
      flexGrow: 1,
      '& .MuiOutlinedInput-root': {
        borderRadius: '50px',
        backgroundColor: theme.palette.background.paper,
        boxShadow: theme.shadows[1],
        paddingLeft: '14px',
        '&:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: theme.palette.primary.light,
        },
      },
    }),
    [theme, isMobile]
  )

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

  if (isError) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mt: 2 }}>
          Ошибка загрузки видео. Попробуйте позже.
        </Alert>
      </Container>
    )
  }

  return (
    <Container sx={{ p: '3rem 8px' }} maxWidth="lg">
      <KnowBaseHeader title="Видеоматериалы" />

      {/* Панель поиска и фильтров */}
      <Box
        sx={{
          mb: 4,
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
        }}
      >
        <TextField
          fullWidth={isMobile}
          size={isMobile ? 'small' : 'medium'}
          placeholder="Поиск видео..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={searchFieldStyles}
          slotProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search color="primary" />
              </InputAdornment>
            ),
          }}
        />

        <ToggleButtonGroup
          value={filter}
          exclusive
          onChange={handleFilterChange}
          size={isMobile ? 'small' : 'medium'}
          sx={{ alignSelf: 'center' }}
        >
          <ToggleButton value="all" sx={{ px: isMobile ? 1 : 2 }}>
            <Typography
              variant="button"
              fontSize={isMobile ? '0.7rem' : '0.8rem'}
            >
              Все
            </Typography>
          </ToggleButton>
          <ToggleButton value="youtube" sx={{ px: isMobile ? 1 : 2 }}>
            <YouTube fontSize={isMobile ? '1rem' : '1.2rem'} sx={{ mr: 1 }} />
            <Typography
              variant="button"
              fontSize={isMobile ? '0.7rem' : '0.8rem'}
            >
              YouTube
            </Typography>
          </ToggleButton>
          <ToggleButton value="server" sx={{ px: isMobile ? 1 : 2 }}>
            <VideoFile fontSize={isMobile ? '1rem' : '1.2rem'} sx={{ mr: 1 }} />
            <Typography
              variant="button"
              fontSize={isMobile ? '0.7rem' : '0.8rem'}
            >
              Наши видео
            </Typography>
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Список видео */}
      {filteredVideos.length > 0 ? (
        <Grid container spacing={isMobile ? 2 : 4} justifyContent="center">
          {filteredVideos.map((video) => (
            <Grid
              key={video.id}
              size={{ xs: 12, sm: 12, md: 6 }}
              sx={{ height: 360, minWidth: 320, maxWidth: 400 }}
            >
              <VideoCard video={video} isMobile={isMobile} theme={theme} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <NoResults theme={theme} />
      )}
    </Container>
  )
}

export default memo(KnowBaseVideosPage)

/* eslint-disable operator-linebreak */
import React, { useState, useMemo } from 'react'
import {
  Grid2,
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
} from '@mui/material'
import { Search, YouTube, VideoFile } from '@mui/icons-material'

import UniversalVideoPlayer from './UniversalVideoPlayer'
import KnowBaseHeader from './KnowBaseHeader'

const videoData = [
  // YouTube видео
  {
    id: 1,
    type: 'youtube',
    url: 'https://www.youtube.com/watch?v=C0fBnil_Im4&t=4s',
    title: 'Основы гражданского права в РФ',
    duration: '15:30',
    views: '1.2K',
    date: '12.05.2023',
  },
  // Видео с вашего сервера
  {
    id: 2,
    type: 'server',
    url: 'https://ваш-сервер.com/videos/example.mp4',
    title: 'Корпоративное обучение',
    duration: '22:45',
    views: '3.4K',
    date: '20.06.2023',
    thumbnail: 'https://ваш-сервер.com/thumbnails/example.jpg',
  },
  // Еще YouTube видео
  {
    id: 3,
    type: 'youtube',
    url: 'https://www.youtube.com/watch?v=C0fBnil_Im4&t=4s',
    title: 'Налоговое законодательство 2023',
    duration: '10:15',
    views: '5.7K',
    date: '05.07.2023',
  },
  // Еще видео с сервера
  {
    id: 4,
    type: 'server',
    url: 'https://ваш-сервер.com/videos/tutorial.mp4',
    title: 'Руководство пользователя',
    duration: '08:20',
    views: '1.8K',
    date: '15.08.2023',
    thumbnail: 'https://ваш-сервер.com/thumbnails/tutorial.jpg',
  },
]

function VideoCard({ video, isMobile, theme }) {
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
            label={video.type === 'youtube' ? 'YouTube' : 'Наш сервер'}
            size="small"
            icon={
              video.type === 'youtube' ? (
                <YouTube fontSize="small" />
              ) : (
                <VideoFile fontSize="small" />
              )
            }
            sx={{
              borderRadius: '4px',
              backgroundColor:
                video.type === 'youtube'
                  ? theme.palette.error.light
                  : theme.palette.info.light,
            }}
          />
          <Typography variant="caption" color="text.secondary">
            {`Опубликовано:${video.date}`}
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

function NoResults({ theme }) {
  return (
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
      <Search
        sx={{ fontSize: '3rem', color: theme.palette.grey[400], mb: 2 }}
      />
      <Typography variant="h6" color="text.secondary">
        Ничего не найдено
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
        Попробуйте изменить параметры поиска или фильтры
      </Typography>
    </Box>
  )
}

function KnowBaseVideosPage() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState('all')

  const filteredVideos = useMemo(
    () =>
      videoData.filter((video) => {
        const matchesSearch = video.title
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
        const matchesFilter = filter === 'all' || video.type === filter
        return matchesSearch && matchesFilter
      }),
    [searchQuery, filter]
  )

  const handleFilterChange = (event, newFilter) => {
    if (newFilter !== null) setFilter(newFilter)
  }

  return (
    <Container maxWidth="lg">
      <KnowBaseHeader title="Видеоматериалы" />

      {/* Панель поиска и фильтров */}
      <Box
        sx={{
          mb: 4,
          display: 'flex',
          flexDirection: 'column', // isMobile ? 'column' : 'row',
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
          sx={{
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
          }}
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
              sx={{ fontSize: isMobile ? '0.7rem' : '0.8rem' }}
            >
              Все
            </Typography>
          </ToggleButton>
          <ToggleButton value="youtube" sx={{ px: isMobile ? 1 : 2 }}>
            <YouTube sx={{ fontSize: isMobile ? '1rem' : '1.2rem', mr: 1 }} />
            <Typography
              variant="button"
              sx={{ fontSize: isMobile ? '0.7rem' : '0.8rem' }}
            >
              YouTube
            </Typography>
          </ToggleButton>
          <ToggleButton value="server" sx={{ px: isMobile ? 1 : 2 }}>
            <VideoFile sx={{ fontSize: isMobile ? '1rem' : '1.2rem', mr: 1 }} />
            <Typography
              variant="button"
              sx={{ fontSize: isMobile ? '0.7rem' : '0.8rem' }}
            >
              Наши видео
            </Typography>
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Список видео */}
      {filteredVideos.length > 0 ? (
        <Grid2 container spacing={isMobile ? 2 : 4} justifyContent="center">
          {filteredVideos.map((video) => (
            <Grid2
              key={video.id}
              size={{ xs: 12, sm: 12, md: 6 }}
              sx={{ height: 360, minWidth: 320, maxWidth: 400 }}
            >
              <VideoCard video={video} isMobile={isMobile} theme={theme} />
            </Grid2>
          ))}
        </Grid2>
      ) : (
        <NoResults theme={theme} />
      )}
    </Container>
  )
}

export default React.memo(KnowBaseVideosPage)

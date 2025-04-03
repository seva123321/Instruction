import React from 'react'
import {
  Container,
  Grid2,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material'

import { videoData } from '../service/constValues'

import VideoCard from './VideoCard'

function KnowBaseVideosPage() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography
        variant="h3"
        component="h1"
        gutterBottom
        align="center"
        sx={{
          mb: 6,
          fontWeight: 700,
          color: theme.palette.primary.dark,
          position: 'relative',
          fontSize: isMobile ? '1.8rem' : '2.4rem',
          '&:after': {
            content: '""',
            display: 'block',
            width: '200px',
            height: '4px',
            background: theme.palette.secondary.main,
            margin: '16px auto 0',
            borderRadius: '2px',
          },
        }}
      >
        Обучающие видео
      </Typography>

      <Grid2 container spacing={4} justifyContent="center">
        {videoData.map((video) => (
          <Grid2 key={video.id} xs={12} sm={6} md={6} lg={6}>
            <VideoCard video={video} isMobile={isMobile} />
          </Grid2>
        ))}
      </Grid2>
    </Container>
  )
}

export default KnowBaseVideosPage

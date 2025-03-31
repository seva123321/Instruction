import React, { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Modal,
  IconButton,
  Typography,
  useTheme,
  useMediaQuery,
  CircularProgress,
} from '@mui/material'
import { PlayCircle, Close } from '@mui/icons-material'

// Функция для определения типа видео
const getVideoType = (url) => {
  if (!url) return 'unknown'
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube'
  return 'server'
}

// Функция для извлечения YouTube ID
const getYouTubeId = (url) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  return match && match[2].length === 11 ? match[2] : null
}

function UniversalVideoPlayer({
  url,
  title = 'Видео',
  duration = '',
  views = '',
  thumbnail = null,
  autoPlay = false,
}) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [videoType, setVideoType] = useState('unknown')

  useEffect(() => {
    setVideoType(getVideoType(url))
  }, [url])

  const handleOpen = () => {
    setOpen(true)
    setLoading(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  const renderThumbnail = () => {
    if (thumbnail) {
      return (
        <img
          src={thumbnail}
          alt={title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      )
    }

    if (videoType === 'youtube') {
      const videoId = getYouTubeId(url)
      const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
      return (
        <img
          src={thumbnailUrl}
          alt={title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      )
    }

    return (
      <Box
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.palette.grey[300],
        }}
      >
        <PlayCircle sx={{ fontSize: '4rem', color: theme.palette.grey[500] }} />
      </Box>
    )
  }

  const renderVideoPlayer = () => {
    if (videoType === 'youtube') {
      const videoId = getYouTubeId(url)
      const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=${autoPlay ? 1 : 0}&rel=0`

      return (
        <iframe
          width="100%"
          height="100%"
          src={embedUrl}
          title={title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          onLoad={() => setLoading(false)}
          style={{
            border: 'none',
            display: loading ? 'none' : 'block',
          }}
        />
      )
    }

    // Видео с сервера
    return (
      <video
        controls
        autoPlay={autoPlay}
        onCanPlay={() => setLoading(false)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          display: loading ? 'none' : 'block',
        }}
      >
        <source src={url} type="video/mp4" />
        <track
          kind="captions"
          srcLang="ru"
          label="Русские субтитры"
          default
          src="" //  путь к файлу субтитров .vtt
        />
        Ваш браузер не поддерживает видео тег.
      </video>
    )
  }

  return (
    <>
      {/* Миниатюра видео */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16/9',
          borderRadius: '12px',
          overflow: 'hidden',
          cursor: 'pointer',
          boxShadow: 3,
          '&:hover .play-button': {
            transform: 'scale(1.1)',
          },
        }}
        onClick={handleOpen}
      >
        {renderThumbnail()}

        <Box
          className="play-button"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.3)',
            transition: 'all 0.3s ease',
          }}
        >
          <PlayCircle
            sx={{
              fontSize: '4rem',
              color: 'rgba(255,255,255,0.9)',
              transition: 'transform 0.3s ease',
            }}
          />
        </Box>

        {duration && (
          <Typography
            variant="body2"
            sx={{
              position: 'absolute',
              bottom: 8,
              right: 8,
              color: 'white',
              background: 'rgba(0,0,0,0.7)',
              px: 1,
              borderRadius: '4px',
            }}
          >
            {duration}
          </Typography>
        )}
      </Box>

      {/* Кнопка просмотра */}
      <Button
        variant="contained"
        fullWidth
        sx={{
          mt: 2,
          py: 1.5,
          fontWeight: 600,
          borderRadius: '8px',
        }}
        onClick={handleOpen}
        startIcon={<PlayCircle />}
      >
        Смотреть видео
      </Button>

      {/* Модальное окно с плеером */}
      <Modal
        open={open}
        onClose={handleClose}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
        }}
      >
        <Box
          sx={{
            position: 'relative',
            width: isMobile ? '100%' : '80%',
            maxWidth: '900px',
            aspectRatio: '16/9',
            bgcolor: 'background.paper',
            borderRadius: '8px',
            overflow: 'hidden',
            outline: 'none',
          }}
        >
          {loading && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(0,0,0,0.7)',
              }}
            >
              <CircularProgress color="secondary" />
            </Box>
          )}

          <IconButton
            onClick={handleClose}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              zIndex: 1,
              color: 'white',
              background: 'rgba(0,0,0,0.5)',
              '&:hover': {
                background: 'rgba(0,0,0,0.7)',
              },
            }}
          >
            <Close />
          </IconButton>

          {renderVideoPlayer()}

          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              p: 2,
              background:
                'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
              color: 'white',
            }}
          >
            <Typography variant="h6">{title}</Typography>
            {views && (
              <Typography variant="body2">{`${views} просмотров`}</Typography>
            )}
          </Box>
        </Box>
      </Modal>
    </>
  )
}

export default UniversalVideoPlayer

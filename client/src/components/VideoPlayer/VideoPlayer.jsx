/* eslint-disable operator-linebreak */
import React, { useState, useEffect, useRef } from 'react'
import {
  Box,
  Button,
  Modal,
  IconButton,
  Typography,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Slider,
} from '@mui/material'
import {
  PlayCircle,
  Close,
  Pause,
  VolumeUp,
  VolumeOff,
  Fullscreen,
  FullscreenExit,
  PlayArrow,
} from '@mui/icons-material'

import { getTestEnding } from '@/service/utilsFunction'

const getVideoType = (type) => {
  if (!type) return 'unknown'
  return type.toLowerCase()
}

const getYouTubeId = (url) => {
  if (!url) return null
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  return match && match[2].length === 11 ? match[2] : null
}

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`
}

function UniversalVideoPlayer({
  type,
  url,
  file,
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
  const [videoType, setVideoType] = useState(getVideoType(type))
  const [isPlaying, setIsPlaying] = useState(autoPlay)
  const [isMuted, setIsMuted] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  const [durationSec, setDurationSec] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [error, setError] = useState(null)
  const videoRef = useRef(null)
  const playerRef = useRef(null)
  const controlsTimeoutRef = useRef(null)

  useEffect(() => {
    setVideoType(getVideoType(type))
  }, [type])

  useEffect(() => {
    if (!open) return

    // Используем таймаут для гарантии, что ref прикреплен к DOM
    const initTimer = setTimeout(() => {
      if (!videoRef.current) {
        return
      }

      const video = videoRef.current

      // Обработчики событий
      const handleLoadedMetadata = () => {
        if (!Number.isNaN(video.duration) && video.duration !== Infinity) {
          setDurationSec(video.duration)
        }
        setLoading(false)
        setError(null)
      }

      const handleTimeUpdate = () => {
        if (!Number.isNaN(video.currentTime)) {
          setCurrentTime(video.currentTime)
        }
      }

      const handlePlay = () => {
        setIsPlaying(true)
      }

      const handlePause = () => {
        setIsPlaying(false)
      }

      const handleVolumeChange = () => {
        setIsMuted(video.muted)
      }

      const handleError = () => {
        setLoading(false)
        setError(
          `Ошибка загрузки видео: ${video.error?.message || 'Unknown error'}`
        )
      }

      // Подписываемся на события
      const events = {
        loadedmetadata: handleLoadedMetadata,
        timeupdate: handleTimeUpdate,
        play: handlePlay,
        pause: handlePause,
        volumechange: handleVolumeChange,
        error: handleError,
        // canplay: () => console.log('Video can play'),
        // waiting: () => console.log('Video waiting'),
      }

      Object.entries(events).forEach(([event, handler]) => {
        video.addEventListener(event, handler)
      })

      // Проверка текущего состояния
      if (video.readyState >= HTMLMediaElement.HAVE_METADATA) {
        handleLoadedMetadata()
      }

      // Автовоспроизведение
      if (autoPlay && video.paused) {
        video
          .play()
          .then(() => console.log('Autoplay succeeded'))
          .catch(() => {
            setIsPlaying(false)
            setError('Автовоспроизведение заблокировано. Нажмите Play')
          })
      }

      // Функция очистки
      // eslint-disable-next-line consistent-return
      return () => {
        Object.entries(events).forEach(([event, handler]) => {
          video.removeEventListener(event, handler)
        })

        if (controlsTimeoutRef.current) {
          clearTimeout(controlsTimeoutRef.current)
        }
      }
    }, 50)

    // eslint-disable-next-line consistent-return
    return () => clearTimeout(initTimer)
  }, [open, autoPlay])

  const handleOpen = () => {
    setOpen(true)
    setLoading(true)
    setIsPlaying(autoPlay)
    setCurrentTime(0)
    setError(null)
  }

  const handleClose = () => {
    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
    }
    setOpen(false)
    setIsPlaying(false)
  }

  const togglePlay = () => {
    if (!videoRef.current) return

    if (videoRef.current.paused) {
      videoRef.current
        .play()
        .then(setIsPlaying(true))
        .catch(() => {
          setError('Не удалось воспроизвести видео. Попробуйте ещё раз.')
        })
    } else {
      videoRef.current.pause()
      setIsPlaying(false)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handleTimeChange = (e, newValue) => {
    if (videoRef.current) {
      videoRef.current.currentTime = newValue
      setCurrentTime(newValue)
    }
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      playerRef.current?.requestFullscreen?.().catch((err) => {
        console.error(`Fullscreen error: ${err.message}`)
      })
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
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
      if (!videoId) return null

      const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
      return (
        <img
          src={thumbnailUrl}
          alt={title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
          onError={(e) => {
            e.target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
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
      if (!videoId) {
        return (
          <Box
            sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: theme.palette.grey[900],
              color: theme.palette.common.white,
            }}
          >
            <Typography variant="h6">Неверная ссылка на YouTube</Typography>
          </Box>
        )
      }

      const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=${autoPlay ? 1 : 0}&rel=0`
      return (
        <iframe
          width="100%"
          height="100%"
          src={embedUrl}
          title={title}
          sandbox="allow-same-origin allow-scripts allow-popups allow-presentation"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          onLoad={() => setLoading(false)}
          onError={() => setError('Не удалось загрузить видео с YouTube')}
          style={{
            border: 'none',
            display: loading ? 'none' : 'block',
          }}
        />
      )
    }

    if (videoType === 'server' && file) {
      return (
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: '100%',
            backgroundColor: '#000',
            overflow: 'hidden',
            '& video': {
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              outline: 'none',
            },
            '&:hover .video-controls': {
              opacity: 1,
            },
          }}
        >
          <video
            ref={videoRef}
            controls={false}
            autoPlay={autoPlay}
            muted={isMuted}
            loop={false}
            onClick={togglePlay}
            style={{
              cursor: 'pointer',
            }}
          >
            <source
              src={file}
              type={`video/${file.split('.').pop().toLowerCase()}`}
            />
            <track kind="subtitles" src="" srcLang="ru" />
            Ваш браузер не поддерживает видео.
          </video>

          {/* Кастомные контролы */}
          <Box
            className="video-controls"
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              p: 2,
              background:
                'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
              color: 'white',
              zIndex: 1,
              opacity: { xs: 1, md: isPlaying ? 0 : 1 },
              transition: 'opacity 0.3s ease',
            }}
          >
            {/* Прогресс-бар */}
            <Slider
              value={currentTime}
              min={0}
              max={durationSec || 1}
              onChange={handleTimeChange}
              sx={{
                position: 'absolute',
                top: -10,
                left: 0,
                right: 0,
                color: 'primary.main',
                height: 4,
                '& .MuiSlider-thumb': {
                  width: 12,
                  height: 12,
                  transition: '0.2s ease',
                  '&:hover': {
                    width: 16,
                    height: 16,
                  },
                },
                '& .MuiSlider-rail': {
                  opacity: 0.5,
                },
              }}
            />

            {/* Основные контролы */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                mt: 1,
              }}
            >
              <IconButton
                onClick={togglePlay}
                color="inherit"
                sx={{
                  p: 1,
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                  },
                }}
              >
                {isPlaying ? (
                  <Pause fontSize="medium" />
                ) : (
                  <PlayArrow fontSize="medium" />
                )}
              </IconButton>

              <IconButton
                onClick={toggleMute}
                color="inherit"
                sx={{
                  p: 1,
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                  },
                }}
              >
                {isMuted ? (
                  <VolumeOff fontSize="small" />
                ) : (
                  <VolumeUp fontSize="small" />
                )}
              </IconButton>

              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'monospace',
                  minWidth: '50px',
                }}
              >
                {`${formatTime(currentTime)} / ${formatTime(durationSec)}`}
              </Typography>

              <Box sx={{ flexGrow: 1 }} />

              <IconButton
                onClick={toggleFullscreen}
                color="inherit"
                sx={{
                  p: 1,
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                  },
                }}
              >
                {isFullscreen ? (
                  <FullscreenExit fontSize="small" />
                ) : (
                  <Fullscreen fontSize="small" />
                )}
              </IconButton>
            </Box>
          </Box>

          {/* Заголовок видео */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              p: 2,
              background:
                'linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)',
              color: 'white',
              zIndex: 1,
              opacity: { xs: 1, md: isPlaying ? 0 : 1 },
              transition: 'opacity 0.3s ease',
            }}
          >
            <Typography variant="h6" noWrap>
              {title}
            </Typography>
            {views && (
              <Typography variant="caption">
                {`${views} ${`просмотр${getTestEnding(views)}`}`}
              </Typography>
            )}
          </Box>
        </Box>
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
          backgroundColor: theme.palette.grey[900],
          color: theme.palette.common.white,
        }}
      >
        <Typography variant="h6">
          {videoType === 'server'
            ? 'Видеофайл не найден'
            : 'Неизвестный тип видео'}
        </Typography>
      </Box>
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
          ref={playerRef}
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
                zIndex: 2,
              }}
            >
              <CircularProgress color="secondary" />
            </Box>
          )}

          {error && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(0,0,0,0.7)',
                zIndex: 2,
                color: 'white',
                p: 2,
                textAlign: 'center',
              }}
            >
              <Typography variant="h6" color="error" sx={{ mb: 2 }}>
                {error}
              </Typography>
              <Button
                variant="contained"
                onClick={() => {
                  setError(null)
                  setLoading(true)
                }}
              >
                Попробовать снова
              </Button>
            </Box>
          )}

          <IconButton
            onClick={handleClose}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              zIndex: 3,
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
        </Box>
      </Modal>
    </>
  )
}

export default UniversalVideoPlayer

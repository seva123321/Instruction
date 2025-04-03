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
} from '@mui/icons-material'

const getVideoType = (url) => {
  if (!url) return 'unknown'
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube'
  return 'server'
}

const getYouTubeId = (url) => {
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
  const [isPlaying, setIsPlaying] = useState(autoPlay)
  const [isMuted, setIsMuted] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  const [durationSec, setDurationSec] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const videoRef = useRef(null)
  const playerRef = useRef(null)

  useEffect(() => {
    setVideoType(getVideoType(url))
  }, [url])

  useEffect(() => {
    if (open && videoType === 'server' && videoRef.current) {
      const video = videoRef.current
      const updateTime = () => setCurrentTime(video.currentTime)
      const updateDuration = () => setDurationSec(video.duration)

      video.addEventListener('timeupdate', updateTime)
      video.addEventListener('durationchange', updateDuration)

      return () => {
        video.removeEventListener('timeupdate', updateTime)
        video.removeEventListener('durationchange', updateDuration)
      }
    }
    return () => {}
  }, [open, videoType])

  const handleOpen = () => {
    setOpen(true)
    setLoading(true)
    setIsPlaying(autoPlay)
  }

  const handleClose = () => {
    setOpen(false)
    setIsPlaying(false)
  }

  const togglePlay = () => {
    if (videoRef.current.paused) {
      videoRef.current.play()
    } else {
      videoRef.current.pause()
    }
    setIsPlaying(!isPlaying)
  }

  const toggleMute = () => {
    videoRef.current.muted = !isMuted
    setIsMuted(!isMuted)
  }

  const handleTimeChange = (e, newValue) => {
    videoRef.current.currentTime = newValue
    setCurrentTime(newValue)
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      playerRef.current.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`)
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
          // display: 'flex',
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
          sandbox="allow-same-origin allow-scripts allow-popups allow-presentation"
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

    return (
      <>
        <video
          ref={videoRef}
          controls={false}
          autoPlay={autoPlay}
          muted={isMuted}
          loop
          poster={thumbnail}
          preload="metadata"
          playsInline
          onCanPlay={() => {
            setLoading(false)
            setDurationSec(videoRef.current.duration)
          }}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
          onClick={togglePlay}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            display: loading ? 'none' : 'block',
            cursor: 'pointer',
          }}
        >
          <source src={url} type="video/mp4" />
          <source src="video.webm" type="video/webm" />
          <track
            kind="captions"
            src="subtitles.vtt"
            srcLang="ru"
            label="Русские субтитры"
            default
          />
          Ваш браузер не поддерживает видео.
        </video>

        {/* Кастомные контролы только для серверных видео */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            p: 2,
            background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
            color: 'white',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton onClick={togglePlay} color="inherit">
              {isPlaying ? <Pause /> : <PlayCircle />}
            </IconButton>
            <IconButton onClick={toggleMute} color="inherit">
              {isMuted ? <VolumeOff /> : <VolumeUp />}
            </IconButton>
            <Typography variant="body2" sx={{ minWidth: '50px' }}>
              {formatTime(currentTime)}
            </Typography>
            <Slider
              value={currentTime}
              max={durationSec || 100}
              onChange={handleTimeChange}
              sx={{
                flexGrow: 1,
                color: 'white',
                '& .MuiSlider-thumb': {
                  width: 12,
                  height: 12,
                },
              }}
            />
            <Typography variant="body2" sx={{ minWidth: '50px' }}>
              {formatTime(durationSec)}
            </Typography>
            <IconButton onClick={toggleFullscreen} color="inherit">
              {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
            </IconButton>
          </Box>
        </Box>
      </>
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

          {videoType !== 'youtube' && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
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
          )}
        </Box>
      </Modal>
    </>
  )
}

export default UniversalVideoPlayer

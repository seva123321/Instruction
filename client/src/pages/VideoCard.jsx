import React, { useState, useRef, useEffect } from 'react'
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  useTheme,
  IconButton,
  Modal,
  Fade,
} from '@mui/material'
import { PlayCircle, Close } from '@mui/icons-material'

function VideoCard({ video, isMobile }) {
  const theme = useTheme()
  const [isHovered, setIsHovered] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const [openModal, setOpenModal] = useState(false)
  const cardRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.unobserve(entry.target)
        }
      },
      { threshold: 0.1 }
    )

    if (cardRef.current) observer.observe(cardRef.current)
    return () => observer.disconnect()
  }, [])

  const handleOpenModal = () => setOpenModal(true)
  const handleCloseModal = () => setOpenModal(false)

  return (
    <>
      <Card
        ref={cardRef}
        sx={{
          height: '320px',
          width: '340px',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.3s ease',
          borderRadius: '12px',
          boxShadow: isHovered ? theme.shadows[6] : theme.shadows[3],
          background: theme.palette.background.paper,
          overflow: 'hidden',
          m: '0 auto',
          transform: isHovered ? 'translateY(-8px)' : 'none',
          cursor: 'pointer',
        }}
        onClick={handleOpenModal}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Box
          sx={{
            height: '180px',
            backgroundColor: theme.palette.grey[300],
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {isInView && (
            <>
              <iframe
                width="100%"
                height="100%"
                src={`${video.url}?autoplay=0&mute=1&controls=0`}
                title={video.title}
                allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
                style={{
                  border: 'none',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(0,0,0,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s',
                  opacity: isHovered ? 1 : 0.7,
                }}
              >
                <PlayCircle
                  sx={{
                    fontSize: '4rem',
                    color: 'rgba(255,255,255,0.9)',
                    filter: 'drop-shadow(0 0 8px rgba(0,0,0,0.5))',
                  }}
                />
              </Box>
            </>
          )}
        </Box>

        <CardContent sx={{ flexGrow: 1, p: 2 }}>
          <Typography
            gutterBottom
            variant="h6"
            sx={{
              fontWeight: 600,
              minHeight: '60px',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {video.title}
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="caption" color="text.secondary">
              {video.duration}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {`${video.views} просмотров`}
            </Typography>
          </Box>
        </CardContent>

        <Box sx={{ px: 2, pb: 2 }}>
          <Button
            variant="contained"
            size="small"
            fullWidth
            sx={{
              fontWeight: 600,
              borderRadius: '8px',
              background: theme.palette.primary.main,
              '&:hover': {
                background: theme.palette.primary.dark,
              },
            }}
            onClick={(e) => {
              e.stopPropagation()
              handleOpenModal()
            }}
          >
            Смотреть
          </Button>
        </Box>
      </Card>

      {/* Модальное окно для просмотра видео */}
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        closeAfterTransition
        slotProps={{
          backdrop: {
            TransitionProps: { timeout: 500 },
            sx: {
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
        }}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          outline: 'none',
        }}
      >
        <Fade in={openModal}>
          <Box
            sx={{
              position: 'relative',
              width: isMobile ? '95vw' : '80vw',
              maxWidth: '1200px',
              height: isMobile ? '56.25vw' : '70vh',
              bgcolor: 'background.paper',
              boxShadow: 24,
              borderRadius: '8px',
              overflow: 'hidden',
            }}
          >
            <IconButton
              onClick={handleCloseModal}
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

            <iframe
              width="100%"
              height="100%"
              src={`${video.url}?autoplay=1&mute=0`}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{
                border: 'none',
              }}
            />

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
              <Typography variant="h6">{video.title}</Typography>
              <Box
                sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}
              >
                <Typography variant="body2">{video.duration}</Typography>
                <Typography variant="body2">
                  {`${video.views} просмотров`}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Fade>
      </Modal>
    </>
  )
}

export default React.memo(VideoCard)

import { forwardRef } from 'react'
import { Box, Typography, styled } from '@mui/material'

const VideoContainer = forwardRef(({ videoRef }, ref) => {
  const VideoContainerStyles = {
    position: 'relative',
    width: '100%',
    maxWidth: '480px',
    height: '640px',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
    '& video': {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      transform: 'scaleX(-1)', // Зеркальное отображение
    },
  }

  const CameraFrame = styled('div')({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    border: '3px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '8px',
    boxShadow: 'inset 0 0 20px rgba(255, 255, 255, 0.1)',
    pointerEvents: 'none',
  })

  return (
    <Box sx={VideoContainerStyles} ref={ref}>
      <video ref={videoRef} autoPlay playsInline muted />
      <CameraFrame />
      <Box
        sx={{
          position: 'absolute',
          bottom: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          color: 'white',
          textAlign: 'center',
        }}
      >
        <Typography variant="caption">
          Лицо должно быть хорошо освещено и находиться в центре
        </Typography>
      </Box>
    </Box>
  )
})

export default VideoContainer

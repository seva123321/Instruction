import { Container } from '@mui/material'

function VideoContainer({ videoRef }) {
  return (
    <Container
      maxWidth="sm"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '0',
        justifyContent: 'center',
        width: { sm: '100%', md: '80%' },
        height: '80vh',
      }}
    >
      <video
        ref={videoRef}
        autoPlay
        muted
        style={{
          zIndex: 1000,
          width: '100%',
          height: '100%',
          borderRadius: '8px',
          objectFit: 'cover',
        }}
      />
    </Container>
  )
}

export default VideoContainer

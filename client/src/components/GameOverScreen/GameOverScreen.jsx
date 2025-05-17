import { Box, Typography, Button } from '@mui/material'
import { useNavigate } from 'react-router-dom'

const styles = {
  root: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    textAlign: 'center',
    zIndex: 1000,
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background:
        'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
      animation: 'pulse 4s infinite ease-in-out',
    },
  },
  contentBox: {
    position: 'relative',
    padding: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    maxWidth: '90%',
    width: { xs: '90%', sm: '500px' },
    animation: 'fadeIn 0.5s ease-out',
  },
  title: {
    fontWeight: 700,
    mb: 3,
    textShadow: '0 2px 10px rgba(0,0,0,0.3)',
    animation: 'textGlow 2s infinite alternate',
  },
  score: {
    fontWeight: 600,
    mb: 4,
    color: '#f3e5f5',
    '& span': {
      color: 'white',
      fontWeight: 700,
      fontSize: '1.2em',
    },
  },
  button: {
    mt: 3,
    py: 1.5,
    borderRadius: 50,
    background: 'linear-gradient(to right, #ff8a00, #e52e71)',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
    fontSize: '1.1rem',
    fontWeight: 600,
    textTransform: 'none',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 20px rgba(0, 0, 0, 0.3)',
      background: 'linear-gradient(to right, #e52e71, #ff8a00)',
    },
    '&:active': {
      transform: 'translateY(0)',
    },
  },
  floatingCircleBig: {
    position: 'absolute',
    bottom: '15%',
    right: '25%',
    width: 70,
    height: 70,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.15)',
    animation: 'float 8s infinite ease-in-out 2s',
  },
  floatingCircleSmall: {
    position: 'absolute',
    top: '10%',
    left: '20%',
    width: 50,
    height: 50,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.2)',
    animation: 'float 6s infinite ease-in-out',
  },
  keyframes: {
    '@keyframes pulse': {
      '0%': { transform: 'scale(0.95)', opacity: 0.6 },
      '50%': { transform: 'scale(1.05)', opacity: 0.9 },
      '100%': { transform: 'scale(0.95)', opacity: 0.6 },
    },
    '@keyframes fadeIn': {
      '0%': { opacity: 0, transform: 'translateY(20px)' },
      '100%': { opacity: 1, transform: 'translateY(0)' },
    },
    '@keyframes textGlow': {
      '0%': { textShadow: '0 0 5px rgba(255,255,255,0.5)' },
      '100%': { textShadow: '0 0 15px rgba(255,255,255,0.8)' },
    },
    '@keyframes float': {
      '0%': { transform: 'translateY(0px)' },
      '50%': { transform: 'translateY(-20px)' },
      '100%': { transform: 'translateY(0px)' },
    },
  },
}

const GameOverScreen = ({ correctAnswers, isMobile }) => {
  const navigate = useNavigate()

  return (
    <Box sx={{ ...styles.root, ...styles.keyframes }}>
      <Box sx={styles.contentBox}>
        <Typography variant="h3" gutterBottom sx={styles.title}>
          Время вышло!
        </Typography>

        <Typography variant="h4" gutterBottom sx={styles.score}>
          Правильных ответов: <span>{Math.max(0, correctAnswers)}</span>
        </Typography>

        <Button
          variant="contained"
          fullWidth={!!isMobile}
          size="large"
          onClick={() => navigate(-1)}
          sx={styles.button}
        >
          Вернуться к играм
        </Button>
      </Box>

      {/* Декоративные элементы */}
      <Box sx={styles.floatingCircleSmall} />
      <Box sx={styles.floatingCircleBig} />
    </Box>
  )
}

export default GameOverScreen

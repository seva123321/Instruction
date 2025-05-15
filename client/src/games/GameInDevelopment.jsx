import { Box, Typography, Button, styled } from '@mui/material'
import ConstructionIcon from '@mui/icons-material/Construction'
import EngineeringIcon from '@mui/icons-material/Engineering'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'

const IndustrialOverlay = styled(Box)(({ theme }) => ({
  position: 'relative',
  padding: theme.spacing(4),
  borderRadius: '12px',
  backgroundColor: '#f5f5f5',
  border: '3px dashed #9e9e9e',
  textAlign: 'center',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background:
      'linear-gradient(90deg, #ff9800, #f44336, #9c27b0, #2196f3, #4caf50)',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '8px',
    backgroundColor: '#424242',
  },
}))

const WarningStripe = styled(Box)({
  background:
    'repeating-linear-gradient(45deg, #ffeb3b, #ffeb3b 10px, #000 10px, #000 20px)',
  padding: '8px',
  marginBottom: '16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
})

const IndustrialButton = styled(Button)({
  background: 'linear-gradient(to bottom, #616161, #424242)',
  color: '#fff',
  fontWeight: 'bold',
  padding: '12px 24px',
  border: '2px solid #ff9800',
  borderRadius: '50px',
  boxShadow: '0 4px 0 rgba(0,0,0,0.2)',
  textTransform: 'uppercase',
  letterSpacing: '1px',
  transition: 'all 0.3s',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 0 rgba(0,0,0,0.2)',
    background: 'linear-gradient(to bottom, #757575, #616161)',
  },
  '& .MuiSvgIcon-root': {
    filter: 'drop-shadow(0 0 4px rgba(255, 152, 0, 0.7))',
  },
})

function GameInDevelopment() {
  return (
    <IndustrialOverlay>
      <WarningStripe>
        <WarningAmberIcon
          sx={{
            verticalAlign: 'middle',
            mr: 1,
            color: '#fff',
            zIndex: 1,
            filter: 'drop-shadow(0 0 2px #000)',
          }}
        />
        <Typography
          variant="body1"
          sx={{
            color: '#fff',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            textShadow: '0 0 5px #000, 0 0 3px #000',
            zIndex: 1,
            px: 1,
          }}
        >
          Внимание! Зона строительства
        </Typography>
        <WarningAmberIcon
          sx={{
            verticalAlign: 'middle',
            ml: 1,
            color: '#fff',
            zIndex: 1,
            filter: 'drop-shadow(0 0 2px #000)',
          }}
        />
      </WarningStripe>

      <ConstructionIcon
        sx={{
          fontSize: 80,
          color: '#ff9800',
          filter: 'drop-shadow(0 0 8px rgba(255, 152, 0, 0.5))',
          mb: 2,
        }}
      />

      <Typography
        variant="h4"
        gutterBottom
        sx={{
          fontWeight: 'bold',
          color: '#212121',
          textShadow: '2px 2px 0 #bdbdbd',
          mb: 3,
        }}
      >
        Игра в разработке
      </Typography>

      <Typography
        variant="body1"
        sx={{
          mb: 4,
          fontSize: '1.1rem',
          position: 'relative',
          '&::before, &::after': {
            content: '"⚙️"',
            position: 'absolute',
            fontSize: '1.5rem',
          },
          '&::before': {
            left: '-40px',
            top: '50%',
            transform: 'translateY(-50%) rotate(20deg)',
          },
          '&::after': {
            right: '-40px',
            top: '50%',
            transform: 'translateY(-50%) rotate(-20deg)',
          },
        }}
      >
        Наши инженеры усердно трудятся над созданием этой игры
      </Typography>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          gap: 3,
          mb: 2,
        }}
      >
        <IndustrialButton
          variant="contained"
          startIcon={<EngineeringIcon />}
          disabled
        >
          Ускорить разработку
        </IndustrialButton>
      </Box>

      <Typography
        variant="caption"
        display="block"
        sx={{
          mt: 2,
          fontStyle: 'italic',
          color: '#757575',
        }}
      >
        Ожидайте обновления в следующем квартале
      </Typography>

      {/* Декоративные элементы */}
      <Box
        sx={{
          position: 'absolute',
          bottom: '15px',
          right: '20px',
          fontSize: '0.8rem',
          color: '#616161',
          fontFamily: 'monospace',
        }}
      >
        пожарная безопасность
      </Box>
    </IndustrialOverlay>
  )
}

export default GameInDevelopment

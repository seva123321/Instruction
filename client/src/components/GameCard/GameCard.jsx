import { memo } from 'react'
import { Box, Typography, Paper, styled } from '@mui/material'

const IndustrialBadgeWrapper = styled(Box)(({ theme }) => ({
  position: 'relative',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-3px)',
    '& .MuiBadge-badge': {
      boxShadow: theme.shadows[4],
    },
  },
}))

const BadgeLabel = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: -8,
  right: 12,
  backgroundColor: theme.palette.error.main,
  color: 'white',
  padding: '4px 12px',
  borderRadius: '16px',
  fontSize: '0.75rem',
  fontWeight: 'bold',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  zIndex: 1,
  '&.technical': {
    backgroundColor: theme.palette.primary.main,
  },
}))

const IndustrialCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: '16px',
  background: 'linear-gradient(145deg, #f5f5f5, #e0e0e0)',
  boxShadow: '5px 5px 15px rgba(46, 137, 215, 0.38)',
  cursor: 'pointer',
  transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: `
      0 6px 20px rgba(42, 109, 177, 0.72),
      0 3px 10px rgba(37, 57, 231, 0.2)
    `,
  },
}))
const GameIconWrapper = styled(Box)(() => ({
  width: 80,
  height: 80,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto 20px',
  color: 'white',
  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
  transition: 'all 0.3s ease',
}))

function GameCard({
  header,
  badgeTitle,
  mainIcon,
  background,
  children,
  onGameClick = () => {},
}) {
  return (
    <IndustrialBadgeWrapper>
      <BadgeLabel>{badgeTitle}</BadgeLabel>
      <IndustrialCard onClick={onGameClick}>
        <GameIconWrapper
          sx={{
            background,
          }}
        >
          {mainIcon}
        </GameIconWrapper>

        <Typography
          variant="h6"
          sx={{
            mb: 1,
            fontWeight: 'bold',
            textAlign: 'center',
            background,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 2px 4px rgba(25, 118, 210, 0.2)',
          }}
        >
          {header}
        </Typography>
        {children}
      </IndustrialCard>
    </IndustrialBadgeWrapper>
  )
}

export default memo(GameCard)

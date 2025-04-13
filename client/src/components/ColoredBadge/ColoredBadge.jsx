import React from 'react'
import Badge from '@mui/material/Badge'
import { styled } from '@mui/material/styles'

const StyledBadge = styled(Badge)(({ theme, mark, size }) => {
  const getColor = () => {
    const numericMark = parseFloat(mark)
    if (numericMark >= 8.0) return theme.palette.success.main
    if (numericMark >= 6.0) return '#48ff74'
    if (numericMark >= 4) return theme.palette.warning.main
    return theme.palette.error.main
  }

  return {
    '& .MuiBadge-badge': {
      right: 10,
      top: 15,
      border: `2px solid ${theme.palette.background.paper}`,
      backgroundColor: getColor(),
      color: theme.palette.getContrastText(getColor()),
      borderRadius: '50%',
      width: size ? size.width : 30,
      height: size ? size.height : 30,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'bold',
      fontSize: '0.8rem',
      boxShadow: theme.shadows[2],
    },
  }
})

function ColoredBadge({ mark }) {
  return (
    <StyledBadge
      badgeContent={parseFloat(mark).toFixed(1)}
      mark={mark}
      overlap="circular"
    />
  )
}

export default ColoredBadge

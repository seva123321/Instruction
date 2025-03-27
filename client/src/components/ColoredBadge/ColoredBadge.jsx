// ColoredBadge.js
import React from 'react'
import Badge from '@mui/material/Badge'
import { styled } from '@mui/material/styles'

const StyledBadge = styled(Badge)(({ theme, mark }) => {
  const getColor = () => {
    const numericMark = parseFloat(mark)
    if (numericMark >= 8.5) return theme.palette.success.main
    if (numericMark >= 6.5) return '#48ff74'
    if (numericMark >= 5) return theme.palette.warning.main
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
      width: 30,
      height: 30,
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

import { memo } from 'react'
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material'
import { Button, useTheme } from '@mui/material'
import { useNavigate } from 'react-router-dom'

function ButtonBack() {
  const navigate = useNavigate()
  const theme = useTheme()

  return (
    <Button
      onClick={() => navigate(-1)}
      variant="contained"
      startIcon={<ArrowBackIcon />}
      sx={{
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 1000,
        borderRadius: '50px',
        bgcolor: 'background.paper',
        color: '#42a5f5',
        boxShadow: theme.shadows[2],
        '&:hover': {
          bgcolor: 'background.default',
        },
        [theme.breakpoints.down('sm')]: {
          top: 8,
          right: 8,
          p: '6px 12px',
          minWidth: 'auto',
        },
      }}
    >
      Назад
    </Button>
  )
}

export default memo(ButtonBack)

import useScrollTrigger from '@mui/material/useScrollTrigger'
import Fade from '@mui/material/Fade'
import Box from '@mui/material/Box'
import { Slide } from '@mui/material'

export function ScrollTop(props) {
  const { children } = props

  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 100,
  })

  const handleClick = (event) => {
    const anchor = (event.target.ownerDocument || document).querySelector(
      '#back-to-top-anchor'
    )

    if (anchor) {
      anchor.scrollIntoView({
        behavior: 'smooth', // Добавляем плавную прокрутку
        block: 'center',
      })
    }
  }

  return (
    <Fade in={trigger}>
      <Box
        onClick={handleClick}
        role="presentation"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
        }}
      >
        {children}
      </Box>
    </Fade>
  )
}

export function HideOnScroll(props) {
  const { children, window } = props

  const trigger = useScrollTrigger({
    target: window ? window() : undefined,
  })

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  )
}

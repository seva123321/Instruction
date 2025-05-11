import { useEffect, useState } from 'react'
import { Slide, Box, Fade, useScrollTrigger } from '@mui/material'

export function ScrollTop(props) {
  const { children } = props
  const [visible, setVisible] = useState(false)
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 100,
  })

  useEffect(() => {
    if (trigger) {
      setVisible(true)
      const timer = setTimeout(() => {
        setVisible(false)
      }, 3000)
      return () => clearTimeout(timer)
    }

    setVisible(false)
    return () => {}
  }, [trigger])

  const handleClick = (event) => {
    const anchor = (event.target.ownerDocument || document).querySelector(
      '#back-to-top-anchor'
    )

    if (anchor) {
      anchor.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }
  }

  return (
    <Fade in={visible}>
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

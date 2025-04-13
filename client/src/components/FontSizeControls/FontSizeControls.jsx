import { useEffect, useState, useRef, useCallback } from 'react'
import {
  IconButton,
  Stack,
  Tooltip,
  Box,
  Slide,
  useScrollTrigger,
} from '@mui/material'
import {
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  FormatSize as FormatSizeIcon,
} from '@mui/icons-material'

function FontSizeControls({ fontSize, setFontSize }) {
  const [visible, setVisible] = useState(false)
  const timerRef = useRef(null)
  const lastScrollTimeRef = useRef(0)
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 100,
  })

  const startHideTimer = useCallback(() => {
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setVisible(false)
    }, 3000)
  }, [])

  const showControls = useCallback(() => {
    setVisible(true)
    startHideTimer()
  }, [startHideTimer])

  useEffect(() => {
    const now = Date.now()
    if (trigger && now - lastScrollTimeRef.current > 500) {
      showControls()
      lastScrollTimeRef.current = now
    }
  }, [trigger, showControls])

  useEffect(() => {
    // Применяем размер шрифта ко всем элементам
    document.documentElement.style.fontSize = `${fontSize * 100}%`

    const inputStyle = {
      fontSize: `${fontSize}rem`,
    }

    const inputs = document.querySelectorAll('input, textarea, select')
    inputs.forEach((input) => {
      Object.assign(input.style, inputStyle)
    })

    return () => {
      document.documentElement.style.fontSize = ''
      const resetStyle = { fontSize: '' }
      inputs.forEach((input) => {
        Object.assign(input.style, resetStyle)
      })
    }
  }, [fontSize])

  const handleIncreaseFont = () => {
    const newSize = Math.min(fontSize + 0.1, 1.5)
    setFontSize(newSize)
    showControls()
  }

  const handleDecreaseFont = () => {
    const newSize = Math.max(fontSize - 0.1, 0.8)
    setFontSize(newSize)
    showControls()
  }

  const handleResetFont = () => {
    setFontSize(1)
    showControls()
  }

  const styles = {
    controlsContainer: {
      position: 'fixed',
      bottom: 80,
      right: 12,
      zIndex: 1200,
      bgcolor: 'background.paper',
      borderRadius: '50px',
      boxShadow: 3,
      p: 1,
      transition: 'all 0.3s ease',
      '&:hover': {
        boxShadow: 6,
        bgcolor: 'background.default',
      },
    },
    indicator: {
      minWidth: 40,
      textAlign: 'center',
      fontSize: '0.875rem',
      color: 'text.secondary',
      alignSelf: 'center',
    },
    tooltipWrapper: {
      display: 'inline-flex',
    },
  }

  const renderTooltipButton = (title, onClick, disabled, ariaLabel, icon) => (
    <Box component="span" sx={styles.tooltipWrapper}>
      <Tooltip title={disabled ? '' : title}>
        <span>
          <IconButton
            onClick={onClick}
            color="primary"
            disabled={disabled}
            aria-label={ariaLabel}
            size="small"
          >
            {icon}
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  )

  return (
    <Slide direction="up" in={visible} mountOnEnter unmountOnExit>
      <Box
        sx={styles.controlsContainer}
        onMouseEnter={() => clearTimeout(timerRef.current)}
        onMouseLeave={() => startHideTimer()}
      >
        <Stack direction="column" spacing={1} alignItems="center">
          {renderTooltipButton(
            'Уменьшить шрифт',
            handleDecreaseFont,
            fontSize <= 0.8,
            'Уменьшить шрифт',
            <ZoomOutIcon fontSize="small" />
          )}

          <Box sx={styles.indicator}>{`${Math.round(fontSize * 100)}%`}</Box>

          {renderTooltipButton(
            'Увеличить шрифт',
            handleIncreaseFont,
            fontSize >= 1.5,
            'Увеличить шрифт',
            <ZoomInIcon fontSize="small" />
          )}

          {renderTooltipButton(
            'Сбросить размер',
            handleResetFont,
            fontSize === 1,
            'Сбросить размер шрифта',
            <FormatSizeIcon fontSize="small" />
          )}
        </Stack>
      </Box>
    </Slide>
  )
}

export default FontSizeControls

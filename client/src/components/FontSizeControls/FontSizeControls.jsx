import { IconButton, Stack, Tooltip, Box, Slide } from '@mui/material'
import ZoomInIcon from '@mui/icons-material/ZoomIn'
import ZoomOutIcon from '@mui/icons-material/ZoomOut'
import FormatSizeIcon from '@mui/icons-material/FormatSize'
import { useScrollTrigger } from '@mui/material'

const FontSizeControls = ({ fontSize, setFontSize }) => {
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 100,
  })

  const handleIncreaseFont = () => {
    setFontSize((prev) => Math.min(prev + 0.1, 1.5))
  }

  const handleDecreaseFont = () => {
    setFontSize((prev) => Math.max(prev - 0.1, 0.8))
  }

  const handleResetFont = () => {
    setFontSize(1)
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
      display: 'inline-flex', // Важно для правильного позиционирования
    },
  }

  // Функция для создания обертки Tooltip с правильной обработкой disabled состояния
  const renderTooltipButton = (title, onClick, disabled, ariaLabel, icon) => (
    <Box component="span" sx={styles.tooltipWrapper}>
      <Tooltip title={disabled ? '' : title}>
        <span>
          {' '}
          {/* Обертка span для disabled кнопки */}
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
    <Slide direction="up" in={trigger} mountOnEnter unmountOnExit>
      <Box sx={styles.controlsContainer}>
        <Stack direction="column" spacing={1} alignItems="center">
          {renderTooltipButton(
            'Уменьшить шрифт',
            handleDecreaseFont,
            fontSize <= 0.8,
            'Уменьшить шрифт',
            <ZoomOutIcon fontSize="small" />
          )}

          <Box sx={styles.indicator}>{Math.round(fontSize * 100)}%</Box>

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

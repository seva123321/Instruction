/* eslint-disable operator-linebreak */
/* eslint-disable no-nested-ternary */
import { memo, useMemo } from 'react'
import {
  Box,
  Typography,
  Tooltip,
  AccordionDetails,
  styled,
  Accordion,
  Button,
  AccordionSummary,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

// Выносим стилизованные компоненты за пределы основного компонента для оптимизации
const AccordionSection = styled(Accordion)(({ theme }) => ({
  marginBottom: theme.spacing(1),
  borderRadius: '12px !important',
  overflow: 'hidden',
  boxShadow: 'none',
  border: `1px solid ${theme.palette.divider}`,
  '&:before': {
    display: 'none',
  },
  '&.Mui-expanded': {
    margin: `${theme.spacing(1)} 0 !important`,
  },
}))

const AccordionSummaryWrapper = styled(AccordionSummary)(({ theme }) => ({
  backgroundColor: 'rgba(25, 118, 210, 0.05)',
  borderBottom: `1px solid ${theme.palette.divider}`,
  minHeight: '56px !important',
  '& .MuiAccordionSummary-content': {
    alignItems: 'center',
    margin: '12px 0 !important',
  },
  '&.Mui-expanded': {
    backgroundColor: 'rgba(25, 118, 210, 0.1)',
  },
}))

const DifficultyButton = styled(Button)(({ level, theme }) => {
  const bgcolor =
    {
      1: 'rgba(76, 175, 80, 0.2)',
      2: 'rgba(255, 152, 0, 0.2)',
    }[level] ?? 'rgba(244, 67, 54, 0.2)'

  return {
    textDecoration: 'none',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(1),
    minWidth: 'auto',
    '& .difficulty-circle': {
      width: 40,
      height: 40,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '50%',
      backgroundColor: bgcolor,
      border: `2px solid ${{ 1: '#4CAF50', 2: '#FF9800' }[level] ?? '#F44336'}`,
      transition: 'all 0.3s ease',
    },
    '&:hover .difficulty-circle': {
      transform: 'scale(1.1)',
      boxShadow: `0 0 12px ${bgcolor}`,
    },
  }
})

function AccordionQuiz({
  subtitle,
  expandedAcc,
  onNavigateClick,
  expanded,
  onChangeEpended,
  children,
}) {
  // Обработчик изменения состояния аккордеона
  const handleAccordionChange = (event, isExpanded) => {
    onChangeEpended(isExpanded ? expandedAcc : false)
  }

  // Оптимизированное создание уровней сложности
  const difficultyLevels = useMemo(
    () => [
      { level: 1, caption: 'Легкий', color: '#4CAF50' },
      { level: 2, caption: 'Средний', color: '#FF9800' },
      { level: 3, caption: 'Сложный', color: '#F44336' },
    ],
    []
  )

  return (
    <AccordionSection
      expanded={expanded === expandedAcc}
      onChange={handleAccordionChange}
    >
      <AccordionSummaryWrapper
        expandIcon={<ExpandMoreIcon />}
        aria-controls={`${expandedAcc}-content`}
        id={`${expandedAcc}-header`}
      >
        {children}
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          {subtitle}
        </Typography>
      </AccordionSummaryWrapper>

      <AccordionDetails>
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            textAlign: 'center',
            mb: 2,
          }}
        >
          Выберите уровень сложности:
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
          {difficultyLevels.map(({ level, caption, color }) => (
            <Tooltip
              key={`${expandedAcc}-${level}`}
              title={`${level} уровень сложности`}
              arrow
            >
              <DifficultyButton
                level={level}
                onClick={() => onNavigateClick(level)}
              >
                <Box className="difficulty-circle">
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 'bold',
                      color,
                    }}
                  >
                    {level}
                  </Typography>
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    mt: 0.5,
                    color,
                    fontWeight: 500,
                  }}
                >
                  {caption}
                </Typography>
              </DifficultyButton>
            </Tooltip>
          ))}
        </Box>
      </AccordionDetails>
    </AccordionSection>
  )
}

export default memo(AccordionQuiz)

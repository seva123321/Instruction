import { memo } from 'react'
import { Typography, Card, CardContent } from '@mui/material'

function QuestionCard({
  answer,
  showFeedback,
  selectedAnswer,
  disabled,
  onClick,
  isMobile,
  isControlTest,
}) {
  const isSelected = selectedAnswer === answer.id.toString()
  const isCorrect = answer.is_correct

  const getCardStyle = () => {
    if (isControlTest) {
      return {
        bgcolor: isSelected ? 'action.selected' : 'background.paper',
        borderColor: isSelected ? 'primary.main' : 'divider',
      }
    }

    if (!showFeedback) {
      return {
        bgcolor: isSelected ? 'action.selected' : 'background.paper',
        borderColor: isSelected ? 'primary.main' : 'divider',
      }
    }
    if (isCorrect) {
      return {
        bgcolor: 'success.light',
        borderColor: 'success.main',
      }
    }
    if (isSelected) {
      return {
        bgcolor: 'error.light',
        borderColor: 'error.main',
      }
    }
    return {
      bgcolor: 'background.paper',
      borderColor: 'divider',
    }
  }

  return (
    <Card
      variant="outlined"
      onClick={() => onClick(answer.id)}
      sx={{
        mb: 2,
        borderRadius: 2,
        cursor: disabled ? 'default' : 'pointer',
        borderWidth: 2,
        ...getCardStyle(),
        opacity: disabled ? 0.7 : 1,
        transition: 'all 0.2s ease',
        '&:hover': !disabled && {
          transform: !isMobile ? 'translateY(-2px)' : 'none',
          boxShadow: !isMobile ? 1 : 0,
        },
      }}
    >
      <CardContent
        sx={{
          py: { xs: 1.5, sm: 2 },
          px: { xs: 2, sm: 3 },
          '&:last-child': { pb: { xs: 1.5, sm: 2 } },
        }}
      >
        <Typography
          variant={isMobile ? 'body2' : 'body1'}
          sx={{
            fontWeight: isSelected ? 600 : 400,
            color: disabled ? 'text.disabled' : 'text.primary',
          }}
        >
          {answer.name}
        </Typography>
      </CardContent>
    </Card>
  )
}

export default memo(QuestionCard)

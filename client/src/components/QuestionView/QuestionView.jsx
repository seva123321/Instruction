import { memo, useCallback, useState } from 'react'
import {
  Box,
  Typography,
  FormControl,
  RadioGroup,
  useTheme,
  useMediaQuery,
} from '@mui/material'

import QuestionCard from '@/components/QuestionCard'

function ImagePlaceholder() {
  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'action.hover',
        minHeight: { xs: 150, sm: 200 },
        borderRadius: 2,
        boxShadow: 1,
        animation: 'fadeIn 0.5s ease-in-out',
        '@keyframes fadeIn': {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
      }}
    >
      <Typography
        variant="body1"
        color="text.secondary"
        textAlign="center"
        p={2}
        sx={{ fontStyle: 'italic' }}
      >
        Иллюстрация к вопросу
      </Typography>
    </Box>
  )
}

function QuestionView({
  question,
  selectedAnswer,
  showFeedback,
  disabled,
  onChange,
  isControlTest = false,
}) {
  const [imageError, setImageError] = useState(false)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const handleAnswerClick = useCallback(
    (answerId) => {
      if (!disabled) {
        onChange({ target: { value: answerId.toString() } })
      }
    },
    [disabled, onChange]
  )

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3 },
        backgroundColor: 'background.paper',
        borderRadius: 3,
        boxShadow: { xs: 0, sm: 1 },
        border: { xs: '1px solid', sm: 'none' },
        borderColor: { xs: 'divider', sm: 'transparent' },
        mb: 2,
      }}
    >
      {question.image && (
        <Box sx={{ my: { xs: 2, sm: 3 } }}>
          {imageError ? (
            <ImagePlaceholder />
          ) : (
            <Box
              component="img"
              src={question.image}
              alt="Иллюстрация к вопросу"
              sx={{
                width: '100%',
                height: 'auto',
                maxHeight: { xs: 200, sm: 300 },
                display: 'block',
                margin: '0 auto',
                objectFit: 'contain',
                borderRadius: 2,
              }}
              loading="lazy"
              onError={() => setImageError(true)}
            />
          )}
        </Box>
      )}

      <Typography
        variant={isMobile ? 'h6' : 'h5'}
        gutterBottom
        sx={{
          fontWeight: 600,
          color: 'text.primary',
          mb: { xs: 2, sm: 3 },
          fontSize: { xs: '1.25rem', sm: '1.5rem' },
        }}
      >
        {question.name}
      </Typography>

      <FormControl component="fieldset" sx={{ width: '100%' }}>
        <RadioGroup value={selectedAnswer}>
          {question.answers.map((answer, index) => (
            <QuestionCard
              key={answer.id}
              answer={answer}
              index={index}
              showFeedback={showFeedback}
              selectedAnswer={selectedAnswer}
              disabled={disabled}
              onClick={handleAnswerClick}
              isMobile={isMobile}
              isControlTest={isControlTest}
            />
          ))}
        </RadioGroup>
      </FormControl>
    </Box>
  )
}

export default memo(QuestionView)

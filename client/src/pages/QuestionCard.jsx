import React from 'react'
import { Typography, Card, CardContent } from '@mui/material'

function QuestionCard({
  answer,
  showFeedback,
  selectedAnswer,
  disabled,
  onClick,
}) {
  const isSelected = selectedAnswer === answer.id.toString()
  const isCorrect = answer.is_correct

  const getCardStyle = () => {
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
          transform: 'translateY(-2px)',
          boxShadow: 1,
        },
      }}
    >
      <CardContent sx={{ py: 2, px: 3 }}>
        <Typography
          variant="body1"
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

export default React.memo(QuestionCard)

// import React from 'react'
// import { Card, CardContent, FormControlLabel, Radio } from '@mui/material'

// function QuestionCard({ answer, showFeedback, selectedAnswer, disabled }) {
//   const isSelected = selectedAnswer === answer.id.toString()
//   const isCorrect = answer.is_correct

//   const getBorderColor = () => {
//     if (!showFeedback) return 'divider'
//     if (isCorrect) return 'success.main'
//     if (isSelected) return 'error.main'
//     return 'divider'
//   }

//   return (
//     <Card
//       variant="outlined"
//       sx={{
//         mb: 1,
//         borderColor: getBorderColor(),
//         opacity: disabled ? 0.7 : 1,
//         transition: 'border-color 0.3s ease, opacity 0.3s ease',
//         '&:active': {
//           transform: disabled ? 'none' : 'scale(0.98)',
//         },
//       }}
//     >
//       <CardContent sx={{ p: '8px 16px !important' }}>
//         <FormControlLabel
//           value={answer.id.toString()}
//           control={
//             <Radio
//               sx={{
//                 padding: '12px',
//                 '&.Mui-disabled': {
//                   color: 'text.disabled',
//                 },
//               }}
//             />
//           }
//           label={answer.name}
//           disabled={disabled}
//           sx={{
//             width: '100%',
//             m: 0,
//             '& .MuiFormControlLabel-label': {
//               width: '100%',
//               color: disabled ? 'text.disabled' : 'text.primary',
//               padding: '8px 0',
//               fontSize: '1rem',
//             },
//           }}
//         />
//       </CardContent>
//     </Card>
//   )
// }

// export default React.memo(QuestionCard)

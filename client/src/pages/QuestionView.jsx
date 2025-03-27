import React from 'react'
import {
  Box,
  Typography,
  FormControl,
  RadioGroup,
  Card,
  CardContent,
  Skeleton,
  useTheme,
} from '@mui/material'

import QuestionCard from './QuestionCard'

function ImagePlaceholder() {
  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'action.hover',
        minHeight: 200,
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
        Иллюстрация к вопросу. Данные не загружены.
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
}) {
  const [imageError, setImageError] = React.useState(false)
  const theme = useTheme()

  const handleAnswerClick = (answerId) => {
    if (!disabled) {
      onChange({ target: { value: answerId.toString() } })
    }
  }

  return (
    <Box
      sx={{
        p: 3,
        backgroundColor: 'background.paper',
        borderRadius: 3,
        boxShadow: 1,
      }}
    >
      {question.image && (
        <Box sx={{ my: 3 }}>
          {imageError ? (
            <ImagePlaceholder />
          ) : (
            <Box
              component="img"
              src={question.image}
              alt="Иллюстрация к вопросу"
              sx={{
                maxWidth: '100%',
                maxHeight: 300,
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
        variant="h5"
        gutterBottom
        sx={{
          fontWeight: 600,
          color: 'primary.main',
          mb: 3,
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
            />
          ))}
        </RadioGroup>
      </FormControl>
    </Box>
  )
}

export default React.memo(QuestionView)

// import React from 'react'
// import { Box, Typography, FormControl, RadioGroup } from '@mui/material'
// import QuestionCard from './QuestionCard'

// const ImagePlaceholder = () => (
//   <Box
//     sx={{
//       width: '100%',
//       display: 'flex',
//       alignItems: 'center',
//       justifyContent: 'center',
//       backgroundColor: 'action.hover',
//       minHeight: 200,
//       borderRadius: 1,
//     }}
//   >
//     <Typography variant="body1" color="text.secondary" textAlign="center" p={2}>
//       Иллюстрация к вопросу. Данные не загружены.
//     </Typography>
//   </Box>
// )

// const QuestionImage = ({ src, onError }) => (
//   <img
//     src={src}
//     alt="Иллюстрация к вопросу"
//     style={{
//       maxWidth: '100%',
//       maxHeight: 300,
//       display: 'block',
//       margin: '0 auto',
//       objectFit: 'contain',
//     }}
//     loading="lazy"
//     onError={onError}
//   />
// )

// function QuestionView({
//   question,
//   selectedAnswer,
//   showFeedback,
//   disabled,
//   onChange,
// }) {
//   const [imageError, setImageError] = React.useState(false)

//   return (
//     <Box
//       sx={{
//         touchAction: 'manipulation',
//         userSelect: 'none',
//         WebkitTapHighlightColor: 'transparent',
//       }}
//     >
//       {question.image && (
//         <Box sx={{ my: 2, borderRadius: 1, overflow: 'hidden' }}>
//           {imageError ? (
//             <ImagePlaceholder />
//           ) : (
//             <QuestionImage
//               src={question.image}
//               onError={() => setImageError(true)}
//             />
//           )}
//         </Box>
//       )}

//       <Typography variant="h6" gutterBottom>
//         {question.name}
//       </Typography>

//       <FormControl
//         component="fieldset"
//         sx={{ width: '100%', mt: 2 }}
//         disabled={disabled}
//       >
//         <RadioGroup
//           value={selectedAnswer}
//           onChange={!disabled ? onChange : undefined}
//         >
//           {question.answers.map((answer) => (
//             <QuestionCard
//               key={answer.id}
//               answer={answer}
//               showFeedback={showFeedback}
//               selectedAnswer={selectedAnswer}
//               disabled={disabled}
//             />
//           ))}
//         </RadioGroup>
//       </FormControl>
//     </Box>
//   )
// }

// export default React.memo(QuestionView)

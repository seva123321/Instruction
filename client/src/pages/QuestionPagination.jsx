/* eslint-disable operator-linebreak */
import React from 'react'
import { Box, useTheme } from '@mui/material'

function QuestionPagination({
  currentIndex,
  totalQuestions,
  onDotClick,
  answeredQuestions = [],
}) {
  const theme = useTheme()

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        my: 3,
        gap: 1.5,
        flexWrap: 'wrap',
      }}
    >
      {Array.from({ length: totalQuestions }).map((_, index) => {
        const isCurrent = index === currentIndex
        const isAnswered = answeredQuestions.includes(index)

        return (
          <Box
            key={index}
            onClick={() => onDotClick(index)}
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              bgcolor: isCurrent
                ? theme.palette.primary.main
                : isAnswered
                  ? theme.palette.success.main
                  : theme.palette.grey[400],
              cursor: 'pointer',
              position: 'relative',
              '&:hover': {
                transform: 'scale(1.2)',
                bgcolor: isCurrent
                  ? theme.palette.primary.dark
                  : isAnswered
                    ? theme.palette.success.dark
                    : theme.palette.grey[500],
              },
              transition: theme.transitions.create(
                ['transform', 'background-color'],
                {
                  duration: theme.transitions.duration.short,
                }
              ),
              ...(isAnswered &&
                !isCurrent && {
                  '&::after': {
                    // content: '""',
                    position: 'absolute',
                    top: -3,
                    right: -3,
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    bgcolor: theme.palette.info.dark,
                    border: `1px solid ${theme.palette.success.dark}`,
                  },
                }),
            }}
          />
        )
      })}
    </Box>
  )
}

export default React.memo(QuestionPagination)
// /* eslint-disable operator-linebreak */
// import React from 'react'
// import { Box, useTheme } from '@mui/material'

// function QuestionPagination({
//   currentIndex,
//   totalQuestions,
//   onDotClick,
//   answeredQuestions = [],
// }) {
//   const theme = useTheme()

//   return (
//     <Box
//       sx={{
//         display: 'flex',
//         justifyContent: 'center',
//         my: 3,
//         gap: 1.5,
//         flexWrap: 'wrap',
//       }}
//     >
//       {Array.from({ length: totalQuestions }).map((_, index) => {
//         const isCurrent = index === currentIndex
//         const isAnswered = answeredQuestions.includes(index)

//         return (
//           <Box
//             key={index}
//             onClick={() => onDotClick(index)}
//             sx={{
//               width: 12,
//               height: 12,
//               borderRadius: '50%',
//               bgcolor: isCurrent
//                 ? theme.palette.primary.main
//                 : isAnswered
//                   ? theme.palette.success.main
//                   : theme.palette.grey[400],
//               cursor: 'pointer',
//               position: 'relative',
//               '&:hover': {
//                 transform: 'scale(1.2)',
//                 bgcolor: isCurrent
//                   ? theme.palette.primary.dark
//                   : isAnswered
//                     ? theme.palette.success.dark
//                     : theme.palette.grey[500],
//               },
//               transition: theme.transitions.create(
//                 ['transform', 'background-color'],
//                 {
//                   duration: theme.transitions.duration.short,
//                 }
//               ),
//               ...(isAnswered &&
//                 !isCurrent && {
//                   '&::after': {
//                     // content: '""',
//                     position: 'absolute',
//                     top: -3,
//                     right: -3,
//                     width: 6,
//                     height: 6,
//                     borderRadius: '50%',
//                     bgcolor: theme.palette.info.dark,
//                     border: `1px solid ${theme.palette.success.dark}`,
//                   },
//                 }),
//             }}
//           />
//         )
//       })}
//     </Box>
//   )
// }

// export default React.memo(QuestionPagination)

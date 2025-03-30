/* eslint-disable operator-linebreak */
import React from 'react'
import { Box, useTheme } from '@mui/material'

function QuestionPagination({ currentIndex, totalQuestions, onDotClick }) {
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
      {Array.from({ length: totalQuestions }).map((_, index) => (
        <Box
          key={index}
          onClick={() => onDotClick(index)}
          sx={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            bgcolor:
              index === currentIndex
                ? theme.palette.primary.main
                : theme.palette.grey[400],
            cursor: 'pointer',
            '&:hover': {
              transform: 'scale(1.2)',
              bgcolor:
                index === currentIndex
                  ? theme.palette.primary.dark
                  : theme.palette.grey[500],
            },
            transition: theme.transitions.create(
              ['transform', 'background-color'],
              {
                duration: theme.transitions.duration.short,
              }
            ),
          }}
        />
      ))}
    </Box>
  )
}

export default React.memo(QuestionPagination)

// import React from 'react'
// import { Box, useTheme } from '@mui/material'

// function QuestionPagination({ currentIndex, totalQuestions, onDotClick }) {
//   const theme = useTheme()

//   return (
//     <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3, gap: 1 }}>
//       {Array.from({ length: totalQuestions }).map((_, index) => (
//         <Box
//           key={index}
//           onClick={() => onDotClick(index)}
//           sx={{
//             width: 10,
//             height: 10,
//             borderRadius: '50%',
//             bgcolor:
//               index === currentIndex
//                 ? theme.palette.primary.main
//                 : theme.palette.action.disabled,
//             cursor: 'pointer',
//             '&:hover': {
//               transform: 'scale(1.2)',
//             },
//             transition: theme.transitions.create(
//               ['transform', 'background-color'],
//               {
//                 duration: theme.transitions.duration.short,
//               }
//             ),
//           }}
//         />
//       ))}
//     </Box>
//   )
// }

// export default React.memo(QuestionPagination)

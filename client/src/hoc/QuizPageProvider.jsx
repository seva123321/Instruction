/* eslint-disable indent */
/* eslint-disable operator-linebreak */
import { createContext, cloneElement, useRef, useMemo } from 'react'
import {
  Button,
  Box,
  Typography,
  Stack,
  Paper,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'

export const QuizPageContext = createContext({
  showAnswer: () => {},
  gameData: null,
})

export function QuizPageProvider({ children }) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const gameRef = useRef(null)
  const navigate = useNavigate()

  const gameData = useMemo(
    () => ({
      question:
        'Задайте правильную последовательность использования порошкового огнетушителя',
      answer: [
        'Safety_pin_fire-extinguisher',
        'Stamp_fire-extinguisher',
        'Hose_fire-extinguisher',
        'Handle_bottom_fire-extinguisher',
      ],
      warning:
        'Ни в коем случае не прикасайтесь к соплу углекислотного огнетушителя',
      model_path: '/models/fire_extinguisher_powder/scene.gltf',
      partTooltips: {
        Safety_pin: 'Предохранительная чека',
        Stamp: 'Пломба',
        Hose: 'Шланг',
        Handle_bottom: 'Ручка активации',
      },
    }),
    []
  )

  const handleShowAnswer = () => {
    if (gameRef.current?.playAnimationSequence) {
      gameRef.current.playAnimationSequence()
    }
  }

  const contextValue = useMemo(
    () => ({
      showAnswer: handleShowAnswer,
      gameData,
    }),
    [gameData]
  )

  return (
    <QuizPageContext.Provider value={contextValue}>
      <Box
        sx={{
          position: 'relative',
          height: '100vh',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%)',
          overflow: 'hidden',
        }}
      >
        {/* Кнопка назад */}
        <Button
          onClick={() => navigate(-1)}
          variant="outlined"
          sx={{
            position: 'absolute',
            top: isMobile ? 8 : 16,
            right: isMobile ? 8 : 16,
            zIndex: 1000,
            borderRadius: '50px',
            padding: isMobile ? '6px 12px' : '8px 20px',
            fontSize: isMobile ? '0.8rem' : '0.9rem',
            backgroundColor: 'rgba(255,255,255,0.8)',
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,1)',
            },
            minWidth: 'auto',
          }}
        >
          {`← ${isMobile ? 'Назад' : 'Назад к играм'}`}
        </Button>

        {/* Основной контент */}
        <Box
          sx={{
            height: isMobile ? 'calc(100vh - 180px)' : 'calc(100vh - 200px)',
            mt: isMobile ? 4 : 0,
          }}
        >
          {cloneElement(children, { ref: gameRef })}
        </Box>

        {/* Панель задания и кнопки */}
        <Paper
          elevation={3}
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            width: '100%',
            p: isMobile ? 1.5 : 3,
            borderRadius: isMobile ? '12px 12px 0 0' : '12px',
            backgroundColor: 'rgba(255,255,255,0.95)',
            boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
            zIndex: 1000,
            mx: 'auto',
            maxWidth: 800,
            ...(isMobile
              ? {}
              : {
                  bottom: 20,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '90%',
                }),
          }}
        >
          <Stack spacing={isMobile ? 1 : 2} alignItems="center">
            <Typography
              variant={isMobile ? 'h6' : 'h5'}
              component="h2"
              sx={{
                fontWeight: 600,
                color: 'primary.main',
                textAlign: 'center',
                fontSize: isMobile ? '1.1rem' : '1.5rem',
              }}
            >
              Задание:
            </Typography>

            <Typography
              variant="body1"
              sx={{
                fontSize: isMobile ? '0.9rem' : '1.1rem',
                textAlign: 'center',
                mb: isMobile ? 1 : 2,
                px: isMobile ? 1 : 0,
              }}
            >
              {gameData.question}
            </Typography>

            <Button
              onClick={handleShowAnswer}
              variant="contained"
              size={isMobile ? 'medium' : 'large'}
              fullWidth={isMobile}
              sx={{
                px: isMobile ? 2 : 4,
                py: isMobile ? 1 : 1.5,
                borderRadius: '50px',
                fontSize: isMobile ? '0.9rem' : '1.1rem',
                fontWeight: 600,
                background: 'linear-gradient(45deg, #1976d2 0%, #2196f3 100%)',
                boxShadow: '0 4px 10px rgba(25, 118, 210, 0.3)',
                '&:hover': {
                  boxShadow: '0 6px 14px rgba(25, 118, 210, 0.4)',
                },
                maxWidth: isMobile ? '100%' : 'none',
              }}
            >
              Показать ответ
            </Button>

            {!isMobile && (
              <Typography
                variant="caption"
                sx={{
                  mt: 1,
                  color: 'error.main',
                  textAlign: 'center',
                  fontStyle: 'italic',
                }}
              >
                {gameData.warning}
              </Typography>
            )}
          </Stack>
        </Paper>
      </Box>
    </QuizPageContext.Provider>
  )
}

// import { createContext, cloneElement, useRef } from 'react'
// import {
//   Button,
//   Box,
//   Typography,
//   Stack,
//   Paper,
//   useMediaQuery,
//   useTheme,
// } from '@mui/material'
// import { useNavigate } from 'react-router-dom'

// export const QuizPageContext = createContext({
//   showAnswer: () => {},
//   gameData: null,
// })

// export function QuizPageProvider({ children }) {
//   const theme = useTheme()
//   const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
//   const gameRef = useRef(null)
//   const navigate = useNavigate()

//   const gameData = {
//     question:
//       'Задайте правильную последовательность использования порошкового огнетушителя',
//     answer: [
//       'Safety_pin_fire-extinguisher',
//       'Stamp_fire-extinguisher',
//       'Hose_fire-extinguisher',
//       'Handle_bottom_fire-extinguisher',
//     ],
//     warning:
//       'Ни в коем случае не прикасайтесь к соплу углекислотного огнетушителя',
//     model_path: '/models/fire_extinguisher_powder/scene.gltf',
//     partTooltips: {
//       Safety_pin: 'Предохранительная чека',
//       Stamp: 'Пломба',
//       Hose: 'Шланг',
//       Handle_bottom: 'Ручка активации',
//     },
//   }

//   const handleShowAnswer = () => {
//     if (gameRef.current?.playAnimationSequence) {
//       gameRef.current.playAnimationSequence()
//     } else {
//       console.warn('Анимация не найдена')
//     }
//   }

//   return (
//     <QuizPageContext.Provider
//       value={{ showAnswer: handleShowAnswer, gameData }}
//     >
//       <Box
//         sx={{
//           position: 'relative',
//           height: '100vh',
//           background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%)',
//           overflow: 'hidden',
//         }}
//       >
//         {/* Кнопка назад */}
//         <Button
//           onClick={() => navigate(-1)}
//           variant="outlined"
//           sx={{
//             position: 'absolute',
//             top: isMobile ? 8 : 16,
//             right: isMobile ? 8 : 16,
//             // top: isMobile ? 8 : 16,
//             // left: isMobile ? 8 : 16,
//             zIndex: 1000,
//             borderRadius: '50px',
//             padding: isMobile ? '6px 12px' : '8px 20px',
//             fontSize: isMobile ? '0.8rem' : '0.9rem',
//             backgroundColor: 'rgba(255,255,255,0.8)',
//             '&:hover': {
//               backgroundColor: 'rgba(255,255,255,1)',
//             },
//             minWidth: 'auto',
//           }}
//         >
//           ←
// {' '}
// {isMobile ? 'Назад' : 'Назад к играм'}
//         </Button>

//         {/* Основной контент */}
//         <Box
//           sx={{
//             height: isMobile ? 'calc(100vh - 180px)' : 'calc(100vh - 200px)',
//             mt: isMobile ? 4 : 0,
//           }}
//         >
//           {cloneElement(children, { ref: gameRef })}
//         </Box>

//         {/* Панель задания и кнопки */}
//         <Paper
//           elevation={3}
//           sx={{
//             position: 'absolute',
//             bottom: 0,
//             left: 0,
//             right: 0,
//             width: '100%',
//             p: isMobile ? 1.5 : 3,
//             borderRadius: isMobile ? '12px 12px 0 0' : '12px',
//             backgroundColor: 'rgba(255,255,255,0.95)',
//             boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
//             zIndex: 1000,
//             mx: 'auto',
//             maxWidth: 800,
//             ...(isMobile ?
//               {} :
//               {
//                 bottom: 20,
//                 left: '50%',
//                 transform: 'translateX(-50%)',
//                 width: '90%',
//               }),
//           }}
//         >
//           <Stack spacing={isMobile ? 1 : 2} alignItems="center">
//             <Typography
//               variant={isMobile ? 'h6' : 'h5'}
//               component="h2"
//               sx={{
//                 fontWeight: 600,
//                 color: 'primary.main',
//                 textAlign: 'center',
//                 fontSize: isMobile ? '1.1rem' : '1.5rem',
//               }}
//             >
//               Задание:
//             </Typography>

//             <Typography
//               variant="body1"
//               sx={{
//                 fontSize: isMobile ? '0.9rem' : '1.1rem',
//                 textAlign: 'center',
//                 mb: isMobile ? 1 : 2,
//                 px: isMobile ? 1 : 0,
//               }}
//             >
//               {gameData.question}
//             </Typography>

//             <Button
//               onClick={handleShowAnswer}
//               variant="contained"
//               size={isMobile ? 'medium' : 'large'}
//               fullWidth={isMobile}
//               sx={{
//                 px: isMobile ? 2 : 4,
//                 py: isMobile ? 1 : 1.5,
//                 borderRadius: '50px',
//                 fontSize: isMobile ? '0.9rem' : '1.1rem',
//                 fontWeight: 600,
//                 background: 'linear-gradient(45deg, #1976d2 0%, #2196f3 100%)',
//                 boxShadow: '0 4px 10px rgba(25, 118, 210, 0.3)',
//                 '&:hover': {
//                   boxShadow: '0 6px 14px rgba(25, 118, 210, 0.4)',
//                 },
//                 maxWidth: isMobile ? '100%' : 'none',
//               }}
//             >
//               Показать ответ
//             </Button>

//             {!isMobile && (
//               <Typography
//                 variant="caption"
//                 sx={{
//                   mt: 1,
//                   color: 'error.main',
//                   textAlign: 'center',
//                   fontStyle: 'italic',
//                 }}
//               >
//                 {gameData.warning}
//               </Typography>
//             )}
//           </Stack>
//         </Paper>
//       </Box>
//     </QuizPageContext.Provider>
//   )
// }

// import { createContext, cloneElement, useRef } from 'react'
// import { Button, Box, Typography, Stack, Paper } from '@mui/material'
// import { useNavigate } from 'react-router-dom'

// export const QuizPageContext = createContext({
//   showAnswer: () => {},
//   gameData: null,
// })

// export const QuizPageProvider = ({ children }) => {
//   const gameRef = useRef(null)
//   const navigate = useNavigate()

//   const gameData = {
//     question: 'Задайте правильную последовательность использования порошкового огнетушителя',
//     answer: [
//       'Safety_pin_fire-extinguisher',
//       'Stamp_fire-extinguisher',
//       'Hose_fire-extinguisher',
//       'Handle_bottom_fire-extinguisher',
//     ],
//     warning: 'Ни в коем случае не прикасайтесь к соплу углекислотного огнетушителя',
//     model_path: '/models/fire_extinguisher_powder/scene.gltf',
//     partTooltips: {
//       Safety_pin: 'Предохранительная чека',
//       Stamp: 'Пломба',
//       Hose: 'Шланг',
//       Handle_bottom: 'Ручка активации',
//     },
//   }

//   const handleShowAnswer = () => {
//     if (gameRef.current?.playAnimationSequence) {
//       gameRef.current.playAnimationSequence()
//     } else {
//       console.warn('Анимация не найдена')
//     }
//   }

//   return (
//     <QuizPageContext.Provider value={{ showAnswer: handleShowAnswer, gameData }}>
//       <Box sx={{
//         position: 'relative',
//         height: '100vh',
//         background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%)',
//       }}>
//         {/* Кнопка назад */}
//         <Button
//           onClick={() => navigate(-1)}
//           variant="outlined"
//           sx={{
//             position: 'absolute',
//             top: 16,
//             left: 16,
//             zIndex: 1000,
//             borderRadius: '50px',
//             padding: '8px 20px',
//             backgroundColor: 'rgba(255,255,255,0.8)',
//             '&:hover': {
//               backgroundColor: 'rgba(255,255,255,1)',
//             }
//           }}
//         >
//           ← Назад к играм
//         </Button>

//         {/* Основной контент */}
//         {cloneElement(children, { ref: gameRef })}

//         {/* Панель задания и кнопки */}
//         <Paper elevation={3} sx={{
//           position: 'absolute',
//           bottom: 40,
//           left: '50%',
//           transform: 'translateX(-50%)',
//           width: '90%',
//           maxWidth: 800,
//           p: 3,
//           borderRadius: '12px',
//           backgroundColor: 'rgba(255,255,255,0.95)',
//           boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
//           zIndex: 1000,
//         }}>
//           <Stack spacing={2} alignItems="center">
//             <Typography variant="h5" component="h2" sx={{
//               fontWeight: 600,
//               color: 'primary.main',
//               textAlign: 'center'
//             }}>
//               Задание:
//             </Typography>

//             <Typography variant="body1" sx={{
//               fontSize: '1.1rem',
//               textAlign: 'center',
//               mb: 2
//             }}>
//               {gameData.question}
//             </Typography>

//             <Button
//               onClick={handleShowAnswer}
//               variant="contained"
//               size="large"
//               sx={{
//                 px: 4,
//                 py: 1.5,
//                 borderRadius: '50px',
//                 fontSize: '1.1rem',
//                 fontWeight: 600,
//                 background: 'linear-gradient(45deg, #1976d2 0%, #2196f3 100%)',
//                 boxShadow: '0 4px 10px rgba(25, 118, 210, 0.3)',
//                 '&:hover': {
//                   boxShadow: '0 6px 14px rgba(25, 118, 210, 0.4)',
//                 }
//               }}
//             >
//               Показать правильный ответ
//             </Button>

//             <Typography variant="caption" sx={{
//               mt: 1,
//               color: 'error.main',
//               textAlign: 'center',
//               fontStyle: 'italic'
//             }}>
//               {gameData.warning}
//             </Typography>
//           </Stack>
//         </Paper>
//       </Box>
//     </QuizPageContext.Provider>
//   )
// }

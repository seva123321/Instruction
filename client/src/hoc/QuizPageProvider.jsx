/* eslint-disable indent */
/* eslint-disable operator-linebreak */
import {
  createContext,
  cloneElement,
  useRef,
  useMemo,
  useCallback,
  useState,
} from 'react'
import {
  Button,
  Box,
  Typography,
  Stack,
  Paper,
  useMediaQuery,
  useTheme,
  Collapse,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Tooltip,
  IconButton,
  Popover,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  ArrowBack as ArrowBackIcon,
  Celebration as CelebrationIcon,
  MoodBad as MoodBadIcon,
  ExpandMore as ExpandMoreIcon,
  HelpOutline as HelpOutlineIcon,
  ZoomIn as ZoomInIcon,
  PanTool as PanToolIcon,
  RotateLeft as RotateLeftIcon,
} from '@mui/icons-material'
import {
  useGetGameQuizQuery,
  usePostFireSafetyResultMutation,
} from '@/slices/gameApi'

export const QuizPageContext = createContext({
  showAnswer: () => {},
  gameData: null,
  setResult: () => {},
})

export function QuizPageProvider({ children }) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [helpAnchorEl, setHelpAnchorEl] = useState(null)
  const helpOpen = Boolean(helpAnchorEl)

  const navigate = useNavigate()
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const level = searchParams.get('level')
  const gameType = location.pathname.split('/').pop()

  const {
    data, // @TODO : gameData,
    isLoading,
    isError,
  } = useGetGameQuizQuery({ gameType, level })
  const [postFireSafetyResult] = usePostFireSafetyResultMutation()
  const [showResult, setShowResult] = useState(false)
  const [result, setResult] = useState(null)
  const [resultIsSended, setResultIsSended] = useState(false)
  const gameRef = useRef(null)
  const [isCorrect, setIsCorrect] = useState(false)

  const handleHelpClick = (event) => {
    setHelpAnchorEl(event.currentTarget)
  }

  const handleHelpClose = () => {
    setHelpAnchorEl(null)
  }

  const gameData = useMemo(
    () => ({
      question:
        'Выберите оптимальный способ тушения пожара. Обратите внимание на очаг возгорания.',
      answer: ['co2_fire-extinguisher'],
      warning: 'Результатом является первый клик или таб по предмету.',
      model_path: '/models/dark_room_fire_safety.glb',
      part_tooltips: {
        safety_pin: 'Предохранительная чека',
        stamp: 'Пломба',
        hose: 'Шланг',
        handle_bottom: 'Ручка активации',
        fire_secur_indicator: 'Кнопка пожарной сигнализации',
        cylinder_co2: 'Углекислотный огнетушитель',
        cylinder: 'Порошковый огнетушитель',
        hydrant: 'Внутренний пожарный кран',
        server: 'Сервера/Электрооборудование',
      },
      fire_position: [10, -0.5, -13],
      fire_size: [10, 8],
      animation_sequence: [
        'nurbspath_co2_fire-extinguisher',
        'safety_pin_co2_fire-extinguisher',
        'stamp_co2_fire-extinguisher',
        'hose_co2_fire-extinguisher',
        'handle_bottom_co2_fire-extinguisher',
      ],
      obj_allowed_clicks: [
        'hydrant',
        'fire-extinguisher',
        'fire_secur_indicator',
      ],
    }),
    []
  )

  // // Метод для обновления результата из дочерних компонентов
  // const handleSetResult = useCallback((correct) => {
  //   setIsCorrect(correct)
  //   setResult(correct ? 'win' : 'lose')
  // }, [])

  // const handleShowAnswer = useCallback(() => {
  //   if (gameRef.current?.playAnimationSequence) {
  //     gameRef.current.playAnimationSequence()
  //   }
  //   setResultIsSended(true)

  //   if (resultIsSended) {
  //     setResult(isCorrect ? 'win' : 'lose')
  //     postFireSafetyResult({ result: isCorrect })
  //   }
  //   setShowResult(true)
  //   const timer = setTimeout(() => {
  //     setShowResult(false)
  //   }, 5000)

  //   return () => clearTimeout(timer)
  // }, [isCorrect])

  // const contextValue = useMemo(
  //   () => ({
  //     showAnswer: handleShowAnswer,
  //     gameData,
  //     setResult: handleSetResult,
  //   }),
  //   [gameData, handleShowAnswer, handleSetResult]
  // )

  // Метод для обновления результата из дочерних компонентов
  const handleSetResult = useCallback((correct) => {
    setIsCorrect(correct)
    setResult(correct ? 'win' : 'lose')
  }, [])

  const handleShowAnswer = useCallback(() => {
    // Запускаем анимацию
    if (gameRef.current?.playAnimationSequence) {
      gameRef.current.playAnimationSequence()
    }
    if (resultIsSended) return

    // Устанавливаем флаг отправки результата
    setResultIsSended(true)

    // Отправляем результат и показываем сообщение
    requestAnimationFrame(() => {
      setResult(isCorrect ? 'win' : 'lose')
      postFireSafetyResult({ result: isCorrect })
      setShowResult(true)
    })

    // Таймер для скрытия результата
    const hideTimer = setTimeout(() => {
      setShowResult(false)
    }, 5000)

    return () => clearTimeout(hideTimer)
  }, [isCorrect, resultIsSended, postFireSafetyResult])

  const contextValue = useMemo(
    () => ({
      showAnswer: handleShowAnswer,
      gameData,
      setResult: handleSetResult,
    }),
    [gameData, handleShowAnswer, handleSetResult]
  )

  const memoizedChildren = useMemo(
    () => cloneElement(children, { ref: gameRef }),
    [children]
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
        {/* Кнопка назад и помощь */}
        <Box
          sx={{
            position: 'absolute',
            top: isMobile ? 8 : 16,
            right: isMobile ? 8 : 16,
            zIndex: 1000,
            display: 'flex',
            gap: 1,
          }}
        >
          <Button
            onClick={() => navigate(-1)}
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            sx={{
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
            {isMobile ? 'Назад' : 'Назад к играм'}
          </Button>

          <IconButton
            onClick={handleHelpClick}
            sx={{
              backgroundColor: 'rgba(255,255,255,0.8)',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,1)',
              },
            }}
          >
            <HelpOutlineIcon />
          </IconButton>
        </Box>

        {/* Поповер с инструкцией */}
        <Popover
          open={helpOpen}
          anchorEl={helpAnchorEl}
          onClose={handleHelpClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          sx={{
            '& .MuiPaper-root': {
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              minWidth: '250px',
            },
          }}
        >
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
              Управление сценой
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <ZoomInIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="Колесико мыши - приближение/отдаление" />
              </ListItem>
              <ListItem>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <RotateLeftIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="ЛКМ + движение - вращение сцены" />
              </ListItem>
              <ListItem>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <PanToolIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="Shift + ЛКМ - смена фокуса (панорамирование)" />
              </ListItem>
            </List>
            {isMobile && (
              <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                На мобильных устройствах используйте жесты пальцами для
                управления.
              </Typography>
            )}
          </Box>
        </Popover>

        {/* Основной контент */}
        <Box
          sx={{
            height: isMobile ? 'calc(100vh - 180px)' : 'calc(100vh - 200px)',
            mt: isMobile ? 4 : 0,
          }}
        >
          {memoizedChildren}
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
          <Accordion defaultExpanded>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel2-content"
              id="panel2-header"
              sx={{ textAlign: 'center' }}
            >
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
                Задание
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={isMobile ? 1 : 2} alignItems="center">
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: isMobile ? '0.9rem' : '1.1rem',
                    textAlign: 'center',
                    mb: isMobile ? 1 : 2,
                    px: isMobile ? 1 : 0,
                  }}
                >
                  {gameData?.question}
                </Typography>

                <Tooltip title="После просмотра ответа игра считается сыгранной">
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
                      background:
                        'linear-gradient(45deg, #1976d2 0%, #2196f3 100%)',
                      boxShadow: '0 4px 10px rgba(25, 118, 210, 0.3)',
                      '&:hover': {
                        boxShadow: '0 6px 14px rgba(25, 118, 210, 0.4)',
                      },
                      maxWidth: isMobile ? '100%' : 'none',
                    }}
                  >
                    Показать ответ
                  </Button>
                </Tooltip>

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
                    {gameData?.warning}
                  </Typography>
                )}
              </Stack>
            </AccordionDetails>
          </Accordion>
        </Paper>

        <Collapse in={showResult} timeout={500}>
          <Box
            sx={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 2000,
              display: 'flex',
              justifyContent: 'center',
              p: 2,
            }}
          >
            <Paper
              elevation={6}
              sx={{
                p: 3,
                backgroundColor:
                  result === 'win' ? 'success.light' : 'error.light',
                color: 'white',
                borderRadius: '16px',
                maxWidth: '90%',
                textAlign: 'center',
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                {result === 'win' ? (
                  <>
                    <CelebrationIcon fontSize="large" />
                    <Typography variant="h6">
                      Поздравляем! Вы правильно выполнили задание!
                    </Typography>
                  </>
                ) : (
                  <>
                    <MoodBadIcon fontSize="large" />
                    <Typography variant="h6">
                      Последовательность неверная! В следующий раз вам точно
                      повезет
                    </Typography>
                  </>
                )}
              </Stack>
            </Paper>
          </Box>
        </Collapse>
      </Box>
    </QuizPageContext.Provider>
  )
}

// /*
// /* eslint-disable indent */
// /* eslint-disable operator-linebreak */
// import {
//   createContext,
//   cloneElement,
//   useRef,
//   useMemo,
//   useCallback,
//   useState,
//   useEffect,
// } from 'react'
// import {
//   Button,
//   Box,
//   Typography,
//   Stack,
//   Paper,
//   useMediaQuery,
//   useTheme,
//   Fade,
//   Zoom,
//   Slide,
//   Collapse,
// } from '@mui/material'
// import { useLocation, useNavigate } from 'react-router-dom'
// import ArrowBackIcon from '@mui/icons-material/ArrowBack'
// import CelebrationIcon from '@mui/icons-material/Celebration'
// import MoodBadIcon from '@mui/icons-material/MoodBad'
// import { useGetGameQuizQuery } from '../slices/gameApi'

// export const QuizPageContext = createContext({
//   showAnswer: () => {},
//   gameData: null,
//   updateUserAnswers: (answers) => {},
// })

// export function QuizPageProvider({ children }) {
//   const theme = useTheme()
//   const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
//   const [showResult, setShowResult] = useState(false)
//   const [result, setResult] = useState(null)

//   const navigate = useNavigate()
//   const location = useLocation()
//   const searchParams = new URLSearchParams(location.search)
//   const level = searchParams.get('level')
//   const gameType = location.pathname.split('/').pop()

//   const { data, isLoading, isError } = useGetGameQuizQuery({ gameType, level })
//   const [userAnswers, setUserAnswers] = useState([])
//   const gameRef = useRef(null)

//   const gameData = useMemo(
//     () => ({
//       question:
//         'Задайте правильную последовательность использования порошкового огнетушителя',
//       answer: [
//         'safety_pin_fire-extinguisher',
//         'stamp_fire-extinguisher',
//         'hose_fire-extinguisher',
//         'handle_bottom_fire-extinguisher',
//       ],
//       warning:
//         'Подачу огнетушащего материала необходимо
//  производить порционно. Длительность подачи должна составлять
//  примерно 2 секунды с небольшим перерывом.',
//       model_path: '/models/fire_extinguisher_powder.glb',
//       part_tooltips: {
//         safety_pin: 'Предохранительная чека',
//         stamp: 'Пломба',
//         hose: 'Шланг',
//         handle_bottom: 'Ручка активации',
//       },
//       animation_sequence: [
//         'safety_pin_fire-extinguisher',
//         'stamp_fire-extinguisher',
//         'hose_fire-extinguisher',
//         'handle_bottom_fire-extinguisher',
//       ],
//     }),
//     []
//   )

//   const updateUserAnswers = useCallback((newAnswer) => {
//     setUserAnswers((prev) => [...prev, newAnswer])
//   }, [])

//   const isEqualArray = (arr1, arr2) =>
//     arr1.length === arr2.length && arr1.every((item, i) => item === arr2[i])

//   const handleShowAnswer = useCallback(() => {
//     if (gameRef.current?.playAnimationSequence) {
//       gameRef.current.playAnimationSequence()
//     }

//     const isCorrect = isEqualArray(gameData.answer, userAnswers)
//     setResult(isCorrect ? 'win' : 'lose')
//     setShowResult(true)

//     // Автоматическое скрытие через 5 секунд
//     const timer = setTimeout(() => {
//       setShowResult(false)
//     }, 5000)

//     return () => clearTimeout(timer)
//   }, [userAnswers, gameData.answer])

//   const contextValue = useMemo(
//     () => ({
//       showAnswer: handleShowAnswer,
//       gameData,
//       userAnswers,
//       updateUserAnswers,
//     }),
//     [gameData, handleShowAnswer, userAnswers, updateUserAnswers]
//   )

//   return (
//     <QuizPageContext.Provider value={contextValue}>
//       <Box
//         sx={{
//           position: 'relative',
//           height: '100vh',
//           background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%)',
//           overflow: 'hidden',
//         }}
//       >
//         {/* Анимация результата */}
//         <Collapse in={showResult} timeout={500}>
//           <Box
//             sx={{
//               position: 'fixed',
//               top: 0,
//               left: 0,
//               right: 0,
//               zIndex: 2000,
//               display: 'flex',
//               justifyContent: 'center',
//               p: 2,
//             }}
//           >
//             <Paper
//               elevation={6}
//               sx={{
//                 p: 3,
//                 backgroundColor:
//                   result === 'win' ? 'success.light' : 'error.light',
//                 color: 'white',
//                 borderRadius: '16px',
//                 maxWidth: '90%',
//                 textAlign: 'center',
//               }}
//             >
//               <Stack direction="row" alignItems="center" spacing={2}>
//                 {result === 'win' ? (
//                   <>
//                     <CelebrationIcon fontSize="large" />
//                     <Typography variant="h6">
//                       Поздравляем! Вы правильно выполнили задание!
//                     </Typography>
//                   </>
//                 ) : (
//                   <>
//                     <MoodBadIcon fontSize="large" />
//                     <Typography variant="h6">
//                       Последовательность неверная! В следующий раз вам точно
//                       повезет
//                     </Typography>
//                   </>
//                 )}
//               </Stack>
//             </Paper>
//           </Box>
//         </Collapse>

//         {/* Кнопка назад */}
//         <Button
//           onClick={() => navigate(-1)}
//           variant="outlined"
//           startIcon={<ArrowBackIcon />}
//           sx={{
//             position: 'absolute',
//             top: isMobile ? 8 : 16,
//             right: isMobile ? 8 : 16,
//             zIndex: 1000,
//             borderRadius: '50px',
//             padding: isMobile ? '6px 12px' : '8px 20px',
//             fontSize: isMobile ? '0.8rem' : '0.9rem',
//             backgroundColor: 'rgba(255,255,255,0.8)',
//             '&:hover': {
//               backgroundColor: 'rgba(255,255,255,1)',
//               boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
//             },
//             minWidth: 'auto',
//             transition: 'all 0.3s ease',
//           }}
//         >
//           {isMobile ? 'Назад' : 'Назад к играм'}
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
//             backgroundColor: 'rgba(255,255,255,0.97)',
//             boxShadow: '0 -4px 20px rgba(0,0,0,0.15)',
//             zIndex: 1000,
//             mx: 'auto',
//             maxWidth: 800,
//             backdropFilter: 'blur(8px)',
//             ...(isMobile
//               ? {}
//               : {
//                   bottom: 20,
//                   left: '50%',
//                   transform: 'translateX(-50%)',
//                   width: '90%',
//                 }),
//           }}
//         >
//           <Stack spacing={isMobile ? 1 : 2} alignItems="center">
//             <Typography
//               variant={isMobile ? 'h6' : 'h5'}
//               component="h2"
//               sx={{
//                 fontWeight: 700,
//                 color: 'primary.main',
//                 textAlign: 'center',
//                 fontSize: isMobile ? '1.1rem' : '1.5rem',
//                 textShadow: '0 1px 2px rgba(0,0,0,0.1)',
//               }}
//             >
//               🧯 Задание:
//             </Typography>

//             <Typography
//               variant="body1"
//               sx={{
//                 fontSize: isMobile ? '0.9rem' : '1.1rem',
//                 textAlign: 'center',
//                 mb: isMobile ? 1 : 2,
//                 px: isMobile ? 1 : 0,
//                 fontWeight: 500,
//                 color: 'text.secondary',
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
//                   transform: 'translateY(-2px)',
//                 },
//                 maxWidth: isMobile ? '100%' : 'none',
//                 transition: 'all 0.3s ease',
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
//                   display: 'flex',
//                   alignItems: 'center',
//                   gap: '4px',
//                 }}
//               >
//                 ⚠️ {gameData.warning}
//               </Typography>
//             )}
//           </Stack>
//         </Paper>
//       </Box>
//     </QuizPageContext.Provider>
//   )
// }
// */

// для работы с СЕРВЕРОМ
// /* eslint-disable indent */
// /* eslint-disable operator-linebreak */
// import { createContext, cloneElement, useRef, useMemo } from 'react'
// import {
//   Button,
//   Box,
//   Typography,
//   Stack,
//   Paper,
//   useMediaQuery,
//   useTheme,
//   CircularProgress,
// } from '@mui/material'
// import { Html } from '@react-three/drei'
// import { useLocation, useNavigate } from 'react-router-dom'
// import { useGetGameQuizQuery } from '../slices/gameApi'

// export const QuizPageContext = createContext({
//   showAnswer: () => {},
//   gameData: null,
// })

// const LoadingIndicator = () => (
//   <Html center>
//     <div
//       style={{
//         padding: '10px 20px',
//         background: 'rgba(0,0,0,0.7)',
//         color: 'white',
//         borderRadius: '4px',
//       }}
//     >
//       Loading model...
//     </div>
//   </Html>
// )

// export function QuizPageProvider({ children }) {
//   const theme = useTheme()
//   const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
//   const gameRef = useRef(null)
//   const navigate = useNavigate()
//   const location = useLocation()
//   const searchParams = new URLSearchParams(location.search)
//   const level = searchParams.get('level')
//   const gameType = location.pathname.split('/').pop()
//   const {
//     data: serverGameData,
//     isLoading,
//     isError,
//   } = useGetGameQuizQuery({ gameType, level })
//   const gameData = useMemo(() => {
//     if (!serverGameData) return null

//     return {
//       question: serverGameData.question,
//       answer: serverGameData.answer,
//       warning: serverGameData.warning,
//       model_path: serverGameData.model_path,
//       part_tooltips: serverGameData.part_tooltips,
//       animation_sequence: serverGameData.animation_sequence,
//     }
//   }, [serverGameData])

//   const handleShowAnswer = () => {
//     if (gameRef.current?.playAnimationSequence) {
//       gameRef.current.playAnimationSequence()
//     }
//   }

//   if (isLoading) return <LoadingIndicator />
//   if (isError) return <div>Ошибка загрузки данных</div>
//   if (!gameData) return null

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
//           {`← ${isMobile ? 'Назад' : 'Назад к играм'}`}
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
//             ...(isMobile
//               ? {}
//               : {
//                   bottom: 20,
//                   left: '50%',
//                   transform: 'translateX(-50%)',
//                   width: '90%',
//                 }),
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

/* eslint-disable indent */
/* eslint-disable operator-linebreak */
import {
  createContext,
  cloneElement,
  useRef,
  useMemo,
  useCallback,
  useState,
  lazy,
  Suspense,
} from 'react'
import {
  Button,
  Box,
  Typography,
  Stack,
  Paper,
  useMediaQuery,
  useTheme,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Tooltip,
  IconButton,
} from '@mui/material'
import {
  ArrowBack as ArrowBackIcon,
  ExpandMore as ExpandMoreIcon,
  HelpOutline as HelpOutlineIcon,
} from '@mui/icons-material'
import { ErrorBoundary } from 'react-error-boundary'
import { useLocation, useNavigate } from 'react-router-dom'

import ErrorFallback from '@/components/ErrorFallback'
import AlertGameResult from '@/components/AlertGameResult'
const GamePropover = lazy(() => import('@/components/GamePropover'))

import {
  useGetGameQuizQuery,
  usePostGameQuizResultMutation,
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

  const { data: gameData } = useGetGameQuizQuery({ gameType, level })
  const [postGameResultResult] = usePostGameQuizResultMutation()
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
      postGameResultResult({
        nameGame: 'fire_safety',
        level,
        data: { result: isCorrect },
      })
      setShowResult(true)
    })

    // Таймер для скрытия результата
    const hideTimer = setTimeout(() => {
      setShowResult(false)
    }, 5000)

    // eslint-disable-next-line consistent-return
    return () => clearTimeout(hideTimer)
  }, [level, isCorrect, resultIsSended, postGameResultResult])

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
      <ErrorBoundary
        FallbackComponent={ErrorFallback}
        onReset={() => window.location.reload()}
      >
        <Box
          sx={{
            position: 'relative',
            height: '100vh',
            background: 'linear-gradient(to bottom, #f1fcff, #d2ecf3)',
            overflow: 'hidden',
          }}
        >
          {/* Кнопка назад и помощь */}
          <Box
            sx={{
              position: 'absolute',
              top: isMobile ? 8 : 16,
              right: isMobile ? 8 : 16,
              zIndex: 1100,
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
          <Suspense
            fallback={
              <div style={{ width: 100, height: 50, backgroundColor: 'white' }}>
                Loading
              </div>
            }
          >
            <GamePropover
              isMobile={isMobile}
              helpOpen={helpOpen}
              helpAnchorEl={helpAnchorEl}
              handleHelpClose={handleHelpClose}
            />
          </Suspense>

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
          <AlertGameResult result={result} showResult={showResult} />
        </Box>
      </ErrorBoundary>
    </QuizPageContext.Provider>
  )
}

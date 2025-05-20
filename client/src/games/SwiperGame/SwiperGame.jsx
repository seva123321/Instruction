/* eslint-disable operator-linebreak */
/* eslint-disable no-nested-ternary */

import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSwipeable } from 'react-swipeable'
import {
  Box,
  Typography,
  Button,
  Paper,
  LinearProgress,
  styled,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Fade,
} from '@mui/material'
import { Info as InfoIcon } from '@mui/icons-material'

import {
  useGetGameSwiperQuery,
  usePostSwiperResultMutation,
} from '@/slices/gameApi'
import useGame from '@/hook/useGame'
import GameOverScreen from '@/components/GameOverScreen'
import ButtonBack from '@/components/ButtonBack'

const TIME_LIMIT = 30

const CardContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  height: '50vh',
  minHeight: '300px',
  maxHeight: '500px',
  marginBottom: theme.spacing(1),
  [theme.breakpoints.down('sm')]: {
    height: '55vh',
    minHeight: '280px',
    maxHeight: 'none',
    marginBottom: 0,
  },
}))

const QuestionCard = styled(Paper)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  padding: theme.spacing(3),
  margin: '0 auto',
  maxWidth: '600px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
  transition: 'transform 0.3s ease-out, opacity 0.2s ease-out',
  touchAction: 'none',
  userSelect: 'none',
  willChange: 'transform, opacity',
  borderRadius: '16px',
  boxShadow: theme.shadows[6],
  backgroundColor: theme.palette.background.paper,
  cursor: 'grab',
  '&:active': {
    cursor: 'grabbing',
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2.5),
    borderRadius: '12px',
  },
}))

const AnswerIndicator = styled(Box)(({ answer, theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor:
    answer === 'yes'
      ? `${theme.palette.success.light}33`
      : `${theme.palette.error.light}33`,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  fontSize: '4rem',
  fontWeight: 'bold',
  opacity: 0,
  transition: 'opacity 0.2s',
  borderRadius: 'inherit',
}))

const ActionButton = styled(Button)(({ theme, answer }) => ({
  minWidth: '120px',
  height: '56px',
  fontSize: '1.1rem',
  fontWeight: 'bold',
  borderRadius: '12px',
  boxShadow: theme.shadows[3],
  textTransform: 'none',
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:active': {
    transform: 'scale(0.98)',
    boxShadow: theme.shadows[1],
  },
  [theme.breakpoints.down('sm')]: {
    minWidth: '48%',
    height: '52px',
    fontSize: '1rem',
    borderRadius: '10px',
  },
  ...(answer === 'yes' && {
    backgroundColor: theme.palette.success.main,
    '&:hover': {
      backgroundColor: theme.palette.success.dark,
    },
  }),
  ...(answer === 'no' && {
    backgroundColor: theme.palette.error.main,
    '&:hover': {
      backgroundColor: theme.palette.error.dark,
    },
  }),
}))

const InstructionText = styled(Typography)(({ theme }) => ({
  position: 'fixed',
  left: '50%',
  textAlign: 'center',
  color: theme.palette.text.secondary,
  backgroundColor: theme.palette.background.paper,
  borderRadius: '20px',
  padding: theme.spacing(1, 2),
  boxShadow: theme.shadows[2],
  fontSize: '0.85rem',
  maxWidth: '90%',
  zIndex: 100,
  display: 'flex',
  alignItems: 'center',
  [theme.breakpoints.up('sm')]: {
    fontSize: '0.9rem',
    padding: theme.spacing(1.5, 3),
    transform: 'translate(-45%)',
    bottom: 60,
  },
  [theme.breakpoints.down('sm')]: {
    bottom: 100,
    fontSize: '0.8rem',
    transform: 'translateX(-50%)',
    width: 'calc(100% - 32px)',
  },
}))

function SwiperGame() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [currentIndex, setCurrentIndex] = useState(0)
  const [position, setPosition] = useState(0)
  const [isSwiping, setIsSwiping] = useState(false)
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT)
  const [gameOver, setGameOver] = useState(false)
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [isCorrect, setIsCorrect] = useState(null)
  const [isPostedData, setPostedData] = useState(false)
  const [showInstruction, setShowInstruction] = useState(true)
  const timerRef = useRef(null)
  const cardRef = useRef(null)
  const navigate = useNavigate()
  const { data: questions, isLoading, isError } = useGetGameSwiperQuery()
  const [postSwiperResult] = usePostSwiperResultMutation()
  const endTimeRef = useRef(Date.now() + TIME_LIMIT * 1000)

  const { hasMegaPower } = useGame()
  useEffect(() => {
    if (!hasMegaPower) {
      navigate('/game/', { replace: true })
    }
  }, [hasMegaPower, navigate])

  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now()
      const timeRemaining = Math.max(
        0,
        Math.floor((endTimeRef.current - now) / 1000)
      )

      setTimeLeft(timeRemaining)

      if (timeRemaining <= 0) {
        if (!isPostedData) {
          setGameOver(true)
          postSwiperResult({ score: correctAnswers })
          setPostedData(true)
        }
      } else {
        timerRef.current = requestAnimationFrame(updateTimer)
      }
    }

    timerRef.current = requestAnimationFrame(updateTimer)
    return () => cancelAnimationFrame(timerRef.current)
  }, [postSwiperResult, correctAnswers, isPostedData])

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowInstruction(false)
    }, 5000)
    return () => clearTimeout(timer)
  }, [])

  const nextQuestion = () => {
    if (!questions?.length) return
    setCurrentIndex((prev) => (prev + 1) % questions.length)
    setPosition(0)
    setIsSwiping(false)
    setIsCorrect(null)
  }

  const handleSwipe = (dir) => {
    if (!questions?.length) return
    const userAnswer = dir === 'right'
    const isAnswerCorrect = userAnswer === questions[currentIndex].answer

    setIsCorrect(isAnswerCorrect)
    setCorrectAnswers((prev) => Math.max(0, prev + (isAnswerCorrect ? 1 : -1)))

    setPosition(dir === 'right' ? window.innerWidth : -window.innerWidth)
    setTimeout(nextQuestion, 300)
  }

  const handlers = useSwipeable({
    onSwiping: (e) => {
      if (!isSwiping) setIsSwiping(true)
      setPosition(e.deltaX)
    },
    onSwipedLeft: () => handleSwipe('left'),
    onSwipedRight: () => handleSwipe('right'),
    onSwiped: () => {
      if (Math.abs(position) < 100) {
        setPosition(0)
        setIsSwiping(false)
      }
    },
    trackMouse: true,
    preventDefaultTouchmoveEvent: true,
    delta: 10,
    swipeDuration: 500,
  })

  const handleButtonAnswer = (answer) => {
    if (isSwiping) return
    handleSwipe(answer ? 'right' : 'left')
  }

  const currentCardStyle = {
    transform: `translateX(${position}px) rotate(${position / 20}deg)`,
    opacity: isSwiping ? 1 - Math.min(Math.abs(position) / 300, 0.5) : 1,
    zIndex: 2,
  }

  const nextCardStyle = {
    transform: 'scale(0.92)',
    opacity: 0.7,
    zIndex: 1,
  }

  const nextQuestionIndex = questions?.length
    ? (currentIndex + 1) % questions.length
    : 0

  if (isLoading) {
    return (
      <Box
        sx={{
          height: '70vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress size={60} />
      </Box>
    )
  }

  if (isError) return <div>Ошибка загрузки данных</div>
  if (!questions || !questions.length) {
    return (
      <Typography variant="h6" align="center" sx={{ mt: 4 }}>
        Нет вопросов для игры
      </Typography>
    )
  }

  return (
    <Box
      sx={{
        position: 'relative',
        height: '100vh',
        maxWidth: 'md',
        margin: '0 auto',
        px: 2,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        [theme.breakpoints.down('sm')]: {
          px: 1,
          height: '100dvh',
        },
      }}
    >
      <ButtonBack />

      {/* Основной контент */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          paddingBottom: isMobile ? '120px' : '80px',
        }}
      >
        {gameOver ? (
          <GameOverScreen isMobile={isMobile} correctAnswers={correctAnswers} />
        ) : (
          <div style={{ position: 'relative' }}>
            {/* Таймер и счет */}
            <Box sx={{ width: '100%', mb: 4, mt: 4, px: isMobile ? 0 : 2 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 1,
                }}
              >
                <Typography
                  variant="body1"
                  sx={{ fontWeight: 'bold', color: 'text.secondary' }}
                >
                  {`⏱ ${timeLeft} сек`}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ fontWeight: 'bold', color: 'text.secondary' }}
                >
                  {`✅ ${Math.max(0, correctAnswers)}`}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={(timeLeft / TIME_LIMIT) * 100}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: 'divider',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor:
                      timeLeft > 10 ? 'primary.main' : 'error.main',
                    transition: 'background-color 0.3s',
                  },
                }}
              />
            </Box>

            {/* Карточки */}
            <CardContainer>
              {/* Следующая карточка */}
              <QuestionCard style={nextCardStyle}>
                <Typography
                  variant={isMobile ? 'h6' : 'h5'}
                  sx={{ fontWeight: 'bold' }}
                >
                  {questions[nextQuestionIndex].question}
                </Typography>
              </QuestionCard>

              {/* Текущая карточка */}
              <QuestionCard
                ref={cardRef}
                style={currentCardStyle}
                {...handlers}
              >
                <AnswerIndicator
                  answer={position > 0 ? 'yes' : 'no'}
                  sx={{ opacity: Math.min(Math.abs(position) / 100, 0.8) }}
                >
                  {position > 0 ? '✓' : '✗'}
                </AnswerIndicator>
                <Typography
                  variant={isMobile ? 'h6' : 'h5'}
                  sx={{ fontWeight: 'bold', mb: 2 }}
                >
                  {questions[currentIndex].question}
                </Typography>
                {isMobile && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 2 }}
                  >
                    {position > 50
                      ? 'Отпустите для "Да"'
                      : position < -50
                        ? 'Отпустите для "Нет"'
                        : 'Потяните в сторону'}
                  </Typography>
                )}
              </QuestionCard>
            </CardContainer>

            {/* Инструкция */}
            <Fade in={showInstruction} timeout={500}>
              <InstructionText>
                <InfoIcon
                  sx={{
                    fontSize: '1rem',
                    verticalAlign: 'middle',
                    mr: 1,
                    color: theme.palette.primary.main,
                  }}
                />
                Правильные ответы +1, неправильные -1. Счет не может быть меньше
                нуля.
              </InstructionText>
            </Fade>

            {/* Кнопки для ответа */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                gap: 3,
                mt: 2,
                [theme.breakpoints.down('sm')]: {
                  position: 'fixed',
                  bottom: 20,
                  left: 0,
                  right: 0,
                  padding: '0 16px',
                  gap: 2,
                },
              }}
            >
              <ActionButton
                answer="no"
                variant="contained"
                onClick={() => handleButtonAnswer(false)}
                disabled={isSwiping}
              >
                Нет
              </ActionButton>
              <ActionButton
                answer="yes"
                variant="contained"
                onClick={() => handleButtonAnswer(true)}
                disabled={isSwiping}
              >
                Да
              </ActionButton>
            </Box>

            {isCorrect !== null && (
              <Typography
                variant="h4"
                align="center"
                mt={2}
                color={isCorrect ? 'success.main' : 'error.main'}
                sx={{
                  position: 'fixed',
                  bottom: isMobile ? 120 : 80,
                  left: 0,
                  right: 0,
                  padding: '0 16px',
                  animation: 'fadeInOut 1.5s',
                  '@keyframes fadeInOut': {
                    '0%': { opacity: 0, transform: 'scale(0.8)' },
                    '20%': { opacity: 1, transform: 'scale(1.1)' },
                    '80%': { opacity: 1, transform: 'scale(1.1)' },
                    '100%': { opacity: 0, transform: 'scale(0.8)' },
                  },
                }}
              >
                {isCorrect ? '✓ Правильно!' : '✗ Неправильно!'}
              </Typography>
            )}
          </div>
        )}
      </Box>
    </Box>
  )
}

export default SwiperGame

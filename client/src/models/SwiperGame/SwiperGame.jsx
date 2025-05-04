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
} from '@mui/material'
import {
  useGetGameSwiperQuery,
  usePostSwiperResultMutation,
} from '../../slices/gameApi'
import useGame from '../../hook/useGame'

const TIME_LIMIT = 30

const CardContainer = styled(Box)({
  position: 'relative',
  width: '100%',
  height: '300px',
  overflow: 'hidden',
})

const QuestionCard = styled(Paper)({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  padding: '24px',
  margin: '0 auto',
  maxWidth: '500px',
  minHeight: '200px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
  transition: 'transform 0.4s ease-out, opacity 0.3s ease-out',
  touchAction: 'pan-y', // Ограничиваем свайп только по вертикали для родителя
  userSelect: 'none',
  willChange: 'transform, opacity',
})

const AnswerIndicator = styled(Box)(({ answer }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor:
    answer === 'yes' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  fontSize: '3rem',
  fontWeight: 'bold',
  opacity: 0,
  transition: 'opacity 0.3s',
}))

function SwiperGame() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [position, setPosition] = useState(0)
  const [isSwiping, setIsSwiping] = useState(false)
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT)
  const [gameOver, setGameOver] = useState(false)
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [isCorrect, setIsCorrect] = useState(null)
  const [isMobile, setIsMobile] = useState(false)
  const [isPostedData, setPostedData] = useState(false)
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
    // Определяем мобильное устройство
    const checkIsMobile = () => setIsMobile(window.innerWidth < 768)
    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)
    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])

  useEffect(() => {
    // Функция обновления времени
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

    // Запускаем таймер
    timerRef.current = requestAnimationFrame(updateTimer)

    // Очистка
    return () => {
      cancelAnimationFrame(timerRef.current)
    }
  }, [postSwiperResult, correctAnswers, isPostedData])

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
    setCorrectAnswers(correctAnswers + (isAnswerCorrect ? 1 : -1))

    // Анимация улетания карточки
    setPosition(dir === 'right' ? window.innerWidth : -window.innerWidth)
    setTimeout(nextQuestion, 400)
  }

  const handlers = useSwipeable({
    onSwiping: (e) => {
      if (!isMobile) return
      if (!isSwiping) setIsSwiping(true)
      setPosition(e.deltaX)
    },
    onSwipedLeft: () => isMobile && handleSwipe('left'),
    onSwipedRight: () => isMobile && handleSwipe('right'),
    onSwiped: () => {
      if (Math.abs(position) < 100) {
        setPosition(0)
        setIsSwiping(false)
      }
    },
    trackMouse: false,
    preventDefaultTouchmoveEvent: true,
  })

  const handleButtonAnswer = (answer) => {
    if (isSwiping) return
    handleSwipe(answer ? 'right' : 'left')
  }

  // Стили для карточек
  const currentCardStyle = {
    transform: `translateX(${position}px)`,
    opacity: isSwiping ? 1 - Math.min(Math.abs(position) / 200, 0.7) : 1,
    zIndex: 2,
    cursor: isMobile ? 'grab' : 'default',
    '&:active': {
      cursor: isMobile ? 'grabbing' : 'default',
    },
  }

  const nextCardStyle = {
    transform: 'scale(0.95)',
    opacity: 0.8,
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
  if (!questions || !questions.length)
    return (
      <Typography
        variant="h6"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        Нет вопросов
      </Typography>
    )

  return (
    <Box
      sx={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '3rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        overflowX: 'hidden', // Запрещаем горизонтальный скролл страницы
      }}
    >
      {gameOver ? (
        <Box
          sx={{
            textAlign: 'center',
          }}
        >
          <Typography variant="h4" gutterBottom>
            Время вышло!
          </Typography>
          <Typography variant="h6" gutterBottom>
            {`Правильных ответов: ${Math.max(0, correctAnswers)}`}
          </Typography>
          <Button
            variant="contained"
            fullWidth={!!isMobile}
            size="large"
            onClick={() => navigate(-1)}
            sx={{ mt: 3 }}
          >
            Вернуться к играм
          </Button>
        </Box>
      ) : (
        <>
          <Box sx={{ width: '100%', mb: 2 }}>
            <Typography variant="body1" align="center" gutterBottom>
              {`Осталось: ${timeLeft} сек | Правильных ответов: ${Math.max(0, correctAnswers)}`}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={(timeLeft / TIME_LIMIT) * 100}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>

          <CardContainer>
            {/* Следующая карточка (всегда видна под текущей) */}
            <QuestionCard style={nextCardStyle}>
              <Typography variant="h5" sx={{ mb: 2 }}>
                {questions[nextQuestionIndex].question}
              </Typography>
            </QuestionCard>

            {/* Текущая карточка */}
            <QuestionCard ref={cardRef} style={currentCardStyle} {...handlers}>
              <AnswerIndicator
                answer={position > 0 ? 'yes' : 'no'}
                sx={{ opacity: Math.min(Math.abs(position) / 100, 0.7) }}
              >
                {position > 0 ? '✓' : '✗'}
              </AnswerIndicator>
              <Typography variant="h5" sx={{ mb: 2 }}>
                {questions[currentIndex].question}
              </Typography>
              {isMobile && (
                <Typography variant="body2" color="text.secondary">
                  {position > 50
                    ? 'Отпустите для "Да"'
                    : position < -50
                      ? 'Отпустите для "Нет"'
                      : 'Потяните в сторону'}
                </Typography>
              )}
            </QuestionCard>
          </CardContainer>

          {/* Кнопки для ответа */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mt: 4,
              gap: 2,
            }}
          >
            <Button
              variant="outlined"
              color="error"
              size="large"
              onClick={() => handleButtonAnswer(false)}
              sx={{ minWidth: 120 }}
              disabled={isSwiping}
            >
              Нет
            </Button>
            <Button
              variant="outlined"
              color="success"
              size="large"
              onClick={() => handleButtonAnswer(true)}
              sx={{ minWidth: 120 }}
              disabled={isSwiping}
            >
              Да
            </Button>
          </Box>

          {isCorrect !== null && (
            <Typography
              variant="h4"
              align="center"
              mt={2}
              color={isCorrect ? 'success.main' : 'error.main'}
            >
              {isCorrect ? '✓ Правильно!' : '✗ Неправильно!'}
            </Typography>
          )}
        </>
      )}
    </Box>
  )
}

export default SwiperGame

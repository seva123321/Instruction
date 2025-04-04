/* eslint-disable operator-linebreak */

import React, { useMemo, useCallback, useEffect, useState } from 'react'
import {
  Box,
  Button,
  useTheme,
  useMediaQuery,
  Typography,
  Divider,
  CircularProgress,
  Chip,
  Snackbar,
  Alert,
} from '@mui/material'
import { Link, useParams } from 'react-router-dom'
import { useSwipeable } from 'react-swipeable'
import OfflineBoltIcon from '@mui/icons-material/OfflineBolt'

// Импорт утилит и хуков
import { calculateMark } from '@/service/utilsFunction'
import useTestState from '@/hook/useTestState'
import useTestResults from '@/hook/useTestResults'
import { initDB, getTestFromDB } from '@/service/offlineDB'
// Импорт компонентов
import TabsWrapper from '@/components/TabsWrapper'

import { useGetTestByIdQuery } from '../../slices/testApi'
import TestControls from '../../components/TestControls/TestControls'
import QuestionView from '../../components/QuestionView/QuestionView'
import TestResultsView from '../../components/TestResultsView/TestResultsView'
import QuestionFeedback from '../../components/QuestionFeedback/QuestionFeedback'

// Вынесенные компоненты
function OfflineIndicator() {
  return (
    <Chip
      icon={<OfflineBoltIcon />}
      label="Оффлайн режим"
      color="warning"
      sx={{ position: 'fixed', top: 16, right: 16, zIndex: 1000 }}
    />
  )
}

function BackButton({ isMobile }) {
  return (
    <Box>
      <Link to="/tests">
        <Button
          variant="outlined"
          size={isMobile ? 'small' : 'medium'}
          sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}
        >
          Назад к тестам
        </Button>
      </Link>
    </Box>
  )
}

function TestHeader({
  testName,
  currentQuestionIndex,
  questionsLength,
  isMobile,
}) {
  return (
    <>
      <Typography
        variant={isMobile ? 'h6' : 'h5'}
        gutterBottom
        sx={{ fontSize: isMobile ? '1.25rem' : '1.5rem', pl: isMobile ? 3 : 0 }}
      >
        {testName}
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography
          variant="subtitle1"
          gutterBottom
          sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}
        >
          {`Вопрос ${currentQuestionIndex + 1} из ${questionsLength}`}
        </Typography>
        <BackButton isMobile={isMobile} />
      </Box>

      <Divider sx={{ my: isMobile ? 1 : 2 }} />
    </>
  )
}

function LoadingState() {
  // return <CircularProgress />
}

function ErrorState({ error, isOnline, onRetry, isLoading }) {
  return (
    <Box sx={{ p: 3, textAlign: 'center' }}>
      <Alert severity="error" sx={{ mb: 2 }}>
        {error?.message || 'Ошибка загрузки теста'}
      </Alert>
      {!isOnline && (
        <Button variant="contained" onClick={onRetry} disabled={isLoading}>
          Попробовать загрузить снова
        </Button>
      )}
    </Box>
  )
}

function NotFoundState({ isOnline }) {
  return (
    <Box sx={{ p: 3, textAlign: 'center' }}>
      <Typography variant="h6">
        {isOnline ? 'Тест не найден' : 'Тест не доступен в оффлайн-режиме'}
      </Typography>
      {!isOnline && (
        <Button
          variant="contained"
          sx={{ mt: 2 }}
          onClick={() => window.location.reload()}
        >
          Обновить страницу
        </Button>
      )}
    </Box>
  )
}

function TestOnePage() {
  // Основные параметры и состояние
  const { id } = useParams()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [syncError, setSyncError] = useState(null)
  const [isDBInitialized, setIsDBInitialized] = useState(false)
  const [offlineTest, setOfflineTest] = useState(null)
  const [isOfflineLoading, setIsOfflineLoading] = useState(false)
  const { saveTestResults, getTestResults, syncPendingResults } =
    useTestResults()

  // Для получения результатов теста
  useEffect(() => {
    const loadResults = async () => {
      try {
        const results = await getTestResults(id)
        // Обработка полученных результатов
      } catch (error) {
        console.error('Failed to load test results:', error)
      }
    }

    if (id) {
      loadResults()
    }
  }, [id, getTestResults])

  // Запрос данных теста
  const {
    data: onlineTest,
    isLoading: isOnlineLoading,
    isError: isOnlineError,
    error: onlineError,
    refetch,
  } = useGetTestByIdQuery(id, { skip: !id || !isOnline })

  // Инициализация базы данных и обработка статуса сети
  useEffect(() => {
    const initializeDB = async () => {
      try {
        await initDB()
        setIsDBInitialized(true)
      } catch (e) {
        console.error('DB initialization failed:', e)
        setSyncError('Ошибка инициализации локального хранилища')
      }
    }

    const handleStatusChange = () => {
      const newStatus = navigator.onLine
      setIsOnline(newStatus)
      if (newStatus) refetch()
    }

    initializeDB()
    window.addEventListener('online', handleStatusChange)
    window.addEventListener('offline', handleStatusChange)

    return () => {
      window.removeEventListener('online', handleStatusChange)
      window.removeEventListener('offline', handleStatusChange)
    }
  }, [refetch])

  useEffect(() => {
    const handleOnline = async () => {
      try {
        await syncPendingResults()
      } catch (e) {
        console.error('Sync failed:', e)
      }
    }

    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [syncPendingResults])

  // Загрузка оффлайн-версии теста
  useEffect(() => {
    if (!isOnline && isDBInitialized && id) {
      const loadOfflineTest = async () => {
        try {
          setIsOfflineLoading(true)
          const test = await getTestFromDB(id)
          if (!test) throw new Error('Тест не найден в оффлайн-хранилище')
          setOfflineTest(test)
        } catch (e) {
          console.error('Offline load error:', e)
          setSyncError(e.message)
        } finally {
          setIsOfflineLoading(false)
        }
      }
      loadOfflineTest()
    }
  }, [isOnline, isDBInitialized, id])

  // Состояние теста
  const [state, updateState] = useTestState({
    currentQuestionIndex: 0,
    answers: {},
    correctAnswers: {},
    showFeedback: false,
    score: 0,
    completed: false,
    finalResults: null,
    testStartTime: new Date(),
  })

  const {
    currentQuestionIndex,
    answers,
    correctAnswers,
    showFeedback,
    score,
    completed,
    finalResults,
    testStartTime,
  } = state

  // Определение текущего теста и его свойств
  const test = isOnline ? onlineTest : offlineTest
  const isLoading = isOnline ? isOnlineLoading : isOfflineLoading
  const isError = isOnline ? isOnlineError : false
  const error = isOnline ? onlineError : null
  const isControlTest = test?.test_is_control
  const currentQuestion = test?.questions?.[currentQuestionIndex]

  // Мемоизированные значения
  const totalPoints = useMemo(
    () => test?.questions?.reduce((sum, q) => sum + q.points, 0) || 0,
    [test?.questions]
  )

  const unansweredQuestions = useMemo(
    () => test?.questions?.filter((q) => answers[q.id] === undefined) || [],
    [answers, test?.questions]
  )

  const allQuestionsAnswered = unansweredQuestions.length === 0
  const isLastQuestion =
    currentQuestionIndex === (test?.questions?.length || 0) - 1
  const isAnswered = currentQuestion?.id
    ? correctAnswers[currentQuestion.id] !== undefined
    : false

  // Обработчики событий
  const handleDownloadTest = useCallback(async () => {
    try {
      await refetch()
    } catch (err) {
      setSyncError(`Ошибка загрузки: ${err.message}`)
    }
  }, [refetch])

  const navigateQuestion = useCallback(
    (direction) => {
      if (!test?.questions) return

      const newIndex = currentQuestionIndex + direction
      if (newIndex >= 0 && newIndex < test.questions.length) {
        updateState({
          currentQuestionIndex: newIndex,
          showFeedback: false,
        })
      }
    },
    [currentQuestionIndex, test?.questions, updateState]
  )

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => isMobile && navigateQuestion(1),
    onSwipedRight: () => isMobile && navigateQuestion(-1),
    trackMouse: true,
    preventDefaultTouchmoveEvent: true,
  })

  const handleAnswerChange = useCallback(
    (event) => {
      if (!currentQuestion?.id) return
      updateState({
        answers: {
          ...answers,
          [currentQuestion.id]: event.target.value,
        },
      })
    },
    [answers, currentQuestion?.id, updateState]
  )

  const handleSubmit = useCallback(() => {
    if (!currentQuestion?.id || !answers[currentQuestion.id]) return

    const selectedAnswerId = answers[currentQuestion.id]
    const isCorrect = currentQuestion.answers.some(
      (answer) => answer.id.toString() === selectedAnswerId && answer.is_correct
    )

    updateState({
      correctAnswers: {
        ...correctAnswers,
        [currentQuestion.id]: isCorrect,
      },
      score: isCorrect ? score + currentQuestion.points : score,
      showFeedback: true,
    })
  }, [answers, correctAnswers, currentQuestion, score, updateState])

  const handleTabChange = useCallback(
    (_, newIndex) => {
      updateState({
        currentQuestionIndex: newIndex,
        showFeedback: false,
      })
    },
    [updateState]
  )

  const handleNextQuestion = useCallback(() => {
    navigateQuestion(1)
  }, [navigateQuestion])

  const handleCompleteTest = useCallback(async () => {
    if (!test?.questions || !id || !test?.name) return

    // Проверка на неотвеченные вопросы
    if (!allQuestionsAnswered) {
      const firstUnansweredIndex = test.questions.findIndex(
        (q) => answers[q.id] === undefined
      )
      updateState({
        currentQuestionIndex: firstUnansweredIndex,
        showFeedback: false,
      })
      return
    }

    const mark = calculateMark(score, totalPoints).toFixed(1)
    const completionTime = new Date()
    const testDuration = Math.floor((completionTime - testStartTime) / 1000)

    // Полные данные для локального хранения и отображения
    const fullResults = {
      test: id,
      test_title: test.name,
      is_passed: true,
      total_score: score,
      mark,
      start_time: testStartTime.toISOString(),
      completion_time: completionTime.toISOString(),
      test_duration: testDuration,
      questions: test.questions.map((question) => ({
        id: question.id,
        name: question.name,
        points: question.points,
        answers: question.answers.map((answer) => ({
          id: answer.id,
          name: answer.name,
          is_correct: answer.is_correct,
        })),
        explanation: question.explanation,
      })),
      user_answers: test.questions.map((question) => ({
        id: question.id,
        selected_id: answers[question.id] || null,
        is_correct: correctAnswers[question.id] || false,
        points: correctAnswers[question.id] ? question.points : 0,
      })),
    }

    // Упрощенные данные для сервера
    const serverResults = {
      test: id,
      is_passed: true,
      total_score: score,
      mark,
      start_time: testStartTime.toISOString(),
      completion_time: completionTime.toISOString(),
      test_duration: testDuration,
      user_answers: test.questions.map((question) => ({
        id: question.id,
        selected_id: answers[question.id] || null,
        is_correct: correctAnswers[question.id] || false,
      })),
    }

    try {
      const savedResults = await saveTestResults(id, fullResults, serverResults)

      updateState({
        completed: true,
        finalResults: {
          ...savedResults,
          test_title: test.name,
          totalPoints,
        },
      })
    } catch (e) {
      console.error('Failed to save test results:', error)
      updateState({
        completed: true,
        finalResults: {
          ...fullResults,
          totalPoints,
        },
      })
      setSyncError(
        isOnline
          ? 'Ошибка отправки результатов'
          : 'Результаты сохранены для оффлайн-синхронизации'
      )
    }
  }, [
    isOnline,
    test,
    id,
    answers,
    correctAnswers,
    score,
    totalPoints,
    testStartTime,
    allQuestionsAnswered,
    updateState,
  ])

  const handleRestartTest = useCallback(() => {
    updateState({
      currentQuestionIndex: 0,
      answers: {},
      correctAnswers: {},
      showFeedback: false,
      score: 0,
      completed: false,
      finalResults: null,
      testStartTime: new Date(),
    })
    refetch()
  }, [refetch, updateState])

  // Подготовка вкладок с вопросами
  const questionTabs = useMemo(
    () =>
      test?.questions?.map((question, index) => ({
        label: `${index + 1}`,
        content: (
          <Box
            sx={{
              p: isMobile ? 1 : 2,
              '& *': {
                maxWidth: '100%',
                wordBreak: 'break-word',
              },
            }}
          >
            <QuestionView
              question={question}
              selectedAnswer={answers[question.id] || null}
              showFeedback={index === currentQuestionIndex && showFeedback}
              disabled={correctAnswers[question.id] !== undefined}
              onChange={handleAnswerChange}
              isMobile={isMobile}
              isControlTest={isControlTest}
            />
          </Box>
        ),
      })) || [],
    [
      answers,
      correctAnswers,
      currentQuestionIndex,
      handleAnswerChange,
      showFeedback,
      isMobile,
      isControlTest,
      test?.questions,
    ]
  )

  // Рендер состояний
  if (!isDBInitialized || isLoading) return <LoadingState />
  if (isError) {
    return (
      <ErrorState
        error={error}
        isOnline={isOnline}
        onRetry={handleDownloadTest}
        isLoading={isLoading}
      />
    )
  }
  if (!test) return <NotFoundState isOnline={isOnline} />
  if (completed && finalResults) {
    // Добавляем проверку на наличие необходимых данных
    if (!finalResults.questions || !finalResults.user_answers) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          {/* <CircularProgress /> */}
        </Box>
      )
    }

    return (
      <TestResultsView
        testId={finalResults.test}
        testTitle={finalResults.test_title || test?.name}
        score={finalResults.total_score}
        totalPoints={totalPoints}
        mark={finalResults.mark}
        answers={finalResults.user_answers}
        questions={finalResults.questions}
        startTime={finalResults.start_time}
        completionTime={finalResults.completion_time}
        duration={finalResults.test_duration}
        onRestart={handleRestartTest}
        isControlTest={isControlTest}
      />
    )
  }

  // Основной рендер
  return (
    <Box
      sx={{
        maxWidth: 800,
        width: '80vw',
        margin: '0 auto',
        touchAction: isMobile ? 'pan-y' : 'auto',
      }}
      {...(isMobile ? swipeHandlers : {})}
    >
      {!isOnline && <OfflineIndicator />}
      <TestHeader
        testName={test.name}
        currentQuestionIndex={currentQuestionIndex}
        questionsLength={test.questions.length}
        isMobile={isMobile}
      />

      <TabsWrapper
        tabs={questionTabs}
        value={currentQuestionIndex}
        onChange={handleTabChange}
        checkedTabs={test.questions
          .map((q, index) => (correctAnswers[q.id] !== undefined ? index : -1))
          .filter((index) => index !== -1)}
        correctAnswers={test.questions.map(
          (q) => correctAnswers[q.id] || false
        )}
        isControlTest={isControlTest}
      />

      {!isControlTest && currentQuestion && (
        <QuestionFeedback
          showFeedback={showFeedback}
          isCorrect={correctAnswers[currentQuestion.id] || false}
          explanation={currentQuestion.explanation}
          referenceLink={currentQuestion.reference_link}
          onClose={() => updateState({ showFeedback: false })}
        />
      )}

      <TestControls
        onSubmit={handleSubmit}
        onComplete={handleCompleteTest}
        onNextQuestion={handleNextQuestion}
        hasAnswer={
          currentQuestion?.id
            ? answers[currentQuestion.id] !== undefined
            : false
        }
        showFeedback={showFeedback}
        isAnswered={isAnswered}
        isLastQuestion={isLastQuestion}
        allQuestionsAnswered={allQuestionsAnswered}
        isMobile={isMobile}
        isControlTest={isControlTest}
      />

      <Snackbar
        open={!!syncError}
        autoHideDuration={6000}
        onClose={() => setSyncError(null)}
      >
        <Alert severity={isOnline ? 'error' : 'warning'}>{syncError}</Alert>
      </Snackbar>
    </Box>
  )
}

export default React.memo(TestOnePage)

/** ***************************************************************** */
/** ***************************************************************** */

// import React, { useMemo, useCallback } from 'react'
// import {
//   Box,
//   Button,
//   useTheme,
//   useMediaQuery,
//   Typography,
//   Divider,
//   CircularProgress,
// } from '@mui/material'
// import { Link, useParams } from 'react-router-dom'
// import { useSwipeable } from 'react-swipeable'

// import { calculateMark } from '@/service/utilsFunction'
// import useTestState from '@/hook/useTestState'
// import useTestResults from '@/hook/useTestResults'
// import TabsWrapper from '@/components/TabsWrapper'

// import TestControls from '../../components/TestControls/TestControls'
// import QuestionView from '../../components/QuestionView/QuestionView'
// import TestResultsView from '../../components/TestResultsView/TestResultsView'
// import QuestionFeedback from '../../components/QuestionFeedback/QuestionFeedback'
// import { useGetTestByIdQuery } from '../../slices/testApi'

// function TestOnePage() {
//   const { id } = useParams()
//   const theme = useTheme()
//   const isMobile = useMediaQuery(theme.breakpoints.down('md'))

//   const {
//     data: testData,
//     isLoading,
//     isError,
//     error,
//     refetch,
//   } = useGetTestByIdQuery(id, {
//     skip: !id,
//   })
//   const test = useMemo(() => testData, [testData])

//   const isControlTest = test?.test_is_control

//   const [state, updateState] = useTestState({
//     currentQuestionIndex: 0,
//     answers: {},
//     correctAnswers: {},
//     showFeedback: false,
//     score: 0,
//     completed: false,
//     finalResults: null,
//     testStartTime: new Date(),
//   })

//   const {
//     currentQuestionIndex,
//     answers,
//     correctAnswers,
//     showFeedback,
//     score,
//     completed,
//     finalResults,
//     testStartTime,
//   } = state

//   // Добавляем проверки перед использованием test
//   const currentQuestion = test?.questions?.[currentQuestionIndex]
//   const totalPoints = useMemo(
//     () => test?.questions?.reduce((sum, q) => sum + q.points, 0) || 0,
//     [test?.questions]
//   )

//   const navigateQuestion = useCallback(
//     (direction) => {
//       if (!test?.questions) return

//       const newIndex = currentQuestionIndex + direction
//       if (newIndex >= 0 && newIndex < test.questions.length) {
//         updateState({
//           currentQuestionIndex: newIndex,
//           showFeedback: false,
//         })
//       }
//     },
//     [currentQuestionIndex, updateState, test?.questions]
//   )

//   const swipeHandlers = useSwipeable({
//     onSwipedLeft: () => isMobile && navigateQuestion(1),
//     onSwipedRight: () => isMobile && navigateQuestion(-1),
//     trackMouse: true,
//     preventDefaultTouchmoveEvent: true,
//   })

//   const saveTestResults = useTestResults()

//   const unansweredQuestions = useMemo(
//     () => test?.questions?.filter((q) => answers[q.id] === undefined) || [],
//     [answers, test?.questions]
//   )

//   const allQuestionsAnswered = unansweredQuestions.length === 0
//   const isLastQuestion =
//     currentQuestionIndex === (test?.questions?.length || 0) - 1
//   const isAnswered = currentQuestion?.id
//     ? correctAnswers[currentQuestion.id] !== undefined
//     : false

//   const handleAnswerChange = useCallback(
//     (event) => {
//       if (!currentQuestion?.id) return

//       updateState({
//         answers: {
//           ...answers,
//           [currentQuestion.id]: event.target.value,
//         },
//       })
//     },
//     [answers, currentQuestion?.id, updateState]
//   )

//   const handleSubmit = useCallback(() => {
//     if (!currentQuestion?.id || !answers[currentQuestion.id]) return

//     const selectedAnswerId = answers[currentQuestion.id]
//     const isCorrect = currentQuestion.answers.some(
//       (answer) => answer.id.toString() === selectedAnswerId && answer.is_correct
//     )

//     updateState({
//       correctAnswers: {
//         ...correctAnswers,
//         [currentQuestion.id]: isCorrect,
//       },
//       score: isCorrect ? score + currentQuestion.points : score,
//       showFeedback: true,
//     })
//   }, [answers, correctAnswers, currentQuestion, score, updateState])

//   const handleTabChange = useCallback(
//     (_, newIndex) => {
//       updateState({
//         currentQuestionIndex: newIndex,
//         showFeedback: false,
//       })
//     },
//     [updateState]
//   )

//   const handleNextQuestion = useCallback(() => {
//     navigateQuestion(1)
//   }, [navigateQuestion])

// const handleCompleteTest = useCallback(async () => {
//   if (!test?.questions || !id || !test?.name) return

//   if (!allQuestionsAnswered) {
//     const firstUnansweredIndex = test.questions.findIndex(
//       (q) => answers[q.id] === undefined
//     )
//     updateState({
//       currentQuestionIndex: firstUnansweredIndex,
//       showFeedback: false,
//     })
//     return
//   }

//   const mark = calculateMark(score, totalPoints).toFixed(1)
//   const testResults = {
//     test_id: id,
//     test_title: test.name,
//     is_passed: true,
//     total_score: score,
//     mark,
//     questions: test.questions.map((question) => ({
//       id: question.id,
//       name: question.name,
//       selected_id: answers[question.id] || null,
//       is_correct: correctAnswers[question.id] || false,
//       points: correctAnswers[question.id] ? question.points : 0,
//       answers: question.answers.map((answer) => ({
//         id: answer.id,
//         name: answer.name,
//         is_correct: answer.is_correct,
//       })),
//     })),
//   }

//   const results = await saveTestResults(id, testResults, testStartTime)
//   if (results) {
//     updateState({
//       completed: true,
//       finalResults: results,
//     })
//   }
// }, [
//   allQuestionsAnswered,
//   answers,
//   correctAnswers,
//   id,
//   score,
//   saveTestResults,
//   test?.questions,
//   test?.name,
//   testStartTime,
//   totalPoints,
//   updateState,
// ])

//   const handleRestartTest = () => {
//     updateState({
//       currentQuestionIndex: 0,
//       answers: {},
//       correctAnswers: {},
//       showFeedback: false,
//       score: 0,
//       completed: false,
//       finalResults: null,
//       testStartTime: new Date(),
//     })
//     refetch() // Если данные могут измениться на сервере
//   }

//   const questionTabs = useMemo(
//     () =>
//       test?.questions?.map((question, index) => ({
//         label: `${index + 1}`,
//         content: (
//           <Box
//             sx={{
//               p: isMobile ? 1 : 2,
//               '& *': {
//                 maxWidth: '100%',
//                 wordBreak: 'break-word',
//               },
//             }}
//           >
//             <QuestionView
//               question={question}
//               selectedAnswer={answers[question.id] || null}
//               showFeedback={index === currentQuestionIndex && showFeedback}
//               disabled={correctAnswers[question.id] !== undefined}
//               onChange={handleAnswerChange}
//               isMobile={isMobile}
//               isControlTest={isControlTest}
//             />
//           </Box>
//         ),
//       })) || [],
//     [
//       answers,
//       correctAnswers,
//       currentQuestionIndex,
//       handleAnswerChange,
//       showFeedback,
//       isMobile,
//       isControlTest,
//       test?.questions,
//     ]
//   )

//   if (isLoading) return <CircularProgress size={50} />
//   if (isError) {
//     return <div>{`Ошибка при загрузке теста: ${error?.message}`}</div>
//   }
//   if (!test) return <div>Тест не найден</div>

//   if (completed && finalResults) {
//     return (
//       <TestResultsView
//         testId={id}
//         testTitle={test.name}
//         score={score}
//         totalPoints={totalPoints}
//         mark={finalResults.mark}
//         answers={finalResults.questions}
//         questions={test.questions}
//         startTime={finalResults.start_time}
//         completionTime={finalResults.completion_time}
//         duration={finalResults.test_duration}
//         refetch={handleRestartTest}
//         isControlTest={isControlTest}
//       />
//     )
//   }

//   return (
//     <Box
//       sx={{
//         maxWidth: 800,
//         width: '80vw',
//         margin: '0 auto',
//         py: 2,
//         touchAction: isMobile ? 'pan-y' : 'auto',
//       }}
//       {...(isMobile ? swipeHandlers : {})}
//     >
//       <Box sx={{ mb: 2 }}>
//         <Link to="/tests">
//           <Button
//             variant="outlined"
//             size={isMobile ? 'small' : 'medium'}
//             sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}
//           >
//             Назад к тестам
//           </Button>
//         </Link>
//       </Box>

//       <Typography
//         variant={isMobile ? 'h6' : 'h5'}
//         gutterBottom
//         sx={{ fontSize: isMobile ? '1.25rem' : '1.5rem' }}
//       >
//         {test.name}
//       </Typography>

//       <Typography
//         variant="subtitle1"
//         gutterBottom
//         sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}
//       >
//         {`Вопрос ${currentQuestionIndex + 1} из ${test.questions.length}`}
//       </Typography>

//       <Divider sx={{ my: isMobile ? 1 : 2 }} />

//       <TabsWrapper
//         tabs={questionTabs}
//         value={currentQuestionIndex}
//         onChange={handleTabChange}
//         checkedTabs={test.questions
//           .map((q, index) => (correctAnswers[q.id] !== undefined ? index : -1))
//           .filter((index) => index !== -1)}
//         correctAnswers={test.questions.map(
//           (q) => correctAnswers[q.id] || false
//         )}
//         isControlTest={isControlTest}
//       />

//       {!isControlTest && currentQuestion && (
//         <QuestionFeedback
//           showFeedback={showFeedback}
//           isCorrect={correctAnswers[currentQuestion.id] || false}
//           explanation={currentQuestion.explanation}
//           referenceLink={currentQuestion.reference_link}
//           onClose={() => updateState({ showFeedback: false })}
//         />
//       )}

//       <TestControls
//         onSubmit={handleSubmit}
//         onComplete={handleCompleteTest}
//         onNextQuestion={handleNextQuestion}
//         hasAnswer={
//           currentQuestion?.id
//             ? answers[currentQuestion.id] !== undefined
//             : false
//         }
//         showFeedback={showFeedback}
//         isAnswered={isAnswered}
//         isLastQuestion={isLastQuestion}
//         allQuestionsAnswered={allQuestionsAnswered}
//         isMobile={isMobile}
//         isControlTest={isControlTest}
//       />
//     </Box>
//   )
// }

// export default React.memo(TestOnePage)

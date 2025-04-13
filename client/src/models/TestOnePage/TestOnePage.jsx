/* eslint-disable operator-linebreak */
import {
  memo,
  useMemo,
  useCallback,
  useEffect,
  useState,
  lazy,
  Suspense,
} from 'react'
import {
  Box,
  Button,
  useTheme,
  useMediaQuery,
  Typography,
  Divider,
  Chip,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material'
import { Link, useLocation, useParams } from 'react-router-dom'
import { useSwipeable } from 'react-swipeable'
import OfflineBoltIcon from '@mui/icons-material/OfflineBolt'

import { calculateMark } from '@/service/utilsFunction'
import useTestState from '@/hook/useTestState'
import useTestResults from '@/hook/useTestResults'
import TabsWrapper from '@/components/TabsWrapper'
import { initDB, getTestFromDB, STORE_NAMES } from '@/service/offlineDB'
import { useGetTestByIdQuery } from '@/slices/testApi'
import TestControls from '@/components/TestControls'
import LoadingIndicator from '@/components/LoadingIndicator'
import QuestionView from '@/components/QuestionView'

import TestResultsView from '@/components/TestResultsView'
import QuestionFeedback from '@/components/QuestionFeedback'
// const TestResultsView = lazy(() => import('@/components/TestResultsView'))
// const QuestionFeedback = lazy(() => import('@/components/QuestionFeedback'))

// Reusable components
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
  return null
}

// function ErrorState({ error, isOnline, onRetry, isLoading }) {
//   return (
//     <Box sx={{ p: 3, textAlign: 'center' }}>
//       <Alert severity="error" sx={{ mb: 2 }}>
//         {error?.message || 'Ошибка загрузки теста'}
//       </Alert>
//       {!isOnline && (
//         <Button variant="contained" onClick={onRetry} disabled={isLoading}>
//           Попробовать загрузить снова
//         </Button>
//       )}
//     </Box>
//   )
// }

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

// // Custom hooks

const useOfflineTest = (
  id,
  isOnline,
  isDBInitialized,
  initialTestData = null
) => {
  const [offlineTest, setOfflineTest] = useState(initialTestData)
  const [isOfflineLoading, setIsOfflineLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!isOnline && isDBInitialized && id) {
      const loadOfflineTest = async () => {
        try {
          setIsOfflineLoading(true)

          // Сначала проверяем переданные данные
          let test = offlineTest || initialTestData

          // Если данных нет, пробуем загрузить из IndexedDB
          if (!test) {
            test = await getTestFromDB(id, STORE_NAMES.TESTS_CONTENT)
          }

          // // Проверяем структуру теста
          // if (!test?.questions || !test?.name) {
          //   console.warn('Invalid test structure in IndexedDB:', test)
          //   throw new Error('INVALID_TEST_DATA')
          // }

          setOfflineTest(test)
          setError(null)
        } catch (e) {
          console.error('Offline load error:', e)
          setError(
            e.message === 'TEST_NOT_FOUND'
              ? 'Тест не найден в оффлайн-хранилище'
              : 'Неверный формат теста в оффлайн-хранилище'
          )
        } finally {
          setIsOfflineLoading(false)
        }
      }

      loadOfflineTest()
    }
  }, [id, isOnline, isDBInitialized, initialTestData, offlineTest])

  return { offlineTest, isOfflineLoading, error }
}

const useTestData = (id, initialTestData) => {
  const [isDBInitialized, setIsDBInitialized] = useState(false)
  const [syncError, setSyncError] = useState(null)
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  const {
    data: onlineTest,
    isLoading: isOnlineLoading,
    isError: isOnlineError,
    error: onlineError,
    refetch,
  } = useGetTestByIdQuery(id, { skip: !id || !isOnline })

  // Вынесли логику отслеживания сети прямо в хук
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      refetch()
    }
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [refetch])

  const {
    offlineTest,
    isOfflineLoading,
    error: offlineError,
  } = useOfflineTest(id, isOnline, isDBInitialized, initialTestData)

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
    initializeDB()
  }, [])

  return {
    test: isOnline ? onlineTest : offlineTest,
    isLoading: isOnline ? isOnlineLoading : isOfflineLoading,
    isError: isOnline ? isOnlineError : !!offlineError,
    error: isOnline ? onlineError : offlineError,
    syncError,
    setSyncError,
    refetch,
    isOnline,
    isDBInitialized,
  }
}

// Main component
function TestOnePage() {
  const { id } = useParams()
  const location = useLocation()
  const testOfflineData = location.state
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const { saveTestResults, getTestResults, syncPendingResults } =
    useTestResults()
  // const { state: testOfflineData } = useLocation()

  const {
    test,
    isLoading,
    isError,
    error,
    syncError,
    setSyncError,
    refetch,
    isOnline,
    isDBInitialized,
  } = useTestData(id, testOfflineData)

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

  // Memoized values
  const testProps = useMemo(
    () => ({
      isControlTest: test?.test_is_control || false,
      currentQuestion: test?.questions?.[currentQuestionIndex],
      totalPoints: test?.total_points || 0,
      passingScore: test?.passing_score || 75,
      questionsLength: test?.questions?.length || 0,
      testName: test?.name || '',
    }),
    [test, currentQuestionIndex]
  )

  const [allQuestionsAnswered] = useMemo(() => {
    if (!test?.questions) return [false]

    // Проверяем, что для всех вопросов есть ответы в объекте answers
    const allAnswered = test.questions.every((q) => answers[q.id] !== undefined)
    return [allAnswered]
  }, [answers, test?.questions])

  const isLastQuestion = currentQuestionIndex === testProps.questionsLength - 1
  const isAnswered = testProps.currentQuestion?.id
    ? correctAnswers[testProps.currentQuestion.id] !== undefined
    : false

  // Event handlers

  const navigateQuestion = useCallback(
    (direction) => {
      const newIndex = currentQuestionIndex + direction
      if (newIndex >= 0 && newIndex < testProps.questionsLength) {
        updateState({
          currentQuestionIndex: newIndex,
          showFeedback: false,
        })
      }
    },
    [currentQuestionIndex, testProps.questionsLength, updateState]
  )

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => isMobile && navigateQuestion(1),
    onSwipedRight: () => isMobile && navigateQuestion(-1),
    trackMouse: true,
    preventDefaultTouchmoveEvent: true,
  })

  const handleNextQuestion = useCallback(() => {
    navigateQuestion(1)
  }, [navigateQuestion])

  const handleAnswerChange = useCallback(
    (event) => {
      if (!testProps.currentQuestion?.id) return
      updateState({
        answers: {
          ...answers,
          [testProps.currentQuestion.id]: event.target.value,
        },
      })
    },
    [answers, testProps.currentQuestion?.id, updateState]
  )

  const handleSubmit = useCallback(() => {
    if (
      !testProps.currentQuestion?.id ||
      !answers[testProps.currentQuestion.id]
    ) {
      return
    }

    const isCorrect = testProps.currentQuestion.answers.some(
      (answer) =>
        answer.id.toString() === answers[testProps.currentQuestion.id] &&
        answer.is_correct
    )
    console.log('poinst > ', testProps.currentQuestion.points)
    console.log('score > ', score)

    updateState({
      correctAnswers: {
        ...correctAnswers,
        [testProps.currentQuestion.id]: isCorrect,
      },

      score: isCorrect ? score + testProps.currentQuestion.points : score,
      showFeedback: true,
    })

    // points
  }, [answers, correctAnswers, score, testProps.currentQuestion, updateState])

  const handleTabChange = useCallback(
    (_, newIndex) => {
      updateState({
        currentQuestionIndex: newIndex,
        showFeedback: false,
      })
    },
    [updateState]
  )

  const prepareTestResults = useCallback(() => {
    const mark = calculateMark(score, testProps.totalPoints).toFixed(1)
    const completionTime = new Date()
    const testDuration = Math.floor((completionTime - testStartTime) / 1000)
    const isPassed =
      score >= (testProps.totalPoints * testProps.passingScore) / 100

    return {
      fullResults: {
        test: id,
        test_title: test?.name,
        is_passed: isPassed,
        total_points: testProps.totalPoints,
        mark,
        score,
        start_time: testStartTime.toISOString(),
        completion_time: completionTime.toISOString(),
        test_duration: testDuration,
        questions:
          test?.questions?.map((question) => ({
            id: question.id,
            name: question.name,
            points: question.points,
            answers: question.answers.map((answer) => ({
              id: answer.id,
              name: answer.name,
              is_correct: answer.is_correct,
            })),
            explanation: question.explanation,
          })) || [],
        user_answers:
          test?.questions?.map((question) => ({
            id: question.id,
            selected_id: answers[question.id] || null,
            is_correct: correctAnswers[question.id] || false,
            points: correctAnswers[question.id] ? question.points : 0,
          })) || [],
      },
      serverResults: {
        test: id,
        is_passed: isPassed,
        mark,
        score,
        total_points: testProps.totalPoints,
        start_time: testStartTime.toISOString(),
        completion_time: completionTime.toISOString(),
        test_duration: testDuration,
        user_answers:
          test?.questions?.map((question) => ({
            id: question.id,
            selected_id: answers[question.id] || null,
            is_correct: correctAnswers[question.id] || false,
          })) || [],
      },
    }
  }, [
    answers,
    correctAnswers,
    id,
    score,
    test,
    testProps.passingScore,
    testProps.totalPoints,
    testStartTime,
  ])

  // useEffect(() => {
  //   const loadTestData = async () => {
  //     try {
  //       setIsLoading(true)
  //       setError(null)

  //       if (isOnline) {
  //         // Загрузка из API
  //         const { data } = await getTestById(id)
  //         if (!data) throw new Error('Тест не найден')
  //         setTestData(data)
  //       } else {
  //         // Загрузка из IndexedDB
  //         const offlineTest = await getOfflineTest(id)
  //         setTestData(offlineTest)

  //         // Если тест есть, но это базовая версия
  //         if (!offlineTest.content) {
  //           setWarning(
  //             'Доступна только базовая версия теста. Для полной версии подключитесь к интернету.'
  //           )
  //         }
  //       }
  //     } catch (e) {
  //       if (e.message === 'TEST_NOT_FOUND') {
  //         setError(
  //           <span>
  //             Тест не доступен оффлайн.
  //             <Button
  //               color="primary"
  //               onClick={() => setShowDownloadDialog(true)}
  //               sx={{ ml: 1 }}
  //             >
  //               Скачать
  //             </Button>{' '}
  //             при следующем подключении
  //           </span>
  //         )
  //       } else {
  //         setError(e.message)
  //       }
  //     } finally {
  //       setIsLoading(false)
  //     }
  //   }

  //   loadTestData()
  // }, [id, isOnline, getTestById])

  // Диалог для напоминания скачать тест
  // const [showDownloadDialog, setShowDownloadDialog] = useState(false)

  const handleCompleteTest = useCallback(async () => {
    if (!test?.questions || !id || !test?.name) return

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

    const { fullResults, serverResults } = prepareTestResults()

    try {
      const savedResults = await saveTestResults(id, fullResults, serverResults)
      updateState({
        completed: true,
        finalResults: {
          ...savedResults,
          test_title: test.name,
          totalPoints: testProps.totalPoints,
        },
      })
    } catch (err) {
      console.error('Save results error:', err)
      updateState({
        completed: true,
        finalResults: {
          ...fullResults,
          totalPoints: testProps.totalPoints,
        },
      })
      setSyncError(
        isOnline
          ? 'Ошибка отправки результатов'
          : 'Результаты сохранены локально для последующей синхронизации'
      )
    }
  }, [
    allQuestionsAnswered,
    answers,
    id,
    isOnline,
    prepareTestResults,
    saveTestResults,
    setSyncError,
    test,
    testProps.totalPoints,
    updateState,
  ])

  useEffect(() => {
    const checkResults = async () => {
      if (completed && !finalResults) {
        try {
          const results = await getTestResults(id)
          if (results.length > 0) {
            updateState({
              finalResults: results[0],
              completed: true,
            })
          }
        } catch (e) {
          console.error('Failed to recover results:', e)
        }
      }
    }
    checkResults()
  }, [completed, finalResults, id, getTestResults, updateState])

  // Sync when online
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

  const questionTabs = useMemo(
    () =>
      test?.questions?.map((question, index) => ({
        label: `${index + 1}`,
        content: (
          <Box
            sx={{
              p: isMobile ? 1 : 2,
              '& *': { maxWidth: '100%', wordBreak: 'break-word' },
            }}
          >
            <QuestionView
              question={question}
              selectedAnswer={answers[question.id] || null}
              showFeedback={index === currentQuestionIndex && showFeedback}
              disabled={correctAnswers[question.id] !== undefined}
              onChange={handleAnswerChange}
              isMobile={isMobile}
              isControlTest={testProps.isControlTest}
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
      test?.questions,
      testProps.isControlTest,
    ]
  )

  // Render states
  if (!isDBInitialized || isLoading) return <LoadingState />
  // if (isError)
  //   return (
  //     <ErrorState
  //       error={error}
  //       isOnline={isOnline}
  //       onRetry={handleDownloadTest}
  //       isLoading={isLoading}
  //     />
  //   )

  if (isError) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error?.message || 'Ошибка загрузки теста'}
        </Alert>
        {isOnline ? (
          <Button variant="contained" onClick={refetch}>
            Повторить попытку
          </Button>
        ) : (
          <Typography variant="body1">
            Подключитесь к интернету для загрузки теста
          </Typography>
        )}
      </Box>
    )
  }

  if (!test) return <NotFoundState isOnline={isOnline} />

  if (completed && finalResults) {
    if (!finalResults.questions || !finalResults.user_answers) {
      return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }} />
    }
    console.log('finalResults > ', finalResults);
    
    return (
      // <Suspense fallback={<LoadingIndicator />}>
      <TestResultsView
        testId={finalResults.test}
        testTitle={finalResults.test_title || testProps.testName}
        score={finalResults.score}
        totalPoints={testProps.totalPoints}
        mark={finalResults.mark}
        answers={finalResults.user_answers}
        questions={finalResults.questions}
        startTime={finalResults.start_time}
        completionTime={finalResults.completion_time}
        duration={finalResults.test_duration}
        onRestart={handleRestartTest}
        isControlTest={testProps.isControlTest}
      />
      // </Suspense>
    )
  }

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
        testName={testProps.testName}
        currentQuestionIndex={currentQuestionIndex}
        questionsLength={testProps.questionsLength}
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
        isControlTest={testProps.isControlTest}
      />

      {!testProps.isControlTest && testProps.currentQuestion && (
        // <Suspense fallback={<CircularProgress />}>
        <QuestionFeedback
          showFeedback={showFeedback}
          isCorrect={correctAnswers[testProps.currentQuestion.id] || false}
          explanation={testProps.currentQuestion.explanation}
          referenceLink={testProps.currentQuestion.reference_link}
          onClose={() => updateState({ showFeedback: false })}
        />
        // </Suspense>
      )}

      <TestControls
        onSubmit={handleSubmit}
        onComplete={handleCompleteTest}
        onNextQuestion={handleNextQuestion}
        hasAnswer={
          !!(
            testProps.currentQuestion?.id &&
            answers[testProps.currentQuestion.id]
          )
        }
        showFeedback={showFeedback}
        isAnswered={isAnswered}
        isLastQuestion={isLastQuestion}
        allQuestionsAnswered={allQuestionsAnswered}
        isMobile={isMobile}
        isControlTest={testProps.isControlTest}
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

export default memo(TestOnePage)

/** ***************************************************** */

// import { memo, useMemo, useCallback, useEffect, useState } from 'react'
// import {
//   Box,
//   Button,
//   useTheme,
//   useMediaQuery,
//   Typography,
//   Divider,
//   Chip,
//   Snackbar,
//   Alert,
// } from '@mui/material'
// import { Link, useLocation, useParams } from 'react-router-dom'
// import { useSwipeable } from 'react-swipeable'
// import OfflineBoltIcon from '@mui/icons-material/OfflineBolt'

// import { calculateMark } from '@/service/utilsFunction'
// import useTestState from '@/hook/useTestState'
// import useTestResults from '@/hook/useTestResults'
// import TabsWrapper from '@/components/TabsWrapper'

// import { initDB, getTestFromDB, STORE_NAMES } from '../../service/offlineDB'
// import { useGetTestByIdQuery } from '../../slices/testApi'
// import TestControls from '../../components/TestControls/TestControls'
// import QuestionView from '../../components/QuestionView/QuestionView'
// import TestResultsView from '../../components/TestResultsView'
// import QuestionFeedback from '../../components/QuestionFeedback'

// // Reusable components
// function OfflineIndicator() {
//   return (
//     <Chip
//       icon={<OfflineBoltIcon />}
//       label="Оффлайн режим"
//       color="warning"
//       sx={{ position: 'fixed', top: 16, right: 16, zIndex: 1000 }}
//     />
//   )
// }

// function BackButton({ isMobile }) {
//   return (
//     <Box>
//       <Link to="/tests">
//         <Button
//           variant="outlined"
//           size={isMobile ? 'small' : 'medium'}
//           sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}
//         >
//           Назад к тестам
//         </Button>
//       </Link>
//     </Box>
//   )
// }

// function TestHeader({
//   testName,
//   currentQuestionIndex,
//   questionsLength,
//   isMobile,
// }) {
//   return (
//     <>
//       <Typography
//         variant={isMobile ? 'h6' : 'h5'}
//         gutterBottom
//         sx={{ fontSize: isMobile ? '1.25rem' : '1.5rem', pl: isMobile ? 3 : 0 }}
//       >
//         {testName}
//       </Typography>
//       <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
//         <Typography
//           variant="subtitle1"
//           gutterBottom
//           sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}
//         >
//           {`Вопрос ${currentQuestionIndex + 1} из ${questionsLength}`}
//         </Typography>
//         <BackButton isMobile={isMobile} />
//       </Box>
//       <Divider sx={{ my: isMobile ? 1 : 2 }} />
//     </>
//   )
// }

// function LoadingState() {
//   return null
// }

// // function ErrorState({ error, isOnline, onRetry, isLoading }) {
// //   return (
// //     <Box sx={{ p: 3, textAlign: 'center' }}>
// //       <Alert severity="error" sx={{ mb: 2 }}>
// //         {error?.message || 'Ошибка загрузки теста'}
// //       </Alert>
// //       {!isOnline && (
// //         <Button variant="contained" onClick={onRetry} disabled={isLoading}>
// //           Попробовать загрузить снова
// //         </Button>
// //       )}
// //     </Box>
// //   )
// // }

// function NotFoundState({ isOnline }) {
//   return (
//     <Box sx={{ p: 3, textAlign: 'center' }}>
//       <Typography variant="h6">
//         {isOnline ? 'Тест не найден' : 'Тест не доступен в оффлайн-режиме'}
//       </Typography>
//       {!isOnline && (
//         <Button
//           variant="contained"
//           sx={{ mt: 2 }}
//           onClick={() => window.location.reload()}
//         >
//           Обновить страницу
//         </Button>
//       )}
//     </Box>
//   )
// }

// // // Custom hooks

// const useOfflineTest = (
//   id,
//   isOnline,
//   isDBInitialized,
//   initialTestData = null
// ) => {
//   const [offlineTest, setOfflineTest] = useState(initialTestData)
//   const [isOfflineLoading, setIsOfflineLoading] = useState(false)
//   const [error, setError] = useState(null)

//   useEffect(() => {
//     if (!isOnline && isDBInitialized && id) {
//       const loadOfflineTest = async () => {
//         try {
//           setIsOfflineLoading(true)

//           // Сначала проверяем переданные данные
//           let test = offlineTest || initialTestData

//           // Если данных нет, пробуем загрузить из IndexedDB
//           if (!test) {
//             test = await getTestFromDB(id, STORE_NAMES.TESTS_CONTENT)
//           }

//           // // Проверяем структуру теста
//           // if (!test?.questions || !test?.name) {
//           //   console.warn('Invalid test structure in IndexedDB:', test)
//           //   throw new Error('INVALID_TEST_DATA')
//           // }

//           setOfflineTest(test)
//           setError(null)
//         } catch (e) {
//           console.error('Offline load error:', e)
//           setError(
//             e.message === 'TEST_NOT_FOUND'
//               ? 'Тест не найден в оффлайн-хранилище'
//               : 'Неверный формат теста в оффлайн-хранилище'
//           )
//         } finally {
//           setIsOfflineLoading(false)
//         }
//       }

//       loadOfflineTest()
//     }
//   }, [id, isOnline, isDBInitialized, initialTestData, offlineTest])

//   return { offlineTest, isOfflineLoading, error }
// }

// const useTestData = (id, initialTestData) => {
//   const [isDBInitialized, setIsDBInitialized] = useState(false)
//   const [syncError, setSyncError] = useState(null)
//   const [isOnline, setIsOnline] = useState(navigator.onLine)

//   const {
//     data: onlineTest,
//     isLoading: isOnlineLoading,
//     isError: isOnlineError,
//     error: onlineError,
//     refetch,
//   } = useGetTestByIdQuery(id, { skip: !id || !isOnline })

//   // Вынесли логику отслеживания сети прямо в хук
//   useEffect(() => {
//     const handleOnline = () => {
//       setIsOnline(true)
//       refetch()
//     }
//     const handleOffline = () => setIsOnline(false)

//     window.addEventListener('online', handleOnline)
//     window.addEventListener('offline', handleOffline)

//     return () => {
//       window.removeEventListener('online', handleOnline)
//       window.removeEventListener('offline', handleOffline)
//     }
//   }, [refetch])

//   const {
//     offlineTest,
//     isOfflineLoading,
//     error: offlineError,
//   } = useOfflineTest(id, isOnline, isDBInitialized, initialTestData)

//   useEffect(() => {
//     const initializeDB = async () => {
//       try {
//         await initDB()
//         setIsDBInitialized(true)
//       } catch (e) {
//         console.error('DB initialization failed:', e)
//         setSyncError('Ошибка инициализации локального хранилища')
//       }
//     }
//     initializeDB()
//   }, [])

//   return {
//     test: isOnline ? onlineTest : offlineTest,
//     isLoading: isOnline ? isOnlineLoading : isOfflineLoading,
//     isError: isOnline ? isOnlineError : !!offlineError,
//     error: isOnline ? onlineError : offlineError,
//     syncError,
//     setSyncError,
//     refetch,
//     isOnline,
//     isDBInitialized,
//   }
// }

// // Main component
// function TestOnePage() {
//   const { id } = useParams()
//   const location = useLocation()
//   const testOfflineData = location.state
//   const theme = useTheme()
//   const isMobile = useMediaQuery(theme.breakpoints.down('md'))
//   const { saveTestResults, getTestResults, syncPendingResults } =
//     useTestResults()
//   // const { state: testOfflineData } = useLocation()

//   const {
//     test,
//     isLoading,
//     isError,
//     error,
//     syncError,
//     setSyncError,
//     refetch,
//     isOnline,
//     isDBInitialized,
//   } = useTestData(id, testOfflineData)

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

//   // Memoized values
//   const testProps = useMemo(
//     () => ({
//       isControlTest: test?.test_is_control || false,
//       currentQuestion: test?.questions?.[currentQuestionIndex],
//       totalPoints: test?.total_points || 0,
//       passingScore: test?.passing_score || 75,
//       questionsLength: test?.questions?.length || 0,
//       testName: test?.name || '',
//     }),
//     [test, currentQuestionIndex]
//   )

//   const [allQuestionsAnswered] = useMemo(() => {
//     if (!test?.questions) return [false]

//     // Проверяем, что для всех вопросов есть ответы в объекте answers
//     const allAnswered = test.questions.every((q) => answers[q.id] !== undefined)
//     return [allAnswered]
//   }, [answers, test?.questions])

//   const isLastQuestion = currentQuestionIndex === testProps.questionsLength - 1
//   const isAnswered = testProps.currentQuestion?.id
//     ? correctAnswers[testProps.currentQuestion.id] !== undefined
//     : false

//   // Event handlers

//   const navigateQuestion = useCallback(
//     (direction) => {
//       const newIndex = currentQuestionIndex + direction
//       if (newIndex >= 0 && newIndex < testProps.questionsLength) {
//         updateState({
//           currentQuestionIndex: newIndex,
//           showFeedback: false,
//         })
//       }
//     },
//     [currentQuestionIndex, testProps.questionsLength, updateState]
//   )

//   const swipeHandlers = useSwipeable({
//     onSwipedLeft: () => isMobile && navigateQuestion(1),
//     onSwipedRight: () => isMobile && navigateQuestion(-1),
//     trackMouse: true,
//     preventDefaultTouchmoveEvent: true,
//   })

//   const handleNextQuestion = useCallback(() => {
//     navigateQuestion(1)
//   }, [navigateQuestion])

//   const handleAnswerChange = useCallback(
//     (event) => {
//       if (!testProps.currentQuestion?.id) return
//       updateState({
//         answers: {
//           ...answers,
//           [testProps.currentQuestion.id]: event.target.value,
//         },
//       })
//     },
//     [answers, testProps.currentQuestion?.id, updateState]
//   )

//   const handleSubmit = useCallback(() => {
//     if (
//       !testProps.currentQuestion?.id ||
//       !answers[testProps.currentQuestion.id]
//     ) {
//       return
//     }

//     const isCorrect = testProps.currentQuestion.answers.some(
//       (answer) =>
//         answer.id.toString() === answers[testProps.currentQuestion.id] &&
//         answer.is_correct
//     )

//     updateState({
//       correctAnswers: {
//         ...correctAnswers,
//         [testProps.currentQuestion.id]: isCorrect,
//       },
//       score: isCorrect ? score + testProps.currentQuestion.points : score,
//       showFeedback: true,
//     })

//     // points
//   }, [answers, correctAnswers, score, testProps.currentQuestion, updateState])

//   const handleTabChange = useCallback(
//     (_, newIndex) => {
//       updateState({
//         currentQuestionIndex: newIndex,
//         showFeedback: false,
//       })
//     },
//     [updateState]
//   )

//   const prepareTestResults = useCallback(() => {
//     const mark = calculateMark(score, testProps.totalPoints).toFixed(1)
//     const completionTime = new Date()
//     const testDuration = Math.floor((completionTime - testStartTime) / 1000)
//     const isPassed =
//       score >= (testProps.totalPoints * testProps.passingScore) / 100

//     return {
//       fullResults: {
//         test: id,
//         test_title: test?.name,
//         is_passed: isPassed,
//         total_points: testProps.totalPoints,
//         mark,
//         start_time: testStartTime.toISOString(),
//         completion_time: completionTime.toISOString(),
//         test_duration: testDuration,
//         questions:
//           test?.questions?.map((question) => ({
//             id: question.id,
//             name: question.name,
//             points: question.points,
//             answers: question.answers.map((answer) => ({
//               id: answer.id,
//               name: answer.name,
//               is_correct: answer.is_correct,
//             })),
//             explanation: question.explanation,
//           })) || [],
//         user_answers:
//           test?.questions?.map((question) => ({
//             id: question.id,
//             selected_id: answers[question.id] || null,
//             is_correct: correctAnswers[question.id] || false,
//             points: correctAnswers[question.id] ? question.points : 0,
//           })) || [],
//       },
//       serverResults: {
//         test: id,
//         is_passed: isPassed,
//         mark,
//         score,
//         total_points: testProps.totalPoints,
//         start_time: testStartTime.toISOString(),
//         completion_time: completionTime.toISOString(),
//         test_duration: testDuration,
//         user_answers:
//           test?.questions?.map((question) => ({
//             id: question.id,
//             selected_id: answers[question.id] || null,
//             is_correct: correctAnswers[question.id] || false,
//           })) || [],
//       },
//     }
//   }, [
//     answers,
//     correctAnswers,
//     id,
//     score,
//     test,
//     testProps.passingScore,
//     testProps.totalPoints,
//     testStartTime,
//   ])

//   // useEffect(() => {
//   //   const loadTestData = async () => {
//   //     try {
//   //       setIsLoading(true)
//   //       setError(null)

//   //       if (isOnline) {
//   //         // Загрузка из API
//   //         const { data } = await getTestById(id)
//   //         if (!data) throw new Error('Тест не найден')
//   //         setTestData(data)
//   //       } else {
//   //         // Загрузка из IndexedDB
//   //         const offlineTest = await getOfflineTest(id)
//   //         setTestData(offlineTest)

//   //         // Если тест есть, но это базовая версия
//   //         if (!offlineTest.content) {
//   //           setWarning(
//   //             'Доступна только базовая версия теста.
// //              Для полной версии подключитесь к интернету.'
//   //           )
//   //         }
//   //       }
//   //     } catch (e) {
//   //       if (e.message === 'TEST_NOT_FOUND') {
//   //         setError(
//   //           <span>
//   //             Тест не доступен оффлайн.
//   //             <Button
//   //               color="primary"
//   //               onClick={() => setShowDownloadDialog(true)}
//   //               sx={{ ml: 1 }}
//   //             >
//   //               Скачать
//   //             </Button>{' '}
//   //             при следующем подключении
//   //           </span>
//   //         )
//   //       } else {
//   //         setError(e.message)
//   //       }
//   //     } finally {
//   //       setIsLoading(false)
//   //     }
//   //   }

//   //   loadTestData()
//   // }, [id, isOnline, getTestById])

//   // Диалог для напоминания скачать тест
//   // const [showDownloadDialog, setShowDownloadDialog] = useState(false)

//   const handleCompleteTest = useCallback(async () => {
//     if (!test?.questions || !id || !test?.name) return

//     if (!allQuestionsAnswered) {
//       const firstUnansweredIndex = test.questions.findIndex(
//         (q) => answers[q.id] === undefined
//       )
//       updateState({
//         currentQuestionIndex: firstUnansweredIndex,
//         showFeedback: false,
//       })
//       return
//     }

//     const { fullResults, serverResults } = prepareTestResults()

//     try {
//       const savedResults = await saveTestResults(id, fullResults, serverResults)
//       updateState({
//         completed: true,
//         finalResults: {
//           ...savedResults,
//           test_title: test.name,
//           totalPoints: testProps.totalPoints,
//         },
//       })
//     } catch (err) {
//       console.error('Save results error:', err)
//       updateState({
//         completed: true,
//         finalResults: {
//           ...fullResults,
//           totalPoints: testProps.totalPoints,
//         },
//       })
//       setSyncError(
//         isOnline
//           ? 'Ошибка отправки результатов'
//           : 'Результаты сохранены локально для последующей синхронизации'
//       )
//     }
//   }, [
//     allQuestionsAnswered,
//     answers,
//     id,
//     isOnline,
//     prepareTestResults,
//     saveTestResults,
//     setSyncError,
//     test,
//     testProps.totalPoints,
//     updateState,
//   ])

//   useEffect(() => {
//     const checkResults = async () => {
//       if (completed && !finalResults) {
//         try {
//           const results = await getTestResults(id)
//           if (results.length > 0) {
//             updateState({
//               finalResults: results[0],
//               completed: true,
//             })
//           }
//         } catch (e) {
//           console.error('Failed to recover results:', e)
//         }
//       }
//     }
//     checkResults()
//   }, [completed, finalResults, id, getTestResults, updateState])

//   // Sync when online
//   useEffect(() => {
//     const handleOnline = async () => {
//       try {
//         await syncPendingResults()
//       } catch (e) {
//         console.error('Sync failed:', e)
//       }
//     }

//     window.addEventListener('online', handleOnline)
//     return () => window.removeEventListener('online', handleOnline)
//   }, [syncPendingResults])

//   const handleRestartTest = useCallback(() => {
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
//     refetch()
//   }, [refetch, updateState])

//   const questionTabs = useMemo(
//     () =>
//       test?.questions?.map((question, index) => ({
//         label: `${index + 1}`,
//         content: (
//           <Box
//             sx={{
//               p: isMobile ? 1 : 2,
//               '& *': { maxWidth: '100%', wordBreak: 'break-word' },
//             }}
//           >
//             <QuestionView
//               question={question}
//               selectedAnswer={answers[question.id] || null}
//               showFeedback={index === currentQuestionIndex && showFeedback}
//               disabled={correctAnswers[question.id] !== undefined}
//               onChange={handleAnswerChange}
//               isMobile={isMobile}
//               isControlTest={testProps.isControlTest}
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
//       test?.questions,
//       testProps.isControlTest,
//     ]
//   )

//   // Render states
//   if (!isDBInitialized || isLoading) return <LoadingState />
//   // if (isError)
//   //   return (
//   //     <ErrorState
//   //       error={error}
//   //       isOnline={isOnline}
//   //       onRetry={handleDownloadTest}
//   //       isLoading={isLoading}
//   //     />
//   //   )

//   if (isError) {
//     return (
//       <Box sx={{ p: 3, textAlign: 'center' }}>
//         <Alert severity="error" sx={{ mb: 2 }}>
//           {error?.message || 'Ошибка загрузки теста'}
//         </Alert>
//         {isOnline ? (
//           <Button variant="contained" onClick={refetch}>
//             Повторить попытку
//           </Button>
//         ) : (
//           <Typography variant="body1">
//             Подключитесь к интернету для загрузки теста
//           </Typography>
//         )}
//       </Box>
//     )
//   }

//   if (!test) return <NotFoundState isOnline={isOnline} />

//   if (completed && finalResults) {
//     if (!finalResults.questions || !finalResults.user_answers) {
//       return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }} />
//     }

//     return (
//       <TestResultsView
//         testId={finalResults.test}
//         testTitle={finalResults.test_title || testProps.testName}
//         score={finalResults.score}
//         totalPoints={testProps.totalPoints}
//         mark={finalResults.mark}
//         answers={finalResults.user_answers}
//         questions={finalResults.questions}
//         startTime={finalResults.start_time}
//         completionTime={finalResults.completion_time}
//         duration={finalResults.test_duration}
//         onRestart={handleRestartTest}
//         isControlTest={testProps.isControlTest}
//       />
//     )
//   }

//   return (
//     <Box
//       sx={{
//         maxWidth: 800,
//         width: '80vw',
//         margin: '0 auto',
//         touchAction: isMobile ? 'pan-y' : 'auto',
//       }}
//       {...(isMobile ? swipeHandlers : {})}
//     >
//       {!isOnline && <OfflineIndicator />}
//       <TestHeader
//         testName={testProps.testName}
//         currentQuestionIndex={currentQuestionIndex}
//         questionsLength={testProps.questionsLength}
//         isMobile={isMobile}
//       />

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
//         isControlTest={testProps.isControlTest}
//       />

//       {!testProps.isControlTest && testProps.currentQuestion && (
//         <QuestionFeedback
//           showFeedback={showFeedback}
//           isCorrect={correctAnswers[testProps.currentQuestion.id] || false}
//           explanation={testProps.currentQuestion.explanation}
//           referenceLink={testProps.currentQuestion.reference_link}
//           onClose={() => updateState({ showFeedback: false })}
//         />
//       )}

//       <TestControls
//         onSubmit={handleSubmit}
//         onComplete={handleCompleteTest}
//         onNextQuestion={handleNextQuestion}
//         hasAnswer={
//           !!(
//             testProps.currentQuestion?.id &&
//             answers[testProps.currentQuestion.id]
//           )
//         }
//         showFeedback={showFeedback}
//         isAnswered={isAnswered}
//         isLastQuestion={isLastQuestion}
//         allQuestionsAnswered={allQuestionsAnswered}
//         isMobile={isMobile}
//         isControlTest={testProps.isControlTest}
//       />

//       <Snackbar
//         open={!!syncError}
//         autoHideDuration={6000}
//         onClose={() => setSyncError(null)}
//       >
//         <Alert severity={isOnline ? 'error' : 'warning'}>{syncError}</Alert>
//       </Snackbar>
//     </Box>
//   )
// }

// export default memo(TestOnePage)

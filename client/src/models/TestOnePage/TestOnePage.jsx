/* eslint-disable operator-linebreak */
import React, { useMemo, useCallback } from 'react'
import {
  Box,
  Button,
  useTheme,
  useMediaQuery,
  Typography,
  Divider,
  CircularProgress,
} from '@mui/material'
import { Link, useParams } from 'react-router-dom'
import { useSwipeable } from 'react-swipeable'

import { calculateMark } from '@/service/utilsFunction'
import useTestState from '@/hook/useTestState'
import useTestResults from '@/hook/useTestResults'
import TabsWrapper from '@/components/TabsWrapper'

import TestControls from '../../components/TestControls/TestControls'
import QuestionView from '../../components/QuestionView/QuestionView'
import TestResultsView from '../../components/TestResultsView/TestResultsView'
import QuestionFeedback from '../../components/QuestionFeedback/QuestionFeedback'
import { useGetTestByIdQuery } from '../../slices/testApi'

function TestOnePage() {
  const { id } = useParams()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const {
    data: testData,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetTestByIdQuery(id, {
    skip: !id,
  })
  const test = useMemo(() => testData, [testData])

  const isControlTest = test?.test_is_control

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

  // Добавляем проверки перед использованием test
  const currentQuestion = test?.questions?.[currentQuestionIndex]
  const totalPoints = useMemo(
    () => test?.questions?.reduce((sum, q) => sum + q.points, 0) || 0,
    [test?.questions]
  )

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
    [currentQuestionIndex, updateState, test?.questions]
  )

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => isMobile && navigateQuestion(1),
    onSwipedRight: () => isMobile && navigateQuestion(-1),
    trackMouse: true,
    preventDefaultTouchmoveEvent: true,
  })

  const saveTestResults = useTestResults()

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
    const testResults = {
      test_id: id,
      test_title: test.name,
      is_passed: true,
      total_score: score,
      mark,
      questions: test.questions.map((question) => ({
        id: question.id,
        name: question.name,
        selected_id: answers[question.id] || null,
        is_correct: correctAnswers[question.id] || false,
        points: correctAnswers[question.id] ? question.points : 0,
        answers: question.answers.map((answer) => ({
          id: answer.id,
          name: answer.name,
          is_correct: answer.is_correct,
        })),
      })),
    }

    const results = await saveTestResults(id, testResults, testStartTime)
    if (results) {
      updateState({
        completed: true,
        finalResults: results,
      })
    }
  }, [
    allQuestionsAnswered,
    answers,
    correctAnswers,
    id,
    score,
    saveTestResults,
    test?.questions,
    test?.name,
    testStartTime,
    totalPoints,
    updateState,
  ])

  const handleRestartTest = () => {
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
    refetch() // Если данные могут измениться на сервере
  }

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

  if (isLoading) return <CircularProgress size={50} />
  if (isError) {
    return <div>{`Ошибка при загрузке теста: ${error?.message}`}</div>
  }
  if (!test) return <div>Тест не найден</div>

  if (completed && finalResults) {
    return (
      <TestResultsView
        testId={id}
        testTitle={test.name}
        score={score}
        totalPoints={totalPoints}
        mark={finalResults.mark}
        answers={finalResults.questions}
        questions={test.questions}
        startTime={finalResults.start_time}
        completionTime={finalResults.completion_time}
        duration={finalResults.test_duration}
        refetch={handleRestartTest}
        isControlTest={isControlTest}
      />
    )
  }

  return (
    <Box
      sx={{
        maxWidth: 800,
        width: '80vw',
        margin: '0 auto',
        py: 2,
        touchAction: isMobile ? 'pan-y' : 'auto',
      }}
      {...(isMobile ? swipeHandlers : {})}
    >
      <Box sx={{ mb: 2 }}>
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

      <Typography
        variant={isMobile ? 'h6' : 'h5'}
        gutterBottom
        sx={{ fontSize: isMobile ? '1.25rem' : '1.5rem' }}
      >
        {test.name}
      </Typography>

      <Typography
        variant="subtitle1"
        gutterBottom
        sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}
      >
        {`Вопрос ${currentQuestionIndex + 1} из ${test.questions.length}`}
      </Typography>

      <Divider sx={{ my: isMobile ? 1 : 2 }} />

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
// import { test } from '@/service/constValues'
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
//     error,
//     // isUninitialized,
//     // isError,
//   } = useGetTestByIdQuery(id, {
//     skip: !id,
//   })

//   console.log('testData > ', testData)
//   const isControlTest = testData?.test_is_control

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

//   const currentQuestion = test.questions[currentQuestionIndex]
//   const totalPoints = useMemo(
//     () => test.questions.reduce((sum, q) => sum + q.points, 0),
//     []
//   )

//   const navigateQuestion = useCallback(
//     (direction) => {
//       const newIndex = currentQuestionIndex + direction
//       if (newIndex >= 0 && newIndex < test.questions.length) {
//         updateState({
//           currentQuestionIndex: newIndex,
//           showFeedback: false,
//         })
//       }
//     },
//     [currentQuestionIndex, updateState]
//   )

//   const swipeHandlers = useSwipeable({
//     onSwipedLeft: () => isMobile && navigateQuestion(1),
//     onSwipedRight: () => isMobile && navigateQuestion(-1),
//     trackMouse: true,
//     preventDefaultTouchmoveEvent: true,
//   })

//   const saveTestResults = useTestResults()

//   const unansweredQuestions = useMemo(
//     () => test.questions.filter((q) => answers[q.id] === undefined),
//     [answers]
//   )

//   const allQuestionsAnswered = unansweredQuestions.length === 0
//   const isLastQuestion = currentQuestionIndex === test.questions.length - 1
//   const isAnswered = correctAnswers[currentQuestion.id] !== undefined

//   const handleAnswerChange = useCallback(
//     (event) => {
//       updateState({
//         answers: {
//           ...answers,
//           [currentQuestion.id]: event.target.value,
//         },
//       })
//     },
//     [answers, currentQuestion.id, updateState]
//   )

//   const handleSubmit = useCallback(() => {
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

//   const handleCompleteTest = useCallback(async () => {
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

//     const mark = calculateMark(score, totalPoints).toFixed(1)
//     const testResults = {
//       test_id: id,
//       test_title: test.name,
//       is_passed: true,
//       total_score: score,
//       mark,
//       questions: test.questions.map((question) => ({
//         id: question.id,
//         name: question.name,
//         selected_id: answers[question.id] || null,
//         is_correct: correctAnswers[question.id] || false,
//         points: correctAnswers[question.id] ? question.points : 0,
//         answers: question.answers.map((answer) => ({
//           id: answer.id,
//           name: answer.name,
//           is_correct: answer.is_correct,
//         })),
//       })),
//     }

//     const results = await saveTestResults(id, testResults, testStartTime)
//     if (results) {
//       updateState({
//         completed: true,
//         finalResults: results,
//       })
//     }
//   }, [
//     allQuestionsAnswered,
//     answers,
//     correctAnswers,
//     id,
//     score,
//     saveTestResults,
//     // test.questions,
//     // test.name,
//     testStartTime,
//     totalPoints,
//     updateState,
//   ])

//   const questionTabs = useMemo(
//     () =>
//       test.questions.map((question, index) => ({
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
//       })),
//     [
//       answers,
//       correctAnswers,
//       currentQuestionIndex,
//       handleAnswerChange,
//       showFeedback,
//       isMobile,
//     ]
//   )

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
//         isControlTest={isControlTest}
//       />
//     )
//   }

//   if (isLoading) return <CircularProgress size={50} />
//   if (error) return <div>Ошибка при загрузке тестов</div>

//   return (
//     <Box
//       sx={{
//         maxWidth: 800,
//         width: '80vw',
//         margin: '0 auto',
//         // px: isMobile ? 1 : 3,
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

//       {!isControlTest && (
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
//         hasAnswer={answers[currentQuestion.id] !== undefined}
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

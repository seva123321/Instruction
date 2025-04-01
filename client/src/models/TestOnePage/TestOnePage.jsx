import React, { useMemo, useCallback } from 'react'
import {
  Box,
  Button,
  useTheme,
  useMediaQuery,
  Typography,
  Divider,
} from '@mui/material'
import { Link, useParams } from 'react-router-dom'
import { useSwipeable } from 'react-swipeable'

import { calculateMark } from '@/service/utilsFunction'
import useTestState from '@/hook/useTestState'
import useTestResults from '@/hook/useTestResults'
import { test } from '@/service/constValues'
import TabsWrapper from '@/components/TabsWrapper'

import TestControls from '../../components/TestControls/TestControls'
import QuestionView from '../../components/QuestionView/QuestionView'
import TestResultsView from '../../components/TestResultsView/TestResultsView'
import QuestionFeedback from '../../components/QuestionFeedback/QuestionFeedback'

function TestOnePage() {
  const { id } = useParams()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

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

  const currentQuestion = test.questions[currentQuestionIndex]
  const totalPoints = useMemo(
    () => test.questions.reduce((sum, q) => sum + q.points, 0),
    []
  )

  const navigateQuestion = useCallback(
    (direction) => {
      const newIndex = currentQuestionIndex + direction
      if (newIndex >= 0 && newIndex < test.questions.length) {
        updateState({
          currentQuestionIndex: newIndex,
          showFeedback: false,
        })
      }
    },
    [currentQuestionIndex, updateState]
  )

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => isMobile && navigateQuestion(1),
    onSwipedRight: () => isMobile && navigateQuestion(-1),
    trackMouse: true,
    preventDefaultTouchmoveEvent: true,
  })

  const saveTestResults = useTestResults()

  const unansweredQuestions = useMemo(
    () => test.questions.filter((q) => answers[q.id] === undefined),
    [answers]
  )

  const allQuestionsAnswered = unansweredQuestions.length === 0
  const isLastQuestion = currentQuestionIndex === test.questions.length - 1
  const isAnswered = correctAnswers[currentQuestion.id] !== undefined

  const handleAnswerChange = useCallback(
    (event) => {
      updateState({
        answers: {
          ...answers,
          [currentQuestion.id]: event.target.value,
        },
      })
    },
    [answers, currentQuestion.id, updateState]
  )

  const handleSubmit = useCallback(() => {
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
    // test.questions,
    // test.name,
    testStartTime,
    totalPoints,
    updateState,
  ])

  const questionTabs = useMemo(
    () =>
      test.questions.map((question, index) => ({
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
            />
          </Box>
        ),
      })),
    [
      answers,
      correctAnswers,
      currentQuestionIndex,
      handleAnswerChange,
      showFeedback,
      isMobile,
    ]
  )

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
      />
    )
  }

  return (
    <Box
      sx={{
        maxWidth: 800,
        width: '80vw',
        margin: '0 auto',
        // px: isMobile ? 1 : 3,
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
      />

      <QuestionFeedback
        showFeedback={showFeedback}
        isCorrect={correctAnswers[currentQuestion.id] || false}
        explanation={currentQuestion.explanation}
        referenceLink={currentQuestion.reference_link}
        onClose={() => updateState({ showFeedback: false })}
      />

      <TestControls
        onSubmit={handleSubmit}
        onComplete={handleCompleteTest}
        onNextQuestion={handleNextQuestion}
        hasAnswer={answers[currentQuestion.id] !== undefined}
        showFeedback={showFeedback}
        isAnswered={isAnswered}
        isLastQuestion={isLastQuestion}
        allQuestionsAnswered={allQuestionsAnswered}
        isMobile={isMobile}
      />
    </Box>
  )
}

export default React.memo(TestOnePage)

// import React, { useState, useMemo, useCallback } from 'react'
// import { Box, Button, Divider, Typography } from '@mui/material'
// import { useParams, useNavigate } from 'react-router-dom'
// import { test } from '@/service/constValues'
// import TabsWrapper from '@/components/TabsWrapper'
// import QuestionView from './QuestionView'
// import QuestionFeedback from './QuestionFeedback'
// import TestResultsView from './TestResultsView'

// const calculateMark = (score, totalPoints) => {
//   const percentage = (score / totalPoints) * 100
//   return Math.min(
//     10,
//     Math.floor(percentage / 10) + (percentage % 10 >= 5 ? 1 : 0)
//   )
// }

// const useTestState = (initialState) => {
//   const [state, setState] = useState(initialState)
//   const updateState = (updates) => setState((prev) => ({ ...prev, ...updates }))
//   return [state, updateState]
// }

// const TestOnePage = () => {
//   const { id } = useParams()
//   const navigate = useNavigate()

//   // Добавляем время начала теста в состояние
//   const [state, updateState] = useTestState({
//     currentQuestionIndex: 0,
//     answers: {},
//     correctAnswers: {},
//     showFeedback: false,
//     score: 0,
//     completed: false,
//     finalResults: null,
//     testStartTime: new Date(), // Время начала теста
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
//     [test.questions]
//   )

//   const saveTestResults = useCallback((testId, results, startTime) => {
//     try {
//       const storedResults = localStorage.getItem('testResults')
//       const testResults = storedResults ? JSON.parse(storedResults) : {}
//       const completionTime = new Date()

//       testResults[testId] = {
//         ...results,
//         start_time: new Date(startTime).toISOString(),
//         completion_time: completionTime.toISOString(),
//         test_duration: Math.floor(
//           (completionTime - new Date(startTime)) / 1000
//         ),
//       }

//       localStorage.setItem('testResults', JSON.stringify(testResults))
//       return testResults[testId]
//     } catch (error) {
//       console.error('Failed to save test results:', error)
//       return null
//     }
//   }, [])

//   const handleOptionChange = useCallback(
//     (event) => {
//       updateState({
//         answers: {
//           ...answers,
//           [currentQuestion.question_id]: event.target.value,
//         },
//         showFeedback: false,
//       })
//     },
//     [answers, currentQuestion.question_id]
//   )

//   const handleSubmit = useCallback(() => {
//     const selectedOptionId = answers[currentQuestion.question_id]
//     const selectedOption = currentQuestion.options.find(
//       (opt) => opt.option_id.toString() === selectedOptionId
//     )
//     const isCorrect = selectedOption?.is_correct || false

//     updateState({
//       correctAnswers: {
//         ...correctAnswers,
//         [currentQuestion.question_id]: isCorrect,
//       },
//       score: isCorrect ? score + currentQuestion.points : score,
//       showFeedback: true,
//     })
//   }, [answers, correctAnswers, currentQuestion, score])

//   const handleTabChange = useCallback((_, newIndex) => {
//     updateState({
//       currentQuestionIndex: newIndex,
//       showFeedback: false,
//     })
//   }, [])

//   const handleCompleteTest = useCallback(() => {
//     const mark = calculateMark(score, totalPoints).toFixed(1)
//     const testResults = {
//       test_id: id,
//       test_title: test.title,
//       is_passed: true,
//       total_score: score,
//       mark,
//       questions: test.questions.map((question) => ({
//         question_id: question.question_id,
//         question_text: question.question_text,
//         selected_option_id: answers[question.question_id] || null,
//         is_correct: correctAnswers[question.question_id] || false,
//         points: correctAnswers[question.question_id] ? question.points : 0,
//         options: question.options.map((option) => ({
//           option_id: option.option_id,
//           option_text: option.option_text,
//           is_correct: option.is_correct,
//         })),
//       })),
//     }

//     const results = saveTestResults(id, testResults, testStartTime)
//     if (results) {
//       updateState({
//         completed: true,
//         finalResults: results,
//       })
//     }
//   }, [
//     id,
//     score,
//     totalPoints,
//     answers,
//     correctAnswers,
//     test,
//     testStartTime,
//     saveTestResults,
//   ])

//   const handleBack = useCallback(() => navigate(-1), [navigate])
//   const handleCloseFeedback = useCallback(
//     () => updateState({ showFeedback: false }),
//     []
//   )

//   const allQuestionsAnswered = test.questions.every(
//     (q) => answers[q.question_id] !== undefined
//   )

//   const questionTabs = test.questions.map((question, index) => ({
//     label: `${index + 1}`,
//     content: (
//       <QuestionView
//         question={question}
//         selectedOption={answers[question.question_id] || null}
//         showFeedback={index === currentQuestionIndex && showFeedback}
//         disabled={correctAnswers[question.question_id] !== undefined}
//         onChange={handleOptionChange}
//       />
//     ),
//   }))

//   if (completed && finalResults) {
//     return (
//       <TestResultsView
//         testId={id}
//         testTitle={test.title}
//         score={score}
//         totalPoints={totalPoints}
//         mark={finalResults.mark}
//         answers={finalResults.questions}
//         questions={test.questions}
//         startTime={finalResults.start_time}
//         completionTime={finalResults.completion_time}
//         duration={finalResults.test_duration}
//       />
//     )
//   }

//   return (
//     <Box sx={{ p: 3, maxWidth: 800, margin: '0 auto' }}>
//       <Button variant="outlined" onClick={handleBack} sx={{ mb: 3 }}>
//         Назад к тестам
//       </Button>

//       <Typography variant="h5" gutterBottom>
//         {test.title}
//       </Typography>

//       <Typography variant="subtitle1" gutterBottom>
//         Вопрос {currentQuestionIndex + 1} из {test.questions.length}
//       </Typography>

//       <Divider sx={{ my: 2 }} />

//       <TabsWrapper
//         tabs={questionTabs}
//         value={currentQuestionIndex}
//         onChange={handleTabChange}
//       />

//       <QuestionFeedback
//         showFeedback={showFeedback}
//         isCorrect={correctAnswers[currentQuestion.question_id] || false}
//         explanation={currentQuestion.explanation}
//         reference_links={currentQuestion.reference_links}
//         onClose={handleCloseFeedback}
//       />

//       <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
//         <Button
//           variant="contained"
//           onClick={handleSubmit}
//           disabled={
//             !answers[currentQuestion.question_id] ||
//             showFeedback ||
//             correctAnswers[currentQuestion.question_id] !== undefined
//           }
//         >
//           Проверить
//         </Button>

//         <Button
//           variant="contained"
//           onClick={handleCompleteTest}
//           disabled={!allQuestionsAnswered}
//         >
//           Завершить тест
//         </Button>
//       </Box>
//     </Box>
//   )
// }

// export default React.memo(TestOnePage)

// import React, { useState, useMemo, useCallback } from 'react'
// import { Box, Button, Divider, Typography } from '@mui/material'
// import { useParams, useNavigate } from 'react-router-dom'
// import { test } from '@/service/constValues'
// import TabsWrapper from '@/components/TabsWrapper'
// import QuestionView from './QuestionView'
// import QuestionFeedback from './QuestionFeedback'
// import TestResultsView from './TestResultsView'

// const calculateMark = (score, totalPoints) => {
//   const percentage = (score / totalPoints) * 100
//   return Math.min(
//     10,
//     Math.floor(percentage / 10) + (percentage % 10 >= 5 ? 1 : 0)
//   )
// }

// const useTestState = (initialState) => {
//   const [state, setState] = useState(initialState)
//   const updateState = (updates) => setState((prev) => ({ ...prev, ...updates }))
//   return [state, updateState]
// }

// const TestOnePage = () => {
//   const { id } = useParams()
//   const navigate = useNavigate()

//   // Добавляем время начала теста в состояние
//   const [state, updateState] = useTestState({
//     currentQuestionIndex: 0,
//     answers: {},
//     correctAnswers: {},
//     showFeedback: false,
//     score: 0,
//     completed: false,
//     finalResults: null,
//     testStartTime: new Date(), // Время начала теста
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
//     [test.questions]
//   )

//   const saveTestResults = useCallback((testId, results, startTime) => {
//     try {
//       const storedResults = localStorage.getItem('testResults')
//       const testResults = storedResults ? JSON.parse(storedResults) : {}
//       const completionTime = new Date()

//       testResults[testId] = {
//         ...results,
//         start_time: new Date(startTime).toISOString(),
//         completion_time: completionTime.toISOString(),
//         test_duration: Math.floor(
//           (completionTime - new Date(startTime)) / 1000
//         ),
//       }

//       localStorage.setItem('testResults', JSON.stringify(testResults))
//       return testResults[testId]
//     } catch (error) {
//       console.error('Failed to save test results:', error)
//       return null
//     }
//   }, [])

//   const handleOptionChange = useCallback(
//     (event) => {
//       updateState({
//         answers: {
//           ...answers,
//           [currentQuestion.question_id]: event.target.value,
//         },
//         showFeedback: false,
//       })
//     },
//     [answers, currentQuestion.question_id]
//   )

//   const handleSubmit = useCallback(() => {
//     const selectedOptionId = answers[currentQuestion.question_id]
//     const selectedOption = currentQuestion.options.find(
//       (opt) => opt.option_id.toString() === selectedOptionId
//     )
//     const isCorrect = selectedOption?.is_correct || false

//     updateState({
//       correctAnswers: {
//         ...correctAnswers,
//         [currentQuestion.question_id]: isCorrect,
//       },
//       score: isCorrect ? score + currentQuestion.points : score,
//       showFeedback: true,
//     })
//   }, [answers, correctAnswers, currentQuestion, score])

//   const handleTabChange = useCallback((_, newIndex) => {
//     updateState({
//       currentQuestionIndex: newIndex,
//       showFeedback: false,
//     })
//   }, [])

//   const handleCompleteTest = useCallback(() => {
//     const mark = calculateMark(score, totalPoints).toFixed(1)
//     const testResults = {
//       test_id: id,
//       test_title: test.title,
//       is_passed: true,
//       total_score: score,
//       mark,
//       questions: test.questions.map((question) => ({
//         question_id: question.question_id,
//         question_text: question.question_text,
//         selected_option_id: answers[question.question_id] || null,
//         is_correct: correctAnswers[question.question_id] || false,
//         points: correctAnswers[question.question_id] ? question.points : 0,
//         options: question.options.map((option) => ({
//           option_id: option.option_id,
//           option_text: option.option_text,
//           is_correct: option.is_correct,
//         })),
//       })),
//     }

//     const results = saveTestResults(id, testResults, testStartTime)
//     if (results) {
//       updateState({
//         completed: true,
//         finalResults: results,
//       })
//     }
//   }, [
//     id,
//     score,
//     totalPoints,
//     answers,
//     correctAnswers,
//     test,
//     testStartTime,
//     saveTestResults,
//   ])

//   const handleBack = useCallback(() => navigate(-1), [navigate])
//   const handleCloseFeedback = useCallback(
//     () => updateState({ showFeedback: false }),
//     []
//   )

//   const allQuestionsAnswered = test.questions.every(
//     (q) => answers[q.question_id] !== undefined
//   )

//   const questionTabs = test.questions.map((question, index) => ({
//     label: `${index + 1}`,
//     content: (
//       <QuestionView
//         question={question}
//         selectedOption={answers[question.question_id] || null}
//         showFeedback={index === currentQuestionIndex && showFeedback}
//         disabled={correctAnswers[question.question_id] !== undefined}
//         onChange={handleOptionChange}
//       />
//     ),
//   }))

//   if (completed && finalResults) {
//     return (
//       <TestResultsView
//         testId={id}
//         testTitle={test.title}
//         score={score}
//         totalPoints={totalPoints}
//         mark={finalResults.mark}
//         answers={finalResults.questions}
//         questions={test.questions}
//         startTime={finalResults.start_time}
//         completionTime={finalResults.completion_time}
//         duration={finalResults.test_duration}
//       />
//     )
//   }

//   return (
//     <Box sx={{ p: 3, maxWidth: 800, margin: '0 auto' }}>
//       <Button variant="outlined" onClick={handleBack} sx={{ mb: 3 }}>
//         Назад к тестам
//       </Button>

//       <Typography variant="h5" gutterBottom>
//         {test.title}
//       </Typography>

//       <Typography variant="subtitle1" gutterBottom>
//         Вопрос {currentQuestionIndex + 1} из {test.questions.length}
//       </Typography>

//       <Divider sx={{ my: 2 }} />

//       <TabsWrapper
//         tabs={questionTabs}
//         value={currentQuestionIndex}
//         onChange={handleTabChange}
//       />

//       <QuestionFeedback
//         showFeedback={showFeedback}
//         isCorrect={correctAnswers[currentQuestion.question_id] || false}
//         explanation={currentQuestion.explanation}
//         reference_links={currentQuestion.reference_links}
//         onClose={handleCloseFeedback}
//       />

//       <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
//         <Button
//           variant="contained"
//           onClick={handleSubmit}
//           disabled={
//             !answers[currentQuestion.question_id] ||
//             showFeedback ||
//             correctAnswers[currentQuestion.question_id] !== undefined
//           }
//         >
//           Проверить
//         </Button>

//         <Button
//           variant="contained"
//           onClick={handleCompleteTest}
//           disabled={!allQuestionsAnswered}
//         >
//           Завершить тест
//         </Button>
//       </Box>
//     </Box>
//   )
// }

// export default React.memo(TestOnePage)

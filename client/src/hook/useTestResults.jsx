/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable implicit-arrow-linebreak */
import { useCallback } from 'react'

const useTestResults = () =>
  useCallback(async (testId, results, startTime) => {
    try {
      const completionTime = new Date()
      const testResults = {
        ...results,
        start_time: new Date(startTime).toISOString(),
        completion_time: completionTime.toISOString(),
        test_duration: Math.floor(
          (completionTime - new Date(startTime)) / 1000
        ),
      }

      const storedResults = JSON.parse(
        localStorage.getItem('testResults') || '{}'
      )
      storedResults[testId] = testResults
      localStorage.setItem('testResults', JSON.stringify(storedResults))

      return testResults
    } catch (error) {
      // Можно заменить на отправку ошибки в сервис мониторинга
      // console.error('Failed to save test results:', error)
      return null
    }
  }, [])

export default useTestResults

// import { useCallback } from 'react'

// const useTestResults = () =>
//   useCallback(async (testId, results, startTime) => {
//     try {
//       const completionTime = new Date()
//       const testDuration = Math.floor(
//         (completionTime - new Date(startTime)) / 1000
//       )

//       // Формируем минимально необходимые данные для хранения
//       const storedData = {
//         test_id: testId,
//         start_time: new Date(startTime),//.toISOString(),
//         completion_time: completionTime,//.toISOString(),
//         test_duration: testDuration,
//         is_passed: results.mark >= 6, // или ваша логика определения прохождения
//         mark: results.mark,
//         score: results.score,
//         total_points: results.totalPoints,
//         questions: results.questions.map((question) => ({
//           id: question.id,
//           name: question.name,
//           points: question.points,
//           answers: question.answers.map((answer) => ({
//             id: answer.id,
//             is_correct: answer.is_correct,
//           })),
//         })),
//         user_answers: results.answers.map((answer) => ({
//           id: answer.id,
//           selected_id: answer.selected_id,
//           is_correct: answer.is_correct,
//           explanation: answer.explanation,
//         })),
//       }

//       const storedResults = JSON.parse(
//         localStorage.getItem('testResults') || '{}'
//       )
//       storedResults[testId] = storedData
//       localStorage.setItem('testResults', JSON.stringify(storedResults))

//       // Возвращаем полные результаты для использования в компоненте
//       return {
//         ...results,
//         start_time: storedData.start_time,
//         completion_time: storedData.completion_time,
//         test_duration: storedData.test_duration,
//       }
//     } catch (error) {
//       return null
//     }
//   }, [])

// export default useTestResults

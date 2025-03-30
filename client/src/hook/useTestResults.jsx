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

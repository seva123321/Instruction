/* eslint-disable operator-linebreak */
import { memo, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Button, Stack } from '@mui/material'

function TestControls({
  onSubmit,
  onComplete,
  onNextQuestion,
  hasAnswer,
  showFeedback,
  isAnswered,
  isLastQuestion,
  allQuestionsAnswered,
  isMobile,
}) {
  const isCurrentQuestionChecked = isAnswered && showFeedback
  const [canCompleteTest, setCanCompleteTest] = useState(false)

  // Отслеживаем, когда все вопросы отвечены и проверены
  useEffect(() => {
    if (allQuestionsAnswered && isCurrentQuestionChecked) {
      setCanCompleteTest(true)
    }
  }, [allQuestionsAnswered, isCurrentQuestionChecked])

  const getButtonText = () => {
    if (!allQuestionsAnswered) {
      return isLastQuestion ? 'Ответьте на все вопросы' : 'Следующий вопрос'
    }

    // Все вопросы отвечены
    return canCompleteTest || isCurrentQuestionChecked
      ? 'Завершить тест'
      : 'Проверьте ответ'
  }

  // Определяем состояние disabled
  const isDisabled = allQuestionsAnswered
    ? !canCompleteTest && !isCurrentQuestionChecked
    : isLastQuestion && (!allQuestionsAnswered || !isCurrentQuestionChecked)

  // const canFinishTest = canCompleteTest || isCurrentQuestionChecked
  // let isDisabled

  // if (allQuestionsAnswered) {
  //   isDisabled = !canFinishTest
  // } else {
  //   isDisabled = isLastQuestion && !canFinishTest
  // }

  return (
    <Stack
      direction={isMobile ? 'column' : 'row'}
      spacing={isMobile ? 1.5 : 2}
      sx={{
        mt: 2,
        justifyContent: 'space-between',
        width: '100%',
      }}
    >
      {/* Кнопка "Проверить" */}
      <Button
        variant="contained"
        color="primary"
        onClick={onSubmit}
        disabled={!hasAnswer || isAnswered}
        fullWidth
        sx={{
          py: 1.5,
          fontWeight: 'bold',
        }}
      >
        {isAnswered ? 'Проверено' : 'Проверить'}
      </Button>

      {/* Кнопка навигации */}
      <Button
        variant={allQuestionsAnswered ? 'contained' : 'outlined'}
        color={allQuestionsAnswered ? 'secondary' : 'primary'}
        onClick={
          allQuestionsAnswered && canCompleteTest ? onComplete : onNextQuestion
        }
        disabled={isDisabled}
        fullWidth
        sx={{
          py: 1.5,
          fontWeight: 'bold',
        }}
      >
        {getButtonText()}
      </Button>
    </Stack>
  )
}

TestControls.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onComplete: PropTypes.func.isRequired,
  onNextQuestion: PropTypes.func.isRequired,
  hasAnswer: PropTypes.bool.isRequired,
  showFeedback: PropTypes.bool.isRequired,
  isAnswered: PropTypes.bool.isRequired,
  isLastQuestion: PropTypes.bool.isRequired,
  allQuestionsAnswered: PropTypes.bool.isRequired,
  isMobile: PropTypes.bool.isRequired,
}

export default memo(TestControls)

// import React from 'react'
// import { Button, Stack } from '@mui/material'
// import PropTypes from 'prop-types'

// function TestControls({
//   onSubmit,
//   onComplete,
//   hasAnswer,
//   showFeedback,
//   isAnswered,
//   isLastQuestion,
//   allQuestionsAnswered,
//   isMobile,
// }) {
//   const isCurrentQuestionChecked = isAnswered && showFeedback

//   const getNavigationButtonText = () => {
//     if (isLastQuestion) {
//       return allQuestionsAnswered ? 'Завершить тест' : 'Ответьте на все вопросы'
//     }
//     return 'Следующий вопрос'
//   }

//   let isNavigationButtonDisabled = false

//   if (isLastQuestion) {
//     const isComplete =
//       (isCurrentQuestionChecked && allQuestionsAnswered) || allQuestionsAnswered
//     isNavigationButtonDisabled = !isComplete
//   }

//   return (
//     <Stack
//       direction={isMobile ? 'column' : 'row'}
//       spacing={isMobile ? 1.5 : 2}
//       sx={{
//         mt: 2,
//         justifyContent: 'space-between',
//         width: '100%',
//       }}
//     >
//       {/* Кнопка "Проверить" */}
//       <Button
//         variant="contained"
//         color="primary"
//         onClick={onSubmit}
//         disabled={!hasAnswer || isAnswered}
//         fullWidth
//         sx={{
//           py: 1.5,
//           fontWeight: 'bold',
//         }}
//       >
//         {isAnswered ? 'Проверено' : 'Проверить'}
//       </Button>

//       {/* Кнопка навигации */}
//       <Button
//         variant={isLastQuestion ? 'contained' : 'outlined'}
//         color={isLastQuestion ? 'secondary' : 'primary'}
//         onClick={onComplete}
//         disabled={isNavigationButtonDisabled}
//         fullWidth
//         sx={{
//           py: 1.5,
//           fontWeight: 'bold',
//         }}
//       >
//         {getNavigationButtonText()}
//       </Button>
//     </Stack>
//   )
// }

// TestControls.propTypes = {
//   onSubmit: PropTypes.func.isRequired,
//   onComplete: PropTypes.func.isRequired,
//   hasAnswer: PropTypes.bool.isRequired,
//   showFeedback: PropTypes.bool.isRequired,
//   isAnswered: PropTypes.bool.isRequired,
//   isLastQuestion: PropTypes.bool.isRequired,
//   allQuestionsAnswered: PropTypes.bool.isRequired,
//   isMobile: PropTypes.bool.isRequired,
// }

// export default React.memo(TestControls)

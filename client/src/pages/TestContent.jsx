import React from 'react'
import { Box, Typography, Divider, useTheme } from '@mui/material'

import TabsWrapper from '@/components/TabsWrapper'

import QuestionView from './QuestionView'
import QuestionPagination from './QuestionPagination'
// Основное содержимое теста
function TestContent({
  isMobile,
  questions,
  currentQuestionIndex,
  answers,
  correctAnswers,
  showFeedback,
  handleOptionChange,
  handleTabChange,
  questionTabs,
}) {
  const theme = useTheme()

  if (!isMobile) {
    return (
      <>
        <Typography variant="subtitle1" gutterBottom>
          Вопрос
          {' '}
          {currentQuestionIndex + 1}
{' '}
из 
{' '}
          {questions.length}
        </Typography>
        <Divider sx={{ my: 2 }} />
        <TabsWrapper
          tabs={questionTabs}
          value={currentQuestionIndex}
          onChange={handleTabChange}
        />
      </>
    )
  }

  return (
    <>
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          width: '100%',
          minHeight: '60vh',
          mb: 3,
        }}
      >
        {questions.map((question, index) => (
          <Box
            key={question.id}
            sx={{
              position: 'absolute',
              width: '100%',
              transition: theme.transitions.create('transform'),
              transform: `translateX(${(index - currentQuestionIndex) * 100}%)`,
              ...(index === currentQuestionIndex && {
                position: 'relative',
              }),
            }}
          >
            <QuestionView
              question={question}
              selectedAnswer={answers[question.id] || null}
              showFeedback={index === currentQuestionIndex && showFeedback}
              disabled={correctAnswers[question.id] !== undefined}
              onChange={handleOptionChange}
            />
          </Box>
        ))}
      </Box>
      <QuestionPagination
        currentIndex={currentQuestionIndex}
        totalQuestions={questions.length}
      />
    </>
  )
}

export default React.memo(TestContent)

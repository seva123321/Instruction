/* eslint-disable arrow-body-style */
/* eslint-disable operator-linebreak */
import { useState, useEffect } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography,
  Box,
  useTheme,
  useMediaQuery,
  Button,
  CircularProgress,
} from '@mui/material'
import {
  DragHandle as DragHandleIcon,
  Check as CheckIcon,
  Close as CloseIcon,
} from '@mui/icons-material'

import { useLocation } from 'react-router-dom'

import {
  useGetGameQuizQuery,
  usePostGameQuizResultMutation,
} from '@/slices/gameApi'

import ButtonBack from '@/components/ButtonBack'
import SortableItem from '@/components/SortableItem'
import AlertGameResult from '@/components/AlertGameResult'

function DragAndDropList() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [showResults, setShowResults] = useState(false)
  const [attempts, setAttempts] = useState(2)
  const [isCorrect, setIsCorrect] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [items, setItems] = useState([])

  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const level = searchParams.get('level')
  const gameType = location.pathname.split('/').pop()
  const [postGameResultResult] = usePostGameQuizResultMutation()
  const { data: gameData, isLoading } = useGetGameQuizQuery({ gameType, level })

  useEffect(() => {
    if (gameData && gameData.length > 0) {
      setItems(gameData[0].items)
    }
  }, [gameData])

  // Получаем правильный порядок из serial_number по возрастанию
  const getCorrectOrder = () => {
    return [...items]
      .sort((a, b) => a.serial_number - b.serial_number)
      .map((item) => item.serial_number)
  }

  useEffect(() => {
    let hideTimer

    if (showResults) {
      hideTimer = setTimeout(() => {
        setShowResults(false)
      }, 5000)
    }

    return () => {
      if (hideTimer) {
        clearTimeout(hideTimer)
      }
    }
  }, [showResults])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: isMobile ? 10 : 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragStart = () => {
    setHasInteracted(true)
  }

  const handleDragEnd = (event) => {
    const { active, over } = event

    if (active.id !== over.id) {
      setItems((prevItems) => {
        const oldIndex = prevItems.findIndex(
          (item) => item.serial_number.toString() === active.id
        )
        const newIndex = prevItems.findIndex(
          (item) => item.serial_number.toString() === over.id
        )

        return arrayMove(prevItems, oldIndex, newIndex)
      })
    }
  }

  const sendResultsToServer = (correct) => {
    postGameResultResult({
      nameGame: 'medical_training',
      level,
      data: { result: correct },
    })
  }

  const checkResults = () => {
    if (attempts <= 0 || isSubmitted || !gameData) return

    const userOrder = items.map((item) => item.serial_number)
    const correctOrder = getCorrectOrder()
    const correct = JSON.stringify(userOrder) === JSON.stringify(correctOrder)

    setIsCorrect(correct)
    setShowResults(true)
    setHasInteracted(false)
    setAttempts((prev) => prev - 1)

    if (correct || attempts === 1) {
      sendResultsToServer(correct)
      setIsSubmitted(true)
    }
  }

  const resetTest = () => {
    if (attempts > 0 && !isSubmitted && gameData) {
      setShowResults(false)
      setItems(gameData[0].items)
      setHasInteracted(false)
    }
  }

  const isInCorrectPosition = (serialNumber, index) => {
    const correctOrder = getCorrectOrder()
    return correctOrder[index] === serialNumber
  }

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

  if (!gameData || gameData.length === 0) {
    return (
      <Box
        sx={{
          height: '70vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        Данные не загружены
      </Box>
    )
  }

  return (
    <Box
      sx={{
        maxWidth: 800,
        margin: 'auto',
        mt: 4,
        px: isMobile ? 2 : 3,
        pb: 4,
      }}
    >
      <ButtonBack />
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          fontSize: isMobile ? '1.5rem' : '2rem',
          fontWeight: 700,
          color: theme.palette.primary.main,
          mb: 2,
          lineHeight: 1.2,
          textAlign: 'center',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        задание
      </Typography>
      <Typography
        variant="h5"
        gutterBottom
        sx={{
          fontSize: isMobile ? '1.2rem' : '1.5rem',
          fontWeight: 600,
          color: theme.palette.text.primary,
          mb: 4,
          lineHeight: 1.4,
          textAlign: 'center',
          px: 2,
        }}
      >
        {gameData[0].title}
      </Typography>

      <Paper
        elevation={isMobile ? 1 : 2}
        sx={{
          borderRadius: 2,
          overflow: 'hidden',
          border: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper,
          mb: 3,
        }}
      >
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          onDragStart={handleDragStart}
        >
          <SortableContext
            items={items.map((item) => item.serial_number.toString())}
            strategy={verticalListSortingStrategy}
          >
            <List sx={{ p: 0 }}>
              {items.map((item, index) => (
                <SortableItem
                  key={item.serial_number}
                  id={item.serial_number.toString()}
                >
                  <ListItem
                    sx={{
                      backgroundColor: theme.palette.background.paper,
                      borderBottom: `1px solid ${theme.palette.divider}`,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: theme.palette.action.hover,
                      },
                      py: 2,
                      px: 3,
                      display: 'flex',
                      alignItems: 'flex-start',
                      position: 'relative',
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        flexDirection: 'column-reverse',
                        minWidth: 40,
                      }}
                    >
                      <DragHandleIcon
                        sx={{
                          color: theme.palette.action.active,
                          cursor: 'grab',
                          '&:active': {
                            cursor: 'grabbing',
                          },
                          mr: 1,
                        }}
                      />
                      <Typography
                        variant="body2"
                        sx={{
                          color: theme.palette.text.secondary,
                          fontWeight: 500,
                          minWidth: 24,
                        }}
                      >
                        {index + 1}
                      </Typography>
                    </Box>
                    <ListItemText
                      primary={item.text}
                      slotProps={{
                        variant: 'body1',
                        sx: {
                          fontSize: isMobile ? '0.95rem' : '1rem',
                          fontWeight: 400,
                          lineHeight: 1.5,
                        },
                      }}
                      sx={{ ml: 1 }}
                    />
                    {showResults && !hasInteracted && (
                      <Box
                        sx={{
                          position: 'absolute',
                          right: 16,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: isInCorrectPosition(item.serial_number, index)
                            ? theme.palette.success.main
                            : theme.palette.error.main,
                        }}
                      >
                        {isInCorrectPosition(item.serial_number, index) ? (
                          <CheckIcon />
                        ) : (
                          <CloseIcon />
                        )}
                      </Box>
                    )}
                  </ListItem>
                </SortableItem>
              ))}
            </List>
          </SortableContext>
        </DndContext>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
        <Button
          variant="contained"
          onClick={checkResults}
          disabled={attempts <= 0 || isSubmitted}
          size="large"
          sx={{
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 500,
            px: 4,
            py: 1.5,
          }}
        >
          {attempts > 0
            ? `Проверить результат (${attempts} попытки)`
            : 'Попытки закончились'}
        </Button>

        {showResults && attempts > 0 && !isSubmitted && (
          <Button
            variant="outlined"
            onClick={resetTest}
            size="large"
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 500,
              px: 4,
              py: 1.5,
            }}
          >
            Попробовать снова
          </Button>
        )}
      </Box>

      {isMobile && (
        <Typography
          variant="body2"
          sx={{
            mt: 2,
            textAlign: 'center',
            color: theme.palette.text.secondary,
            fontStyle: 'italic',
          }}
        >
          👆 Нажмите и удерживайте элемент для перемещения
        </Typography>
      )}
      <AlertGameResult
        result={isCorrect ? 'win' : 'lose'}
        showResult={showResults}
      />
    </Box>
  )
}

export default DragAndDropList

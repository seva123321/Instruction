/* eslint-disable arrow-body-style */
/* eslint-disable operator-linebreak */
import { useState, useRef, useEffect } from 'react'
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
} from '@mui/material'
import {
  DragHandle as DragHandleIcon,
  Check as CheckIcon,
  Close as CloseIcon,
} from '@mui/icons-material'

import ButtonBack from '@/components/ButtonBack'
import SortableItem from '@/components/SortableItem'
import AlertGameResult from '@/components/AlertGameResult'

const dataDefault = {
  title:
    'Общая последовательность действий на месте происшествия с наличием пострадавших',
  items: [
    {
      id: '1',
      text: 'Провести оценку обстановки и обеспечить безопасные условия для оказания первой помощи',
    },
    { id: '2', text: 'Определить наличие сознания у пострадавшего' },
    {
      id: '3',
      text: 'Восстановить проходимость дыхательных путей и определить признаки жизни',
    },
    {
      id: '4',
      text: 'Вызвать скорую медицинскую помощь, другие специальные службы',
    },
    {
      id: '5',
      text: 'Начать проведение сердечно-легочной реанимации',
    },
    {
      id: '6',
      text: 'При появлении (или наличии) признаков жизни выполнить мероприятия по поддержанию проходимости дыхательных путей',
    },
    {
      id: '7',
      text: 'Провести обзорный осмотр пострадавшего и осуществить мероприятия по временной остановке наружного кровотечения',
    },
    {
      id: '8',
      text: 'Провести подробный осмотр пострадавшего в целях выявления признаков травм, отравлений и других состояний, угрожающих его жизни и здоровью, осуществить вызов скорой медицинской помощи (если она не была вызвана ранее)',
    },
    {
      id: '9',
      text: 'Придать пострадавшему оптимальное положение тела',
    },
    {
      id: '10',
      text: 'Постоянно контролировать состояние пострадавшего и оказывать психологическую поддержку',
    },
    {
      id: '11',
      text: 'Передать пострадавшего бригаде скорой медицинской помощи',
    },
  ],
}

const serverCorrectOrder = [
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  '11',
]

function DragAndDropList() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [data, setData] = useState(dataDefault)
  const [showResults, setShowResults] = useState(false)
  const [attempts, setAttempts] = useState(2) // Начальное количество попыток
  const [isCorrect, setIsCorrect] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false) // Флаг отправки результата
  const initialOrder = useRef(dataDefault.items.map((item) => item.id))

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
      setData((prevData) => {
        const oldIndex = prevData.items.findIndex(
          (item) => item.id === active.id
        )
        const newIndex = prevData.items.findIndex((item) => item.id === over.id)

        return {
          ...prevData,
          items: arrayMove(prevData.items, oldIndex, newIndex),
        }
      })
    }
  }

  const sendResultsToServer = (isCorrect) => {
    // Здесь реализация отправки результатов на сервер
    console.log('Результат отправлен на сервер:', isCorrect)
    // Ваша логика API запроса...
  }

  const checkResults = () => {
    if (attempts <= 0 || isSubmitted) return

    const userOrder = data.items.map((item) => item.id)
    const correct =
      JSON.stringify(userOrder) === JSON.stringify(serverCorrectOrder)

    setIsCorrect(correct)
    setShowResults(true)
    setHasInteracted(false)
    setAttempts((prev) => prev - 1)

    // Отправляем результат на сервер если:
    // 1. Ответ правильный
    // 2. Это последняя попытка
    if (correct || attempts === 1) {
      sendResultsToServer(correct)
      setIsSubmitted(true)
    }
  }

  const resetTest = () => {
    if (attempts > 0 && !isSubmitted) {
      setShowResults(false)
      setData(dataDefault)
      setHasInteracted(false)
    }
  }

  const isInOriginalPosition = (itemId, index) => {
    return initialOrder.current[index] === itemId
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
        {data.title}
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
            items={data.items}
            strategy={verticalListSortingStrategy}
          >
            <List sx={{ p: 0 }}>
              {data.items.map((item, index) => (
                <SortableItem key={item.id} id={item.id}>
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
                          color: isInOriginalPosition(item.id, index)
                            ? theme.palette.success.main
                            : theme.palette.error.main,
                        }}
                      >
                        {isInOriginalPosition(item.id, index) ? (
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

/* eslint-disable operator-linebreak */
/* eslint-disable no-nested-ternary */
import { useState, useEffect, useMemo } from 'react'
import {
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Tooltip,
  Alert,
  styled,
  useMediaQuery,
} from '@mui/material'
// import StarIcon from '@mui/icons-material/Star'
import { useNavigate } from 'react-router-dom'
import {
  Construction as ConstructionIcon,
  Bolt as BoltIcon,
  LocalFireDepartment as LocalFireDepartmentIcon,
  Factory as FactoryIcon,
} from '@mui/icons-material'

import KnowBaseHeader from '@/components/KnowBaseHeader'
// import { useGetGameQuery } from '@/slices/gameApi'
import useGame from '@/hook/useGame'

// Стилизованные компоненты
const IndustrialBadgeWrapper = styled(Box)(({ theme }) => ({
  position: 'relative',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-3px)',
    '& .MuiBadge-badge': {
      boxShadow: theme.shadows[4],
    },
  },
}))

const BadgeLabel = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: -8,
  right: 12,
  backgroundColor: theme.palette.error.main,
  color: 'white',
  padding: '4px 12px',
  borderRadius: '16px',
  fontSize: '0.75rem',
  fontWeight: 'bold',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  zIndex: 1,
  '&.technical': {
    backgroundColor: theme.palette.primary.main,
  },
}))

// Обновленный IndustrialCard с анимацией
const IndustrialCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: '16px',
  background: 'linear-gradient(145deg, #f5f5f5, #e0e0e0)',
  boxShadow: '5px 5px 15px rgba(46, 137, 215, 0.38)',
  cursor: 'pointer',
  transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: `
      0 6px 20px rgba(42, 109, 177, 0.72),
      0 3px 10px rgba(37, 57, 231, 0.2)
    `,
    '& $GameIconWrapper': {
      transform: 'rotate(5deg) scale(1.05)',
    },
  },
}))

// @TODO
// const GameLink = styled(Link)(({ theme }) => ({
//   display: 'block',
//   margin: '8px 0',
//   color: theme.palette.primary.main,
//   textDecoration: 'none',
//   fontWeight: 500,
//   '&:hover': {
//     textDecoration: 'underline',
//   },
// }))

const GameIconWrapper = styled(Box)(() => ({
  width: 80,
  height: 80,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto 20px',
  color: 'white',
  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
  transition: 'all 0.3s ease',
}))

// // Компонент кликабельного рейтинга
// function LevelRating() {
//   return (
//     <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, mb: 2 }}>
//       <Typography variant="body2" color="text.secondary">
//         Уровни:
//       </Typography>
//       {[1, 2, 3].map((level) => (
//         <Link
//           key={level}
//           to={`fire_safety?level=${level}`}
//           style={{ display: 'flex' }}
//         >
//           <Tooltip title={`${level} уровень`}>
//             <StarIcon
//               sx={{
//                 color: '#ffb400',
//                 fontSize: '1.5rem',
//                 '&:hover': { transform: 'scale(1.2)' },
//                 transition: 'transform 0.2s',
//               }}
//             />
//           </Tooltip>
//         </Link>
//       ))}
//     </Box>
//   )
// }

function GamePage() {
  const navigate = useNavigate()
  const [timeToReset, setTimeToReset] = useState('')
  const [message, setMessage] = useState(null)
  const [showAlert, setShowAlert] = useState(false)
  const { data: megaPowers, isLoading, isError, error } = useGame()
  const isMobile = useMediaQuery('(max-width:600px)')

  // Расчет времени до обновления мегасил
  useEffect(() => {
    if (
      !megaPowers ||
      megaPowers.hours === undefined ||
      megaPowers.minutes === undefined
    ) {
      return
    }

    const calculateTimeToReset = () => {
      const now = new Date()
      const mskTime = new Date(
        now.toLocaleString('en-US', { timeZone: 'Europe/Moscow' })
      )

      // Устанавливаем время сброса по Москве
      const resetTime = new Date(mskTime)
      resetTime.setHours(megaPowers.hours, megaPowers.minutes, 0, 0)

      // Если текущее время больше времени сброса, устанавливаем на следующий день
      if (mskTime > resetTime) {
        resetTime.setDate(resetTime.getDate() + 1)
      }

      const diff = resetTime - mskTime
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

      setTimeToReset(
        `${String(hours).padStart(2, '0')}ч ${String(minutes).padStart(2, '0')}м`
      )
    }

    calculateTimeToReset()
    const timer = setInterval(calculateTimeToReset, 60000) // Обновляем каждую минуту

    // eslint-disable-next-line consistent-return
    return () => clearInterval(timer)
  }, [megaPowers])

  // Эффект для автоматического скрытия сообщения
  // eslint-disable-next-line consistent-return
  useEffect(() => {
    if (showAlert) {
      const timer = setTimeout(() => setShowAlert(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [showAlert])

  // Значения по умолчанию
  const {
    remaining_mega_powers: remainingMegaPowers = 0,
    total_daily_mega_powers: totalDailyMegaPowers = 0,
  } = megaPowers || {}

  // Отрисовка молний (мегасил)
  const renderMegaPowerBolts = useMemo(() => {
    const bolts = []

    // Активные мегасилы
    for (let i = 0; i < remainingMegaPowers; i++) {
      bolts.push(
        <BoltIcon key={`active-${i}`} color="warning" sx={{ fontSize: 40 }} />
      )
    }

    // Использованные мегасилы
    for (let i = 0; i < totalDailyMegaPowers - remainingMegaPowers; i++) {
      bolts.push(
        <BoltIcon key={`used-${i}`} sx={{ fontSize: 40, color: '#e0e0e0' }} />
      )
    }

    return bolts
  }, [remainingMegaPowers, totalDailyMegaPowers])

  // Обработчик клика по игре
  const handleGameClick = (gamePath) => {
    if (!megaPowers || megaPowers.remaining_mega_powers <= 0) {
      setMessage({
        text: `Вы израсходовали все мегасилы на сегодня!\nНовые мегасилы появятся через: ${timeToReset}.`,
        type: 'warning',
      })
      setShowAlert(true)
      return
    }
    if (
      gamePath.includes('fire_safety') &&
      megaPowers.remaining_mega_powers <= 1
    ) {
      setMessage({
        text: `Для данной игры необходимо две мегасилы!\nНовые мегасилы появятся через: ${timeToReset}.`,
        type: 'warning',
      })
      setShowAlert(true)
      return
    }

    navigate(gamePath)
  }

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress size={60} color="warning" />
      </Box>
    )
  }

  if (isError) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          flexDirection: 'column',
        }}
      >
        <Typography color="error" sx={{ mb: 2 }}>
          {`Ошибка: ${error?.message || 'Неизвестная ошибка'}`}
        </Typography>
        <Button
          variant="contained"
          color="warning"
          onClick={() => window.location.reload()}
        >
          Попробовать снова
        </Button>
      </Box>
    )
  }

  return (
    <Box
      sx={{
        background: 'linear-gradient(to bottom, #f5f7fa, #d6ddf9)',
        minHeight: '100vh',
        p: '3rem 0',
      }}
    >
      <KnowBaseHeader title="ЦЕХ ИГР" />

      <Box
        sx={{
          maxWidth: '800px',
          m: '0 auto',
          textAlign: 'center',
        }}
      >
        <Typography
          variant="h5"
          sx={{
            mb: 3,
            color: '#455a64',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
          }}
        >
          <LocalFireDepartmentIcon color="warning" />
          ТВОИ МЕГАСИЛЫ НА СЕГОДНЯ
          <LocalFireDepartmentIcon color="warning" />
        </Typography>

        {showAlert && (
          <Box
            sx={{
              position: 'fixed',
              top: 20,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 9999,
              width: '100%',
              maxWidth: '600px',
            }}
          >
            <Alert
              severity={message?.type || 'warning'}
              onClose={() => setShowAlert(false)}
            >
              {message?.text || ''}
            </Alert>
          </Box>
        )}

        <Tooltip
          title={`Осталось ${remainingMegaPowers} из ${totalDailyMegaPowers} мегасил`}
          arrow
        >
          <Box
            sx={{
              background: 'white',
              borderRadius: '12px',
              p: isMobile ? 1 : 2,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              minWidth: '120px',
              display: 'inline-block',
              mb: 2,
            }}
          >
            {renderMegaPowerBolts}
            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
              {`${remainingMegaPowers}/${totalDailyMegaPowers}`}
            </Typography>

            <Box
              sx={{
                mt: 1,
                p: 1,
                background: 'rgba(255, 235, 59, 0.2)',
                borderRadius: '8px',
                display: 'inline-block',
              }}
            >
              <Typography variant="caption">
                {`Обновление через: ${timeToReset || '00ч 00м'}`}
              </Typography>
            </Box>
          </Box>
        </Tooltip>

        <Typography
          variant="h6"
          sx={{
            mb: 3,
            mt: 3,
            color: '#37474f',
            fontWeight: 'bold',
            textTransform: 'uppercase',
          }}
        >
          Выбери свою смену:
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            gap: 4,
            p: 2,
          }}
        >
          {/* Первая карточка - Свайпер */}
          <IndustrialBadgeWrapper>
            <BadgeLabel>Горячая смена</BadgeLabel>
            <IndustrialCard onClick={() => handleGameClick('swiper')}>
              <GameIconWrapper
                sx={{
                  background: 'linear-gradient(145deg, #ff9800, #f57c00)',
                }}
              >
                <FactoryIcon sx={{ fontSize: 40 }} />
              </GameIconWrapper>

              <Typography
                variant="h6"
                sx={{
                  mb: 1,
                  fontWeight: 'bold',
                  textAlign: 'center',
                  background: 'linear-gradient(145deg, #ff9800, #f57c00)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 2px 4px rgba(25, 118, 210, 0.2)',
                }}
              >
                СВАЙПЕР
              </Typography>
              <Typography
                variant="h5"
                color="text.secondary"
                sx={{
                  mb: 2,
                  textAlign: 'center',
                  minHeight: '3em',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                Быстрые ответы на производственные вопросы
              </Typography>
              <Box sx={{ mt: 'auto' }}>
                <Button
                  variant="contained"
                  color="warning"
                  startIcon={<ConstructionIcon />}
                  fullWidth
                  sx={{
                    bgcolor: '#ff9800',
                    '&:hover': { bgcolor: '#f57c00' },
                    fontWeight: 'bold',
                    py: 1.5,
                  }}
                >
                  В цех
                </Button>
              </Box>
            </IndustrialCard>
          </IndustrialBadgeWrapper>

          {/* Вторая карточка - Квиз */}
          {/* <IndustrialBadgeWrapper>
            <BadgeLabel className="technical">Технический отдел</BadgeLabel>
            <IndustrialCard>
              <GameIconWrapper
                sx={{
                  background: 'linear-gradient(145deg, #2196f3, #1976d2)',
                }}
              >
                <BoltIcon sx={{ fontSize: 40 }} />
              </GameIconWrapper>
              <Typography
                variant="h6"
                sx={{ mb: 1, fontWeight: 'bold', textAlign: 'center' }}
              >
                ТЕМАТИЧЕСКИЙ КВИЗ
              </Typography>

              <Box sx={{ mb: 2 }}>
                <GameLink to="fire_safety?level=1">
                  <Box display="flex" alignItems="center">
                    <LocalFireDepartmentIcon color="error" sx={{ mr: 1 }} />
                    Пожарная безопасность
                  </Box>
                </GameLink>
                <LevelRating />
              </Box>

              <Box sx={{ mt: 'auto' }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<BoltIcon />}
                  fullWidth
                  sx={{
                    fontWeight: 'bold',
                    py: 1.5,
                    background: 'linear-gradient(145deg, #2196f3, #1976d2)',
                  }}
                >
                  К испытаниям
                </Button>
              </Box>
            </IndustrialCard>
          </IndustrialBadgeWrapper> */}
          {/* Вторая карточка - Квиз */}
          <IndustrialBadgeWrapper>
            <BadgeLabel className="technical">Технический отдел</BadgeLabel>
            <IndustrialCard>
              <GameIconWrapper
                sx={{
                  background: 'linear-gradient(145deg, #2196f3, #1976d2)',
                }}
              >
                <BoltIcon sx={{ fontSize: 40 }} />
              </GameIconWrapper>
              <Typography
                variant="h6"
                sx={{
                  mb: 1,
                  fontWeight: 'bold',
                  textAlign: 'center',
                  background: 'linear-gradient(to right, #1976d2, #2196f3)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 2px 4px rgba(25, 118, 210, 0.2)',
                }}
              >
                ТЕМАТИЧЕСКИЙ КВИЗ
              </Typography>

              <Box
                sx={{
                  mb: 2,
                  p: 2,
                  backgroundColor: 'rgba(25, 118, 210, 0.05)',
                  borderRadius: '12px',
                  border: '1px solid rgba(25, 118, 210, 0.1)',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: '8px 12px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(244, 67, 54, 0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(244, 67, 54, 0.2)',
                      transform: 'translateX(5px)',
                    },
                  }}
                >
                  <LocalFireDepartmentIcon
                    color="error"
                    sx={{
                      mr: 1,
                      fontSize: '1.2rem',
                      filter: 'drop-shadow(0 2px 4px rgba(244, 67, 54, 0.3))',
                    }}
                  />
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 600,
                      color: (theme) => theme.palette.error.dark,
                    }}
                  >
                    Пожарная безопасность
                  </Typography>
                </Box>
                {/* <GameLink
                  to="fire_safety?level=1"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: '8px 12px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(244, 67, 54, 0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(244, 67, 54, 0.2)',
                      transform: 'translateX(5px)',
                    },
                  }}
                >
                  <LocalFireDepartmentIcon
                    color="error"
                    sx={{
                      mr: 1,
                      fontSize: '1.2rem',
                      filter: 'drop-shadow(0 2px 4px rgba(244, 67, 54, 0.3))',
                    }}
                  />
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 600,
                      color: (theme) => theme.palette.error.dark,
                    }}
                  >
                    Пожарная безопасность
                  </Typography>
                </GameLink> */}

                <Box
                  sx={{
                    mt: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'text.secondary',
                      textAlign: 'center',
                      mb: 1,
                    }}
                  >
                    Выберите уровень сложности:
                  </Typography>

                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-around',
                      gap: 1,
                    }}
                  >
                    {[
                      { level: 1, caption: 'Легкий' },
                      { level: 2, caption: 'Средний' },
                      { level: 3, caption: 'Сложный' },
                    ].map((item) => (
                      <Tooltip
                        key={item.level}
                        title={`${item.level} уровень сложности`}
                        arrow
                      >
                        <Button
                          onClick={() =>
                            handleGameClick(`fire_safety?level=${item.level}`)
                          }
                          style={{
                            textDecoration: 'none',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: '50%',
                              backgroundColor:
                                item.level === 1
                                  ? 'rgba(76, 175, 80, 0.2)'
                                  : item.level === 2
                                    ? 'rgba(255, 152, 0, 0.2)'
                                    : 'rgba(244, 67, 54, 0.2)',
                              border: `2px solid ${
                                item.level === 1
                                  ? '#4CAF50'
                                  : item.level === 2
                                    ? '#FF9800'
                                    : '#F44336'
                              }`,
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                transform: 'scale(1.1)',
                                boxShadow: `0 0 12px ${
                                  item.level === 1
                                    ? 'rgba(76, 175, 80, 0.4)'
                                    : item.level === 2
                                      ? 'rgba(255, 152, 0, 0.4)'
                                      : 'rgba(244, 67, 54, 0.4)'
                                }`,
                              },
                            }}
                          >
                            <Typography
                              variant="body1"
                              sx={{
                                fontWeight: 'bold',
                                color:
                                  item.level === 1
                                    ? '#4CAF50'
                                    : item.level === 2
                                      ? '#FF9800'
                                      : '#F44336',
                              }}
                            >
                              {item.level}
                            </Typography>
                          </Box>
                          <Typography
                            variant="caption"
                            sx={{
                              color:
                                item.level === 1
                                  ? '#4CAF50'
                                  : item.level === 2
                                    ? '#FF9800'
                                    : '#F44336',
                              fontWeight: 500,
                            }}
                          >
                            {item.caption}
                          </Typography>
                        </Button>
                      </Tooltip>
                    ))}
                  </Box>
                </Box>
              </Box>
              {/* 
              <Box sx={{ mt: 'auto' }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={
                    <BoltIcon
                      sx={{
                        filter:
                          'drop-shadow(0 2px 4px rgba(33, 150, 243, 0.5))',
                      }}
                    />
                  }
                  fullWidth
                  sx={{
                    fontWeight: 'bold',
                    py: 1.5,
                    background: 'linear-gradient(145deg, #2196f3, #1976d2)',
                    boxShadow: '0 4px 8px rgba(25, 118, 210, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(145deg, #1976d2, #2196f3)',
                      boxShadow: '0 6px 12px rgba(25, 118, 210, 0.4)',
                    },
                  }}
                >
                  К испытаниям
                </Button>
              </Box> */}
            </IndustrialCard>
          </IndustrialBadgeWrapper>
        </Box>

        {megaPowers && (
          <Box
            sx={{
              mt: 4,
              p: 2,
              background: 'rgba(255, 255, 255, 0.7)',
              borderRadius: '12px',
              borderLeft: '4px solid #ff9800',
            }}
          >
            <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
              {`Мегасилы обновляются в ${megaPowers.hours} ч. ${megaPowers.minutes} мин. по Москве. Используй их с умом!`}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default GamePage

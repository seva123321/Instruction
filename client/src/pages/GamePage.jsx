import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Button,
  Paper,
  Badge,
  CircularProgress,
  Tooltip,
  Alert,
  styled,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
// import { styled } from '@mui/system'
import ConstructionIcon from '@mui/icons-material/Construction'
import BoltIcon from '@mui/icons-material/Bolt'
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment'
import FactoryIcon from '@mui/icons-material/Factory'

import KnowBaseHeader from '@/components/KnowBaseHeader'

// Стилизованные компоненты
const IndustrialCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  margin: theme.spacing(2),
  borderRadius: '16px',
  background: 'linear-gradient(145deg, #f5f5f5, #e0e0e0)',
  boxShadow: '5px 5px 15px #2e89d761, -5px -5px 15px #4555ed33',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow:
      '8px 8px 20px rgba(42, 109, 177, 0.72), -8px -8px 20px rgba(37, 57, 231, 0.2)',
  },
}))

const IndustrialBadge = styled(Badge)(() => ({
  '& .MuiBadge-badge': {
    right: 98,
    top: 32,
    padding: '0 8px',
    backgroundColor: '#ff5722',
    color: 'white',
    fontWeight: 'bold',
    fontSize: '0.8rem',
  },
}))

const GameIconWrapper = styled(Box)(() => ({
  width: 80,
  height: 80,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto 20px',
  background: 'linear-gradient(145deg, #ff9800, #f57c00)',
  color: 'white',
  boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
}))

function GamePage() {
  const navigate = useNavigate()
  const [megaPowers, setMegaPowers] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [timeToReset, setTimeToReset] = useState('')
  const [message, setMessage] = useState()
  const [showAlert, setShowAlert] = useState(false)
  // Загрузка данных с сервера
  useEffect(() => {
    const fetchMegaPowers = async () => {
      try {
        setLoading(true)

        // Проверяем текущую дату
        const today = new Date().toDateString()
        const lastUpdatedDate = localStorage.getItem(
          'megapowersLastUpdatedDate'
        )

        // Если последнее обновление было не сегодня - очищаем кэш
        if (lastUpdatedDate !== today) {
          localStorage.removeItem('megapowersData')
          localStorage.removeItem('megapowersLastUpdated')
        }

        // Проверяем кэш (только если обновление было сегодня)
        const lastUpdated = localStorage.getItem('megapowersLastUpdated')
        if (
          lastUpdated &&
          Date.now() - lastUpdated < 5 * 60 * 1000 &&
          lastUpdatedDate === today
        ) {
          const cached = localStorage.getItem('megapowersData')
          if (cached) {
            setMegaPowers(JSON.parse(cached))
            setLoading(false)
            return
          }
        }
        // ДАННЫЕ с СЕРВЕРА
        // Тестовые данные (замените на реальный запрос) !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        const dataTest = {
          remainingMegaPowers: 5,
          totalDailyMegaPowers: 8,
          games: {
            swiper: {
              lastPlayed: new Date().toISOString(),
              playsToday: 3,
            },
            quiz: {
              lastPlayed: new Date().toISOString(),
              playsToday: 2,
            },
          },
          lastUpdated: new Date().toISOString(), // Добавляем метку времени с сервера
        }

        // const response = await fetch('/api/user/megapowers');
        // if (!response.ok) throw new Error('Ошибка загрузки мегасил');
        // const data = await response.json();
        const data = dataTest

        setMegaPowers(data)

        // Кэшируем данные с указанием даты
        localStorage.setItem('megapowersData', JSON.stringify(data))
        localStorage.setItem('megapowersLastUpdated', Date.now())
        localStorage.setItem('megapowersLastUpdatedDate', today)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchMegaPowers()

    // Проверяем обновление каждую минуту (на случай смены даты)
    const interval = setInterval(fetchMegaPowers, 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  // Расчет времени до обновления мегасил
  useEffect(() => {
    if (!megaPowers) return

    const calculateTimeToReset = () => {
      const now = new Date()
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(0, 0, 0, 0) // Обновление в полночь

      const diff = tomorrow - now
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

      setTimeToReset(`${hours}ч ${minutes}м`)
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
      const timer = setTimeout(() => {
        setShowAlert(false)
      }, 5000) // Скрываем сообщение через 5 секунд
      return () => clearTimeout(timer)
    }
  }, [showAlert])

  // Отрисовка молний (мегасил)
  const renderMegaPowerBolts = () => {
    if (!megaPowers) return null

    const bolts = []
    const { remainingMegaPowers, totalDailyMegaPowers } = megaPowers

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
  }

  // Обработчик клика по игре
  const handleGameClick = (gamePath) => {
    if (!megaPowers || megaPowers.remainingMegaPowers <= 0) {
      setMessage({
        text: `Вы израсходовали все мегасилы на сегодня!\nНовые мегасилы появятся через: ${timeToReset}`,
        type: 'warning',
      })
      setShowAlert(true)
      return
    }
    navigate(gamePath)
  }

  if (loading) {
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

  if (error) {
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
          {`Ошибка: #${error}`}
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
          margin: '0 auto',
          px: 2,
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
            <Alert severity="warning" onClose={() => setShowAlert(false)}>
              {message.text}
            </Alert>
          </Box>
        )}

        <Tooltip
          title={`Осталось ${megaPowers?.remainingMegaPowers || 0} из ${megaPowers?.totalDailyMegaPowers || 0} мегасил`}
          arrow
        >
          <Box
            sx={{
              background: 'white',
              borderRadius: '12px',
              p: 2,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              minWidth: '120px',
              display: 'inline-block',
              mb: 2,
            }}
          >
            {renderMegaPowerBolts()}
            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
              {`${megaPowers?.remainingMegaPowers || 0}/${megaPowers?.totalDailyMegaPowers || 0}`}
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
                {`Обновление через: ${timeToReset}`}
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
            gap: 3,
          }}
        >
          <IndustrialBadge badgeContent="ГОРЯЧАЯ СМЕНА" color="error">
            <IndustrialCard onClick={() => handleGameClick('swiper')}>
              <GameIconWrapper>
                <FactoryIcon sx={{ fontSize: 40 }} />
              </GameIconWrapper>
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
                СВАЙПЕР
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Быстрые ответы на производственные вопросы
              </Typography>
              <Button
                variant="contained"
                color="warning"
                startIcon={<ConstructionIcon />}
                fullWidth
              >
                В цех
              </Button>
            </IndustrialCard>
          </IndustrialBadge>

          <IndustrialBadge badgeContent="ТЕХНИЧЕСКИЙ ОТДЕЛ">
            <IndustrialCard onClick={() => handleGameClick('quiz')}>
              <GameIconWrapper
                sx={{ background: 'linear-gradient(145deg, #2196f3, #1976d2)' }}
              >
                <BoltIcon sx={{ fontSize: 40 }} />
              </GameIconWrapper>
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
                ТЕМАТИЧЕСКИЙ КВИЗ
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Проверь свои знания в тематической викторине
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<BoltIcon />}
                fullWidth
              >
                К испытаниям
              </Button>
            </IndustrialCard>
          </IndustrialBadge>
        </Box>

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
            &quot;Мегасилы обновляются в полночь. Используй их с умом!&quot;
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

export default GamePage
// import React from 'react'
// import { Box } from '@mui/material'
// import KnowBaseHeader from '@/components/KnowBaseHeader'
// import SwiperGame from './SwiperGame'
// import { useNavigate } from 'react-router-dom'

// const GamePage = () => {
//   const navigate = useNavigate()
//   return (
//     <Box>
//       <KnowBaseHeader title="Игры" />
//       <Box onClick={() => navigate('/game/swiper/')}>Свайпер</Box>
//       <Box onClick={() => navigate('/game/qwiz/')}>Квиз</Box>
//     </Box>
//   )
// }

// export default GamePage

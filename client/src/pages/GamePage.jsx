import { useState, useEffect, useMemo, useCallback, memo } from 'react'
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Tooltip,
  Alert,
  useMediaQuery,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import {
  Construction as ConstructionIcon,
  Bolt as BoltIcon,
  LocalFireDepartment as LocalFireDepartmentIcon,
  Factory as FactoryIcon,
  MedicalServices as MedicalServicesIcon,
} from '@mui/icons-material'

import useGame from '@/hook/useGame'
import KnowBaseHeader from '@/components/KnowBaseHeader'
import AccordionQuiz from '@/components/AccordionQuiz'
import GameCard from '@/components/GameCard'

function GamePage() {
  const navigate = useNavigate()
  const isMobile = useMediaQuery('(max-width:600px)')
  const { data: megaPowers, isLoading, isError, error } = useGame()

  const [timeToReset, setTimeToReset] = useState('')
  const [message, setMessage] = useState(null)
  const [showAlert, setShowAlert] = useState(false)
  const [expanded, setExpanded] = useState('')

  // Мемоизированные значения
  const {
    remaining_mega_powers: remainingMegaPowers = 0,
    total_daily_mega_powers: totalDailyMegaPowers = 0,
  } = megaPowers || {}

  // Обработчик клика по игре
  const handleGameClick = useCallback(
    (gamePath) => {
      if (!megaPowers || remainingMegaPowers <= 0) {
        setMessage({
          text: `Вы израсходовали все мегасилы на сегодня!\nНовые мегасилы появятся через: ${timeToReset}.`,
          type: 'warning',
        })
        setShowAlert(true)
        return
      }

      if (gamePath.includes('fire_safety') && remainingMegaPowers <= 1) {
        setMessage({
          text: `Для данной игры необходимо две мегасилы!\nНовые мегасилы появятся через: ${timeToReset}.`,
          type: 'warning',
        })
        setShowAlert(true)
        return
      }

      navigate(gamePath)
    },
    [megaPowers, remainingMegaPowers, timeToReset, navigate]
  )

  // Расчет времени до обновления
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
      const resetTime = new Date(mskTime)

      resetTime.setHours(megaPowers.hours, megaPowers.minutes, 0, 0)
      if (mskTime > resetTime) resetTime.setDate(resetTime.getDate() + 1)

      const diff = resetTime - mskTime
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

      setTimeToReset(
        `${String(hours).padStart(2, '0')}ч ${String(minutes).padStart(2, '0')}м`
      )
    }

    calculateTimeToReset()
    const timer = setInterval(calculateTimeToReset, 60000)
    // eslint-disable-next-line consistent-return
    return () => clearInterval(timer)
  }, [megaPowers])

  // Автоматическое скрытие алерта
  // eslint-disable-next-line consistent-return
  useEffect(() => {
    if (showAlert) {
      const timer = setTimeout(() => setShowAlert(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [showAlert])

  // Мемоизированные молнии (мегасилы)
  const renderMegaPowerBolts = useMemo(() => {
    const bolts = []
    for (let i = 0; i < remainingMegaPowers; i++) {
      bolts.push(
        <BoltIcon key={`active-${i}`} color="warning" sx={{ fontSize: 40 }} />
      )
    }
    for (let i = 0; i < totalDailyMegaPowers - remainingMegaPowers; i++) {
      bolts.push(
        <BoltIcon key={`used-${i}`} sx={{ fontSize: 40, color: '#e0e0e0' }} />
      )
    }
    return bolts
  }, [remainingMegaPowers, totalDailyMegaPowers])

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

      <Box sx={{ maxWidth: '800px', m: '0 auto', textAlign: 'center' }}>
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
              ml: 2,
              mr: 2,
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
              <Typography variant="caption">{`Обновление через: ${timeToReset || '00ч 00м'}`}</Typography>
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
          <GameCard
            header="СВАЙПЕР"
            badgeTitle="Горячая смена"
            mainIcon={<FactoryIcon sx={{ fontSize: 40 }} />}
            background="linear-gradient(145deg, #ff9800, #f57c00)"
            onGameClick={() => handleGameClick('swiper')}
          >
            <Typography
              variant="h5"
              color="text.secondary"
              sx={{
                mb: 2,
                mt: 'auto',
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
          </GameCard>

          <GameCard
            header="ТЕМАТИЧЕСКИЙ КВИЗ"
            badgeTitle="Технический отдел"
            mainIcon={<BoltIcon sx={{ fontSize: 40 }} />}
            background="linear-gradient(145deg, #2196f3, #1976d2)"
          >
            <AccordionQuiz
              subtitle="Пожарная безопасность"
              expandedAcc="fire"
              expanded={expanded}
              onChangeEpended={setExpanded}
              onNavigateClick={
                (level) => handleGameClick(`fire_safety?level=${level}`)
                // eslint-disable-next-line react/jsx-curly-newline
              }
            >
              <LocalFireDepartmentIcon
                color="error"
                sx={{ mr: 1, fontSize: '1.2rem' }}
              />
            </AccordionQuiz>

            <AccordionQuiz
              subtitle="Медицинская подготовка"
              expandedAcc="medical"
              expanded={expanded}
              onChangeEpended={setExpanded}
              onNavigateClick={
                (level) => handleGameClick(`medical_training?level=${level}`)
                // eslint-disable-next-line react/jsx-curly-newline
              }
            >
              <MedicalServicesIcon
                color="primary"
                sx={{ mr: 1, fontSize: '1.2rem' }}
              />
            </AccordionQuiz>
          </GameCard>
        </Box>

        {megaPowers && (
          <Box
            sx={{
              mt: 4,
              ml: 2,
              mr: 2,
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

export default memo(GamePage)

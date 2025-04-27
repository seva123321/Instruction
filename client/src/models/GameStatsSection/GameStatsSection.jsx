/* eslint-disable operator-linebreak */
/* eslint-disable react/jsx-one-expression-per-line */
import { memo } from 'react'
import {
  Box,
  Typography,
  Paper,
  Chip,
  Grid,
  Card,
  CardContent,
  useMediaQuery,
} from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import {
  MilitaryTech as BadgeIcon,
  Star as RankIcon,
} from '@mui/icons-material'

const GameStatsSection = memo(({ profileData }) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  return (
    <Paper
      elevation={isMobile ? 0 : 6}
      sx={{
        p: isMobile ? 2 : 4,
        mb: 4,
        borderRadius: 4,
        background: isMobile
          ? 'transparent'
          : `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.primary.light, 0.05)} 100%)`,
        border: isMobile
          ? 'none'
          : `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
        boxShadow: isMobile ? 'none' : theme.shadows[10],
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Typography
          variant="h5"
          component="h2"
          sx={{
            mb: 3,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            color:
              theme.palette.mode === 'dark'
                ? theme.palette.primary.light
                : theme.palette.primary.dark,
          }}
        >
          <RankIcon
            sx={{
              fontSize: 32,
              color:
                theme.palette.mode === 'dark'
                  ? theme.palette.secondary.light
                  : theme.palette.secondary.main,
            }}
          />
          Игровые достижения
        </Typography>

        <Grid container spacing={3}>
          {/* Блок ранга */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card
              sx={{
                height: '100%',
                background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${theme.palette.background.paper} 100%)`,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                boxShadow: theme.shadows[2],
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: theme.shadows[4],
                },
              }}
            >
              <CardContent
                sx={{ display: 'flex', alignItems: 'center', gap: 3 }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    width: isMobile ? 100 : 120,
                    height: isMobile ? 100 : 120,
                    flexShrink: 0,
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      inset: -5,
                      borderRadius: '50%',
                      background: `linear-gradient(45deg, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
                      zIndex: -1,
                      opacity: 0.7,
                      filter: 'blur(8px)',
                    },
                  }}
                >
                  {profileData?.current_rank?.icon ? (
                    <Box
                      component="img"
                      src={profileData.current_rank.icon}
                      alt={profileData.current_rank.name}
                      onError={(e) => {
                        e.target.style.display = 'none'
                      }}
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        borderRadius: '50%',
                        border: `3px solid ${alpha(theme.palette.common.white, 0.8)}`,
                        boxShadow: theme.shadows[4],
                        transition: 'transform 0.3s',
                        '&:hover': {
                          transform: 'scale(1.05) rotate(5deg)',
                        },
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${theme.palette.grey[300]} 0%, ${theme.palette.grey[500]} 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <RankIcon
                        sx={{
                          fontSize: isMobile ? 48 : 56,
                          color: theme.palette.common.white,
                        }}
                      />
                    </Box>
                  )}
                </Box>

                <Box>
                  <Typography
                    variant="subtitle1"
                    color="text.secondary"
                    sx={{ mb: 0.5 }}
                  >
                    Текущий ранг
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      background: `linear-gradient(45deg, ${theme.palette.secondary.main} 0%, ${theme.palette.primary.main} 100%)`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      display: 'inline-block',
                    }}
                  >
                    {profileData?.current_rank.name || 'Нет ранга'}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    {profileData?.experience_points
                      ? `Накоплено ${profileData.experience_points} очков опыта`
                      : 'Нет данных о прогрессе'}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Блок прогресса */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card
              sx={{
                height: '100%',
                background: `linear-gradient(145deg, ${alpha(theme.palette.info.main, 0.05)} 0%, ${theme.palette.background.paper} 100%)`,
                border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                boxShadow: theme.shadows[2],
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: theme.shadows[4],
                },
              }}
            >
              <CardContent>
                <Typography
                  variant="subtitle1"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  Ваш прогресс
                </Typography>

                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    mb: 2,
                  }}
                >
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      background:
                        theme.palette.mode === 'dark'
                          ? `linear-gradient(135deg, ${theme.palette.info.dark} 0%, ${theme.palette.info.main} 100%)`
                          : `linear-gradient(135deg, ${theme.palette.info.light} 0%, ${theme.palette.info.main} 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: theme.palette.common.white,
                      }}
                    >
                      {profileData?.experience_points || 0}
                    </Typography>
                  </Box>

                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      Очки опыта
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Чем больше очков, тем выше ранг
                    </Typography>
                  </Box>
                </Box>

                <Box
                  sx={{
                    width: '100%',
                    height: 8,
                    borderRadius: 4,
                    background: theme.palette.action.disabledBackground,
                    overflow: 'hidden',
                    mt: 2,
                  }}
                >
                  <Box
                    sx={{
                      width: `${Math.min((profileData?.experience_points || 0) / 10, 100)}%`,
                      height: '100%',
                      background: `linear-gradient(90deg, ${theme.palette.info.main} 0%, ${theme.palette.success.main} 100%)`,
                      transition: 'width 0.5s ease',
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Блок значков */}
          <Grid size={{ xs: 12 }}>
            <Typography
              variant="subtitle1"
              sx={{
                mt: 2,
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                color:
                  theme.palette.mode === 'dark'
                    ? theme.palette.secondary.light
                    : theme.palette.secondary.dark,
              }}
            >
              <BadgeIcon
                sx={{
                  fontSize: 28,
                  color:
                    theme.palette.mode === 'dark'
                      ? theme.palette.warning.light
                      : theme.palette.warning.main,
                }}
              />
              Полученные значки
            </Typography>

            {profileData?.badges?.length ? (
              <Grid container spacing={2}>
                {profileData.badges.map((badge) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={badge.id}>
                    <Card
                      sx={{
                        height: '100%',
                        border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: `0 8px 20px -5px ${alpha(theme.palette.warning.main, 0.2)}`,
                        },
                      }}
                    >
                      <CardContent
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          textAlign: 'center',
                          gap: 2,
                          pt: 4,
                          pb: 4,
                        }}
                      >
                        {badge.icon ? (
                          <Box
                            sx={{
                              width: 80,
                              height: 80,
                              borderRadius: '50%',
                              background: `linear-gradient(135deg, ${alpha(theme.palette.warning.light, 0.2)} 0%, ${alpha(theme.palette.warning.main, 0.1)} 100%)`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              mb: 1,
                              border: `2px solid ${alpha(theme.palette.warning.main, 0.3)}`,
                              boxShadow: `0 4px 10px ${alpha(theme.palette.warning.main, 0.1)}`,
                            }}
                          >
                            <Box
                              component="img"
                              src={badge.icon}
                              alt={badge.name}
                              sx={{
                                width: 50,
                                height: 50,
                                objectFit: 'contain',
                                filter:
                                  theme.palette.mode === 'dark'
                                    ? 'drop-shadow(0 0 4px rgba(255,213,79,0.5))'
                                    : 'none',
                              }}
                            />
                          </Box>
                        ) : (
                          <Box
                            sx={{
                              width: 80,
                              height: 80,
                              borderRadius: '50%',
                              background: `linear-gradient(135deg, ${theme.palette.grey[300]} 0%, ${theme.palette.grey[500]} 100%)`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              mb: 1,
                            }}
                          >
                            <BadgeIcon
                              sx={{
                                fontSize: 40,
                                color: theme.palette.common.white,
                              }}
                            />
                          </Box>
                        )}

                        <Box>
                          <Typography
                            variant="subtitle1"
                            sx={{
                              fontWeight: 600,
                              color:
                                theme.palette.mode === 'dark'
                                  ? theme.palette.warning.light
                                  : theme.palette.warning.dark,
                            }}
                          >
                            {badge.name}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 0.5 }}
                          >
                            {badge.description}
                          </Typography>
                          <Chip
                            label={`${badge.required_count} очков`}
                            size="small"
                            sx={{
                              mt: 1.5,
                              background: alpha(
                                theme.palette.success.main,
                                0.1
                              ),
                              color: theme.palette.success.main,
                              fontWeight: 500,
                            }}
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 4,
                  textAlign: 'center',
                  background: alpha(
                    theme.palette.action.disabledBackground,
                    0.3
                  ),
                  borderRadius: 2,
                }}
              >
                <BadgeIcon
                  sx={{
                    fontSize: 48,
                    color: theme.palette.text.disabled,
                    mb: 2,
                  }}
                />
                <Typography variant="body1" color="text.secondary">
                  У вас пока нет значков
                </Typography>
                <Typography
                  variant="body2"
                  color="text.disabled"
                  sx={{ mt: 1 }}
                >
                  Выполняйте задания и зарабатывайте достижения
                </Typography>
              </Box>
            )}
          </Grid>
        </Grid>
      </Box>
    </Paper>
  )
})

export default GameStatsSection

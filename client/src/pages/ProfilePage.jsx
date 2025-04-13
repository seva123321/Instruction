/* eslint-disable operator-linebreak */

import { useEffect, useMemo, useState } from 'react'
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Paper,
  InputAdornment,
  useMediaQuery,
  useTheme,
  Avatar,
  Divider,
  Chip,
  Slide,
  Fade,
  CircularProgress,
  Alert,
  Grid2,
  Card,
  CardContent,
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import { useForm, Controller } from 'react-hook-form'
import { MobileDatePicker, DesktopDatePicker } from '@mui/x-date-pickers'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { ru } from 'date-fns/locale'
import {
  Save as SaveIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  Cake as CakeIcon,
  Info as InfoIcon,
  MilitaryTech as BadgeIcon,
  Star as RankIcon,
} from '@mui/icons-material'
import { format } from 'date-fns'

import { useGetProfileQuery, usePatchProfileMutation } from '@/slices/userApi'
import {
  isEmail,
  isPhoneNumber,
  formatPhoneNumber,
} from '@/service/utilsFunction'

function ProfilePage() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'))
  const {
    data: profileData,
    isLoading,
    isError: profileError,
  } = useGetProfileQuery()
  const [patchProfile] = usePatchProfileMutation()
  const [submitError, setSubmitError] = useState(null)

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty, isValid },
    reset,
    watch,
    setError,
  } = useForm({
    defaultValues: {
      id: 0,
      email: '',
      first_name: '',
      last_name: '',
      middle_name: '',
      mobile_phone: '',
      birthday: null,
      position: '',
      role: 'user',
    },
    mode: 'onBlur',
  })

  const hasErrors = useMemo(() => Object.keys(errors).length > 0, [errors])
  const isSaveDisabled = useMemo(
    () => !isDirty || hasErrors || !isValid,
    [isDirty, hasErrors, isValid]
  )

  useEffect(() => {
    if (profileData) {
      reset({
        ...profileData,
        birthday: profileData.birthday ? new Date(profileData.birthday) : null,
      })
    }
  }, [profileData, reset])

  const onSubmit = async (data) => {
    try {
      setSubmitError(null)
      const newData = {
        ...data,
        mobile_phone: data.mobile_phone.replaceAll('-', ''),
        birthday: data.birthday ? format(data.birthday, 'yyyy-MM-dd') : null,
      }
      await patchProfile(newData).unwrap()
    } catch (err) {
      if (err.data) {
        Object.entries(err.data).forEach(([fieldName, messages]) => {
          setError(fieldName, {
            type: 'server',
            message: Array.isArray(messages) ? messages.join(', ') : messages,
          })
        })
      } else {
        setSubmitError('Произошла ошибка при обновлении профиля')
      }
    }
  }

  const getCombinedError = (fieldName) => errors[fieldName]?.message

  const renderBirthdayPicker = (field, isDesktopPicker) => {
    if (isDesktopPicker) {
      return (
        <DesktopDatePicker
          label="Дата рождения"
          value={field.value}
          onChange={field.onChange}
          format="dd.MM.yyyy"
          maxDate={new Date()}
          slotProps={{
            popper: {
              sx: {
                '& .MuiPaper-root': {
                  transform: 'scale(1.2)',
                  transformOrigin: 'top left',
                  boxShadow: theme.shadows[10],
                  borderRadius: 4,
                },
              },
            },
            textField: {
              fullWidth: true,
              InputProps: {
                startAdornment: (
                  <InputAdornment position="start">
                    <CakeIcon color="action" />
                  </InputAdornment>
                ),
              },
            },
          }}
          views={['year', 'month', 'day']}
          showDaysOutsideCurrentMonth
          fixedWeekNumber={6}
        />
      )
    }
    return (
      <MobileDatePicker
        label="Дата рождения"
        value={field.value}
        onChange={field.onChange}
        format="dd.MM.yyyy"
        maxDate={new Date()}
        slotProps={{
          textField: {
            fullWidth: true,
            InputProps: {
              startAdornment: (
                <InputAdornment position="start">
                  <CakeIcon color="action" />
                </InputAdornment>
              ),
            },
          },
          dialog: {
            sx: {
              '& .MuiDialog-paper': {
                width: '90vw',
                maxWidth: '400px',
                maxHeight: '70vh',
              },
            },
          },
        }}
      />
    )
  }

  if (isLoading) {
    return (
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress size={60} />
      </Box>
    )
  }

  if (profileError) {
    return (
      <Fade in>
        <Typography color="error">Ошибка загрузки профиля</Typography>
      </Fade>
    )
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
      <Container maxWidth="md">
        {submitError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {submitError}
          </Alert>
        )}
        <Slide in direction="up" timeout={300}>
          <Box>
            {/* Game Stats Section */}
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
                '&:before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '30%',
                  height: '100%',
                  background: `linear-gradient(45deg, ${alpha(theme.palette.primary.main, 0.03)} 0%, transparent 100%)`,
                  zIndex: 0,
                },
              }}
            >
              {/* Декоративные элементы */}
              <Box
                sx={{
                  position: 'absolute',
                  top: -50,
                  right: -50,
                  width: 200,
                  height: 200,
                  borderRadius: '50%',
                  background: `radial-gradient(${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
                  zIndex: 0,
                }}
              />

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

                <Grid2 container spacing={3}>
                  {/* Блок ранга */}
                  <Grid2 size={{ xs: 12, md: 6 }}>
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
                        {profileData?.icon ? (
                          // {profileData?.icon ? (
                          /* @TODO {profileData?.current_rank.icon ? ( */
                          <Box
                            sx={{
                              width: 80,
                              height: 80,
                              borderRadius: '50%',
                              background: `linear-gradient(135deg, ${theme.palette.secondary.light} 0%, ${theme.palette.secondary.main} 100%)`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              boxShadow: `0 4px 20px 0 ${alpha(theme.palette.secondary.main, 0.2)}`,
                            }}
                          >
                            <Box
                              component="img"
                              src={profileData.icon}
                              // src={profileData.current_rank.icon} @TODO
                              alt="Rank icon"
                              sx={{
                                width: 60,
                                height: 60,
                                objectFit: 'contain',
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
                              flexShrink: 0,
                            }}
                          >
                            <RankIcon
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
                            {profileData?.current_rank || 'Нет ранга'}
                            {/* @TODO {profileData?.current_rank.name || 'Нет ранга'} */}
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
                  </Grid2>

                  {/* Блок прогресса */}
                  <Grid2 size={{ xs: 12, md: 6 }}>
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
                            <Typography
                              variant="body1"
                              sx={{ fontWeight: 600 }}
                            >
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
                  </Grid2>

                  {/* Блок значков */}
                  <Grid2 size={{ xs: 12 }}>
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
                      <Grid2 container spacing={2}>
                        {profileData.badges.map((badge) => (
                          <Grid2
                            size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
                            key={badge.id}
                          >
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
                          </Grid2>
                        ))}
                      </Grid2>
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
                  </Grid2>
                </Grid2>
              </Box>
            </Paper>

            {/* Profile Edit Section */}
            <Paper
              elevation={isMobile ? 0 : 6}
              sx={{
                p: isMobile ? 2 : 4,
                borderRadius: 4,
                background: isMobile
                  ? 'transparent'
                  : theme.palette.background.paper,
                border: isMobile
                  ? 'none'
                  : `1px solid ${theme.palette.divider}`,
                boxShadow: isMobile ? 'none' : theme.shadows[10],
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: isMobile ? 'column' : 'row',
                  alignItems: 'center',
                  mb: 4,
                  gap: 3,
                }}
              >
                <Avatar
                  sx={{
                    width: isMobile ? 80 : 120,
                    height: isMobile ? 80 : 120,
                    bgcolor: theme.palette.primary.main,
                    fontSize: isMobile ? 40 : 60,
                  }}
                >
                  {watch('first_name')?.[0] || 'U'}
                </Avatar>

                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="h4"
                    component="h1"
                    sx={{
                      fontWeight: 700,
                      background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      mb: 1,
                    }}
                  >
                    {`${watch('first_name') || 'Пользователь'} ${watch('last_name')}`}
                  </Typography>

                  <Chip
                    label={
                      watch('role') === 'user'
                        ? 'Пользователь'
                        : 'Администратор'
                    }
                    size="small"
                    color={watch('role') === 'user' ? 'default' : 'secondary'}
                    sx={{ borderRadius: 1 }}
                  />
                </Box>
              </Box>

              <Divider sx={{ mb: 4, borderColor: theme.palette.divider }} />

              <Box
                component="form"
                onSubmit={handleSubmit(onSubmit)}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 3,
                  '& .MuiTextField-root': {
                    background: theme.palette.background.paper,
                    borderRadius: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  },
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    color: theme.palette.text.secondary,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <PersonIcon color="primary" /> Персональная информация
                </Typography>

                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                    gap: 3,
                  }}
                >
                  <Controller
                    name="first_name"
                    control={control}
                    rules={{ required: 'Обязательное поле' }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Имя"
                        fullWidth
                        variant="outlined"
                        error={!!errors.first_name}
                        helperText={errors.first_name?.message}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PersonIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />

                  <Controller
                    name="last_name"
                    control={control}
                    rules={{ required: 'Обязательное поле' }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Фамилия"
                        fullWidth
                        variant="outlined"
                        error={!!errors.last_name}
                        helperText={errors.last_name?.message}
                      />
                    )}
                  />
                </Box>

                <Controller
                  name="middle_name"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Отчество"
                      fullWidth
                      variant="outlined"
                      error={!!errors.middle_name}
                      helperText={getCombinedError('middle_name')}
                    />
                  )}
                />

                <Typography
                  variant="h6"
                  sx={{
                    color: theme.palette.text.secondary,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mt: 2,
                  }}
                >
                  <PhoneIcon color="primary" /> Контактная информация
                </Typography>

                <Controller
                  name="email"
                  control={control}
                  rules={{
                    required: 'Email обязателен для заполнения',
                    validate: {
                      isEmail: (value) =>
                        isEmail(value) ||
                        'Введите корректный email (например, user@example.com)',
                    },
                  }}
                  render={({ field }) => (
                    <Box sx={{ mb: 1 }}>
                      <TextField
                        {...field}
                        label="Email"
                        fullWidth
                        variant="outlined"
                        error={!!errors.email}
                        helperText={errors.email?.message}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <EmailIcon
                                color={errors.email ? 'error' : 'action'}
                              />
                            </InputAdornment>
                          ),
                          readOnly: true,
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor:
                              theme.palette.action.disabledBackground,
                            ...(errors.email && {
                              backgroundColor: `${theme.palette.error.light}20`,
                            }),
                          },
                        }}
                      />
                      <Typography
                        variant="caption"
                        sx={{
                          display: 'block',
                          mt: 0.5,
                          ml: 1,
                          color: errors.email
                            ? theme.palette.error.main
                            : theme.palette.text.secondary,
                          fontSize: '0.75rem',
                          fontStyle: 'italic',
                        }}
                      >
                        <Box
                          component="span"
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 0.5,
                          }}
                        >
                          <InfoIcon
                            fontSize="inherit"
                            color={errors.email ? 'error' : 'disabled'}
                          />
                          Email является вашим логином для входа
                        </Box>
                      </Typography>
                    </Box>
                  )}
                />

                <Controller
                  name="mobile_phone"
                  control={control}
                  rules={{
                    required: 'Телефон обязателен для заполнения',
                    validate: {
                      isPhone: (value) =>
                        isPhoneNumber(value) ||
                        'Введите телефон в формате +7 XXX XXX-XX-XX',
                    },
                  }}
                  render={({ field }) => {
                    const handlePhoneChange = (e) => {
                      const formatted = formatPhoneNumber(e.target.value)
                      field.onChange(formatted)
                    }

                    return (
                      <TextField
                        {...field}
                        label="Мобильный телефон"
                        inputMode="tel"
                        fullWidth
                        variant="outlined"
                        onChange={handlePhoneChange}
                        error={!!errors.mobile_phone}
                        helperText={errors.mobile_phone?.message}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PhoneIcon
                                color={errors.mobile_phone ? 'error' : 'action'}
                              />
                            </InputAdornment>
                          ),
                          inputProps: {
                            maxLength: 18,
                          },
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            ...(errors.mobile_phone && {
                              backgroundColor: `${theme.palette.error.light}20`,
                            }),
                          },
                        }}
                      />
                    )
                  }}
                />

                <Typography
                  variant="h6"
                  sx={{
                    color: theme.palette.text.secondary,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mt: 2,
                  }}
                >
                  <WorkIcon color="primary" /> Дополнительная информация
                </Typography>

                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                    gap: 3,
                  }}
                >
                  <Controller
                    name="position"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Должность"
                        fullWidth
                        variant="outlined"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <WorkIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />

                  <Controller
                    name="birthday"
                    control={control}
                    render={({ field }) =>
                      renderBirthdayPicker(field, isDesktop)
                    }
                  />
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: 2,
                    mt: 4,
                  }}
                >
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    startIcon={<SaveIcon />}
                    disabled={isSaveDisabled}
                    sx={{
                      minWidth: isMobile ? '100%' : 200,
                      borderRadius: 2,
                      fontWeight: 600,
                      textTransform: 'none',
                      fontSize: 16,
                      boxShadow: theme.shadows[2],
                      '&:hover': {
                        boxShadow: theme.shadows[4],
                        transform: isSaveDisabled ? 'none' : 'translateY(-2px)',
                        transition: 'all 0.3s ease',
                      },
                      '&:disabled': {
                        backgroundColor:
                          theme.palette.action.disabledBackground,
                        color: theme.palette.text.disabled,
                      },
                    }}
                  >
                    Сохранить изменения
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Box>
        </Slide>
      </Container>
    </LocalizationProvider>
  )
}

export default ProfilePage

// import { useEffect, useMemo, useState } from 'react'
// import {
//   Box,
//   TextField,
//   Button,
//   Typography,
//   Container,
//   Paper,
//   InputAdornment,
//   useMediaQuery,
//   useTheme,
//   Avatar,
//   Divider,
//   Chip,
//   Slide,
//   Fade,
//   CircularProgress,
//   Alert,
// } from '@mui/material'
// import { useForm, Controller } from 'react-hook-form'
// import { MobileDatePicker, DesktopDatePicker } from '@mui/x-date-pickers'
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
// import { ru } from 'date-fns/locale'
// import {
//   Save as SaveIcon,
//   Phone as PhoneIcon,
//   Email as EmailIcon,
//   Person as PersonIcon,
//   Work as WorkIcon,
//   Cake as CakeIcon,
//   Info as InfoIcon,
// } from '@mui/icons-material'
// import { format } from 'date-fns'

// import { useGetProfileQuery, usePatchProfileMutation } from '@/slices/userApi'
// import {
//   isEmail,
//   isPhoneNumber,
//   formatPhoneNumber,
// } from '@/service/utilsFunction'

// function ProfilePage() {
//   const theme = useTheme()
//   const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
//   const isDesktop = useMediaQuery(theme.breakpoints.up('md'))
//   const {
//     data: profileData,
//     isLoading,
//     isError: profileError,
//   } = useGetProfileQuery()
//   const [patchProfile] = usePatchProfileMutation()
//   const [submitError, setSubmitError] = useState(null)

//   const {
//     control,
//     handleSubmit,
//     formState: { errors, isDirty, isValid },
//     reset,
//     watch,
//     setError,
//   } = useForm({
//     defaultValues: {
//       id: 0,
//       email: '',
//       first_name: '',
//       last_name: '',
//       middle_name: '',
//       mobile_phone: '',
//       birthday: null,
//       position: '',
//       role: 'user',
//     },
//     mode: 'onBlur',
//   })

//   const hasErrors = useMemo(() => Object.keys(errors).length > 0, [errors])
//   const isSaveDisabled = useMemo(
//     () => !isDirty || hasErrors || !isValid,
//     [isDirty, hasErrors, isValid]
//   )

//   useEffect(() => {
//     if (profileData) {
//       reset({
//         ...profileData,
//         birthday: profileData.birthday ? new Date(profileData.birthday) : null,
//       })
//     }
//   }, [profileData, reset])

//   const onSubmit = async (data) => {
//     try {
//       setSubmitError(null)
//       const newData = {
//         ...data,
//         mobile_phone: data.mobile_phone.replaceAll('-', ''),
//         birthday: data.birthday ? format(data.birthday, 'yyyy-MM-dd') : null,
//       }
//       await patchProfile(newData).unwrap()
//     } catch (err) {
//       if (err.data) {
//         Object.entries(err.data).forEach(([fieldName, messages]) => {
//           setError(fieldName, {
//             type: 'server',
//             message: Array.isArray(messages) ? messages.join(', ') : messages,
//           })
//         })
//       } else {
//         setSubmitError('Произошла ошибка при обновлении профиля')
//       }
//     }
//   }

//   const getCombinedError = (fieldName) => errors[fieldName]?.message

//   if (isLoading) {
//     return (
//       <Box
//         sx={{
//           height: '100vh',
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center',
//         }}
//       >
//         <CircularProgress size={60} />
//       </Box>
//     )
//   }
//   if (profileError) {
//     return (
//       <Fade in>
//         <Typography color="error">Ошибка загрузки профиля</Typography>
//       </Fade>
//     )
//   }

//   const renderBirthdayPicker = (field, isDesktopPicker) => {
//     if (isDesktopPicker) {
//       return (
//         <DesktopDatePicker
//           label="Дата рождения"
//           value={field.value}
//           onChange={field.onChange}
//           format="dd.MM.yyyy"
//           maxDate={new Date()}
//           slotProps={{
//             popper: {
//               sx: {
//                 '& .MuiPaper-root': {
//                   transform: 'scale(1.2)',
//                   transformOrigin: 'top left',
//                   boxShadow: theme.shadows[10],
//                   borderRadius: 4,
//                 },
//               },
//             },
//             textField: {
//               fullWidth: true,
//               InputProps: {
//                 startAdornment: (
//                   <InputAdornment position="start">
//                     <CakeIcon color="action" />
//                   </InputAdornment>
//                 ),
//               },
//             },
//           }}
//           views={['year', 'month', 'day']}
//           showDaysOutsideCurrentMonth
//           fixedWeekNumber={6}
//         />
//       )
//     }
//     return (
//       <MobileDatePicker
//         label="Дата рождения"
//         value={field.value}
//         onChange={field.onChange}
//         format="dd.MM.yyyy"
//         maxDate={new Date()}
//         slotProps={{
//           textField: {
//             fullWidth: true,
//             InputProps: {
//               startAdornment: (
//                 <InputAdornment position="start">
//                   <CakeIcon color="action" />
//                 </InputAdornment>
//               ),
//             },
//           },
//           dialog: {
//             sx: {
//               '& .MuiDialog-paper': {
//                 width: '90vw',
//                 maxWidth: '400px',
//                 maxHeight: '70vh',
//               },
//             },
//           },
//         }}
//       />
//     )
//   }

//   return (
//     <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
//       <Container maxWidth="md">
//         {submitError && (
//           <Alert severity="error" sx={{ mb: 2 }}>
//             {submitError}
//           </Alert>
//         )}
//         <Slide in direction="up" timeout={300}>
//           <Paper
//             elevation={isMobile ? 0 : 6}
//             sx={{
//               p: isMobile ? 2 : 4,
//               borderRadius: 4,
//               background: isMobile
//                 ? 'transparent'
//                 : theme.palette.background.paper,
//               border: isMobile ? 'none' : `1px solid ${theme.palette.divider}`,
//               boxShadow: isMobile ? 'none' : theme.shadows[10],
//             }}
//           >
//             <Box
//               sx={{
//                 display: 'flex',
//                 flexDirection: isMobile ? 'column' : 'row',
//                 alignItems: 'center',
//                 mb: 4,
//                 gap: 3,
//               }}
//             >
//               <Avatar
//                 sx={{
//                   width: isMobile ? 80 : 120,
//                   height: isMobile ? 80 : 120,
//                   bgcolor: theme.palette.primary.main,
//                   fontSize: isMobile ? 40 : 60,
//                 }}
//               >
//                 {watch('first_name')?.[0] || 'U'}
//               </Avatar>

//               <Box sx={{ flex: 1 }}>
//                 <Typography
//                   variant="h4"
//                   component="h1"
//                   sx={{
//                     fontWeight: 700,
//                     background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
//                     WebkitBackgroundClip: 'text',
//                     WebkitTextFillColor: 'transparent',
//                     mb: 1,
//                   }}
//                 >
//                   {`${watch('first_name') || 'Пользователь'} ${watch('last_name')}`}
//                 </Typography>

//                 <Chip
//                   label={
//                     watch('role') === 'user' ? 'Пользователь' : 'Администратор'
//                   }
//                   size="small"
//                   color={watch('role') === 'user' ? 'default' : 'secondary'}
//                   sx={{ borderRadius: 1 }}
//                 />
//               </Box>
//             </Box>

//             <Divider sx={{ mb: 4, borderColor: theme.palette.divider }} />

//             <Box
//               component="form"
//               onSubmit={handleSubmit(onSubmit)}
//               sx={{
//                 display: 'flex',
//                 flexDirection: 'column',
//                 gap: 3,
//                 '& .MuiTextField-root': {
//                   background: theme.palette.background.paper,
//                   borderRadius: 2,
//                   '& .MuiOutlinedInput-root': {
//                     borderRadius: 2,
//                   },
//                 },
//               }}
//             >
//               <Typography
//                 variant="h6"
//                 sx={{
//                   color: theme.palette.text.secondary,
//                   display: 'flex',
//                   alignItems: 'center',
//                   gap: 1,
//                 }}
//               >
//                 {/* eslint-disable-next-line react/jsx-one-expression-per-line */}
//                 <PersonIcon color="primary" /> Персональная информация
//               </Typography>

//               <Box
//                 sx={{
//                   display: 'grid',
//                   gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
//                   gap: 3,
//                 }}
//               >
//                 <Controller
//                   name="first_name"
//                   control={control}
//                   rules={{ required: 'Обязательное поле' }}
//                   render={({ field }) => (
//                     <TextField
//                       {...field}
//                       label="Имя"
//                       fullWidth
//                       variant="outlined"
//                       error={!!errors.first_name}
//                       helperText={errors.first_name?.message}
//                       slotProps={{
//                         startAdornment: (
//                           <InputAdornment position="start">
//                             <PersonIcon color="action" />
//                           </InputAdornment>
//                         ),
//                       }}
//                     />
//                   )}
//                 />

//                 <Controller
//                   name="last_name"
//                   control={control}
//                   rules={{ required: 'Обязательное поле' }}
//                   render={({ field }) => (
//                     <TextField
//                       {...field}
//                       label="Фамилия"
//                       fullWidth
//                       variant="outlined"
//                       error={!!errors.last_name}
//                       helperText={errors.last_name?.message}
//                     />
//                   )}
//                 />
//               </Box>

//               <Controller
//                 name="middle_name"
//                 control={control}
//                 render={({ field }) => (
//                   <TextField
//                     {...field}
//                     label="Отчество"
//                     fullWidth
//                     variant="outlined"
//                     error={!!errors.middle_name}
//                     helperText={getCombinedError('middle_name')}
//                   />
//                 )}
//               />

//               <Typography
//                 variant="h6"
//                 sx={{
//                   color: theme.palette.text.secondary,
//                   display: 'flex',
//                   alignItems: 'center',
//                   gap: 1,
//                   mt: 2,
//                 }}
//               >
//                 {/* eslint-disable-next-line react/jsx-one-expression-per-line */}
//                 <PhoneIcon color="primary" /> Контактная информация
//               </Typography>

//               <Controller
//                 name="email"
//                 control={control}
//                 rules={{
//                   required: 'Email обязателен для заполнения',
//                   validate: {
//                     isEmail: (value) =>
//                       isEmail(value) ||
//                       'Введите корректный email (например, user@example.com)',
//                   },
//                 }}
//                 render={({ field }) => (
//                   <Box sx={{ mb: 1 }}>
//                     <TextField
//                       {...field}
//                       label="Email"
//                       fullWidth
//                       variant="outlined"
//                       error={!!errors.email}
//                       helperText={errors.email?.message}
//                       slotProps={{
//                         startAdornment: (
//                           <InputAdornment position="start">
//                             <EmailIcon
//                               color={errors.email ? 'error' : 'action'}
//                             />
//                           </InputAdornment>
//                         ),
//                         readOnly: true,
//                       }}
//                       sx={{
//                         '& .MuiOutlinedInput-root': {
//                           backgroundColor:
//                             theme.palette.action.disabledBackground,
//                           ...(errors.email && {
//                             backgroundColor: `${theme.palette.error.light}20`,
//                           }),
//                         },
//                       }}
//                     />
//                     <Typography
//                       variant="caption"
//                       sx={{
//                         display: 'block',
//                         mt: 0.5,
//                         ml: 1,
//                         color: errors.email
//                           ? theme.palette.error.main
//                           : theme.palette.text.secondary,
//                         fontSize: '0.75rem',
//                         fontStyle: 'italic',
//                       }}
//                     >
//                       <Box
//                         component="span"
//                         sx={{
//                           display: 'inline-flex',
//                           alignItems: 'center',
//                           gap: 0.5,
//                         }}
//                       >
//                         <InfoIcon
//                           fontSize="inherit"
//                           color={errors.email ? 'error' : 'disabled'}
//                         />
//                         Email является вашим логином для входа
//                       </Box>
//                     </Typography>
//                   </Box>
//                 )}
//               />

//               <Controller
//                 name="mobile_phone"
//                 control={control}
//                 rules={{
//                   required: 'Телефон обязателен для заполнения',
//                   validate: {
//                     isPhone: (value) =>
//                       isPhoneNumber(value) ||
//                       'Введите телефон в формате +7 XXX XXX-XX-XX',
//                   },
//                 }}
//                 render={({ field }) => {
//                   const handlePhoneChange = (e) => {
//                     const formatted = formatPhoneNumber(e.target.value)
//                     field.onChange(formatted)
//                   }

//                   return (
//                     <TextField
//                       {...field}
//                       label="Мобильный телефон"
//                       inputMode="tel"
//                       fullWidth
//                       variant="outlined"
//                       onChange={handlePhoneChange}
//                       error={!!errors.mobile_phone}
//                       helperText={errors.mobile_phone?.message}
//                       slotProps={{
//                         startAdornment: (
//                           <InputAdornment position="start">
//                             <PhoneIcon
//                               color={errors.mobile_phone ? 'error' : 'action'}
//                             />
//                           </InputAdornment>
//                         ),
//                         input: {
//                           maxLength: 18,
//                         },
//                       }}
//                       sx={{
//                         '& .MuiOutlinedInput-root': {
//                           ...(errors.mobile_phone && {
//                             backgroundColor: `${theme.palette.error.light}20`,
//                           }),
//                         },
//                       }}
//                     />
//                   )
//                 }}
//               />

//               <Typography
//                 variant="h6"
//                 sx={{
//                   color: theme.palette.text.secondary,
//                   display: 'flex',
//                   alignItems: 'center',
//                   gap: 1,
//                   mt: 2,
//                 }}
//               >
//                 {/* eslint-disable-next-line react/jsx-one-expression-per-line */}
//                 <WorkIcon color="primary" /> Дополнительная информация
//               </Typography>

//               <Box
//                 sx={{
//                   display: 'grid',
//                   gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
//                   gap: 3,
//                 }}
//               >
//                 <Controller
//                   name="position"
//                   control={control}
//                   render={({ field }) => (
//                     <TextField
//                       {...field}
//                       label="Должность"
//                       fullWidth
//                       variant="outlined"
//                       slotProps={{
//                         startAdornment: (
//                           <InputAdornment position="start">
//                             <WorkIcon color="action" />
//                           </InputAdornment>
//                         ),
//                       }}
//                     />
//                   )}
//                 />

//                 <Controller
//                   name="birthday"
//                   control={control}
//                   render={({ field }) => renderBirthdayPicker(field, isDesktop)}
//                 />
//               </Box>

//               <Box
//                 sx={{
//                   display: 'flex',
//                   justifyContent: 'flex-end',
//                   gap: 2,
//                   mt: 4,
//                 }}
//               >
//                 <Button
//                   type="submit"
//                   variant="contained"
//                   color="primary"
//                   size="large"
//                   startIcon={<SaveIcon />}
//                   disabled={isSaveDisabled}
//                   sx={{
//                     minWidth: isMobile ? '100%' : 200,
//                     borderRadius: 2,
//                     fontWeight: 600,
//                     textTransform: 'none',
//                     fontSize: 16,
//                     boxShadow: theme.shadows[2],
//                     '&:hover': {
//                       boxShadow: theme.shadows[4],
//                       transform: isSaveDisabled ? 'none' : 'translateY(-2px)',
//                       transition: 'all 0.3s ease',
//                     },
//                     '&:disabled': {
//                       backgroundColor: theme.palette.action.disabledBackground,
//                       color: theme.palette.text.disabled,
//                     },
//                   }}
//                 >
//                   Сохранить изменения
//                 </Button>
//               </Box>
//             </Box>
//           </Paper>
//         </Slide>
//       </Container>
//     </LocalizationProvider>
//   )
// }

// export default ProfilePage

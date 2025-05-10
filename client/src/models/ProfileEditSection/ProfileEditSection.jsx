/* eslint-disable operator-linebreak */
import React, { memo, useEffect, useMemo, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  InputAdornment,
  useMediaQuery,
  useTheme,
  Avatar,
  Divider,
  Chip,
} from '@mui/material'
import {
  Save as SaveIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  Info as InfoIcon,
} from '@mui/icons-material'
import { format } from 'date-fns'

import { usePatchProfileMutation } from '@/slices/userApi'
import {
  isEmail,
  isPhoneNumber,
  formatPhoneNumber,
} from '@/service/utilsFunction'
import DatePicker from '@/components/DatePicker'
import MessageAlert from '@/components/MessageAlert'

function ProfileEditSection({ profileData }) {
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
  const [patchProfile] = usePatchProfileMutation()
  const [submitMessage, setSubmitMessage] = useState(null)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'))

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
      setSubmitMessage(null)
      const newData = {
        ...data,
        mobile_phone: data.mobile_phone.replaceAll('-', ''),
        birthday: data.birthday ? format(data.birthday, 'yyyy-MM-dd') : null,
      }
      await patchProfile(newData).unwrap()
      setSubmitMessage({
        text: 'Данные успешно обновлены!',
        type: 'success',
      })
    } catch (err) {
      if (err.data) {
        Object.entries(err.data).forEach(([fieldName, messages]) => {
          setError(fieldName, {
            type: 'server',
            message: Array.isArray(messages) ? messages.join(', ') : messages,
          })
        })
      } else {
        setSubmitMessage({
          text: 'Произошла ошибка при обновлении профиля',
          type: 'error',
        })
      }
    }
  }

  const getCombinedError = (fieldName) => errors[fieldName]?.message

  return (
    <Paper
      elevation={isMobile ? 0 : 6}
      sx={{
        p: isMobile ? 2 : 4,
        borderRadius: 4,
        background: isMobile ? 'transparent' : theme.palette.background.paper,
        border: isMobile ? 'none' : `1px solid ${theme.palette.divider}`,
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
            label={watch('role') === 'user' ? 'Пользователь' : 'Администратор'}
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
          <PersonIcon color="primary" />
          <span>Персональная информация</span>
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
                slotProps={{
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
          <PhoneIcon color="primary" />
          <span>Контактная информация</span>
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
                slotProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color={errors.email ? 'error' : 'action'} />
                    </InputAdornment>
                  ),
                  readOnly: true,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: theme.palette.action.disabledBackground,
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
                slotProps={{
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
          <WorkIcon color="primary" />
          <span> Дополнительная информация</span>
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: 3,
          }}
        >
          <Box>
            <Controller
              name="position"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Должность"
                  fullWidth
                  variant="outlined"
                  disabled
                  slotProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <WorkIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
            <Box
              component="span"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                color: 'text.secondary',
                fontSize: '12px',
              }}
            >
              <InfoIcon fontSize="inherit" color="disabled" />
              неизменяемое поле
            </Box>
          </Box>

          <Controller
            name="birthday"
            control={control}
            // eslint-disable-next-line prettier/prettier
            render={
              ({ field }) => <DatePicker field={field} isDesktop={isDesktop} />
              // eslint-disable-next-line react/jsx-curly-newline
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
                backgroundColor: theme.palette.action.disabledBackground,
                color: theme.palette.text.disabled,
              },
            }}
          >
            Сохранить изменения
          </Button>
        </Box>
      </Box>
      {submitMessage && <MessageAlert message={submitMessage} sx={{ mb: 2 }} />}
    </Paper>
  )
}

export default memo(ProfileEditSection)

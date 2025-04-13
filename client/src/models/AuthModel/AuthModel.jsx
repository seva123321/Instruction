import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Button,
  Box,
  FormHelperText,
  FormControl,
  Typography,
  InputLabel,
  OutlinedInput,
  CircularProgress,
} from '@mui/material'
import { useForm, Controller } from 'react-hook-form'

import useAuth from '@/hook/useAuth'
import Recognition from '@/models/Recognition'
import PasswordInput from '@/components/PasswordInput'
import CustomLink from '@/components/CustomLink'
import MessageAlert from '@/components/MessageAlert'
import {
  formatPhoneNumber,
  isEmail,
  isPhoneNumber,
} from '@/service/utilsFunction'

function AuthModel() {
  const navigate = useNavigate()
  const location = useLocation()
  const {
    formState: { errors, isValid },
    handleSubmit,
    reset,
    watch,
    control,
  } = useForm({ mode: 'onBlur' })

  const { auth, isLoading, error: authError } = useAuth()
  const [faceDescriptor, setFaceDescriptor] = useState(null)
  const [errorsServer, setErrorsServer] = useState(null)
  const fromPage = location.state?.from?.pathname || '/instructions'

  const onSubmit = async (data) => {
    if (!faceDescriptor) return

    const userData = {
      ...data,
      mobile_phone: data.mobile_phone.replaceAll('-', ''),
      face_descriptor: faceDescriptor,
    }
    delete userData.confirmPassword

    const result = await auth(userData)

    if (result.status && !/^2/.test(String(result.status))) {
      setErrorsServer(result.data)
    } else {
      reset()
      navigate(fromPage, { replace: true, state: result.data })
    }
  }

  const handleFaceDescriptor = (data) => {
    setFaceDescriptor(data)
  }

  return (
    <div>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Typography variant="h5">Зарегистрироваться</Typography>
        <CustomLink to="/auth/login">Войти</CustomLink>
      </Box>

      <form noValidate autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
        <Box
          display="flex"
          sx={{
            width: '40ch',
            margin: '0 auto',
          }}
          flexDirection="column"
          alignItems="center"
        >
          {/* Имя */}
          <FormControl
            sx={{
              width: '100%',
              marginBottom: 2,
            }}
            variant="outlined"
          >
            <InputLabel htmlFor="first_name">Имя</InputLabel>
            <Controller
              name="first_name"
              control={control}
              defaultValue=""
              rules={{
                required: 'Поле обязательно к заполнению!',
                pattern: {
                  value: /^[a-zA-Zа-яА-Я\s-]+$/,
                  message:
                    'Разрешены только русские и латинские буквы, пробел и тире',
                },
              }}
              render={({ field }) => (
                <OutlinedInput
                  {...field}
                  inputMode="text"
                  autoFocus
                  autoComplete="first_name"
                  id="first_name"
                  label="Имя"
                />
              )}
            />
            <FormHelperText error>
              {errors.first_name?.message || errorsServer?.first_name?.at()}
            </FormHelperText>
          </FormControl>

          {/* Фамилия */}
          <FormControl
            sx={{
              width: '100%',
              marginBottom: 2,
            }}
            variant="outlined"
          >
            <InputLabel htmlFor="last_name">Фамилия</InputLabel>
            <Controller
              name="last_name"
              control={control}
              defaultValue=""
              rules={{
                required: 'Поле обязательно к заполнению!',
                pattern: {
                  value: /^[a-zA-Zа-яА-Я\s-]+$/,
                  message:
                    'Разрешены только русские и латинские буквы, пробел и тире',
                },
              }}
              render={({ field }) => (
                <OutlinedInput
                  {...field}
                  inputMode="text"
                  autoComplete="last_name"
                  id="last_name"
                  label="Фамилия"
                />
              )}
            />
            <FormHelperText error>
              {errors.last_name?.message || errorsServer?.last_name?.at()}
            </FormHelperText>
          </FormControl>

          {/* Поле для email */}
          <FormControl
            sx={{
              width: '100%',
              marginBottom: 2,
            }}
            variant="outlined"
          >
            <InputLabel htmlFor="email">Почта</InputLabel>
            <Controller
              name="email"
              control={control}
              defaultValue=""
              rules={{
                required: 'Поле обязательно к заполнению!',
                validate: (value) =>
                  isEmail(value) ||
                  'Введите корректный адрес электронной почты',
              }}
              render={({ field }) => (
                <OutlinedInput
                  {...field}
                  inputMode="email"
                  autoComplete="email"
                  id="email"
                  label="Почта"
                />
              )}
            />
            <FormHelperText error>
              {errors.email?.message || errorsServer?.email?.at()}
            </FormHelperText>
          </FormControl>

          {/* Поле для телефона */}
          <FormControl
            sx={{
              width: '100%',
              marginBottom: 2,
            }}
            variant="outlined"
          >
            <InputLabel htmlFor="mobile_phone">Телефон</InputLabel>
            <Controller
              name="mobile_phone"
              control={control}
              defaultValue=""
              rules={{
                required: 'Поле обязательно к заполнению!',
                validate: (value) =>
                  isPhoneNumber(value) ||
                  'Проверьте, что вводите телефон в правильном формате, например +7 900 123-33-55',
              }}
              render={({ field }) => (
                <OutlinedInput
                  {...field}
                  inputMode="tel"
                  autoComplete="mobile_phone"
                  id="mobile_phone"
                  label="Телефон"
                  value={formatPhoneNumber(field.value)}
                  onChange={(e) => {
                    field.onChange(formatPhoneNumber(e.target.value))
                  }}
                />
              )}
            />
            <FormHelperText error>
              {errors.mobile_phone?.message || errorsServer?.mobile_phone?.at()}
            </FormHelperText>
          </FormControl>

          {/* Пароль */}
          <PasswordInput
            name="password"
            label="Пароль"
            control={control}
            errors={errors}
            watch={watch}
          />

          {/* Подтверждение пароля */}
          <PasswordInput
            name="confirmPassword"
            label="Повторите пароль"
            control={control}
            errors={errors}
            watch={watch}
          />

          <Recognition
            onFaceDescriptor={handleFaceDescriptor}
            onCameraError={(err) => {
              MessageAlert.show({
                text: `Ошибка доступа к камере. ${err}`,
                type: 'error',
              })
            }}
          />
          <FormHelperText error>
            {errorsServer?.face_descriptor?.at()}
          </FormHelperText>

          {/* Отображение ошибок из провайдера */}
          {authError && (
            <MessageAlert
              message={{
                text:
                  authError.data?.message ||
                  'Ошибка регистрации. Попробуйте снова.',
                type: 'error',
              }}
            />
          )}

          <Button
            type="submit"
            variant="contained"
            disabled={!isValid || !faceDescriptor || isLoading}
            fullWidth
            sx={{ mt: 2 }}
          >
            {isLoading ? <CircularProgress /> : 'Зарегистрироваться'}
          </Button>
        </Box>
      </form>
    </div>
  )
}

export default AuthModel

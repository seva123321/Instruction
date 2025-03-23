import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Button,
  Box,
  Typography,
  FormHelperText,
  FormControl,
  InputLabel,
  OutlinedInput,
  CircularProgress, // Добавляем спиннер
} from '@mui/material'
import { useForm, Controller } from 'react-hook-form'

import CustomLink from '@/components/CustomLink'
import PasswordInput from '@/components/PasswordInput'
import useAuth from '@/hook/useAuth'
import MessageAlert from '@/components/MessageAlert' // Импортируем компонент для отображения ошибок

import Recognition from '../Recognition/Recognition'

function LoginModel() {
  const navigate = useNavigate()
  const location = useLocation()
  const {
    formState: { errors, isValid },
    handleSubmit,
    reset,
    watch,
    control,
  } = useForm({
    mode: 'onBlur',
  })
  const [faceDescriptor, setFaceDescriptor] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const { signIn } = useAuth()

  const fromPage = location.state?.from?.pathname || '/instruction'

  const onSubmit = async (data) => {
    setIsLoading(true) // Включаем спиннер
    setErrorMessage(null) // Сбрасываем ошибку

    try {
      let authData

      if (data?.faceDescriptor) {
        // Авторизация по лицу
        authData = {
          faceDescriptor: data.faceDescriptor,
        }
      } else {
        // Авторизация по логину и паролю
        authData = {
          username: data.username,
          password: data.password,
        }
      }
      // alert(JSON.stringify(authData))

      // Вызов функции signIn для авторизации
      await signIn(authData, () => navigate(fromPage), { replace: true })

      // Сброс формы после успешной авторизации
      reset()
    } catch (error) {
      // Обработка ошибок
      setErrorMessage({
        text: error.message || 'Ошибка авторизации. Попробуйте снова.',
        type: 'error',
      })
    } finally {
      setIsLoading(false) // Выключаем спиннер
    }
  }

  const handleFaceDescriptor = async (data) => {
    setFaceDescriptor(data)

    await onSubmit({ faceDescriptor: data })
  }

  return (
    <div>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Typography variant="h5">Войти</Typography>
        <CustomLink to="/auth">Зарегистрироваться</CustomLink>
      </Box>
      <form noValidate autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
        <Box
          display="flex"
          sx={{ width: '40ch', margin: '0 auto' }}
          flexDirection="column"
          alignItems="center"
        >
          {/* Поле для логина */}
          <FormControl
            sx={{ width: '100%', marginBottom: 2 }}
            variant="outlined"
          >
            <InputLabel htmlFor="username">Логин</InputLabel>
            <Controller
              name="username"
              control={control}
              defaultValue=""
              rules={{
                required: !faceDescriptor && 'Поле обязательно к заполнению!', // Логин обязателен, если нет дескриптора лица
              }}
              render={({ field }) => (
                <OutlinedInput
                  {...field}
                  inputMode="text"
                  autoComplete="username"
                  id="username"
                  label="Логин"
                  disabled={!!faceDescriptor || isLoading}
                />
              )}
            />
            <FormHelperText error>{errors.username?.message}</FormHelperText>
          </FormControl>

          {/* Поле для пароля */}
          <PasswordInput
            name="password"
            label="Пароль"
            control={control}
            errors={errors}
            watch={watch}
            disabled={!!faceDescriptor || isLoading}
          />

          {/* Компонент для распознавания лица */}
          <Recognition
            onFaceDescriptor={handleFaceDescriptor}
            onCameraError={(error) => {
              setErrorMessage({
                text: `Ошибка доступа к камере: ${error.message || error}`,
                type: 'error',
              })
            }}
          />

          {/* Кнопка для входа */}
          <Button
            type="submit"
            variant="contained"
            disabled={(!isValid && !faceDescriptor) || isLoading}
            sx={{ marginTop: 2, width: '100%' }}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Войти'}
          </Button>
        </Box>
      </form>

      {/* Отображение ошибок */}
      {errorMessage && (
        <MessageAlert
          message={errorMessage}
          duration={5000} // Ошибка будет видна 5 секунд
          onClose={() => setErrorMessage(null)} // Очистка ошибки при закрытии
        />
      )}
    </div>
  )
}

export default LoginModel

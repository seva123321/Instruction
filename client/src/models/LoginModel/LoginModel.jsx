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
  CircularProgress,
} from '@mui/material'
import { useForm, Controller } from 'react-hook-form'

import CustomLink from '@/components/CustomLink'
import PasswordInput from '@/components/PasswordInput'
import useAuth from '@/hook/useAuth'
import MessageAlert from '@/components/MessageAlert'

import { isEmail } from '@/service/utilsFunction'
import Recognition from '@/models/Recognition'

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

  const fromPage = location.state?.from?.pathname || '/instructions'

  const onSubmit = async (data) => {
    setIsLoading(true)
    setErrorMessage(null)

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
          email: data.email,
          password: data.password,
        }
      }
      // alert(JSON.stringify(authData))

      // Вызов функции signIn для авторизации
      await signIn(authData, () => navigate(fromPage), { replace: true })

      reset()
    } catch (error) {
      setErrorMessage({
        text: error.message || 'Ошибка авторизации. Попробуйте снова.',
        type: 'error',
      })
    } finally {
      setIsLoading(false)
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
            <InputLabel htmlFor="email">Логин (почта)</InputLabel>
            <Controller
              name="email"
              control={control}
              defaultValue=""
              rules={{
                required: 'Поле обязательно к заполнению!',
                validate: (value) => {
                  if (!isEmail(value)) {
                    return 'Введите корректный адрес электронной почты'
                  }
                  return true
                },
              }}
              render={({ field }) => (
                <OutlinedInput
                  {...field}
                  inputMode="email"
                  autoComplete="email"
                  id="email"
                  label="Логин (почта)"
                />
              )}
            />
            <FormHelperText error>{errors.email?.message}</FormHelperText>
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

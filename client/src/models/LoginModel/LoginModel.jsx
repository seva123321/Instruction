/* eslint-disable indent */
/* eslint-disable operator-linebreak */

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

import useAuth from '@/hook/useAuth'
import { isEmail } from '@/service/utilsFunction'
import Recognition from '@/models/Recognition'
import CustomLink from '@/components/CustomLink'
import PasswordInput from '@/components/PasswordInput'
import MessageAlert from '@/components/MessageAlert'

function LoginModel() {
  const navigate = useNavigate()
  const location = useLocation()
  const {
    formState: { errors, isValid },
    handleSubmit,
    reset,
    watch,
    control,
  } = useForm({ mode: 'onBlur' })

  const [faceDescriptor, setFaceDescriptor] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})
  const { signIn, isLoading } = useAuth()

  const fromPage = location.state?.from?.pathname || '/instructions'

  const onSubmit = async (data) => {
    setErrorMessage(null)
    setFieldErrors({})
    try {
      const authData = faceDescriptor
        ? { face_descriptor: faceDescriptor }
        : {
            email: data.email,
            password: data.password,
          }

      const result = await signIn(authData)
      reset()
      navigate(fromPage, { replace: true, state: result })
    } catch (error) {
      if (error.data?.errors) {
        setFieldErrors(error.data.errors)
      }
      setErrorMessage({
        text:
          error.data?.detail ||
          error.message ||
          'Произошла непредвиденная ошибка',
        type: 'error',
      })
    }
  }

  const handleFaceDescriptor = async (data) => {
    setFaceDescriptor(data)
    setFieldErrors({})
    setErrorMessage(null)

    try {
      const result = await signIn({ face_descriptor: data })
      reset()
      navigate(fromPage, { replace: true, state: result })
    } catch (error) {
      setErrorMessage({
        text: 'Не удалось войти по лицу. Попробуйте пароль',
        type: 'error',
      })
      setFaceDescriptor(null)
    }
  }

  const handleSwitchToPassword = () => {
    setFaceDescriptor(null)
    setErrorMessage(null)
    setFieldErrors({})
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
        <CustomLink to="/auth/signup">Зарегистрироваться</CustomLink>
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
          {!faceDescriptor && (
            <>
              <FormControl
                sx={{
                  width: '100%',
                  marginBottom: 2,
                }}
                variant="outlined"
                error={!!errors.email || !!fieldErrors.email}
              >
                <InputLabel htmlFor="email">Логин (почта)</InputLabel>
                <Controller
                  name="email"
                  control={control}
                  defaultValue=""
                  rules={{
                    required: 'Поле обязательно к заполнению!',
                    validate: (value) =>
                      isEmail(value) || 'Введите корректный email',
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
                <FormHelperText error>
                  {errors.email?.message || fieldErrors.email}
                </FormHelperText>
              </FormControl>

              <PasswordInput
                name="password"
                label="Пароль"
                control={control}
                errors={{
                  ...errors,
                  password: errors.password || fieldErrors.password,
                }}
                watch={watch}
                disabled={isLoading}
              />
            </>
          )}

          <Recognition
            onFaceDescriptor={handleFaceDescriptor}
            onCameraError={(err) => {
              setErrorMessage({
                text: `Ошибка камеры: ${err.message || 'Не удалось получить доступ'}`,
                type: 'error',
              })
            }}
          />
          <FormHelperText error>{fieldErrors.face_descriptor}</FormHelperText>

          {faceDescriptor && (
            <Button
              onClick={handleSwitchToPassword}
              sx={{ mt: 2 }}
              variant="text"
            >
              Использовать пароль
            </Button>
          )}

          <Button
            type="submit"
            variant="contained"
            disabled={(!isValid && !faceDescriptor) || isLoading}
            sx={{
              marginTop: 2,
              width: '100%',
            }}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Войти'}
          </Button>
        </Box>
      </form>

      {errorMessage && (
        <MessageAlert
          message={{
            text: errorMessage.text,
            type: errorMessage.type,
          }}
          clearErrors={() => setErrorMessage(null)}
        />
      )}
    </div>
  )
}

export default LoginModel

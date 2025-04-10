/* eslint-disable indent */
/* eslint-disable operator-linebreak */

import { useEffect, useState } from 'react'
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
import MessageAlert from '@/components/MessageAlert/MessageAlert'

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
  const [errorsServer, setErrorsServer] = useState(null)
  const { signIn, isLoading } = useAuth()

  const fromPage = location.state?.from?.pathname || '/instructions'

  const onSubmit = async (data) => {
    setErrorMessage(null)
    try {
      const authData = faceDescriptor
        ? { face_descriptor: faceDescriptor }
        : {
            email: data.email,
            password: data.password,
          }

      const result = await signIn(authData)

      if (result.status && !/^2/.test(String(result.status))) {
        setErrorsServer(result.data.errors)
      } else {
        reset()
        navigate(fromPage, { replace: true, state: result.data })
      }
    } catch (error) {
      setErrorMessage({
        text: error.message || 'Произошла непредвиденная ошибка',
        type: 'error',
      })
    }
  }

  const handleFaceDescriptor = async (data) => {
    setFaceDescriptor(data) // Сохраняем дескриптор

    // Пытаемся войти сразу при получении дескриптора
    try {
      const success = await signIn({ face_descriptor: data })

      if (success) {
        reset()
        navigate(fromPage, { replace: true })
      }
    } catch (error) {
      setErrorMessage({
        text: 'Не удалось войти по лицу. Попробуйте пароль',
        type: 'error',
      })
      setFaceDescriptor(null) // Сбрасываем дескриптор при ошибке
    }
  }

  const handleSwitchToPassword = () => {
    setFaceDescriptor(null)
    setErrorMessage(null)
  }

  useEffect(() => {
    console.log('errorsServer > ', errorsServer)

    if (errorsServer?.email === 'Пользователь с таким email не найден') {
      navigate('/admin/login/')
    }
    //@TODO
    // if (errorsServer?.admin) {
    //   navigate(`${errorsServer?.admin}, {replace: true}`)
    // }
  }, [errorsServer, navigate])

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
                  {errors.email?.message || errorsServer?.email}
                </FormHelperText>
              </FormControl>

              <PasswordInput
                name="password"
                label="Пароль"
                control={control}
                errors={{
                  ...errors,
                  password: errors.password || errorsServer?.password,
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
          <FormHelperText error>{errorsServer?.face_descriptor}</FormHelperText>

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

/*
import { useState, useEffect } from 'react'
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
import MessageAlert from '@/components/MessageAlert/MessageAlert'

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
  const [errorsServer, setErrorsServer] = useState(null)
  const { signIn, isLoading, error: authError } = useAuth()

  const fromPage = location.state?.from?.pathname || '/instructions'

  useEffect(() => {
    if (authError) {
      setErrorMessage({
        text:
          authError.data?.error ||
          authError.data?.detail ||
          'Ошибка авторизации. Попробуйте снова.',
        type: 'error',
      })
    }
  }, [authError])

  const onSubmit = async (data) => {
    setErrorMessage(null)
    setErrorsServer(null)

    try {
      const authData = faceDescriptor
        ? { face_descriptor: faceDescriptor }
        : {
            email: data.email,
            password: data.password,
          }

      const result = await signIn(authData)

      // Проверяем успешный ответ (статус 2xx)
      if (Number(result?.status) >= 200 && Number(result?.status) < 300) {
        reset()
        navigate(fromPage, { replace: true, state: result.data })
      } else {
        // Обработка ошибок от сервера
        setErrorsServer(
          result?.data?.errors || {
            general: result?.data?.message || 'Неизвестная ошибка сервера',
          }
        )
      }
    } catch (error) {
      setErrorMessage({
        text: error.message || 'Произошла непредвиденная ошибка',
        type: 'error',
      })
    }
  }

  const handleFaceDescriptor = async (descriptor) => {
    setFaceDescriptor(descriptor)
    setErrorMessage(null)
    setErrorsServer(null)

    try {
      const result = await signIn({ face_descriptor: descriptor })

      if (result?.status >= 200 && result?.status < 300) {
        reset()
        navigate(fromPage, { replace: true, state: result.data })
      } else {
        setErrorMessage({
          text: 'Не удалось войти по лицу. Попробуйте пароль',
          type: 'error',
        })
        setFaceDescriptor(null)
      }
    } catch (error) {
      setErrorMessage({
        text: error.message || 'Ошибка при распознавании лица',
        type: 'error',
      })
      setFaceDescriptor(null)
    }
  }

  const handleSwitchToPassword = () => {
    setFaceDescriptor(null)
    setErrorMessage(null)
    setErrorsServer(null)
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
                  {errors.email?.message || errorsServer?.email}
                </FormHelperText>
              </FormControl>

              <PasswordInput
                name="password"
                label="Пароль"
                control={control}
                errors={{
                  ...errors,
                  password: errors.password || errorsServer?.password,
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

          {errorsServer?.face_descriptor && (
            <FormHelperText error>
              {errorsServer.face_descriptor}
            </FormHelperText>
          )}

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

*/

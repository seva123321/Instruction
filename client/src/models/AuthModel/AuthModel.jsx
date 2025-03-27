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
} from '@mui/material'
import { useForm, Controller } from 'react-hook-form'

import PasswordInput from '@/components/PasswordInput'
import useAuth from '@/hook/useAuth'
import CustomLink from '@/components/CustomLink'
import Recognition from '@/models/Recognition'
import {
  formatPhoneNumber,
  isEmail,
  isPhoneNumber,
} from '@/service/utilsFunction'
import MessageAlert from '@/components/MessageAlert/MessageAlert'

function AuthModel() {
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
  const { signIn } = useAuth()
  const [faceDescriptor, setFaceDescriptor] = useState(null)
  // eslint-disable-next-line operator-linebreak
  const [isFaceDescriptorReceived, setIsFaceDescriptorReceived] =
    useState(false)
  const [errorMessage, setErrorMessage] = useState(null)
  const fromPage = location.state?.from?.pathname || '/instructions'

  const onSubmit = (data) => {
    if (!isFaceDescriptorReceived) {
      return
    }

    const newData = {
      ...data,
      mobile_phone: data.mobile_phone.replaceAll('-', ''),
      face_descriptor: faceDescriptor,
    }
    delete newData.confirmPassword
    const { first_name: firstName } = newData

    alert(JSON.stringify(newData))
    signIn(firstName, () => navigate(fromPage), { replace: true })
    reset()
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
        <CustomLink to="/">Войти</CustomLink>
      </Box>
      <form noValidate autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
        <Box
          display="flex"
          sx={{ width: '40ch', margin: '0 auto' }}
          flexDirection="column"
          alignItems="center"
        >
          {/* Имя */}
          <FormControl
            sx={{ width: '100%', marginBottom: 2 }}
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
            <FormHelperText error>{errors.first_name?.message}</FormHelperText>
          </FormControl>

          {/* Фамилия */}
          <FormControl
            sx={{ width: '100%', marginBottom: 2 }}
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
            <FormHelperText error>{errors.last_name?.message}</FormHelperText>
          </FormControl>

          {/* Поле для email */}
          <FormControl
            sx={{ width: '100%', marginBottom: 2 }}
            variant="outlined"
          >
            <InputLabel htmlFor="email">Почта</InputLabel>
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
                  label="Почта"
                />
              )}
            />
            <FormHelperText error>{errors.email?.message}</FormHelperText>
          </FormControl>

          {/* Поле для телефона */}
          <FormControl
            sx={{ width: '100%', marginBottom: 2 }}
            variant="outlined"
          >
            <InputLabel htmlFor="mobile_phone">Телефон</InputLabel>
            <Controller
              name="mobile_phone"
              control={control}
              defaultValue=""
              rules={{
                required: 'Поле обязательно к заполнению!',
                validate: (value) => {
                  if (!isPhoneNumber(value)) {
                    return 'Проверьте, что вводите телефон в правильном формате, например +7 900 123-33-55'
                  }
                  return true
                },
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
                    const formattedValue = formatPhoneNumber(e.target.value)
                    field.onChange(formattedValue)
                  }}
                />
              )}
            />
            <FormHelperText error>
              {errors.mobile_phone?.message}
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
            onFaceDescriptor={(data) => {
              setFaceDescriptor(data)
              setIsFaceDescriptorReceived(true)
            }}
            onCameraError={(error) => {
              setErrorMessage({
                text: `Ошибка доступа к камере. ${error}`,
                type: 'error',
              })
            }}
          />

          {/* Отображение MessageAlert, если есть ошибка */}
          {errorMessage && (
            <MessageAlert
              message={errorMessage}
              onClose={() => setErrorMessage(null)} // Очистка ошибки при закрытии
            />
          )}

          <Button
            type="submit"
            variant="contained"
            disabled={!isValid || !isFaceDescriptorReceived}
            fullWidth
            sx={{ mt: 2 }}
          >
            Зарегистрироваться
          </Button>
        </Box>
      </form>
    </div>
  )
}

export default AuthModel

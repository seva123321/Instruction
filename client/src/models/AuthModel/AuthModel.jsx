import { useState, useRef, useEffect } from 'react'
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
import {
  CameraAlt as CameraAltIcon,
  PersonAddOutlined as PersonAddOutlinedIcon,
} from '@mui/icons-material'
import { useForm, Controller } from 'react-hook-form'

import PasswordInput from '@/components/PasswordInput'
import useAuth from '@/hook/useAuth'
import CustomLink from '@/components/CustomLink'
import Confirm from '@/components/Confirm'

import FaceRecognition from '../FaceRecognition/FaceRecognition'
import formatPhoneNumber from '../../service/utilsFunction'

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
  const [showFaceRecognition, setShowFaceRecognition] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const [faceDescriptor, setFaceDescriptor] = useState(null)
  // eslint-disable-next-line operator-linebreak
  const [isFaceDescriptorReceived, setIsFaceDescriptorReceived] =
    useState(false)
  const faceRecognitionRef = useRef(null)

  useEffect(() => {
    if (showFaceRecognition && faceRecognitionRef.current) {
      faceRecognitionRef.current.startRecognition()
    }
  }, [showFaceRecognition])

  const handleAllowAccess = async () => {
    try {
      setShowFaceRecognition(true)
    } catch (error) {
      setCameraError(
        'Доступ к камере отклонён. Пожалуйста, разрешите доступ к камере.'
      )
    }
  }

  const fromPage = location.state?.from?.pathname || '/instruction'

  const onSubmit = (data) => {
    if (!isFaceDescriptorReceived) {
      // alert('Пожалуйста, завершите распознавание лица перед отправкой формы.')
      return
    }

    const newData = {
      ...data,
      phone: data.phone.replaceAll('-', ''),
      faceDescriptor, // Добавляем faceDescriptor в данные формы
    }
    const { username } = newData

    // console.log(JSON.stringify(newData))

    // alert(JSON.stringify(newData))
    signIn(username, () => navigate(fromPage), { replace: true })
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
            <InputLabel htmlFor="username">Имя</InputLabel>
            <Controller
              name="username"
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
                  autoComplete="username"
                  id="username"
                  label="Имя"
                />
              )}
            />
            <FormHelperText sx={{ maxWidth: '30ch' }} error>
              {errors.username?.message}
            </FormHelperText>
          </FormControl>

          {/* Фамилия */}
          <FormControl
            sx={{ width: '100%', marginBottom: 2 }}
            variant="outlined"
          >
            <InputLabel htmlFor="usersurname">Фамилия</InputLabel>
            <Controller
              name="usersurname"
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
                  autoComplete="usersurname"
                  id="usersurname"
                  label="Фамилия"
                />
              )}
            />
            <FormHelperText sx={{ maxWidth: '30ch' }} error>
              {errors.usersurname?.message}
            </FormHelperText>
          </FormControl>

          {/* Почта */}
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
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                  message: 'Введите корректный адрес электронной почты',
                },
              }}
              render={({ field }) => (
                <OutlinedInput
                  {...field}
                  autoComplete="email"
                  id="email"
                  label="Почта"
                />
              )}
            />
            <FormHelperText sx={{ maxWidth: '30ch' }} error>
              {errors.email?.message}
            </FormHelperText>
          </FormControl>

          {/* Телефон */}
          <FormControl
            sx={{ width: '100%', marginBottom: 2 }}
            variant="outlined"
          >
            <InputLabel htmlFor="phone">Телефон</InputLabel>
            <Controller
              name="phone"
              control={control}
              defaultValue=""
              rules={{
                required: 'Поле обязательно к заполнению!',
                pattern: {
                  value: /^\+?\d{1,3}-\d{3}-\d{3}-\d{2}-\d{2}$/,
                  message:
                    'Проверьте, что вводите телефон в правильном формате, например +7 900 123-33-55',
                },
              }}
              render={({ field }) => (
                <OutlinedInput
                  {...field}
                  autoComplete="phone"
                  id="phone"
                  label="Телефон"
                  value={formatPhoneNumber(field.value)}
                  onChange={(e) => {
                    const formattedValue = formatPhoneNumber(e.target.value)
                    field.onChange(formattedValue)
                  }}
                />
              )}
            />
            <FormHelperText sx={{ maxWidth: '30ch' }} error>
              {errors.phone?.message}
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

          {/* Кнопка для запуска распознавания лица */}
          <Confirm
            textTitle="Разрешение на использование камеры"
            text="Разрешить использование камеры для распознавания лица?"
            btnIcon={<PersonAddOutlinedIcon />}
            titleIcon={<CameraAltIcon sx={{ mr: 2 }} />}
            buttonName="Распознавание лица*"
            onAllowAccess={handleAllowAccess} // передача функции!/не события
          />

          {/* Сообщение об ошибке доступа к камере */}
          {cameraError && (
            <FormHelperText error sx={{ mt: 1 }}>
              {cameraError}
            </FormHelperText>
          )}

          {/* Компонент FaceRecognition */}
          {showFaceRecognition && (
            <FaceRecognition
              ref={faceRecognitionRef}
              onClose={() => setShowFaceRecognition(false)}
              onFaceDescriptor={(data) => {
                setFaceDescriptor(data)
                setIsFaceDescriptorReceived(true) // Обновляем состояние при получении данных
              }}
              onCameraError={(error) => setCameraError(error.message)}
            />
          )}

          {/* Кнопка регистрации */}
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

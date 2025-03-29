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
  Alert,
} from '@mui/material'
import { useForm, Controller } from 'react-hook-form'

import CustomLink from '@/components/CustomLink'
import PasswordInput from '@/components/PasswordInput'
import useAuth from '@/hook/useAuth'
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
  } = useForm({ mode: 'onBlur' })

  const [faceDescriptor, setFaceDescriptor] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)
  const { signIn, isLoading, error: authError } = useAuth()

  const fromPage = location.state?.from?.pathname || '/instructions'

  useEffect(() => {
    if (authError) {
      setErrorMessage({
        text: authError.data.detail || 'Ошибка авторизации. Попробуйте снова.',
        type: 'error',
      })
    }
  }, [authError])

  const onSubmit = async (data) => {
    setErrorMessage(null)
    try {
      const authData = faceDescriptor
        ? { face_descriptor: faceDescriptor }
        : { email: data.email, password: data.password }

      const success = await signIn(authData)

      if (success) {
        reset()
        navigate(fromPage, { replace: true })
      }
    } catch (error) {
      setErrorMessage({
        text: error.message || 'Произошла непредвиденная ошибка',
        type: 'error',
      })
    }
  }

  const handleFaceDescriptor = async (data) => {
    setFaceDescriptor(data)
    await onSubmit({ faceDescriptor: data })
  }

  const handleSwitchToPassword = () => {
    setFaceDescriptor(null)
    setErrorMessage(null)
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
          sx={{ width: '40ch', margin: '0 auto' }}
          flexDirection="column"
          alignItems="center"
        >
          {!faceDescriptor && (
            <>
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
                  {errors.email?.message || authError?.data?.errors?.email}
                </FormHelperText>
              </FormControl>

              <PasswordInput
                name="password"
                label="Пароль"
                control={control}
                errors={{
                  ...errors,
                  password:
                    errors.password ||
                    (authError?.data?.errors?.password && {
                      message: authError.data.errors.password,
                    }),
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
            sx={{ marginTop: 2, width: '100%' }}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Войти'}
          </Button>
        </Box>
      </form>

      {errorMessage && (
        <Alert
          severity={errorMessage.type}
          onClose={() => setErrorMessage(null)}
          sx={{
            position: 'fixed',
            bottom: 40,
            left: '50%',
            transform: 'translateX(-50%)',
            maxWidth: '600px',
            zIndex: 1000,
          }}
        >
          {errorMessage.text}
        </Alert>
      )}
    </div>
  )
}

export default LoginModel

// import { useState } from 'react'
// import { useLocation, useNavigate } from 'react-router-dom'
// import {
//   Button,
//   Box,
//   Typography,
//   FormHelperText,
//   FormControl,
//   InputLabel,
//   OutlinedInput,
//   CircularProgress,
// } from '@mui/material'
// import { useForm, Controller } from 'react-hook-form'

// import CustomLink from '@/components/CustomLink'
// import PasswordInput from '@/components/PasswordInput'
// import useAuth from '@/hook/useAuth'
// import MessageAlert from '@/components/MessageAlert'
// import { isEmail } from '@/service/utilsFunction'
// import Recognition from '@/models/Recognition'

// function LoginModel() {
//   const navigate = useNavigate()
//   const location = useLocation()
//   const {
//     formState: { errors, isValid },
//     handleSubmit,
//     reset,
//     watch,
//     control,
//   } = useForm({ mode: 'onBlur' })

//   const [faceDescriptor, setFaceDescriptor] = useState(null)
//   const { signIn, isLoading, error: authError } = useAuth()
//   const fromPage = location.state?.from?.pathname || '/instructions'

//   const onSubmit = async (data) => {
//     const authData = faceDescriptor
//       ? { face_descriptor: faceDescriptor }
//       : { email: data.email, password: data.password }

//     const success = await signIn(authData)

//     if (success) {
//       reset()
//       navigate(fromPage, { replace: true })
//     }
//   }

//   const handleFaceDescriptor = (data) => {
//     setFaceDescriptor(data)
//     handleSubmit(onSubmit)()
//   }

//   return (
//     <div>
//       <Box
//         display="flex"
//         justifyContent="space-between"
//         alignItems="center"
//         sx={{ mb: 2 }}
//       >
//         <Typography variant="h5">Войти</Typography>
//         <CustomLink to="/auth/signup">Зарегистрироваться</CustomLink>
//       </Box>

//       <form noValidate autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
//         <Box
//           display="flex"
//           sx={{ width: '40ch', margin: '0 auto' }}
//           flexDirection="column"
//           alignItems="center"
//         >
//           {/* Поле для логина */}
//           {!faceDescriptor && (
//             <FormControl
//               sx={{ width: '100%', marginBottom: 2 }}
//               variant="outlined"
//             >
//               <InputLabel htmlFor="email">Логин (почта)</InputLabel>
//               <Controller
//                 name="email"
//                 control={control}
//                 defaultValue=""
//                 rules={{
//                   required: 'Поле обязательно к заполнению!',
//                   validate: (value) =>
//                     isEmail(value) ||
//                     'Введите корректный адрес электронной почты',
//                 }}
//                 render={({ field }) => (
//                   <OutlinedInput
//                     {...field}
//                     inputMode="email"
//                     autoComplete="email"
//                     id="email"
//                     label="Логин (почта)"
//                   />
//                 )}
//               />
//               <FormHelperText error>
//                 {(authError && authError.data?.errors.email) ||
//                   errors.email?.message}
//               </FormHelperText>
//             </FormControl>
//           )}

//           {/* Поле для пароля */}
//           {!faceDescriptor && (
//             <PasswordInput
//               name="password"
//               label="Пароль"
//               control={control}
//               errors={{
//                 ...errors,
//                 password:
//                   errors.password ||
//                   (authError?.data?.errors?.password && {
//                     message: authError.data.errors.password,
//                   }),
//               }}
//               watch={watch}
//               disabled={isLoading}
//             />
//           )}

//           {/* Компонент для распознавания лица */}
//           <Recognition
//             onFaceDescriptor={handleFaceDescriptor}
//             onCameraError={(err) => {
//               MessageAlert.show({
//                 text: `Ошибка доступа к камере: ${err.message || err}`,
//                 type: 'error',
//               })
//             }}
//           />

//           {/* Кнопка для входа */}
//           <Button
//             type="submit"
//             variant="contained"
//             disabled={(!isValid && !faceDescriptor) || isLoading}
//             sx={{ marginTop: 2, width: '100%' }}
//           >
//             {isLoading ? <CircularProgress size={24} /> : 'Войти'}
//           </Button>
//         </Box>
//       </form>

//       {console.log('authError > ', authError && authError.data?.detail)}
//       {/* Отображение ошибок из провайдера */}
//       {authError && (
//         <MessageAlert
//           message={{
//             text:
//               authError.data?.detail || 'Ошибка авторизации. Попробуйте снова.',
//             type: 'error',
//           }}
//           duration={5000}
//         />
//       )}
//     </div>
//   )
// }
// export default LoginModel

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

import CustomLink from '@/components/CustomLink'
import PasswordInput from '@/components/PasswordInput'
import useAuth from '@/hook/useAuth'

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
  const fromPage = location.state?.from?.pathname || '/instruction'

  const onSubmit = (data) => {
    // alert(JSON.stringify(data))
    // const { username, usersurname, password, confirmPassword } = data
    const { username } = data
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

          <PasswordInput
            name="password"
            label="Пароль"
            control={control}
            errors={errors}
            watch={watch}
          />

          <PasswordInput
            name="confirmPassword"
            label="Повторите пароль"
            control={control}
            errors={errors}
            watch={watch}
          />

          <Button
            type="submit"
            variant="contained"
            disabled={!isValid}
            sx={{ marginTop: 2, width: '100%' }}
          >
            Зарегистрироваться
          </Button>
        </Box>
      </form>
    </div>
  )
}

export default AuthModel

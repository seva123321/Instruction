import { useLocation, useNavigate } from 'react-router-dom'
import {
  TextField as MuiTextField,
  Button,
  Box,
  FormHelperText,
} from '@mui/material'
import { styled } from '@mui/material/styles'
import { useForm } from 'react-hook-form'

import PasswordInput from '@/components/PasswordInput'
import useAuth from '@/hook/useAuth'

const TextField = styled(MuiTextField)(({ theme }) => ({
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(1),
  display: 'block',
}))

function AuthPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const {
    register,
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
      <form noValidate autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
        <Box display="flex" flexDirection="column" alignItems="center">
          <TextField
            label="Имя"
            variant="outlined"
            autoComplete="username"
            required
            {...register('username', {
              required: 'Поле обязательно к заполнению!',
              pattern: {
                value: /^[a-zA-Zа-яА-Я\s-]+$/,
                message:
                  'Разрешены только русские и латинские буквы, пробел и тире',
              },
            })}
            error={!!errors.username}
          />
          <FormHelperText sx={{ maxWidth: '30ch' }} error>
            {errors.username?.message}
          </FormHelperText>

          <TextField
            label="Фамилия"
            variant="outlined"
            autoComplete="usersurname"
            required
            {...register('usersurname', {
              required: 'Поле обязательно к заполнению!',
              pattern: {
                value: /^[a-zA-Zа-яА-Я\s-]+$/,
                message:
                  'Разрешены только русские и латинские буквы, пробелы и тире',
              },
            })}
            error={!!errors.usersurname}
          />
          <FormHelperText sx={{ maxWidth: '30ch' }} error>
            {errors.usersurname?.message}
          </FormHelperText>

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
            sx={{ marginTop: 2 }}
          >
            Зарегистрироваться
          </Button>
        </Box>
      </form>
    </div>
  )
}

export default AuthPage

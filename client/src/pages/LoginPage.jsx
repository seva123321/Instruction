import { useLocation, useNavigate } from 'react-router-dom'
import { TextField as MuiTextField, Button, Box } from '@mui/material'
import { styled } from '@mui/material/styles'
import { useForm } from 'react-hook-form'

import PasswordInput from '@/components/PasswordInput'
import useAuth from '@/hook/useAuth'

const TextField = styled(MuiTextField)(({ theme }) => ({
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
  display: 'block',
}))

function LoginPage() {
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
    // const { username, password } = data
    const { username } = data
    signIn(username, () => navigate(fromPage), { replace: true })
    reset()
  }

  return (
    <div>
      <form noValidate autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
        <Box display="flex" flexDirection="column" alignItems="center">
          <TextField
            label="Логин"
            variant="outlined"
            required
            autoComplete="username"
            {...register('username', {
              required: 'Поле обязательно к заполнению!',
            })}
            error={!!errors.username}
            helperText={errors.username?.message}
          />

          <PasswordInput
            name="password"
            label="Пароль"
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
            Войти
          </Button>
        </Box>
      </form>
    </div>
  )
}

export default LoginPage

import { useLocation, useNavigate } from 'react-router-dom'
import {
  Button,
  Box,
  Typography,
  FormHelperText,
  FormControl,
  InputLabel,
  OutlinedInput,
} from '@mui/material'
import { useForm, Controller } from 'react-hook-form'

import CustomLink from '@/components/CustomLink'
import PasswordInput from '@/components/PasswordInput'
import useAuth from '@/hook/useAuth'

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
  const { signIn } = useAuth()

  const fromPage = location.state?.from?.pathname || '/instruction'

  const onSubmit = (data) => {
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
                required: 'Поле обязательно к заполнению!',
              }}
              render={({ field }) => (
                <OutlinedInput
                  {...field}
                  autoComplete="username"
                  id="username"
                  label="Логин"
                />
              )}
            />
            <FormHelperText error>{errors.username?.message}</FormHelperText>
          </FormControl>

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
            sx={{ marginTop: 2, width: '100%' }}
          >
            Войти
          </Button>
        </Box>
      </form>
    </div>
  )
}

export default LoginModel

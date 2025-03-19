import { useState } from 'react'
import { Controller } from 'react-hook-form'
import { Typography } from '@mui/material'
import { styled } from '@mui/material/styles'
import IconButton from '@mui/material/IconButton'
import OutlinedInput from '@mui/material/OutlinedInput'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import InputLabel from '@mui/material/InputLabel'
import InputAdornment from '@mui/material/InputAdornment'
import FormControl from '@mui/material/FormControl'

const ErrorText = styled(Typography)(({ theme }) => ({
  color: theme.palette.error.main,
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(1),
  marginLeft: theme.spacing(2),
  fontSize: '0.775rem',
}))

function PasswordInput({ name, label, control, errors, ...props }) {
  const [showPassword, setShowPassword] = useState(false)
  const { watch } = props
  const handleClickShowPassword = () => setShowPassword((show) => !show)
  const handleMouseDownPassword = (event) => {
    event.preventDefault()
  }

  return (
    <FormControl sx={{ width: '25ch', marginTop: 2 }} variant="outlined">
      <InputLabel htmlFor={name}>{label}</InputLabel>
      <Controller
        name={name}
        control={control}
        defaultValue=""
        rules={{
          required: 'Поле обязательно к заполнению!',
          ...(name === 'password' && {
            minLength: {
              value: 5,
              message: 'Минимум 5 символов',
            },
          }),
          ...(name === 'confirmPassword' && {
            validate: (value) =>
              // eslint-disable-next-line implicit-arrow-linebreak
              value === watch('password') || 'Пароли не совпадают',
          }),
        }}
        render={({ field }) => (
          <OutlinedInput
            {...field}
            autoComplete="off"
            id={name}
            type={showPassword ? 'text' : 'password'}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label={
                    showPassword ? 'hide the password' : 'display the password'
                  }
                  onClick={handleClickShowPassword}
                  onMouseDown={handleMouseDownPassword}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            }
            label={label}
          />
        )}
      />
      {errors[name] && <ErrorText>{errors[name].message}</ErrorText>}
    </FormControl>
  )
}

export default PasswordInput

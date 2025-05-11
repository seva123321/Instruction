import { useState } from 'react'
import { Controller } from 'react-hook-form'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import {
  IconButton,
  OutlinedInput,
  InputLabel,
  InputAdornment,
  FormControl,
  FormHelperText,
} from '@mui/material'

function PasswordInput({ name, label, control, errors, ...props }) {
  const [showPassword, setShowPassword] = useState(false)
  const { watch } = props

  const handleClickShowPassword = () => setShowPassword((show) => !show)
  const handleMouseDownPassword = (e) => {
    e.preventDefault()
  }

  return (
    <FormControl
      sx={{
        width: '100%',
        marginBottom: 2,
      }}
      variant="outlined"
    >
      <InputLabel htmlFor={name}>{label}</InputLabel>
      <Controller
        name={name}
        control={control}
        defaultValue=""
        rules={{
          required: 'Поле обязательно к заполнению!',
          pattern: /^[a-zA-Zа-яА-Я0-9\s-]+$/,
          ...(name === 'password' && {
            minLength: {
              value: 5,
              message: 'Минимум 5 символов',
            },
          }),
          ...(name === 'confirmPassword' && {
            validate: (value) =>
              value === watch('password') || 'Пароли не совпадают',
          }),
        }}
        render={({ field }) => (
          <OutlinedInput
            {...field}
            autoComplete="off"
            id={name}
            required
            type={showPassword ? 'text' : 'password'}
            error={!!errors[name]}
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
                  {showPassword ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </InputAdornment>
            }
            label={label}
          />
        )}
      />
      <FormHelperText sx={{ maxWidth: '30ch' }} error>
        {errors[name]?.message || errors[name]}
      </FormHelperText>
    </FormControl>
  )
}

export default PasswordInput

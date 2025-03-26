import {
  FormGroup,
  FormControlLabel,
  Checkbox,
  Button,
  Box,
  Typography,
  Divider,
} from '@mui/material'
import { useForm, useWatch } from 'react-hook-form'
import { useState } from 'react'
import PropTypes from 'prop-types'

import CheckboxList from '@/components/CheckboxList'

function CheckboxFields({ agreements }) {
  const defaultValues = agreements.reduce((acc, item) => {
    acc[item.name] = false
    return acc
  }, {})

  const { register, handleSubmit, setValue, control } = useForm({
    defaultValues,
  })
  const [allChecked, setAllChecked] = useState(false)

  // Отдельно отслеживаем нужные чекбоксы
  const complianceValue = useWatch({
    control,
    name: 'compliance',
    defaultValue: false,
  })

  const isPassedValue = useWatch({
    control,
    name: 'is_passed',
    defaultValue: false,
  })

  // Проверяем существование нужных чекбоксов
  const hasCompliance = agreements.some((item) => item.name === 'compliance')
  const hasIsPassed = agreements.some((item) => item.name === 'is_passed')

  // Проверяем состояние чекбоксов, если они существуют
  // eslint-disable-next-line operator-linebreak
  const isSubmitValid =
    (!hasCompliance || complianceValue) && (!hasIsPassed || isPassedValue)

  const onSubmit = (data) => {
    console.log('Form data:', data)
    // Отправка данных формы
  }

  const handleSelectAll = (e) => {
    const { checked } = e.target
    setAllChecked(checked)
    agreements.forEach((item) => {
      setValue(item.name, checked, { shouldValidate: true })
    })
  }

  const styles = {
    formContainer: {
      border: '1px solid',
      borderColor: 'divider',
      borderRadius: 2,
      p: { xs: 2, sm: 3 },
      mb: 3,
      backgroundColor: 'background.paper',
      boxShadow: 1,
    },
    selectAll: {
      py: 1,
      mb: 1,
      borderBottom: '1px solid',
      borderColor: 'divider',
    },
    checkboxItem: {
      py: 1.5,
      '&:not(:last-child)': {
        borderBottom: '1px solid',
        borderColor: 'divider',
      },
    },
    submitButton: {
      mt: 3,
      px: 4,
      py: 1.5,
      fontSize: '1rem',
      fontWeight: 'bold',
    },
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={styles.formContainer}
    >
      <FormGroup>
        <Box sx={styles.selectAll}>
          <FormControlLabel
            control={
              <Checkbox
                checked={allChecked}
                onChange={handleSelectAll}
                size="medium"
              />
            }
            label={
              <Typography variant="subtitle1" fontWeight="bold">
                ВЫБРАТЬ ВСЕ ВАРИАНТЫ
              </Typography>
            }
          />
        </Box>

        <Divider sx={{ mb: 1 }} />

        <CheckboxList
          data={agreements}
          register={register}
          control={control}
          sx={styles.checkboxItem}
        />
      </FormGroup>

      <Button
        type="submit"
        variant="contained"
        color="primary"
        size="large"
        disabled={!isSubmitValid}
        sx={styles.submitButton}
        fullWidth
      >
        Подписать инструктаж
      </Button>
    </Box>
  )
}

CheckboxFields.propTypes = {
  agreements: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired,
    })
  ).isRequired,
}

export default CheckboxFields

import { useState, useMemo, useCallback, lazy, Suspense } from 'react'
import {
  FormGroup,
  FormControlLabel,
  Checkbox,
  Box,
  Typography,
  Divider,
  Alert,
} from '@mui/material'
import { useForm, useWatch } from 'react-hook-form'
import PropTypes from 'prop-types'
import LinkedCameraIcon from '@mui/icons-material/LinkedCamera'

import Recognition from '@/models/Recognition'
import CheckboxList from '@/components/CheckboxList'
import { usePostInstructionResultsMutation } from '@/slices/instructionApi'

function CheckboxFields({ agreements = [], id }) {
  const defaultValues = useMemo(
    () =>
      (agreements || []).reduce((acc, item) => {
        if (item && item.name) {
          acc[item.name] = false
        }
        return acc
      }, {}),
    [agreements]
  )

  const { register, handleSubmit, setValue, control, getValues } = useForm({
    defaultValues,
  })
  const [allChecked, setAllChecked] = useState(false)
  const [faceDescriptor, setFaceDescriptor] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [postInstructionResults] = usePostInstructionResultsMutation()

  const handleReset = useCallback(() => {
    Object.keys(defaultValues).forEach((name) => {
      setValue(name, false, { shouldDirty: false })
    })
    setAllChecked(false)
    setFaceDescriptor(null)
  }, [defaultValues, setValue])

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

  const isSubmitValid =
    (!hasCompliance || complianceValue) && (!hasIsPassed || isPassedValue)

  const submitFormData = useCallback(
    async (descriptor = null) => {
      try {
        setIsSubmitting(true)
        setErrorMessage(null)

        // Получаем текущие значения формы
        const formValues = getValues()

        // Формируем данные для отправки
        const submissionData = {
          instruction_id: id,
          instruction_agreement: Object.entries(formValues).map(
            ([key, value]) => ({
              [key]: value,
            })
          ),
          face_descriptor: descriptor || faceDescriptor,
        }

        await postInstructionResults(submissionData).unwrap()

        // Сброс формы после успешной отправки
        handleReset()
      } catch (error) {
        setErrorMessage({
          text: error.message || 'Произошла непредвиденная ошибка',
          type: 'error',
        })
      } finally {
        setIsSubmitting(false)
      }
    },
    [getValues, id, faceDescriptor, handleReset, postInstructionResults]
  )

  const onSubmit = async () => {
    await submitFormData()
  }

  const handleSelectAll = (e) => {
    const { checked } = e.target
    setAllChecked(checked)
    agreements.forEach((item) => {
      setValue(item.name, checked, { shouldValidate: true })
    })
  }

  const handleFaceDescriptor = async (data) => {
    setFaceDescriptor(data)
    await submitFormData(data) // Отправляем данные сразу после распознавания
  }

  const styles = {
    formContainer: {
      border: '1px solid',
      borderColor: 'divider',
      borderRadius: 2,
      p: {
        xs: 2,
        sm: 3,
      },
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

      <Recognition
        buttonName="Подписать инструктаж"
        btnIcon={<LinkedCameraIcon />}
        disabled={!isSubmitValid || isSubmitting}
        onFaceDescriptor={handleFaceDescriptor}
        onCameraError={(err) => {
          setErrorMessage({
            text: `Ошибка камеры: ${err.message || 'Не удалось получить доступ'}`,
            type: 'error',
          })
        }}
      />
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

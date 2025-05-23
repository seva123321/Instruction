import { useState, useCallback, useMemo, useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import {
  FormGroup,
  FormControlLabel,
  Checkbox,
  Box,
  Typography,
  Divider,
  Alert,
} from '@mui/material'
import LinkedCameraIcon from '@mui/icons-material/LinkedCamera'
import PropTypes from 'prop-types'

import Recognition from '@/models/Recognition'
import CheckboxList from '@/components/CheckboxList'
import { usePostInstructionResultsMutation } from '@/slices/instructionApi'
import { useLazyGetAesKeyQuery } from '@/slices/userApi'

const formContainerStyles = {
  border: '1px solid',
  borderColor: 'divider',
  borderRadius: 2,
  p: { xs: 2, sm: 3 },
  mb: 3,
  backgroundColor: 'background.paper',
  boxShadow: 1,
}

const selectAllStyles = {
  py: 1,
  mb: 1,
  borderBottom: '1px solid',
  borderColor: 'divider',
}

const checkboxItemStyles = {
  py: 1.5,
  '&:not(:last-child)': {
    borderBottom: '1px solid',
    borderColor: 'divider',
  },
}

function CheckboxFields({ agreements = [], id }) {
  const defaultValues = agreements.reduce((acc, item) => {
    if (item?.name) acc[item.name] = false
    return acc
  }, {})

  const { register, handleSubmit, setValue, control, getValues, reset, watch } =
    useForm({
      defaultValues,
    })

  const [allChecked, setAllChecked] = useState(false)
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [postInstructionResults] = usePostInstructionResultsMutation()
  const [fetchAesKey] = useLazyGetAesKeyQuery()

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

  const formValues = watch() // Следим за всеми значениями формы

  const hasCompliance = useMemo(
    () => agreements.some((item) => item.name === 'compliance'),
    [agreements]
  )
  const hasIsPassed = useMemo(
    () => agreements.some((item) => item.name === 'is_passed'),
    [agreements]
  )

  const isSubmitValid =
    (!hasCompliance || complianceValue) && (!hasIsPassed || isPassedValue)

  // Эффект для синхронизации состояния "Выбрать все"
  useEffect(() => {
    const allAgreementsChecked = agreements.every(
      (item) => formValues[item.name] === true
    )
    setAllChecked(allAgreementsChecked)
  }, [formValues, agreements])

  const handleReset = useCallback(() => {
    reset(defaultValues)
    setAllChecked(false)
    setError(null)
  }, [defaultValues, reset])

  const handleError = useCallback((message, type = 'error') => {
    setError({ text: message, type })
  }, [])

  const submitFormData = useCallback(
    async (descriptor = null) => {
      try {
        setIsSubmitting(true)
        setError(null)

        const submissionData = {
          instruction_id: id,
          instruction_agreement: Object.entries(getValues()).map(
            ([key, value]) => ({ [key]: value })
          ),
          face_descriptor: descriptor,
        }
        const { data: currentAesKey } = await fetchAesKey()
        if (!currentAesKey) {
          throw new Error('AES key not available')
        }

        await postInstructionResults({
          submissionData,
          aesKey: currentAesKey,
        }).unwrap()

        handleReset()
      } catch (err) {
        handleError(err.message || 'Произошла непредвиденная ошибка')
      } finally {
        setIsSubmitting(false)
      }
    },
    [
      getValues,
      handleReset,
      handleError,
      id,
      postInstructionResults,
      fetchAesKey,
    ]
  )

  const handleSelectAll = (e) => {
    const { checked } = e.target
    setAllChecked(checked)
    agreements.forEach(
      (item) => setValue(item.name, checked, { shouldValidate: true })
      // eslint-disable-next-line function-paren-newline
    )
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(() => submitFormData())}
      sx={formContainerStyles}
    >
      <FormGroup>
        <Box sx={selectAllStyles}>
          <FormControlLabel
            control={
              <Checkbox
                checked={allChecked}
                onChange={handleSelectAll}
                size="medium"
                indeterminate={
                  !allChecked &&
                  agreements.some((item) => formValues[item.name] === true)
                }
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
          sx={checkboxItemStyles}
        />
      </FormGroup>

      <Recognition
        buttonName="Подписать инструктаж"
        btnIcon={<LinkedCameraIcon />}
        disabled={!isSubmitValid || isSubmitting}
        onFaceDescriptor={submitFormData}
        onCameraError={
          (err) =>
            handleError(
              `Ошибка камеры: ${err.message || 'Не удалось получить доступ'}`
            )
          // eslint-disable-next-line react/jsx-curly-newline
        }
      />

      {error && (
        <Alert
          severity={error.type}
          onClose={() => setError(null)}
          sx={{
            position: 'fixed',
            bottom: 40,
            left: '50%',
            transform: 'translateX(-50%)',
            maxWidth: '600px',
            zIndex: 1000,
          }}
        >
          {error.text}
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
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
}

export default CheckboxFields

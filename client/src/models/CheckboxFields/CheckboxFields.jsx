import { FormGroup, FormControlLabel, Checkbox, Button } from '@mui/material'
import { useForm, useWatch } from 'react-hook-form'
import { useState, useEffect } from 'react'

import CheckboxList from '@/components/CheckboxList'

function CheckboxFields({ agreements }) {
  // Инициализация значений формы
  const defaultValues = agreements.reduce((acc, item) => {
    const [key] = Object.entries(item)[0]
    acc[key] = false
    return acc
  }, {})

  const { register, handleSubmit, setValue, control } = useForm({
    defaultValues,
  })
  const [allChecked, setAllChecked] = useState(false)

  // Подписываемся на изменения всех чекбоксов
  const watchAllCheckboxes = useWatch({
    control,
    name: agreements.map((item) => Object.keys(item)[0]),
  })

  // Эффект для обновления состояния "Выбрать все"
  useEffect(() => {
    const allCheckedValue = watchAllCheckboxes.every((value) => value === true)
    setAllChecked(allCheckedValue)
  }, [watchAllCheckboxes])

  // Проверяем состояние чекбоксов compliance и isPassed
  const complianceChecked = watchAllCheckboxes.find((value, index) => {
    const key = Object.keys(agreements[index])[0]
    return key === 'compliance' && value === true
  })

  const isPassedChecked = watchAllCheckboxes.find((value, index) => {
    const key = Object.keys(agreements[index])[0]
    return key === 'isPassed' && value === true
  })

  const isSubmitValid = complianceChecked === true && isPassedChecked === true

  const onSubmit = (data, e) => {
    e.preventDefault()
    // console.log('form > ', data)
  }

  const handleSelectAll = (e) => {
    const { checked } = e.target
    setAllChecked(checked)

    agreements.forEach((item) => {
      const [key] = Object.entries(item)[0]
      setValue(key, checked, { shouldValidate: true })
    })
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      style={{
        border: '1px solid #1976d2',
        borderRadius: '10px 10px',
        padding: '16px',
      }}
    >
      <FormGroup>
        <FormControlLabel
          control={<Checkbox checked={allChecked} onChange={handleSelectAll} />}
          label="ВЫБРАТЬ ВСЕ ВАРИАНТЫ"
          sx={{ fontSize: 30 }}
        />
        <CheckboxList data={agreements} register={register} control={control} />
      </FormGroup>
      <Button
        type="submit"
        variant="contained"
        sx={{ m: '24px auto', display: 'block' }}
        disabled={!isSubmitValid}
      >
        Подписать инструктаж
      </Button>
    </form>
  )
}

export default CheckboxFields

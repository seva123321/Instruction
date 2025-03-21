import agreements from '@/service/constValues'

import CheckboxFields from '../models/CheckboxFields/CheckboxFields'

function InstructionPage() {
  return (
    <div>
      <h1>Инструктаж</h1>

      <CheckboxFields agreements={agreements} />
    </div>
  )
}

export default InstructionPage

// import { FormGroup, FormControlLabel, Checkbox, Button } from '@mui/material'
// import { useForm } from 'react-hook-form'
// import { useState, useEffect } from 'react'
// import agreements from '../service/constValues'

// function InstructionPage() {
//   // Инициализация значений формы
//   const defaultValues = agreements.reduce((acc, item) => {
//     const [key] = Object.entries(item)[0]
//     acc[key] = false // Устанавливаем начальное значение false для каждого чекбокса
//     return acc
//   }, {})

//   const { register, handleSubmit, setValue, watch } = useForm({ defaultValues })
//   const [allChecked, setAllChecked] = useState(false)

//   // Следим за состоянием всех чекбоксов
//   const watchAllCheckboxes = watch(
//     agreements.map((item) => Object.keys(item)[0])
//   )

//   // Эффект для обновления состояния "Выбрать все"
//   useEffect(() => {
//     const allCheckedValue = watchAllCheckboxes.every((value) => value === true)
//     setAllChecked(allCheckedValue)
//   }, [watchAllCheckboxes])

//   const onSubmit = (data, e) => {
//     e.preventDefault()
//     console.log('form > ', data)
//   }

//   // Обработчик для выбора всех чекбоксов
//   const handleSelectAll = (e) => {
//     const { checked } = e.target
//     setAllChecked(checked)

//     agreements.forEach((item) => {
//       const [key] = Object.entries(item)[0]
//       setValue(key, checked, { shouldValidate: true })
//     })
//   }

//   return (
//     <div>
//       <h1>Инструктаж</h1>

//       <form onSubmit={handleSubmit(onSubmit)}>
//         <FormGroup>
//           <FormControlLabel
//             control={
//               <Checkbox checked={allChecked} onChange={handleSelectAll} />
//             }
//             label="Выбрать все"
//             sx={{ fontSize: 30 }}
//           />

//           {agreements.map((item) => {
//             const [key, value] = Object.entries(item)[0]
//             return (
//               <FormControlLabel
//                 key={key}
//                 control={
//                   <Checkbox
//                     checked={watch(key)} // watch для отображения текущего состояния
//                     {...register(key)}
//                   />
//                 }
//                 label={value}
//               />
//             )
//           })}
//         </FormGroup>
//         <Button type="submit" variant="contained">
//           Подписать инструктаж
//         </Button>
//       </form>
//     </div>
//   )
// }

// export default InstructionPage

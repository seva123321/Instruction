/* eslint-disable indent */
/* eslint-disable operator-linebreak */
import { useParams } from 'react-router-dom'
import { useTheme } from '@mui/material/styles'
import { Box, CircularProgress } from '@mui/material'

import OneInstructionPage from '@/models/OneInstructionPage'
import TabsWrapper from '@/components/TabsWrapper'

import {
  useGetInstructionsQuery,
  useGetInstructionByIdQuery,
} from '../slices/instructionApi'

function InstructionsPage() {
  const { id } = useParams()
  const theme = useTheme()

  // Запрос для получения списка инструкций
  const {
    data: instructions,
    isLoading,
    error,
  } = useGetInstructionsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  })

  // Запрос для получения конкретной инструкции по ID
  const {
    data: singleInstruction,
    isFetching: isSingleLoading,
    error: singleError,
  } = useGetInstructionByIdQuery(id, {
    skip: !id, // Пропускаем запрос если нет ID
  })

  if (isLoading) return <CircularProgress size={50} />
  if (error) {
    return <div>Ошибка в загрузке Инструкции</div>
  }

  // Определяем какие данные передавать в компонент
  const instructionToRender = id
    ? singleInstruction
    : instructions?.first_instruction

  const tabs =
    instructions?.results?.length > 1
      ? instructions.results.map((instruction) => ({
          label: instruction.name,
          to: `/instructions/${instruction.id}`,
        }))
      : null

  return (
    <Box
      sx={{
        [theme.breakpoints.down('sm')]: {
          mt: 3,
        },
      }}
    >
      {tabs && <TabsWrapper tabs={tabs} centered useRouter />}
      <OneInstructionPage
        data={instructionToRender}
        isLoading={isSingleLoading && !!id} // Показываем загрузку только при запросе по ID
        error={singleError}
      />
    </Box>
  )
}

export default InstructionsPage

// import { useState } from 'react'
// import { useNavigate, useLocation, useParams } from 'react-router-dom'
// import { useGetInstructionsQuery } from '../slices/instructionApi'
// import OneInstructionPage from '@/components/OneInstructionPage/OneInstructionPage'
// import TabsWrapper from '@/components/TabsWrapper'
// import { instructionsData } from '../service/constValues'
// import { getCsrfToken } from '@/utils/cookies'

// function InstructionsPage() {
//   const { data, isLoading, error, refetch } = useGetInstructionsQuery(
//     undefined,
//     {
//       // Дополнительные опции запроса
//       refetchOnMountOrArgChange: true,
//     }
//   )
//   const { id } = useParams()
//   const navigate = useNavigate()
//   const location = useLocation()
//   const [instruction, setInstruction] = useState(null)

//   // Используем данные из API или fallback
//   const instructions = data

//   if (isLoading) return <div>Loading...</div>
//   if (error) {
//     console.error('Error loading instructions:', error)
//     return <div>Error loading instructions</div>
//   }
//   if (id) {
//     const csrfToken = getCsrfToken()
//     fetch(`/api/instructions/${id}/`, {
//       method: 'GET',
//       headers: {
//         'Content-Type': 'application/json',
//         'X-CSRFToken': csrfToken,
//       },
//     })
//       .then((res) => res.json())
//       .then((data) => {
//         setInstruction(data)
//         console.log(data)
//       })
//       .catch((err) => console.log('err > ', err))
//   }

//   const tabs =
//     instructions?.results?.length > 1
//       ? instructions.results.map((instruction) => ({
//           label: instruction.name,
//           to: `/instructions/${instruction.id}`,
//         }))
//       : null

//   const dataRended =
//     instructions?.first_instruction && !id
//       ? instructions?.first_instruction
//       : instruction

//   return (
//     <div>
//       {tabs && <TabsWrapper centered tabs={tabs} useRouter />}
//       <OneInstructionPage data={dataRended} />
//     </div>
//   )
// }

// export default InstructionsPage

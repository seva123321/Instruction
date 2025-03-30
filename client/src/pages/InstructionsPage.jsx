/* eslint-disable operator-linebreak */
import { useParams } from 'react-router-dom'

import OneInstructionPage from '@/components/OneInstructionPage/OneInstructionPage'
import TabsWrapper from '@/components/TabsWrapper'

import {
  useGetInstructionsQuery,
  useGetInstructionByIdQuery,
} from '../slices/instructionApi'
import { instructionsData } from '../service/constValues'

function InstructionsPage() {
  const { id } = useParams()

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

  // Используем данные из API или fallback
  const currentInstructions = instructions || instructionsData

  if (isLoading) return <div>Loading...</div>
  if (error) {
    console.error('Error loading instructions:', error)
    return <div>Error loading instructions</div>
  }

  // Определяем какие данные передавать в компонент
  const instructionToRender = id
    ? singleInstruction
    : currentInstructions?.first_instruction

  const tabs =
    currentInstructions?.results?.length > 1
      ? currentInstructions.results.map((instruction) => ({
          label: instruction.name,
          to: `/instructions/${instruction.id}`,
        }))
      : null

  return (
    <div>
      {tabs && <TabsWrapper centered tabs={tabs} useRouter />}
      <OneInstructionPage
        data={instructionToRender}
        isLoading={isSingleLoading}
        error={singleError}
      />
    </div>
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

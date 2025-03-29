import { useNavigate, useLocation } from 'react-router-dom'
import { useGetInstructionsQuery } from '../slices/instructionApi'
import OneInstructionPage from '@/components/OneInstructionPage/OneInstructionPage'
import TabsWrapper from '@/components/TabsWrapper'
import { instructionsData } from '../service/constValues'

function InstructionsPage() {
  const { data, isLoading, error, refetch } = useGetInstructionsQuery(
    undefined,
    {
      // Дополнительные опции запроса
      refetchOnMountOrArgChange: true,
    }
  )

  const navigate = useNavigate()
  const location = useLocation()

  // Используем данные из API или fallback
  const instructions = data || instructionsData

  if (isLoading) return <div>Loading...</div>
  if (error) {
    console.error('Error loading instructions:', error)
    return <div>Error loading instructions</div>
  }

  const tabs =
    instructions?.results?.length > 1
      ? instructions.results.map((instruction) => ({
          label: instruction.name,
          to: `/instructions/${instruction.id}`,
        }))
      : null

  return (
    <div>
      {tabs && <TabsWrapper centered tabs={tabs} useRouter />}
      <OneInstructionPage data={instructions?.first_instruction} />
    </div>
  )
}

export default InstructionsPage

// import { useEffect, useState } from 'react'
// import { useNavigate, useLocation } from 'react-router-dom'
// import { useGetInstructionsQuery } from '../slices/instructionApi'
// import OneInstructionPage from '@/components/OneInstructionPage/OneInstructionPage'
// import TabsWrapper from '@/components/TabsWrapper'

// import { instructionsData } from '../service/constValues'

// function InstructionsPage() {
//   const [instructions, setInstructions] = useState(null)
//   const [loading, setLoading] = useState(true)
//   const navigate = useNavigate()
//   const location = useLocation()
//   const { data = {} } = useGetInstructionsQuery()
//   console.log('data > ', data)

//   useEffect(() => {
//     const loadInstructions = async () => {
//       try {
//         // Здесь должен быть ваш реальный API-вызов
//         // Для теста используем setTimeout для имитации загрузки
//         setTimeout(() => {
//           setInstructions(instructionsData)
//           setLoading(false)
//         }, 500)
//       } catch (error) {
//         console.error('Error loading instructions:', error)
//         setLoading(false)
//       }
//     }

//     loadInstructions()
//   }, [navigate, location.pathname])

//   if (loading) return <div>Loading...</div>
//   if (!instructions) return <div>No instructions found</div>

//   // eslint-disable-next-line operator-linebreak
//   const tabs =
//     instructions.results.length > 1
//       ? instructions.results.map((instruction) => ({
//           label: instruction.name,
//           to: `/instructions/${instruction.id}`,
//         }))
//       : null

//   return (
//     <div>
//       {tabs && <TabsWrapper centered tabs={tabs} useRouter />}
//       <OneInstructionPage data={instructions?.first_instruction} />
//     </div>
//   )
// }

// export default InstructionsPage

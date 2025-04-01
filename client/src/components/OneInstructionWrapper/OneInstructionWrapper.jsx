import { useEffect, useState } from 'react'
import { useOutletContext, useParams } from 'react-router-dom'

import { agreements, instructionMarkdown } from '@/service/constValues'
import TabsWrapper from '@/components/TabsWrapper'
import OneInstructionPage from '@/models/OneInstructionPage'

const instructionServer = [
  {
    id: 1,
    type_of_instruction: {
      id: 1,
      name: 'Первичный',
    },
    name: 'Тестовый инструктаж',
    text: instructionMarkdown,
    instruction_agreement: agreements,
  },
  {
    id: 2,
    type_of_instruction: {
      id: 2,
      name: 'Повторный',
    },
    name: 'New',
    text: instructionMarkdown,
    instruction_agreement: agreements,
  },
]

function OneInstructionWrapper() {
  const { tabs } = useOutletContext()
  const [instruction, setInstruction] = useState(null)
  const [loading, setLoading] = useState(true)
  const { id } = useParams()

  useEffect(() => {
    const loadInstruction = async () => {
      try {
        setLoading(true)
        // Имитация API-запроса
        setTimeout(() => {
          const foundInstruction = instructionServer.find(
            (item) => item.id === Number(id)
          )
          setInstruction(foundInstruction)
          setLoading(false)
        }, 500)
      } catch (error) {
        console.error('Error loading instruction:', error)
        setLoading(false)
      }
    }

    loadInstruction()
  }, [id])

  if (loading) return <div>Loading...</div>
  if (!instruction) return <div>No instruction found</div>

  return (
    <>
      <TabsWrapper tabs={tabs} useRouter />

      <OneInstructionPage data={instruction} />
    </>
  )
}

export default OneInstructionWrapper

// import { useEffect, useState } from 'react'
// import { useOutletContext, useParams } from 'react-router-dom'
// import { agreements, instructionMarkdown } from '@/service/constValues'
// import OneInstructionPage from '@/components/OneInstructionPage/OneInstructionPage'
// import TabsWrapper from '@/components/TabsWrapper'

// const instructionServer = [
//   {
//     id: 1,
//     type_of_instruction: { id: 1, name: 'Первичный' },
//     name: 'Тестовый инструктаж',
//     text: instructionMarkdown,
//     instruction_agreement: agreements,
//   },
//   {
//     id: 2,
//     type_of_instruction: { id: 2, name: 'Повторный' },
//     name: 'New',
//     text: instructionMarkdown,
//     instruction_agreement: agreements,
//   },
// ]

// const OneInstructionWrapper = () => {
//   const { tabs } = useOutletContext()
//   const [instruction, setInstruction] = useState(null)
//   const [loading, setLoading] = useState(true)
//   const { id } = useParams()

//   useEffect(() => {
//     const loadInstruction = async () => {
//       try {
//         setLoading(true)
//         // Имитация API-запроса
//         setTimeout(() => {
//           const foundInstruction = instructionServer.find(
//             (item) => item.id === Number(id)
//           )
//           setInstruction(foundInstruction)
//           setLoading(false)
//         }, 500)
//       } catch (error) {
//         console.error('Error loading instruction:', error)
//         setLoading(false)
//       }
//     }

//     loadInstruction()
//   }, [id])

//   if (loading) return <div>Loading...</div>
//   if (!instruction) return <div>No instruction found</div>

//   return (
//     <>
//       <TabsWrapper tabs={tabs} useRouter={true} />

//       <OneInstructionPage data={instruction} />
//     </>
//   )
// }

// export default OneInstructionWrapper

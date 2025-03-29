import React from 'react'
import { Grid2, Container } from '@mui/material'
import { agreements, instructionMarkdown } from '@/service/constValues'
import CheckboxFields from '@/models/CheckboxFields'
import MarkdownContext from '@/models/MarkdownContext'
import { useGetInstructionByIdQuery } from '../slices/instructionApi'
import { useParams } from 'react-router-dom'

function OneInstructionPage() {
  const { id } = useParams()

  // Добавляем skip и проверку id
  const {
    data: instruction,
    isLoading,
    error,
    isUninitialized, // Новое состояние
  } = useGetInstructionByIdQuery(id, {
    skip: !id, // Пропускаем запрос если id отсутствует
  })

  console.log('id > ', id)

  // Состояния загрузки
  if (isUninitialized || isLoading) {
    return <div>Загрузка инструкции...</div>
  }

  // Обработка ошибок
  if (error) {
    console.error('Ошибка загрузки инструкции:', error)
    return (
      <div>
        Произошла ошибка при загрузке инструкции:
        {'status' in error ? error.status : error.message}
      </div>
    )
  }

  // Если данные не получены
  if (!instruction) {
    return <div>Инструкция не найдена</div>
  }
  return (
    <div>
      {/* Передаем контент инструкции или fallback */}
      <MarkdownContext
        markdown={instruction.content || instructionMarkdown}
        header={instruction.title || 'Инструктаж'}
      />

      <Grid2 container spacing={2}>
        <Grid2 size={{ xs: 12, sm: 9 }} sx={{ padding: 3 }}>
          <Container maxWidth="lg" sx={{ padding: 3 }}>
            <CheckboxFields agreements={agreements} />
          </Container>
        </Grid2>
        <Grid2
          size={{ xs: 12, sm: 3 }}
          sx={{ display: { xs: 'none', sm: 'flex' } }}
        />
      </Grid2>
    </div>
  )
}

export default OneInstructionPage

// import { Grid2, Container } from '@mui/material'
// import { agreements, instructionMarkdown } from '@/service/constValues'
// import CheckboxFields from '@/models/CheckboxFields'
// import MarkdownContext from '@/models/MarkdownContext'
// import { useGetInstructionByIdQuery } from '../slices/instructionApi'
// import { useParams } from 'react-router-dom'

// function OneInstructionPage() {
//   // используем instructionAPI
//   const {id} = useParams()
//   console.log(id);

//   const { data: apiData, isLoading, error } = useGetInstructionByIdQuery(id)
//   debugger
//   console.log('oneInstruction > ', apiData)

//   return (
//     <div>
//       <MarkdownContext markdown={instructionMarkdown} header="Инструктаж" />

//       <Grid2 container spacing={2}>
//         <Grid2 size={{ xs: 12, sm: 9 }} sx={{ padding: 3 }}>
//           <Container maxWidth="lg" sx={{ padding: 3 }}>
//             <CheckboxFields agreements={agreements} />
//           </Container>
//         </Grid2>
//         <Grid2
//           size={{ xs: 12, sm: 3 }}
//           sx={{ display: { xs: 'none', sm: 'flex' } }}
//         />
//       </Grid2>
//     </div>
//   )
// }

// export default OneInstructionPage

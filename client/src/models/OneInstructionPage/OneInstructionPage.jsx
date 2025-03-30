import { Grid2, Container } from '@mui/material'
import { useParams } from 'react-router-dom'

import CheckboxFields from '@/models/CheckboxFields'
import MarkdownContext from '@/models/MarkdownContext'

import { useGetInstructionByIdQuery } from '../slices/instructionApi'

function OneInstructionPage() {
  const { id } = useParams()
  const {
    data: responseData,
    isLoading,
    error,
    isUninitialized,
  } = useGetInstructionByIdQuery(id, {
    skip: !id,
  })

  // Безопасное извлечение данных
  const safeData = {
    text: responseData?.text || '',
    name: responseData?.name || 'Инструктаж',
    instruction_agreement: responseData?.instruction_agreement || [],
  }

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
        {error.status || error.message}
      </div>
    )
  }

  return (
    <div>
      <MarkdownContext markdown={safeData.text} header={safeData.name} />

      <Grid2 container spacing={2}>
        <Grid2
          size={{
            xs: 12,
            sm: 9,
          }}
          sx={{ padding: 3 }}
        >
          <Container maxWidth="lg" sx={{ padding: 3 }}>
            <CheckboxFields
              key={id} // Важно для сброса состояния при смене инструкции
              agreements={safeData.instruction_agreement}
            />
          </Container>
        </Grid2>
        <Grid2
          size={{
            xs: 12,
            sm: 3,
          }}
          sx={{
            display: {
              xs: 'none',
              sm: 'flex',
            },
          }}
        />
      </Grid2>
    </div>
  )
}

export default OneInstructionPage

// import React from 'react'
// import { Grid2, Container } from '@mui/material'
// // import { agreements, instructionMarkdown } from '@/service/constValues'
// import CheckboxFields from '@/models/CheckboxFields'
// import MarkdownContext from '@/models/MarkdownContext'
// import { useGetInstructionByIdQuery } from '../slices/instructionApi'
// import { useParams } from 'react-router-dom'

// function OneInstructionPage({ data }) {
//   const {
//     type_of_instruction: instrType,
//     name,
//     text: instructionMarkdown,
//     instruction_agreement: agreements,
//   } = data

//   return (
//     <div>
//       {/* Передаем контент инструкции или fallback */}
//       <MarkdownContext
//         markdown={instructionMarkdown}
//         header={name || 'Инструктаж'}
//       />

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

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
    isError,
  } = useGetInstructionByIdQuery(id, {
    skip: !id,
  })

  // Полная защита от undefined
  const pageData = {
    text: responseData?.text ?? '',
    name: responseData?.name ?? 'Инструктаж',
    agreements: Array.isArray(responseData?.instruction_agreement)
      ? responseData.instruction_agreement
      : [],
  }

  // Состояния загрузки
  if (isUninitialized || isLoading) {
    return <div>Загрузка инструкции...</div>
  }

  // Обработка ошибок
  if (isError) {
    console.error('Ошибка загрузки инструкции:', error)
    return (
      <div>
        Произошла ошибка при загрузке инструкции:
        {error?.status || error?.message || 'Неизвестная ошибка'}
      </div>
    )
  }

  // Если данные не получены (дополнительная проверка)
  if (!responseData) {
    return <div>Инструкция не найдена</div>
  }

  return (
    <div>
      <MarkdownContext markdown={pageData.text} header={pageData.name} />

      <Grid2 container spacing={2}>
        <Grid2 xs={12} sm={9} sx={{ p: 3 }}>
          <Container maxWidth="lg" sx={{ p: 3 }}>
            <CheckboxFields key={id} agreements={pageData.agreements} />
          </Container>
        </Grid2>
        <Grid2 xs={12} sm={3} sx={{ display: { xs: 'none', sm: 'flex' } }} />
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

import React from 'react'
import { Grid, Container } from '@mui/material'
import { agreements, instructionMarkdown } from '@/service/constValues'
import CheckboxFields from '@/models/CheckboxFields'
import MarkdownContext from '@/models/MarkdownContext'
import { useGetInstructionByIdQuery } from '../slices/instructionApi'
import { useParams } from 'react-router-dom'

function OneInstructionPage() {
  // Получаем ID инструкции из URL параметров
  const { id } = useParams()

  // Делаем запрос к API через RTK Query
  const { data: instruction, isLoading, error } = useGetInstructionByIdQuery(id)

  // Показываем загрузку пока данные не получены
  if (isLoading) {
    return <div>Загрузка инструкции...</div>
  }

  // Показываем ошибку если запрос не удался
  if (error) {
    console.error('Ошибка загрузки инструкции:', error)
    return <div>Произошла ошибка при загрузке инструкции</div>
  }

  // Если инструкция не найдена
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

      <Grid container spacing={2}>
        <Grid item xs={12} sm={9} sx={{ padding: 3 }}>
          <Container maxWidth="lg" sx={{ padding: 3 }}>
            <CheckboxFields agreements={agreements} />
          </Container>
        </Grid>
        <Grid
          item
          xs={12}
          sm={3}
          sx={{ display: { xs: 'none', sm: 'flex' } }}
        />
      </Grid>
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

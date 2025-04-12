/* eslint-disable operator-linebreak */
import { Box, Grid2, CircularProgress } from '@mui/material'
import { useParams } from 'react-router-dom'

import { useGetInstructionByIdQuery } from '@/slices/instructionApi'
import CheckboxFields from '@/models/CheckboxFields'
import MarkdownContext from '@/models/MarkdownContext'

function OneInstructionPage({ data, isLoading, error }) {
  // Если данные переданы через props (из first_instruction), используем их
  // Иначе делаем запрос по ID
  const { id } = useParams()
  const {
    data: responseData,
    isLoading: isQueryLoading,
    error: queryError,
    isUninitialized,
    // isError,
  } = useGetInstructionByIdQuery(id, {
    skip: !id || !!data, // Пропускаем если есть данные или нет ID
  })

  // Определяем какие данные использовать
  const finalData = data || responseData
  const finalIsLoading = isLoading || (isQueryLoading && !data)
  const finalError = error || queryError

  // Полная защита от undefined
  const pageData = {
    text: finalData?.text ?? '',
    id: finalData?.id,
    name: finalData?.name ?? 'Инструктаж',
    agreements: Array.isArray(finalData?.instruction_agreement)
      ? finalData.instruction_agreement
      : [],
  }

  // Состояния загрузки
  if (finalIsLoading) {
    return (
      <Box
        sx={{
          height: '70vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress size={60} />
      </Box>
    )
  }

  // Обработка ошибок
  if (finalError) {
    return (
      <div>
        Произошла ошибка при загрузке инструкции:
        {finalError?.status || finalError?.message || 'Неизвестная ошибка'}
      </div>
    )
  }

  if (!finalData && isUninitialized) {
    return <div>Инструкция не найдена</div>
  }

  const styles = {
    root: {
      width: '100%',
    },
    formContainer: {
      width: '100%',
      p: {
        xs: 2,
        md: 3,
      },
    },
  }

  return (
    <Box sx={styles.root}>
      <MarkdownContext markdown={pageData.text} header={pageData.name} />

      <Grid2 container spacing={0}>
        <Grid2 size={{ xs: 12 }}>
          <Box sx={styles.formContainer}>
            <CheckboxFields id={pageData.id} agreements={pageData.agreements} />
          </Box>
        </Grid2>
      </Grid2>
    </Box>
  )
}

export default OneInstructionPage

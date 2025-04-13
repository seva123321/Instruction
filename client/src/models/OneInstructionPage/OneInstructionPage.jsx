/* eslint-disable operator-linebreak */
import { memo, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { Box, Grid2, Typography } from '@mui/material'

import MarkdownContext from '@/models/MarkdownContext'
import CheckboxFields from '@/models/CheckboxFields'
import LoadingIndicator from '@/components/LoadingIndicator'
import { useGetInstructionByIdQuery } from '@/slices/instructionApi'

const OneInstructionPage = memo(({ data, isLoading, error }) => {
  const { id } = useParams()
  const {
    data: responseData,
    isLoading: isQueryLoading,
    error: queryError,
    isUninitialized,
  } = useGetInstructionByIdQuery(id, {
    skip: !id || !!data,
  })

  const finalData = data || responseData
  const finalIsLoading = isLoading || (isQueryLoading && !data)
  const finalError = error || queryError

  const pageData = useMemo(
    () => ({
      text: finalData?.text ?? '',
      id: finalData?.id,
      name: finalData?.name ?? 'Инструктаж',
      agreements: Array.isArray(finalData?.instruction_agreement)
        ? finalData.instruction_agreement
        : [],
    }),
    [finalData]
  )

  const styles = useMemo(
    () => ({
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
    }),
    []
  )

  if (finalIsLoading) {
    return <LoadingIndicator />
  }

  if (finalError) {
    return (
      <div>
        Произошла ошибка при загрузке инструкции:
        {finalError?.status || finalError?.message || 'Неизвестная ошибка'}
      </div>
    )
  }

  if (!finalData && isUninitialized) {
    return <Typography variant="h4">Инструкция не найдена</Typography>
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
})

export default OneInstructionPage

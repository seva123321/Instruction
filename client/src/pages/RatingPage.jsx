import { Box, Typography } from '@mui/material'

import { useGetRatingQuery } from '@/slices/userApi'
import RatingTable from '@/components/RatingTable'
import ErrorMessage from '@/components/ErrorMessage'
import LoadingIndicator from '@/components/LoadingIndicator'

function RatingPage() {
  const { data, isLoading, isError, error } = useGetRatingQuery()

  if (isLoading) return <LoadingIndicator fullHeight />

  if (isError) {
    return (
      <ErrorMessage
        message={error?.data?.message || 'Ошибка загрузки рейтинга'}
        retryFn={() => window.location.reload()}
      />
    )
  }

  if (!data?.results?.length) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '200px',
        }}
      >
        <Typography variant="h6" color="text.secondary">
          Данные рейтинга отсутствуют
        </Typography>
      </Box>
    )
  }

  return <RatingTable data={data} />
}

export default RatingPage


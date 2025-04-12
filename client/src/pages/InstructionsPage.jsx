/* eslint-disable indent */
/* eslint-disable operator-linebreak */
import { useParams } from 'react-router-dom'
import { useTheme } from '@mui/material/styles'
import { Box, CircularProgress } from '@mui/material'

import OneInstructionPage from '@/models/OneInstructionPage'
import TabsWrapper from '@/components/TabsWrapper'

import {
  useGetInstructionsQuery,
  useGetInstructionByIdQuery,
} from '../slices/instructionApi'

function InstructionsPage() {
  const { id } = useParams()
  const theme = useTheme()

  console.log('paint InstructionsPage ')

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

  if (isLoading) {
    return (
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress size={60} />
      </Box>
    )
  }
  if (error) {
    return <div>Ошибка в загрузке Инструкции</div>
  }

  // Определяем какие данные передавать в компонент
  const instructionToRender = id
    ? singleInstruction
    : instructions?.first_instruction

  const tabs =
    instructions?.results?.length > 1
      ? instructions.results.map((instruction) => ({
          label: instruction.name,
          to: `/instructions/${instruction.id}`,
        }))
      : null

  return (
    <Box
      sx={{
        [theme.breakpoints.down('sm')]: {
          mt: 3,
        },
      }}
    >
      {tabs && <TabsWrapper tabs={tabs} centered useRouter />}
      <OneInstructionPage
        data={instructionToRender}
        isLoading={isSingleLoading && !!id} // Показываем загрузку только при запросе по ID
        error={singleError}
      />
    </Box>
  )
}

export default InstructionsPage

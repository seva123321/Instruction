/* eslint-disable indent */
/* eslint-disable operator-linebreak */

import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useTheme } from '@mui/material/styles'
import { Box, CircularProgress } from '@mui/material'

import OneInstructionPage from '@/models/OneInstructionPage'
import TabsWrapper from '@/components/TabsWrapper'
import {
  useGetInstructionsQuery,
  useGetInstructionByIdQuery,
} from '@/slices/instructionApi'
import {
  setInstructions,
  setSingleInstruction,
} from '@/slices/instructionsSlice'

function InstructionsPage() {
  const { id } = useParams()
  const theme = useTheme()
  const dispatch = useDispatch()
  const { instructions, singleInstruction } = useSelector(
    (state) => state.instructions
  )

  const {
    data: fetchedInstructions,
    isLoading,
    error,
  } = useGetInstructionsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  })

  const {
    data: fetchedSingleInstruction,
    isFetching: isSingleLoading,
    error: singleError,
  } = useGetInstructionByIdQuery(id, {
    skip: !id,
  })


  useEffect(() => {
    if (fetchedInstructions) {
      dispatch(setInstructions(fetchedInstructions))
    }
  }, [fetchedInstructions, dispatch])

  useEffect(() => {
    if (fetchedSingleInstruction) {
      dispatch(setSingleInstruction(fetchedSingleInstruction))
    }
  }, [fetchedSingleInstruction, dispatch])

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
        isLoading={isSingleLoading && !!id}
        error={singleError}
      />
    </Box>
  )
}

export default InstructionsPage

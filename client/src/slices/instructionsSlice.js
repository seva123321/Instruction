/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  instructions: null,
  singleInstruction: null,
  isLoading: false,
  error: null,
}

const instructionsSlice = createSlice({
  name: 'instructions',
  initialState,
  reducers: {
    setInstructions: (state, action) => {
      state.instructions = action.payload
    },
    setSingleInstruction: (state, action) => {
      state.singleInstruction = action.payload
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload
    },
    setError: (state, action) => {
      state.error = action.payload
    },
  },
})

export const { setInstructions, setSingleInstruction, setLoading, setError } =
  instructionsSlice.actions
export default instructionsSlice.reducer

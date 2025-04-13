/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  formState: {
    allChecked: false,
    faceDescriptor: null,
    errorMessage: null,
    isSubmitting: false,
  },
}

const checkboxSlice = createSlice({
  name: 'checkbox',
  initialState,
  reducers: {
    setAllChecked: (state, action) => {
      state.formState.allChecked = action.payload
    },
    setFaceDescriptor: (state, action) => {
      state.formState.faceDescriptor = action.payload
    },
    setErrorMessage: (state, action) => {
      state.formState.errorMessage = action.payload
    },
    setIsSubmitting: (state, action) => {
      state.formState.isSubmitting = action.payload
    },
    resetForm: (state) => {
      state.formState = initialState.formState
    },
  },
})

export const {
  setAllChecked,
  setFaceDescriptor,
  setErrorMessage,
  setIsSubmitting,
  resetForm,
} = checkboxSlice.actions

export const selectCheckboxForm = (state) => state.checkbox.formState

export default checkboxSlice.reducer

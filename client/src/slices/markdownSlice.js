/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  headings: [],
  currentHeading: null,
  mobileOpen: false,
}

const markdownSlice = createSlice({
  name: 'markdown',
  initialState,
  reducers: {
    setHeadings: (state, action) => {
      state.headings = action.payload
    },
    setCurrentHeading: (state, action) => {
      state.currentHeading = action.payload
    },
    toggleMobileOpen: (state) => {
      state.mobileOpen = !state.mobileOpen
    },
  },
})

export const { setHeadings, setCurrentHeading, toggleMobileOpen } =
  markdownSlice.actions
export default markdownSlice.reducer

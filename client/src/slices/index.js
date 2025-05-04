import { configureStore } from '@reduxjs/toolkit'

import userApi from './userApi'
import instructionApi from './instructionApi'
import testApi from './testApi'
import gameApi from './gameApi'
import knowladgeApi from './knowladgeApi'
import checkBoxReducer from './checkboxSlice'
import instructionsReducer from './instructionsSlice'
import markdownReducer from './markdownSlice'

export default configureStore({
  reducer: {
    checkbox: checkBoxReducer,
    instructions: instructionsReducer,
    markdown: markdownReducer,
    [userApi.reducerPath]: userApi.reducer,
    [instructionApi.reducerPath]: instructionApi.reducer,
    [testApi.reducerPath]: testApi.reducer,
    [gameApi.reducerPath]: gameApi.reducer,
    [knowladgeApi.reducerPath]: knowladgeApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      userApi.middleware,
      instructionApi.middleware,
      testApi.middleware,
      gameApi.middleware,
      knowladgeApi.middleware
    ),
})

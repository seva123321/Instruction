import { configureStore } from '@reduxjs/toolkit'
import userReducer from './userSlice'
import userApi from './userApi'
import instructionApi from './instructionApi'

export default configureStore({
  reducer: {
    user: userReducer,
    [userApi.reducerPath]: userApi.reducer,
    [instructionApi.reducerPath]: instructionApi.reducer,
    // tests: testsReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      userApi.middleware,
      instructionApi.middleware
    ),
})

/*
// store.ts
import { configureStore } from '@reduxjs/toolkit'
// import userReducer from './features/user/userSlice'
import { userApi } from './userApi'
import { instructionApi } from './instructionApi'

// Автоматическое создание списка API
const apiReducers = {
  [userApi.reducerPath]: userApi.reducer,
  [instructionApi.reducerPath]: instructionApi.reducer,
}

const apiMiddlewares = [userApi.middleware, instructionApi.middleware]

export default configureStore({
  reducer: {
    // user: userReducer,
    ...apiReducers,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(...apiMiddlewares),
})
*/

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { API_CONFIG } from '../config'

export const instructionApi = createApi({
  reducerPath: 'instructionApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_CONFIG.BASE_URL}:${API_CONFIG.PORT}/api/`,
    credentials: 'include',
    prepareHeaders: (headers) => {
      // Получаем CSRF токен из куков
      const csrfToken = document.cookie
        .split('; ')
        .find((row) => row.startsWith('csrftoken='))
        ?.split('=')[1]

      // Устанавливаем обязательные заголовки
      headers.set('Content-Type', 'application/json')
      if (csrfToken) {
        headers.set('X-CSRFToken', csrfToken)
      }
      return headers
    },
  }),
  tagTypes: ['Instruction'],
  endpoints: (build) => ({
    getInstructions: build.query({
      query: () => 'instructions/',
      providesTags: ['Instruction'],
    }),
    getInstructionById: build.query({
      query: (id) => `instructions/${id}/`,
      providesTags: (result, error, id) => [{ type: 'Instruction', id }],
    }),
  }),
})

export const {
  useGetInstructionsQuery,
  useGetInstructionByIdQuery,
  useLazyGetInstructionsQuery,
} = instructionApi

export default instructionApi
// import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react' // Изменили импорт
// import { API_CONFIG } from '../config'

// export const instructionApi = createApi({
//   reducerPath: 'instructionApi',
//   baseQuery: fetchBaseQuery({
//     baseUrl: `/api/`,
//     credentials: 'include',
//     prepareHeaders: (headers) => {
//       headers.set('Content-Type', 'application/json')
//       return headers
//     },
//   }),
//   tagTypes: ['Instruction'],
//   endpoints: (build) => ({
//     getInstructions: build.query({
//       query: () => 'instructions/',
//       providesTags: ['Instruction'],
//     }),
//     getInstructionById: build.query({
//       query: (id) => `instructions/${id}/`,
//       providesTags: ['Instruction'],
//     }),
//   }),
// })

// export const { useGetInstructionsQuery, useGetInstructionByIdQuery } =
//   instructionApi
// export default instructionApi

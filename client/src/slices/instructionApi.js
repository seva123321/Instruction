import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import API_CONFIG from '../config'
import { getCsrfToken } from '../utils/cookies'

const instructionApi = createApi({
  reducerPath: 'instructionApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_CONFIG.PROXY_PREFIX}/`,
    credentials: 'include',
    prepareHeaders: (headers) => {
      const csrfToken = getCsrfToken()
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
      query: (id) => {
        if (!id) {
          throw new Error('ID is required')
        }
        return `instructions/${id}/`
      },
      transformErrorResponse: (response) => response.data,
    }),
    postInstructionResults: build.mutation({
      query: (body) => ({
        url: 'instruction_results/',
        method: 'POST',
        body,
      }),
    }),
  }),
})

export const {
  useGetInstructionsQuery,
  useGetInstructionByIdQuery,
  usePostInstructionResultsMutation,
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
